-- Mobile imagery: building cover + avatars (idempotent — run on Lovable SQL editor)
ALTER TABLE public.buildings ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.residents ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.buildings.cover_image_url IS 'Public URL — building hero on STOS Life';
COMMENT ON COLUMN public.residents.avatar_url IS 'Resident profile photo';
COMMENT ON COLUMN public.staff_members.avatar_url IS 'Guard profile photo for Grab map';
