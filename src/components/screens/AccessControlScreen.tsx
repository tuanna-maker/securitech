import { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useAccessLogs, useAccessStats, useCheckoutVisitor } from "@/features/access";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "visitors", label: "Khách ra/vào" },
  { id: "stats", label: "Thống kê" },
];

const visitorTypeConfig: Record<string, { label: string; color: "teal" | "info" | "amber" | "purple" }> = {
  guest: { label: "Khách", color: "teal" },
  shipper: { label: "Giao hàng", color: "info" },
  contractor: { label: "Nhà thầu", color: "amber" },
  vip: { label: "VIP", color: "purple" },
};

export default function AccessControlScreen() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: logs, isLoading } = useAccessLogs({ visitor_type: typeFilter });
  const stats = useAccessStats();
  const checkout = useCheckoutVisitor();

  const s = stats.data;

  const handleCheckout = (id: string) => {
    checkout.mutate(id, {
      onSuccess: () => toast.success("Đã check-out"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 mb-2">
        <KpiCard label="Khách hôm nay" value={s?.todayTotal ?? 0} delta="tổng lượt vào" color="info" />
        <KpiCard label="Đang ở trong" value={s?.currentlyInside ?? 0} delta="chưa check-out" color="teal" />
        <KpiCard label="Đã rời đi" value={s?.exited ?? 0} delta="đã check-out" color="amber" />
      </div>

      <div className="flex gap-[1px] bg-bg2 rounded-md p-[1.5px] mb-2 border border-border">
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1 rounded-[3px] text-center cursor-pointer text-[10px] transition-all
              ${activeTab === tab.id ? "bg-bg4 text-t1 font-semibold shadow-sm" : "text-t3 hover:text-t2"}`}>
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === "visitors" && (
        <>
          <div className="flex gap-1 mb-2 flex-wrap">
            {["all", "guest", "shipper", "contractor", "vip"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-2 py-[3px] rounded text-[9px] cursor-pointer transition-all border
                  ${typeFilter === t ? "bg-bg3 text-t1 border-border-strong font-semibold" : "bg-transparent text-t4 border-border hover:text-t2"}`}>
                {t === "all" ? "Tất cả" : visitorTypeConfig[t]?.label ?? t}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-12 text-t4 text-sm">Chưa có lượt ra/vào nào</div>
          ) : (
            <CardPanel title="Nhật ký ra/vào">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-[8px] text-t4 uppercase tracking-wider">
                      <th className="text-left py-1 px-2">Khách</th>
                      <th className="text-left py-1 px-2">Loại</th>
                      <th className="text-left py-1 px-2">Tòa nhà</th>
                      <th className="text-left py-1 px-2">Mục đích</th>
                      <th className="text-left py-1 px-2">Người tiếp</th>
                      <th className="text-left py-1 px-2">Vào</th>
                      <th className="text-left py-1 px-2">Ra</th>
                      <th className="text-left py-1 px-2">Biển số</th>
                      <th className="text-left py-1 px-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const cfg = visitorTypeConfig[log.visitor_type] ?? visitorTypeConfig.guest;
                      const isInside = !log.checked_out_at;
                      return (
                        <tr key={log.id} className="border-t border-border/30 hover:bg-bg2/50">
                          <td className="py-1.5 px-2 font-medium">{log.visitor_name}</td>
                          <td className="py-1.5 px-2"><Chip color={cfg.color}>{cfg.label}</Chip></td>
                          <td className="py-1.5 px-2 text-t3">{log.building_name ?? "—"}</td>
                          <td className="py-1.5 px-2 text-t3">{log.purpose ?? "—"}</td>
                          <td className="py-1.5 px-2 text-t3">{log.host_resident ?? "—"}</td>
                          <td className="py-1.5 px-2 font-mono text-t3">
                            {new Date(log.checked_in_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-t3">
                            {log.checked_out_at ? new Date(log.checked_out_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-t3">{log.vehicle_plate ?? "—"}</td>
                          <td className="py-1.5 px-2">
                            {isInside ? (
                              <button onClick={() => handleCheckout(log.id)}
                                disabled={checkout.isPending}
                                className="px-2 py-0.5 rounded text-[8px] bg-amber text-bg0 font-semibold hover:brightness-90 disabled:opacity-50">
                                Check-out
                              </button>
                            ) : (
                              <Chip color="teal">Đã ra</Chip>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardPanel>
          )}
        </>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-2 gap-1.5">
          <CardPanel title="Tổng kết hôm nay">
            <div className="text-center py-4">
              <div className="font-mono text-3xl font-bold text-primary">{s?.todayTotal ?? 0}</div>
              <div className="text-[10px] text-t4 mt-1">tổng lượt khách hôm nay</div>
            </div>
          </CardPanel>
          <CardPanel title="Trạng thái hiện tại">
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-t3">Đang ở trong</span>
                <span className="font-mono font-bold text-teal">{s?.currentlyInside ?? 0}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-t3">Đã rời đi</span>
                <span className="font-mono font-bold text-amber">{s?.exited ?? 0}</span>
              </div>
            </div>
          </CardPanel>
        </div>
      )}
    </div>
  );
}
