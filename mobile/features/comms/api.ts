import { db } from "../../lib/db";

export async function fetchPosts(limit = 20) {
  const { data, error } = await db
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchAnnouncements(limit = 20) {
  const { data, error } = await db
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchChatMessages(channel = "general", limit = 50) {
  const { data, error } = await db
    .from("chat_messages")
    .select("*")
    .eq("channel", channel)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function sendChatMessage(message: string, channel = "general") {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await db
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();
  if (!profile) throw new Error("No profile");

  const { error } = await db.from("chat_messages").insert({
    message,
    channel,
    sender_id: user.id,
    tenant_id: profile.tenant_id,
  });
  if (error) throw error;
}

export async function createPost(input: { title: string; content?: string; is_pinned?: boolean }) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await db.from("profiles").select("tenant_id").eq("user_id", user.id).single();
  if (!profile) throw new Error("No profile");

  const { data, error } = await db.from("posts").insert({
    ...input,
    author_id: user.id,
    tenant_id: profile.tenant_id,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createAnnouncement(input: { title: string; content?: string; priority?: string }) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await db.from("profiles").select("tenant_id").eq("user_id", user.id).single();
  if (!profile) throw new Error("No profile");

  const { data, error } = await db.from("announcements").insert({
    ...input,
    author_id: user.id,
    tenant_id: profile.tenant_id,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchCommsStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [postsRes, announcementsRes] = await Promise.all([
    db.from("posts").select("id", { count: "exact" }).gte("created_at", weekAgo.toISOString()),
    db.from("announcements").select("id", { count: "exact" }),
  ]);

  return {
    postsThisWeek: postsRes.count || 0,
    totalAnnouncements: announcementsRes.count || 0,
  };
}
