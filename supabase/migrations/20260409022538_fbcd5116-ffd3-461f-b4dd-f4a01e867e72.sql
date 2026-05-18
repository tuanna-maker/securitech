CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Check if tenant_id was provided in metadata
  IF NEW.raw_user_meta_data->>'tenant_id' IS NOT NULL THEN
    new_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
  ELSE
    -- Create a new tenant for this user
    INSERT INTO public.tenants (company_name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 2)))
    RETURNING id INTO new_tenant_id;
  END IF;

  INSERT INTO public.profiles (user_id, tenant_id, full_name)
  VALUES (
    NEW.id,
    new_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();