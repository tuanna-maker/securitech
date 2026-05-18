-- Allow platform_admin to manage tenants
CREATE POLICY "Platform admins manage tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'))
WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

-- Allow platform_admin to see all profiles (cross-tenant)
CREATE POLICY "Platform admins see all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));

-- Allow platform_admin to see all buildings (cross-tenant)
CREATE POLICY "Platform admins see all buildings"
ON public.buildings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));