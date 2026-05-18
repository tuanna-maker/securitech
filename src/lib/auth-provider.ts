/**
 * Authentication Abstraction Layer
 * ─────────────────────────────────
 * MIGRATION GUIDE: To switch from Supabase Auth to on-premise auth:
 * 
 * 1. Replace the auth methods below with your preferred auth solution
 *    (e.g., Passport.js + JWT, Keycloak, Auth0, or custom JWT)
 * 2. Maintain the same function signatures
 * 3. Update useAuth.tsx to use these exports instead of supabase.auth directly
 * 
 * Current backend: Supabase Auth (Lovable Cloud)
 */

import { db } from "./db";
import { lovable } from "@/integrations/lovable";

export const auth = {
  /** Get current session */
  getSession: () => db.auth.getSession(),

  /** Listen to auth state changes */
  onAuthStateChange: (callback: Parameters<typeof db.auth.onAuthStateChange>[0]) =>
    db.auth.onAuthStateChange(callback),

  /** Sign in with email/password */
  signInWithPassword: (credentials: { email: string; password: string }) =>
    db.auth.signInWithPassword(credentials),

  /** Sign up with email/password */
  signUp: (params: { email: string; password: string; options?: { data?: Record<string, string>; emailRedirectTo?: string } }) =>
    db.auth.signUp(params),

  /** Sign in with Google OAuth */
  signInWithGoogle: (redirectUri?: string) =>
    lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUri }),

  /** Sign out */
  signOut: () => db.auth.signOut(),

  /** Get current user */
  getUser: () => db.auth.getUser(),

  /** Reset password via email */
  resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) =>
    db.auth.resetPasswordForEmail(email, options),

  /** Update user (e.g., set new password) */
  updateUser: (attributes: { password?: string; data?: Record<string, unknown> }) =>
    db.auth.updateUser(attributes),
};
