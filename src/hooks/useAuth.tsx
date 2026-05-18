import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth-provider";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[];
  tenantId: string | null;
  profile: { full_name: string | null; avatar_url: string | null; phone: string | null } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
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
    const { data: { subscription } } = auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(() => loadUserData(newSession.user.id), 0);
        } else {
          setRoles([]);
          setTenantId(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        loadUserData(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const result = await auth.signInWithGoogle(window.location.origin);
    if (result.error) {
      return { error: result.error as Error };
    }
    return { error: null };
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, roles, tenantId, profile, signIn, signUp, signInWithGoogle, signOut }}
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
