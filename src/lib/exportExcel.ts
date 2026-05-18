import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  buildingReports,
  monthlyTrend,
  incidentsByType,
  incidentsBySeverity,
  topStaff,
  staffByPosition,
  staffTurnover,
  customers,
  operationsKpis,
} from "@/data/mockReports";

const BRAND_TEAL = "FF0D9488";
const BRAND_DARK = "FF0F172A";
const HEADER_FILL: ExcelJS.FillPattern = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_TEAL } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const TITLE_FONT: Partial<ExcelJS.Font> = { bold: true, size: 14, color: { argb: BRAND_DARK } };
const SECTION_FONT: Partial<ExcelJS.Font> = { bold: true, size: 12, color: { argb: BRAND_TEAL } };

function applyHeaderRow(ws: ExcelJS.Worksheet, row: number, colCount: number) {
  const r = ws.getRow(row);
  for (let c = 1; c <= colCount; c++) {
    const cell = r.getCell(c);
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF999999" } },
    };
  }
  r.height = 24;
}

function autoWidth(ws: ExcelJS.Worksheet) {
  ws.columns.forEach((col) => {
    let max = 12;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? "").length + 2;
      if (len > max) max = len;
    });
    col.width = Math.min(max, 35);
  });
}

function addOverviewSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Tổng quan");

  ws.mergeCells("A1:F1");
  const title = ws.getCell("A1");
  title.value = "BÁO CÁO TỔNG HỢP - STOS Command Center";
  title.font = TITLE_FONT;
  title.alignment = { horizontal: "center" };
  ws.getRow(1).height = 30;

  ws.getCell("A2").value = `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`;
  ws.getCell("A2").font = { italic: true, size: 10, color: { argb: "FF666666" } };

  let row = 4;
  ws.getCell(`A${row}`).value = "CHỈ SỐ TỔNG HỢP";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;

  const kpis = [
    ["Tổng doanh thu", "4.2 tỷ VNĐ", "↑ 7.6%"],
    ["SLA trung bình", "97.4%", "↑ 0.6%"],
    ["Tổng sự cố", "28", "↓ 12.5%"],
    ["Nhân sự", "184 người", "+4"],
    ["Khách hàng", "44", "+2 KH mới"],
    ["Ca trực hoàn thành", "98.1%", "↑ 0.8%"],
  ];
  ws.addRow(["Chỉ số", "Giá trị", "Biến động"]);
  applyHeaderRow(ws, row, 3);
  row++;
  kpis.forEach((k) => { ws.addRow(k); row++; });

  row++;
  ws.getCell(`A${row}`).value = "XU HƯỚNG THEO THÁNG";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tháng", "Doanh thu (tỷ)", "Sự cố", "SLA (%)", "Nhân sự", "Chi phí (tỷ)", "Khách hàng"]);
  applyHeaderRow(ws, row, 7);
  row++;
  monthlyTrend.forEach((m) => {
    ws.addRow([m.month, m.revenue, m.incidents, m.sla, m.staff, m.cost, m.customers]);
    row++;
  });

  autoWidth(ws);
}

function addOperationsSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Vận hành");

  ws.mergeCells("A1:E1");
  ws.getCell("A1").value = "BÁO CÁO VẬN HÀNH";
  ws.getCell("A1").font = TITLE_FONT;
  ws.getCell("A1").alignment = { horizontal: "center" };

  let row = 3;
  ws.getCell(`A${row}`).value = "CHỈ SỐ VẬN HÀNH";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Chỉ số", "Giá trị", "Biến động"]);
  applyHeaderRow(ws, row, 3);
  row++;
  operationsKpis.forEach((k) => { ws.addRow([k.label, k.value, k.delta]); row++; });

  row++;
  ws.getCell(`A${row}`).value = "SLA & TUẦN TRA THEO TÒA NHÀ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tòa nhà", "Khu vực", "SLA (%)", "Tuần tra (%)", "Sự cố", "Xu hướng"]);
  applyHeaderRow(ws, row, 6);
  row++;
  buildingReports.forEach((b) => {
    ws.addRow([b.name, b.region, b.sla, b.patrol, b.incidents, b.trend === "up" ? "▲ Tăng" : "▼ Giảm"]);
    const r = ws.getRow(row);
    const slaCell = r.getCell(3);
    if (b.sla >= 97) slaCell.font = { color: { argb: "FF22C55E" } };
    else if (b.sla >= 95) slaCell.font = { color: { argb: "FFF59E0B" } };
    else slaCell.font = { color: { argb: "FFEF4444" } };
    row++;
  });

  autoWidth(ws);
}

function addFinanceSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Tài chính");

  ws.mergeCells("A1:E1");
  ws.getCell("A1").value = "BÁO CÁO TÀI CHÍNH";
  ws.getCell("A1").font = TITLE_FONT;
  ws.getCell("A1").alignment = { horizontal: "center" };

  let row = 3;
  ws.getCell(`A${row}`).value = "DOANH THU THEO TÒA NHÀ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tòa nhà", "Khu vực", "Doanh thu (triệu)", "Nhân sự", "SLA (%)"]);
  applyHeaderRow(ws, row, 5);
  row++;
  [...buildingReports].sort((a, b) => b.revenue - a.revenue).forEach((b) => {
    ws.addRow([b.name, b.region, b.revenue, b.staff, b.sla]);
    row++;
  });

  row++;
  ws.getCell(`A${row}`).value = "BẢNG TỔNG HỢP LÃI/LỖ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Khoản mục", "Số tiền"]);
  applyHeaderRow(ws, row, 2);
  row++;
  const pnl = [
    ["Doanh thu hợp đồng", "3.8 tỷ"],
    ["Doanh thu dịch vụ phụ", "0.4 tỷ"],
    ["Chi phí lương", "-2.1 tỷ"],
    ["Chi phí vận hành", "-0.5 tỷ"],
    ["Chi phí quản lý", "-0.3 tỷ"],
    ["Lợi nhuận ròng", "1.3 tỷ"],
  ];
  pnl.forEach((p) => {
    ws.addRow(p);
    if (p[0] === "Lợi nhuận ròng") {
      const r = ws.getRow(row);
      r.font = { bold: true, color: { argb: BRAND_TEAL } };
    }
    row++;
  });

  row++;
  ws.getCell(`A${row}`).value = "XU HƯỚNG DOANH THU & CHI PHÍ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tháng", "Doanh thu (tỷ)", "Chi phí (tỷ)"]);
  applyHeaderRow(ws, row, 3);
  row++;
  monthlyTrend.forEach((m) => { ws.addRow([m.month, m.revenue, m.cost]); row++; });

  autoWidth(ws);
}

function addStaffSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Nhân sự");

  ws.mergeCells("A1:F1");
  ws.getCell("A1").value = "BÁO CÁO NHÂN SỰ";
  ws.getCell("A1").font = TITLE_FONT;
  ws.getCell("A1").alignment = { horizontal: "center" };

  let row = 3;
  ws.getCell(`A${row}`).value = "TOP NHÂN VIÊN XUẤT SẮC";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["#", "Nhân viên", "Tòa nhà", "Điểm", "Ca trực", "Sự cố", "Đúng giờ (%)"]);
  applyHeaderRow(ws, row, 7);
  row++;
  topStaff.forEach((s, i) => {
    ws.addRow([i + 1, s.name, s.building, s.score, s.shifts, s.incidents, s.ontime]);
    row++;
  });

  row++;
  ws.getCell(`A${row}`).value = "PHÂN BỔ THEO CHỨC VỤ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Chức vụ", "Số lượng", "Tỷ lệ (%)"]);
  applyHeaderRow(ws, row, 3);
  row++;
  staffByPosition.forEach((p) => { ws.addRow([p.position, p.count, p.pct]); row++; });

  row++;
  ws.getCell(`A${row}`).value = "BIẾN ĐỘNG NHÂN SỰ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tháng", "Tuyển mới", "Nghỉ việc", "Net"]);
  applyHeaderRow(ws, row, 4);
  row++;
  staffTurnover.forEach((t) => { ws.addRow([t.month, t.in, t.out, t.in - t.out]); row++; });

  row++;
  ws.getCell(`A${row}`).value = "NHÂN SỰ THEO TÒA NHÀ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tòa nhà", "Khu vực", "Số nhân sự"]);
  applyHeaderRow(ws, row, 3);
  row++;
  [...buildingReports].sort((a, b) => b.staff - a.staff).forEach((b) => {
    ws.addRow([b.name, b.region, b.staff]);
    row++;
  });

  autoWidth(ws);
}

function addIncidentsSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Sự cố");

  ws.mergeCells("A1:E1");
  ws.getCell("A1").value = "BÁO CÁO SỰ CỐ";
  ws.getCell("A1").font = TITLE_FONT;
  ws.getCell("A1").alignment = { horizontal: "center" };

  let row = 3;
  ws.getCell(`A${row}`).value = "PHÂN LOẠI THEO MỨC ĐỘ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Mức độ", "Số lượng"]);
  applyHeaderRow(ws, row, 2);
  row++;
  incidentsBySeverity.forEach((s) => { ws.addRow([s.level, s.count]); row++; });

  row++;
  ws.getCell(`A${row}`).value = "PHÂN LOẠI THEO DANH MỤC";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Loại sự cố", "Tổng", "Đã xử lý", "TB phản hồi (phút)", "Tỷ lệ (%)"]);
  applyHeaderRow(ws, row, 5);
  row++;
  incidentsByType.forEach((item) => {
    ws.addRow([item.type, item.count, item.resolved, item.avgTime, item.pct]);
    row++;
  });

  row++;
  ws.getCell(`A${row}`).value = "SỰ CỐ THEO TÒA NHÀ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tòa nhà", "Khu vực", "Số sự cố", "SLA (%)"]);
  applyHeaderRow(ws, row, 4);
  row++;
  [...buildingReports].sort((a, b) => b.incidents - a.incidents).forEach((b) => {
    ws.addRow([b.name, b.region, b.incidents, b.sla]);
    row++;
  });

  row++;
  ws.getCell(`A${row}`).value = "XU HƯỚNG SỰ CỐ";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Tháng", "Số sự cố"]);
  applyHeaderRow(ws, row, 2);
  row++;
  monthlyTrend.forEach((m) => { ws.addRow([m.month, m.incidents]); row++; });

  autoWidth(ws);
}

function addCustomersSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Khách hàng");

  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = "BÁO CÁO KHÁCH HÀNG";
  ws.getCell("A1").font = TITLE_FONT;
  ws.getCell("A1").alignment = { horizontal: "center" };

  let row = 3;
  ws.getCell(`A${row}`).value = "DANH SÁCH KHÁCH HÀNG";
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.addRow(["Khách hàng", "Loại", "Số tòa nhà", "Trạng thái HĐ", "Doanh thu (triệu)", "Từ năm", "CSAT"]);
  applyHeaderRow(ws, row, 7);
  row++;
  customers.forEach((c) => {
    ws.addRow([c.name, c.type, c.buildings, c.contract, c.revenue, c.since, c.satisfaction]);
    const r = ws.getRow(row);
    if (c.contract === "Cảnh báo") r.getCell(4).font = { color: { argb: "FFEF4444" }, bold: true };
    else if (c.contract === "Sắp hết hạn") r.getCell(4).font = { color: { argb: "FFF59E0B" }, bold: true };
    row++;
  });

  autoWidth(ws);
}

export async function exportReportExcel(tabId?: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "STOS Command Center";
  wb.created = new Date();

  if (!tabId || tabId === "overview") addOverviewSheet(wb);
  if (!tabId || tabId === "operations") addOperationsSheet(wb);
  if (!tabId || tabId === "finance") addFinanceSheet(wb);
  if (!tabId || tabId === "staff") addStaffSheet(wb);
  if (!tabId || tabId === "incidents") addIncidentsSheet(wb);
  if (!tabId || tabId === "customers") addCustomersSheet(wb);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const date = new Date().toISOString().slice(0, 10);
  const suffix = tabId && tabId !== "overview" ? `_${tabId}` : "";
  saveAs(blob, `STOS_BaoCao${suffix}_${date}.xlsx`);
}
