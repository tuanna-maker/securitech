-- STOS Life — Gia đình tôi (household, spending, calendar, fridge, health, moments)

CREATE TABLE IF NOT EXISTS public.life_households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  building_id uuid REFERENCES public.buildings(id) ON DELETE SET NULL,
  primary_resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  name text NOT NULL,
  motto text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.life_household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.life_households(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES public.residents(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  avatar_url text,
  birth_year int,
  accent_color text,
  sort_order int NOT NULL DEFAULT 0,
  is_child boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.life_spending_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.life_households(id) ON DELETE CASCADE,
  year int NOT NULL,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_amount bigint NOT NULL DEFAULT 0,
  prev_total_amount bigint,
  budget_amount bigint,
  UNIQUE (household_id, year, month)
);

CREATE TABLE IF NOT EXISTS public.life_spending_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spending_month_id uuid NOT NULL REFERENCES public.life_spending_months(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount bigint NOT NULL DEFAULT 0,
  pct int NOT NULL DEFAULT 0,
  color_hex text NOT NULL DEFAULT '#2563EB',
  trend_label text,
  trend_up boolean,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.life_spending_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spending_month_id uuid NOT NULL REFERENCES public.life_spending_months(id) ON DELETE CASCADE,
  merchant text NOT NULL,
  category_label text NOT NULL,
  amount bigint NOT NULL,
  spent_on date NOT NULL DEFAULT CURRENT_DATE,
  icon_key text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.life_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.life_households(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.life_household_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_date date NOT NULL,
  starts_at timestamptz,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.life_fridge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.life_households(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  expiry_date date NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.life_health_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.life_households(id) ON DELETE CASCADE,
  member_label text NOT NULL,
  reminder_text text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  reminder_type text NOT NULL DEFAULT 'medication',
  accent_color text NOT NULL DEFAULT '#DB2777',
  is_done boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.life_family_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.life_households(id) ON DELETE CASCADE,
  title text NOT NULL,
  moment_date date NOT NULL,
  image_url text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.life_family_service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  service_key text NOT NULL,
  label text NOT NULL,
  icon_key text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (tenant_id, service_key)
);

CREATE INDEX IF NOT EXISTS idx_life_households_primary ON public.life_households(primary_resident_id);
CREATE INDEX IF NOT EXISTS idx_life_household_members_household ON public.life_household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_life_calendar_household_date ON public.life_calendar_events(household_id, event_date);
CREATE INDEX IF NOT EXISTS idx_life_fridge_expiry ON public.life_fridge_items(household_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_life_health_scheduled ON public.life_health_reminders(household_id, scheduled_at);

CREATE OR REPLACE FUNCTION public.get_life_household_id_for_resident(_resident_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id
  FROM public.life_households h
  WHERE h.primary_resident_id = _resident_id
     OR EXISTS (
       SELECT 1 FROM public.life_household_members m
       WHERE m.household_id = h.id AND m.resident_id = _resident_id
     )
  ORDER BY h.created_at
  LIMIT 1;
$$;

CREATE TRIGGER update_life_households_updated_at
  BEFORE UPDATE ON public.life_households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.life_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_spending_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_spending_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_spending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_fridge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_health_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_family_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_family_service_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents read own household"
  ON public.life_households FOR SELECT TO authenticated
  USING (id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read household members"
  ON public.life_household_members FOR SELECT TO authenticated
  USING (household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read household spending months"
  ON public.life_spending_months FOR SELECT TO authenticated
  USING (household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read spending categories"
  ON public.life_spending_categories FOR SELECT TO authenticated
  USING (
    spending_month_id IN (
      SELECT sm.id FROM public.life_spending_months sm
      WHERE sm.household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid()))
    )
  );

CREATE POLICY "Residents read spending transactions"
  ON public.life_spending_transactions FOR SELECT TO authenticated
  USING (
    spending_month_id IN (
      SELECT sm.id FROM public.life_spending_months sm
      WHERE sm.household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid()))
    )
  );

CREATE POLICY "Residents read calendar events"
  ON public.life_calendar_events FOR SELECT TO authenticated
  USING (household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read fridge items"
  ON public.life_fridge_items FOR SELECT TO authenticated
  USING (household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read health reminders"
  ON public.life_health_reminders FOR SELECT TO authenticated
  USING (household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read family moments"
  ON public.life_family_moments FOR SELECT TO authenticated
  USING (household_id = public.get_life_household_id_for_resident(public.get_resident_id_for_user(auth.uid())));

CREATE POLICY "Residents read family service catalog"
  ON public.life_family_service_catalog FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

GRANT EXECUTE ON FUNCTION public.get_life_household_id_for_resident(uuid) TO authenticated;
