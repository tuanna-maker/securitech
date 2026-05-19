-- STOS Life + STOS Guard — Full mobile backend setup
-- Run in Supabase SQL Editor. Deploy life-handler, guard-handler after.

BEGIN;

ALTER TABLE public.quick_service_requests
  ADD COLUMN IF NOT EXISTS app_status text,
  ADD COLUMN IF NOT EXISTS priority_tier text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS sla_accept_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS lifecycle_meta jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS app_status text,
  ADD COLUMN IF NOT EXISTS priority_tier text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS sla_accept_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS lifecycle_meta jsonb DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.building_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  life_enabled boolean NOT NULL DEFAULT true,
  sla_accept_minutes int NOT NULL DEFAULT 5,
  auto_complete_minutes int NOT NULL DEFAULT 15,
  max_concurrent_requests_per_guard int NOT NULL DEFAULT 1,
  service_catalog jsonb NOT NULL DEFAULT '[]'::jsonb,
  attendance_zones jsonb NOT NULL DEFAULT '[]'::jsonb,
  farm_fresh_enabled boolean NOT NULL DEFAULT false,
  hotline text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, building_id)
);

CREATE TABLE IF NOT EXISTS public.resident_activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS public.visitor_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  visitor_name text NOT NULL,
  visit_start timestamptz NOT NULL,
  visit_end timestamptz NOT NULL,
  vehicle_plate text,
  purpose text,
  qr_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  access_log_id uuid REFERENCES public.access_logs(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  request_id uuid NOT NULL,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  staff_member_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  stars int NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_type, request_id)
);

CREATE TABLE IF NOT EXISTS public.guard_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_member_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  shift_schedule_id uuid REFERENCES public.shift_schedules(id),
  zone_id text,
  lat double precision,
  lng double precision,
  checked_in_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guard_location_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_member_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  request_id uuid,
  request_type text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.request_declines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  request_id uuid NOT NULL,
  staff_member_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.life_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  request_id uuid NOT NULL,
  from_status text,
  to_status text NOT NULL,
  actor_type text,
  actor_id uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  app_role text NOT NULL,
  token text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_role, token)
);

CREATE TABLE IF NOT EXISTS public.farm_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  unit text DEFAULT 'kg',
  stock int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  delivery_slot timestamptz,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.farm_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.farm_products(id),
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  UNIQUE(order_id, product_id)
);

