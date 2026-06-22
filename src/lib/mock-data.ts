// Mock data generators for the Flight Delay Intelligence Platform

export const monthlyDelays = [
  { month: "Jan", delays: 38420, avgDelay: 24, onTime: 162300 },
  { month: "Feb", delays: 41200, avgDelay: 26, onTime: 158900 },
  { month: "Mar", delays: 45800, avgDelay: 28, onTime: 171200 },
  { month: "Apr", delays: 39100, avgDelay: 22, onTime: 175600 },
  { month: "May", delays: 42700, avgDelay: 25, onTime: 178200 },
  { month: "Jun", delays: 58400, avgDelay: 34, onTime: 172000 },
  { month: "Jul", delays: 64200, avgDelay: 38, onTime: 169800 },
  { month: "Aug", delays: 61800, avgDelay: 36, onTime: 171400 },
  { month: "Sep", delays: 44300, avgDelay: 27, onTime: 174900 },
  { month: "Oct", delays: 40900, avgDelay: 24, onTime: 179100 },
  { month: "Nov", delays: 46500, avgDelay: 29, onTime: 173800 },
  { month: "Dec", delays: 55200, avgDelay: 32, onTime: 168400 },
];

export const weeklyDelays = Array.from({ length: 12 }, (_, i) => ({
  label: `W${i + 1}`,
  delays: 9200 + Math.round(Math.sin(i / 1.6) * 2400 + i * 180),
  avgDelay: 22 + Math.round(Math.sin(i / 2) * 6 + (i % 3)),
}));

export const dailyDelays = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  delays: 1300 + Math.round(Math.sin(i / 2.2) * 380 + (i % 7) * 60),
  avgDelay: 20 + Math.round(Math.sin(i / 3) * 7 + (i % 5)),
}));

export const hourlyDelays = Array.from({ length: 24 }, (_, h) => {
  const peak = Math.exp(-Math.pow((h - 18) / 4.2, 2)) * 820;
  const morning = Math.exp(-Math.pow((h - 8) / 3.4, 2)) * 420;
  return {
    label: `${String(h).padStart(2, "0")}:00`,
    delays: Math.round(120 + peak + morning),
    avgDelay: Math.round(12 + peak / 38 + morning / 80),
  };
});

export const delayDistribution = [
  { bucket: "0–15 min", count: 284100, pct: 54.2 },
  { bucket: "15–30 min", count: 132400, pct: 25.3 },
  { bucket: "30–60 min", count: 71800, pct: 13.7 },
  { bucket: "60+ min", count: 35900, pct: 6.8 },
];

export const airlines = [
  { code: "DL", name: "Delta Air Lines", flights: 842310, avgDelay: 18, delayRate: 14.2, onTime: 85.8 },
  { code: "AA", name: "American Airlines", flights: 921400, avgDelay: 24, delayRate: 19.6, onTime: 80.4 },
  { code: "UA", name: "United Airlines", flights: 712800, avgDelay: 22, delayRate: 17.8, onTime: 82.2 },
  { code: "WN", name: "Southwest Airlines", flights: 1240900, avgDelay: 27, delayRate: 21.4, onTime: 78.6 },
  { code: "B6", name: "JetBlue Airways", flights: 312600, avgDelay: 32, delayRate: 24.8, onTime: 75.2 },
  { code: "AS", name: "Alaska Airlines", flights: 248300, avgDelay: 16, delayRate: 12.9, onTime: 87.1 },
  { code: "F9", name: "Frontier Airlines", flights: 198400, avgDelay: 35, delayRate: 27.3, onTime: 72.7 },
  { code: "NK", name: "Spirit Airlines", flights: 221700, avgDelay: 38, delayRate: 29.1, onTime: 70.9 },
];

