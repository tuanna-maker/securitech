-- STOS Mobile — emit system_events khi có bưu phẩm / thông báo BQL (cho push-dispatcher)

CREATE OR REPLACE FUNCTION public.emit_mobile_system_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text;
  v_payload jsonb;
BEGIN
  IF TG_TABLE_NAME = 'parcels' AND TG_OP = 'INSERT' THEN
    v_type := 'parcel_received';
    v_payload := jsonb_build_object(
      'parcel_id', NEW.id,
      'resident_id', NEW.resident_id,
      'building_id', NEW.building_id,
      'status', NEW.status
    );
  ELSIF TG_TABLE_NAME = 'parcels' AND TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_type := 'parcel_status_changed';
    v_payload := jsonb_build_object(
      'parcel_id', NEW.id,
      'resident_id', NEW.resident_id,
      'building_id', NEW.building_id,
      'status', NEW.status
    );
  ELSIF TG_TABLE_NAME = 'announcements' AND TG_OP = 'INSERT' THEN
    v_type := 'announcement_published';
    v_payload := jsonb_build_object(
      'announcement_id', NEW.id,
      'building_id', NEW.building_id,
      'title', NEW.title
    );
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.system_events (tenant_id, event_type, payload)
  VALUES (NEW.tenant_id, v_type, v_payload);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_parcels_mobile_event ON public.parcels;
CREATE TRIGGER trg_parcels_mobile_event
  AFTER INSERT OR UPDATE ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.emit_mobile_system_event();

DROP TRIGGER IF EXISTS trg_announcements_mobile_event ON public.announcements;
CREATE TRIGGER trg_announcements_mobile_event
  AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.emit_mobile_system_event();
