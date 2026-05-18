
-- ============================================================
-- PART 1: NEW TABLES
-- ============================================================

CREATE TABLE public.incident_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.staff_members(id),
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees incident timeline" ON public.incident_timeline FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Operators manage incident timeline" ON public.incident_timeline FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE TABLE public.shift_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT NOT NULL DEFAULT 'day',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees shifts" ON public.shift_schedules FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Admins manage shifts" ON public.shift_schedules FOR ALL USING (tenant_id = get_user_tenant_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operator')));

CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  cert_name TEXT NOT NULL,
  issuing_authority TEXT,
  issued_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees certifications" ON public.certifications FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "HR manages certifications" ON public.certifications FOR ALL USING (tenant_id = get_user_tenant_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')));

CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'annual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees leave requests" ON public.leave_requests FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "HR manages leave requests" ON public.leave_requests FOR ALL USING (tenant_id = get_user_tenant_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')));

CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  author_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees posts" ON public.posts FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Operators manage posts" ON public.posts FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'general',
  sender_id UUID,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees chat messages" ON public.chat_messages FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant members send messages" ON public.chat_messages FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

-- ============================================================
-- PART 2: INDEXES (all tables)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_buildings_tenant ON public.buildings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_tenant ON public.staff_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_building ON public.staff_members(building_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON public.staff_members(status);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON public.employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_building ON public.employees(building_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON public.incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_building ON public.incidents(building_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_tenant ON public.access_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_building ON public.access_logs(building_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_checked_in ON public.access_logs(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON public.alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_building ON public.alerts(building_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON public.alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON public.announcements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON public.clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_contractors_tenant ON public.contractors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_parcels_tenant ON public.parcels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parcels_building ON public.parcels(building_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);
CREATE INDEX IF NOT EXISTS idx_patrol_routes_tenant ON public.patrol_routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patrol_routes_building ON public.patrol_routes(building_id);
CREATE INDEX IF NOT EXISTS idx_patrol_routes_status ON public.patrol_routes(status);
CREATE INDEX IF NOT EXISTS idx_payroll_records_tenant ON public.payroll_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_employee ON public.payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_tenant ON public.pipeline_deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_stage ON public.pipeline_deals(stage);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_service_tenant ON public.quick_service_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quick_service_building ON public.quick_service_requests(building_id);
CREATE INDEX IF NOT EXISTS idx_quick_service_status ON public.quick_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_residents_tenant ON public.residents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_residents_building ON public.residents(building_id);
CREATE INDEX IF NOT EXISTS idx_sos_calls_tenant ON public.sos_calls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sos_calls_building ON public.sos_calls(building_id);
CREATE INDEX IF NOT EXISTS idx_sos_calls_status ON public.sos_calls(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_tenant ON public.support_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_building ON public.support_requests(building_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_system_events_tenant ON public.system_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_events_type ON public.system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_training_courses_tenant ON public.training_courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_zalo_groups_tenant ON public.zalo_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zalo_groups_building ON public.zalo_groups(building_id);
CREATE INDEX IF NOT EXISTS idx_zalo_messages_group ON public.zalo_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_zalo_messages_created ON public.zalo_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_tenant ON public.incident_timeline(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_incident ON public.incident_timeline(incident_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_tenant ON public.shift_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_staff ON public.shift_schedules(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_building ON public.shift_schedules(building_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_date ON public.shift_schedules(shift_date);
CREATE INDEX IF NOT EXISTS idx_certifications_tenant ON public.certifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certifications_employee ON public.certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant ON public.leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_posts_tenant ON public.posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_building ON public.posts(building_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant ON public.chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON public.chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- ============================================================
-- PART 3: TRIGGERS
-- ============================================================

CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON public.shift_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PART 4: REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
