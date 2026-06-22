import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, AlertTriangle, Clock, Activity, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { SectionCard } from "@/components/app/KpiCard";
import { getPredictInputs, predict, type PredictOutput } from "@/lib/api-client";

export const Route = createFileRoute("/predictor")({
  head: () => ({ meta: [{ title: "Flight Predictor — SkyIntel" }] }),
  component: Predictor,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-md border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

function Predictor() {
  const [result, setResult] = useState<PredictOutput | null>(null);
  const [formData, setFormData] = useState({
    airline: "DL",
    origin: "LAX",
    destination: "JFK",
    distance: 1840,
    month: 7,
    dayOfWeek: 5,
    scheduledDeparture: "18:45",
  });

  const { data: predictInputs } = useQuery({
    queryKey: ["predictInputs"],
    queryFn: getPredictInputs,
  });

  const predictMutation = useMutation({
    mutationFn: predict,
    onSuccess: (data) => {
      setResult(data);
    },
  });

  function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    predictMutation.mutate({
      airline: formData.airline,
      origin: formData.origin,
      destination: formData.destination,
      distance: formData.distance,
      month: formData.month,
      dayOfWeek: formData.dayOfWeek,
      scheduledDeparture: formData.scheduledDeparture,
    });
  }

  const prob = result?.delayProbability ?? 0;
  const minutes = result?.expectedDelay ?? 0;
  const risk = result?.riskLevel ?? "—";

  const airlines = predictInputs?.airlines || [];
  const airports = predictInputs?.airports || [];

  return (
    <div className="min-h-screen">
      <AppHeader title="Flight Predictor" subtitle="ML-powered delay probability for any flight" />

      <div className="p-6 grid gap-6 grid-cols-1 xl:grid-cols-5">
        <form onSubmit={handlePredict} className="xl:col-span-2 kpi-shadow rounded-xl bg-card border border-border p-6 space-y-5 h-fit">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">New Prediction</h3>
              <p className="text-xs text-muted-foreground">Fill flight details to estimate delay</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Airline">
              <select
                className={inputCls}
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              >
                {airlines.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Distance (mi)">
              <input
                type="number"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Origin Airport">
              <select
                className={inputCls}
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              >
                {airports.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} · {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Destination Airport">
              <select
                className={inputCls}
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              >
                {airports.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} · {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Month">
              <select
                className={inputCls}
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              >
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Day of Week">
              <select
                className={inputCls}
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                  <option key={d} value={i + 1}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Scheduled Departure">
                <input
                  type="time"
                  value={formData.scheduledDeparture}
                  onChange={(e) => setFormData({ ...formData, scheduledDeparture: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            disabled={predictMutation.isPending}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="size-4" /> {predictMutation.isPending ? "Predicting..." : "Run Prediction"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Inference on SkyIntel Gradient Boosted Trees v2.4.1</p>
        </form>

        <div className="xl:col-span-3 space-y-5">
          {/* Focal point: Prediction Result Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="kpi-shadow rounded-xl bg-card border-2 border-primary/20 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06] bg-gradient-to-br from-primary to-secondary" />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Delay Probability</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-6xl font-bold tracking-tight tabular-nums text-primary">
                    {result ? prob.toFixed(1) : "—"}
                    <span className="text-2xl text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Likelihood of &gt;15 min delay</div>
                <div className="mt-4 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${result ? prob : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="kpi-shadow rounded-xl bg-card border border-border p-6">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Clock className="size-3.5 text-primary" /> Expected Delay
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-6xl font-bold tracking-tight tabular-nums">{result ? minutes : "—"}</div>
                <div className="text-2xl text-muted-foreground font-medium">min</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">±{result?.confidenceInterval || 8} min · 90% CI</div>
              <div className="mt-4 grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full"
                    style={{
                      background: i < Math.ceil(minutes / 12) ? "#0f766e" : "var(--muted)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="kpi-shadow rounded-xl bg-card border border-border p-6">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <AlertTriangle className="size-3.5" style={{ color: "#EF4444" }} /> Risk Level
              </div>
              <div
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md font-bold text-white"
                style={{
                  background:
                    risk === "Critical"
                      ? "#DC2626"
                      : risk === "High"
                        ? "#EF4444"
                        : risk === "Medium"
                          ? "#F59E0B"
                          : "#22C55E",
                }}
              >
                <AlertTriangle className="size-4" /> {result ? risk.toUpperCase() : "—"}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {[
                  { l: "Low", c: "#22C55E" },
                  { l: "Med", c: "#F59E0B" },
                  { l: "High", c: "#EF4444" },
                  { l: "Crit", c: "#DC2626" },
                ].map((s, i) => {
                  const riskIdx =
                    risk === "Critical" ? 3 : risk === "High" ? 2 : risk === "Medium" ? 1 : 0;
                  return (
                    <div key={s.l} className="text-center">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          background: i <= riskIdx ? s.c : "var(--muted)",
                        }}
                      />
                      <div
                        className="mt-1 text-[10px] font-medium"
                        style={{ color: i === riskIdx ? s.c : "var(--muted-foreground)" }}
                      >
                        {s.l}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {result ? `${result.shapContributions.filter((c) => c.direction === "up").length} contributing factors` : "—"}
              </div>
            </div>
          </div>

          <SectionCard title="Prediction Explanation" subtitle="Top contributing factors (SHAP values)">
            <div className="space-y-3">
              {result && result.shapContributions.length > 0 ? (
                result.shapContributions.map((f) => (
                  <div key={f.factor} className="flex items-center gap-3">
                    <div
                      className="size-8 grid place-items-center rounded-md"
                      style={{
                        background:
                          f.direction === "up" ? "rgb(239 68 68 / .14)" : "rgb(34 197 94 / .14)",
                        color: f.direction === "up" ? "#EF4444" : "#22C55E",
                      }}
                    >
                      {f.direction === "up" ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <Activity className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{f.factor}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Impact strength: {(f.strength * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${f.strength * 100}%`,
                          background:
                            f.direction === "up" ? "#EF4444" : "#22C55E",
                        }}
                      />
                    </div>
                    <div
                      className="w-12 text-right text-xs font-bold tabular-nums"
                      style={{
                        color: f.direction === "up" ? "#EF4444" : "#22C55E",
                      }}
                    >
                      {f.direction === "up" ? "+" : "−"}
                      {(f.strength * 100).toFixed(0)}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Run a prediction to see contributing factors
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
