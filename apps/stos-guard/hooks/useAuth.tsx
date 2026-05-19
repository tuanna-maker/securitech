import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { db } from "../lib/db";
import { registerPushToken } from "../lib/push";

export type StaffProfile = {
  id: string;
  name: string;
  building_id: string | null;
  phone: string | null;
  role: string;
  last_check_in: string | null;
  avatar_url?: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  staff: StaffProfile | null;
  onDuty: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setOnDuty: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [onDuty, setOnDuty] = useState(false);

  const loadStaff = useCallback(async (userId: string) => {
    const { data } = await db
      .from("staff_members")
      .select("id, name, building_id, phone, role, last_check_in, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();
    setStaff(data);
    if (data) {
      const { data: { user: u } } = await db.auth.getUser();
      if (u) registerPushToken(u.id).catch(() => {});
    }
    if (data?.last_check_in) {
      const today = new Date().toDateString();
      setOnDuty(new Date(data.last_check_in).toDateString() === today);
    }
  }, []);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadStaff(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadStaff(s.user.id);
      else { setStaff(null); setOnDuty(false); }
    });
    return () => subscription.unsubscribe();
  }, [loadStaff]);

  const signIn = async (email: string, password: string) => {
    const { error } = await db.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await db.auth.signOut();
    setStaff(null);
    setOnDuty(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, staff, onDuty, signIn, signOut, setOnDuty }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth within AuthProvider");
  return ctx;
}
