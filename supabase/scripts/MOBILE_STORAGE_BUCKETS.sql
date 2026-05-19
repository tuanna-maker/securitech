-- Supabase Storage buckets for mobile imagery (run once; adjust if policies exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('building-covers', 'building-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('parcel-photos', 'parcel-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('incident-attachments', 'incident-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read building covers" ON storage.objects;
CREATE POLICY "Public read building covers"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'building-covers');

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Staff upload building covers" ON storage.objects;
CREATE POLICY "Staff upload building covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'building-covers' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff update building covers" ON storage.objects;
CREATE POLICY "Staff update building covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'building-covers' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Auth upload parcel photos" ON storage.objects;
CREATE POLICY "Auth upload parcel photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'parcel-photos');

DROP POLICY IF EXISTS "Auth read parcel photos" ON storage.objects;
CREATE POLICY "Auth read parcel photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'parcel-photos');

DROP POLICY IF EXISTS "Auth upload incident attachments" ON storage.objects;
CREATE POLICY "Auth upload incident attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'incident-attachments');

DROP POLICY IF EXISTS "Auth read incident attachments" ON storage.objects;
CREATE POLICY "Auth read incident attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'incident-attachments');
