
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  scale TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit demo request"
  ON public.demo_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 200
    AND length(phone) BETWEEN 6 AND 30
    AND (company IS NULL OR length(company) <= 200)
    AND (scale IS NULL OR length(scale) <= 60)
    AND (message IS NULL OR length(message) <= 1000)
  );

CREATE POLICY "Platform admins can view demo requests"
  ON public.demo_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));
