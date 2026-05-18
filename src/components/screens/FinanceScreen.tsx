import { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useInvoices, usePayrollRecords, useFinanceStats } from "@/features/finance";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "payroll", label: "Bảng lương" },
  { id: "invoice", label: "Hóa đơn" },
];

const invoiceStatusConfig: Record<string, { label: string; color: "teal" | "danger" | "amber" | "info" }> = {
  paid: { label: "Đã thanh toán", color: "teal" },
  overdue: { label: "Quá hạn", color: "danger" },
  draft: { label: "Nháp", color: "info" },
  sent: { label: "Đã gửi", color: "amber" },
};

function formatVND(amount: number) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}M`;
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoices();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollRecords();

  const invoices = invoiceData?.data || [];
  const payrollRecords = payrollData?.data || [];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3.5">
        <KpiCard label="Tổng doanh thu" value={statsLoading ? "—" : formatVND(stats?.totalRevenue || 0)} delta="Đã thanh toán" deltaType="up" color="teal" />
        <KpiCard label="Quỹ lương" value={statsLoading ? "—" : formatVND(stats?.totalPayroll || 0)} color="info" />
        <KpiCard label="Biên lợi nhuận" value={statsLoading ? "—" : `${stats?.margin || 0}%`} deltaType="up" color="green" />
        <KpiCard label="Công nợ quá hạn" value={statsLoading ? "—" : `${stats?.overdueCount || 0}`} delta={stats ? formatVND(stats.overdueAmount) : "—"} deltaType="dn" color="amber" />
      </div>

      <div className="flex gap-[1px] bg-bg2 rounded-lg p-[3px] mb-[13px]">
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-md text-center cursor-pointer text-xs transition-all
              ${activeTab === tab.id ? "bg-bg4 text-t1 font-medium" : "text-t2 hover:text-t1"}`}>
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <CardPanel title="Hóa đơn gần đây">
            {invoicesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-t3 text-xs">Chưa có hóa đơn</div>
            ) : (
              <div className="space-y-1.5 mt-2">
                {invoices.slice(0, 6).map((inv) => {
                  const sc = invoiceStatusConfig[inv.status] || invoiceStatusConfig.draft;
                  return (
                    <div key={inv.id} className="flex items-center justify-between py-2 px-2 rounded-lg bg-bg2">
                      <div>
                        <div className="text-[12px] font-medium">{(inv as any).clients?.name || inv.invoice_number}</div>
                        <div className="text-[10px] text-t3 font-mono">{inv.invoice_number}</div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-mono text-[12px] text-teal">{formatVND(Number(inv.total))}</span>
                        <Chip color={sc.color}>{sc.label}</Chip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardPanel>

          <CardPanel title="Bảng lương gần đây">
            {payrollLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
            ) : payrollRecords.length === 0 ? (
              <div className="text-center py-8 text-t3 text-xs">Chưa có dữ liệu lương</div>
            ) : (
              <div className="space-y-1.5 mt-2">
                {payrollRecords.slice(0, 6).map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between py-2 px-2 rounded-lg bg-bg2">
                    <div>
                      <div className="text-[12px] font-medium">{(pr as any).employees?.full_name || "—"}</div>
                      <div className="text-[10px] text-t3">{(pr as any).employees?.position || "—"} · {pr.period}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[12px] text-teal">{formatVND(Number(pr.net_pay))}</span>
                      <div className="text-[10px] text-t3">{pr.status === "paid" ? "Đã trả" : pr.status === "draft" ? "Nháp" : pr.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardPanel>
        </div>
      )}

      {activeTab === "invoice" && (
        <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-[15px] py-3 border-b border-border">
            <div className="text-[12.5px] font-semibold">Tất cả hóa đơn</div>
          </div>
          {invoicesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg2">
                  {["Khách hàng", "Số HĐ", "Giá trị", "Hạn thanh toán", "Trạng thái"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-t3 uppercase tracking-wider px-[11px] py-2 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const sc = invoiceStatusConfig[inv.status] || invoiceStatusConfig.draft;
                  return (
                    <tr key={inv.id} className="hover:bg-bg2">
                      <td className="px-[11px] py-[9px] border-b border-border text-[12.5px] font-medium">{(inv as any).clients?.name || "—"}</td>
                      <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px] text-t2">{inv.invoice_number}</td>
                      <td className="px-[11px] py-[9px] border-b border-border font-mono text-teal">{formatVND(Number(inv.total))}</td>
                      <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px]">{inv.due_date ? format(new Date(inv.due_date), "dd/MM/yyyy") : "—"}</td>
                      <td className="px-[11px] py-[9px] border-b border-border"><Chip color={sc.color}>{sc.label}</Chip></td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-t3 text-xs">Chưa có hóa đơn</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-[15px] py-3 border-b border-border">
            <div className="text-[12.5px] font-semibold">Bảng lương</div>
          </div>
          {payrollLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg2">
                  {["Nhân viên", "Kỳ lương", "Lương CB", "Tăng ca", "Thưởng", "Khấu trừ", "Thực lĩnh", "Trạng thái"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-t3 uppercase tracking-wider px-[11px] py-2 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((pr) => (
                  <tr key={pr.id} className="hover:bg-bg2">
                    <td className="px-[11px] py-[9px] border-b border-border text-[12.5px] font-medium">{(pr as any).employees?.full_name || "—"}</td>
                    <td className="px-[11px] py-[9px] border-b border-border text-[11.5px]">{pr.period}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px]">{formatVND(Number(pr.base_salary))}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px]">{formatVND(Number(pr.overtime))}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px] text-teal">{formatVND(Number(pr.bonus))}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px] text-danger">-{formatVND(Number(pr.deductions))}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-teal font-medium">{formatVND(Number(pr.net_pay))}</td>
                    <td className="px-[11px] py-[9px] border-b border-border">
                      <Chip color={pr.status === "paid" ? "teal" : "amber"}>{pr.status === "paid" ? "Đã trả" : "Nháp"}</Chip>
                    </td>
                  </tr>
                ))}
                {payrollRecords.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-6 text-t3 text-xs">Chưa có dữ liệu lương</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
