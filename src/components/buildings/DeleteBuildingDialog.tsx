import { type BuildingRow } from "@/features/buildings";

interface Props {
  open: boolean;
  building: BuildingRow | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteBuildingDialog({ open, building, onClose, onConfirm }: Props) {
  if (!open || !building) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-bg1 border border-border rounded-xl w-full max-w-sm animate-scale-in">
          <div className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-danger-muted flex items-center justify-center mx-auto">
              <svg viewBox="0 0 16 16" className="w-5 h-5 text-danger" fill="none">
                <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[14px] font-bold text-t1 text-center">Xóa tòa nhà?</h3>
            <p className="text-[12px] text-t3 text-center">
              Bạn có chắc muốn xóa <strong className="text-t1">{building.name}</strong>? Thao tác này không thể hoàn tác.
            </p>
          </div>
          <div className="flex items-center gap-2 px-5 py-4 border-t border-border">
            <button onClick={onClose} className="flex-1 px-4 py-2 text-[12px] text-t2 border border-border rounded-lg hover:bg-bg3 transition-colors">Hủy</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 text-[12px] font-medium bg-danger text-white rounded-lg hover:opacity-90 transition-opacity">Xóa</button>
          </div>
        </div>
      </div>
    </>
  );
}
