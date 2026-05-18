/**
 * OTRN status semantics — single source of truth for chips, KPI accents, charts.
 * States: active (đang trực) · idle (chờ / nghỉ phép) · warning (cảnh báo) ·
 *         missing (thiếu người) · resigned (đã nghỉ việc).
 */

export type StatusKey =
  | "active"
  | "idle"
  | "warning"
  | "missing"
  | "resigned";

export const STATUS_LABEL_VI: Record<StatusKey, string> = {
  active: "Đang trực",
  idle: "Chờ / Nghỉ phép",
  warning: "Cảnh báo",
  missing: "Thiếu người",
  resigned: "Đã nghỉ việc",
};

/** Tailwind class bundles for chips / dots / borders. */
export const STATUS_CLASSES: Record<
  StatusKey,
  { fg: string; bg: string; dot: string; border: string; chip: string }
> = {
  active: {
    fg: "text-status-active",
    bg: "bg-status-active-bg",
    dot: "bg-status-active",
    border: "border-status-active/30",
    chip: "bg-status-active-bg text-status-active border border-status-active/25",
  },
  idle: {
    fg: "text-status-idle",
    bg: "bg-status-idle-bg",
    dot: "bg-status-idle",
    border: "border-status-idle/30",
    chip: "bg-status-idle-bg text-status-idle border border-status-idle/25",
  },
  warning: {
    fg: "text-status-warning",
    bg: "bg-status-warning-bg",
    dot: "bg-status-warning",
    border: "border-status-warning/30",
    chip: "bg-status-warning-bg text-status-warning border border-status-warning/25",
  },
  missing: {
    fg: "text-status-missing",
    bg: "bg-status-missing-bg",
    dot: "bg-status-missing",
    border: "border-status-missing/30",
    chip: "bg-status-missing-bg text-status-missing border border-status-missing/25",
  },
  resigned: {
    fg: "text-status-resigned",
    bg: "bg-status-resigned-bg",
    dot: "bg-status-resigned",
    border: "border-status-resigned/30",
    chip: "bg-status-resigned-bg text-status-resigned border border-status-resigned/25",
  },
};

/** Chart sequence — use for Recharts/SVG fills via CSS variable. */
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

/** Map a chart index (0..n) to a sequence color, wrapping if needed. */
export const chartColor = (i: number) =>
  CHART_COLORS[i % CHART_COLORS.length];

/** Map a status key to its primary fill color (for chart segments). */
export const statusFill = (s: StatusKey) => `hsl(var(--status-${s}))`;
