import { useState } from "react";
import { Chip } from "@/components/ui/StatusChip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Types ── */
interface ZaloMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  type: "resident" | "admin";
  category?: "complaint" | "question" | "feedback" | "emergency";
}

interface ZaloGroup {
  id: string;
  name: string;
  building: string;
  members: number;
  admin: string;
  adminPhone: string;
  zaloLink: string;
  qrCode: string;
  status: "active" | "inactive";
  unread: number;
  lastMessage: string;
  lastTime: string;
  avatar: string;
  createdAt: string;
  messages: ZaloMessage[];
}

/* ── Initial mock data ── */
const initialGroups: ZaloGroup[] = [
  {
    id: "ZL-001", name: "Cư dân Vinhomes Central Park", building: "Vinhomes Central Park",
    members: 342, admin: "BQL Vinhomes", adminPhone: "0901-000-001",
    zaloLink: "https://zalo.me/g/abc123", qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/g/abc123",
    status: "active", unread: 5, lastMessage: "BQL: Thông báo cắt điện tầng 12 ngày mai 8h-12h",
    lastTime: "09:45", avatar: "🏢", createdAt: "01/01/2024",
    messages: [
      { id: 1, sender: "Nguyễn Thị Hoa (1205)", text: "Thang máy số 3 lại bị kẹt cửa rồi ạ", time: "08:30", type: "resident", category: "complaint" },
      { id: 2, sender: "Lê Văn Đức (0803)", text: "Hôm qua tôi cũng bị, phải đi thang bộ 8 tầng 😤", time: "08:32", type: "resident", category: "complaint" },
      { id: 3, sender: "BQL Vinhomes", text: "Dạ BQL đã ghi nhận và đang liên hệ đơn vị bảo trì.", time: "08:45", type: "admin" },
      { id: 4, sender: "Phạm Minh Tuấn (1507)", text: "Cho hỏi phí quản lý tháng 4 đóng khi nào vậy ạ?", time: "09:10", type: "resident", category: "question" },
      { id: 5, sender: "BQL Vinhomes", text: "Thông báo cắt điện tầng 12 ngày mai 8h-12h.", time: "09:45", type: "admin" },
      { id: 6, sender: "Trần Thị Mai (2201)", text: "Khu vực sảnh A có mùi hôi từ hệ thống thoát nước!", time: "10:15", type: "resident", category: "complaint" },
      { id: 7, sender: "Vũ Quốc Hùng (0904)", text: "Bảo vệ ca đêm rất nhiệt tình 👍", time: "10:30", type: "resident", category: "feedback" },
    ],
  },
  {
    id: "ZL-002", name: "Cư dân Royal City", building: "Royal City",
    members: 256, admin: "BQL Royal City", adminPhone: "0901-000-002",
    zaloLink: "https://zalo.me/g/def456", qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/g/def456",
    status: "active", unread: 2, lastMessage: "Trần Văn Hào: Tầng hầm B2 bị ngập nước nhẹ",
    lastTime: "09:20", avatar: "🏗️", createdAt: "15/02/2024",
    messages: [
      { id: 1, sender: "Trần Văn Hào (0702)", text: "Tầng hầm B2 bị ngập nước nhẹ!", time: "09:15", type: "resident", category: "emergency" },
      { id: 2, sender: "BQL Royal City", text: "Dạ BQL đã cử kỹ thuật xuống kiểm tra.", time: "09:20", type: "admin" },
    ],
  },
  {
    id: "ZL-003", name: "Cư dân Times City", building: "Times City",
    members: 489, admin: "BQL Times City", adminPhone: "0901-000-003",
    zaloLink: "https://zalo.me/g/ghi789", qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/g/ghi789",
    status: "active", unread: 0, lastMessage: "BQL: Lịch bảo trì thang máy tháng 4 đã cập nhật",
    lastTime: "Hôm qua", avatar: "🏙️", createdAt: "01/03/2024",
    messages: [
      { id: 1, sender: "BQL Times City", text: "Lịch bảo trì thang máy tháng 4 đã cập nhật.", time: "Hôm qua 16:30", type: "admin" },
    ],
  },
  {
    id: "ZL-004", name: "Cư dân Gamuda Gardens", building: "Gamuda Gardens",
    members: 178, admin: "BQL Gamuda", adminPhone: "0901-000-004",
    zaloLink: "https://zalo.me/g/jkl012", qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/g/jkl012",
    status: "active", unread: 1, lastMessage: "Phạm Quốc Anh: Khu vui chơi trẻ em bị hỏng xích đu",
    lastTime: "08:55", avatar: "🌳", createdAt: "10/01/2024",
    messages: [
      { id: 1, sender: "Phạm Quốc Anh (1201)", text: "Khu vui chơi trẻ em bị hỏng xích đu!", time: "08:55", type: "resident", category: "complaint" },
    ],
  },
  {
    id: "ZL-005", name: "Cư dân Masteri Thảo Điền", building: "Masteri Thảo Điền",
    members: 215, admin: "BQL Masteri", adminPhone: "0901-000-005",
    zaloLink: "https://zalo.me/g/mno345", qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/g/mno345",
    status: "active", unread: 0, lastMessage: "BQL: Thông báo nghỉ lễ 30/4 - 1/5",
    lastTime: "Hôm qua", avatar: "🏨", createdAt: "20/04/2024",
    messages: [],
  },
  {
    id: "ZL-006", name: "Cư dân Sunshine City", building: "Sunshine City",
    members: 134, admin: "BQL Sunshine", adminPhone: "0901-000-006",
    zaloLink: "https://zalo.me/g/pqr678", qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/g/pqr678",
    status: "inactive", unread: 0, lastMessage: "Nhóm tạm ngưng hoạt động",
    lastTime: "15/03", avatar: "☀️", createdAt: "01/06/2024",
    messages: [],
  },
];

