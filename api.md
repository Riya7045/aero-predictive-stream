# SkyIntel — API Reference

This document lists all data APIs in the project. The app is currently **mock-data driven** (no live backend). All response shapes below are taken directly from `src/lib/mock-data.ts` and match exactly what each page consumes. When a real ML backend is connected, these are the contracts each endpoint must satisfy.

---

## Data Models (Shared Types)

### Airline
```ts
{
  code: string        // IATA 2-letter carrier code  e.g. "DL"
  name: string        // Full airline name           e.g. "Delta Air Lines"
  flights: number     // Total flights in dataset
  avgDelay: number    // Average delay in minutes
  delayRate: number   // % of flights delayed (>15 min)
  onTime: number      // % of flights on time
}
```

### Airport
```ts
{
  code: string        // IATA 3-letter airport code  e.g. "ATL"
  name: string        // City/airport name           e.g. "Atlanta"
  flights: number     // Total flights through hub
  avgDelay: number    // Average delay in minutes
  delayRate: number   // % of flights delayed
}
```

### Route
```ts
{
  origin: string      // IATA origin code            e.g. "LAX"
  dest: string        // IATA destination code       e.g. "JFK"
  flights: number     // Total flights on this OD pair
  avgDelay: number    // Average delay in minutes
  delayRate: number   // % of flights delayed
  risk: number        // Composite risk score 0–100
}
```

---

## 1. Dashboard APIs

Used by: `src/routes/index.tsx`

---

### GET /api/stats/summary

Returns top-level KPI numbers shown on the dashboard header cards.

**Input:** none

**Output:**
```json
{
  "totalFlights": 5245123,
  "delayRate": 18.3,
  "avgDelay": 26,
  "modelAccuracy": 91.2
}
```

| Field | Type | Description |
|---|---|---|
| `totalFlights` | number | Total flights in the dataset |
| `delayRate` | number | Percentage of flights delayed (>15 min) |
| `avgDelay` | number | Average delay across all flights, in minutes |
| `modelAccuracy` | number | Current XGBoost classifier accuracy (%) |

---

### GET /api/delays/trends?granularity={hourly|daily|weekly|monthly}

Returns delay trend data for the interactive chart (Hourly / Daily / Weekly / Monthly toggle).

**Input (query param):**

| Param | Type | Required | Values |
|---|---|---|---|
| `granularity` | string | yes | `hourly`, `daily`, `weekly`, `monthly` |

**Output:**
```json
[
  { "label": "Jan",   "delays": 38420, "avgDelay": 24 },
  { "label": "Feb",   "delays": 31200, "avgDelay": 21 },
  ...
]
```

| Field | Type | Description |
|---|---|---|
| `label` | string | Time label — month name / week number / day number / `HH:00` |
| `delays` | number | Count of delayed flights in this period |
| `avgDelay` | number | Average delay in minutes for this period |

**Label format by granularity:**

| Granularity | Label format | Record count |
|---|---|---|
| `monthly` | `"Jan"` … `"Dec"` | 12 |
| `weekly` | `"W1"` … `"W12"` | 12 |
| `daily` | `"1"` … `"30"` | 30 |
| `hourly` | `"00:00"` … `"23:00"` | 24 |

---

### GET /api/airlines/top?limit=6&sort=avgDelay

Returns top delayed airlines for the dashboard bar chart.

**Input (query params):**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 6 | How many airlines to return |
| `sort` | string | `avgDelay` | Sort field: `avgDelay`, `delayRate`, `flights` |

**Output:**
```json
[
  { "code": "NK", "name": "Spirit Airlines", "flights": 312100, "avgDelay": 34, "delayRate": 28.1, "onTime": 71.9 },
  { "code": "F9", "name": "Frontier Airlines", "flights": 284600, "avgDelay": 31, "delayRate": 25.4, "onTime": 74.6 },
  ...
]
```

Each item is an **Airline** object (see Data Models).

---

