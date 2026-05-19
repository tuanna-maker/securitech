-- Kích hoạt cư dân từ app (không cần life-handler Edge Function)
-- Chạy trên Lovable SQL sau STOS_MOBILE_FULL_SETUP.sql

CREATE OR REPLACE FUNCTION public.activate_resident_with_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_tenant uuid;
  v_row public.resident_activation_codes%ROWTYPE;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Bạn cần đăng nhập trước';
  END IF;

  SELECT tenant_id INTO v_tenant FROM public.profiles WHERE user_id = v_user LIMIT 1;
  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'Chưa có hồ sơ tenant';
  END IF;

  SELECT * INTO v_row
  FROM public.resident_activation_codes
  WHERE tenant_id = v_tenant
    AND upper(trim(code)) = upper(trim(p_code))
    AND used_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mã không hợp lệ hoặc đã hết hạn';
  END IF;

  UPDATE public.residents
  SET user_id = v_user, status = 'active'
  WHERE id = v_row.resident_id;

  UPDATE public.resident_activation_codes
  SET used_at = now()
  WHERE id = v_row.id;

  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (v_user, v_tenant, 'resident'::public.app_role)
  ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

  UPDATE public.profiles
  SET tenant_id = v_tenant
  WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'ok', true,
    'resident_id', v_row.resident_id,
    'code', v_row.code
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_resident_with_code(text) TO authenticated;
