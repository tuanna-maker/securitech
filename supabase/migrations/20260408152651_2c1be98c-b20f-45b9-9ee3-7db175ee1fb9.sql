
-- ========================
-- BUILDINGS
-- ========================
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  address TEXT,
  management_company TEXT,
  status public.building_status NOT NULL DEFAULT 'normal',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  staff_online INTEGER NOT NULL DEFAULT 0,
  staff_total INTEGER NOT NULL DEFAULT 0,
  incidents_today INTEGER NOT NULL DEFAULT 0,
  critical_incidents INTEGER NOT NULL DEFAULT 0,
  patrol_completion NUMERIC(5,2) NOT NULL DEFAULT 0,
  sla_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_buildings_tenant ON public.buildings(tenant_id);
CREATE INDEX idx_buildings_status ON public.buildings(tenant_id, status);
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees buildings" ON public.buildings FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Admins manage buildings" ON public.buildings FOR ALL USING (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(), 'admin'));

-- ========================
-- STAFF MEMBERS
-- ========================
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Bảo vệ',
  status public.staff_status NOT NULL DEFAULT 'offline',
  zone TEXT,
  last_check_in TIMESTAMPTZ,
  in_assigned_zone BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  employee_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_staff_tenant ON public.staff_members(tenant_id);
CREATE INDEX idx_staff_building ON public.staff_members(building_id);
CREATE INDEX idx_staff_status ON public.staff_members(tenant_id, status);
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees staff" ON public.staff_members FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Admins manage staff" ON public.staff_members FOR ALL USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator')));

-- ========================
-- PATROL ROUTES
-- ========================
CREATE TABLE public.patrol_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  guard_id UUID REFERENCES public.staff_members(id),
  status public.patrol_status NOT NULL DEFAULT 'upcoming',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  completion NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patrol_routes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_patrol_tenant ON public.patrol_routes(tenant_id);
CREATE INDEX idx_patrol_building ON public.patrol_routes(building_id);
CREATE INDEX idx_patrol_status ON public.patrol_routes(tenant_id, status);
CREATE TRIGGER update_patrol_updated_at BEFORE UPDATE ON public.patrol_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees patrols" ON public.patrol_routes FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Guards manage patrols" ON public.patrol_routes FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- PATROL CHECKPOINTS
-- ========================
CREATE TABLE public.patrol_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.patrol_routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sequence_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.patrol_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant sees checkpoints" ON public.patrol_checkpoints FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patrol_routes r WHERE r.id = route_id AND r.tenant_id = public.get_user_tenant_id())
);
CREATE POLICY "Guards manage checkpoints" ON public.patrol_checkpoints FOR ALL USING (
  EXISTS (SELECT 1 FROM public.patrol_routes r WHERE r.id = route_id AND r.tenant_id = public.get_user_tenant_id())
);

-- ========================
-- INCIDENTS
-- ========================
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id),
  assignee_id UUID REFERENCES public.staff_members(id),
  severity public.incident_severity NOT NULL DEFAULT 'medium',
  status public.incident_status NOT NULL DEFAULT 'new',
  type TEXT NOT NULL,
  description TEXT,
  response_time_minutes INTEGER,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_incidents_tenant ON public.incidents(tenant_id);
CREATE INDEX idx_incidents_building ON public.incidents(building_id);
CREATE INDEX idx_incidents_severity ON public.incidents(tenant_id, severity);
CREATE INDEX idx_incidents_status ON public.incidents(tenant_id, status);
CREATE INDEX idx_incidents_created ON public.incidents(created_at DESC);
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees incidents" ON public.incidents FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage incidents" ON public.incidents FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- ACCESS LOGS
-- ========================
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_type public.visitor_type NOT NULL DEFAULT 'guest',
  phone TEXT,
  id_number TEXT,
  purpose TEXT,
  host_resident TEXT,
  vehicle_plate TEXT,
  photo_url TEXT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  guard_id UUID REFERENCES public.staff_members(id),
  temp_card_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_access_tenant ON public.access_logs(tenant_id);
CREATE INDEX idx_access_building ON public.access_logs(building_id);
CREATE INDEX idx_access_checkin ON public.access_logs(checked_in_at DESC);
CREATE INDEX idx_access_type ON public.access_logs(tenant_id, visitor_type);

CREATE POLICY "Tenant sees access logs" ON public.access_logs FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Guards manage access logs" ON public.access_logs FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- ALERTS
-- ========================
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'success')),
  description TEXT NOT NULL,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alerts_tenant ON public.alerts(tenant_id);
CREATE INDEX idx_alerts_building ON public.alerts(building_id);
CREATE INDEX idx_alerts_unack ON public.alerts(tenant_id, is_acknowledged) WHERE NOT is_acknowledged;

CREATE POLICY "Tenant sees alerts" ON public.alerts FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage alerts" ON public.alerts FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
