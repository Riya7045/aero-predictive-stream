import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app/AppHeader";
import { SectionCard } from "@/components/app/KpiCard";
import { getAirlines, getAirlineTrends } from "@/lib/api-client";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/airlines")({
  head: () => ({ meta: [{ title: "Airline Analytics — SkyIntel" }] }),
  component: AirlinesPage,
});

function AirlinesPage() {
  const { data: airlines } = useQuery({
    queryKey: ["airlines"],
    queryFn: getAirlines,
  });

  const { data: trendData } = useQuery({
    queryKey: ["airlineTrends"],
    queryFn: getAirlineTrends,
  });

  const sortedAirlines = airlines ? [...airlines].sort((a, b) => b.onTime - a.onTime) : [];

  return (
    <div className="min-h-screen">
      <AppHeader title="Airline Analytics" subtitle={`Carrier performance benchmarked across ${airlines?.reduce((sum, a) => sum + a.flights, 0).toLocaleString() || "—"} flights`} />
      <div className="p-6 space-y-6">
        <SectionCard title="Airline Ranking" subtitle="Sorted by on-time performance">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">#</th>
                  <th className="py-3 font-medium">Airline</th>
                  <th className="py-3 font-medium text-right">Flights</th>
                  <th className="py-3 font-medium text-right">Avg Delay</th>
                  <th className="py-3 font-medium text-right">Delay Rate</th>
                  <th className="py-3 font-medium text-right">On-Time %</th>
                  <th className="py-3 font-medium w-40">Performance</th>
                </tr>
              </thead>
              <tbody>
                {sortedAirlines.map((a, i) => (
                  <tr
                    key={a.code}
                    className="border-b border-border last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="py-3 font-medium flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                        {a.code}
                      </span>
                      {a.name}
                    </td>
                    <td className="py-3 text-right tabular-nums">{a.flights.toLocaleString()}</td>
                    <td className="py-3 text-right tabular-nums">{a.avgDelay} min</td>
                    <td className="py-3 text-right tabular-nums">{a.delayRate}%</td>
                    <td className="py-3 text-right tabular-nums font-semibold">{a.onTime}%</td>
                    <td className="py-3">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${a.onTime}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Airline Comparison" subtitle="Average delay (min) · last 12 months">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData || []} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {airlines?.slice(0, 4).map((a) => (
                  <Line key={a.code} dataKey={a.name} stroke={`hsl(${Math.random() * 360}, 70%, 50%)`} strokeWidth={3} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Monthly Airline Trend" subtitle="System-wide carrier average delay">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData || []} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                {airlines?.slice(0, 4).map((a) => (
                  <Line key={a.code} dataKey={a.name} stroke={`hsl(${Math.random() * 360}, 70%, 50%)`} strokeWidth={3} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
