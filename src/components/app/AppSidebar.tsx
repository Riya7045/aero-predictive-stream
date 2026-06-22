import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Plane,
  Building2,
  Route as RouteIcon,
  Brain,
  Settings,
  Sparkles,
  TrendingUp,
  ArrowLeftRight,
  Lightbulb,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/predictor", label: "Flight Predictor", icon: Sparkles },
  { to: "/compare", label: "Compare Scenarios", icon: ArrowLeftRight },
  { to: "/recommend", label: "Recommendations", icon: Lightbulb },
  { to: "/airlines", label: "Airline Analytics", icon: Plane },
  { to: "/airports", label: "Airport Analytics", icon: Building2 },
  { to: "/routes", label: "Route Analytics", icon: RouteIcon },
  { to: "/model", label: "Model Insights", icon: Brain },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
          <Plane className="size-4.5 text-primary-foreground -rotate-45" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm tracking-tight">SkyIntel</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Delay Intelligence
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 p-3 rounded-lg bg-secondary/40 border border-sidebar-border">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <TrendingUp className="size-3.5 text-primary" />
          Model v2.4.1
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
          Trained on 5.2M flights · Updated 2h ago
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-background overflow-hidden">
          <div className="h-full w-[91%] bg-primary" />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Accuracy 91.2%</div>
      </div>
    </aside>
  );
}
