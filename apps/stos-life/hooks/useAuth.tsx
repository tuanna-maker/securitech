import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { db } from "../lib/db";
import { registerPushToken } from "../lib/push";

export type ResidentProfile = {
  id: string;
  tenant_id: string;
  full_name: string;
  apartment: string;
  building_id: string;
  phone: string | null;
  avatar_url?: string | null;
  buildings?: { name: string; cover_image_url?: string | null } | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  resident: ResidentProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshResident: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState<ResidentProfile | null>(null);

  const loadResident = useCallback(async (userId: string) => {
    const { data } = await db
      .from("residents")
      .select("id, tenant_id, full_name, apartment, building_id, phone, avatar_url, buildings(name, cover_image_url)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    const profile = data as ResidentProfile | null;
    setResident(profile);
    if (profile) {
      const { data: { user: u } } = await db.auth.getUser();
      if (u) registerPushToken(u.id).catch(() => {});
    }
  }, []);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadResident(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadResident(s.user.id);
      else setResident(null);
    });
    return () => subscription.unsubscribe();
  }, [loadResident]);

  const signIn = async (email: string, password: string) => {
    const { error } = await db.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await db.auth.signOut();
    setResident(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, resident, signIn, signOut, refreshResident: () => loadResident(user!.id) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth within AuthProvider");
  return ctx;
}
