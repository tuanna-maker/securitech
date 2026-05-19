-- STOS Guard — tạo user Auth + link staff (chỉ cần SQL, không cần Dashboard)
-- Chạy sau: STOS_MOBILE_FULL_SETUP.sql + SEED_MOBILE_DEMO.sql
-- Đăng nhập app: guard.demo@stos.local / StosGuard@2026

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_email text := 'guard.demo@stos.local';
  v_password text := 'StosGuard@2026';
  v_user_id uuid;
  v_tenant_id uuid;
  v_building_id uuid;
  v_staff_id uuid;
  v_encrypted_pw text;
BEGIN
  SELECT t.id, b.id INTO v_tenant_id, v_building_id
  FROM public.tenants t
  JOIN public.buildings b ON b.tenant_id = t.id
  WHERE t.is_active = true
  ORDER BY t.created_at, b.created_at
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Không có tenant/building. Chạy SEED_MOBILE_DEMO.sql trước.';
  END IF;

  SELECT s.id INTO v_staff_id
  FROM public.staff_members s
  WHERE s.tenant_id = v_tenant_id
  ORDER BY (s.user_id IS NULL) DESC, s.created_at
  LIMIT 1;

  IF v_staff_id IS NULL THEN
    INSERT INTO public.staff_members (tenant_id, building_id, name, role, phone, status)
    VALUES (v_tenant_id, v_building_id, 'Bảo vệ Demo', 'Bảo vệ', '0900000002', 'offline')
    RETURNING id INTO v_staff_id;
    RAISE NOTICE 'Đã tạo staff_members demo: %', v_staff_id;
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('tenant_id', v_tenant_id::text, 'full_name', 'Bảo vệ Demo'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Đã tạo user Auth: %', v_email;
  ELSE
    RAISE NOTICE 'User đã tồn tại, chỉ link lại staff: %', v_email;
  END IF;

  UPDATE public.staff_members SET user_id = v_user_id WHERE id = v_staff_id;

  UPDATE public.profiles
  SET tenant_id = v_tenant_id,
      full_name = 'Bảo vệ Demo'
  WHERE user_id = v_user_id;

  INSERT INTO public.profiles (user_id, tenant_id, full_name)
  SELECT v_user_id, v_tenant_id, 'Bảo vệ Demo'
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id);

  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (v_user_id, v_tenant_id, 'guard'::public.app_role)
  ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

  RAISE NOTICE '--- STOS Guard test account ---';
  RAISE NOTICE 'Email:    %', v_email;
  RAISE NOTICE 'Password: %', v_password;
  RAISE NOTICE 'user_id:  %', v_user_id;
  RAISE NOTICE 'staff:    %', v_staff_id;
END $$;