### GET /api/airports/top?limit=6&sort=avgDelay

Returns top delayed airports for the dashboard bar chart.

**Input (query params):**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 6 | How many airports to return |
| `sort` | string | `avgDelay` | Sort field: `avgDelay`, `delayRate`, `flights` |

**Output:**
```json
[
  { "code": "LGA", "name": "LaGuardia", "flights": 312400, "avgDelay": 33, "delayRate": 26.8 },
  { "code": "ORD", "name": "Chicago O'Hare", "flights": 524100, "avgDelay": 29, "delayRate": 24.2 },
  ...
]
```

Each item is an **Airport** object (see Data Models).

---

## 2. Flight Predictor API

Used by: `src/routes/predictor.tsx`

---

### POST /api/predict

Runs the XGBoost classifier + regressor on user-supplied flight inputs. Returns delay probability, expected minutes, risk level, and SHAP feature contributions.

**Input (JSON body):**
```json
{
  "airline": "DL",
  "origin": "LAX",
  "destination": "JFK",
  "distance": 1840,
  "month": 7,
  "dayOfWeek": 5,
  "scheduledDeparture": "18:45"
}
```

| Field | Type | Description |
|---|---|---|
| `airline` | string | IATA carrier code (`DL`, `AA`, `UA`, `WN`, `B6`, `AS`, `F9`, `NK`) |
| `origin` | string | IATA origin airport code |
| `destination` | string | IATA destination airport code |
| `distance` | number | Flight distance in miles |
| `month` | number | Month 1–12 |
| `dayOfWeek` | number | Day 1 (Mon) – 7 (Sun) |
| `scheduledDeparture` | string | Scheduled departure time in `HH:MM` format |

