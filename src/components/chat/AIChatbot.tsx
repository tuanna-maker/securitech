import { useState, useRef, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { Search, Plus, ChevronLeft, Trash2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Xin chào! 👋 Tôi là trợ lý AI của STOS. Tôi có thể giúp bạn tra cứu thông tin tòa nhà, sự cố, cư dân hoặc hướng dẫn sử dụng hệ thống. Hãy hỏi tôi bất cứ điều gì!",
  time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
};

const QUICK_REPLIES = [
  "Tổng hợp sự cố hôm nay",
  "Tòa nhà nào đang có cảnh báo?",
  "Số cư dân hiện tại",
  "Báo cáo tổng quan vận hành",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const session = await db.auth.getSession();
  const token = session.data.session?.access_token;
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Lỗi kết nối" }));
    onError(err.error || `Lỗi ${resp.status}`);
    return;
  }
  if (!resp.body) { onError("Không nhận được phản hồi"); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }
  onDone();
}

// ─── Helpers ────────────────────────────
async function getUserTenantId() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();
  return { userId: user.id, tenantId: profile?.tenant_id };
}

async function saveMessage(conversationId: string, role: string, content: string) {
  await db.from("ai_messages").insert({
    conversation_id: conversationId,
    role,
    content,
  } as any);
}

async function createConversation(userId: string, tenantId: string, title: string) {
  const { data } = await db
    .from("ai_conversations")
    .insert({ user_id: userId, tenant_id: tenantId, title } as any)
    .select()
    .single();
  return data;
}

async function updateConversationTitle(id: string, title: string) {
  await db.from("ai_conversations").update({ title } as any).eq("id", id);
}