CREATE OR REPLACE FUNCTION public.get_resident_id_for_user(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.residents WHERE user_id = _user_id AND status = 'active' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_staff_member_id_for_user(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.staff_members WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.haversine_m(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
  SELECT 6371000 * 2 * asin(sqrt(power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)));
$$;

CREATE OR REPLACE FUNCTION public.expire_stale_life_requests()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cnt int := 0;
BEGIN
  UPDATE public.quick_service_requests SET app_status = 'expired'
  WHERE app_status = 'submitted' AND assigned_to IS NULL AND sla_accept_deadline < now();
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$$;

-- RLS helpers + policies
ALTER TABLE public.building_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guard_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guard_location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents read own profile" ON public.residents;
CREATE POLICY "Residents read own profile" ON public.residents FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Residents manage own quick requests" ON public.quick_service_requests;
CREATE POLICY "Residents manage own quick requests" ON public.quick_service_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'resident'::app_role) AND resident_id = public.get_resident_id_for_user(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'resident'::app_role) AND resident_id = public.get_resident_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Guards read building quick queue" ON public.quick_service_requests;
CREATE POLICY "Guards read building quick queue" ON public.quick_service_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'guard'::app_role) AND building_id IN (SELECT building_id FROM public.staff_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Guards update quick requests" ON public.quick_service_requests;
CREATE POLICY "Guards update quick requests" ON public.quick_service_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'guard'::app_role) AND building_id IN (SELECT building_id FROM public.staff_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Residents manage visitor_invites" ON public.visitor_invites;
CREATE POLICY "Residents manage visitor_invites" ON public.visitor_invites FOR ALL TO authenticated
  USING (resident_id = public.get_resident_id_for_user(auth.uid()))
  WITH CHECK (resident_id = public.get_resident_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Tenant read building_features" ON public.building_features;
CREATE POLICY "Tenant read building_features" ON public.building_features FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Residents read own parcels" ON public.parcels;
CREATE POLICY "Residents read own parcels" ON public.parcels FOR SELECT TO authenticated
  USING (resident_id = public.get_resident_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Residents read announcements" ON public.announcements;
CREATE POLICY "Residents read announcements" ON public.announcements FOR SELECT TO authenticated
  USING (building_id IN (SELECT building_id FROM public.residents WHERE user_id = auth.uid()));

-- app_status constraints
DO $$ BEGIN
  ALTER TABLE public.quick_service_requests ADD CONSTRAINT quick_service_requests_app_status_check
    CHECK (app_status IS NULL OR app_status IN ('submitted','accepted','en_route','on_site','completed','cancelled','expired','escalated'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.support_requests ADD CONSTRAINT support_requests_app_status_check
    CHECK (app_status IS NULL OR app_status IN ('submitted','accepted','en_route','on_site','completed','cancelled','expired','escalated'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_quick_requests_building_app_status ON public.quick_service_requests(building_id, app_status);
CREATE INDEX IF NOT EXISTS idx_quick_requests_sla_deadline ON public.quick_service_requests(sla_accept_deadline) WHERE assigned_to IS NULL;
CREATE INDEX IF NOT EXISTS idx_support_requests_building_app_status ON public.support_requests(building_id, app_status);

-- Audit timeline on status change
CREATE OR REPLACE FUNCTION public.log_life_request_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.app_status IS DISTINCT FROM NEW.app_status) THEN
    INSERT INTO public.life_request_events (tenant_id, request_type, request_id, from_status, to_status, actor_type, meta)
    VALUES (NEW.tenant_id, TG_TABLE_NAME, NEW.id, OLD.app_status, NEW.app_status, 'system', '{}'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quick_request_life_events ON public.quick_service_requests;
CREATE TRIGGER trg_quick_request_life_events
  AFTER UPDATE ON public.quick_service_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_life_request_event();

DROP TRIGGER IF EXISTS trg_support_request_life_events ON public.support_requests;
CREATE TRIGGER trg_support_request_life_events
  AFTER UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_life_request_event();

-- Realtime (ignore if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.guard_location_pings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.life_request_events;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_invites;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_service_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.support_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.parcels;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_calls;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "Users manage own device_tokens" ON public.device_tokens;
CREATE POLICY "Users manage own device_tokens" ON public.device_tokens FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Guards insert attendance" ON public.guard_attendance;
CREATE POLICY "Guards insert attendance" ON public.guard_attendance FOR INSERT TO authenticated
  WITH CHECK (staff_member_id = public.get_staff_member_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Guards insert location pings" ON public.guard_location_pings;
CREATE POLICY "Guards insert location pings" ON public.guard_location_pings FOR INSERT TO authenticated
  WITH CHECK (staff_member_id = public.get_staff_member_id_for_user(auth.uid()));

-- Optional seed: replace BUILDING_UUID / TENANT_UUID before uncommenting
/*
INSERT INTO public.building_features (tenant_id, building_id, service_catalog, attendance_zones, farm_fresh_enabled)
VALUES (
  'TENANT_UUID'::uuid,
  'BUILDING_UUID'::uuid,
  '[{"id":"grab","label":"Grab","icon":"car"},{"id":"cleaning","label":"Dọn dẹp","icon":"sparkles"}]'::jsonb,
  '[{"id":"gate","name":"Cổng chính","lat":10.77,"lng":106.69,"radius_m":80}]'::jsonb,
  true
) ON CONFLICT (tenant_id, building_id) DO UPDATE SET service_catalog = EXCLUDED.service_catalog;
*/

COMMIT;
