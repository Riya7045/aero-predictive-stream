import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plane, Clock, TrendingDown, Brain } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppHeader } from "@/components/app/AppHeader";
import { KpiCard, SectionCard } from "@/components/app/KpiCard";
import {
  getSummaryStats,
  getDelayTrends,
  getAirlinesTop,
  getAirportsTop,
} from "@/lib/api-client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkyIntel Flight Delay Intelligence" },
      { name: "description", content: "Overview of delay trends, airline & airport performance and ML model accuracy." },
    ],
  }),
  component: Dashboard,
});

type Granularity = "Hourly" | "Daily" | "Weekly" | "Monthly";

function Dashboard() {
  const [granularity, setGranularity] = useState<Granularity>("Monthly");

  const { data: stats } = useQuery({
    queryKey: ["summaryStats"],
    queryFn: getSummaryStats,
  });

  const { data: trendData } = useQuery({
    queryKey: ["delayTrends", granularity.toLowerCase()],
    queryFn: () =>
      getDelayTrends(granularity.toLowerCase() as "hourly" | "daily" | "weekly" | "monthly"),
  });

  const { data: topAirlines } = useQuery({
    queryKey: ["airlinesTop"],
    queryFn: () => getAirlinesTop(6, "avgDelay"),
  });

  const { data: topAirports } = useQuery({
    queryKey: ["airportsTop"],
    queryFn: () => getAirportsTop(6, "avgDelay"),
  });

  const data = trendData || [];

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Operations Overview"
        subtitle={`Real-time delay intelligence across ${stats?.totalFlights?.toLocaleString()} flights`}
      />

      <div className="p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Flights"
            value={stats?.totalFlights?.toLocaleString() || "—"}
            icon={Plane}
            hint="vs previous period"
          />
          <KpiCard
            label="Delay Rate"
            value={stats ? `${stats.delayRate}%` : "—"}
            delta="-1.4%"
            positive
            icon={TrendingDown}
            hint="Improved month-over-month"
          />
          <KpiCard
            label="Average Delay"
            value={stats ? `${stats.avgDelay} min` : "—"}
            delta="-3 min"
            positive
            icon={Clock}
            hint="Across all carriers"
          />
          <KpiCard
            label="ML Model Accuracy"
            value={stats ? `${stats.modelAccuracy}%` : "—"}
            delta="+0.6%"
            icon={Brain}
            hint="v2.4.1 · 7d rolling"
          />
        </div>

        {/* Unified interactive trend chart */}
        <SectionCard
          title="Delay Trends"
          subtitle={`Delayed departures · ${granularity.toLowerCase()} granularity`}
          action={
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
              {(["Hourly", "Daily", "Weekly", "Monthly"] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    granularity === g
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  interval={granularity === "Hourly" ? 2 : granularity === "Daily" ? 2 : 0}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 8px 24px -12px rgba(15,118,110,.25)",
                  }}
                  cursor={{ stroke: "#0f766e", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="delays"
                  stroke="#0f766e"
                  strokeWidth={3}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Two horizontal bar charts */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <SectionCard title="Top Delayed Airlines" subtitle="Average delay in minutes">
            <div className="space-y-3">
              {topAirlines
                ?.slice(0, 6)
                .map((a) => (
                  <div key={a.code} className="grid grid-cols-[110px_1fr_60px] items-center gap-3">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(a.avgDelay / 40) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-right">{a.avgDelay}m</div>
                  </div>
                ))}
            </div>
          </SectionCard>

          <SectionCard title="Top Delayed Airports" subtitle="Average delay in minutes">
            <div className="space-y-3">
              {topAirports
                ?.slice(0, 6)
                .map((a) => (
                  <div key={a.code} className="grid grid-cols-[140px_1fr_60px] items-center gap-3">
                    <div className="text-sm font-medium truncate">
                      <span className="text-muted-foreground mr-2 font-normal">{a.code}</span>
                      {a.name}
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(a.avgDelay / 40) * 100}%`, backgroundColor: "#38bdf8" }}
                      />
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-right">{a.avgDelay}m</div>
                  </div>
                ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
