import type { StosIconName } from "@stos/mobile-shared";

/** Demo data for Life UI */
export const FAMILY = {
  name: "Gia đình Minh",
  memberCount: 4,
  motto: "Cùng nhau xây dựng tổ ấm an toàn – hạnh phúc – tiện nghi",
};

export const FAMILY_QUICK_ACTIONS: { key: string; label: string; icon: StosIconName; bg: string; color: string }[] = [
  { key: "members", label: "Thành viên", icon: "members", bg: "#DBEAFE", color: "#2563EB" },
  { key: "calendar", label: "Lịch gia đình", icon: "calendar", bg: "#EDE9FE", color: "#7C3AED" },
  { key: "memories", label: "Kỷ niệm", icon: "memories", bg: "#FCE7F3", color: "#DB2777" },
  { key: "settings", label: "Cài đặt", icon: "settings", bg: "#D1FAE5", color: "#059669" },
];

export const FAMILY_MANAGEMENT = [
  {
    key: "spending",
    title: "Chi tiêu gia đình",
    icon: "wallet" as const,
    bg: "#DBEAFE",
    color: "#2563EB",
    href: "/family/spending",
    lines: ["Tổng chi tháng 5", "18.450.000đ", "▼ 8,2% so với tháng 4"],
    trend: "down" as const,
  },
  {
    key: "kids",
    title: "Đồng hành cùng con",
    icon: "child" as const,
    bg: "#EDE9FE",
    color: "#7C3AED",
    children: [
      { name: "Bé Minh (7 tuổi)", detail: "8 lịch hôm nay", dot: "#7C3AED" },
      { name: "Bé An (4 tuổi)", detail: "3 lịch hôm nay", dot: "#22C55E" },
    ],
  },
  {
    key: "fridge",
    title: "Thực phẩm & Tủ lạnh",
    icon: "fridge" as const,
    bg: "#FFEDD5",
    color: "#EA580C",
    alert: "2 thực phẩm sắp hết hạn",
  },
  {
    key: "health",
    title: "Sức khỏe gia đình",
    icon: "health-heart" as const,
    bg: "#D1FAE5",
    color: "#059669",
    reminders: [
      { text: "Mẹ cần uống thuốc (20:00 hôm nay)", icon: "pills" as const },
      { text: "Bố có lịch khám (10:00 · 20/05)", icon: "stethoscope" as const },
    ],
  },
];

export const FAMILY_SERVICES: { key: string; label: string; icon: StosIconName; bg: string; color: string }[] = [
  { key: "travel", label: "Cả nhà du lịch", icon: "travel", bg: "#DBEAFE", color: "#2563EB" },
  { key: "home", label: "Dịch vụ tại nhà", icon: "home-service", bg: "#D1FAE5", color: "#059669" },
  { key: "car", label: "Đặt xe gia đình", icon: "family-car", bg: "#FFEDD5", color: "#EA580C" },
  { key: "shop", label: "Mua sắm hộ", icon: "shopping", bg: "#EDE9FE", color: "#7C3AED" },
  { key: "vip", label: "Gói ưu đãi", icon: "crown", bg: "#FEF9C3", color: "#CA8A04" },
];

export const FAMILY_MOMENTS = [
  { id: "1", title: "Đà Nẵng – Hội An", date: "20/05/2024", hue: "#3B82F6" },
  { id: "2", title: "Sinh nhật bé An", date: "12/05/2024", hue: "#EC4899" },
  { id: "3", title: "Bữa cơm cuối tuần", date: "05/05/2024", hue: "#F97316" },
  { id: "4", title: "Ngày của mẹ", date: "10/05/2024", hue: "#A855F7" },
];

export const AI_FAMILY_HINTS: { text: string; icon: StosIconName; color: string }[] = [
  { text: "Bé Minh có lớp Piano lúc 18:00", icon: "calendar", color: "#2563EB" },
  { text: "2 thực phẩm sắp hết hạn", icon: "fridge", color: "#EA580C" },
  { text: "Mẹ cần uống thuốc lúc 20:00", icon: "pills", color: "#DB2777" },
];

export const SPENDING = {
  month: "Tháng 5/2024",
  total: "18.450.000đ",
  trend: "▼ 8,2% so với tháng 4",
  budgetLeft: "5.550.000đ",
  budgetPct: 23,
  groups: [
    { label: "Ăn uống", pct: 30, color: "#2563EB" },
    { label: "Nhà cửa", pct: 25, color: "#7C3AED" },
    { label: "Con cái", pct: 15, color: "#F97316" },
    { label: "Y tế", pct: 8, color: "#22C55E" },
    { label: "Di chuyển", pct: 7, color: "#06B6D4" },
    { label: "Giải trí", pct: 6, color: "#EAB308" },
    { label: "Khác", pct: 9, color: "#94A3B8" },
  ],
  categories: [
    { label: "Ăn uống", amount: "3.200.000đ", trend: "▼ 12%", up: false, icon: "restaurant" as const, bg: "#DBEAFE", color: "#2563EB" },
    { label: "Nhà cửa", amount: "4.600.000đ", trend: "↑ 8%", up: true, icon: "home-building" as const, bg: "#EDE9FE", color: "#7C3AED" },
    { label: "Con cái", amount: "2.800.000đ", trend: "▼ 5%", up: false, icon: "child" as const, bg: "#FFEDD5", color: "#EA580C" },
    { label: "Thú cưng", amount: "450.000đ", trend: "—", up: false, icon: "paw" as const, bg: "#FEF9C3", color: "#CA8A04" },
    { label: "Y tế", amount: "1.500.000đ", trend: "↑ 3%", up: true, icon: "medkit" as const, bg: "#D1FAE5", color: "#059669" },
    { label: "Di chuyển", amount: "1.200.000đ", trend: "▼ 2%", up: false, icon: "car" as const, bg: "#CFFAFE", color: "#0891B2" },
    { label: "Giải trí", amount: "980.000đ", trend: "↑ 15%", up: true, icon: "gamepad" as const, bg: "#FEF9C3", color: "#EAB308" },
    { label: "Khác", amount: "1.720.000đ", trend: "—", up: false, icon: "more-dots" as const, bg: "#F1F5F9", color: "#64748B" },
  ],
  transactions: [
    { merchant: "Farm Fresh", cat: "Ăn uống", amount: "230.000đ", when: "Hôm nay", icon: "leaf-store" as const },
    { merchant: "Co.opmart", cat: "Ăn uống", amount: "450.000đ", when: "Hôm nay", icon: "shopping" as const },
    { merchant: "Highlands Coffee", cat: "Ăn uống", amount: "95.000đ", when: "Hôm nay", icon: "coffee" as const },
    { merchant: "Tiền điện tháng 5", cat: "Nhà cửa", amount: "1.250.000đ", when: "Hôm qua", icon: "lightning" as const },
    { merchant: "Phí gửi xe", cat: "Di chuyển", amount: "120.000đ", when: "Hôm qua", icon: "car" as const },
  ],
  aiInsights: [
    "Chi tiêu ăn uống giảm 12% so với tháng trước.",
    "Mua sắm tại Farm Fresh giúp tiết kiệm ~680.000đ.",
    "Tiền điện tăng 18% so với tháng trước.",
  ],
};

