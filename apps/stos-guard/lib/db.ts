import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const db = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (k) => SecureStore.getItemAsync(k),
      setItem: (k, v) => SecureStore.setItemAsync(k, v),
      removeItem: (k) => SecureStore.deleteItemAsync(k),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});

export const functionsUrl = `${supabaseUrl}/functions/v1`;

export async function callFunction<T>(
  name: string,
  opts?: { method?: string; query?: Record<string, string>; body?: unknown }
): Promise<T> {
  const { data: { session } } = await db.auth.getSession();
  const q = opts?.query ? `?${new URLSearchParams(opts.query)}` : "";
  const res = await fetch(`${functionsUrl}/${name}${q}`, {
    method: opts?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || json?.error || "Request failed");
  return (json.data ?? json) as T;
}
