-- STOS Mobile — bật Supabase Realtime cho bảng Life/Guard (chạy trên Lovable sau STOS_MOBILE_FULL_SETUP.sql)
-- Idempotent: bỏ qua nếu bảng đã có trong publication.

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_service_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.support_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.parcels;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_calls;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
