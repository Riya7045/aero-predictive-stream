import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app/AppHeader";
import { SectionCard } from "@/components/app/KpiCard";
import { getRoutes, getRouteTrends } from "@/lib/api-client";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Legend,
} from "recharts";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/routes")({
  head: () => ({ meta: [{ title: "Route Analytics — SkyIntel" }] }),
  component: RoutesPage,
});

function riskColor(risk: number) {
  if (risk >= 80) return "#DC2626";
  if (risk >= 65) return "#EF4444";
  if (risk >= 45) return "#F59E0B";
  return "#22C55E";
}

function RoutesPage() {
  const { data: routesData } = useQuery({
    queryKey: ["routes"],
    queryFn: () => getRoutes("risk", 10),
  });

  const { data: trendsData } = useQuery({
    queryKey: ["routeTrends"],
    queryFn: () => {
      if (!routesData || routesData.length === 0) return Promise.resolve([]);
      const topRoutes = routesData.slice(0, 3).map((r) => `${r.origin}-${r.dest}`).join(",");
      return getRouteTrends(topRoutes);
    },
    enabled: !!routesData && routesData.length > 0,
  });

  const sortedRisk = routesData ? [...routesData].sort((a, b) => b.risk - a.risk) : [];

  return (
    <div className="min-h-screen">
      <AppHeader title="Route Analytics" subtitle="Origin-destination delay & risk modeling" />
      <div className="p-6 space-y-6">
        <SectionCard title="Most Delayed Routes" subtitle="Ranked by composite risk score">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">#</th>
                  <th className="py-3 font-medium">Route</th>
                  <th className="py-3 font-medium text-right">Flights</th>
                  <th className="py-3 font-medium text-right">Avg Delay</th>
                  <th className="py-3 font-medium text-right">Delay Rate</th>
                  <th className="py-3 font-medium text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedRisk.map((r, i) => (
                  <tr key={r.origin + r.dest} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="py-3 font-medium">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{r.origin}</span>
                      <ArrowRight className="inline mx-2 size-3 text-muted-foreground" />
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{r.dest}</span>
                    </td>
                    <td className="py-3 text-right tabular-nums">{r.flights.toLocaleString()}</td>
                    <td className="py-3 text-right tabular-nums">{r.avgDelay} min</td>
                    <td className="py-3 text-right tabular-nums">{r.delayRate}%</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-2 font-semibold tabular-nums">
                        <span className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <span className="block h-full rounded-full" style={{ width: `${r.risk}%`, background: riskColor(r.risk) }} />
                        </span>
                        <span style={{ color: riskColor(r.risk) }}>{r.risk}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Route Performance Trends" subtitle="Top 3 risky routes · 12 months">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData || []} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
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
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {routesData?.slice(0, 3).map((r, i) => (
                  <Line
                    key={i}
                    dataKey={`${r.origin}→${r.dest}`}
                    stroke={["#0f766e", "#38bdf8", "#5eead4"][i]}
                    strokeWidth={3}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
