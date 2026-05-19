import type { StosIconName } from "@stos/mobile-shared";

/** Demo data khi DB chưa có lịch / tuần tra */

export const DEMO_SCHEDULE = [
  {
    id: "1",
    shift_date: new Date().toISOString().slice(0, 10),
    shift_type: "Ca sáng",
    start_time: "06:00:00",
    end_time: "14:00:00",
    location: "Sảnh chính · Tòa A",
    handover: "Bàn giao: anh Tuấn",
    status: "today" as const,
  },
  {
    id: "2",
    shift_date: addDays(1),
    shift_type: "Ca sáng",
    start_time: "06:00:00",
    end_time: "14:00:00",
    location: "Sảnh chính · Tòa A",
    handover: "Bàn giao: chị Hương",
    status: "upcoming" as const,
  },
  {
    id: "3",
    shift_date: addDays(2),
    shift_type: "NGHỈ",
    start_time: null,
    end_time: null,
    location: null,
    handover: null,
    status: "off" as const,
  },
  {
    id: "4",
    shift_date: addDays(3),
    shift_type: "Ca chiều",
    start_time: "14:00:00",
    end_time: "22:00:00",
    location: "Cổng phụ · Tòa B",
    handover: null,
    status: "upcoming" as const,
  },
];

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const PATROL_CHECKPOINTS = [
  { name: "Sảnh chính", done: true, time: "06:18" },
  { name: "Hầm xe B1", done: true, time: "06:42" },
  { name: "Thang máy", done: false, time: null },
  { name: "Tầng 5", done: false, time: null },
  { name: "Sân thượng", done: false, time: null },
];

export const INCIDENT_CATEGORIES: { key: string; label: string; icon: StosIconName; bg: string; color: string }[] = [
  { key: "security", label: "An ninh", icon: "incident", bg: "#FEE2E2", color: "#FF3B30" },
  { key: "fire", label: "Cháy nổ", icon: "fire", bg: "#FFEDD5", color: "#FF9500" },
  { key: "technical", label: "Kỹ thuật", icon: "construct", bg: "#DBEAFE", color: "#007AFF" },
  { key: "property", label: "Thất lạc", icon: "property-box", bg: "#FEF9C3", color: "#FFCC00" },
  { key: "traffic", label: "Giao thông", icon: "traffic", bg: "#EDE9FE", color: "#5856D6" },
  { key: "other", label: "Khác", icon: "more-dots", bg: "#334155", color: "#94A3B8" },
];
