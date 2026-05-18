import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useBuildingStats } from "@/features/buildings";
import { db } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, KeyRound, User, Shield, ChevronDown, Loader2 } from "lucide-react";

interface TopBarProps {
  title: string;
  mobileTitle?: string;
  actionLabel: string;
  onMenuToggle?: () => void;
}

export default function TopBar({ title, mobileTitle, actionLabel, onMenuToggle }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, roles, signOut } = useAuth();
  const stats = useBuildingStats();
  const navigate = useNavigate();
  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (newPw.length < 6) { toast.error("Mật khẩu phải có ít nhất 6 ký tự"); return; }
    if (newPw !== confirmPw) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    setPwLoading(true);
    const { error } = await db.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Đổi mật khẩu thành công");
    setPwDialogOpen(false);
    setNewPw("");
    setConfirmPw("");
  };

  const displayName = profile?.full_name || user?.email || "User";
  const isPlatformAdmin = roles.includes("platform_admin");

  return (
    <>
      <div className="h-[46px] bg-bg1 border-b border-border flex items-center px-2 sm:px-4 gap-1.5 sm:gap-2 shrink-0">
        {/* Title */}
        <div className="font-display text-[11px] sm:text-[13px] font-bold truncate mr-auto">
          <span className="sm:hidden text-t1">{mobileTitle || title}</span>
          <span className="hidden sm:inline text-t1">{title}</span>
        </div>

        {/* System status ticker - desktop only */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono mr-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg2 border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" />
            <span className="text-teal font-semibold">LIVE</span>
            <span className="text-t3">{timeStr}</span>
          </div>
          <div className="flex items-center gap-1 text-t3">
            <span className="text-t2">{stats.total}</span>
            <span>tòa nhà</span>
            <span className="mx-0.5 text-border-strong">|</span>
            <span className={stats.totalCriticalIncidents > 0 ? "text-danger font-semibold" : "text-teal"}>{stats.totalCriticalIncidents}</span>
            <span>nghiêm trọng</span>
            <span className="mx-0.5 text-border-strong">|</span>
            <span className="text-t2">{stats.totalStaffOnline}/{stats.totalStaff}</span>
            <span>nhân viên</span>
          </div>
        </div>

        {/* Mobile mini status */}
        <div className="flex sm:hidden items-center gap-1 text-[9px] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" />
          <span className="text-teal font-semibold">LIVE</span>
        </div>

        {/* Ctrl+K search trigger */}
        <button className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg2 border border-border text-[10px] text-t3 hover:border-border-strong hover:text-t2 transition-all cursor-pointer"
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}>
          <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 opacity-60">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span>Tìm kiếm</span>
          <kbd className="text-[9px] text-t4 bg-bg3 px-1 rounded">⌘K</kbd>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="p-[6px] rounded-md cursor-pointer text-t3 transition-all hover:text-t1 hover:bg-bg3"
          title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}>
          {theme === "dark" ? (
            <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
              <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
              <path d="M14 9.5A6.5 6.5 0 016.5 2 5.5 5.5 0 1014 9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-[6px] rounded-md cursor-pointer text-t3 transition-all hover:text-t1 hover:bg-bg3">
          <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
            <path d="M8 2a5 5 0 00-5 5v2.5L2 11h12l-1-1.5V7a5 5 0 00-5-5zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="absolute top-0.5 right-0.5 w-[6px] h-[6px] rounded-full bg-danger" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] text-t2 cursor-pointer transition-all hover:bg-bg3 border border-transparent hover:border-border"
          >
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="hidden md:inline max-w-[100px] truncate">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-t3" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-border bg-bg1 shadow-xl py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-t1 truncate">{displayName}</p>
                  <p className="text-[10px] text-t3 truncate">{user?.email}</p>
                </div>

                {isPlatformAdmin && (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/platform-admin"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-t2 hover:bg-bg3 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Platform Admin
                  </button>
                )}

                <button
                  onClick={() => { setUserMenuOpen(false); setPwDialogOpen(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-t2 hover:bg-bg3 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Đổi mật khẩu
                </button>

                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-bg3 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Mật khẩu mới</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Ít nhất 6 ký tự" />
            </div>
            <div>
              <Label>Xác nhận mật khẩu</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
            </div>
            <Button className="w-full" disabled={pwLoading} onClick={handleChangePassword}>
              {pwLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Xác nhận đổi mật khẩu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
