import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getContextData(supabase: any) {
  const [buildings, incidents, staff, residents] = await Promise.all([
    supabase.from("buildings").select("id, name, status, staff_online, staff_total, incidents_today, critical_incidents, patrol_completion, sla_percent, region").limit(50),
    supabase.from("incidents").select("id, type, severity, status, description, created_at, building_id").order("created_at", { ascending: false }).limit(30),
    supabase.from("staff_members").select("id, name, role, status, zone, building_id").limit(100),
    supabase.from("residents").select("id", { count: "exact", head: true }),
  ]);

  const buildingMap: Record<string, string> = {};
  (buildings.data || []).forEach((b: any) => { buildingMap[b.id] = b.name; });

  const enrichedIncidents = (incidents.data || []).map((i: any) => ({
    ...i,
    building_name: buildingMap[i.building_id] || "N/A",
  }));

  return {
    buildings: buildings.data || [],
    incidents: enrichedIncidents,
    staff_summary: {
      total: (staff.data || []).length,
      online: (staff.data || []).filter((s: any) => s.status === "on_duty").length,
      off_duty: (staff.data || []).filter((s: any) => s.status === "off_duty").length,
    },
    total_residents: residents.count || 0,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { messages } = await req.json();

    // Fetch real data for context
    const ctx = await getContextData(supabase);

    const todayIncidents = ctx.incidents.filter((i: any) => {
      const d = new Date(i.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    });

    const alertBuildings = ctx.buildings.filter((b: any) => b.status === "alert" || b.critical_incidents > 0);

    const systemPrompt = `Bạn là trợ lý AI thông minh của hệ thống STOS (Security & Building Operations System) — nền tảng quản lý bảo vệ và vận hành tòa nhà.

DỮ LIỆU THỜI GIAN THỰC:
═══════════════════════
📊 TỔNG QUAN:
- Tổng tòa nhà: ${ctx.buildings.length}
- Tổng cư dân: ${ctx.total_residents}
- Nhân sự: ${ctx.staff_summary.total} (đang trực: ${ctx.staff_summary.online}, nghỉ: ${ctx.staff_summary.off_duty})

🏢 DANH SÁCH TÒA NHÀ:
${ctx.buildings.map((b: any) => `- ${b.name} | Trạng thái: ${b.status} | NV trực: ${b.staff_online}/${b.staff_total} | SĐ hôm nay: ${b.incidents_today} | Tuần tra: ${b.patrol_completion}% | SLA: ${b.sla_percent}% | KV: ${b.region || "N/A"}`).join("\n")}

⚠️ TÒA NHÀ CÓ CẢNH BÁO (${alertBuildings.length}):
${alertBuildings.length > 0 ? alertBuildings.map((b: any) => `- ${b.name}: ${b.critical_incidents} sự cố nghiêm trọng`).join("\n") : "Không có cảnh báo"}

🚨 SỰ CỐ HÔM NAY (${todayIncidents.length}):
${todayIncidents.length > 0 ? todayIncidents.map((i: any) => `- [${i.severity}] ${i.type} tại ${i.building_name} — ${i.status} — ${i.description || "Không có mô tả"}`).join("\n") : "Chưa có sự cố hôm nay"}

📋 30 SỰ CỐ GẦN NHẤT:
${ctx.incidents.slice(0, 15).map((i: any) => `- [${i.severity}/${i.status}] ${i.type} @ ${i.building_name} — ${new Date(i.created_at).toLocaleDateString("vi-VN")}`).join("\n")}

QUY TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt
- Sử dụng dữ liệu thực ở trên để trả lời, KHÔNG bịa dữ liệu
- Dùng emoji phù hợp, định dạng rõ ràng với bold **text** cho số liệu quan trọng
- Nếu không có dữ liệu liên quan, nói rõ và gợi ý cách lấy thông tin
- Trả lời ngắn gọn, chuyên nghiệp, dễ hiểu`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Hệ thống đang quá tải, vui lòng thử lại sau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Đã hết quota AI, vui lòng nạp thêm credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Lỗi kết nối AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
