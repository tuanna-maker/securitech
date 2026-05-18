
-- ========================
-- CLIENTS (CRM)
-- ========================
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bql' CHECK (type IN ('bql', 'owner')),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  status public.client_status NOT NULL DEFAULT 'prospect',
  contract_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  contract_status public.contract_status NOT NULL DEFAULT 'draft',
  guards_count INTEGER NOT NULL DEFAULT 0,
  sla NUMERIC(5,2) NOT NULL DEFAULT 0,
  satisfaction NUMERIC(3,1) NOT NULL DEFAULT 0,
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clients_tenant ON public.clients(tenant_id);
CREATE INDEX idx_clients_status ON public.clients(tenant_id, status);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees clients" ON public.clients FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator')));

-- ========================
-- CLIENT BUILDINGS (many-to-many)
-- ========================
CREATE TABLE public.client_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  UNIQUE(client_id, building_id)
);
ALTER TABLE public.client_buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant sees client buildings" ON public.client_buildings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.tenant_id = public.get_user_tenant_id())
);
CREATE POLICY "Admins manage client buildings" ON public.client_buildings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.tenant_id = public.get_user_tenant_id())
);

-- ========================
-- PIPELINE DEALS
-- ========================
CREATE TABLE public.pipeline_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value NUMERIC(15,2) NOT NULL DEFAULT 0,
  stage public.deal_stage NOT NULL DEFAULT 'lead',
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  contact TEXT,
  days_in_stage INTEGER NOT NULL DEFAULT 0,
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_deals ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_deals_tenant ON public.pipeline_deals(tenant_id);
CREATE INDEX idx_deals_stage ON public.pipeline_deals(tenant_id, stage);
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.pipeline_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees deals" ON public.pipeline_deals FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Admins manage deals" ON public.pipeline_deals FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- EMPLOYEES (HR)
-- ========================
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  status public.employee_status NOT NULL DEFAULT 'active',
  hire_date DATE,
  salary NUMERIC(15,2),
  certifications TEXT[],
  phone TEXT,
  email TEXT,
  address TEXT,
  id_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_employees_tenant ON public.employees(tenant_id);
CREATE INDEX idx_employees_status ON public.employees(tenant_id, status);
CREATE INDEX idx_employees_building ON public.employees(building_id);
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees employees" ON public.employees FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "HR manages employees" ON public.employees FOR ALL USING (
  tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'))
);

-- ========================
-- PAYROLL RECORDS
-- ========================
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  base_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  overtime NUMERIC(15,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(15,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payroll_tenant ON public.payroll_records(tenant_id);
CREATE INDEX idx_payroll_employee ON public.payroll_records(employee_id);
CREATE INDEX idx_payroll_period ON public.payroll_records(tenant_id, period);
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees payroll" ON public.payroll_records FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Finance manages payroll" ON public.payroll_records FOR ALL USING (
  tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance_manager'))
);

-- ========================
-- INVOICES
-- ========================
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax NUMERIC(15,2) NOT NULL DEFAULT 0,
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(tenant_id, status);
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees invoices" ON public.invoices FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Finance manages invoices" ON public.invoices FOR ALL USING (
  tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance_manager'))
);

-- ========================
-- ANNOUNCEMENTS
-- ========================
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_announcements_tenant ON public.announcements(tenant_id);
CREATE INDEX idx_announcements_building ON public.announcements(building_id);
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees announcements" ON public.announcements FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ========================
-- TRAINING COURSES
-- ========================
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours NUMERIC(5,1),
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  pass_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_courses_tenant ON public.training_courses(tenant_id);
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.training_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant sees courses" ON public.training_courses FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "HR manages courses" ON public.training_courses FOR ALL USING (
  tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'))
);

-- ========================
-- TRAINING ENROLLMENTS
-- ========================
CREATE TABLE public.training_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed')),
  score NUMERIC(5,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, employee_id)
);
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_enrollments_course ON public.training_enrollments(course_id);
CREATE INDEX idx_enrollments_employee ON public.training_enrollments(employee_id);

CREATE POLICY "Tenant sees enrollments" ON public.training_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.training_courses c WHERE c.id = course_id AND c.tenant_id = public.get_user_tenant_id())
);
CREATE POLICY "HR manages enrollments" ON public.training_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.training_courses c WHERE c.id = course_id AND c.tenant_id = public.get_user_tenant_id())
);
