import type { LifeGradientIconName } from "../components/life/family/LifeGradientIcon";

export const FAMILY_QUICK_UI: { key: string; label: string; icon: LifeGradientIconName }[] = [
  { key: "members", label: "Thành viên", icon: "members" },
  { key: "calendar", label: "Lịch gia\nđình", icon: "calendar" },
  { key: "memories", label: "Kỷ niệm", icon: "memories" },
  { key: "settings", label: "Cài đặt", icon: "settings" },
];

export const FAMILY_MGMT_UI = [
  {
    key: "spending",
    title: "Chi tiêu gia đình",
    icon: "wallet" as const,
    lines: ["Tổng chi tháng 5", "18.450.000đ", "▼ 8,2% so với tháng 4"],
  },
  {
    key: "kids",
    title: "Đồng hành cùng con",
    icon: "child" as const,
    bg: "#EDE9FE",
    color: "#7C3AED",
    children: [
      {
        name: "Bé Minh (7 tuổi)",
        detail: "8 lịch hôm nay",
        dot: "#7C3AED",
        initial: "M",
        avatarKey: "minh" as const,
      },
      {
        name: "Bé An (4 tuổi)",
        detail: "3 lịch hôm nay",
        dot: "#22C55E",
        initial: "A",
        avatarUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces",
      },
    ],
  },
  {
    key: "fridge",
    title: "Thực phẩm & Tủ lạnh",
    icon: "food" as const,
    alert: "2 thực phẩm sắp hết hạn",
    color: "#EA580C",
    thumbs: [
      { name: "Dâu tây", assetKey: "strawberry" as const },
      { name: "Sữa", assetKey: "milk" as const },
      { name: "Cá hồi", assetKey: "salmon" as const },
    ],
  },
  {
    key: "health",
    title: "Sức khỏe gia đình",
    icon: "health" as const,
    reminders: [
      { text: "Mẹ cần uống thuốc (20:00)", color: "#DB2777", icon: "pills" as const },
      { text: "Bố có lịch khám (10:00 - 20/05)", color: "#7C3AED", icon: "stethoscope" as const },
    ],
  },
];

export const FAMILY_SERVICES_UI: { key: string; label: string; icon: LifeGradientIconName }[] = [
  { key: "travel", label: "Cả nhà du lịch", icon: "plane" },
  { key: "home", label: "Dịch vụ tại nhà", icon: "home" },
  { key: "car", label: "Đặt xe gia đình", icon: "car" },
  { key: "shop", label: "Mua sắm hộ", icon: "cart" },
  { key: "vip", label: "Gói dịch vụ ưu đãi", icon: "crown" },
];

export const FAMILY_MOMENTS_UI = [
  { id: "1", title: "Đà Nẵng – Hội An", date: "20/05/2024", momentIndex: 0 },
  { id: "2", title: "Sinh nhật bé An", date: "12/08/2024", momentIndex: 1 },
  { id: "3", title: "Bữa cơm cuối tuần", date: "05/05/2024", momentIndex: 2 },
  { id: "4", title: "Ngày của mẹ", date: "10/08/2024", momentIndex: 3 },
  { id: "5", title: "Bé Minh học bài", date: "28/04/2024", momentIndex: 4 },
];

export const AI_HINTS_UI: { text: string; icon: LifeGradientIconName }[] = [
  { text: "Bé Minh có lớp Piano lúc 18:00", icon: "calendar" },
  { text: "2 thực phẩm sắp hết hạn", icon: "food" },
  { text: "Mẹ cần uống thuốc lúc 20:00", icon: "health" },
];
