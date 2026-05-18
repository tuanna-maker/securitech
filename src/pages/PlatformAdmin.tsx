import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { db } from "@/lib/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Loader2, Plus, Search, Building2, Users, Shield, ArrowLeft, Edit, Eye,
  LayoutDashboard, UserCog, FileText, CreditCard, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, Zap, Trash2, GripVertical,
  ChevronLeft, ChevronRight, LogOut, Bell, RefreshCw, Ban
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// ─── Hooks ────────────────────────────────────────────────────────────
function usePlatformStats() {
  return useQuery({
    queryKey: ["pa-stats"],
    queryFn: async () => {
      const [tenants, profiles, buildings, incidents] = await Promise.all([
        db.from("tenants").select("id, is_active, plan, created_at", { count: "exact" }),
        db.from("profiles").select("id", { count: "exact" }),
        db.from("buildings").select("id", { count: "exact" }),
        db.from("incidents").select("id, severity", { count: "exact" }),
      ]);
      const tData = tenants.data || [];
      const active = tData.filter((t) => t.is_active).length;

      // Monthly growth: count tenants created in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newThisMonth = tData.filter((t) => new Date(t.created_at) > thirtyDaysAgo).length;

      return {
        totalTenants: tenants.count || 0,
        activeTenants: active,
        inactiveTenants: (tenants.count || 0) - active,
        totalUsers: profiles.count || 0,
        totalBuildings: buildings.count || 0,
        totalIncidents: incidents.count || 0,
        criticalIncidents: (incidents.data || []).filter((i) => i.severity === "critical").length,
        newTenantsMonth: newThisMonth,
        planBreakdown: {
          free: tData.filter((t) => t.plan === "free").length,
          basic: tData.filter((t) => t.plan === "basic").length,
          pro: tData.filter((t) => t.plan === "pro").length,
          enterprise: tData.filter((t) => t.plan === "enterprise").length,
        },
      };
    },
  });
}

function useTenants(search: string) {
  return useQuery({
    queryKey: ["pa-tenants", search],
    queryFn: async () => {
      let q = db.from("tenants").select("*", { count: "exact" }).order("created_at", { ascending: false });
      if (search) q = q.ilike("company_name", `%${search}%`);
      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    },
  });
}

function useAllUsers(search: string) {
  return useQuery({
    queryKey: ["pa-users", search],
    queryFn: async () => {
      let q = db.from("profiles").select("id, user_id, full_name, phone, avatar_url, tenant_id, created_at", { count: "exact" }).order("created_at", { ascending: false });
      if (search) q = q.ilike("full_name", `%${search}%`);
      const { data, error, count } = await q;
      if (error) throw error;

      // Get tenant names
      const tenantIds = [...new Set((data || []).map((p) => p.tenant_id))];
      const { data: tenantData } = await db.from("tenants").select("id, company_name").in("id", tenantIds);
      const tenantMap: Record<string, string> = {};
      (tenantData || []).forEach((t) => { tenantMap[t.id] = t.company_name; });

      // Get roles
      const userIds = (data || []).map((p) => p.user_id);
      const { data: rolesData } = await db.from("user_roles").select("user_id, role").in("user_id", userIds);
      const rolesMap: Record<string, string[]> = {};
      (rolesData || []).forEach((r) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });

      return {
        data: (data || []).map((p) => ({
          ...p,
          tenant_name: tenantMap[p.tenant_id] || "—",
          roles: rolesMap[p.user_id] || [],
        })),
        total: count || 0,
      };
    },
  });
}

function useAuditLogs(search: string) {
  return useQuery({
    queryKey: ["pa-audit", search],
    queryFn: async () => {
      let q = db.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(100);
      if (search) q = q.ilike("action", `%${search}%`);
      const { data, error, count } = await q;
      if (error) throw error;

      // Get tenant names
      const tenantIds = [...new Set((data || []).map((l) => l.tenant_id))];
      const { data: tenantData } = await db.from("tenants").select("id, company_name").in("id", tenantIds);
      const tenantMap: Record<string, string> = {};
      (tenantData || []).forEach((t) => { tenantMap[t.id] = t.company_name; });

      // Get user names
      const userIds = [...new Set((data || []).map((l) => l.user_id).filter(Boolean))];
      const userMap: Record<string, string> = {};
      if (userIds.length) {
        const { data: profilesData } = await db.from("profiles").select("user_id, full_name").in("user_id", userIds);
        (profilesData || []).forEach((p) => { userMap[p.user_id] = p.full_name || "—"; });
      }

      return {
        data: (data || []).map((l) => ({
          ...l,
          tenant_name: tenantMap[l.tenant_id] || "—",
          user_name: l.user_id ? (userMap[l.user_id] || "Người dùng") : "Hệ thống",
        })),
        total: count || 0,
      };
    },
  });
}

