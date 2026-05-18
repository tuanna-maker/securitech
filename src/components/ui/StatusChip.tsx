type LegacyColor = "teal" | "amber" | "danger" | "info" | "purple" | "green" | "gray";
type StatusColor = "active" | "idle" | "warning" | "missing" | "resigned";

interface StatusChipProps {
  children: React.ReactNode;
  color: LegacyColor | StatusColor;
  dot?: boolean;
}

const colorMap: Record<LegacyColor | StatusColor, string> = {
  // OTRN status (preferred)
  active:   "bg-status-active-bg text-status-active border-status-active/25",
  idle:     "bg-status-idle-bg text-status-idle border-status-idle/25",
  warning:  "bg-status-warning-bg text-status-warning border-status-warning/25",
  missing:  "bg-status-missing-bg text-status-missing border-status-missing/25",
  resigned: "bg-status-resigned-bg text-status-resigned border-status-resigned/25",
  // Legacy aliases — mapped onto OTRN status tokens for visual consistency
  teal:    "bg-status-active-bg text-status-active border-status-active/25",
  green:   "bg-status-active-bg text-status-active border-status-active/25",
  amber:   "bg-status-warning-bg text-status-warning border-status-warning/25",
  danger:  "bg-status-missing-bg text-status-missing border-status-missing/25",
  info:    "bg-status-idle-bg text-status-idle border-status-idle/25",
  purple:  "bg-status-resigned-bg text-status-resigned border-status-resigned/25",
  gray:    "bg-status-resigned-bg text-status-resigned border-status-resigned/25",
};

const dotColors: Record<LegacyColor | StatusColor, string> = {
  active:   "bg-status-active",
  idle:     "bg-status-idle",
  warning:  "bg-status-warning",
  missing:  "bg-status-missing animate-blink",
  resigned: "bg-status-resigned",
  teal:     "bg-status-active",
  green:    "bg-status-active",
  amber:    "bg-status-warning",
  danger:   "bg-status-missing animate-blink",
  info:     "bg-status-idle",
  purple:   "bg-status-resigned",
  gray:     "bg-status-resigned",
};

export function StatusBadge({ children, color, dot }: StatusChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full text-[9px] font-semibold ${colorMap[color]}`}>
      {dot && <span className={`w-1 h-1 rounded-full ${dotColors[color]}`} />}
      {children}
    </span>
  );
}

export function Chip({ children, color }: Omit<StatusChipProps, "dot">) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded text-[9px] font-semibold border ${colorMap[color]}`}>
      {children}
    </span>
  );
}
