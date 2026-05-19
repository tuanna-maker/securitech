import type { StosIconName } from "@stos/mobile-shared";

export type HubItem = {
  key: string;
  label: string;
  subtitle?: string;
  icon: StosIconName;
  bg: string;
  iconColor: string;
  href: string;
};

export const QUICK_REQUESTS: HubItem[] = [
  { key: "sos", label: "Khẩn cấp", icon: "sos", bg: "#FEE2E2", iconColor: "#DC2626", href: "/sos" },
  { key: "fire", label: "Báo cháy", icon: "fire", bg: "#FFEDD5", iconColor: "#EA580C", href: "/incidents/new" },
  { key: "stranger", label: "Người lạ", icon: "stranger", bg: "#EDE9FE", iconColor: "#7C3AED", href: "/incidents/new" },
  { key: "patrol", label: "Tuần tra", icon: "car", bg: "#DBEAFE", iconColor: "#2563EB", href: "/grab/select" },
  { key: "parcel", label: "Nhận hàng", icon: "parcel", bg: "#FEF9C3", iconColor: "#CA8A04", href: "/grab/select" },
  { key: "more", label: "Khác", icon: "more-dots", bg: "#F1F5F9", iconColor: "#64748B", href: "/grab/select" },
];

export const SECURITY_FEATURES: HubItem[] = [
  { key: "cam", label: "Camera & an ninh", subtitle: "Xem camera, cảnh báo", icon: "videocam", bg: "#DBEAFE", iconColor: "#2563EB", href: "/incidents/new" },
  { key: "history", label: "Lịch sử sự kiện", subtitle: "Nhật ký an ninh", icon: "history", bg: "#E0E7FF", iconColor: "#4F46E5", href: "/(tabs)/history" },
  { key: "access", label: "Ra vào tòa nhà", subtitle: "Khách, thẻ, QR", icon: "id-card", bg: "#DBEAFE", iconColor: "#1D4ED8", href: "/guests/index" },
  { key: "notify", label: "Thông báo an ninh", subtitle: "Tin từ BQL", icon: "notifications", bg: "#FFEDD5", iconColor: "#EA580C", href: "/(tabs)/community" },
  { key: "zone", label: "Khu vực nguy hiểm", subtitle: "Bản đồ, cảnh báo", icon: "map-pin", bg: "#EDE9FE", iconColor: "#7C3AED", href: "/incidents/new" },
  { key: "hotline", label: "Liên hệ khẩn", subtitle: "Hotline 24/7", icon: "call", bg: "#D1FAE5", iconColor: "#059669", href: "/sos" },
  { key: "guide", label: "Hướng dẫn an toàn", subtitle: "Quy trình, SOS", icon: "shield-badge", bg: "#DBEAFE", iconColor: "#2563EB", href: "/(onboarding)" },
  { key: "feedback", label: "Phản ánh an ninh", subtitle: "Góp ý, báo cáo", icon: "feedback", bg: "#FFEDD5", iconColor: "#F97316", href: "/incidents/new" },
];