/* ── Category config ── */
const categoryConfig = {
  complaint: { label: "Phản ánh", color: "danger" as const, icon: "⚠️" },
  question: { label: "Hỏi đáp", color: "info" as const, icon: "❓" },
  feedback: { label: "Góp ý", color: "teal" as const, icon: "💬" },
  emergency: { label: "Khẩn cấp", color: "danger" as const, icon: "🚨" },
};

const avatarOptions = ["🏢", "🏗️", "🏙️", "🌳", "🏨", "☀️", "🏠", "🏰", "🏛️", "🌆"];

type ViewMode = "chat" | "info" | "feed";

interface GroupFormData {
  name: string;
  building: string;
  admin: string;
  adminPhone: string;
  zaloLink: string;
  avatar: string;
  status: "active" | "inactive";
}

const emptyForm: GroupFormData = {
  name: "", building: "", admin: "", adminPhone: "", zaloLink: "", avatar: "🏢", status: "active",
};

export default function ZaloGroupsTab() {
  const [groups, setGroups] = useState<ZaloGroup[]>(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [feedFilter, setFeedFilter] = useState<string>("all");

  // CRUD state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GroupFormData>(emptyForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ZaloGroup | null>(null);

  const filteredGroups = groups.filter(g =>
    !searchGroup || g.name.toLowerCase().includes(searchGroup.toLowerCase()) || g.building.toLowerCase().includes(searchGroup.toLowerCase())
  );

  const activeGroup = groups[selectedGroup] || groups[0];

  const feedMessages = activeGroup.messages
    .filter(m => m.type === "resident" && m.category)
    .filter(m => feedFilter === "all" || m.category === feedFilter);

  /* ── CRUD handlers ── */
  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (group: ZaloGroup) => {
    setEditingId(group.id);
    setFormData({
      name: group.name, building: group.building, admin: group.admin,
      adminPhone: group.adminPhone, zaloLink: group.zaloLink, avatar: group.avatar,
      status: group.status,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.building.trim()) return;

    if (editingId) {
      setGroups(prev => prev.map(g => g.id === editingId ? {
        ...g, ...formData,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formData.zaloLink || g.zaloLink)}`,
      } : g));
    } else {
      const newId = `ZL-${String(groups.length + 1).padStart(3, "0")}`;
      const link = formData.zaloLink || `https://zalo.me/g/${newId.toLowerCase()}`;
      const newGroup: ZaloGroup = {
        id: newId, ...formData, zaloLink: link, members: 0, unread: 0,
        lastMessage: "Nhóm vừa được tạo", lastTime: "Vừa xong",
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        messages: [],
      };
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(groups.length);
    }
    setFormOpen(false);
  };

  const openDelete = (group: ZaloGroup) => {
    setDeleteTarget(group);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setGroups(prev => prev.filter(g => g.id !== deleteTarget.id));
    if (selectedGroup >= groups.length - 1) setSelectedGroup(Math.max(0, groups.length - 2));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const updateField = (field: keyof GroupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
          <div className="text-[18px] font-bold font-mono text-t1">{groups.length}</div>
          <div className="text-[10px] text-t3">Nhóm Zalo</div>
        </div>
        <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
          <div className="text-[18px] font-bold font-mono text-teal">{groups.filter(g => g.status === "active").length}</div>
          <div className="text-[10px] text-t3">Đang hoạt động</div>
        </div>
        <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
          <div className="text-[18px] font-bold font-mono text-info">{groups.reduce((s, g) => s + g.members, 0).toLocaleString()}</div>
          <div className="text-[10px] text-t3">Tổng thành viên</div>
        </div>
        <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
          <div className="text-[18px] font-bold font-mono text-danger">{groups.reduce((s, g) => s + g.unread, 0)}</div>
          <div className="text-[10px] text-t3">Tin chưa đọc</div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3 h-[calc(100vh-380px)] min-h-[400px]">
        {/* Left: Group list */}
        <div className="flex flex-col bg-bg1 border border-border rounded-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              value={searchGroup}
              onChange={e => setSearchGroup(e.target.value)}
              placeholder="🔍 Tìm nhóm Zalo..."
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-bg2 text-[12px] placeholder:text-t3 focus:outline-none focus:border-border-accent"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredGroups.map((g) => {
              const originalIdx = groups.findIndex(z => z.id === g.id);
              return (
                <div key={g.id} onClick={() => { setSelectedGroup(originalIdx); setViewMode("chat"); }}
                  className={`px-3 py-2.5 border-b border-border/50 cursor-pointer transition-all
                    ${selectedGroup === originalIdx ? "bg-teal-subtle border-l-2 border-l-teal" : "hover:bg-bg2"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{g.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold truncate">{g.name}</span>
                        <span className="text-[9px] text-t3 shrink-0 ml-1">{g.lastTime}</span>
                      </div>
                      <div className="text-[10px] text-t3">{g.building} · {g.members} TV</div>
                    </div>
                    {g.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-danger text-bg0 text-[10px] font-bold flex items-center justify-center">
                        {g.unread}
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-t3 truncate pl-7">{g.lastMessage}</div>
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-border">
            <button onClick={openCreate} className="w-full px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border border-teal bg-teal/10 text-teal font-semibold hover:bg-teal/20 transition-all">
              + Tạo nhóm Zalo mới
            </button>
          </div>
        </div>

        {/* Right: Content area */}
        <div className="flex flex-col bg-bg1 border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-bg2/50">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{activeGroup.avatar}</span>
              <div>
                <div className="text-[13px] font-semibold">{activeGroup.name}</div>
                <div className="text-[10px] text-t3">
                  {activeGroup.members} thành viên · {activeGroup.building}
                  {activeGroup.status === "inactive" && <span className="text-amber ml-1">· Tạm ngưng</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(["chat", "feed", "info"] as ViewMode[]).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] cursor-pointer transition-all border
                    ${viewMode === mode
                      ? "bg-teal/15 text-teal border-teal/30 font-semibold"
                      : "text-t2 border-border hover:bg-bg2"}`}>
                  {mode === "chat" ? "💬 Chat" : mode === "feed" ? "📋 Feed" : "ℹ️ Thông tin"}
                </button>
              ))}
            </div>
          </div>

          {/* ─── CHAT VIEW ─── */}
          {viewMode === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {activeGroup.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-t3 text-[12px]">
                    Chưa có tin nhắn nào trong nhóm này
                  </div>
                ) : (
                  activeGroup.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
                        msg.type === "admin"
                          ? "bg-teal/15 border border-teal/20"
                          : "bg-bg2 border border-border"
                      }`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-semibold ${msg.type === "admin" ? "text-teal" : "text-info"}`}>
                            {msg.sender}
                          </span>
                          {msg.category && (
                            <Chip color={categoryConfig[msg.category].color}>
                              {categoryConfig[msg.category].icon} {categoryConfig[msg.category].label}
                            </Chip>
                          )}
                        </div>
                        <div className="text-[11.5px] leading-relaxed">{msg.text}</div>
                        <div className="text-[9px] text-t3 text-right mt-1">{msg.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-3 py-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <button className="shrink-0 w-8 h-8 rounded-lg border border-border text-t3 hover:bg-bg2 cursor-pointer transition-colors flex items-center justify-center text-sm">📎</button>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) setChatInput(""); }}
                    placeholder="Nhập tin nhắn gửi vào nhóm Zalo..."
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg2 text-[12px] placeholder:text-t3 focus:outline-none focus:border-border-accent"
                    disabled={activeGroup.status === "inactive"}
                  />
                  <button
                    onClick={() => { if (chatInput.trim()) setChatInput(""); }}
                    disabled={!chatInput.trim() || activeGroup.status === "inactive"}
                    className="shrink-0 px-4 py-2 rounded-lg bg-teal text-bg0 text-[11px] font-semibold cursor-pointer border border-teal hover:brightness-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Gửi
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[9px] text-t3">
                  <span>💡 Tin nhắn gửi qua Zalo OA API</span>
                  <span className={activeGroup.status === "active" ? "text-teal" : "text-amber"}>
                    {activeGroup.status === "active" ? "🟢 Kết nối" : "🟡 Tạm ngưng"}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ─── FEED VIEW ─── */}
          {viewMode === "feed" && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-bg2/30">
                <span className="text-[10px] text-t3 mr-1">Lọc:</span>
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "complaint", label: "⚠️ Phản ánh" },
                  { key: "emergency", label: "🚨 Khẩn cấp" },
                  { key: "question", label: "❓ Hỏi đáp" },
                  { key: "feedback", label: "💬 Góp ý" },
                ].map(f => (
                  <button key={f.key} onClick={() => setFeedFilter(f.key)}
                    className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer transition-all border
                      ${feedFilter === f.key
                        ? "bg-teal/15 text-teal border-teal/30 font-semibold"
                        : "text-t2 border-border hover:bg-bg2"}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 space-y-2">
                {feedMessages.length === 0 ? (
                  <div className="text-center text-t3 text-[12px] py-8">Không có phản ánh nào</div>
                ) : (
                  feedMessages.map(msg => {
                    const cat = categoryConfig[msg.category!];
                    return (
                      <div key={msg.id} className="bg-bg2 border border-border rounded-lg p-3 hover:border-border-strong transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Chip color={cat.color}>{cat.icon} {cat.label}</Chip>
                            <span className="text-[11px] font-semibold text-info">{msg.sender}</span>
                          </div>
                          <span className="text-[9px] text-t3 font-mono">{msg.time}</span>
                        </div>
                        <div className="text-[12px] leading-relaxed mb-2">{msg.text}</div>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-0.5 rounded text-[9px] border border-teal/30 text-teal hover:bg-teal/10 cursor-pointer transition-colors">✓ Đã xử lý</button>
                          <button className="px-2 py-0.5 rounded text-[9px] border border-amber/30 text-amber hover:bg-amber/10 cursor-pointer transition-colors">📝 Tạo ticket</button>
                          <button className="px-2 py-0.5 rounded text-[9px] border border-border text-t2 hover:bg-bg2 cursor-pointer transition-colors">💬 Trả lời</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ─── INFO VIEW ─── */}
          {viewMode === "info" && (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="max-w-lg mx-auto space-y-4">
                <div className="text-center mb-4">
                  <span className="text-4xl block mb-2">{activeGroup.avatar}</span>
                  <h3 className="text-[15px] font-bold text-t1">{activeGroup.name}</h3>
                  <p className="text-[11px] text-t3">{activeGroup.building}</p>
                  <div className="mt-2">
                    <Chip color={activeGroup.status === "active" ? "teal" : "amber"}>
                      {activeGroup.status === "active" ? "🟢 Hoạt động" : "🟡 Tạm ngưng"}
                    </Chip>
                  </div>
                </div>

                <div className="bg-bg2 border border-border rounded-xl p-4 text-center">
                  <div className="text-[10px] text-t3 uppercase tracking-wider mb-2 font-semibold">QR Code tham gia nhóm</div>
                  <div className="inline-block bg-bg0 p-3 rounded-xl border border-border">
                    <img src={activeGroup.qrCode} alt="QR Code" className="w-[140px] h-[140px]" />
                  </div>
                  <div className="mt-2 text-[10px] text-t3">Quét QR để tham gia nhóm Zalo</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Admin", value: activeGroup.admin, icon: "👤" },
                    { label: "SĐT Admin", value: activeGroup.adminPhone, icon: "📞" },
                    { label: "Thành viên", value: `${activeGroup.members} người`, icon: "👥" },
                    { label: "Ngày tạo", value: activeGroup.createdAt, icon: "📅" },
                    { label: "Tin chưa đọc", value: `${activeGroup.unread} tin`, icon: "📩" },
                    { label: "Tổng tin nhắn", value: `${activeGroup.messages.length} tin`, icon: "💬" },
                  ].map((item, i) => (
                    <div key={i} className="bg-bg2 border border-border rounded-lg p-2.5">
                      <div className="text-[10px] text-t3 mb-0.5">{item.icon} {item.label}</div>
                      <div className="text-[12px] font-semibold text-t1">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-bg2 border border-border rounded-xl p-3">
                  <div className="text-[10px] text-t3 uppercase tracking-wider mb-1.5 font-semibold">🔗 Link nhóm Zalo</div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={activeGroup.zaloLink}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-bg1 text-[11px] font-mono text-info" />
                    <button onClick={() => navigator.clipboard.writeText(activeGroup.zaloLink)}
                      className="px-3 py-1.5 rounded-lg text-[10px] border border-teal/30 text-teal hover:bg-teal/10 cursor-pointer transition-colors font-semibold">
                      📋 Copy
                    </button>
                  </div>
                </div>

                <div className="bg-bg2 border border-border rounded-xl p-3">
                  <div className="text-[10px] text-t3 uppercase tracking-wider mb-2 font-semibold">📊 Thống kê phản ánh</div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(categoryConfig).map(([key, cfg]) => {
                      const count = activeGroup.messages.filter(m => m.category === key).length;
                      return (
                        <div key={key} className="text-center">
                          <div className="text-[16px] font-bold font-mono text-t1">{count}</div>
                          <div className="text-[9px] text-t3">{cfg.icon} {cfg.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(activeGroup)} className="flex-1 px-3 py-2 rounded-lg text-[11px] border border-border text-t2 hover:bg-bg2 cursor-pointer transition-colors">
                    ✏️ Chỉnh sửa
                  </button>
                  <a href={activeGroup.zaloLink} target="_blank" rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 rounded-lg text-[11px] bg-info/15 border border-info/30 text-info text-center font-semibold hover:bg-info/25 cursor-pointer transition-colors">
                    🔗 Mở Zalo
                  </a>
                  <button onClick={() => openDelete(activeGroup)} className="flex-1 px-3 py-2 rounded-lg text-[11px] border border-danger/30 text-danger hover:bg-danger/10 cursor-pointer transition-colors">
                    🗑️ Xóa nhóm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CREATE / EDIT DIALOG ─── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa nhóm Zalo" : "Tạo nhóm Zalo mới"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Cập nhật thông tin nhóm Zalo" : "Điền thông tin để tạo nhóm Zalo mới cho chung cư"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Avatar picker */}
            <div>
              <Label className="text-[11px]">Biểu tượng</Label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {avatarOptions.map(av => (
                  <button key={av} type="button" onClick={() => updateField("avatar", av)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center cursor-pointer border transition-all
                      ${formData.avatar === av ? "border-teal bg-teal/15 ring-1 ring-teal/30" : "border-border hover:bg-bg2"}`}>
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="zg-name" className="text-[11px]">Tên nhóm *</Label>
              <Input id="zg-name" value={formData.name} onChange={e => updateField("name", e.target.value)}
                placeholder="VD: Cư dân Vinhomes Central Park" className="mt-1 text-[12px]" />
            </div>

            <div>
              <Label htmlFor="zg-building" className="text-[11px]">Tòa nhà / Chung cư *</Label>
              <Input id="zg-building" value={formData.building} onChange={e => updateField("building", e.target.value)}
                placeholder="VD: Vinhomes Central Park" className="mt-1 text-[12px]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="zg-admin" className="text-[11px]">Admin</Label>
                <Input id="zg-admin" value={formData.admin} onChange={e => updateField("admin", e.target.value)}
                  placeholder="BQL Vinhomes" className="mt-1 text-[12px]" />
              </div>
              <div>
                <Label htmlFor="zg-phone" className="text-[11px]">SĐT Admin</Label>
                <Input id="zg-phone" value={formData.adminPhone} onChange={e => updateField("adminPhone", e.target.value)}
                  placeholder="0901-000-001" className="mt-1 text-[12px]" />
              </div>
            </div>

            <div>
              <Label htmlFor="zg-link" className="text-[11px]">Link nhóm Zalo</Label>
              <Input id="zg-link" value={formData.zaloLink} onChange={e => updateField("zaloLink", e.target.value)}
                placeholder="https://zalo.me/g/..." className="mt-1 text-[12px] font-mono" />
            </div>

            <div>
              <Label className="text-[11px]">Trạng thái</Label>
              <div className="flex gap-2 mt-1">
                {(["active", "inactive"] as const).map(s => (
                  <button key={s} type="button" onClick={() => updateField("status", s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border transition-all
                      ${formData.status === s
                        ? s === "active" ? "bg-teal/15 text-teal border-teal/30 font-semibold" : "bg-amber/15 text-amber border-amber/30 font-semibold"
                        : "text-t2 border-border hover:bg-bg2"}`}>
                    {s === "active" ? "🟢 Hoạt động" : "🟡 Tạm ngưng"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.building.trim()}>
              {editingId ? "Lưu thay đổi" : "Tạo nhóm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE DIALOG ─── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhóm Zalo?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa nhóm <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa nhóm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
