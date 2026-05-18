
-- ========================
-- ENUMS
-- ========================
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'guard', 'resident', 'hr_manager', 'finance_manager');
CREATE TYPE public.building_status AS ENUM ('normal', 'warning', 'critical');
CREATE TYPE public.staff_status AS ENUM ('on-patrol', 'stationary', 'offline');
CREATE TYPE public.incident_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.incident_status AS ENUM ('new', 'processing', 'resolved', 'escalated');
CREATE TYPE public.parcel_status AS ENUM ('received', 'notified', 'picked_up', 'returned');
CREATE TYPE public.request_status AS ENUM ('open', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE public.request_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.contractor_status AS ENUM ('active', 'completed', 'scheduled', 'suspended');
CREATE TYPE public.visitor_type AS ENUM ('guest', 'shipper', 'contractor', 'vip');
CREATE TYPE public.client_status AS ENUM ('active', 'negotiating', 'prospect', 'churned');
CREATE TYPE public.contract_status AS ENUM ('active', 'expiring', 'expired', 'draft');
CREATE TYPE public.employee_status AS ENUM ('active', 'probation', 'on_leave', 'terminated');
CREATE TYPE public.patrol_status AS ENUM ('active', 'completed', 'missed', 'upcoming');
CREATE TYPE public.sos_status AS ENUM ('pending', 'dispatched', 'resolved', 'false_alarm');
CREATE TYPE public.deal_stage AS ENUM ('lead', 'meeting', 'proposal', 'negotiation', 'closed', 'lost');

-- ========================
-- TENANTS
-- ========================
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  domain TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ========================
-- PROFILES
-- ========================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);

-- ========================
-- USER ROLES
-- ========================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_roles_tenant ON public.user_roles(tenant_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- ========================
-- HELPER: get tenant_id for current user
-- ========================
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ========================
-- HELPER: has_role check
-- ========================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ========================
-- HELPER: has_role within tenant
-- ========================
CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id UUID, _tenant_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND tenant_id = _tenant_id AND role = _role
  );
$$;

-- ========================
-- AUDIT LOGS
-- ========================
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ========================
-- SYSTEM EVENTS (realtime)
-- ========================
CREATE TABLE public.system_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  is_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_events_tenant ON public.system_events(tenant_id);
CREATE INDEX idx_events_type ON public.system_events(event_type);
CREATE INDEX idx_events_unprocessed ON public.system_events(is_processed) WHERE NOT is_processed;

-- ========================
-- updated_at trigger function
-- ========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- RLS POLICIES: tenants
-- ========================
CREATE POLICY "Users see own tenant" ON public.tenants FOR SELECT USING (id = public.get_user_tenant_id());

-- ========================
-- RLS POLICIES: profiles
-- ========================
CREATE POLICY "Users see profiles in tenant" ON public.profiles FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================
-- RLS POLICIES: user_roles
-- ========================
CREATE POLICY "Users see roles in tenant" ON public.user_roles FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_tenant_role(auth.uid(), tenant_id, 'admin'));

-- ========================
-- RLS POLICIES: audit_logs
-- ========================
CREATE POLICY "Admins see audit logs" ON public.audit_logs FOR SELECT USING (
  tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(), 'admin')
);

-- ========================
-- RLS POLICIES: system_events
-- ========================
CREATE POLICY "Users see events in tenant" ON public.system_events FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "System inserts events" ON public.system_events FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ========================
-- Auto-create profile on signup trigger
-- ========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, tenant_id, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, gen_random_uuid()),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;
