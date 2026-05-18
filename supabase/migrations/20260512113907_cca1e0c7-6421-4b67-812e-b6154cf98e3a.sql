CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND tenant_id = public.get_user_tenant_id()
  );
$$;

DROP POLICY IF EXISTS "Operators manage alerts" ON public.alerts;
CREATE POLICY "Operators manage alerts" ON public.alerts FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Guards manage patrols" ON public.patrol_routes;
CREATE POLICY "Guards manage patrols" ON public.patrol_routes FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Guards manage checkpoints" ON public.patrol_checkpoints;
CREATE POLICY "Guards manage checkpoints" ON public.patrol_checkpoints FOR ALL TO authenticated
  USING (
    (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
    AND EXISTS (SELECT 1 FROM public.patrol_routes r WHERE r.id = patrol_checkpoints.route_id AND r.tenant_id = public.get_user_tenant_id())
  )
  WITH CHECK (
    (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
    AND EXISTS (SELECT 1 FROM public.patrol_routes r WHERE r.id = patrol_checkpoints.route_id AND r.tenant_id = public.get_user_tenant_id())
  );

DROP POLICY IF EXISTS "Operators manage incidents" ON public.incidents;
CREATE POLICY "Operators manage incidents" ON public.incidents FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage incident timeline" ON public.incident_timeline;
CREATE POLICY "Operators manage incident timeline" ON public.incident_timeline FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Guards manage parcels" ON public.parcels;
CREATE POLICY "Guards manage parcels" ON public.parcels FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Guards manage access logs" ON public.access_logs;
CREATE POLICY "Guards manage access logs" ON public.access_logs FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'guard'::app_role) OR public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage requests" ON public.support_requests;
CREATE POLICY "Operators manage requests" ON public.support_requests FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage residents" ON public.residents;
CREATE POLICY "Operators manage residents" ON public.residents FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage posts" ON public.posts;
CREATE POLICY "Operators manage posts" ON public.posts FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage contractors" ON public.contractors;
CREATE POLICY "Operators manage contractors" ON public.contractors FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage SOS" ON public.sos_calls;
CREATE POLICY "Operators manage SOS" ON public.sos_calls FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage quick services" ON public.quick_service_requests;
CREATE POLICY "Operators manage quick services" ON public.quick_service_requests FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage zalo groups" ON public.zalo_groups;
CREATE POLICY "Operators manage zalo groups" ON public.zalo_groups FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)));

DROP POLICY IF EXISTS "Operators manage zalo messages" ON public.zalo_messages;
CREATE POLICY "Operators manage zalo messages" ON public.zalo_messages FOR ALL TO authenticated
  USING (
    (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
    AND EXISTS (SELECT 1 FROM public.zalo_groups g WHERE g.id = zalo_messages.group_id AND g.tenant_id = public.get_user_tenant_id())
  )
  WITH CHECK (
    (public.has_role(auth.uid(),'operator'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
    AND EXISTS (SELECT 1 FROM public.zalo_groups g WHERE g.id = zalo_messages.group_id AND g.tenant_id = public.get_user_tenant_id())
  );

DROP POLICY IF EXISTS "Admins manage deals" ON public.pipeline_deals;
CREATE POLICY "Admins manage deals" ON public.pipeline_deals FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage client buildings" ON public.client_buildings;
CREATE POLICY "Admins manage client buildings" ON public.client_buildings FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_buildings.client_id AND c.tenant_id = public.get_user_tenant_id())
  )
  WITH CHECK (
    public.has_role(auth.uid(),'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_buildings.client_id AND c.tenant_id = public.get_user_tenant_id())
  );

DROP POLICY IF EXISTS "HR manages enrollments" ON public.training_enrollments;
CREATE POLICY "HR manages enrollments" ON public.training_enrollments FOR ALL TO authenticated
  USING (
    (public.has_role(auth.uid(),'hr_manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
    AND EXISTS (SELECT 1 FROM public.training_courses tc WHERE tc.id = training_enrollments.course_id AND tc.tenant_id = public.get_user_tenant_id())
  )
  WITH CHECK (
    (public.has_role(auth.uid(),'hr_manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
    AND EXISTS (SELECT 1 FROM public.training_courses tc WHERE tc.id = training_enrollments.course_id AND tc.tenant_id = public.get_user_tenant_id())
  );