import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePost } from "@/features/comms/hooks";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function PostFormDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({ title: "", content: "" });
  const mutation = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    mutation.mutate(
      { title: form.title, content: form.content || undefined },
      {
        onSuccess: () => {
          toast.success("Đã đăng bài");
          setForm({ title: "", content: "" });
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Lỗi đăng bài"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Đăng bài mới</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Tiêu đề *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề bài đăng" />
          </div>
          <div>
            <Label className="text-xs">Nội dung</Label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Nội dung chi tiết..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang đăng..." : "Đăng bài"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
