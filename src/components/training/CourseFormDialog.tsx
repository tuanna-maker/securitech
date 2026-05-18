import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourse } from "@/features/training/hooks";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function CourseFormDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "nghiep_vu",
    duration_hours: "",
    is_mandatory: false,
    pass_score: "",
  });

  const mutation = useCreateCourse();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Vui lòng nhập tên khóa học"); return; }
    mutation.mutate(
      {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : undefined,
        is_mandatory: form.is_mandatory,
        pass_score: form.pass_score ? Number(form.pass_score) : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã tạo khóa học");
          setForm({ title: "", description: "", category: "nghiep_vu", duration_hours: "", is_mandatory: false, pass_score: "" });
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Lỗi tạo khóa học"),
      }
    );
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Tạo khóa học mới</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Tên khóa học *</Label>
            <Input value={form.title} onChange={set("title")} placeholder="VD: An toàn PCCC cơ bản" />
          </div>
          <div>
            <Label className="text-xs">Mô tả</Label>
            <Input value={form.description} onChange={set("description")} placeholder="Nội dung chính..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Danh mục</Label>
              <select value={form.category} onChange={set("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="pccc">PCCC</option>
                <option value="nghiep_vu">Nghiệp vụ</option>
                <option value="phap_ly">Pháp lý</option>
                <option value="ky_nang">Kỹ năng</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Thời lượng (giờ)</Label>
              <Input value={form.duration_hours} onChange={set("duration_hours")} type="number" placeholder="8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Điểm đạt</Label>
              <Input value={form.pass_score} onChange={set("pass_score")} type="number" placeholder="70" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" checked={form.is_mandatory}
                onChange={(e) => setForm((f) => ({ ...f, is_mandatory: e.target.checked }))}
                className="rounded border-input" />
              <Label className="text-xs">Bắt buộc</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : "Tạo khóa học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
