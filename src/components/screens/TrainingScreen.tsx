import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useCourses, useEnrollments, useTrainingStats, useDeleteCourse } from "@/features/training";
import CourseFormDialog from "@/components/training/CourseFormDialog";
import { toast } from "sonner";

const tabs = [
  { id: "catalog", label: "Thư viện khóa học" },
  { id: "progress", label: "Tiến độ nhân viên" },
  { id: "cert", label: "Cấp chứng chỉ" },
];

const categoryColors: Record<string, { icon: string; bg: string; chipColor: "danger" | "amber" | "purple" | "info" | "teal" | "gray" }> = {
  "pccc": { icon: "🔥", bg: "bg-danger-muted", chipColor: "danger" },
  "nghiep_vu": { icon: "📚", bg: "bg-amber-muted", chipColor: "amber" },
  "phap_ly": { icon: "📋", bg: "bg-purple-muted", chipColor: "purple" },
  "ky_nang": { icon: "💬", bg: "bg-teal-muted", chipColor: "teal" },
};

export default function TrainingScreen() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [addOpen, setAddOpen] = useState(false);

  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: enrollments = [], isLoading: enrollLoading } = useEnrollments();
  const { data: stats } = useTrainingStats();
  const deleteCourse = useDeleteCourse();

  const isLoading = coursesLoading || enrollLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-teal" /></div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
        <KpiCard label="Khóa học đang mở" value={stats?.totalCourses || 0} delta={`${stats?.mandatoryCourses || 0} bắt buộc`} color="purple" />
        <KpiCard label="Tỷ lệ hoàn thành" value={`${stats?.completionRate || 0}%`} color="teal" />
        <KpiCard label="Tổng đăng ký" value={stats?.totalEnrollments || 0} delta={`${stats?.completedEnrollments || 0} đã hoàn thành`} color="info" />
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

      {activeTab === "catalog" && (
        <div>
          <div className="flex justify-end mb-2">
            <Button size="sm" className="h-7 text-[11px]" onClick={() => setAddOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Tạo khóa học
            </Button>
          </div>
          <CourseFormDialog open={addOpen} onOpenChange={setAddOpen} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {courses.length === 0 && <div className="col-span-3 text-xs text-t3 text-center py-8">Chưa có khóa học</div>}
          {courses.map((c) => {
            const cat = categoryColors[c.category || ""] || { icon: "📖", bg: "bg-bg3", chipColor: "gray" as const };
            const courseEnrollments = enrollments.filter((e: any) => e.course_id === c.id);
            const completed = courseEnrollments.filter((e: any) => e.status === "completed").length;
            const total = courseEnrollments.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={c.id} className="bg-bg2 border border-border rounded-[10px] p-3 transition-all hover:border-border-strong">
                <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center mb-[9px] text-base ${cat.bg}`}>{cat.icon}</div>
                <div className="flex items-center gap-2 mb-1">
                  {c.is_mandatory && <Chip color="danger">Bắt buộc</Chip>}
                  {c.category && <Chip color={cat.chipColor}>{c.category}</Chip>}
                </div>
                <div className="text-[12.5px] font-semibold mt-[7px] mb-1">{c.title}</div>
                <div className="text-[11px] text-t3 mb-[9px] leading-relaxed">{c.description || ""}</div>
                {c.duration_hours && <div className="text-[10px] text-t3 mb-2">{c.duration_hours} giờ</div>}
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-2.5">
                    <div className="h-[5px] bg-bg3 rounded-[3px] overflow-hidden">
                      <div className="h-full rounded-[3px] bg-teal" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-t3 mt-[3px]">{completed}/{total} NV hoàn thành</div>
                  </div>
                  <Chip color={pct >= 80 ? "teal" : pct >= 50 ? "amber" : "gray"}>{pct}%</Chip>
                </div>
                <button onClick={() => { if (confirm("Xóa khóa học này?")) deleteCourse.mutate(c.id, { onSuccess: () => toast.success("Đã xóa") }); }}
                  className="text-[10px] text-danger mt-2 hover:underline cursor-pointer">Xóa</button>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {activeTab === "progress" && (
        <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
          <div className="px-[15px] py-3 border-b border-border">
            <div className="text-[12.5px] font-semibold">Tiến độ học tập theo nhân viên</div>
          </div>
          {enrollments.length === 0 ? (
            <div className="text-xs text-t3 text-center py-8">Chưa có dữ liệu đăng ký</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg2">
                  {["Nhân viên", "Khóa học", "Trạng thái", "Điểm"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-t3 uppercase tracking-wider px-[11px] py-2 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 20).map((e: any) => (
                  <tr key={e.id} className="hover:bg-bg2">
                    <td className="px-[11px] py-[9px] border-b border-border text-[12px]">
                      {e.employees?.full_name || "—"}
                    </td>
                    <td className="px-[11px] py-[9px] border-b border-border text-[12px]">
                      {e.training_courses?.title || "—"}
                    </td>
                    <td className="px-[11px] py-[9px] border-b border-border">
                      <Chip color={e.status === "completed" ? "teal" : e.status === "in_progress" ? "amber" : "gray"}>
                        {e.status === "completed" ? "Hoàn thành" : e.status === "in_progress" ? "Đang học" : "Đã đăng ký"}
                      </Chip>
                    </td>
                    <td className="px-[11px] py-[9px] border-b border-border text-[12px] font-mono">
                      {e.score != null ? e.score : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "cert" && (
        <CardPanel title="Cấp chứng nhận hoàn thành">
          <div className="text-[12.5px] text-t2">Nhân viên hoàn thành đủ điều kiện sẽ được cấp chứng nhận điện tử tự động và lưu vào hồ sơ nhân sự.</div>
        </CardPanel>
      )}
    </div>
  );
}
