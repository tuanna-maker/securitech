import { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useEmployees, useHRStats, useCertifications, useLeaveRequests, useUpdateLeaveRequest } from "@/features/hr";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const tabs = [
  { id: "list", label: "Danh sách nhân viên" },
  { id: "cert", label: "Chứng chỉ & Pháp lý" },
  { id: "leave", label: "Nghỉ phép" },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-teal-muted", text: "text-teal" },
  probation: { bg: "bg-info-muted", text: "text-info" },
  on_leave: { bg: "bg-amber-muted", text: "text-amber" },
  terminated: { bg: "bg-danger-muted", text: "text-danger" },
};

const statusLabels: Record<string, string> = {
  active: "Đang làm",
  probation: "Thử việc",
  on_leave: "Nghỉ phép",
  terminated: "Đã nghỉ",
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase();
}

export default function HRScreen() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedEmp, setSelectedEmp] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const { data: stats, isLoading: statsLoading } = useHRStats();
  const { data: empData, isLoading: empLoading } = useEmployees({ status: statusFilter, search: search || undefined });
  const { data: certs, isLoading: certsLoading } = useCertifications();
  const { data: leaves, isLoading: leavesLoading } = useLeaveRequests({ status: "pending" });
  const updateLeave = useUpdateLeaveRequest();

  const employees = empData?.data || [];
  const selected = employees[selectedEmp];

  const handleLeaveAction = (id: string, status: "approved" | "rejected") => {
    updateLeave.mutate({ id, status, approved_at: new Date().toISOString() }, {
      onSuccess: () => toast.success(status === "approved" ? "Đã duyệt đơn nghỉ phép" : "Đã từ chối đơn nghỉ phép"),
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3.5">
        <KpiCard label="Tổng nhân viên" value={stats?.totalEmployees ?? "—"} delta={statsLoading ? "..." : `${stats?.probation ?? 0} thử việc`} color="teal" />
        <KpiCard label="Đang thử việc" value={stats?.probation ?? "—"} color="info" />
        <KpiCard label="Chứng chỉ hết hạn" value={stats?.expiringCerts ?? "—"} delta="Trong 30 ngày" deltaType="dn" color="danger" />
        <KpiCard label="Đơn xin nghỉ phép" value={stats?.pendingLeaves ?? "—"} delta="Chờ duyệt" color="amber" />
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

      {activeTab === "list" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 bg-bg2 border border-border rounded-lg px-[11px] py-[7px] mb-3">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-t3 shrink-0"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm nhân viên, chức vụ…" className="bg-transparent border-none outline-none text-t1 text-[12.5px] flex-1 w-full placeholder:text-t4" />
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {[
                { label: `Tất cả (${empData?.total ?? "…"})`, value: undefined },
                { label: "Đang làm", value: "active" },
                { label: "Thử việc", value: "probation" },
                { label: "Nghỉ phép", value: "on_leave" },
              ].map((f) => (
                <button key={f.label} onClick={() => setStatusFilter(f.value)}
                  className={`px-[11px] py-[5px] rounded-[20px] border text-[11.5px] cursor-pointer transition-all
                    ${statusFilter === f.value ? "bg-bg3 text-t1 border-border-strong" : "bg-transparent text-t3 border-border hover:text-t1"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {empLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-t3 text-xs">Chưa có nhân viên nào</div>
            ) : (
              employees.map((emp, i) => {
                const sc = statusColors[emp.status] || statusColors.active;
                return (
                  <div key={emp.id} onClick={() => setSelectedEmp(i)}
                    className={`flex gap-[11px] p-3 rounded-[10px] border cursor-pointer transition-all mb-[7px]
                      ${selectedEmp === i ? "border-border-accent bg-teal-subtle" : "border-border bg-bg2 hover:border-border-strong hover:bg-bg3"}`}>
                    <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center text-[10px] font-bold shrink-0 ${sc.bg} ${sc.text}`}>
                      {getInitials(emp.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold mb-[3px]">
                        {emp.full_name} <span className="text-[10px] text-t3 font-mono">{emp.id_number || ""}</span>
                      </div>
                      <div className="text-[11px] text-t2 mb-[5px]">{emp.position} · {(emp as any).buildings?.name || "—"}</div>
                      <div className="flex gap-[5px] flex-wrap">
                        <Chip color={sc.text.replace("text-", "") as any}>{statusLabels[emp.status] || emp.status}</Chip>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Employee detail */}
          {selected && (
            <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-[15px] py-3 border-b border-border">
                <div className="text-[12.5px] font-semibold text-t1 flex items-center gap-[7px]">
                  <div className="w-6 h-6 rounded-[5px] flex items-center justify-center text-[9px] font-bold bg-teal-muted text-teal">{getInitials(selected.full_name)}</div>
                  {selected.full_name} — {selected.id_number || "N/A"}
                </div>
              </div>
              <div className="p-[13px_15px]">
                <div className="grid grid-cols-2 gap-2 mb-[13px]">
                  {[
                    { label: "Vị trí", value: selected.position },
                    { label: "Công trình", value: (selected as any).buildings?.name || "—" },
                    { label: "Ngày vào làm", value: selected.hire_date ? format(new Date(selected.hire_date), "dd/MM/yyyy") : "—", mono: true },
                    { label: "Phòng ban", value: selected.department || "—" },
                    { label: "Lương cơ bản", value: selected.salary ? `${Number(selected.salary).toLocaleString("vi-VN")}đ` : "—", mono: true, color: "text-teal" },
                    { label: "Trạng thái", value: statusLabels[selected.status] || selected.status },
                  ].map((item, i) => (
                    <div key={i} className="bg-bg2 p-[9px_11px] rounded-lg">
                      <div className="text-[10px] text-t3 mb-[2px]">{item.label}</div>
                      <div className={`text-[12.5px] ${item.mono ? "font-mono" : "font-semibold"} ${(item as any).color || ""}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-bg2 p-[9px_11px] rounded-lg">
                    <div className="text-[10px] text-t3 mb-[2px]">Email</div>
                    <div className="text-[12.5px]">{selected.email || "—"}</div>
                  </div>
                  <div className="bg-bg2 p-[9px_11px] rounded-lg">
                    <div className="text-[10px] text-t3 mb-[2px]">Điện thoại</div>
                    <div className="text-[12.5px] font-mono">{selected.phone || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "cert" && (
        <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-[15px] py-3 border-b border-border">
            <div className="text-[12.5px] font-semibold">Chứng chỉ & Giấy tờ pháp lý</div>
            {stats && <Chip color="danger">{stats.expiringCerts} sắp hết hạn</Chip>}
          </div>
          {certsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg2">
                  {["Nhân viên", "Loại chứng chỉ", "Ngày cấp", "Hết hạn", "Trạng thái"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-t3 uppercase tracking-wider px-[11px] py-2 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(certs || []).map((cert) => {
                  const isExpiring = cert.expiry_date && new Date(cert.expiry_date) < new Date(Date.now() + 30 * 86400000);
                  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                  return (
                    <tr key={cert.id} className="hover:bg-bg2">
                      <td className="px-[11px] py-[9px] border-b border-border text-[12.5px]">{(cert as any).employees?.full_name || "—"}</td>
                      <td className="px-[11px] py-[9px] border-b border-border text-[12.5px]">{cert.cert_name}</td>
                      <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px] text-t2">{cert.issued_date ? format(new Date(cert.issued_date), "dd/MM/yyyy") : "—"}</td>
                      <td className={`px-[11px] py-[9px] border-b border-border font-mono text-[11.5px] ${isExpired ? "text-danger" : isExpiring ? "text-amber" : "text-teal"}`}>
                        {cert.expiry_date ? format(new Date(cert.expiry_date), "dd/MM/yyyy") : "—"}
                      </td>
                      <td className="px-[11px] py-[9px] border-b border-border">
                        <Chip color={isExpired ? "danger" : isExpiring ? "amber" : "teal"}>
                          {isExpired ? "Hết hạn" : isExpiring ? "Sắp hết hạn" : "Hợp lệ"}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
                {(certs || []).length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-t3 text-xs">Chưa có chứng chỉ</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "leave" && (
        <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-[15px] py-3 border-b border-border">
            <div className="text-[12.5px] font-semibold">Đơn xin nghỉ phép — Chờ duyệt</div>
            {stats && <Chip color="amber">{stats.pendingLeaves} đơn</Chip>}
          </div>
          {leavesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-t3" /></div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg2">
                  {["Nhân viên", "Loại nghỉ", "Từ ngày", "Đến ngày", "Lý do", "Hành động"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-t3 uppercase tracking-wider px-[11px] py-2 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(leaves || []).map((leave) => (
                  <tr key={leave.id} className="hover:bg-bg2">
                    <td className="px-[11px] py-[9px] border-b border-border text-[12.5px]">{(leave as any).employees?.full_name || "—"}</td>
                    <td className="px-[11px] py-[9px] border-b border-border text-[12.5px]">{leave.leave_type === "annual" ? "Nghỉ phép năm" : leave.leave_type === "sick" ? "Nghỉ ốm" : leave.leave_type}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px]">{format(new Date(leave.start_date), "dd/MM/yyyy")}</td>
                    <td className="px-[11px] py-[9px] border-b border-border font-mono text-[11.5px]">{format(new Date(leave.end_date), "dd/MM/yyyy")}</td>
                    <td className="px-[11px] py-[9px] border-b border-border text-[11.5px] text-t2">{leave.reason || "—"}</td>
                    <td className="px-[11px] py-[9px] border-b border-border">
                      <div className="flex gap-[5px]">
                        <button onClick={() => handleLeaveAction(leave.id, "approved")} disabled={updateLeave.isPending}
                          className="px-[9px] py-[3px] rounded-[7px] bg-teal text-bg0 border border-teal text-[10.5px] font-semibold cursor-pointer">Duyệt</button>
                        <button onClick={() => handleLeaveAction(leave.id, "rejected")} disabled={updateLeave.isPending}
                          className="px-[9px] py-[3px] rounded-[7px] border border-border-strong bg-transparent text-t2 text-[10.5px] cursor-pointer hover:border-teal hover:text-teal">Từ chối</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(leaves || []).length === 0 && (
                  <tr><td colSpan={6} className="text-center py-6 text-t3 text-xs">Không có đơn chờ duyệt</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
