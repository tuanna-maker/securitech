import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBuildingStats } from "@/features/buildings";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: { text: string; type: "r" | "a" | "t" | "p" | "new" };
}

interface SidebarProps {
  activeScreen: string;
  onNavigate: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const LogoIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
    <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" fill="hsl(var(--teal))" opacity="0.2"/>
    <path d="M10 4L15 7.5V12.5L10 16L5 12.5V7.5L10 4Z" fill="hsl(var(--teal))" opacity="0.4"/>
    <circle cx="10" cy="10" r="2.5" fill="hsl(var(--teal))"/>
  </svg>
);

const icons = {
  dashboard: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  workforce: <svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M14 14c0-2.21-1.79-4-4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  incidents: <svg viewBox="0 0 16 16" fill="none"><path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11" r=".7" fill="currentColor"/></svg>,
  contracts: <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  crm: <svg viewBox="0 0 16 16" fill="none"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3 2.69-5 6-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  ecosystem: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4 6V4a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  hr: <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  finance: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 7h14" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="10" r="1" fill="currentColor" opacity=".6"/><path d="M8 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  training: <svg viewBox="0 0 16 16" fill="none"><path d="M8 2L15 5.5v1L8 10 1 6.5v-1L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M4 8.5v3.5c0 1 1.79 2 4 2s4-1 4-2V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  comms: <svg viewBox="0 0 16 16" fill="none"><path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l3 3 3-3h3a1 1 0 001-1V3a1 1 0 00-1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  settings: <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  help: <svg viewBox="0 0 16 16" fill="none"><path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 6v4M8 11v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  reports: <svg viewBox="0 0 16 16" fill="none"><path d="M2 2h12v12H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 10V7M8 10V5M11 10V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Vận hành",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: icons.dashboard },
      { id: "buildings", label: "Tòa nhà / Chung cư", icon: icons.ecosystem },
      { id: "security-staff", label: "Nhân sự bảo vệ", icon: icons.hr },
      { id: "workforce", label: "Ca trực & Tuần tra", icon: icons.workforce },
      { id: "patrols", label: "Tuần tra & Checkpoint", icon: icons.workforce },
      { id: "sos", label: "SOS khẩn cấp", icon: icons.incidents, badge: { text: "SOS", type: "r" } },
      { id: "access-control", label: "Kiểm soát ra/vào", icon: icons.contracts },
      { id: "incidents", label: "Sự cố", icon: icons.incidents },
      { id: "resident-services", label: "Dịch vụ cư dân", icon: icons.comms },
      { id: "crm", label: "Khách hàng (CRM)", icon: icons.crm },
      { id: "reports", label: "Báo cáo tổng hợp", icon: icons.reports },
    ],
  },
  {
    label: "Nhân sự & Tổ chức",
    items: [
      { id: "hr", label: "Quản lý Nhân sự", icon: icons.hr },
      { id: "finance", label: "Tài chính & Lương", icon: icons.finance },
      { id: "training", label: "Đào tạo nội bộ", icon: icons.training },
      { id: "comms", label: "Truyền thông nội bộ", icon: icons.comms },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { id: "settings", label: "Cài đặt & Phân quyền", icon: icons.settings },
      { id: "help", label: "Hỗ trợ & Tài liệu", icon: icons.help },
    ],
  },
];

const badgeStyles: Record<string, string> = {
  r: "bg-danger-muted text-danger",
  a: "bg-amber-muted text-amber",
  t: "bg-teal-muted text-teal",
  p: "bg-bg3 text-t2",
  new: "bg-teal-muted text-teal",
};

export default function Sidebar({ activeScreen, onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  const stats = useBuildingStats();
  const { profile } = useAuth();

  const onlineRate = stats.totalStaff > 0 ? Math.round((stats.totalStaffOnline / stats.totalStaff) * 100) : 0;

  return (
    <nav className={`${collapsed ? "w-[56px]" : "w-[220px]"} h-screen bg-bg1 border-r border-border flex flex-col shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-200`}>
      {/* Logo header */}
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <div className="w-7 h-7 bg-teal/15 border border-teal/30 rounded-lg flex items-center justify-center shrink-0">
            <LogoIcon />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-[15px] font-extrabold text-t1 tracking-tight leading-none">STOS</div>
              <div className="text-[8px] text-t4 tracking-[0.2em] uppercase">Security Ops</div>
            </div>
          )}
        </div>
      </div>

      {/* System health strip */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" />
              <span className="text-teal font-semibold">ONLINE</span>
            </div>
            <span className="text-t4">{new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[9px]">
            <div className="flex items-center gap-0.5">
              <span className="text-t2 font-mono font-semibold">{onlineRate}%</span>
              <span className="text-t4">nhân viên</span>
            </div>
            {stats.critical > 0 && (
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-danger animate-blink" />
                <span className="text-danger font-mono font-semibold">{stats.critical}</span>
                <span className="text-t4">nghiêm trọng</span>
              </div>
            )}
            {stats.warning > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="text-amber font-mono font-semibold">{stats.warning}</span>
                <span className="text-t4">cảnh báo</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation sections */}
      {sections.map((section) => (
        <div key={section.label} className={`${collapsed ? "px-1" : "px-2"} pt-2.5 pb-0.5`}>
          {!collapsed && (
            <div className="text-[8px] font-bold text-t4 uppercase tracking-[0.15em] px-2 mb-1">{section.label}</div>
          )}
          {collapsed && <div className="border-t border-border mb-1.5 mx-1" />}
          {section.items.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${collapsed ? "justify-center px-0 py-1.5" : "gap-2 px-2 py-[5px]"} rounded-md cursor-pointer text-[11.5px] mb-[1px] select-none relative transition-all duration-100
                  ${isActive
                    ? "bg-teal/10 text-teal border-l-2 border-teal"
                    : "text-t2 hover:bg-bg2 hover:text-t1 border-l-2 border-transparent"
                  }`}
              >
                <span className={`${collapsed ? "w-[16px] h-[16px]" : "w-[14px] h-[14px]"} shrink-0 ${isActive ? "opacity-100" : "opacity-60"}`}>{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-[0px] rounded-full min-w-[16px] text-center leading-[16px] ${badgeStyles[item.badge.type]}`}>
                    {item.badge.text}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-danger" />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Collapse toggle */}
      {onToggleCollapse && (
        <div className={`px-2 py-1.5 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-[11px] text-t4 hover:bg-bg2 hover:text-t2 transition-colors w-full"
          >
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={12} /><span>Thu gọn</span></>}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-border">
        {!collapsed && (
          <div className="px-3 py-2 border-b border-border">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div>
                <div className="text-[10px] font-mono font-bold text-t1">{stats.total}</div>
                <div className="text-[7px] text-t4 uppercase">Tòa nhà</div>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-teal">{stats.totalStaffOnline}</div>
                <div className="text-[7px] text-t4 uppercase">Trực tuyến</div>
              </div>
              <div>
                <div className={`text-[10px] font-mono font-bold ${stats.totalIncidents > 15 ? "text-amber" : "text-t1"}`}>{stats.totalIncidents}</div>
                <div className="text-[7px] text-t4 uppercase">Sự cố</div>
              </div>
            </div>
          </div>
        )}
        <div className={`p-2 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center ${collapsed ? "justify-center p-0.5" : "gap-2 p-1.5"} rounded-md cursor-pointer hover:bg-bg2 transition-colors`}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] text-bg0 shrink-0 bg-teal">
              {(profile?.full_name || "U").charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-t1 truncate">{profile?.full_name || "User"}</div>
                <div className="text-[9px] text-t4">Giám đốc vận hành</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