export const airports = [
  { code: "ATL", name: "Atlanta", flights: 614200, avgDelay: 19, delayRate: 15.4 },
  { code: "ORD", name: "Chicago O'Hare", flights: 524800, avgDelay: 31, delayRate: 24.2 },
  { code: "DFW", name: "Dallas/Fort Worth", flights: 498600, avgDelay: 22, delayRate: 17.9 },
  { code: "DEN", name: "Denver", flights: 421300, avgDelay: 25, delayRate: 19.8 },
  { code: "LAX", name: "Los Angeles", flights: 408700, avgDelay: 26, delayRate: 20.6 },
  { code: "JFK", name: "New York JFK", flights: 312400, avgDelay: 34, delayRate: 26.7 },
  { code: "SFO", name: "San Francisco", flights: 286900, avgDelay: 33, delayRate: 25.9 },
  { code: "LGA", name: "New York LaGuardia", flights: 198400, avgDelay: 37, delayRate: 28.4 },
  { code: "SEA", name: "Seattle", flights: 264300, avgDelay: 21, delayRate: 16.8 },
  { code: "BOS", name: "Boston Logan", flights: 218900, avgDelay: 28, delayRate: 22.1 },
];

export const routes = [
  { origin: "LAX", dest: "JFK", flights: 18400, avgDelay: 28, delayRate: 22.4, risk: 78 },
  { origin: "ATL", dest: "ORD", flights: 16200, avgDelay: 24, delayRate: 19.8, risk: 64 },
  { origin: "DFW", dest: "LAX", flights: 21800, avgDelay: 21, delayRate: 17.2, risk: 52 },
  { origin: "ORD", dest: "LGA", flights: 14300, avgDelay: 38, delayRate: 30.1, risk: 88 },
  { origin: "SFO", dest: "JFK", flights: 9800, avgDelay: 34, delayRate: 26.4, risk: 81 },
  { origin: "DEN", dest: "SEA", flights: 12600, avgDelay: 18, delayRate: 14.2, risk: 38 },
  { origin: "BOS", dest: "JFK", flights: 11200, avgDelay: 29, delayRate: 23.4, risk: 67 },
  { origin: "ATL", dest: "BOS", flights: 13900, avgDelay: 32, delayRate: 25.8, risk: 74 },
  { origin: "SEA", dest: "SFO", flights: 14800, avgDelay: 22, delayRate: 18.2, risk: 49 },
  { origin: "DEN", dest: "ORD", flights: 17400, avgDelay: 14, delayRate: 11.6, risk: 28 },
];

export const featureImportance = [
  { feature: "Scheduled Departure Time", importance: 0.284 },
  { feature: "Origin Airport", importance: 0.198 },
  { feature: "Airline Carrier", importance: 0.172 },
  { feature: "Day of Week", importance: 0.128 },
  { feature: "Destination Airport", importance: 0.094 },
  { feature: "Month", importance: 0.067 },
  { feature: "Distance (mi)", importance: 0.057 },
];

export const modelPerformance = [
  { month: "Jan", accuracy: 88.4, precision: 86.1, recall: 84.2 },
  { month: "Feb", accuracy: 89.1, precision: 87.0, recall: 85.0 },
  { month: "Mar", accuracy: 89.8, precision: 87.6, recall: 85.8 },
  { month: "Apr", accuracy: 90.2, precision: 88.1, recall: 86.4 },
  { month: "May", accuracy: 90.6, precision: 88.5, recall: 86.9 },
  { month: "Jun", accuracy: 91.0, precision: 89.0, recall: 87.4 },
  { month: "Jul", accuracy: 91.2, precision: 89.3, recall: 87.8 },
];

export const confusionMatrix = [
  { label: "True Neg", value: 42180 },
  { label: "False Pos", value: 3120 },
  { label: "False Neg", value: 2840 },
  { label: "True Pos", value: 11860 },
];

export const rocCurve = Array.from({ length: 21 }, (_, i) => {
  const fpr = i / 20;
  const tpr = Math.min(1, Math.pow(fpr, 0.35));
  return { fpr: +fpr.toFixed(2), tpr: +tpr.toFixed(3) };
});
