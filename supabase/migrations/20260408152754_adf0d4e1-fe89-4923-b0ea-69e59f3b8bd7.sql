
-- ========================
-- RESIDENTS
-- ========================
CREATE TABLE public.residents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  apartment TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  vehicle_plates TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'moved_out')),
  move_in_date DATE,
  special_notes TEXT,
  is_elderly BOOLEAN NOT NULL DEFAULT false,
  is_child_household BOOLEAN NOT NULL DEFAULT false,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_residents_tenant ON public.residents(tenant_id);
CREATE INDEX idx_residents_building ON public.residents(building_id);
CREATE INDEX idx_residents_apartment ON public.residents(building_id, apartment);
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON public.residents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees residents" ON public.residents FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage residents" ON public.residents FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- PARCELS
-- ========================
CREATE TABLE public.parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id),
  tracking_number TEXT,
  sender TEXT,
  parcel_type TEXT,
  status public.parcel_status NOT NULL DEFAULT 'received',
  received_by TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_parcels_tenant ON public.parcels(tenant_id);
CREATE INDEX idx_parcels_building ON public.parcels(building_id);
CREATE INDEX idx_parcels_resident ON public.parcels(resident_id);
CREATE INDEX idx_parcels_status ON public.parcels(tenant_id, status);
CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON public.parcels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees parcels" ON public.parcels FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Guards manage parcels" ON public.parcels FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- SUPPORT REQUESTS
-- ========================
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id),
  assignee_id UUID REFERENCES public.staff_members(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority public.request_priority NOT NULL DEFAULT 'medium',
  status public.request_status NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_support_tenant ON public.support_requests(tenant_id);
CREATE INDEX idx_support_building ON public.support_requests(building_id);
CREATE INDEX idx_support_status ON public.support_requests(tenant_id, status);
CREATE INDEX idx_support_priority ON public.support_requests(tenant_id, priority);
CREATE TRIGGER update_support_updated_at BEFORE UPDATE ON public.support_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees requests" ON public.support_requests FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage requests" ON public.support_requests FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- CONTRACTORS
-- ========================
CREATE TABLE public.contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  work_type TEXT NOT NULL,
  status public.contractor_status NOT NULL DEFAULT 'scheduled',
  start_date DATE,
  end_date DATE,
  contract_value NUMERIC(15,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_contractors_tenant ON public.contractors(tenant_id);
CREATE INDEX idx_contractors_status ON public.contractors(tenant_id, status);
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees contractors" ON public.contractors FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage contractors" ON public.contractors FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- SOS CALLS
-- ========================
CREATE TABLE public.sos_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id),
  caller_name TEXT,
  caller_phone TEXT,
  location_description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status public.sos_status NOT NULL DEFAULT 'pending',
  dispatched_guard_id UUID REFERENCES public.staff_members(id),
  response_time_seconds INTEGER,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sos_calls ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_sos_tenant ON public.sos_calls(tenant_id);
CREATE INDEX idx_sos_building ON public.sos_calls(building_id);
CREATE INDEX idx_sos_status ON public.sos_calls(tenant_id, status);
CREATE TRIGGER update_sos_updated_at BEFORE UPDATE ON public.sos_calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees SOS" ON public.sos_calls FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage SOS" ON public.sos_calls FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- Enable realtime for SOS
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_calls;

-- ========================
-- QUICK SERVICE REQUESTS
-- ========================
CREATE TABLE public.quick_service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('cleaning', 'repair', 'transport', 'other')),
  description TEXT,
  status public.request_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES public.staff_members(id),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cost NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quick_service_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_quicksvc_tenant ON public.quick_service_requests(tenant_id);
CREATE INDEX idx_quicksvc_building ON public.quick_service_requests(building_id);
CREATE TRIGGER update_quicksvc_updated_at BEFORE UPDATE ON public.quick_service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees quick services" ON public.quick_service_requests FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage quick services" ON public.quick_service_requests FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- ZALO GROUPS
-- ========================
CREATE TABLE public.zalo_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  group_name TEXT NOT NULL,
  zalo_link TEXT,
  qr_code_url TEXT,
  admin_name TEXT,
  admin_phone TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.zalo_groups ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_zalo_groups_tenant ON public.zalo_groups(tenant_id);
CREATE INDEX idx_zalo_groups_building ON public.zalo_groups(building_id);
CREATE TRIGGER update_zalo_groups_updated_at BEFORE UPDATE ON public.zalo_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees zalo groups" ON public.zalo_groups FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Operators manage zalo groups" ON public.zalo_groups FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- ZALO MESSAGES
-- ========================
CREATE TABLE public.zalo_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.zalo_groups(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'resident' CHECK (message_type IN ('resident', 'admin')),
  category TEXT CHECK (category IN ('complaint', 'question', 'feedback', 'emergency', NULL)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.zalo_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_zalo_msg_group ON public.zalo_messages(group_id);
CREATE INDEX idx_zalo_msg_created ON public.zalo_messages(created_at DESC);

CREATE POLICY "Tenant sees zalo messages" ON public.zalo_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.zalo_groups g WHERE g.id = group_id AND g.tenant_id = public.get_user_tenant_id())
);
CREATE POLICY "Operators manage zalo messages" ON public.zalo_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.zalo_groups g WHERE g.id = group_id AND g.tenant_id = public.get_user_tenant_id())
);
