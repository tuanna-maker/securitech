import type { LifeGradientIconName } from "../components/life/family/LifeGradientIcon";

export type FamilyKidRow = {
  id: string;
  name: string;
  detail: string;
  dot: string;
  initial: string;
  avatarKey?: "minh" | "an";
};

export type FamilyFridgeThumb = {
  id: string;
  assetKey?: "strawberry" | "milk" | "salmon";
  name: string;
};

export type FamilyDashboard = {
  profile: {
    name: string;
    memberCount: number;
    motto: string | null;
    photoUrl: string | null;
  };
  notifyCount: number;
  spending: {
    monthLabel: string;
    totalFormatted: string;
    trendLabel: string | null;
    year: number;
    month: number;
  } | null;
  kids: FamilyKidRow[];
  fridge: {
    alert: string | null;
    thumbs: FamilyFridgeThumb[];
  };
  healthReminders: {
    id: string;
    text: string;
    accentColor: string;
    icon?: "pills" | "stethoscope";
  }[];
  moments: { id: string; title: string; date: string; momentIndex: number }[];
  services: { key: string; label: string; icon: LifeGradientIconName }[];
  aiHints: { text: string; icon: LifeGradientIconName }[];
};

export type FamilySpendingDetail = {
  month: string;
  total: string;
  trend: string | null;
  budgetLeft: string | null;
  budgetPct: number | null;
  groups: { label: string; pct: number; color: string }[];
  categories: { label: string; amount: string; trend: string; up: boolean }[];
  transactions: { merchant: string; cat: string; amount: string; when: string }[];
};
