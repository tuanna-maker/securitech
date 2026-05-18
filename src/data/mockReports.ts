// Mock data for Reports module

export const buildingReports = [
  { name: "Vinhomes Grand Park", region: "TP.HCM", sla: 98.5, incidents: 2, revenue: 320, staff: 18, patrol: 96, trend: "up" as const },
  { name: "Masteri Thảo Điền", region: "TP.HCM", sla: 97.2, incidents: 4, revenue: 285, staff: 14, patrol: 92, trend: "up" as const },
  { name: "The Marq", region: "TP.HCM", sla: 99.1, incidents: 1, revenue: 410, staff: 22, patrol: 98, trend: "up" as const },
  { name: "Saigon Pearl", region: "TP.HCM", sla: 95.8, incidents: 6, revenue: 290, staff: 16, patrol: 88, trend: "dn" as const },
  { name: "Sunrise City", region: "TP.HCM", sla: 96.4, incidents: 3, revenue: 265, staff: 12, patrol: 91, trend: "up" as const },
  { name: "Landmark 81", region: "TP.HCM", sla: 99.5, incidents: 0, revenue: 520, staff: 28, patrol: 99, trend: "up" as const },
  { name: "Times City", region: "Hà Nội", sla: 94.2, incidents: 8, revenue: 310, staff: 20, patrol: 85, trend: "dn" as const },
  { name: "Royal City", region: "Hà Nội", sla: 96.8, incidents: 3, revenue: 295, staff: 16, patrol: 93, trend: "up" as const },
  { name: "Vinhomes Riverside", region: "Hà Nội", sla: 97.9, incidents: 2, revenue: 340, staff: 18, patrol: 95, trend: "up" as const },
  { name: "Midtown Phú Mỹ Hưng", region: "TP.HCM", sla: 98.0, incidents: 1, revenue: 380, staff: 20, patrol: 97, trend: "up" as const },
];

export const monthlyTrend = [
  { month: "T10", revenue: 3.2, incidents: 42, sla: 96.1, staff: 170, cost: 2.5, customers: 38 },
  { month: "T11", revenue: 3.5, incidents: 38, sla: 96.8, staff: 174, cost: 2.6, customers: 39 },
  { month: "T12", revenue: 3.8, incidents: 35, sla: 97.2, staff: 178, cost: 2.7, customers: 40 },
  { month: "T1", revenue: 3.6, incidents: 40, sla: 96.5, staff: 176, cost: 2.6, customers: 40 },
  { month: "T2", revenue: 3.9, incidents: 32, sla: 97.5, staff: 180, cost: 2.8, customers: 42 },
  { month: "T3", revenue: 4.2, incidents: 28, sla: 98.1, staff: 184, cost: 2.9, customers: 44 },
];

export const incidentsByType = [
  { type: "Xâm nhập trái phép", count: 12, pct: 18, resolved: 11, avgTime: 18 },
  { type: "Cháy nổ / Báo cháy", count: 8, pct: 12, resolved: 8, avgTime: 8 },
  { type: "Trộm cắp tài sản", count: 15, pct: 23, resolved: 12, avgTime: 35 },
  { type: "Mất trật tự", count: 10, pct: 15, resolved: 10, avgTime: 12 },
  { type: "Sự cố kỹ thuật", count: 14, pct: 21, resolved: 13, avgTime: 22 },
  { type: "Khác", count: 7, pct: 11, resolved: 7, avgTime: 15 },
];

export const incidentsBySeverity = [
  { level: "Nghiêm trọng", count: 5, color: "danger" as const },
  { level: "Cao", count: 12, color: "amber" as const },
  { level: "Trung bình", count: 28, color: "info" as const },
  { level: "Thấp", count: 21, color: "green" as const },
];

export const topStaff = [
  { name: "Nguyễn Văn Hùng", building: "Landmark 81", score: 98, shifts: 28, incidents: 0, ontime: 100 },
  { name: "Trần Minh Đức", building: "The Marq", score: 97, shifts: 26, incidents: 1, ontime: 98 },
  { name: "Lê Thanh Tùng", building: "Vinhomes GP", score: 96, shifts: 27, incidents: 1, ontime: 97 },
  { name: "Phạm Quốc Bảo", building: "Masteri TĐ", score: 95, shifts: 25, incidents: 2, ontime: 96 },
  { name: "Hoàng Anh Tuấn", building: "VH Riverside", score: 94, shifts: 26, incidents: 2, ontime: 95 },
];

export const staffByPosition = [
  { position: "Trưởng ca", count: 22, pct: 12 },
  { position: "Bảo vệ chính", count: 88, pct: 48 },
  { position: "Bảo vệ phụ", count: 44, pct: 24 },
  { position: "Giám sát khu vực", count: 10, pct: 5 },
  { position: "Nhân viên kỹ thuật", count: 12, pct: 7 },
  { position: "Quản lý vùng", count: 8, pct: 4 },
];

export const staffTurnover = [
  { month: "T10", in: 5, out: 3 },
  { month: "T11", in: 4, out: 2 },
  { month: "T12", in: 6, out: 4 },
  { month: "T1", in: 8, out: 5 },
  { month: "T2", in: 3, out: 1 },
  { month: "T3", in: 4, out: 2 },
];

export const customers = [
  { name: "BQL Vinhomes Grand Park", type: "BQL", buildings: 3, contract: "Đang HĐ", revenue: 960, since: "2022", satisfaction: 4.8 },
  { name: "Chủ đầu tư Masterise", type: "CĐT", buildings: 2, contract: "Đang HĐ", revenue: 695, since: "2021", satisfaction: 4.6 },
  { name: "BQL Landmark 81", type: "BQL", buildings: 1, contract: "Đang HĐ", revenue: 520, since: "2020", satisfaction: 4.9 },
  { name: "BQL Times City", type: "BQL", buildings: 2, contract: "Đang HĐ", revenue: 605, since: "2023", satisfaction: 4.2 },
  { name: "Chủ tòa Sunrise City", type: "CĐT", buildings: 1, contract: "Sắp hết hạn", revenue: 265, since: "2022", satisfaction: 4.5 },
  { name: "BQL Midtown PMH", type: "BQL", buildings: 1, contract: "Đang HĐ", revenue: 380, since: "2023", satisfaction: 4.7 },
  { name: "Chủ đầu tư Saigon Pearl", type: "CĐT", buildings: 1, contract: "Cảnh báo", revenue: 290, since: "2021", satisfaction: 3.8 },
  { name: "BQL Royal City", type: "BQL", buildings: 1, contract: "Đang HĐ", revenue: 295, since: "2024", satisfaction: 4.4 },
];

export const customersByType = [
  { type: "Ban Quản lý (BQL)", count: 5, pct: 63 },
  { type: "Chủ đầu tư (CĐT)", count: 3, pct: 37 },
];

export const operationsKpis = [
  { label: "Tổng ca trực hoàn thành", value: "1,248", delta: "↑ 4.2%", color: "text-teal" },
  { label: "Tuần tra đúng tuyến", value: "94.6%", delta: "↑ 1.8%", color: "text-green" },
  { label: "Check-in GPS đúng giờ", value: "96.2%", delta: "↑ 2.1%", color: "text-info" },
  { label: "Thời gian phản hồi TB", value: "4.2 phút", delta: "↓ 0.8 phút", color: "text-purple" },
  { label: "Sự cố phát hiện sớm", value: "87.5%", delta: "↑ 5.3%", color: "text-teal" },
  { label: "Tỷ lệ báo cáo đúng hạn", value: "92.8%", delta: "↑ 3.1%", color: "text-amber" },
];
