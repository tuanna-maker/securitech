interface CardPanelProps {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function CardPanel({ title, action, children, className = "" }: CardPanelProps) {
  return (
    <div className={`bg-bg1 border border-border rounded-lg overflow-hidden transition-all duration-150 hover:border-border-strong ${className}`}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <div className="text-xs font-bold text-t1 uppercase tracking-wider flex items-center gap-1.5">{title}</div>
        {action && <div className="text-[9px] text-teal cursor-pointer opacity-70 hover:opacity-100 transition-opacity font-medium">{action}</div>}
      </div>
      <div className="p-2.5">{children}</div>
    </div>
  );
}
