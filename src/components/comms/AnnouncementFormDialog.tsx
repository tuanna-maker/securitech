import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAnnouncement } from "@/features/comms/hooks";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AnnouncementFormDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({ title: "", content: "", priority: "normal" });
  const mutation = useCreateAnnouncement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    mutation.mutate(
      { title: form.title, content: form.content || undefined, priority: form.priority },
      {
        onSuccess: () => {
          toast.success("Đã tạo thông báo");
          setForm({ title: "", content: "", priority: "normal" });
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Lỗi tạo thông báo"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Tạo thông báo mới</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Tiêu đề *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề thông báo" />
          </div>
          <div>
            <Label className="text-xs">Nội dung</Label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Nội dung thông báo..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <Label className="text-xs">Mức độ</Label>
            <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang tạo..." : "Tạo thông báo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
