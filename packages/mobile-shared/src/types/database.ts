/** Regenerate: supabase gen types typescript --project-id <id> > packages/mobile-shared/src/types/database.generated.ts */
export type { AppStatus, LifeRequestSource } from "./app";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface BuildingFeatures {
  id: string;
  tenant_id: string;
  building_id: string;
  life_enabled: boolean;
  sla_accept_minutes: number;
  service_catalog: Json;
  attendance_zones: Json;
  farm_fresh_enabled: boolean;
}

export interface DeviceToken {
  id: string;
  user_id: string;
  tenant_id: string;
  app_role: string;
  token: string;
  platform: string;
}