// ─── Views ──────────────────────────────
type ViewMode = "chat" | "history";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("chat");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Conversation[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantContentRef = useRef("");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => {
    if (open && view === "chat") inputRef.current?.focus();
  }, [open, view]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    const { data } = await db
      .from("ai_conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    setConversations((data as any) || []);
  }, []);

  useEffect(() => {
    if (open && view === "history") loadConversations();
  }, [open, view, loadConversations]);

  // Load a specific conversation
  const loadConversation = useCallback(async (convId: string) => {
    const { data: msgs } = await db
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    const loaded: Message[] = (msgs as any[] || []).map((m: any) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      time: new Date(m.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    }));
    setMessages(loaded.length > 0 ? loaded : [WELCOME_MSG]);
    setConversationId(convId);
    setView("chat");
  }, []);

  // Search conversations
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    // Search in conversation titles and message content
    const { data: convByTitle } = await db
      .from("ai_conversations")
      .select("id, title, updated_at")
      .ilike("title", `%${searchQuery}%`)
      .order("updated_at", { ascending: false })
      .limit(20);

    const { data: msgMatches } = await db
      .from("ai_messages")
      .select("conversation_id")
      .ilike("content", `%${searchQuery}%`)
      .limit(50);

    const msgConvIds = [...new Set((msgMatches as any[] || []).map((m: any) => m.conversation_id))];
    const titleConvIds = (convByTitle as any[] || []).map((c: any) => c.id);
    const allIds = [...new Set([...titleConvIds, ...msgConvIds])];

    if (allIds.length === 0) { setSearchResults([]); return; }

    const { data: results } = await db
      .from("ai_conversations")
      .select("id, title, updated_at")
      .in("id", allIds)
      .order("updated_at", { ascending: false });

    setSearchResults((results as any) || []);
  }, [searchQuery]);

  // Delete conversation
  const deleteConversation = useCallback(async (convId: string) => {
    await db.from("ai_conversations").delete().eq("id", convId);
    if (conversationId === convId) {
      setConversationId(null);
      setMessages([WELCOME_MSG]);
    }
    loadConversations();
  }, [conversationId, loadConversations]);

  // New conversation
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([WELCOME_MSG]);
    setView("chat");
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    assistantContentRef.current = "";

    // Create conversation if needed
    let activeConvId = conversationId;
    if (!activeConvId) {
      const ctx = await getUserTenantId();
      if (ctx?.userId && ctx?.tenantId) {
        const title = text.trim().slice(0, 80);
        const conv = await createConversation(ctx.userId, ctx.tenantId, title);
        if (conv) {
          activeConvId = conv.id;
          setConversationId(conv.id);
        }
      }
    }

    // Save user message
    if (activeConvId) await saveMessage(activeConvId, "user", text.trim());

    const chatHistory = messages.filter(m => m.id !== "welcome").concat(userMsg).map(m => ({
      role: m.role,
      content: m.content,
    }));

    let fullAssistant = "";
    const convIdForSave = activeConvId;

    streamChat({
      messages: chatHistory,
      onDelta: (delta) => {
        assistantContentRef.current += delta;
        fullAssistant = assistantContentRef.current;
        const content = assistantContentRef.current;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("stream-")) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
          }
          return [...prev, {
            id: "stream-" + Date.now(),
            role: "assistant",
            content,
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          }];
        });
      },
      onDone: async () => {
        setStreaming(false);
        if (convIdForSave && fullAssistant) {
          await saveMessage(convIdForSave, "assistant", fullAssistant);
          // Auto-title: use first user message
          if (messages.filter(m => m.id !== "welcome").length === 0) {
            const shortTitle = text.trim().slice(0, 80);
            await updateConversationTitle(convIdForSave, shortTitle);
          }
        }
      },
      onError: (err) => {
        setMessages((prev) => [...prev, {
          id: "err-" + Date.now(), role: "assistant", content: `⚠️ ${err}`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        }]);
        setStreaming(false);
      },
    });
  }, [messages, streaming, conversationId]);

  const displayedConversations = searchResults !== null ? searchResults : conversations;

  return (
    <>
      {/* FAB Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-teal text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Mở trợ lý AI"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.76 1.35 5.22 3.5 6.87V22l3.27-1.8c.89.25 1.85.38 2.82.38h.41c5.52 0 10-4.03 10-9s-4.48-9-10-9z" fill="currentColor" />
            <circle cx="8" cy="11" r="1.2" fill="hsl(var(--primary-foreground))" />
            <circle cx="12" cy="11" r="1.2" fill="hsl(var(--primary-foreground))" />
            <circle cx="16" cy="11" r="1.2" fill="hsl(var(--primary-foreground))" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-border-strong bg-bg1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-bg2">
            {view === "history" ? (
              <button onClick={() => setView("chat")} className="w-8 h-8 rounded-lg hover:bg-bg3 flex items-center justify-center text-t3 hover:text-t1">
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center shrink-0">
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-primary-foreground">
                  <path d="M10 2a6.5 6.5 0 00-6.5 6c0 1.8.8 3.4 2 4.5V16l2.2-1.2c.7.2 1.5.3 2.3.3A6.5 6.5 0 0010 2z" fill="currentColor" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-t1">
                {view === "history" ? "Lịch sử hội thoại" : "STOS AI Assistant"}
              </div>
              {view === "chat" && (
                <div className="flex items-center gap-1.5 text-[11px] text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  {streaming ? "Đang trả lời..." : "Online — Sẵn sàng hỗ trợ"}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {view === "chat" && (
                <>
                  <button
                    onClick={startNewConversation}
                    className="w-8 h-8 rounded-lg hover:bg-bg3 flex items-center justify-center text-t3 hover:text-t1 transition-colors"
                    title="Cuộc hội thoại mới"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("history")}
                    className="w-8 h-8 rounded-lg hover:bg-bg3 flex items-center justify-center text-t3 hover:text-t1 transition-colors"
                    title="Lịch sử"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                      <path d="M8 1a7 7 0 107 7A7 7 0 008 1zm0 12.5A5.5 5.5 0 1113.5 8 5.51 5.51 0 018 13.5zM8.5 4H7v5l4.28 2.54.75-1.23-3.53-2.1z" fill="currentColor" />
                    </svg>
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-bg3 flex items-center justify-center text-t3 hover:text-t1 transition-colors"
                aria-label="Đóng chat"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {view === "history" ? (
            /* ─── History View ─── */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search bar */}
              <div className="px-3 py-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t4" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Tìm kiếm cuộc hội thoại..."
                    className="w-full bg-bg3 rounded-lg pl-9 pr-3 py-2 text-xs text-t1 placeholder:text-t4 outline-none border border-transparent focus:border-teal/40"
                  />
                </div>
                {searchQuery && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSearch} className="text-[11px] px-3 py-1 rounded-md bg-teal text-primary-foreground">
                      Tìm kiếm
                    </button>
                    <button onClick={() => { setSearchQuery(""); setSearchResults(null); }} className="text-[11px] px-3 py-1 rounded-md bg-bg3 text-t2">
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {displayedConversations.length === 0 ? (
                  <div className="text-center text-xs text-t3 py-8">
                    {searchResults !== null ? "Không tìm thấy kết quả" : "Chưa có cuộc hội thoại nào"}
                  </div>
                ) : (
                  displayedConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-bg3 border-b border-border/50 transition-colors ${conv.id === conversationId ? "bg-teal-muted" : ""}`}
                    >
                      <div className="flex-1 min-w-0" onClick={() => loadConversation(conv.id)}>
                        <div className="text-[12.5px] font-medium text-t1 truncate">{conv.title}</div>
                        <div className="text-[10.5px] text-t4">
                          {new Date(conv.updated_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-t4 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* New conversation button */}
              <div className="px-3 py-2 border-t border-border">
                <button
                  onClick={startNewConversation}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-teal text-primary-foreground text-xs font-medium hover:brightness-110 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Cuộc hội thoại mới
                </button>
              </div>
            </div>
          ) : (
            /* ─── Chat View ─── */
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-teal text-primary-foreground rounded-br-md"
                          : "bg-bg3 text-t1 rounded-bl-md"
                      }`}
                    >
                      {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                      <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-t4"}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                {streaming && !messages.some(m => m.id.startsWith("stream-")) && (
                  <div className="flex justify-start">
                    <div className="bg-bg3 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 bg-t3 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-t3 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-t3 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Replies */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-teal/30 text-teal hover:bg-teal-muted transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="border-t border-border px-3 py-2.5 flex items-center gap-2 bg-bg1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 bg-bg3 rounded-xl px-3.5 py-2 text-sm text-t1 placeholder:text-t4 outline-none border border-transparent focus:border-teal/40 transition-colors"
                  disabled={streaming}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
                  className="w-9 h-9 rounded-xl bg-teal text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:brightness-110 transition-all"
                  aria-label="Gửi"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                    <path d="M3 10l14-7-4 7 4 7L3 10z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
