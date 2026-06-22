import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Shield, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import {
  getPredictInputs,
  getRouteDistances,
  compareScenarios,
  type CompareResponse,
  type ScenarioInput,
} from "@/lib/api-client";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare Scenarios — SkyIntel" }] }),
  component: ComparePage,
});

// ── Constants ─────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

interface ScenarioState {
  label: string;
  airline: string;
  origin: string;
  destination: string;
  month: number;
  dayOfWeek: number;
  scheduledDeparture: string;
}

const DEFAULT_A: ScenarioState = {
  label: "Scenario A",
  airline: "DL",
  origin: "JFK",
  destination: "LAX",
  month: 7,
  dayOfWeek: 5,
  scheduledDeparture: "20:00",
};

const DEFAULT_B: ScenarioState = {
  label: "Scenario B",
  airline: "DL",
  origin: "JFK",
  destination: "LAX",
  month: 7,
  dayOfWeek: 2,
  scheduledDeparture: "11:00",
};

// ── Helpers ───────────────────────────────────────────────

const selectCls =
  "w-full h-9 px-3 rounded-md border border-border bg-card text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

function probColor(prob: number) {
  if (prob >= 80) return "text-red-500";
  if (prob >= 65) return "text-orange-500";
  if (prob >= 45) return "text-yellow-500";
  return "text-green-500";
}

function riskBadgeCls(risk: string) {
  if (risk === "Critical") return "bg-red-500/10 border-red-500/30 text-red-500";
  if (risk === "High") return "bg-orange-500/10 border-orange-500/30 text-orange-500";
  if (risk === "Medium") return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400";
  return "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400";
}

// ── ScenarioForm ──────────────────────────────────────────

interface ScenarioFormProps {
  scenario: ScenarioState;
  onChange: (next: ScenarioState) => void;
  airlines: { code: string; name: string }[];
  airports: { code: string; name: string }[];
  badge: "A" | "B";
  accentBorder: string;
}

