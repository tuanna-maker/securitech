import { createClient, SupabaseClient } from "@supabase/supabase-js";

let db: SupabaseClient | null = null;

export function initSupabase(url: string, anonKey: string, storage?: {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
}) {
  db = createClient(url, anonKey, {
    auth: storage ? { storage, autoRefreshToken: true, persistSession: true } : undefined,
  });
  return db;
}

export function getDb() {
  if (!db) throw new Error("Supabase not initialized");
  return db;
}

export async function invokeFunction<T>(
  name: string,
  options?: { method?: string; body?: unknown; query?: Record<string, string> }
): Promise<T> {
  const client = getDb();
  const { data: session } = await client.auth.getSession();
  const token = session.session?.access_token;
  const q = options?.query
    ? "?" + new URLSearchParams(options.query).toString()
    : "";
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/${name}${q}`;

  const res = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || json?.error || res.statusText;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return (json.data ?? json) as T;
}

export type AppStatus =
  | "submitted"
  | "accepted"
  | "en_route"
  | "on_site"
  | "completed"
  | "cancelled"
  | "expired"
  | "escalated";
