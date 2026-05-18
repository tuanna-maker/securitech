import { db } from "@/lib/db";

export async function fetchReportOverview() {
  const [buildingsRes, incidentsRes, staffRes, clientsRes, shiftsRes] = await Promise.all([
    db.from("buildings").select("id, name, sla_percent, staff_total, incidents_today, status"),
    db.from("incidents").select("id, type, severity, status, created_at"),
    db.from("staff_members").select("id, status"),
    db.from("clients").select("id, status, contract_value, satisfaction"),
    db.from("shift_schedules").select("id, status"),
  ]);

  const buildings = buildingsRes.data || [];
  const incidents = incidentsRes.data || [];
  const staff = staffRes.data || [];
  const clients = clientsRes.data || [];
  const shifts = shiftsRes.data || [];

  const activeClients = clients.filter((c) => c.status === "active");
  const totalRevenue = activeClients.reduce((s, c) => s + (c.contract_value || 0), 0);
  const avgSla = buildings.length > 0 ? buildings.reduce((s, b) => s + Number(b.sla_percent), 0) / buildings.length : 0;
  const completedShifts = shifts.filter((s) => s.status === "completed").length;
  const shiftRate = shifts.length > 0 ? (completedShifts / shifts.length) * 100 : 0;

  // Incident by type
  const incidentsByType: Record<string, number> = {};
  incidents.forEach((i) => {
    incidentsByType[i.type] = (incidentsByType[i.type] || 0) + 1;
  });
  const incidentTypeList = Object.entries(incidentsByType)
    .map(([type, count]) => ({ type, count, pct: incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRevenue: (totalRevenue / 1000).toFixed(1), // convert to tỷ
    avgSla: avgSla.toFixed(1),
    totalIncidents: incidents.length,
    totalStaff: staff.length,
    totalClients: clients.length,
    newClients: clients.filter((c) => c.status === "prospect").length,
    shiftRate: shiftRate.toFixed(1),
    buildings: buildings.slice(0, 6),
    incidentsByType: incidentTypeList,
  };
}

export async function fetchReportFinance() {
  const [invoicesRes, payrollRes, clientsRes] = await Promise.all([
    db.from("invoices").select("id, amount, total, status, due_date, paid_at"),
    db.from("payroll_records").select("id, net_pay, base_salary, bonus, deductions, status"),
    db.from("clients").select("id, name, contract_value, status").eq("status", "active"),
  ]);

  const invoices = invoicesRes.data || [];
  const payroll = payrollRes.data || [];
  const clients = clientsRes.data || [];

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status !== "paid" && i.due_date && new Date(i.due_date) < new Date());
  const totalPayroll = payroll.reduce((s, p) => s + p.net_pay, 0);

  return {
    totalInvoiced,
    totalPaid,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((s, i) => s + i.total, 0),
    totalPayroll,
    topClients: clients.sort((a, b) => b.contract_value - a.contract_value).slice(0, 8),
  };
}

export async function fetchReportCustomers() {
  const { data: clients = [] } = await db
    .from("clients")
    .select("id, name, type, status, contract_value, contract_status, satisfaction, guards_count, created_at");

  const active = clients.filter((c) => c.status === "active");
  const avgSat = active.filter((c) => c.satisfaction > 0).length > 0
    ? active.filter((c) => c.satisfaction > 0).reduce((s, c) => s + c.satisfaction, 0) / active.filter((c) => c.satisfaction > 0).length
    : 0;

  const byType: Record<string, number> = {};
  clients.forEach((c) => {
    const t = c.type || "other";
    byType[t] = (byType[t] || 0) + 1;
  });

  return {
    total: clients.length,
    retentionRate: active.length > 0 ? ((active.length / clients.length) * 100).toFixed(1) : "0",
    avgSatisfaction: avgSat.toFixed(1),
    expiring: clients.filter((c) => c.contract_status === "expiring").length,
    clients,
    byType: Object.entries(byType).map(([type, count]) => ({
      type: type === "bql" ? "Ban quản lý" : type === "owner" ? "Chủ đầu tư" : type,
      count,
      pct: Math.round((count / clients.length) * 100),
    })),
  };
}
