import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app/AppHeader";
import { SectionCard } from "@/components/app/KpiCard";
import { getAirports, getAirportHeatmap, getAirportTrends } from "@/lib/api-client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/airports")({
  head: () => ({ meta: [{ title: "Airport Analytics — SkyIntel" }] }),
  component: AirportsPage,
});

function AirportsPage() {
  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: getAirports,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ["airportHeatmap"],
    queryFn: getAirportHeatmap,
  });

  const { data: trendData } = useQuery({
    queryKey: ["airportTrends", "JFK"],
    queryFn: () => getAirportTrends("JFK"),
  });

  const worst = airports ? [...airports].sort((a, b) => b.avgDelay - a.avgDelay).slice(0, 5) : [];
  const allAirports = airports || [];

  return (
    <div className="min-h-screen">
      <AppHeader title="Airport Analytics" subtitle="Hub-level efficiency and delay behavior" />
      <div className="p-6 space-y-6">
        <SectionCard title="Airport Ranking" subtitle="All hubs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Airport</th>
                  <th className="py-3 font-medium text-right">Flights</th>
                  <th className="py-3 font-medium text-right">Avg Delay</th>
                  <th className="py-3 font-medium text-right">Delay Rate</th>
                </tr>
              </thead>
              <tbody>
                {[...allAirports].sort((a, b) => b.avgDelay - a.avgDelay).map((a) => (
                  <tr
                    key={a.code}
                    className="border-b border-border last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-3 font-medium">
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded mr-2">
                        {a.code}
                      </span>
                      {a.name}
                    </td>
                    <td className="py-3 text-right tabular-nums">{a.flights.toLocaleString()}</td>
                    <td className="py-3 text-right tabular-nums">{a.avgDelay} min</td>
                    <td className="py-3 text-right tabular-nums">{a.delayRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Worst Performing Airports" subtitle="Highest average delay">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {worst.map((a, i) => (
              <div key={a.code} className="rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs bg-destructive/15 text-destructive px-2 py-1 rounded font-semibold">{a.code}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">#{i + 1}</span>
                </div>
                <div className="mt-3 text-sm font-medium truncate">{a.name}</div>
                <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{a.avgDelay}<span className="text-sm text-muted-foreground font-medium"> min</span></div>
                <div className="text-xs text-muted-foreground">{a.delayRate}% delay rate</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <SectionCard title="Airport Delay Trends" subtitle="JFK · 12 months" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData || []} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="airportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgDelay"
                    stroke="#0f766e"
                    strokeWidth={3}
                    fill="url(#airportGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Airport Delay Heatmap" subtitle="Top hubs · by weekday">
            <div className="grid grid-cols-8 gap-1.5 text-[10px]">
              <div />
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="text-center text-muted-foreground font-semibold">
                  {d}
                </div>
              ))}
              {heatmapData?.slice(0, 8).map((a) => (
                <Fragment key={a.code}>
                  <div className="text-right pr-1 font-mono text-muted-foreground font-semibold self-center">
                    {a.code}
                  </div>
                  {a.delays.map((delay, j) => {
                    const v = (delay || 0) / 40;
                    const color =
                      v > 0.75 ? "#0f766e" : v > 0.5 ? "#38bdf8" : v > 0.25 ? "#5eead4" : "#cffafe";
                    return (
                      <div
                        key={a.code + j}
                        className="aspect-square rounded-md ring-1 ring-border/40"
                        style={{
                          backgroundColor: color,
                          opacity: 0.35 + v * 0.65,
                        }}
                        title={`${a.code} · ${Math.round((delay || 0) * 10) / 10} min avg delay`}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <div
                className="flex-1 mx-2 h-2 rounded-full"
                style={{
                  background: "linear-gradient(to right, #cffafe, #5eead4, #38bdf8, #0f766e)",
                }}
              />
              <span>High</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
