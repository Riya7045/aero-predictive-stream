import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Trophy, Clock, Calendar } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import {
  getPredictInputs,
  getRecommendations,
  type RecommendSlot,
  type RecommendResponse,
} from "@/lib/api-client";

export const Route = createFileRoute("/recommend")({
  head: () => ({ meta: [{ title: "Recommendations — SkyIntel" }] }),
  component: RecommendPage,
});

// ── Constants ─────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const selectCls =
  "w-full h-9 px-3 rounded-md border border-border bg-card text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

// ── Helpers ───────────────────────────────────────────────

function probColor(prob: number) {
  if (prob >= 80) return "text-red-500";
  if (prob >= 65) return "text-orange-500";
  if (prob >= 45) return "text-yellow-500";
  return "text-green-500";
}

function riskBadgeCls(risk: string) {
  if (risk === "Critical") return "bg-red-500/15 text-red-500";
  if (risk === "High") return "bg-orange-500/15 text-orange-500";
  if (risk === "Medium") return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400";
  return "bg-green-500/15 text-green-600 dark:text-green-400";
}

function rankBadgeCls(rank: number) {
  if (rank === 1) return "bg-amber-400 text-amber-900";
  if (rank === 2) return "bg-slate-300 text-slate-800";
  if (rank === 3) return "bg-amber-600/80 text-amber-50";
  return "bg-secondary text-muted-foreground";
}

// ── Slot Card ─────────────────────────────────────────────

function SlotCard({ slot }: { slot: RecommendSlot }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/30 transition-colors">
      {/* Rank badge */}
      <div
        className={`size-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rankBadgeCls(slot.rank)}`}
      >
        {slot.rank}
      </div>

      {/* Day + Time */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">
          {slot.dayName}
          <span className="ml-2 text-muted-foreground font-normal">{slot.timeLabel}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {slot.expectedDelay > 0 ? `Expected delay: ${slot.expectedDelay} min` : "Expected on time"}
        </div>
      </div>

      {/* Probability */}
      <div className={`text-lg font-bold tabular-nums ${probColor(slot.delayProbability)}`}>
        {slot.delayProbability}%
      </div>

      {/* Risk badge */}
      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${riskBadgeCls(slot.riskLevel)}`}>
        {slot.riskLevel}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

interface FormState {
  airline: string;
  origin: string;
  destination: string;
  month: number;
}

function RecommendPage() {
  const [form, setForm] = useState<FormState>({
    airline: "DL",
    origin: "JFK",
    destination: "LAX",
    month: 7,
  });
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const { data: inputs } = useQuery({
    queryKey: ["predictInputs"],
    queryFn: getPredictInputs,
  });

  const { data: result, isFetching, isError } = useQuery<RecommendResponse>({
    queryKey: ["recommend", submitted],
    queryFn: () =>
      getRecommendations(
        submitted!.origin,
        submitted!.destination,
        submitted!.airline,
        submitted!.month,
      ),
    enabled: !!submitted,
  });

  const airlines = inputs?.airlines ?? [];
  const airports = inputs?.airports ?? [];

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitted({ ...form });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppHeader
        title="Flight Recommendation Engine"
        subtitle="Find the lowest-risk departure windows from 168 real model predictions (24 hours × 7 days)"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {/* Airline */}
            <label className="block space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Airline
              </span>
              <select
                className={selectCls}
                value={form.airline}
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
                value={form.origin}
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
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
              >
                {airports
                  .filter((a) => a.code !== form.origin)
                  .map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} – {a.name}
                    </option>
                  ))}
              </select>
            </label>

            {/* Month */}
            <label className="block space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Month
              </span>
              <select
                className={selectCls}
                value={form.month}
                onChange={(e) => set("month", Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isFetching || airlines.length === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground
                text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lightbulb className="size-4" />
              {isFetching ? "Analyzing 168 slots..." : "Find Best Times"}
            </button>
          </div>
        </form>

        {/* Error state */}
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive text-center">
            Recommendation failed — ensure the route exists in the dataset and retry.
          </div>
        )}

        {/* Results */}
        {result && !isFetching && (
          <div className="space-y-4">
            {/* Summary header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Top 5 Departure Windows
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {result.airline} · {result.origin} → {result.destination} ·{" "}
                  {result.monthName} · {result.distance} mi ·{" "}
                  {result.totalSlotsAnalyzed} slots analyzed
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> 24 departure hours
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> 7 days of week
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="size-3.5 text-amber-500" /> ranked by delay probability
                </span>
              </div>
            </div>

            {/* Slot cards */}
            <div className="space-y-2">
              {result.topSlots.map((slot) => (
                <SlotCard key={slot.rank} slot={slot} />
              ))}
            </div>

          </div>
        )}

        {/* Empty state */}
        {!result && !isFetching && !isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Lightbulb className="size-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Select your route and month, then click Find Best Times</p>
            <p className="text-xs mt-1 opacity-70">We'll run 168 real predictions and rank the safest departure windows</p>
          </div>
        )}
      </div>
    </div>
  );
}