export const HEALTH_MEMBERS = [
  { id: "all", name: "Cả nhà", selected: true },
  { id: "hung", name: "Anh Hùng" },
  { id: "lan", name: "Chị Lan" },
  { id: "minh", name: "Bé Minh" },
  { id: "an", name: "Bé An" },
];

export const HEALTH_METRICS = [
  { label: "Nhịp tim", value: "72 bpm", status: "Bình thường", icon: "heart" as const, color: "#EF4444" },
  { label: "Giấc ngủ", value: "7h 32m", status: "Tốt", icon: "moon" as const, color: "#7C3AED" },
  { label: "Bước chân", value: "8.245", status: "Tốt", icon: "footsteps" as const, color: "#2563EB" },
  { label: "Năng lượng", value: "85/100", status: "Tốt", icon: "energy" as const, color: "#F97316" },
];

export const HEALTH_QUICK: { label: string; icon: StosIconName; bg: string; color: string }[] = [
  { label: "Đặt lịch khám", icon: "medical-bag", bg: "#DBEAFE", color: "#2563EB" },
  { label: "Tư vấn bác sĩ", icon: "stethoscope", bg: "#D1FAE5", color: "#059669" },
  { label: "Nhắc uống thuốc", icon: "pills", bg: "#EDE9FE", color: "#7C3AED" },
  { label: "Hồ sơ sức khỏe", icon: "folder", bg: "#FFEDD5", color: "#EA580C" },
  { label: "Bảo hiểm", icon: "insurance", bg: "#DBEAFE", color: "#1D4ED8" },
];

export const SECURITY_QUICK: { label: string; sub: string; icon: StosIconName; bg: string; color: string; action: string }[] = [
  { label: "Gọi bảo an", sub: "Nội khu", icon: "call", bg: "#DBEAFE", color: "#2563EB", action: "grab" },
  { label: "Báo sự cố", sub: "Khẩn cấp", icon: "sos", bg: "#D1FAE5", color: "#059669", action: "incident" },
  { label: "Chat bảo an", sub: "Trực tuyến", icon: "chat", bg: "#EDE9FE", color: "#7C3AED", action: "grab" },
  { label: "Hệ thống", sub: "An toàn", icon: "shield-badge", bg: "#FFEDD5", color: "#EA580C", action: "status" },
  { label: "Mở khóa", sub: "Từ xa", icon: "id-card", bg: "#FCE7F3", color: "#DB2777", action: "unlock" },
];

export const SECURITY_SERVICES = [
  { title: "An ninh nội khu", desc: "Tuần tra 24/7", icon: "tab-shield" as const, bg: "#DBEAFE", color: "#2563EB", href: "/grab/select" },
  { title: "Hỗ trợ phương tiện", desc: "Bãi xe, dẫn đường", icon: "car", bg: "#D1FAE5", color: "#059669", href: "/grab/select" },
  { title: "Hỗ trợ cư dân", desc: "Thông tin, yêu cầu", icon: "people", bg: "#FFEDD5", color: "#EA580C", href: "/grab/select" },
  { title: "Quản lý ra vào", desc: "Khách, phương tiện", icon: "id-card", bg: "#EDE9FE", color: "#7C3AED", href: "/guests/index" },
  { title: "Hỗ trợ khẩn cấp", desc: "Y tế, PCCC", icon: "medkit", bg: "#FCE7F3", color: "#DB2777", href: "/sos" },
  { title: "Nhóm cộng đồng", desc: "Thông báo BQL", icon: "people", bg: "#DBEAFE", color: "#1D4ED8", href: "/community-feed" },
];

export const SECURITY_ACTIVITY = [
  { title: "Hệ thống an ninh hoạt động ổn định", sub: "Khu A1 · 08:30 · 20/05/2024", icon: "check-circle" as const, color: "#22C55E" },
  { title: "Hỗ trợ phương tiện tại hầm B1", sub: "Bảo an · 07:45 · 20/05/2024", icon: "car", color: "#2563EB" },
  { title: "Kiểm tra định kỳ hệ thống PCCC", sub: "Bảo an · 06:15 · 20/05/2024", icon: "fire", color: "#F97316" },
];
