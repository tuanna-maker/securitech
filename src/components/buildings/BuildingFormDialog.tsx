import { useState, useEffect } from "react";
import { type BuildingRow } from "@/features/buildings";

type BuildingStatus = "normal" | "warning" | "critical";

export interface BuildingFormData {
  name: string;
  region: string;
  managementCompany: string;
  status: BuildingStatus;
  address: string;
  staffTotal: number;
  lat: number;
  lng: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: BuildingFormData) => void;
  building?: BuildingRow | null;
}

const regions = ["Quận 1", "Quận 2", "Quận 7", "Quận 9", "Bình Thạnh", "Thủ Đức", "Tân Bình", "Phú Nhuận", "Gò Vấp", "Hà Đông", "Cầu Giấy", "Long Biên", "Hoàng Mai", "Nam Từ Liêm", "Thanh Xuân"];
const companies = ["VinGroup", "Novaland", "CapitaLand", "Gamuda Land", "Phú Mỹ Hưng", "Masterise", "Sunshine Group", "Ecopark"];

const empty: BuildingFormData = { name: "", region: regions[0], managementCompany: companies[0], status: "normal", address: "", staffTotal: 10, lat: 10.76, lng: 106.66 };

interface FieldError { field: string; message: string }

function validate(d: BuildingFormData): FieldError[] {
  const errs: FieldError[] = [];
  if (!d.name.trim()) errs.push({ field: "name", message: "Tên tòa nhà không được để trống" });
  if (!d.address.trim()) errs.push({ field: "address", message: "Địa chỉ không được để trống" });
  if (d.staffTotal < 1 || d.staffTotal > 500) errs.push({ field: "staffTotal", message: "Nhân sự từ 1-500" });
  if (d.lat < -90 || d.lat > 90) errs.push({ field: "lat", message: "Vĩ độ từ -90 đến 90" });
  if (d.lng < -180 || d.lng > 180) errs.push({ field: "lng", message: "Kinh độ từ -180 đến 180" });
  return errs;
}

export default function BuildingFormDialog({ open, onClose, onSave, building }: Props) {
  const [form, setForm] = useState<BuildingFormData>(empty);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const isEdit = !!building;

  useEffect(() => {
    if (open) {
      if (building) {
        setForm({ name: building.name, region: building.region || regions[0], managementCompany: building.management_company || companies[0], status: building.status, address: building.address || "", staffTotal: building.staff_total, lat: building.lat || 10.76, lng: building.lng || 106.66 });
      } else {
        setForm(empty);
      }
      setErrors([]);
    }
  }, [open, building]);

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleSubmit = () => {
    const errs = validate(form);
    setErrors(errs);
    if (errs.length === 0) onSave({ ...form, name: form.name.trim(), address: form.address.trim() });
  };

  if (!open) return null;

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-[12px] bg-bg2 border rounded-lg text-t1 placeholder:text-t4 focus:outline-none transition-colors ${getError(field) ? "border-danger" : "border-border focus:border-border-accent"}`;
  const labelCls = "text-[11px] font-medium text-t2 mb-1 block";
  const errCls = "text-[10px] text-danger mt-0.5";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-bg1 border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[15px] font-bold text-t1">{isEdit ? "Chỉnh sửa tòa nhà" : "Thêm tòa nhà mới"}</h3>
            <button onClick={onClose} className="p-1 hover:bg-bg3 rounded-md text-t3 hover:text-t1 transition-colors">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className={labelCls}>Tên tòa nhà <span className="text-danger">*</span></label>
              <input type="text" className={inputCls("name")} placeholder="VD: Vinhomes Central Park" maxLength={100}
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {getError("name") && <p className={errCls}>{getError("name")}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Khu vực</label>
                <select className={inputCls("region")} value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Ban quản lý</label>
                <select className={inputCls("managementCompany")} value={form.managementCompany} onChange={(e) => setForm((f) => ({ ...f, managementCompany: e.target.value }))}>
                  {companies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Địa chỉ <span className="text-danger">*</span></label>
              <input type="text" className={inputCls("address")} placeholder="VD: 123 Nguyễn Huệ, Quận 1" maxLength={200}
                value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              {getError("address") && <p className={errCls}>{getError("address")}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Trạng thái</label>
                <select className={inputCls("status")} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BuildingStatus }))}>
                  <option value="normal">Bình thường</option>
                  <option value="warning">Cảnh báo</option>
                  <option value="critical">Nghiêm trọng</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Tổng nhân sự</label>
                <input type="number" className={inputCls("staffTotal")} min={1} max={500}
                  value={form.staffTotal} onChange={(e) => setForm((f) => ({ ...f, staffTotal: parseInt(e.target.value) || 0 }))} />
                {getError("staffTotal") && <p className={errCls}>{getError("staffTotal")}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Vĩ độ (Lat)</label>
                <input type="number" step="0.0001" className={inputCls("lat")}
                  value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: parseFloat(e.target.value) || 0 }))} />
                {getError("lat") && <p className={errCls}>{getError("lat")}</p>}
              </div>
              <div>
                <label className={labelCls}>Kinh độ (Lng)</label>
                <input type="number" step="0.0001" className={inputCls("lng")}
                  value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: parseFloat(e.target.value) || 0 }))} />
                {getError("lng") && <p className={errCls}>{getError("lng")}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-[12px] text-t2 border border-border rounded-lg hover:bg-bg3 transition-colors">Hủy</button>
            <button onClick={handleSubmit} className="px-4 py-2 text-[12px] font-medium bg-teal text-white rounded-lg hover:opacity-90 transition-opacity">{isEdit ? "Cập nhật" : "Thêm mới"}</button>
          </div>
        </div>
      </div>
    </>
  );
}
