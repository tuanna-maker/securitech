import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClient } from "@/features/crm/hooks";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ClientFormDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    type: "bql",
    notes: "",
  });

  const mutation = useCreateClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }
    mutation.mutate(
      { name: form.name, contact_person: form.contact_person, phone: form.phone, email: form.email, type: form.type, notes: form.notes },
      {
        onSuccess: () => {
          toast.success("Đã thêm khách hàng");
          setForm({ name: "", contact_person: "", phone: "", email: "", type: "bql", notes: "" });
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Lỗi thêm khách hàng"),
      }
    );
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm khách hàng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Tên khách hàng *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="VD: BQL Vinhomes Central Park" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Người liên hệ</Label>
              <Input value={form.contact_person} onChange={set("contact_person")} placeholder="Họ tên" />
            </div>
            <div>
              <Label className="text-xs">Loại</Label>
              <select value={form.type} onChange={set("type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="bql">Ban quản lý</option>
                <option value="owner">Chủ đầu tư</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Số điện thoại</Label>
              <Input value={form.phone} onChange={set("phone")} placeholder="0901..." />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={set("email")} type="email" placeholder="email@..." />
            </div>
          </div>
          <div>
            <Label className="text-xs">Ghi chú</Label>
            <Input value={form.notes} onChange={set("notes")} placeholder="Ghi chú thêm..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
