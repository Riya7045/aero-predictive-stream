const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface SummaryStats {
  totalFlights: number;
  delayRate: number;
  avgDelay: number;
  modelAccuracy: number;
}

export interface TrendPoint {
  label: string;
  delays: number;
  avgDelay: number;
}

export interface AirlineItem {
  code: string;
  name: string;
  flights: number;
  avgDelay: number;
  delayRate: number;
  onTime: number;
}

export interface AirportItem {
  code: string;
  name: string;
  flights: number;
  avgDelay: number;
  delayRate: number;
}

export interface RouteItem {
  origin: string;
  dest: string;
  flights: number;
  avgDelay: number;
  delayRate: number;
  risk: number;
}

export interface HeatmapRow {
  code: string;
  delays: number[];
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  modelVersion: string;
  trainedOn: number;
}

export interface ConfusionMatrixResponse {
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  truePositive: number;
  totalSamples: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface PerformanceHistoryItem {
  month: string;
  accuracy: number;
  precision: number;
  recall: number;
}

export interface ShapContribution {
  factor: string;
  strength: number;
  direction: string;
}

export interface PredictInput {
  airline: string;
  origin: string;
  destination: string;
  distance: number;
  month: number;
  dayOfWeek: number;
  scheduledDeparture: string;
}

export interface PredictOutput {
  delayProbability: number;
  expectedDelay: number;
  confidenceInterval: number;
  riskLevel: string;
  shapContributions: ShapContribution[];
}

export interface PredictInputsResponse {
  airlines: AirlineItem[];
  airports: AirportItem[];
}

// Generic fetch wrapper
async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Summary Stats
export const getSummaryStats = () => fetchAPI<SummaryStats>('/api/stats/summary');

// Delay Trends
export const getDelayTrends = (granularity: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'monthly') =>
  fetchAPI<TrendPoint[]>(`/api/delays/trends?granularity=${granularity}`);

// Airlines
export const getAirlines = () => fetchAPI<AirlineItem[]>('/api/airlines');

export const getAirlinesTop = (limit: number = 6, sort: string = 'avgDelay') =>
  fetchAPI<AirlineItem[]>(`/api/airlines/top?limit=${limit}&sort=${sort}`);

export const getAirlineTrends = () => fetchAPI<Record<string, any>[]>('/api/airlines/trends');

// Airports
export const getAirports = () => fetchAPI<AirportItem[]>('/api/airports');

export const getAirportsTop = (limit: number = 6, sort: string = 'avgDelay') =>
  fetchAPI<AirportItem[]>(`/api/airports/top?limit=${limit}&sort=${sort}`);

export const getAirportHeatmap = () => fetchAPI<HeatmapRow[]>('/api/airports/heatmap');

export const getAirportTrends = (code: string) =>
  fetchAPI<TrendPoint[]>(`/api/airports/${code}/trends`);

// Routes
export const getRoutes = (sort: string = 'risk', limit: number = 10) =>
  fetchAPI<RouteItem[]>(`/api/routes?sort=${sort}&limit=${limit}`);

export const getRouteTrends = (routes: string) =>
  fetchAPI<Record<string, any>[]>(`/api/routes/trends?routes=${encodeURIComponent(routes)}`);

// Predictions
export const getPredictInputs = () => fetchAPI<PredictInputsResponse>('/api/predict/inputs');

export const predict = (input: PredictInput) =>
  fetchAPI<PredictOutput>('/api/predict', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export interface BenchmarkModelResult {
  name: string;
  shortName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainTimeSeconds: number;
}

export interface BenchmarkResponse {
  models: BenchmarkModelResult[];
  winner: string;
  winnerReason: string;
  sampledFrom: number;
  sampleSize: number;
  trainSamples: number;
  testSamples: number;
  trainSplit: number;
  benchmarkedAt: string;
}

// Model Insights
export const getModelMetrics = () => fetchAPI<ModelMetrics>('/api/model/metrics');

export const getFeatureImportance = () =>
  fetchAPI<FeatureImportanceItem[]>('/api/model/feature-importance');

export const getConfusionMatrix = () =>
  fetchAPI<ConfusionMatrixResponse>('/api/model/confusion-matrix');

export const getRocCurve = () => fetchAPI<RocPoint[]>('/api/model/roc-curve');

export const getPerformanceHistory = () =>
  fetchAPI<PerformanceHistoryItem[]>('/api/model/performance-history');

export const getBenchmark = () =>
  fetchAPI<BenchmarkResponse>('/api/model/benchmark');

// ── Feature 2: Scenario Comparison ───────────────────────

export interface ScenarioInput {
  label: string;
  airline: string;
  origin: string;
  destination: string;
  distance: number;
  month: number;
  dayOfWeek: number;
  scheduledDeparture: string;
}

export interface ScenarioResult {
  label: string;
  airline: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  delayProbability: number;
  expectedDelay: number;
  riskLevel: string;
  confidenceInterval: number;
}

export interface ComparisonSummary {
  betterScenario: string;  // "A" | "B"
  riskReduction: number;   // percentage points
  delayReduction: number;  // minutes
  recommendation: string;
}

export interface CompareRequest {
  scenarioA: ScenarioInput;
  scenarioB: ScenarioInput;
}

export interface CompareResponse {
  scenarioA: ScenarioResult;
  scenarioB: ScenarioResult;
  comparison: ComparisonSummary;
}

export const getRouteDistances = () =>
  fetchAPI<Record<string, number>>('/api/routes/distances');

export const compareScenarios = (input: CompareRequest) =>
  fetchAPI<CompareResponse>('/api/compare', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// ── Feature 3: Flight Recommendation Engine ──────────────

export interface RecommendSlot {
  rank: number;
  dayOfWeek: number;
  dayName: string;
  hour: number;
  timeLabel: string;
  delayProbability: number;
  expectedDelay: number;
  riskLevel: string;
}

export interface RecommendResponse {
  origin: string;
  destination: string;
  airline: string;
  month: number;
  monthName: string;
  distance: number;
  totalSlotsAnalyzed: number;
  topSlots: RecommendSlot[];
}

export const getRecommendations = (
  origin: string,
  destination: string,
  airline: string,
  month: number,
) =>
  fetchAPI<RecommendResponse>(
    `/api/recommend?origin=${origin}&destination=${destination}&airline=${airline}&month=${month}`,
  );
