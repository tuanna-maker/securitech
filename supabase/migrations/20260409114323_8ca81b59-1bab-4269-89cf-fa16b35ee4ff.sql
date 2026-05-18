CREATE TABLE public.service_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_text TEXT DEFAULT 'Bắt đầu ngay',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;

-- Public read for landing page (no auth required)
CREATE POLICY "Anyone can view active plans"
ON public.service_plans
FOR SELECT
USING (is_active = true);

-- Platform admin manages plans
CREATE POLICY "Platform admins manage plans"
ON public.service_plans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'))
WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER update_service_plans_updated_at
BEFORE UPDATE ON public.service_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();