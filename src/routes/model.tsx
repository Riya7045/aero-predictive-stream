import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app/AppHeader";
import { SectionCard } from "@/components/app/KpiCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getModelMetrics,
  getFeatureImportance,
  getConfusionMatrix,
  getRocCurve,
  getPerformanceHistory,
  getBenchmark,
} from "@/lib/api-client";
import type { BenchmarkModelResult } from "@/lib/api-client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export const Route = createFileRoute("/model")({
  head: () => ({ meta: [{ title: "Model Insights — SkyIntel" }] }),
  component: ModelPage,
});

// ── Colours shared across charts ──────────────────────────────
const MODEL_COLORS: Record<string, string> = {
  LR:  "#64748b",
  RF:  "#38bdf8",
  XGB: "#0f766e",
};

// ── Benchmark helpers ─────────────────────────────────────────

/** Build the grouped-bar data Recharts needs for the metric comparison chart. */
function buildChartData(models: BenchmarkModelResult[]) {
  const metrics: Array<{ key: keyof BenchmarkModelResult; label: string }> = [
    { key: "accuracy",  label: "Accuracy"   },
    { key: "precision", label: "Precision"  },
    { key: "recall",    label: "Recall"     },
    { key: "f1Score",   label: "F1 Score"   },
    { key: "rocAuc",    label: "ROC-AUC×100" },
  ];

  return metrics.map(({ key, label }) => {
    const row: Record<string, string | number> = { metric: label };
    models.forEach((m) => {
      // rocAuc is 0-1; multiply by 100 so it fits the same axis as the % metrics
      row[m.shortName] = key === "rocAuc"
        ? parseFloat((m[key] as number * 100).toFixed(1))
        : (m[key] as number);
    });
    return row;
  });
}

