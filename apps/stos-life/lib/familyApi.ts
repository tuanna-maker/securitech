import { callFunction } from "./db";
import type { FamilyDashboard, FamilyKidRow, FamilySpendingDetail } from "./familyTypes";
import { FAMILY, FAMILY_MOMENTS, SPENDING } from "./mockLifeData";
import {
  AI_HINTS_UI,
  FAMILY_MGMT_UI,
  FAMILY_MOMENTS_UI,
  FAMILY_SERVICES_UI,
} from "./familyUiConfig";
import type { LifeGradientIconName } from "../components/life/family/LifeGradientIcon";

function iconKey(s: string): LifeGradientIconName {
  const allowed: LifeGradientIconName[] = [
    "members", "calendar", "memories", "settings", "wallet", "child", "food",
    "health", "plane", "home", "car", "cart", "crown",
  ];
  return (allowed.includes(s as LifeGradientIconName) ? s : "members") as LifeGradientIconName;
}

/** Fallback khi chưa login / chưa seed DB */
export function getFamilyDashboardFallback(): FamilyDashboard {
  const spendingCard = FAMILY_MGMT_UI.find((c) => c.key === "spending");
  const kidsCard = FAMILY_MGMT_UI.find((c) => c.key === "kids");
  const fridgeCard = FAMILY_MGMT_UI.find((c) => c.key === "fridge");
  const healthCard = FAMILY_MGMT_UI.find((c) => c.key === "health");

  return {
    profile: {
      name: FAMILY.name,
      memberCount: FAMILY.memberCount,
      motto: FAMILY.motto,
      photoUrl: null,
    },
    notifyCount: 3,
    spending: spendingCard && "lines" in spendingCard
      ? {
          monthLabel: spendingCard.lines[0],
          totalFormatted: spendingCard.lines[1],
          trendLabel: spendingCard.lines[2],
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        }
      : null,
    kids:
      kidsCard && "children" in kidsCard
        ? kidsCard.children.map((c, i) => ({
            id: String(i),
            name: c.name,
            detail: c.detail,
            dot: c.dot,
            initial: c.initial,
            avatarKey: "avatarKey" in c ? c.avatarKey : undefined,
          }))
        : [],
    fridge: {
      alert: fridgeCard && "alert" in fridgeCard ? fridgeCard.alert : null,
      thumbs: (fridgeCard && "thumbs" in fridgeCard
        ? fridgeCard.thumbs.map((c, i) =>
            typeof c === "string"
              ? { id: String(i), assetKey: undefined, name: "" }
              : { id: String(i), assetKey: "assetKey" in c ? c.assetKey : undefined, name: c.name }
          )
        : []),
    },
    healthReminders:
      healthCard && "reminders" in healthCard
        ? healthCard.reminders.map((r, i) => ({
            id: String(i),
            text: r.text,
            accentColor: r.color,
            icon: r.icon,
          }))
        : [],
    moments: FAMILY_MOMENTS_UI.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      momentIndex: m.momentIndex,
    })),
    services: FAMILY_SERVICES_UI.map((s) => ({
      key: s.key,
      label: s.label,
      icon: s.icon,
    })),
    aiHints: AI_HINTS_UI.map((h) => ({ text: h.text, icon: h.icon })),
  };
}

export async function fetchFamilyDashboard(): Promise<FamilyDashboard> {
  const raw = await callFunction<Record<string, unknown>>("life-handler", {
    query: { action: "family-dashboard" },
  });
  const d =
    raw && typeof raw === "object" && "profile" in raw
      ? raw
      : ((raw as { data?: Record<string, unknown> }).data ?? raw);
  return {
    profile: d.profile as FamilyDashboard["profile"],
    notifyCount: Number(d.notifyCount ?? 3),
    spending: (d.spending as FamilyDashboard["spending"]) ?? null,
    kids: (d.kids as FamilyKidRow[]) ?? [],
    fridge: d.fridge as FamilyDashboard["fridge"],
    healthReminders: (d.healthReminders as FamilyDashboard["healthReminders"]) ?? [],
    moments: (d.moments as FamilyDashboard["moments"]) ?? [],
    services: ((d.services as { key: string; label: string; icon: string }[]) ?? []).map((s) => ({
      key: s.key,
      label: s.label,
      icon: iconKey(s.icon),
    })),
    aiHints: ((d.aiHints as { text: string; icon: string }[]) ?? []).map((h) => ({
      text: h.text,
      icon: iconKey(h.icon),
    })),
  };
}

export function getFamilySpendingFallback(): FamilySpendingDetail {
  return {
    month: SPENDING.month,
    total: SPENDING.total,
    trend: SPENDING.trend,
    budgetLeft: SPENDING.budgetLeft,
    budgetPct: SPENDING.budgetPct,
    groups: SPENDING.groups,
    categories: SPENDING.categories.map((c) => ({
      label: c.label,
      amount: c.amount,
      trend: c.trend,
      up: c.up,
    })),
    transactions: SPENDING.transactions.map((t) => ({
      merchant: t.merchant,
      cat: t.cat,
      amount: t.amount,
      when: t.when,
    })),
  };
}

export async function fetchFamilySpending(year: number, month: number): Promise<FamilySpendingDetail> {
  const raw = await callFunction<{ data: FamilySpendingDetail }>("life-handler", {
    query: { action: "family-spending", year: String(year), month: String(month) },
  });
  const d = (raw as { data?: FamilySpendingDetail }).data ?? raw;
  return d as FamilySpendingDetail;
}
