interface MobileBottomNavProps {
  activeScreen: string;
  onNavigate: (id: string) => void;
}

const navItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[18px] h-[18px]">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: "buildings",
    label: "Tòa nhà",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[18px] h-[18px]">
        <rect x="1" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4 6V4a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "incidents",
    label: "Sự cố",
    badge: "7",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[18px] h-[18px]">
        <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r=".7" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "workforce",
    label: "Nhân viên",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[18px] h-[18px]">
        <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: "more",
    label: "Thêm",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[18px] h-[18px]">
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function MobileBottomNav({ activeScreen, onNavigate }: MobileBottomNavProps) {
  const isMoreActive = !["dashboard", "buildings", "incidents", "workforce"].includes(activeScreen);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-bg1/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-[52px] px-0.5">
        {navItems.map((item) => {
          const isActive = item.id === "more" ? isMoreActive : activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-[2px] flex-1 py-1 rounded-md cursor-pointer transition-all relative
                ${isActive ? "text-teal" : "text-t4 active:text-t2"}`}
            >
              <span className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 text-[7px] font-bold bg-danger text-white rounded-full w-3 h-3 flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className={`text-[8px] font-medium tracking-wide ${isActive ? "text-teal" : ""}`}>{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1.5px] rounded-full bg-teal" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
