import { Loader2 } from "lucide-react";
import CardPanel from "@/components/ui/CardPanel";
import { useReportFinance } from "@/features/reports";

export default function ReportFinance() {
  const { data, isLoading } = useReportFinance();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-teal" /></div>;
  }

  const totalInvoiced = data?.totalInvoiced || 0;
  const totalPaid = data?.totalPaid || 0;
  const totalPayroll = data?.totalPayroll || 0;
  const profit = totalPaid - totalPayroll;

  return (
    <div className="space-y-3.5">
      {/* Finance summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Tổng hóa đơn", value: `${(totalInvoiced / 1000000).toFixed(1)}M`, color: "text-teal" },
          { label: "Đã thu", value: `${(totalPaid / 1000000).toFixed(1)}M`, color: "text-green" },
          { label: "Công nợ quá hạn", value: `${data?.overdueCount || 0} HD`, delta: `${((data?.overdueAmount || 0) / 1000000).toFixed(1)}M`, color: "text-danger" },
          { label: "Tổng lương", value: `${(totalPayroll / 1000000).toFixed(1)}M`, color: "text-purple" },
        ].map((k) => (
          <div key={k.label} className="bg-bg1 border border-border rounded-xl px-4 py-3">
            <div className="text-xs text-t2 uppercase tracking-wider font-semibold mb-1">{k.label}</div>
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
            {k.delta && <div className="text-[10px] text-t3">{k.delta}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Revenue by client */}
        <CardPanel title="Doanh thu theo khách hàng (triệu VNĐ)">
          <div className="mt-2 space-y-2">
            {(data?.topClients || []).length === 0 && <div className="text-xs text-t3 text-center py-4">Chưa có dữ liệu</div>}
            {(data?.topClients || []).map((c) => {
              const maxRev = Math.max(...(data?.topClients || []).map((x) => x.contract_value || 0), 1);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs text-t2 w-[130px] truncate">{c.name}</span>
                  <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                    <div className="h-full bg-teal/50 rounded flex items-center justify-end px-1.5"
                      style={{ width: `${(c.contract_value / maxRev) * 100}%` }}>
                      <span className="text-[10px] text-t1 font-semibold">{c.contract_value}M</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardPanel>

        {/* P&L Summary */}
        <CardPanel title="Bảng tổng hợp Lãi/Lỗ">
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded bg-bg2">
              <span className="text-xs text-t2">Doanh thu (đã thu)</span>
              <span className="text-sm font-bold text-teal">{(totalPaid / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded bg-bg2">
              <span className="text-xs text-t2">Chi phí lương</span>
              <span className="text-sm font-bold text-danger">-{(totalPayroll / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded bg-teal-muted border border-border-accent">
              <span className="text-xs text-t1 font-semibold">Lợi nhuận ước tính</span>
              <span className={`text-sm font-bold ${profit >= 0 ? "text-teal" : "text-danger"}`}>{(profit / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </CardPanel>
      </div>
    </div>
  );
}
