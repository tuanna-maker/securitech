import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { db } from "../lib/db";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[];
  tenantId: string | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData } = await db
        .from("profiles")
        .select("tenant_id, full_name, avatar_url, phone")
        .eq("user_id", userId)
        .single();

      if (profileData) {
        setTenantId(profileData.tenant_id);
        setProfile({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          phone: profileData.phone,
        });

        const { data: roleData } = await db
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("tenant_id", profileData.tenant_id);

        setRoles((roleData || []).map((r) => r.role));
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadUserData(newSession.user.id);
      } else {
        setRoles([]);
        setTenantId(null);
        setProfile(null);
      }
      setLoading(false);
    });

    db.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) loadUserData(existing.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await db.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await db.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await db.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        tenantId,
        profile,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