**Output:**
```json
{
  "delayProbability": 74,
  "expectedDelay": 32,
  "confidenceInterval": 8,
  "riskLevel": "High",
  "shapContributions": [
    {
      "factor": "Peak departure window (18:00–21:00)",
      "strength": 0.34,
      "direction": "up",
      "note": "Friday evening congestion at JFK"
    },
    {
      "factor": "Route LAX → JFK historical delay",
      "strength": 0.28,
      "direction": "up",
      "note": "22.4% delay rate over 18,400 flights"
    },
    {
      "factor": "Airline carrier performance",
      "strength": 0.18,
      "direction": "up",
      "note": "Carrier avg delay 24 min over last period"
    },
    {
      "factor": "Day of week (Friday)",
      "strength": 0.14,
      "direction": "up",
      "note": "Friday departures average +6 min delay"
    },
    {
      "factor": "Origin airport LAX historical",
      "strength": 0.11,
      "direction": "up",
      "note": "18.7% delay rate at this hub"
    },
    {
      "factor": "Distance 1840 mi",
      "strength": 0.06,
      "direction": "down",
      "note": "Long-haul buffer reduces propagation"
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `delayProbability` | number | % chance of delay >15 min (0–100) |
| `expectedDelay` | number | Predicted delay in minutes |
| `confidenceInterval` | number | ± margin in minutes at 90% CI |
| `riskLevel` | string | `"Low"`, `"Medium"`, `"High"`, `"Critical"` |
| `shapContributions` | array | Top SHAP feature explanations |
| `shapContributions[].factor` | string | Human-readable feature description |
| `shapContributions[].strength` | number | Absolute SHAP value (0.0–1.0) |
| `shapContributions[].direction` | string | `"up"` = increases delay, `"down"` = reduces delay |
| `shapContributions[].note` | string | Contextual explanation sentence |

---

### GET /api/predict/inputs

Returns the valid dropdown options for the predictor form.

**Input:** none

**Output:**
```json
{
  "airlines": [
    { "code": "DL", "name": "Delta Air Lines" },
    { "code": "AA", "name": "American Airlines" },
    { "code": "UA", "name": "United Airlines" },
    { "code": "WN", "name": "Southwest Airlines" },
    { "code": "B6", "name": "JetBlue Airways" },
    { "code": "AS", "name": "Alaska Airlines" },
    { "code": "F9", "name": "Frontier Airlines" },
    { "code": "NK", "name": "Spirit Airlines" }
  ],
  "airports": [
    { "code": "ATL", "name": "Atlanta" },
    { "code": "ORD", "name": "Chicago O'Hare" },
    { "code": "DFW", "name": "Dallas/Fort Worth" },
    { "code": "DEN", "name": "Denver" },
    { "code": "LAX", "name": "Los Angeles" },
    { "code": "JFK", "name": "New York JFK" },
    { "code": "SFO", "name": "San Francisco" },
    { "code": "LGA", "name": "LaGuardia" },
    { "code": "SEA", "name": "Seattle" },
    { "code": "BOS", "name": "Boston" }
  ]
}
```

---

## 3. Airline Analytics APIs

Used by: `src/routes/airlines.tsx`

---

### GET /api/airlines

Returns all airlines with full performance metrics for the ranking table.

**Input:** none

**Output:**
```json
[
  { "code": "DL", "name": "Delta Air Lines",    "flights": 842310, "avgDelay": 18, "delayRate": 14.2, "onTime": 85.8 },
  { "code": "AS", "name": "Alaska Airlines",    "flights": 312840, "avgDelay": 19, "delayRate": 15.1, "onTime": 84.9 },
  { "code": "AA", "name": "American Airlines",  "flights": 756820, "avgDelay": 22, "delayRate": 18.6, "onTime": 81.4 },
  { "code": "UA", "name": "United Airlines",    "flights": 698140, "avgDelay": 24, "delayRate": 20.3, "onTime": 79.7 },
  { "code": "B6", "name": "JetBlue Airways",    "flights": 412680, "avgDelay": 26, "delayRate": 21.8, "onTime": 78.2 },
  { "code": "WN", "name": "Southwest Airlines", "flights": 924510, "avgDelay": 28, "delayRate": 23.4, "onTime": 76.6 },
  { "code": "F9", "name": "Frontier Airlines",  "flights": 284600, "avgDelay": 31, "delayRate": 25.4, "onTime": 74.6 },
  { "code": "NK", "name": "Spirit Airlines",    "flights": 312100, "avgDelay": 34, "delayRate": 28.1, "onTime": 71.9 }
]
```

Each item is an **Airline** object (see Data Models).

---

### GET /api/airlines/trends?months=12

Returns monthly average delay per carrier for the comparison line chart.

**Input (query params):**

| Param | Type | Default | Description |
|---|---|---|---|
| `months` | number | 12 | Number of past months to include |

**Output:**
```json
[
  { "month": "Jan", "Delta": 17.2, "American": 22.8, "United": 21.4, "Southwest": 26.1 },
  { "month": "Feb", "Delta": 16.8, "American": 23.5, "United": 20.9, "Southwest": 25.4 },
  ...
]
```

| Field | Type | Description |
|---|---|---|
| `month` | string | Month abbreviation (`"Jan"` … `"Dec"`) |
| `[carrierName]` | number | Average delay in minutes for that carrier |

---

## 4. Airport Analytics APIs

Used by: `src/routes/airports.tsx`

---

### GET /api/airports

Returns all airports with performance metrics for the ranking table.

**Input:** none

**Output:**
```json
[
  { "code": "ATL", "name": "Atlanta",          "flights": 614200, "avgDelay": 19, "delayRate": 15.4 },
  { "code": "ORD", "name": "Chicago O'Hare",   "flights": 524100, "avgDelay": 29, "delayRate": 24.2 },
  { "code": "DFW", "name": "Dallas/Fort Worth", "flights": 489600, "avgDelay": 23, "delayRate": 19.1 },
  { "code": "DEN", "name": "Denver",           "flights": 412300, "avgDelay": 21, "delayRate": 17.8 },
  { "code": "LAX", "name": "Los Angeles",      "flights": 498200, "avgDelay": 25, "delayRate": 20.6 },
  { "code": "JFK", "name": "New York JFK",     "flights": 387100, "avgDelay": 31, "delayRate": 26.4 },
  { "code": "SFO", "name": "San Francisco",    "flights": 352800, "avgDelay": 28, "delayRate": 23.7 },
  { "code": "LGA", "name": "LaGuardia",        "flights": 312400, "avgDelay": 33, "delayRate": 26.8 },
  { "code": "SEA", "name": "Seattle",          "flights": 298700, "avgDelay": 20, "delayRate": 16.2 },
  { "code": "BOS", "name": "Boston",           "flights": 287900, "avgDelay": 22, "delayRate": 18.9 }
]
```

Each item is an **Airport** object (see Data Models).

---

### GET /api/airports/{code}/trends?months=12

Returns monthly delay trend for a specific airport.

**Input:**

| Param | Where | Description |
|---|---|---|
| `code` | path | IATA airport code e.g. `JFK` |
| `months` | query | Number of past months (default 12) |

**Output:**
```json
[
  { "month": "Jan", "avgDelay": 28, "delays": 4820, "onTime": 162300 },
  { "month": "Feb", "avgDelay": 25, "delays": 3940, "onTime": 158200 },
  ...
]
```

| Field | Type | Description |
|---|---|---|
| `month` | string | Month abbreviation |
| `avgDelay` | number | Average delay in minutes |
| `delays` | number | Count of delayed flights |
| `onTime` | number | Count of on-time flights |

---

### GET /api/airports/heatmap

Returns delay data per airport per weekday for the heatmap grid.

**Input:** none

**Output:**
```json
[
  {
    "code": "ATL",
    "delays": [19, 22, 20, 21, 28, 17, 16]
  },
  {
    "code": "ORD",
    "delays": [28, 27, 29, 30, 35, 24, 22]
  },
  ...
]
```

| Field | Type | Description |
|---|---|---|
| `code` | string | IATA airport code |
| `delays` | number[7] | Average delay per weekday — index 0 = Monday, 6 = Sunday |

---

## 5. Route Analytics APIs

Used by: `src/routes/routes.tsx`

---

### GET /api/routes?sort=risk

Returns all origin–destination pairs ranked by risk score.

**Input (query params):**

| Param | Type | Default | Description |
|---|---|---|---|
| `sort` | string | `risk` | Sort field: `risk`, `avgDelay`, `delayRate`, `flights` |
| `limit` | number | 10 | Max records to return |

**Output:**
```json
[
  { "origin": "ORD", "dest": "LGA", "flights": 14200, "avgDelay": 36, "delayRate": 29.8, "risk": 88 },
  { "origin": "LAX", "dest": "JFK", "flights": 18400, "avgDelay": 28, "delayRate": 22.4, "risk": 78 },
  { "origin": "SFO", "dest": "JFK", "flights": 12800, "avgDelay": 31, "delayRate": 25.1, "risk": 74 },
  { "origin": "ATL", "dest": "ORD", "flights": 22100, "avgDelay": 24, "delayRate": 19.8, "risk": 68 },
  { "origin": "DFW", "dest": "LAX", "flights": 16300, "avgDelay": 22, "delayRate": 17.6, "risk": 62 },
  { "origin": "MIA", "dest": "JFK", "flights": 9800,  "avgDelay": 29, "delayRate": 23.2, "risk": 58 },
  { "origin": "BOS", "dest": "DCA", "flights": 8400,  "avgDelay": 18, "delayRate": 14.3, "risk": 44 },
  { "origin": "DEN", "dest": "SEA", "flights": 11200, "avgDelay": 16, "delayRate": 12.8, "risk": 38 },
  { "origin": "SEA", "dest": "SFO", "flights": 13600, "avgDelay": 14, "delayRate": 11.4, "risk": 32 },
  { "origin": "PHX", "dest": "LAX", "flights": 15800, "avgDelay": 12, "delayRate":  9.6, "risk": 24 }
]
```

Each item is a **Route** object (see Data Models). Risk score 0–100: ≥80 Critical, 65–79 High, 45–64 Medium, <45 Low.

---

### GET /api/routes/trends?routes=ORD-LGA,LAX-JFK,SFO-JFK&months=12

Returns monthly average delay trends for the specified routes.

**Input (query params):**

| Param | Type | Description |
|---|---|---|
| `routes` | string | Comma-separated `ORIGIN-DEST` pairs |
| `months` | number | Number of past months (default 12) |

**Output:**
```json
[
  { "month": "Jan", "ORD→LGA": 34.2, "LAX→JFK": 26.1, "SFO→JFK": 31.4 },
  { "month": "Feb", "ORD→LGA": 36.8, "LAX→JFK": 27.9, "SFO→JFK": 33.2 },
  ...
]
```

| Field | Type | Description |
|---|---|---|
| `month` | string | Month abbreviation |
| `[ORIG→DEST]` | number | Average delay in minutes for that route |

---

## 6. Model Insights APIs

Used by: `src/routes/model.tsx`

---

### GET /api/model/metrics

Returns the current classifier evaluation metrics.

**Input:** none

**Output:**
```json
{
  "accuracy":  91.2,
  "precision": 89.3,
  "recall":    87.8,
  "f1Score":   88.5,
  "rocAuc":    0.943,
  "modelVersion": "v2.4.1",
  "trainedOn":    5200000
}
```

| Field | Type | Description |
|---|---|---|
| `accuracy` | number | % correct classifications on validation set |
| `precision` | number | % of predicted delays that were actual delays |
| `recall` | number | % of actual delays the model caught |
| `f1Score` | number | Harmonic mean of precision and recall |
| `rocAuc` | number | Area under the ROC curve (0–1) |
| `modelVersion` | string | Model version identifier |
| `trainedOn` | number | Total flights used in training |

---

### GET /api/model/feature-importance

Returns the top feature importance scores (XGBoost gain).

**Input:** none

**Output:**
```json
[
  { "feature": "Scheduled Departure Time", "importance": 0.284 },
  { "feature": "Origin Airport",           "importance": 0.198 },
  { "feature": "Airline Carrier",          "importance": 0.156 },
  { "feature": "Day of Week",              "importance": 0.134 },
  { "feature": "Destination Airport",      "importance": 0.112 },
  { "feature": "Month",                    "importance": 0.087 },
  { "feature": "Distance (mi)",            "importance": 0.029 }
]
```

| Field | Type | Description |
|---|---|---|
| `feature` | string | Dataset feature name |
| `importance` | number | Normalized importance score (all values sum to 1.0) |

---

### GET /api/model/confusion-matrix

Returns the confusion matrix from the validation set (60,000 flights).

**Input:** none

**Output:**
```json
{
  "trueNegative":  42180,
  "falsePositive":  3120,
  "falseNegative":  2840,
  "truePositive":  11860,
  "totalSamples":  60000
}
```

| Field | Type | Description |
|---|---|---|
| `trueNegative` | number | Correctly predicted: no delay |
| `falsePositive` | number | Incorrectly predicted: delay (was on time) |
| `falseNegative` | number | Missed delays (predicted on time, was delayed) |
| `truePositive` | number | Correctly predicted: delay |
| `totalSamples` | number | Total validation set size |

---

### GET /api/model/roc-curve

Returns the ROC curve points for the AUC chart.

**Input:** none

**Output:**
```json
[
  { "fpr": 0.00, "tpr": 0.00 },
  { "fpr": 0.05, "tpr": 0.52 },
  { "fpr": 0.10, "tpr": 0.68 },
  { "fpr": 0.15, "tpr": 0.76 },
  ...
  { "fpr": 1.00, "tpr": 1.00 }
]
```

| Field | Type | Description |
|---|---|---|
| `fpr` | number | False positive rate (0.0–1.0) |
| `tpr` | number | True positive rate / recall (0.0–1.0) |

Returns 21 points from `fpr = 0.00` to `fpr = 1.00` in steps of 0.05.

---

### GET /api/model/performance-history?weeks=7

Returns model accuracy, precision and recall over time.

**Input (query params):**

| Param | Type | Default | Description |
|---|---|---|---|
| `weeks` | number | 7 | Number of past weeks/periods to return |

**Output:**
```json
[
  { "month": "Jan", "accuracy": 88.4, "precision": 86.1, "recall": 84.2 },
  { "month": "Feb", "accuracy": 88.9, "precision": 86.8, "recall": 85.1 },
  { "month": "Mar", "accuracy": 89.6, "precision": 87.4, "recall": 85.9 },
  { "month": "Apr", "accuracy": 90.1, "precision": 88.0, "recall": 86.4 },
  { "month": "May", "accuracy": 90.4, "precision": 88.5, "recall": 86.9 },
  { "month": "Jun", "accuracy": 90.8, "precision": 88.9, "recall": 87.3 },
  { "month": "Jul", "accuracy": 91.2, "precision": 89.3, "recall": 87.8 }
]
```

| Field | Type | Description |
|---|---|---|
| `month` | string | Period label |
| `accuracy` | number | Accuracy % for that period |
| `precision` | number | Precision % for that period |
| `recall` | number | Recall % for that period |

---

## 7. Server Function (TanStack Start)

Defined in: `src/lib/api/example.functions.ts`  
This is the only live server function currently implemented.

---

### getGreeting (POST — server function)

A demo TanStack Start server function. Not used in any page yet.

**Input:**
```json
{ "name": "Maya" }
```

| Field | Type | Validation | Description |
|---|---|---|---|
| `name` | string | min length 1 | Name to greet |

**Output:**
```json
{
  "greeting": "Hello, Maya!",
  "mode": "development"
}
```

| Field | Type | Description |
|---|---|---|
| `greeting` | string | Greeting message |
| `mode` | string | Current `NODE_ENV` value |

---

## Summary Table

| # | Endpoint | Method | Page | Status |
|---|---|---|---|---|
| 1 | `/api/stats/summary` | GET | Dashboard | Mock |
| 2 | `/api/delays/trends` | GET | Dashboard | Mock |
| 3 | `/api/airlines/top` | GET | Dashboard | Mock |
| 4 | `/api/airports/top` | GET | Dashboard | Mock |
| 5 | `/api/predict` | POST | Flight Predictor | Mock |
| 6 | `/api/predict/inputs` | GET | Flight Predictor | Mock |
| 7 | `/api/airlines` | GET | Airline Analytics | Mock |
| 8 | `/api/airlines/trends` | GET | Airline Analytics | Mock |
| 9 | `/api/airports` | GET | Airport Analytics | Mock |
| 10 | `/api/airports/{code}/trends` | GET | Airport Analytics | Mock |
| 11 | `/api/airports/heatmap` | GET | Airport Analytics | Mock |
| 12 | `/api/routes` | GET | Route Analytics | Mock |
| 13 | `/api/routes/trends` | GET | Route Analytics | Mock |
| 14 | `/api/model/metrics` | GET | Model Insights | Mock |
| 15 | `/api/model/feature-importance` | GET | Model Insights | Mock |
| 16 | `/api/model/confusion-matrix` | GET | Model Insights | Mock |
| 17 | `/api/model/roc-curve` | GET | Model Insights | Mock |
| 18 | `/api/model/performance-history` | GET | Model Insights | Mock |
| 19 | `getGreeting` (server fn) | POST | — | Live (demo) |

**Mock** = shape defined, data served from `src/lib/mock-data.ts`.  
When connecting a real Python/ML backend, replace each mock with a real endpoint that returns the same JSON shape.
