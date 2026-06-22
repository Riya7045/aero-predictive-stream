import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  positive = true,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="kpi-shadow card-hover rounded-xl bg-gradient-to-br from-card via-card to-card/70 border border-border/60 p-6 flex flex-col gap-5 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start justify-between">
        <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground grid place-items-center shadow-lg shadow-primary/30">
          <Icon className="size-6" />
        </div>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md"
          style={{
            backgroundColor: positive ? "rgb(34 197 94 / .14)" : "rgb(239 68 68 / .14)",
            color: positive ? "var(--success)" : "var(--destructive)",
          }}
        >
          {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta}
        </span>
      </div>
      <div className="relative">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="mt-1.5 text-[2.5rem] leading-none font-bold tracking-tight tabular-nums bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </div>
        {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`kpi-shadow rounded-xl bg-gradient-to-br from-card via-card to-card/80 border border-border/60 p-5 overflow-hidden relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