function ScenarioForm({
  scenario,
  onChange,
  airlines,
  airports,
  badge,
  accentBorder,
}: ScenarioFormProps) {
  const set = <K extends keyof ScenarioState>(key: K, val: ScenarioState[K]) =>
    onChange({ ...scenario, [key]: val });

  return (
    <div className={`flex-1 rounded-xl border-2 ${accentBorder} bg-card p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-md bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
          {badge}
        </div>
        <input
          className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-foreground"
          value={scenario.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder={`Scenario ${badge}`}
        />
      </div>

      {/* Airline */}
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Airline
        </span>
        <select
          className={selectCls}
          value={scenario.airline}
          onChange={(e) => set("airline", e.target.value)}
        >
          {airlines.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name} ({a.code})
            </option>
          ))}
        </select>
      </label>

      {/* Origin */}
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Origin Airport
        </span>
        <select
          className={selectCls}
          value={scenario.origin}
          onChange={(e) => set("origin", e.target.value)}
        >
          {airports.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} – {a.name}
            </option>
          ))}
        </select>
      </label>

      {/* Destination */}
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Destination Airport
        </span>
        <select
          className={selectCls}
          value={scenario.destination}
          onChange={(e) => set("destination", e.target.value)}
        >
          {airports
            .filter((a) => a.code !== scenario.origin)
            .map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} – {a.name}
              </option>
            ))}
        </select>
      </label>

      {/* Month + Day of Week */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Month
          </span>
          <select
            className={selectCls}
            value={scenario.month}
            onChange={(e) => set("month", Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Day of Week
          </span>
          <select
            className={selectCls}
            value={scenario.dayOfWeek}
            onChange={(e) => set("dayOfWeek", Number(e.target.value))}
          >
            {DAYS.map((d, i) => (
              <option key={i} value={i + 1}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Departure Time */}
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Scheduled Departure
        </span>
        <input
          type="time"
          className={selectCls}
          value={scenario.scheduledDeparture}
          onChange={(e) => set("scheduledDeparture", e.target.value)}
        />
      </label>
    </div>
  );
}

// ── ResultCard ────────────────────────────────────────────

interface ResultCardProps {
  result: CompareResponse["scenarioA"];
  isBetter: boolean;
}

function ResultCard({ result, isBetter }: ResultCardProps) {
  return (
    <div
      className={`flex-1 rounded-xl border-2 p-5 space-y-4 ${
        isBetter
          ? "border-green-500/50 bg-green-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{result.label}</span>
        {isBetter && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
            Better Choice
          </span>
        )}
      </div>

      {/* Big probability number */}
      <div className="text-center py-3">
        <div className={`text-5xl font-bold tabular-nums ${probColor(result.delayProbability)}`}>
          {result.delayProbability}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">delay probability</div>
        <div className="text-xs text-muted-foreground/60 mt-0.5">
          ±{result.confidenceInterval}% confidence
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <div className="text-[11px] text-muted-foreground">Expected Delay</div>
          <div className="text-lg font-semibold mt-0.5">
            {result.expectedDelay > 0 ? `${result.expectedDelay} min` : "On time"}
          </div>
        </div>
        <div className={`rounded-lg border p-3 ${riskBadgeCls(result.riskLevel)}`}>
          <div className="text-[11px] text-muted-foreground">Risk Level</div>
          <div className="text-lg font-semibold mt-0.5">{result.riskLevel}</div>
        </div>
      </div>

      {/* Flight details */}
      <div className="space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        {[
          ["Airline", result.airline],
          ["Route", `${result.origin} → ${result.destination}`],
          ["Departure", result.scheduledDeparture],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span>{k}</span>
            <span className="font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

function ComparePage() {
  const [scenarioA, setScenarioA] = useState<ScenarioState>(DEFAULT_A);
  const [scenarioB, setScenarioB] = useState<ScenarioState>(DEFAULT_B);
  const [result, setResult] = useState<CompareResponse | null>(null);

  const { data: inputs } = useQuery({
    queryKey: ["predictInputs"],
    queryFn: getPredictInputs,
  });

  const { data: distances } = useQuery({
    queryKey: ["routeDistances"],
    queryFn: getRouteDistances,
  });

  const getDistance = (origin: string, dest: string): number =>
    distances?.[`${origin}-${dest}`] ?? 1000;

  const mutation = useMutation({
    mutationFn: compareScenarios,
    onSuccess: (data) => setResult(data),
  });

  const handleCompare = () => {
    const payload = {
      scenarioA: {
        ...scenarioA,
        distance: getDistance(scenarioA.origin, scenarioA.destination),
      } as ScenarioInput,
      scenarioB: {
        ...scenarioB,
        distance: getDistance(scenarioB.origin, scenarioB.destination),
      } as ScenarioInput,
    };
    mutation.mutate(payload);
  };

  const airlines = inputs?.airlines ?? [];
  const airports = inputs?.airports ?? [];
  const loading = airlines.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppHeader
        title="Scenario Comparison"
        subtitle="Compare two flight scenarios side-by-side to find the lower-risk option"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Scenario forms */}
        <div className="flex gap-4 items-stretch">
          <ScenarioForm
            scenario={scenarioA}
            onChange={setScenarioA}
            airlines={airlines}
            airports={airports}
            badge="A"
            accentBorder="border-blue-500/40"
          />

          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground px-1 shrink-0">
            <ArrowLeftRight className="size-5" />
            <span className="text-xs font-bold">VS</span>
          </div>

          <ScenarioForm
            scenario={scenarioB}
            onChange={setScenarioB}
            airlines={airlines}
            airports={airports}
            badge="B"
            accentBorder="border-slate-500/40"
          />
        </div>

        {/* Compare button */}
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={mutation.isPending || loading}
            className="px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
              hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? "Comparing..." : "Compare Scenarios"}
          </button>
        </div>

        {/* Error state */}
        {mutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive text-center">
            Comparison failed — make sure both routes exist in the dataset and retry.
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Side-by-side result cards */}
            <div className="flex gap-4 items-stretch">
              <ResultCard
                result={result.scenarioA}
                isBetter={result.comparison.betterScenario === "A"}
              />
              <div className="flex items-center justify-center px-1 shrink-0">
                <span className="text-xs font-bold text-muted-foreground">VS</span>
              </div>
              <ResultCard
                result={result.scenarioB}
                isBetter={result.comparison.betterScenario === "B"}
              />
            </div>

            {/* Comparison summary */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Comparison Summary</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center rounded-lg bg-secondary/30 p-4">
                  <div className="text-[11px] text-muted-foreground mb-1">Better Choice</div>
                  <div className="text-lg font-bold text-primary">
                    {result.comparison.betterScenario === "A"
                      ? result.scenarioA.label
                      : result.scenarioB.label}
                  </div>
                </div>
                <div className="text-center rounded-lg bg-secondary/30 p-4">
                  <div className="text-[11px] text-muted-foreground mb-1">Risk Reduction</div>
                  <div className="text-lg font-bold text-green-500">
                    -{result.comparison.riskReduction}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">delay probability</div>
                </div>
                <div className="text-center rounded-lg bg-secondary/30 p-4">
                  <div className="text-[11px] text-muted-foreground mb-1">Time Saved</div>
                  <div className="text-lg font-bold text-green-500">
                    {result.comparison.delayReduction > 0
                      ? `-${result.comparison.delayReduction} min`
                      : "Same"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">expected delay</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                <Shield className="size-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">{result.comparison.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
