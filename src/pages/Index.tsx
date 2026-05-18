import { useState, useRef, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import DashboardScreen from "@/components/screens/DashboardScreen";
import HRScreen from "@/components/screens/HRScreen";
import FinanceScreen from "@/components/screens/FinanceScreen";
import TrainingScreen from "@/components/screens/TrainingScreen";
import CommsScreen from "@/components/screens/CommsScreen";
import IncidentsScreen from "@/components/screens/IncidentsScreen";
import PlaceholderScreen from "@/components/screens/PlaceholderScreen";
import WorkforceScreen from "@/components/screens/WorkforceScreen";
import CRMScreen from "@/components/screens/CRMScreen";
import GlobalSearch from "@/components/command/GlobalSearch";
import ReportsScreen from "@/components/screens/ReportsScreen";
import BuildingsScreen from "@/components/screens/BuildingsScreen";
import SecurityStaffScreen from "@/components/screens/SecurityStaffScreen";
import ResidentServicesScreen from "@/components/screens/ResidentServicesScreen";
import AccessControlScreen from "@/components/screens/AccessControlScreen";
import SOSScreen from "@/components/screens/SOSScreen";
import PatrolsScreen from "@/components/screens/PatrolsScreen";
import AIChatbot from "@/components/chat/AIChatbot";

const TITLES: Record<string, string> = {
  dashboard: "Command Center — Trung tâm điều hành",
  buildings: "Quản lý Tòa nhà / Chung cư",
  "security-staff": "Nhân sự bảo vệ",
  workforce: "Ca trực & Tuần tra",
  patrols: "Tuần tra & Checkpoint",
  sos: "SOS khẩn cấp",
  "access-control": "Kiểm soát ra/vào",
  incidents: "Quản lý sự cố",
  "resident-services": "Dịch vụ cư dân",
  contracts: "Hợp đồng & Doanh thu",
  crm: "Quản lý Khách hàng (CRM)",
  reports: "Báo cáo tổng hợp",
  ecosystem: "Hệ sinh thái chung cư",
  hr: "Quản lý Nhân sự",
  finance: "Tài chính & Lương",
  training: "Đào tạo nội bộ",
  comms: "Truyền thông nội bộ",
  settings: "Cài đặt & Phân quyền",
  help: "Hỗ trợ & Tài liệu",
};

const MOBILE_TITLES: Record<string, string> = {
  dashboard: "Điều hành",
  buildings: "Tòa nhà",
  "security-staff": "Nhân sự BV",
  workforce: "Ca trực",
  patrols: "Tuần tra",
  sos: "SOS",
  "access-control": "Ra/vào",
  incidents: "Sự cố",
  "resident-services": "Dịch vụ",
  contracts: "Hợp đồng",
  crm: "CRM",
  reports: "Báo cáo",
  ecosystem: "Hệ sinh thái",
  hr: "Nhân sự",
  finance: "Tài chính",
  training: "Đào tạo",
  comms: "Truyền thông",
  settings: "Cài đặt",
  help: "Hỗ trợ",
};

const ACTIONS: Record<string, string> = {
  hr: "Thêm nhân viên",
  finance: "Tạo hóa đơn",
  training: "Tạo khóa học",
  comms: "Đăng thông báo",
  crm: "Thêm khách hàng",
  "security-staff": "Thêm nhân sự",
  "resident-services": "Tiếp nhận bưu phẩm",
  "access-control": "Ghi nhận khách",
};

const Index = () => {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("stos-sidebar-collapsed") === "true";
    }
    return false;
  });
  const [transitioning, setTransitioning] = useState(false);
  const [displayedScreen, setDisplayedScreen] = useState("dashboard");
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      localStorage.setItem("stos-sidebar-collapsed", String(next));
      return next;
    });
  };

  const renderScreen = useCallback(() => {
    switch (displayedScreen) {
      case "dashboard": return <DashboardScreen />;
      case "buildings": return <BuildingsScreen />;
      case "security-staff": return <SecurityStaffScreen />;
      case "hr": return <HRScreen />;
      case "finance": return <FinanceScreen />;
      case "training": return <TrainingScreen />;
      case "comms": return <CommsScreen />;
      case "workforce": return <WorkforceScreen />;
      case "incidents": return <IncidentsScreen />;
      case "resident-services": return <ResidentServicesScreen />;
      case "access-control": return <AccessControlScreen />;
      case "sos": return <SOSScreen />;
      case "patrols": return <PatrolsScreen />;
      case "contracts": return <PlaceholderScreen title="Hợp đồng & Pipeline" description="Quản lý hợp đồng, hóa đơn, pipeline bán hàng." />;
      case "crm": return <CRMScreen />;
      case "reports": return <ReportsScreen />;
      case "ecosystem": return <PlaceholderScreen title="Hệ sinh thái chung cư" description="Cổng ban quản lý, app cư dân, marketplace dịch vụ." />;
      case "settings": return <PlaceholderScreen title="Cài đặt & Phân quyền" description="Quản lý quyền truy cập, cấu hình hệ thống." />;
      case "help": return <PlaceholderScreen title="Hỗ trợ & Tài liệu" description="Tài liệu hướng dẫn sử dụng, hỗ trợ kỹ thuật." />;
      default: return <DashboardScreen />;
    }
  }, [displayedScreen]);

  const handleNavigate = useCallback((id: string) => {
    if (id === activeScreen) return;
    setTransitioning(true);
    setSidebarOpen(false);
    // Wait for fade-out, then swap screen and fade-in
    setTimeout(() => {
      setActiveScreen(id);
      setDisplayedScreen(id);
      // Scroll to top on navigate
      contentRef.current?.scrollTo({ top: 0 });
      setTransitioning(false);
    }, 150);
  }, [activeScreen]);

  const handleMobileNav = useCallback((id: string) => {
    if (id === "more") {
      setSidebarOpen(true);
      return;
    }
    handleNavigate(id);
  }, [handleNavigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile, shown as overlay when open */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:block transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar activeScreen={activeScreen} onNavigate={(id) => { handleNavigate(id); setSidebarOpen(false); }} collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapsed} />
      </div>

      <GlobalSearch onNavigate={handleNavigate} onSelectBuilding={(_id) => { handleNavigate("dashboard"); }} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <TopBar
          title={TITLES[activeScreen] || activeScreen}
          mobileTitle={MOBILE_TITLES[activeScreen] || activeScreen}
          actionLabel={ACTIONS[activeScreen] || "Thêm mới"}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <div ref={contentRef} className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 pb-16 lg:pb-4 bg-bg0">
          <div className={`transition-all duration-150 ease-out ${transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {renderScreen()}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav activeScreen={activeScreen} onNavigate={handleMobileNav} />
      <AIChatbot />
    </div>
  );
};

export default Index;
