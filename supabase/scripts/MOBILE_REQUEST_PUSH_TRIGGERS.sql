-- STOS Mobile — push khi đổi app_status / check-in khách (KHÔNG cần guard-handler emitEvent)
-- Chạy sau: MOBILE_PUSH_TRIGGERS.sql + webhook system_events → push-dispatcher
-- Idempotent.

CREATE OR REPLACE FUNCTION public.emit_request_status_push_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text;
  v_payload jsonb;
BEGIN
  IF TG_OP <> 'UPDATE' OR OLD.app_status IS NOT DISTINCT FROM NEW.app_status THEN
    RETURN NEW;
  END IF;

  v_payload := jsonb_build_object(
    'request_id', NEW.id,
    'building_id', NEW.building_id,
    'resident_id', NEW.resident_id,
    'to_status', NEW.app_status
  );

  IF NEW.app_status = 'accepted'
     AND COALESCE(OLD.app_status, '') IN ('submitted', 'escalated') THEN
    v_type := 'life_request_accepted';
  ELSIF NEW.app_status = 'completed' THEN
    v_type := 'life_request_completed';
  ELSIF NEW.app_status IN ('en_route', 'on_site', 'expired') THEN
    v_type := 'life_request_status';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.system_events (tenant_id, event_type, payload, is_processed)
  VALUES (NEW.tenant_id, v_type, v_payload, false);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quick_request_push ON public.quick_service_requests;
CREATE TRIGGER trg_quick_request_push
  AFTER UPDATE OF app_status ON public.quick_service_requests
  FOR EACH ROW EXECUTE FUNCTION public.emit_request_status_push_event();

DROP TRIGGER IF EXISTS trg_support_request_push ON public.support_requests;
CREATE TRIGGER trg_support_request_push
  AFTER UPDATE OF app_status ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.emit_request_status_push_event();

-- Khách QR check-in (visitor_invites.status → checked_in)
CREATE OR REPLACE FUNCTION public.emit_guest_checked_in_push_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'checked_in' THEN
    INSERT INTO public.system_events (tenant_id, event_type, payload, is_processed)
    VALUES (
      NEW.tenant_id,
      'guest_checked_in',
      jsonb_build_object(
        'invite_id', NEW.id,
        'resident_id', NEW.resident_id,
        'building_id', NEW.building_id
      ),
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visitor_invite_push ON public.visitor_invites;
CREATE TRIGGER trg_visitor_invite_push
  AFTER UPDATE OF status ON public.visitor_invites
  FOR EACH ROW EXECUTE FUNCTION public.emit_guest_checked_in_push_event();
