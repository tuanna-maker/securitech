DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sos_calls') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_calls;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'patrol_routes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patrol_routes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'staff_members') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_members;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'access_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.access_logs;
  END IF;
END $$;