function useSubscriptions() {
  return useQuery({
    queryKey: ["pa-subscriptions"],
    queryFn: async () => {
      const { data, error } = await db
        .from("tenant_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const tenantIds = [...new Set((data || []).map((s) => s.tenant_id))];
      const { data: tenantData } = await db.from("tenants").select("id, company_name").in("id", tenantIds.length ? tenantIds : ["_"]);
      const tenantMap: Record<string, string> = {};
      (tenantData || []).forEach((t) => { tenantMap[t.id] = t.company_name; });

      return (data || []).map((s) => ({ ...s, tenant_name: tenantMap[s.tenant_id] || "—" }));
    },
  });
}

// ─── Config ────────────────────────────────────────────────────────────
const planConfig: Record<string, { label: string; color: string }> = {
  free: { label: "Miễn phí", color: "bg-muted text-muted-foreground" },
  basic: { label: "Cơ bản", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  pro: { label: "Chuyên nghiệp", color: "bg-primary/10 text-primary" },
  enterprise: { label: "Doanh nghiệp", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

const roleLabels: Record<string, string> = {
  admin: "Admin", operator: "Operator", guard: "Bảo vệ", resident: "Cư dân",
  hr_manager: "HR", finance_manager: "Tài chính", platform_admin: "Platform Admin",
};

const subStatusConfig: Record<string, { label: string; icon: any; color: string }> = {
  active: { label: "Đang hoạt động", icon: CheckCircle, color: "text-emerald-500" },
  trial: { label: "Dùng thử", icon: Clock, color: "text-blue-500" },
  past_due: { label: "Quá hạn", icon: AlertTriangle, color: "text-amber-500" },
  canceled: { label: "Đã hủy", icon: XCircle, color: "text-red-500" },
};

// ─── Main Component ────────────────────────────────────────────────────
type SectionId = "dashboard" | "tenants" | "users" | "audit" | "billing" | "plans";

const NAV_SECTIONS: { label: string; items: { id: SectionId; label: string; icon: any; desc: string }[] }[] = [
  {
    label: "Tổng quan",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard, desc: "KPI nền tảng & tình trạng hệ thống" },
    ],
  },
  {
    label: "Quản trị tenant",
    items: [
      { id: "tenants", label: "Công ty", icon: Building2, desc: "Danh sách & cấu hình tenant" },
      { id: "users", label: "Người dùng", icon: UserCog, desc: "Tài khoản và phân quyền toàn nền tảng" },
    ],
  },
  {
    label: "Vận hành SaaS",
    items: [
      { id: "audit", label: "Nhật ký kiểm toán", icon: FileText, desc: "Audit logs & truy vết hành vi" },
      { id: "billing", label: "Gói & Hoá đơn", icon: CreditCard, desc: "Trạng thái thuê bao của tenant" },
      { id: "plans", label: "Bảng giá", icon: Zap, desc: "Cấu hình các gói dịch vụ" },
    ],
  },
];

const SECTION_META: Record<SectionId, { title: string; desc: string }> = {
  dashboard: { title: "Tổng quan nền tảng", desc: "Bức tranh toàn cảnh STOS SaaS" },
  tenants:   { title: "Quản lý công ty",     desc: "Danh sách tenant & cấu hình gói" },
  users:     { title: "Người dùng nền tảng", desc: "Tất cả tài khoản & phân quyền" },
  audit:     { title: "Nhật ký kiểm toán",   desc: "Truy vết hành vi quan trọng" },
  billing:   { title: "Gói & Hoá đơn",       desc: "Trạng thái thuê bao của tenant" },
  plans:     { title: "Bảng giá",            desc: "Cấu hình các gói dịch vụ" },
};

export default function PlatformAdmin() {
  const { user, loading, roles, profile, signOut } = useAuth();
  const isPlatformAdmin = roles.includes("platform_admin");
  const [active, setActive] = useState<SectionId>("dashboard");
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem("pa-sidebar-collapsed") === "1");

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("pa-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-bg0"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isPlatformAdmin) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4 bg-bg0 text-t1">
      <Shield className="h-16 w-16 text-t4" />
      <h1 className="text-xl font-bold">Truy cập bị từ chối</h1>
      <p className="text-t3">Bạn không có quyền Platform Admin.</p>
      <Link to="/dashboard"><Button variant="outline">Về Dashboard</Button></Link>
    </div>
  );

  const meta = SECTION_META[active];
  const initial = (profile?.full_name || user.email || "P").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-bg0 text-t1">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-[56px]" : "w-[240px]"} h-screen sticky top-0 bg-bg1 border-r border-border flex flex-col shrink-0 transition-all duration-200 overflow-hidden`}>
        {/* Brand */}
        <div className="px-3 pt-3 pb-2 border-b border-border">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/15 border border-primary/30">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-display text-[15px] font-extrabold tracking-tight leading-none">STOS</div>
                <div className="text-[8px] text-t4 tracking-[0.2em] uppercase">Platform Admin</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className={`${collapsed ? "px-1" : "px-2"} pt-2.5 pb-0.5`}>
              {!collapsed && (
                <div className="text-[8px] font-bold text-t4 uppercase tracking-[0.15em] px-2 mb-1">{section.label}</div>
              )}
              {collapsed && <div className="border-t border-border mb-1.5 mx-1" />}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? "justify-center px-0 py-1.5" : "gap-2 px-2 py-[6px]"} rounded-md text-[11.5px] mb-[1px] select-none relative transition-colors border-l-2
                      ${isActive
                        ? "bg-primary/10 text-primary border-primary"
                        : "text-t2 hover:bg-bg2 hover:text-t1 border-transparent"
                      }`}
                  >
                    <Icon className={`${collapsed ? "h-4 w-4" : "h-3.5 w-3.5"} shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Collapse toggle */}
        <div className={`px-2 py-1.5 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-t4 hover:bg-bg2 hover:text-t2 transition-colors w-full"
          >
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={12} /><span>Thu gọn</span></>}
          </button>
        </div>

        {/* Footer: user + back to tenant */}
        <div className="border-t border-border">
          <Link
            to="/dashboard"
            title={collapsed ? "Về Tenant Dashboard" : undefined}
            className={`flex items-center ${collapsed ? "justify-center py-2" : "gap-2 px-3 py-2"} text-[11px] text-t3 hover:bg-bg2 hover:text-t1 transition-colors border-b border-border`}
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Về Tenant Dashboard</span>}
          </Link>
          <div className={`p-2 ${collapsed ? "flex justify-center" : ""}`}>
            <div className={`flex items-center ${collapsed ? "justify-center p-0.5" : "gap-2 p-1.5"} rounded-md`}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] text-bg0 shrink-0 bg-primary">{initial}</div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-t1 truncate">{profile?.full_name || user.email}</div>
                  <div className="text-[9px] text-t4">Platform Admin</div>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={() => signOut()}
                  title="Đăng xuất"
                  className="p-1 rounded-md text-t4 hover:bg-bg2 hover:text-danger transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 h-14 px-4 md:px-6 bg-bg1/90 backdrop-blur border-b border-border flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-t1 truncate leading-tight">{meta.title}</h1>
            <p className="text-[11px] text-t4 truncate">{meta.desc}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden md:flex h-8 w-8 items-center justify-center rounded-md text-t3 hover:bg-bg2 hover:text-t1 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-bg2 px-2.5 py-1 text-[10px] font-semibold text-t2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SaaS Online
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {active === "dashboard" && <DashboardTab />}
          {active === "tenants" && <TenantsTab />}
          {active === "users" && <UsersTab />}
          {active === "audit" && <AuditTab />}
          {active === "billing" && <BillingTab />}
          {active === "plans" && <PlansTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────
function DashboardTab() {
  const { data: s, isLoading } = usePlatformStats();
  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!s) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Tổng công ty" value={s.totalTenants} sub={`+${s.newTenantsMonth} tháng này`} color="text-primary" />
        <StatCard icon={CheckCircle} label="Đang hoạt động" value={s.activeTenants} sub={`${s.inactiveTenants} tạm ngưng`} color="text-emerald-500" />
        <StatCard icon={Users} label="Tổng người dùng" value={s.totalUsers} color="text-blue-500" />
        <StatCard icon={Building2} label="Tổng tòa nhà" value={s.totalBuildings} color="text-amber-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Plan distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Phân bổ gói dịch vụ</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(s.planBreakdown).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={planConfig[plan]?.color || ""}>{planConfig[plan]?.label || plan}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${s.totalTenants ? (count / s.totalTenants) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System health */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Tình trạng hệ thống</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm">Hệ thống</span>
              </div>
              <span className="text-sm font-semibold text-emerald-500">Hoạt động bình thường</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sự cố nghiêm trọng</span>
              <span className={`font-semibold ${s.criticalIncidents > 0 ? "text-red-500" : "text-emerald-500"}`}>{s.criticalIncidents}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tổng sự cố</span>
              <span className="font-semibold">{s.totalIncidents}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tỷ lệ tenant hoạt động</span>
              <span className="font-semibold">{s.totalTenants ? Math.round((s.activeTenants / s.totalTenants) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Tenants Tab ───────────────────────────────────────────────────────
function TenantsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: tenants, isLoading } = useTenants(search);

  const detailQuery = useQuery({
    queryKey: ["pa-tenant-detail", detailId],
    queryFn: async () => {
      if (!detailId) return null;
      const [tenant, profiles, buildings, roles] = await Promise.all([
        db.from("tenants").select("*").eq("id", detailId).single(),
        db.from("profiles").select("id, full_name, user_id, phone, created_at", { count: "exact" }).eq("tenant_id", detailId),
        db.from("buildings").select("id, name, status, staff_online, staff_total", { count: "exact" }).eq("tenant_id", detailId),
        db.from("user_roles").select("user_id, role").in("user_id",
          ((await db.from("profiles").select("user_id").eq("tenant_id", detailId)).data || []).map((p) => p.user_id)
        ),
      ]);
      if (tenant.error) throw tenant.error;

      const roleMap: Record<string, string[]> = {};
      (roles.data || []).forEach((r) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      return {
        ...tenant.data,
        profiles: (profiles.data || []).map((p) => ({ ...p, roles: roleMap[p.user_id] || [] })),
        buildings: buildings.data || [],
        profileCount: profiles.count || 0,
        buildingCount: buildings.count || 0,
      };
    },
    enabled: !!detailId,
  });

  const saveMut = useMutation({
    mutationFn: async (input: { id?: string; company_name: string; plan: string; is_active: boolean; domain?: string }) => {
      if (input.id) {
        const { error } = await db.from("tenants").update({
          company_name: input.company_name, plan: input.plan, is_active: input.is_active, domain: input.domain || null,
        }).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("tenants").insert({
          company_name: input.company_name, plan: input.plan, is_active: input.is_active, domain: input.domain || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-tenants"] });
      qc.invalidateQueries({ queryKey: ["pa-stats"] });
      toast.success(editTenant ? "Cập nhật thành công" : "Thêm công ty thành công");
      setDialogOpen(false);
      setEditTenant(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {/* Detail panel */}
      {detailId && detailQuery.data && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{detailQuery.data.company_name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setDetailId(null)}>Đóng</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground">Gói:</span> <Badge className={planConfig[detailQuery.data.plan]?.color || ""}>{planConfig[detailQuery.data.plan]?.label || detailQuery.data.plan}</Badge></div>
              <div><span className="text-muted-foreground">Trạng thái:</span> <Badge variant={detailQuery.data.is_active ? "default" : "secondary"}>{detailQuery.data.is_active ? "Hoạt động" : "Tạm ngưng"}</Badge></div>
              <div><span className="text-muted-foreground">Người dùng:</span> <span className="font-semibold">{detailQuery.data.profileCount}</span></div>
              <div><span className="text-muted-foreground">Tòa nhà:</span> <span className="font-semibold">{detailQuery.data.buildingCount}</span></div>
            </div>

            {detailQuery.data.profiles?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Người dùng ({detailQuery.data.profiles.length})</h4>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead className="text-xs">Tên</TableHead>
                      <TableHead className="text-xs">SĐT</TableHead>
                      <TableHead className="text-xs">Vai trò</TableHead>
                      <TableHead className="text-xs">Ngày tạo</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {detailQuery.data.profiles.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{p.full_name || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.phone || "—"}</TableCell>
                          <TableCell className="text-xs">{p.roles.map((r: string) => roleLabels[r] || r).join(", ") || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("vi-VN")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {detailQuery.data.buildings?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Tòa nhà ({detailQuery.data.buildings.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {detailQuery.data.buildings.map((b: any) => (
                    <div key={b.id} className="p-2 rounded-lg bg-muted/50 text-xs">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-muted-foreground">{b.staff_online}/{b.staff_total} nhân viên</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm công ty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button className="gap-2" onClick={() => { setEditTenant(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Thêm</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Công ty</TableHead>
                <TableHead>Tên miền</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(tenants?.data || []).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Chưa có công ty nào</TableCell></TableRow>
                ) : (tenants?.data || []).map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.company_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{t.domain || "—"}</TableCell>
                    <TableCell><Badge className={planConfig[t.plan]?.color || ""}>{planConfig[t.plan]?.label || t.plan}</Badge></TableCell>
                    <TableCell><Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Hoạt động" : "Tạm ngưng"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(t.created_at).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setDetailId(t.id)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditTenant(t); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {tenants && tenants.total > 0 && <p className="text-sm text-muted-foreground mt-3">Tổng: {tenants.total} công ty</p>}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditTenant(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTenant ? "Sửa công ty" : "Thêm công ty mới"}</DialogTitle></DialogHeader>
          <TenantForm tenant={editTenant} onSave={(d) => saveMut.mutate(d)} saving={saveMut.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────
function UsersTab() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAllUsers(search);
  const [editing, setEditing] = useState<{ user_id: string; tenant_id: string; full_name: string; roles: string[] } | null>(null);

  return (
    <>
    <Card>
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm người dùng..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data?.data || []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Không tìm thấy người dùng</TableCell></TableRow>
              ) : (data?.data || []).map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-sm">{u.tenant_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.map((r: string) => (
                        <Badge key={r} variant="secondary" className="text-[10px]">{roleLabels[r] || r}</Badge>
                      ))}
                      {u.roles.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.phone || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 px-2"
                      onClick={() => setEditing({ user_id: u.user_id, tenant_id: u.tenant_id, full_name: u.full_name || u.tenant_name, roles: u.roles })}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {data && data.total > 0 && <p className="text-sm text-muted-foreground mt-3">Tổng: {data.total} người dùng</p>}
      </CardContent>
    </Card>
    <EditRolesDialog editing={editing} onClose={() => setEditing(null)} />
    </>
  );
}

const ALL_ROLES: { value: string; label: string; desc: string }[] = [
  { value: "platform_admin",   label: "Platform Admin",   desc: "Quản trị toàn nền tảng SaaS, vượt qua mọi tenant" },
  { value: "admin",            label: "Admin tenant",     desc: "Quản trị viên trong công ty" },
  { value: "operator",         label: "Operator",         desc: "Vận hành Command Center, sự cố, dịch vụ" },
  { value: "hr_manager",       label: "HR",               desc: "Quản lý nhân sự, hợp đồng, chứng chỉ" },
  { value: "finance_manager",  label: "Tài chính",        desc: "Hoá đơn, lương, ngân sách" },
  { value: "guard",            label: "Bảo vệ",           desc: "Tuần tra, kiểm soát ra vào" },
  { value: "resident",         label: "Cư dân",           desc: "Cư dân sử dụng STOS Life" },
];

function EditRolesDialog({ editing, onClose }: { editing: { user_id: string; tenant_id: string; full_name: string; roles: string[] } | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selection whenever a different user is opened
  useEffect(() => {
    if (editing) setSelected(new Set(editing.roles));
    else setSelected(new Set());
  }, [editing?.user_id]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const target = Array.from(selected);
      const current = new Set(editing.roles);
      const toAdd = target.filter((r) => !current.has(r));
      const toRemove = editing.roles.filter((r) => !selected.has(r));

      if (toRemove.length) {
        const { error } = await db
          .from("user_roles")
          .delete()
          .eq("user_id", editing.user_id)
          .in("role", toRemove as any);
        if (error) throw error;
      }
      if (toAdd.length) {
        const rows = toAdd.map((role) => ({
          user_id: editing.user_id,
          tenant_id: editing.tenant_id,
          role: role as any,
        }));
        const { error } = await db.from("user_roles").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-users"] });
      toast.success("Đã cập nhật vai trò");
      handleClose();
    },
    onError: (e: any) => toast.error(e.message || "Lỗi cập nhật vai trò"),
  });

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  const toggle = (role: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(role) ? next.delete(role) : next.add(role);
      return next;
    });
  };

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phân quyền — {editing?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {ALL_ROLES.map((r) => {
            const checked = selected.has(r.value);
            return (
              <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-bg2"}`}>
                <Switch checked={checked} onCheckedChange={() => toggle(r.value)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{r.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>Huỷ</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// ─── Audit Tab ─────────────────────────────────────────────────────────
function AuditTab() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAuditLogs(search);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  const SENSITIVE_ACTIONS = ["delete", "role_change", "role_grant", "role_revoke", "tenant_delete", "user_delete", "permission_change", "subscription_cancel", "plan_delete"];
  const isSensitive = (action: string) => SENSITIVE_ACTIONS.some((s) => action?.toLowerCase().includes(s));

  const ACTION_LABELS: Record<string, string> = {
    create: "Tạo mới", insert: "Tạo mới", update: "Cập nhật", delete: "Xoá",
    role_grant: "Cấp quyền", role_revoke: "Thu hồi quyền", role_change: "Đổi quyền",
    login: "Đăng nhập", logout: "Đăng xuất",
  };
  const labelOf = (action: string) => {
    const key = Object.keys(ACTION_LABELS).find((k) => action?.toLowerCase().includes(k));
    return key ? ACTION_LABELS[key] : action;
  };

  const allRows = data?.data || [];
  const entityTypes = Array.from(new Set(allRows.map((l: any) => l.entity_type).filter(Boolean)));
  const filtered = allRows.filter((l: any) => {
    if (entityFilter !== "all" && l.entity_type !== entityFilter) return false;
    if (sensitiveOnly && !isSensitive(l.action)) return false;
    return true;
  });
  const sensitiveCount = allRows.filter((l: any) => isSensitive(l.action)).length;
  const last24h = allRows.filter((l: any) => Date.now() - new Date(l.created_at).getTime() < 86400000).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Tổng bản ghi" value={data?.total || 0} color="text-primary" />
        <StatCard icon={Clock} label="24 giờ qua" value={last24h} color="text-blue-500" />
        <StatCard icon={AlertTriangle} label="Thao tác nhạy cảm" value={sensitiveCount} color="text-amber-500" />
        <StatCard icon={Shield} label="Loại đối tượng" value={entityTypes.length} color="text-emerald-500" />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm theo hành động..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Loại đối tượng" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đối tượng</SelectItem>
                {entityTypes.map((t: any) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 rounded-md border border-border bg-bg2/50">
              <Switch checked={sensitiveOnly} onCheckedChange={setSensitiveOnly} id="sens" />
              <Label htmlFor="sens" className="text-xs cursor-pointer whitespace-nowrap">Chỉ thao tác nhạy cảm</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Không có nhật ký phù hợp</p>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-[140px]">Thời gian</TableHead>
                  <TableHead>Người thao tác</TableHead>
                  <TableHead>Công ty</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead className="w-[110px]">IP</TableHead>
                  <TableHead className="w-[80px] text-right">Chi tiết</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((l: any) => {
                    const sens = isSensitive(l.action);
                    return (
                      <TableRow key={l.id} className={sens ? "bg-amber-500/5" : undefined}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString("vi-VN")}</TableCell>
                        <TableCell className="text-sm">{l.user_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.tenant_name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${sens ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-foreground"}`}>
                            {sens && <AlertTriangle className="h-3 w-3" />}
                            {labelOf(l.action)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium">{l.entity_type}</div>
                          {l.entity_id && <div className="text-muted-foreground font-mono text-[10px]">{l.entity_id.slice(0, 8)}…</div>}
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground font-mono">{l.ip_address || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setDetail(l)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )
          )}
          {data && data.total > 0 && <p className="text-xs text-muted-foreground mt-3">Hiển thị {filtered.length} / {data.total} bản ghi (giới hạn 100 mới nhất)</p>}
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chi tiết nhật ký</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Thời gian</Label><div>{new Date(detail.created_at).toLocaleString("vi-VN")}</div></div>
                <div><Label className="text-xs text-muted-foreground">Hành động</Label><div className="font-medium">{detail.action}</div></div>
                <div><Label className="text-xs text-muted-foreground">Người thao tác</Label><div>{detail.user_name}</div></div>
                <div><Label className="text-xs text-muted-foreground">Công ty</Label><div>{detail.tenant_name}</div></div>
                <div><Label className="text-xs text-muted-foreground">Đối tượng</Label><div>{detail.entity_type}</div></div>
                <div><Label className="text-xs text-muted-foreground">ID đối tượng</Label><div className="font-mono text-xs">{detail.entity_id || "—"}</div></div>
                <div><Label className="text-xs text-muted-foreground">IP</Label><div className="font-mono text-xs">{detail.ip_address || "—"}</div></div>
              </div>
              {detail.old_data && (
                <div>
                  <Label className="text-xs text-muted-foreground">Dữ liệu cũ</Label>
                  <pre className="mt-1 p-3 bg-bg2 rounded-md text-[11px] font-mono overflow-auto max-h-40 border border-border">{JSON.stringify(detail.old_data, null, 2)}</pre>
                </div>
              )}
              {detail.new_data && (
                <div>
                  <Label className="text-xs text-muted-foreground">Dữ liệu mới</Label>
                  <pre className="mt-1 p-3 bg-bg2 rounded-md text-[11px] font-mono overflow-auto max-h-40 border border-border">{JSON.stringify(detail.new_data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Billing Tab ───────────────────────────────────────────────────────
function BillingTab() {
  const qc = useQueryClient();
  const { data: subs, isLoading } = useSubscriptions();
  const { data: tenants } = useTenants("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSub, setEditSub] = useState<any>(null);

  const saveMut = useMutation({
    mutationFn: async (input: any) => {
      if (input.id) {
        const { id, tenant_name, ...rest } = input;
        const { error } = await db.from("tenant_subscriptions").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { tenant_name, ...rest } = input;
        const { error } = await db.from("tenant_subscriptions").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-subscriptions"] });
      toast.success(editSub ? "Cập nhật thành công" : "Thêm gói thành công");
      setDialogOpen(false);
      setEditSub(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const renewMut = useMutation({
    mutationFn: async (sub: any) => {
      const base = sub.expires_at && new Date(sub.expires_at) > new Date()
        ? new Date(sub.expires_at)
        : new Date();
      const next = new Date(base);
      if (sub.billing_cycle === "yearly") next.setFullYear(next.getFullYear() + 1);
      else next.setMonth(next.getMonth() + 1);
      const { error } = await db.from("tenant_subscriptions").update({
        expires_at: next.toISOString(),
        status: "active",
        canceled_at: null,
      }).eq("id", sub.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-subscriptions"] });
      toast.success("Đã gia hạn subscription");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancelMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("tenant_subscriptions").update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-subscriptions"] });
      toast.success("Đã huỷ subscription");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("tenant_subscriptions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-subscriptions"] });
      toast.success("Đã xoá subscription");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Revenue summary
  const totalRevenue = (subs || []).filter((s) => s.status === "active").reduce((sum, s) => sum + Number(s.price || 0), 0);
  const activeCount = (subs || []).filter((s) => s.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={CreditCard} label="Gói đang hoạt động" value={activeCount} color="text-emerald-500" />
        <StatCard icon={TrendingUp} label="Doanh thu hàng tháng" value={`${totalRevenue.toLocaleString("vi-VN")}tr`} color="text-primary" />
        <StatCard icon={AlertTriangle} label="Quá hạn" value={(subs || []).filter((s) => s.status === "past_due").length} color="text-amber-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Danh sách gói dịch vụ</CardTitle>
            <Button size="sm" className="gap-2" onClick={() => { setEditSub(null); setDialogOpen(true); }}><Plus className="h-3.5 w-3.5" /> Thêm gói</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            (subs || []).length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Chưa có gói dịch vụ nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Công ty</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Giá (tr/tháng)</TableHead>
                  <TableHead>Chu kỳ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Bắt đầu</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(subs || []).map((s: any) => {
                    const st = subStatusConfig[s.status] || subStatusConfig.active;
                    const StIcon = st.icon;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.tenant_name}</TableCell>
                        <TableCell><Badge className={planConfig[s.plan]?.color || ""}>{planConfig[s.plan]?.label || s.plan}</Badge></TableCell>
                        <TableCell className="font-semibold">{Number(s.price).toLocaleString("vi-VN")}</TableCell>
                        <TableCell className="text-sm">{s.billing_cycle === "yearly" ? "Năm" : "Tháng"}</TableCell>
                        <TableCell><div className={`flex items-center gap-1 text-xs font-medium ${st.color}`}><StIcon className="h-3.5 w-3.5" /> {st.label}</div></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(s.started_at).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.expires_at ? new Date(s.expires_at).toLocaleDateString("vi-VN") : "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button variant="ghost" size="icon" title="Gia hạn" disabled={renewMut.isPending} onClick={() => renewMut.mutate(s)}>
                              <RefreshCw className="h-4 w-4 text-emerald-500" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Sửa" onClick={() => { setEditSub(s); setDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Huỷ subscription"
                              disabled={s.status === "canceled" || cancelMut.isPending}
                              onClick={() => { if (confirm(`Huỷ subscription của "${s.tenant_name}"?`)) cancelMut.mutate(s.id); }}
                            >
                              <Ban className="h-4 w-4 text-amber-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Xoá"
                              onClick={() => { if (confirm("Xoá vĩnh viễn subscription này?")) deleteMut.mutate(s.id); }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditSub(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSub ? "Sửa gói dịch vụ" : "Thêm gói dịch vụ"}</DialogTitle></DialogHeader>
          <SubscriptionForm sub={editSub} tenants={tenants?.data || []} onSave={(d) => saveMut.mutate(d)} saving={saveMut.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Plans Tab (Landing Page sync) ────────────────────────────────────
function PlansTab() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["pa-service-plans"],
    queryFn: async () => {
      const { data, error } = await db.from("service_plans").select("*").order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  const saveMut = useMutation({
    mutationFn: async (input: any) => {
      const { id, ...rest } = input;
      if (id) {
        const { error } = await db.from("service_plans").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await db.from("service_plans").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-service-plans"] });
      qc.invalidateQueries({ queryKey: ["landing-plans"] });
      toast.success(editPlan ? "Cập nhật thành công" : "Thêm gói thành công");
      setDialogOpen(false);
      setEditPlan(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("service_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pa-service-plans"] });
      qc.invalidateQueries({ queryKey: ["landing-plans"] });
      toast.success("Đã xóa gói");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Gói dịch vụ — Landing Page</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Thay đổi ở đây sẽ tự động cập nhật trên trang Landing Page</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditPlan(null); setDialogOpen(true); }}><Plus className="h-3.5 w-3.5" /> Thêm gói</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <div className="space-y-3">
              {(plans || []).map((p: any) => {
                const features: string[] = Array.isArray(p.features) ? p.features : [];
                return (
                  <div key={p.id} className={`rounded-lg border p-4 ${p.is_popular ? "border-primary bg-primary/5" : "border-border"} ${!p.is_active ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{p.name}</h3>
                          {p.is_popular && <Badge className="bg-primary/10 text-primary text-[10px]">Phổ biến</Badge>}
                          {!p.is_active && <Badge variant="secondary" className="text-[10px]">Ẩn</Badge>}
                          <span className="text-sm font-bold text-primary ml-auto mr-2">
                            {p.price > 0 ? `${p.price}tr/tháng` : (p.slug === "enterprise" ? "Liên hệ" : "Miễn phí")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {features.map((f: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px] font-normal">{f}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditPlan(p); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Xóa gói này?")) deleteMut.mutate(p.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditPlan(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editPlan ? "Sửa gói dịch vụ" : "Thêm gói dịch vụ"}</DialogTitle></DialogHeader>
          <PlanForm plan={editPlan} onSave={(d) => saveMut.mutate(d)} saving={saveMut.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanForm({ plan, onSave, saving }: { plan: any; onSave: (d: any) => void; saving: boolean }) {
  const [name, setName] = useState(plan?.name || "");
  const [slug, setSlug] = useState(plan?.slug || "");
  const [price, setPrice] = useState(plan?.price?.toString() || "0");
  const [description, setDescription] = useState(plan?.description || "");
  const [featuresText, setFeaturesText] = useState(
    Array.isArray(plan?.features) ? (plan.features as string[]).join("\n") : ""
  );
  const [isPopular, setIsPopular] = useState(plan?.is_popular ?? false);
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(plan?.sort_order?.toString() || "0");
  const [ctaText, setCtaText] = useState(plan?.cta_text || "Bắt đầu ngay");

  const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Tên gói *</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!plan) setSlug(autoSlug(e.target.value)); }} placeholder="Professional" /></div>
        <div><Label>Slug *</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="pro" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Giá (triệu VNĐ/tháng)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = Miễn phí" /></div>
        <div><Label>Thứ tự hiển thị</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></div>
      </div>
      <div><Label>Mô tả</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Phù hợp cho..." /></div>
      <div><Label>Tính năng (mỗi dòng 1 tính năng)</Label><Textarea rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Tối đa 50 tòa nhà\n200 nhân viên\nHỗ trợ 24/7"} /></div>
      <div><Label>Nút CTA</Label><Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Bắt đầu ngay" /></div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2"><Switch checked={isPopular} onCheckedChange={setIsPopular} /><Label>Gói nổi bật</Label></div>
        <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Hiển thị</Label></div>
      </div>
      <Button className="w-full" disabled={!name.trim() || !slug.trim() || saving} onClick={() => onSave({
        id: plan?.id, name: name.trim(), slug: slug.trim(), price: Number(price) || 0,
        description, features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
        is_popular: isPopular, is_active: isActive, sort_order: Number(sortOrder) || 0, cta_text: ctaText,
      })}>
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{plan ? "Cập nhật" : "Thêm mới"}
      </Button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color || "text-primary"} shrink-0`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function TenantForm({ tenant, onSave, saving }: { tenant: any; onSave: (d: any) => void; saving: boolean }) {
  const [name, setName] = useState(tenant?.company_name || "");
  const [domain, setDomain] = useState(tenant?.domain || "");
  const [plan, setPlan] = useState(tenant?.plan || "free");
  const [isActive, setIsActive] = useState(tenant?.is_active ?? true);

  return (
    <div className="space-y-4">
      <div><Label>Tên công ty *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Công ty TNHH Bảo vệ ABC" /></div>
      <div><Label>Tên miền</Label><Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="abc-security.com" /></div>
      <div>
        <Label>Gói dịch vụ</Label>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Miễn phí</SelectItem>
            <SelectItem value="basic">Cơ bản</SelectItem>
            <SelectItem value="pro">Chuyên nghiệp</SelectItem>
            <SelectItem value="enterprise">Doanh nghiệp</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Hoạt động</Label></div>
      <Button className="w-full" disabled={!name.trim() || saving} onClick={() => onSave({ id: tenant?.id, company_name: name.trim(), domain, plan, is_active: isActive })}>
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{tenant ? "Cập nhật" : "Thêm mới"}
      </Button>
    </div>
  );
}

function SubscriptionForm({ sub, tenants, onSave, saving }: { sub: any; tenants: any[]; onSave: (d: any) => void; saving: boolean }) {
  const [tenantId, setTenantId] = useState(sub?.tenant_id || "");
  const [plan, setPlan] = useState(sub?.plan || "basic");
  const [price, setPrice] = useState(sub?.price?.toString() || "");
  const [cycle, setCycle] = useState(sub?.billing_cycle || "monthly");
  const [status, setStatus] = useState(sub?.status || "active");
  const [expiresAt, setExpiresAt] = useState(sub?.expires_at ? sub.expires_at.split("T")[0] : "");
  const [notes, setNotes] = useState(sub?.notes || "");

  return (
    <div className="space-y-4">
      {!sub && (
        <div>
          <Label>Công ty *</Label>
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger><SelectValue placeholder="Chọn công ty" /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.company_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Gói dịch vụ</Label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Miễn phí</SelectItem>
              <SelectItem value="basic">Cơ bản</SelectItem>
              <SelectItem value="pro">Chuyên nghiệp</SelectItem>
              <SelectItem value="enterprise">Doanh nghiệp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Giá (triệu VNĐ)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Chu kỳ</Label>
          <Select value={cycle} onValueChange={setCycle}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Hàng tháng</SelectItem>
              <SelectItem value="yearly">Hàng năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="trial">Dùng thử</SelectItem>
              <SelectItem value="past_due">Quá hạn</SelectItem>
              <SelectItem value="canceled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Ngày hết hạn</Label><Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></div>
      <div><Label>Ghi chú</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú thêm..." /></div>
      <Button className="w-full" disabled={(!sub && !tenantId) || saving} onClick={() => onSave({
        id: sub?.id, tenant_id: sub?.tenant_id || tenantId, plan, price: Number(price) || 0,
        billing_cycle: cycle, status, expires_at: expiresAt ? new Date(expiresAt).toISOString() : null, notes: notes || null,
      })}>
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{sub ? "Cập nhật" : "Thêm mới"}
      </Button>
    </div>
  );
}
