-- STOS Life + Guard demo seed — run after STOS_MOBILE_FULL_SETUP.sql
-- Resolves tenant/building/resident from your project (no placeholder UUIDs).
-- Creates minimal demo rows only if tables are empty.

DO $$
DECLARE
  v_tenant_id uuid;
  v_building_id uuid;
  v_resident_id uuid;
BEGIN
  -- 1) Tenant
  SELECT t.id INTO v_tenant_id
  FROM public.tenants t
  WHERE t.is_active = true
  ORDER BY t.created_at
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants (company_name, plan, is_active)
    VALUES ('STOS Demo Tenant', 'free', true)
    RETURNING id INTO v_tenant_id;
    RAISE NOTICE 'Created demo tenant: %', v_tenant_id;
  END IF;

  -- 2) Building
  SELECT b.id INTO v_building_id
  FROM public.buildings b
  WHERE b.tenant_id = v_tenant_id
  ORDER BY b.created_at
  LIMIT 1;

  IF v_building_id IS NULL THEN
    INSERT INTO public.buildings (tenant_id, name, address, lat, lng, cover_image_url)
    VALUES (v_tenant_id, 'Tòa Demo STOS', 'Quận 1, TP.HCM', 10.7769, 106.7009, NULL)
    RETURNING id INTO v_building_id;
    RAISE NOTICE 'Created demo building: %', v_building_id;
  END IF;

  -- 3) Resident (prefer one not yet linked to auth for activation flow)
  SELECT r.id INTO v_resident_id
  FROM public.residents r
  WHERE r.tenant_id = v_tenant_id
    AND r.building_id = v_building_id
    AND r.status = 'active'
  ORDER BY (r.user_id IS NULL) DESC, r.created_at
  LIMIT 1;

  IF v_resident_id IS NULL THEN
    INSERT INTO public.residents (tenant_id, building_id, full_name, apartment, status, phone)
    VALUES (v_tenant_id, v_building_id, 'Nguyễn Văn Demo', 'A1-0801', 'active', '0900000001')
    RETURNING id INTO v_resident_id;
    RAISE NOTICE 'Created demo resident: %', v_resident_id;
  END IF;

  -- 4) building_features
  INSERT INTO public.building_features (
    tenant_id, building_id, sla_accept_minutes, service_catalog, attendance_zones, farm_fresh_enabled, hotline
  )
  VALUES (
    v_tenant_id,
    v_building_id,
    5,
    '[
      {"code":"open_door","label":"Mở cửa","icon":"door"},
      {"code":"receive_parcel","label":"Nhận hộ","icon":"cube"},
      {"code":"carry_items","label":"Xách đồ","icon":"bag"},
      {"code":"urgent_assist","label":"Hỗ trợ khẩn","icon":"alert"}
    ]'::jsonb,
    '[{"id":"gate","name":"Cổng chính","lat":10.7769,"lng":106.7009,"radius_m":100}]'::jsonb,
    true,
    '19001234'
  )
  ON CONFLICT (tenant_id, building_id) DO UPDATE SET
    service_catalog = EXCLUDED.service_catalog,
    attendance_zones = EXCLUDED.attendance_zones,
    farm_fresh_enabled = EXCLUDED.farm_fresh_enabled,
    sla_accept_minutes = EXCLUDED.sla_accept_minutes,
    hotline = EXCLUDED.hotline;

  -- 5) Activation code for LIFE-001
  INSERT INTO public.resident_activation_codes (tenant_id, resident_id, code, expires_at)
  SELECT v_tenant_id, v_resident_id, 'STOS-DEMO-2026', now() + interval '30 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.resident_activation_codes
    WHERE tenant_id = v_tenant_id AND code = 'STOS-DEMO-2026'
  );

  -- 6) Farm products (idempotent per building)
  IF NOT EXISTS (SELECT 1 FROM public.farm_products WHERE building_id = v_building_id LIMIT 1) THEN
    INSERT INTO public.farm_products (tenant_id, building_id, name, description, price, unit, stock)
    VALUES
      (v_tenant_id, v_building_id, 'Rau muống', 'Organic', 15000, 'bó', 50),
      (v_tenant_id, v_building_id, 'Trứng gà', 'Farm fresh', 45000, 'chục', 30);
  END IF;

  RAISE NOTICE '--- STOS Mobile demo seed OK ---';
  RAISE NOTICE 'tenant_id:  %', v_tenant_id;
  RAISE NOTICE 'building_id: %', v_building_id;
  RAISE NOTICE 'resident_id: %', v_resident_id;
  RAISE NOTICE 'activation:  STOS-DEMO-2026';
  RAISE NOTICE 'Link auth user: UPDATE residents SET user_id = ''<auth.users.id>'' WHERE id = ''%'';', v_resident_id;
END $$;
