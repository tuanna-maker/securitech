import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateShift } from "@/features/workforce/hooks";
import { useStaffMembers } from "@/features/workforce/hooks";
import { useBuildings } from "@/features/buildings/hooks";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ShiftFormDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    staff_member_id: "",
    building_id: "",
    shift_date: new Date().toISOString().split("T")[0],
    start_time: "06:00",
    end_time: "18:00",
    shift_type: "day",
    notes: "",
  });

  const mutation = useCreateShift();
  const { data: staff = [] } = useStaffMembers();
  const { data: buildingsData } = useBuildings();
  const buildings = Array.isArray(buildingsData) ? buildingsData : buildingsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staff_member_id || !form.building_id) {
      toast.error("Vui lòng chọn nhân viên và tòa nhà");
      return;
    }
    mutation.mutate(
      {
        staff_member_id: form.staff_member_id,
        building_id: form.building_id,
        shift_date: form.shift_date,
        start_time: form.start_time,
        end_time: form.end_time,
        shift_type: form.shift_type,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã tạo ca trực");
          setForm({ staff_member_id: "", building_id: "", shift_date: new Date().toISOString().split("T")[0], start_time: "06:00", end_time: "18:00", shift_type: "day", notes: "" });
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Lỗi tạo ca trực"),
      }
    );
  };

  const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Tạo ca trực mới</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Nhân viên *</Label>
            <select value={form.staff_member_id} onChange={sel("staff_member_id")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">-- Chọn nhân viên --</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Tòa nhà *</Label>
            <select value={form.building_id} onChange={sel("building_id")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">-- Chọn tòa nhà --</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Ngày</Label>
              <Input type="date" value={form.shift_date} onChange={sel("shift_date")} />
            </div>
            <div>
              <Label className="text-xs">Bắt đầu</Label>
              <Input type="time" value={form.start_time} onChange={sel("start_time")} />
            </div>
            <div>
              <Label className="text-xs">Kết thúc</Label>
              <Input type="time" value={form.end_time} onChange={sel("end_time")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Loại ca</Label>
              <select value={form.shift_type} onChange={sel("shift_type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="day">Ca sáng</option>
                <option value="afternoon">Ca chiều</option>
                <option value="night">Ca đêm</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Ghi chú</Label>
              <Input value={form.notes} onChange={sel("notes")} placeholder="Ghi chú..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : "Tạo ca trực"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