/** Highlight the winning model's cell value. */
function MetricCell({
  value,
  isWinner,
}: {
  value: string;
  isWinner: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-center tabular-nums font-semibold text-sm ${
        isWinner
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-foreground"
      }`}
    >
      {isWinner ? "★ " : ""}
      {value}
    </td>
  );
}

// ── Page component ────────────────────────────────────────────
function ModelPage() {
  const { data: modelMetrics } = useQuery({
    queryKey: ["modelMetrics"],
    queryFn: getModelMetrics,
  });

  const { data: featureImp } = useQuery({
    queryKey: ["featureImportance"],
    queryFn: getFeatureImportance,
  });

  const { data: confMatrix } = useQuery({
    queryKey: ["confusionMatrix"],
    queryFn: getConfusionMatrix,
  });

  const { data: roc } = useQuery({
    queryKey: ["rocCurve"],
    queryFn: getRocCurve,
  });

  const { data: perfHistory } = useQuery({
    queryKey: ["performanceHistory"],
    queryFn: getPerformanceHistory,
  });

  const { data: benchmark, isLoading: benchLoading, isError: benchError } = useQuery({
    queryKey: ["benchmark"],
    queryFn: getBenchmark,
    retry: false,
  });

  const metrics = modelMetrics
    ? [
        { label: "Accuracy",  value: `${modelMetrics.accuracy}%`  },
        { label: "Precision", value: `${modelMetrics.precision}%` },
        { label: "Recall",    value: `${modelMetrics.recall}%`    },
        { label: "F1 Score",  value: `${modelMetrics.f1Score}%`   },
        { label: "ROC-AUC",   value: modelMetrics.rocAuc.toFixed(3) },
      ]
    : [];

  const benchChartData = benchmark ? buildChartData(benchmark.models) : [];

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Model Insights"
        subtitle="SkyIntel GBT v2.4.1 · trained on 5.2M flights"
      />

      <div className="p-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benchmark">Model Benchmark</TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════
              OVERVIEW TAB — existing content unchanged
          ═══════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="kpi-shadow card-hover rounded-xl bg-card border border-border p-5"
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {m.label}
                  </div>
                  <div className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
                    {m.value}
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-secondary/50 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width:
                          m.value.replace("%", "").replace("0.", "") + "%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <SectionCard
                title="Feature Importance"
                subtitle="Top predictive features (gain)"
              >
                <div className="space-y-3">
                  {featureImp?.slice(0, 7).map((f) => (
                    <div
                      key={f.feature}
                      className="grid grid-cols-[160px_1fr_50px] items-center gap-3"
                    >
                      <div className="text-sm font-medium truncate">
                        {f.feature}
                      </div>
                      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min((f.importance / 0.3) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-sm font-semibold tabular-nums text-right">
                        {(f.importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <SectionCard
                title="Confusion Matrix"
                subtitle={`Validation set (${confMatrix?.totalSamples.toLocaleString()} flights)`}
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    {
                      label: "True Neg",
                      value: confMatrix?.trueNegative,
                      isCorrect: true,
                    },
                    {
                      label: "False Pos",
                      value: confMatrix?.falsePositive,
                      isCorrect: false,
                    },
                    {
                      label: "False Neg",
                      value: confMatrix?.falseNegative,
                      isCorrect: false,
                    },
                    {
                      label: "True Pos",
                      value: confMatrix?.truePositive,
                      isCorrect: true,
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className={`p-4 rounded-lg border ${
                        c.isCorrect
                          ? "bg-primary/8 border-primary/20"
                          : "bg-destructive/8 border-destructive/20"
                      }`}
                      style={{
                        backgroundColor: c.isCorrect
                          ? "rgba(54,18,110,.08)"
                          : "rgba(194,81,90,.08)",
                      }}
                    >
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                        {c.label}
                      </div>
                      <div className="text-2xl font-semibold tabular-nums mt-1">
                        {c.value?.toLocaleString() || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="ROC Curve"
                subtitle={`AUC = ${modelMetrics?.rocAuc.toFixed(3)}`}
              >
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={roc || []}
                      margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#0f766e"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor="#0f766e"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="fpr"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
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
                        dataKey="tpr"
                        stroke="#0f766e"
                        strokeWidth={3}
                        fill="url(#g3)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="Model Performance Over Time"
                subtitle="Monthly · 7 months"
              >
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={perfHistory || []}
                      margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        domain={[80, 95]}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        dataKey="accuracy"
                        stroke="#0f766e"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        dataKey="precision"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        dataKey="recall"
                        stroke="#5eead4"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════
              BENCHMARK TAB — new content
          ═══════════════════════════════════════════════════════ */}
          <TabsContent value="benchmark" className="space-y-6">
            {/* Not-yet-run state */}
            {(benchLoading || benchError || !benchmark) && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
                {benchLoading
                  ? "Loading benchmark results..."
                  : "Benchmark data not available. Run train_benchmark.py to generate results."}
              </div>
            )}

            {benchmark && (
              <>
                {/* Winner banner */}
                <div
                  className="rounded-xl border p-5 flex flex-col gap-1"
                  style={{
                    background: "rgba(16,185,129,.07)",
                    borderColor: "rgba(16,185,129,.25)",
                  }}
                >
                  <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                    Best Model
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {benchmark.winner}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {benchmark.winnerReason}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Trained on{" "}
                    <span className="font-medium text-foreground">
                      {benchmark.sampleSize.toLocaleString()}
                    </span>{" "}
                    stratified samples from{" "}
                    <span className="font-medium text-foreground">
                      {benchmark.sampledFrom.toLocaleString()}
                    </span>{" "}
                    flights · {(benchmark.trainSplit * 100).toFixed(0)}/
                    {((1 - benchmark.trainSplit) * 100).toFixed(0)} train/test
                    split ·{" "}
                    {new Date(benchmark.benchmarkedAt).toLocaleDateString(
                      "en-IN",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </div>
                </div>

                {/* Metric comparison table */}
                <SectionCard
                  title="Metric Comparison"
                  subtitle={`All models evaluated on ${benchmark.testSamples.toLocaleString()} held-out test flights · threshold = 0.5`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Metric
                          </th>
                          {benchmark.models.map((m) => (
                            <th
                              key={m.shortName}
                              className="px-4 py-3 text-center text-xs uppercase tracking-wider font-semibold"
                              style={{
                                color: MODEL_COLORS[m.shortName] ?? "#64748b",
                              }}
                            >
                              {m.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(
                          [
                            { key: "accuracy",  label: "Accuracy",   fmt: (v: number) => `${v}%`         },
                            { key: "precision", label: "Precision",  fmt: (v: number) => `${v}%`         },
                            { key: "recall",    label: "Recall",     fmt: (v: number) => `${v}%`         },
                            { key: "f1Score",   label: "F1 Score",   fmt: (v: number) => `${v}%`         },
                            { key: "rocAuc",    label: "ROC-AUC",    fmt: (v: number) => v.toFixed(3)    },
                            { key: "trainTimeSeconds", label: "Train Time", fmt: (v: number) => `${v}s`  },
                          ] as const
                        ).map(({ key, label, fmt }) => {
                          const vals = benchmark.models.map((m) => m[key] as number);
                          // For train time, lower is better; for all metrics, higher is better.
                          const best =
                            key === "trainTimeSeconds"
                              ? Math.min(...vals)
                              : Math.max(...vals);
                          return (
                            <tr key={key} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                                {label}
                              </td>
                              {benchmark.models.map((m) => (
                                <MetricCell
                                  key={m.shortName}
                                  value={fmt(m[key] as number)}
                                  isWinner={(m[key] as number) === best}
                                />
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

                {/* Grouped bar chart */}
                <SectionCard
                  title="Visual Comparison"
                  subtitle="All metrics scaled to 0-100 (ROC-AUC multiplied by 100)"
                >
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={benchChartData}
                        margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                        barCategoryGap="25%"
                        barGap={3}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="metric"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(v) => `${v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(value: number, name: string) => [
                            `${value}`,
                            benchmark.models.find((m) => m.shortName === name)
                              ?.name ?? name,
                          ]}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11 }}
                          formatter={(value) =>
                            benchmark.models.find((m) => m.shortName === value)
                              ?.name ?? value
                          }
                        />
                        {benchmark.models.map((m) => (
                          <Bar
                            key={m.shortName}
                            dataKey={m.shortName}
                            fill={MODEL_COLORS[m.shortName] ?? "#64748b"}
                            radius={[3, 3, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
