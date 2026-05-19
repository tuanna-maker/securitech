import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function formatTrend(current: number, prev: number | null): string | null {
  if (!prev || prev <= 0) return null;
  const pct = ((prev - current) / prev) * 100;
  const arrow = pct >= 0 ? "▼" : "▲";
  return `${arrow} ${Math.abs(pct).toFixed(1).replace(".", ",")}% so với tháng trước`;
}

function formatDateVi(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function monthLabel(year: number, month: number): string {
  return `Tháng ${month}/${year}`;
}

function spendingMonthLabel(year: number, month: number): string {
  return `Tổng chi tháng ${month}`;
}

export async function buildFamilyDashboard(
  supabase: SupabaseClient,
  residentId: string,
  tenantId: string
) {
  const { data: householdId, error: hidErr } = await supabase.rpc(
    "get_life_household_id_for_resident",
    { _resident_id: residentId }
  );

  if (hidErr || !householdId) return null;

  const { data: householdRow } = await supabase
    .from("life_households")
    .select("*")
    .eq("id", householdId)
    .single();

  const { data: members } = await supabase
    .from("life_household_members")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order");

  const memberCount = members?.length ?? 0;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = now.toISOString().slice(0, 10);

  const { data: spendingMonth } = await supabase
    .from("life_spending_months")
    .select("*")
    .eq("household_id", householdId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  const total = Number(spendingMonth?.total_amount ?? 0);
  const prev = spendingMonth?.prev_total_amount != null ? Number(spendingMonth.prev_total_amount) : null;
  const trend = formatTrend(total, prev);

  const { data: calendarToday } = await supabase
    .from("life_calendar_events")
    .select("id, member_id, title, event_date, starts_at")
    .eq("household_id", householdId)
    .eq("event_date", today);

  const childMembers = (members ?? []).filter((m) => m.is_child);
  const kids = childMembers.map((child) => {
    const count = (calendarToday ?? []).filter((e) => e.member_id === child.id).length;
    const age = child.birth_year ? new Date().getFullYear() - child.birth_year : null;
    const name = age != null ? `${child.display_name} (${age} tuổi)` : child.display_name;
    return {
      id: child.id,
      name,
      detail: `${count} lịch hôm nay`,
      dot: child.accent_color ?? "#7C3AED",
      initial: child.display_name.replace(/[^A-Za-zÀ-ỹ]/g, "").charAt(0) || "?",
    };
  });

  const { data: fridgeItems } = await supabase
    .from("life_fridge_items")
    .select("*")
    .eq("household_id", householdId)
    .lte("expiry_date", new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10))
    .order("expiry_date");

  const expiringCount = fridgeItems?.length ?? 0;

  const { data: healthReminders } = await supabase
    .from("life_health_reminders")
    .select("*")
    .eq("household_id", householdId)
    .eq("is_done", false)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(5);

  const { data: moments } = await supabase
    .from("life_family_moments")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order")
    .limit(10);

  const { data: services } = await supabase
    .from("life_family_service_catalog")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order");

  let announceCount = 0;
  if (householdRow.building_id) {
    const { count } = await supabase
      .from("announcements")
      .select("id", { count: "exact", head: true })
      .eq("building_id", householdRow.building_id);
    announceCount = count ?? 0;
  }

  const aiHints: { text: string; icon: string }[] = [];

  const piano = (calendarToday ?? []).find((e) => /piano/i.test(e.title));
  if (piano?.starts_at) {
    const t = new Date(piano.starts_at);
    aiHints.push({
      text: `Bé Minh có lớp Piano lúc ${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`,
      icon: "calendar",
    });
  }

  if (expiringCount > 0) {
    aiHints.push({
      text: `${expiringCount} thực phẩm sắp hết hạn`,
      icon: "food",
    });
  }

  const med = (healthReminders ?? []).find((r) => r.reminder_type === "medication");
  if (med) {
    const t = new Date(med.scheduled_at);
    aiHints.push({
      text: `${med.member_label} cần uống thuốc lúc ${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`,
      icon: "health",
    });
  }

  return {
    profile: {
      name: householdRow.name,
      memberCount,
      motto: householdRow.motto,
      photoUrl: householdRow.photo_url,
    },
    notifyCount: Math.min(announceCount ?? 0, 9) || 3,
    spending: spendingMonth
      ? {
          monthLabel: spendingMonthLabel(year, month),
          totalFormatted: formatVnd(total),
          trendLabel: trend,
          year,
          month,
        }
      : null,
    kids,
    fridge: {
      alert:
        expiringCount > 0
          ? `${expiringCount} thực phẩm sắp hết hạn`
          : null,
      thumbs: (fridgeItems ?? []).slice(0, 3).map((f) => ({
        id: f.id,
        imageUrl: f.image_url,
        name: f.name,
      })),
    },
    healthReminders: (healthReminders ?? []).map((r) => ({
      id: r.id,
      text: r.reminder_text,
      accentColor: r.accent_color,
    })),
    moments: (moments ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      date: formatDateVi(m.moment_date),
      image: m.image_url,
    })),
    services: (services ?? []).map((s) => ({
      key: s.service_key,
      label: s.label,
      icon: s.icon_key,
    })),
    aiHints,
  };
}

export async function buildFamilySpendingDetail(
  supabase: SupabaseClient,
  residentId: string,
  year: number,
  month: number
) {
  const { data: household } = await supabase
    .from("life_households")
    .select("id")
    .eq("primary_resident_id", residentId)
    .maybeSingle();

  if (!household) return null;

  const { data: spendingMonth } = await supabase
    .from("life_spending_months")
    .select("*")
    .eq("household_id", household.id)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (!spendingMonth) return null;

  const { data: categories } = await supabase
    .from("life_spending_categories")
    .select("*")
    .eq("spending_month_id", spendingMonth.id)
    .order("sort_order");

  const { data: transactions } = await supabase
    .from("life_spending_transactions")
    .select("*")
    .eq("spending_month_id", spendingMonth.id)
    .order("sort_order");

  const total = Number(spendingMonth.total_amount);
  const prev = spendingMonth.prev_total_amount != null ? Number(spendingMonth.prev_total_amount) : null;
  const budget = spendingMonth.budget_amount != null ? Number(spendingMonth.budget_amount) : null;
  const budgetLeft = budget != null ? Math.max(0, budget - total) : null;
  const budgetPct = budget != null && budget > 0 ? Math.round((total / budget) * 100) : null;

  return {
    month: monthLabel(year, month),
    total: formatVnd(total),
    trend: formatTrend(total, prev),
    budgetLeft: budgetLeft != null ? formatVnd(budgetLeft) : null,
    budgetPct,
    groups: (categories ?? []).map((c) => ({
      label: c.label,
      pct: c.pct,
      color: c.color_hex,
    })),
    categories: (categories ?? []).map((c) => ({
      label: c.label,
      amount: formatVnd(Number(c.amount)),
      trend: c.trend_label ?? "—",
      up: c.trend_up ?? false,
    })),
    transactions: (transactions ?? []).map((t) => {
      const diff = Math.floor(
        (Date.now() - new Date(t.spent_on).getTime()) / 86400000
      );
      const when = diff <= 0 ? "Hôm nay" : diff === 1 ? "Hôm qua" : formatDateVi(t.spent_on);
      return {
        merchant: t.merchant,
        cat: t.category_label,
        amount: formatVnd(Number(t.amount)),
        when,
      };
    }),
  };
}
