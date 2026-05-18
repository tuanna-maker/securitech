import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Resident {
  id: string;
  name: string;
  apartment: string;
  building: string;
  phone: string;
  email: string;
  type: "owner" | "tenant";
  members: number;
  moveIn: string;
  status: "active" | "inactive";
  vehicles: string[];
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident?: Resident | null;
  onSave: (data: Resident) => void;
}

const buildings = [
  "Vinhomes Central Park", "Royal City", "Times City",
  "Gamuda Gardens", "Masteri Thảo Điền", "Ecopark", "Sunshine City",
];

export default function ResidentFormDialog({ open, onOpenChange, resident, onSave }: Props) {
  const isEdit = !!resident;

  const [form, setForm] = useState({
    name: "", apartment: "", building: buildings[0], phone: "", email: "",
    type: "owner" as "owner" | "tenant", members: 1, moveIn: "",
    status: "active" as "active" | "inactive", vehicles: "", note: "",
  });

  useEffect(() => {
    if (resident) {
      setForm({
        name: resident.name, apartment: resident.apartment, building: resident.building,
        phone: resident.phone, email: resident.email, type: resident.type,
        members: resident.members, moveIn: resident.moveIn, status: resident.status,
        vehicles: resident.vehicles.join(", "), note: resident.note,
      });
    } else {
      setForm({
        name: "", apartment: "", building: buildings[0], phone: "", email: "",
        type: "owner", members: 1, moveIn: "", status: "active", vehicles: "", note: "",
      });
    }
  }, [resident, open]);

  const handleSave = () => {
    if (!form.name.trim() || !form.apartment.trim()) return;
    onSave({
      id: resident?.id || `CD-${String(Date.now()).slice(-3)}`,
      ...form,
      vehicles: form.vehicles ? form.vehicles.split(",").map(v => v.trim()).filter(Boolean) : [],
    });
    onOpenChange(false);
  };

  const set = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa thông tin cư dân" : "Thêm cư dân mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin cư dân" : "Điền thông tin để thêm cư dân mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Họ tên *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Căn hộ *</Label>
              <Input value={form.apartment} onChange={e => set("apartment", e.target.value)} placeholder="1205" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tòa nhà</Label>
              <select value={form.building} onChange={e => set("building", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Loại cư dân</Label>
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="owner">Chủ sở hữu</option>
                <option value="tenant">Thuê</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Số điện thoại</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0901-234-567" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Số thành viên</Label>
              <Input type="number" min={1} value={form.members} onChange={e => set("members", parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ngày chuyển đến</Label>
              <Input value={form.moveIn} onChange={e => set("moveIn", e.target.value)} placeholder="01/01/2024" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trạng thái</Label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="active">Đang ở</option>
                <option value="inactive">Đã chuyển</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Phương tiện (phân cách bằng dấu phẩy)</Label>
            <Input value={form.vehicles} onChange={e => set("vehicles", e.target.value)} placeholder="59A-12345 (Ô tô), 59B1-67890 (Xe máy)" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ghi chú</Label>
            <Input value={form.note} onChange={e => set("note", e.target.value)} placeholder="Ghi chú thêm..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={!form.name.trim() || !form.apartment.trim()}>
            {isEdit ? "Cập nhật" : "Thêm cư dân"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
