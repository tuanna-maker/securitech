import { useState } from "react";
import {
  Users, UserCheck, UserX, AlertTriangle, ShieldCheck, Star,
  Clock, Bell, MessageSquare, Phone,
  CalendarCheck, CheckCircle2, Route, ArrowLeftRight, AlertCircle, Camera, Award, FileText,
  ChevronRight, Search, Filter, GraduationCap, Gift,
} from "lucide-react";
import { useBuildingStats } from "@/features/buildings";

/* ───────────────────────── helpers ───────────────────────── */

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200/80 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const SectionHeader = ({ title, action }: { title: string; action?: string }) => (
  <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
    <h3 className="text-[15px] font-semibold text-slate-900 truncate min-w-0 flex-1">{title}</h3>
    {action && (
      <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 whitespace-nowrap shrink-0">
        {action} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

/* ───────────────────────── KPI ───────────────────────── */

type Kpi = {
  icon: React.ElementType; label: string; value: string; sub: string;
  iconBg: string; iconColor: string;
};

function KpiCard({ k }: { k: Kpi }) {
  const Icon = k.icon;
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.iconBg}`}>
          <Icon className={`w-5 h-5 ${k.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-slate-500 font-medium">{k.label}</div>
          <div className="text-[26px] leading-tight font-bold text-slate-900 mt-0.5">{k.value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{k.sub}</div>
        </div>
      </div>
    </Card>
  );
}

/* ───────────────────────── Donut (SVG) ───────────────────────── */

function DonutChart({ segments, total, label }: {
  segments: { value: number; color: string }[]; total: number; label: string;
}) {
  const r = 56, c = 2 * Math.PI * r;
  let offset = 0;
  const sum = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="relative w-[160px] h-[160px] mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(210 20% 94%)" strokeWidth="14" />
        {segments.map((s, i) => {
          const len = (s.value / sum) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={s.color}
              strokeWidth="14" strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[22px] font-bold text-slate-900 leading-none">{total.toLocaleString("vi-VN")}</div>
        <div className="text-[11px] text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── Map placeholder ───────────────────────── */

function MapPanel() {
  const buildings = [
    { name: "Sunrise City", staff: "128/136", x: "22%", y: "20%" },
    { name: "The Park", staff: "98/102", x: "62%", y: "26%" },
    { name: "Green Home", staff: "56/60", x: "26%", y: "52%" },
    { name: "Skyline", staff: "62/70", x: "70%", y: "60%" },
    { name: "River View", staff: "74/80", x: "40%", y: "72%" },
  ];
  return (
    <Card>
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h3 className="text-[15px] font-semibold text-slate-900 whitespace-nowrap">Bản đồ vị trí trực</h3>
        <select className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 shrink-0 w-auto max-w-[180px]">
          <option>Tất cả tòa nhà</option>
        </select>
      </div>
      <div className="px-5 pb-5">
        <div className="relative h-[320px] rounded-lg overflow-hidden bg-gradient-to-br from-sky-50 via-emerald-50 to-blue-50 border border-slate-200">
          {/* faux streets */}
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 320" preserveAspectRatio="none">
            <path d="M0,160 L400,160" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M200,0 L200,320" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M0,80 L400,80" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M0,240 L400,240" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M100,0 L100,320" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M300,0 L300,320" stroke="#e2e8f0" strokeWidth="1" />
          </svg>
          {buildings.map((b, i) => (
            <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: b.x, top: b.y }}>
              <div className="bg-white shadow-md border border-slate-200 rounded-lg px-2.5 py-1.5 text-center min-w-[80px]">
                <div className="text-[11px] font-semibold text-slate-900">{b.name}</div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {b.staff}
                </div>
              </div>
            </div>
          ))}
          {/* legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg p-2.5 text-[11px] space-y-1 shadow-sm border border-slate-200">
            {[
              ["bg-emerald-500", "Đủ người"],
              ["bg-amber-500", "Thiếu người"],
              ["bg-rose-500", "Chưa có người"],
              ["bg-slate-400", "Ngoài ca"],
            ].map(([c, t]) => (
              <div key={t} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c}`} /> <span className="text-slate-700">{t}</span>
              </div>
            ))}
          </div>
          <button className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow">
            Xem chi tiết
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ───────────────────────── Activity bars ───────────────────────── */

function ActivityPanel() {
  const items = [
    { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50", label: "Điểm danh hôm nay", value: "986 / 1.248", pct: 79, bar: "bg-emerald-500" },
    { icon: Route, color: "text-blue-600 bg-blue-50", label: "Tuần tra đúng tuyến", value: "92%", pct: 92, bar: "bg-blue-500" },
    { icon: AlertCircle, color: "text-sky-600 bg-sky-50", label: "SLA phản hồi sự cố", value: "91%", pct: 91, bar: "bg-sky-500" },
    { icon: ArrowLeftRight, color: "text-violet-600 bg-violet-50", label: "Giao ca đúng giờ", value: "96%", pct: 96, bar: "bg-violet-500" },
    { icon: CheckCircle2, color: "text-amber-600 bg-amber-50", label: "Hoàn thành công việc", value: "88%", pct: 88, bar: "bg-amber-500" },
  ];
  return (
    <Card>
      <SectionHeader title="Tình trạng hoạt động" action="Xem chi tiết" />
      <div className="px-5 pb-5 space-y-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${it.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1.5">
                  <div className="text-[13px] text-slate-700">{it.label}</div>
                  <div className="text-[13px] font-semibold text-slate-900">{it.value}</div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${it.bar} rounded-full`} style={{ width: `${it.pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ───────────────────────── Incidents list ───────────────────────── */

function IncidentsPanel() {
  const items = [
    { sev: "Khẩn cấp", sevColor: "bg-rose-100 text-rose-700", title: "Mất điện khu A - Tòa S2", loc: "Sunrise City - Tầng hầm B2", time: "09:15" },
    { sev: "Cao", sevColor: "bg-orange-100 text-orange-700", title: "Nước sinh hoạt yếu", loc: "The Park - Tòa P1 - Tầng 12", time: "08:45" },
    { sev: "Trung bình", sevColor: "bg-amber-100 text-amber-700", title: "Xe máy đỗ sai quy định", loc: "Green Home - Sảnh B", time: "08:20" },
    { sev: "Thấp", sevColor: "bg-slate-100 text-slate-600", title: "Thang máy dừng tầng", loc: "River View - Tòa R1", time: "07:50" },
  ];
  return (
    <Card>
      <SectionHeader title="Sự cố mới nhất" action="Xem tất cả" />
      <div className="px-5 pb-4 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
            <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${it.sevColor}`}>{it.sev}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-slate-900 truncate">{it.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{it.loc}</div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono shrink-0">{it.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ───────────────────────── Schedule (donut + upcoming) ───────────────────────── */

function SchedulePanel() {
  const upcoming = [
    { name: "Trần Văn Minh", shift: "Ca sáng • 06:00 - 14:00", left: "Còn 15 phút", dot: "bg-blue-500" },
    { name: "Nguyễn Văn Hùng", shift: "Ca chiều • 14:00 - 22:00", left: "Còn 45 phút", dot: "bg-emerald-500" },
    { name: "Lê Quốc Bảo", shift: "Ca đêm • 22:00 - 06:00", left: "Còn 1 giờ 30 phút", dot: "bg-amber-500" },
  ];
  return (
    <Card>
      <SectionHeader title="Lịch trực hôm nay" action="Xem tất cả" />
      <div className="px-5 pb-4">
        <div className="flex items-center gap-4">
          <DonutChart
            total={1146}
            label="Tổng đang trực"
            segments={[
              { value: 412, color: "hsl(217 91% 60%)" },
              { value: 398, color: "hsl(160 84% 39%)" },
              { value: 336, color: "hsl(38 92% 50%)" },
            ]}
          />
          <div className="space-y-2.5 text-[12px] flex-1">
            {[
              ["bg-blue-500", "Ca sáng", "06:00 - 14:00", 412],
              ["bg-emerald-500", "Ca chiều", "14:00 - 22:00", 398],
              ["bg-amber-500", "Ca đêm", "22:00 - 06:00", 336],
            ].map(([d, n, t, v]) => (
              <div key={n as string} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${d}`} />
                <div className="flex-1">
                  <div className="text-slate-900 font-medium">{n}</div>
                  <div className="text-[10px] text-slate-500">{t}</div>
                </div>
                <div className="text-slate-900 font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold text-slate-900">Nhân sự sắp hết ca</div>
            <button className="text-[11px] text-blue-600 font-medium">Xem tất cả</button>
          </div>
          <div className="space-y-3">
            {upcoming.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${u.dot} text-white flex items-center justify-center text-[11px] font-semibold`}>
                  {u.name.split(" ").pop()?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-slate-900 truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-500">{u.shift}</div>
                </div>
                <div className="text-[10px] text-amber-600 font-medium shrink-0">{u.left}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ───────────────────────── Staff table ───────────────────────── */

function StaffTable() {
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: "Tất cả (986)" },
    { id: "morning", label: "Ca sáng (412)" },
    { id: "afternoon", label: "Ca chiều (398)" },
    { id: "night", label: "Ca đêm (336)" },
  ];
  const rows = [
    { stt: 1, name: "Trần Văn Minh", role: "Tổ trưởng", loc: "Sunrise City - S2", shift: "Ca sáng", time: "06:02" },
    { stt: 2, name: "Nguyễn Văn Hùng", role: "Bảo vệ", loc: "Sunrise City - S1", shift: "Ca sáng", time: "06:01" },
    { stt: 3, name: "Lê Quốc Bảo", role: "Bảo vệ", loc: "The Park - P1", shift: "Ca chiều", time: "14:00" },
    { stt: 4, name: "Phạm Văn Dũng", role: "Bảo vệ", loc: "Green Home - G2", shift: "Ca chiều", time: "14:01" },
    { stt: 5, name: "Ngô Thành Trung", role: "Bảo vệ", loc: "River View - R1", shift: "Ca đêm", time: "22:00" },
  ];
  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-wrap gap-3">
        <h3 className="text-[15px] font-semibold text-slate-900 whitespace-nowrap">Nhân sự đang trực</h3>
        <div className="flex items-center gap-2">
          <select className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700">
            <option>Tất cả tòa nhà</option>
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Tìm kiếm nhân sự..." className="text-xs border border-slate-200 rounded-md pl-7 pr-3 py-1.5 w-52 bg-white" />
          </div>
          <button className="p-1.5 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="px-5 flex gap-1 border-b border-slate-100">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-[12px] px-3 py-2 -mb-px border-b-2 font-medium transition-colors ${
              tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead className="text-[11px] text-slate-500 uppercase tracking-wide">
            <tr className="border-b border-slate-100">
              {["STT", "Họ và tên", "Chức vụ", "Tòa nhà / Vị trí", "Ca trực", "Giờ vào ca", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} className="text-left font-semibold py-2.5 px-5 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.stt} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="py-3 px-5 text-slate-500">{r.stt}</td>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-[10px] font-semibold flex items-center justify-center">
                      {r.name.split(" ").pop()?.[0]}
                    </div>
                    <span className="font-medium text-slate-900">{r.name}</span>
                  </div>
                </td>
                <td className="py-3 px-5 text-slate-700">{r.role}</td>
                <td className="py-3 px-5 text-slate-700">{r.loc}</td>
                <td className="py-3 px-5 text-slate-700">{r.shift}</td>
                <td className="py-3 px-5 text-slate-700 font-mono">{r.time}</td>
                <td className="py-3 px-5">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">Đang trực</span>
                </td>
                <td className="py-3 px-5">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><Phone className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><MessageSquare className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-100">
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md">
          Xem tất cả nhân sự
        </button>
      </div>
    </Card>
  );
}

/* ───────────────────────── Notifications & Activities ───────────────────────── */

function NotificationsPanel() {
  const items = [
    { icon: AlertCircle, ic: "text-rose-600 bg-rose-50", title: "Thông báo khẩn", text: "Tập trung tại sảnh chính tòa S2", meta: "Sunrise City", time: "09:10" },
    { icon: GraduationCap, ic: "text-blue-600 bg-blue-50", title: "Lịch đào tạo", text: "Đào tạo PCCC định kỳ tháng 5", meta: "24/05/2024 - 08:00", time: "Hôm qua" },
    { icon: Gift, ic: "text-emerald-600 bg-emerald-50", title: "Khen thưởng", text: "Khen thưởng tháng 4/2024", meta: "Danh sách chi tiết", time: "2 ngày trước" },
  ];
  return (
    <Card>
      <SectionHeader title="Thông báo" action="Xem tất cả" />
      <div className="px-5 pb-4 space-y-4">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${it.ic}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="text-[12.5px] font-semibold text-slate-900">{it.title}</div>
                  <div className="text-[10px] text-slate-400 shrink-0">{it.time}</div>
                </div>
                <div className="text-[12px] text-slate-600 mt-0.5">{it.text}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{it.meta}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ActivitiesPanel() {
  const items = [
    { name: "Trần Văn Minh", action: "Check-in điểm tra 07", time: "09:20" },
    { name: "Nguyễn Văn Hùng", action: "Hoàn thành tuần tra tuyến S1", time: "09:15" },
    { name: "Lê Quốc Bảo", action: "Giao ca chiều cho ca đêm", time: "14:00" },
    { name: "Phạm Văn Dũng", action: "Xử lý sự cố: Mất điện khu A", time: "08:40" },
  ];
  return (
    <Card>
      <SectionHeader title="Hoạt động ghi nhận" action="Xem tất cả" />
      <div className="px-5 pb-4 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
              {it.name.split(" ").pop()?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-slate-900">{it.name}</div>
              <div className="text-[11px] text-slate-500">{it.action}</div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono shrink-0">{it.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ───────────────────────── Quick actions ───────────────────────── */

function QuickActions() {
  const actions = [
    { icon: CalendarCheck, label: "Phân ca nhanh", color: "text-blue-600 bg-blue-50" },
    { icon: CheckCircle2, label: "Điểm danh", color: "text-emerald-600 bg-emerald-50" },
    { icon: Route, label: "Tạo tuyến tuần tra", color: "text-amber-600 bg-amber-50" },
    { icon: ArrowLeftRight, label: "Giao ca", color: "text-violet-600 bg-violet-50" },
    { icon: AlertCircle, label: "Báo cáo sự cố", color: "text-rose-600 bg-rose-50" },
    { icon: Camera, label: "Nhắc việc", color: "text-sky-600 bg-sky-50" },
    { icon: Award, label: "Thưởng / Phạt", color: "text-orange-600 bg-orange-50" },
    { icon: FileText, label: "Báo cáo ngày", color: "text-indigo-600 bg-indigo-50" },
  ];
  return (
    <Card>
      <SectionHeader title="Quy trình nghiệp vụ nhanh" />
      <div className="px-5 pb-5 grid grid-cols-4 md:grid-cols-8 gap-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-[11.5px] text-slate-700 font-medium text-center leading-tight">{a.label}</div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ───────────────────────── Top bar ───────────────────────── */

function TopBar() {
  return (
    <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Tổng quan</h1>
        <p className="text-[12.5px] text-slate-500 mt-0.5">Quản lý công ty bảo vệ & đội ngũ</p>
      </div>
      <div className="flex items-center gap-2">
        <select className="text-[12.5px] border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700 min-w-[200px]">
          <option>Công ty Bảo vệ STOS</option>
        </select>
        <div className="text-[12.5px] border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Hôm nay, 23/05/2024
        </div>
        <button className="relative w-9 h-9 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">12</span>
        </button>
        <button className="w-9 h-9 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50">
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Main ───────────────────────── */

export default function DashboardScreen() {
  const stats = useBuildingStats();

  const kpis: Kpi[] = [
    { icon: Users, label: "Tổng nhân sự", value: "1.248", sub: "↑ 18 so với tuần trước", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { icon: UserCheck, label: "Đang trực", value: "986", sub: "79% tổng số", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { icon: UserX, label: "Thiếu người", value: "34", sub: "5 vị trí", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { icon: AlertTriangle, label: "Sự cố hôm nay", value: String(stats.totalIncidents || 7), sub: "Đã xử lý 5", iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { icon: ShieldCheck, label: "Tuần tra hoàn thành", value: "92%", sub: "Mục tiêu 90%", iconBg: "bg-sky-50", iconColor: "text-sky-600" },
    { icon: Star, label: "Đánh giá chất lượng", value: "4.6/5", sub: "Từ 128 đánh giá", iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  ];

  return (
    <div className="bg-slate-50 min-h-full -m-4 p-5 lg:p-6">
      <TopBar />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {kpis.map((k) => <KpiCard key={k.label} k={k} />)}
      </div>

      {/* Map + Activity + Incidents + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
        <div className="lg:col-span-5"><MapPanel /></div>
        <div className="lg:col-span-3"><ActivityPanel /></div>
        <div className="lg:col-span-2"><IncidentsPanel /></div>
        <div className="lg:col-span-2"><SchedulePanel /></div>
      </div>

      {/* Staff + Notifications + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
        <div className="lg:col-span-7"><StaffTable /></div>
        <div className="lg:col-span-3"><NotificationsPanel /></div>
        <div className="lg:col-span-2"><ActivitiesPanel /></div>
      </div>

      {/* Quick actions */}
      <QuickActions />

      <div className="mt-5 flex items-center justify-between text-[11px] text-slate-400">
        <span>STOS Operating System for Residential Life</span>
        <span>© 2024 STOS JSC. All rights reserved.</span>
      </div>
    </div>
  );
}
