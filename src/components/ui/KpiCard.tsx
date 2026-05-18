type LegacyColor = "teal" | "amber" | "danger" | "info" | "purple" | "green";
type StatusColor = "active" | "idle" | "warning" | "missing" | "resigned";

interface KpiCardProps {
  label: string;
  value: string | number;
  valueSuffix?: string;
  delta?: string;
  deltaType?: "up" | "dn" | "neutral";
  color: LegacyColor | StatusColor;
}

const deltaColors = {
  up: "text-status-active",
  dn: "text-status-missing",
  neutral: "text-t3",
};

// Static class strings — Tailwind purge needs literal class names.
const STATUS_BARS = {
  active:   { bar: "bg-status-active",   glow: "shadow-[0_0_6px_-2px_hsl(var(--status-active)/0.25)]" },
  idle:     { bar: "bg-status-idle",     glow: "shadow-[0_0_6px_-2px_hsl(var(--status-idle)/0.25)]" },
  warning:  { bar: "bg-status-warning",  glow: "shadow-[0_0_6px_-2px_hsl(var(--status-warning)/0.25)]" },
  missing:  { bar: "bg-status-missing",  glow: "shadow-[0_0_6px_-2px_hsl(var(--status-missing)/0.25)]" },
  resigned: { bar: "bg-status-resigned", glow: "shadow-[0_0_6px_-2px_hsl(var(--status-resigned)/0.25)]" },
} as const;

const accentMap: Record<LegacyColor | StatusColor, { bar: string; glow: string }> = {
  active:   STATUS_BARS.active,
  idle:     STATUS_BARS.idle,
  warning:  STATUS_BARS.warning,
  missing:  STATUS_BARS.missing,
  resigned: STATUS_BARS.resigned,
  // Legacy aliases mapped to OTRN status palette
  teal:   STATUS_BARS.active,
  green:  STATUS_BARS.active,
  amber:  STATUS_BARS.warning,
  danger: STATUS_BARS.missing,
  info:   STATUS_BARS.idle,
  purple: STATUS_BARS.resigned,
};

export default function KpiCard({ label, value, valueSuffix, delta, deltaType = "neutral", color }: KpiCardProps) {
  const accent = accentMap[color];

  return (
    <div className={`bg-bg1 border border-border rounded-lg px-3 py-2 relative overflow-hidden transition-all duration-200 hover:border-border-strong hover:-translate-y-px ${accent.glow} group`}>
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${accent.bar} opacity-50 group-hover:opacity-100 transition-opacity`} />
      <div className="text-[10px] text-t3 uppercase tracking-wider font-semibold mb-0.5">{label}</div>
      <div className="font-display text-xl font-extrabold leading-none mb-0.5 text-t1">
        {value}{valueSuffix && <span className="text-xs text-t3 font-normal">{valueSuffix}</span>}
      </div>
      <div className={`text-[9px] ${deltaColors[deltaType]}`}>{delta}</div>
    </div>
  );
}
