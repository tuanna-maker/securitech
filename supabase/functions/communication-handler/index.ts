import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { parsePagination, paginatedResponse } from "../_shared/pagination.ts";
import { validate } from "../_shared/validation.ts";
import { writeAuditLog, emitEvent } from "../_shared/audit.ts";
import { corsResponse } from "../_shared/cors.ts";
import { badRequest, methodNotAllowed, serverError, success, notFound } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const result = await authenticate(req);
    if (result instanceof Response) return result;
    const ctx = result as AuthContext;
    const url = new URL(req.url);
    const method = req.method;
    const action = url.searchParams.get("action");

    // ── ZALO GROUPS ──
    if (action === "zalo" || !action) {
      const sub = url.searchParams.get("sub"); // "messages"

      // Zalo messages
      if (sub === "messages") {
        if (method === "GET") {
          const groupId = url.searchParams.get("group_id");
          if (!groupId) return badRequest("group_id required");

          const { page, limit, offset } = parsePagination(url);
          const category = url.searchParams.get("category");

          let query = ctx.supabase
            .from("zalo_messages")
            .select("*, zalo_groups!inner(tenant_id)", { count: "exact" })
            .eq("group_id", groupId)
            .eq("zalo_groups.tenant_id", ctx.tenantId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

          if (category) query = query.eq("category", category);

          const { data, count, error } = await query;
          if (error) throw error;
          return success(paginatedResponse(data || [], count, page, limit));
        }

        if (method === "POST") {
          const body = await req.json();
          const v = validate(body)
            .required("group_id")
            .required("sender_name")
            .required("message_text")
            .uuid("group_id");

          if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

          const { data, error } = await ctx.supabase
            .from("zalo_messages")
            .insert({
              group_id: body.group_id,
              sender_name: body.sender_name,
              message_text: body.message_text,
              message_type: body.message_type || "resident",
              category: body.category || null,
            })
            .select()
            .single();

          if (error) throw error;

          // Update last_message on group
          await ctx.supabase
            .from("zalo_groups")
            .update({
              last_message: body.message_text.substring(0, 100),
              last_message_at: new Date().toISOString(),
              unread_count: ctx.supabase.rpc ? 0 : 0, // would increment
            })
            .eq("id", body.group_id);

          await emitEvent(ctx, "zalo_message_received", {
            group_id: body.group_id,
            sender: body.sender_name,
            text: body.message_text.substring(0, 200),
            category: body.category,
          });

          return success(data, 201);
        }
      }

      // Zalo groups CRUD
      if (method === "GET") {
        const id = url.searchParams.get("id");
        if (id) {
          const { data, error } = await ctx.supabase
            .from("zalo_groups")
            .select("*, buildings(name)")
            .eq("id", id)
            .eq("tenant_id", ctx.tenantId)
            .single();

          if (error || !data) return notFound("Zalo group");
          return success(data);
        }

        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");
        const status = url.searchParams.get("status");

        let query = ctx.supabase
          .from("zalo_groups")
          .select("*, buildings(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .range(offset, offset + limit - 1);

        if (buildingId) query = query.eq("building_id", buildingId);
        if (status) query = query.eq("status", status);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("group_name")
          .string("group_name", { min: 1, max: 200 })
          .uuid("building_id");

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("zalo_groups")
          .insert({
            tenant_id: ctx.tenantId,
            group_name: body.group_name,
            building_id: body.building_id || null,
            zalo_link: body.zalo_link || null,
            qr_code_url: body.qr_code_url || null,
            admin_name: body.admin_name || null,
            admin_phone: body.admin_phone || null,
            member_count: body.member_count || 0,
            status: "active",
          })
          .select()
          .single();

        if (error) throw error;
        await writeAuditLog(ctx, "create", "zalo_group", data.id, null, data);
        return success(data, 201);
      }

      if (method === "PATCH") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["group_name", "building_id", "zalo_link", "qr_code_url", "admin_name", "admin_phone", "member_count", "status"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        const { data, error } = await ctx.supabase
          .from("zalo_groups")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }

      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const { error } = await ctx.supabase
          .from("zalo_groups")
          .delete()
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId);

        if (error) throw error;
        return success({ deleted: true });
      }
    }

    // ── ANNOUNCEMENTS ──
    if (action === "announcements") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");

        let query = ctx.supabase
          .from("announcements")
          .select("*, buildings(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (buildingId) query = query.eq("building_id", buildingId);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("title")
          .string("title", { min: 1, max: 200 })
          .string("content", { max: 5000 })
          .enum("priority", ["normal", "high", "urgent"]);

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("announcements")
          .insert({
            tenant_id: ctx.tenantId,
            title: body.title,
            content: body.content || null,
            priority: body.priority || "normal",
            building_id: body.building_id || null,
            author_id: ctx.user.id,
            published_at: body.publish_now ? new Date().toISOString() : null,
            expires_at: body.expires_at || null,
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }

      if (method === "PATCH") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["title", "content", "priority", "building_id", "expires_at", "published_at"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        const { data, error } = await ctx.supabase
          .from("announcements")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }

      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const { error } = await ctx.supabase
          .from("announcements")
          .delete()
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId);

        if (error) throw error;
        return success({ deleted: true });
      }
    }

    // ── INTERNAL CHAT ──
    if (action === "chat") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const channel = url.searchParams.get("channel") || "general";

        const { data, count, error } = await ctx.supabase
          .from("chat_messages")
          .select("*", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .eq("channel", channel)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("message")
          .string("message", { min: 1, max: 2000 });

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("chat_messages")
          .insert({
            tenant_id: ctx.tenantId,
            channel: body.channel || "general",
            sender_id: ctx.user.id,
            message: body.message,
            message_type: body.message_type || "text",
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
