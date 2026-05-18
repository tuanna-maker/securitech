import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { usePosts, useAnnouncements, useChatMessages, useSendMessage, useCommsStats } from "@/features/comms";
import PostFormDialog from "@/components/comms/PostFormDialog";
import AnnouncementFormDialog from "@/components/comms/AnnouncementFormDialog";

const tabs = [
  { id: "feed", label: "Bảng tin" },
  { id: "announce", label: "Thông báo chính thức" },
];

export default function CommsScreen() {
  const [activeTab, setActiveTab] = useState("feed");
  const [activeChannel, setActiveChannel] = useState("general");
  const [msgInput, setMsgInput] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);

  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: announcements = [], isLoading: annLoading } = useAnnouncements();
  const { data: chatMessages = [] } = useChatMessages(activeChannel);
  const { data: stats } = useCommsStats();
  const sendMsg = useSendMessage();

  const channels = [
    { name: "general", label: "toan-cong-ty", active: activeChannel === "general" },
    { name: "operations", label: "giam-sat-van-hanh" },
    { name: "training", label: "dao-tao-noi-bo" },
  ];

  const handleSend = () => {
    if (!msgInput.trim()) return;
    sendMsg.mutate({ message: msgInput, channel: activeChannel });
    setMsgInput("");
  };

  const isLoading = postsLoading || annLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-teal" /></div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
        <KpiCard label="Bài đăng tuần này" value={stats?.postsThisWeek || 0} color="teal" />
        <KpiCard label="Thông báo" value={stats?.totalAnnouncements || 0} color="info" />
        <KpiCard label="Tin nhắn kênh" value={chatMessages.length} color="purple" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-2.5">
        <div>
          <div className="flex gap-[1px] bg-bg2 rounded-lg p-[3px] mb-[13px]">
            {tabs.map((tab) => (
              <div key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 rounded-md text-center cursor-pointer text-xs transition-all
                  ${activeTab === tab.id ? "bg-bg4 text-t1 font-medium" : "text-t2 hover:text-t1"}`}>
                {tab.label}
              </div>
            ))}
          </div>

          {activeTab === "feed" && (
            <div>
              <div className="flex justify-end mb-2">
                <Button size="sm" className="h-7 text-[11px]" onClick={() => setPostOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Đăng bài
                </Button>
              </div>
              <PostFormDialog open={postOpen} onOpenChange={setPostOpen} />
              {posts.length === 0 && <div className="text-xs text-t3 text-center py-8">Chưa có bài đăng</div>}
              {posts.map((post) => (
                <div key={post.id} className="bg-bg2 border border-border rounded-[10px] p-[13px] mb-2">
                  <div className="text-[12.5px] font-semibold mb-1">{post.title}</div>
                  <div className="text-[12px] leading-relaxed text-t2 mb-2">{post.content}</div>
                  <div className="text-[10px] text-t3">
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                    {post.is_pinned && <span className="ml-2 text-amber">📌 Ghim</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "announce" && (
            <div>
              <div className="flex justify-end mb-2">
                <Button size="sm" className="h-7 text-[11px]" onClick={() => setAnnOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tạo thông báo
                </Button>
              </div>
              <AnnouncementFormDialog open={annOpen} onOpenChange={setAnnOpen} />
              {announcements.length === 0 && <div className="text-xs text-t3 text-center py-8">Chưa có thông báo</div>}
              {announcements.map((a) => {
                const colorMap: Record<string, string> = {
                  urgent: "bg-danger-subtle border-l-danger text-danger",
                  high: "bg-amber-subtle border-l-amber text-amber",
                  normal: "bg-info-subtle border-l-info text-info",
                  low: "bg-teal-subtle border-l-teal text-teal",
                };
                return (
                  <div key={a.id} className={`rounded-[10px] p-[13px_15px] mb-2 border-l-[3px] ${colorMap[a.priority] || colorMap.normal}`}>
                    <div className="text-[12.5px] font-semibold mb-[3px]">{a.title}</div>
                    <div className="text-[11.5px] text-t2 leading-relaxed">{a.content}</div>
                    <div className="text-[10.5px] mt-1">{new Date(a.created_at).toLocaleDateString("vi-VN")}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="bg-bg1 border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-[15px] py-3 border-b border-border">
            <div className="text-[12.5px] font-semibold">💬 Nhắn tin nội bộ</div>
          </div>

          <div className="border-b border-border">
            <div className="px-3.5 py-2 text-[10px] font-bold text-t4 uppercase tracking-wider">Kênh</div>
            {channels.map((ch) => (
              <div key={ch.name} onClick={() => setActiveChannel(ch.name)}
                className={`px-3.5 py-1.5 flex items-center gap-2 cursor-pointer ${activeChannel === ch.name ? "bg-teal-subtle border-r-2 border-r-teal" : ""}`}>
                <span className={`text-[13px] ${activeChannel === ch.name ? "" : "text-t3"}`}>#</span>
                <span className={`text-[12.5px] ${activeChannel === ch.name ? "font-medium text-teal" : "text-t2"}`}>{ch.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 p-3 max-h-[260px] overflow-y-auto flex-1">
            {chatMessages.length === 0 && <div className="text-xs text-t3 text-center py-4">Chưa có tin nhắn</div>}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-2 items-start">
                <div className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[9px] font-bold bg-bg3 text-t2 shrink-0">
                  {msg.sender_id?.substring(0, 2).toUpperCase() || "??"}
                </div>
                <div>
                  <div className={`rounded-[10px] px-[11px] py-2 max-w-[72%] text-xs leading-relaxed bg-bg3`}>{msg.message}</div>
                  <div className="text-[9.5px] text-t4 mt-[3px]">
                    {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-[10px_12px] border-t border-border flex gap-[7px] items-center">
            <input
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Nhắn tin tới #${channels.find((c) => c.name === activeChannel)?.label || activeChannel}…`}
              className="flex-1 bg-bg2 border border-border rounded-lg px-[11px] py-[7px] text-[12.5px] text-t1 outline-none placeholder:text-t4"
            />
            <button onClick={handleSend} disabled={sendMsg.isPending}
              className="px-3 py-[7px] rounded-[7px] bg-teal text-bg0 text-[11px] font-semibold cursor-pointer hover:brightness-90 disabled:opacity-50">
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
