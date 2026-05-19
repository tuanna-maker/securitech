import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { brand } from "./brand";

export type GrabServiceMeta = {
  icon: ComponentProps<typeof Ionicons>["name"];
  subtitle: string;
  bg: string;
  iconColor: string;
};

/** Catalog UI — khớp mockup STOS Life (icon màu + mô tả ngắn). */
export const GRAB_SERVICE_META: Record<string, GrabServiceMeta> = {
  open_door: {
    icon: "enter-outline",
    subtitle: "Mở cửa căn hộ, sảnh hoặc thang máy",
    bg: "#DBEAFE",
    iconColor: "#2563EB",
  },
  receive_parcel: {
    icon: "cube-outline",
    subtitle: "Nhận hộ bưu phẩm, đồ giao tận cửa",
    bg: "#D1FAE5",
    iconColor: "#059669",
  },
  carry_items: {
    icon: "bag-handle-outline",
    subtitle: "Xách vali, đồ nặng lên/xuống",
    bg: "#E0E7FF",
    iconColor: "#4F46E5",
  },
  urgent_assist: {
    icon: "flash-outline",
    subtitle: "Hỗ trợ khẩn — ưu tiên cao",
    bg: "#FEE2E2",
    iconColor: brand.grab,
  },
  grab: { icon: "car-outline", subtitle: "Di chuyển / Grab nội khu", bg: "#FFEDD5", iconColor: brand.orange },
  cleaning: { icon: "sparkles-outline", subtitle: "Dọn dẹp, vệ sinh", bg: "#DCFCE7", iconColor: "#16A34A" },
  repair: { icon: "construct-outline", subtitle: "Sửa chữa, kỹ thuật", bg: "#FEF3C7", iconColor: "#D97706" },
};

export function getGrabServiceMeta(code: string): GrabServiceMeta {
  return (
    GRAB_SERVICE_META[code] ?? {
      icon: "shield-outline",
      subtitle: "Anh bảo vệ sẽ hỗ trợ bạn",
      bg: "#E2E8F0",
      iconColor: brand.navy,
    }
  );
}
