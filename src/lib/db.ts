/**
 * Database Abstraction Layer
 * ──────────────────────────
 * MIGRATION GUIDE: To switch from Lovable Cloud (Supabase) to on-premise PostgreSQL:
 * 
 * 1. Replace this file's implementation with your preferred PostgreSQL client
 *    (e.g., knex, drizzle-orm, prisma, or raw pg)
 * 2. The `db` export must expose the same fluent query API:
 *    - db.from("table").select(...).eq(...).order(...)
 *    - db.from("table").insert(...).select().single()
 *    - db.from("table").update(...).eq(...)
 *    - db.from("table").delete().eq(...)
 *    - db.rpc("function_name", params)
 *    - db.channel(...).on(...).subscribe() (for realtime, swap with WebSocket/SSE)
 * 
 * 3. Update src/lib/auth-provider.ts for your auth solution
 * 4. No other files need to change.
 * 
 * Current backend: Supabase (Lovable Cloud)
 */

import { supabase } from "@/integrations/supabase/client";

// Re-export the database client through abstraction
export const db = supabase;

// Re-export types for convenience
export type { Database } from "@/integrations/supabase/types";
