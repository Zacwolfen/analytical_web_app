import type { Alert, Dataset, LineageEvent } from "../types";

export const datasets: Dataset[] = [
  {
    name: "sample_data",
    source: "CSV",
    rows: 288,
    columns: 7,
    measures: 4,
    dimensions: 2,
    timeGrain: "month",
    updated: "Just now"
  },
  {
    name: "marketing_2026",
    source: "Excel",
    rows: 8420,
    columns: 13,
    measures: 7,
    dimensions: 6,
    timeGrain: "week",
    updated: "Yesterday"
  },
  {
    name: "warehouse_live",
    source: "Database",
    rows: 24502,
    columns: 9,
    measures: 5,
    dimensions: 4,
    timeGrain: "day",
    updated: "12 min ago"
  }
];

export const revenueTrend = [
  { month: "Jan", revenue: 520, profit: 142 },
  { month: "Feb", revenue: 565, profit: 158 },
  { month: "Mar", revenue: 548, profit: 151 },
  { month: "Apr", revenue: 632, profit: 181 },
  { month: "May", revenue: 674, profit: 196 },
  { month: "Jun", revenue: 710, profit: 213 },
  { month: "Jul", revenue: 688, profit: 205 },
  { month: "Aug", revenue: 764, profit: 231 },
  { month: "Sep", revenue: 798, profit: 247 },
  { month: "Oct", revenue: 832, profit: 262 },
  { month: "Nov", revenue: 879, profit: 281 },
  { month: "Dec", revenue: 921, profit: 298 }
];

export const regionData = [
  { region: "North", revenue: 312 },
  { region: "South", revenue: 426 },
  { region: "East", revenue: 278 },
  { region: "West", revenue: 361 }
];

export const channelData = [
  { channel: "Organic", revenue: 458 },
  { channel: "Paid", revenue: 531 },
  { channel: "Referral", revenue: 388 }
];

export const productData = [
  { name: "Enterprise", value: "₹2.84M", share: "28.6%", change: "+18.4%" },
  { name: "Growth", value: "₹2.31M", share: "23.2%", change: "+12.7%" },
  { name: "Starter", value: "₹1.76M", share: "17.7%", change: "+8.9%" },
  { name: "Professional", value: "₹1.52M", share: "15.3%", change: "+6.4%" },
  { name: "Other", value: "₹1.50M", share: "15.2%", change: "+3.1%" }
];

export const alerts: Alert[] = [
  {
    name: "Revenue threshold",
    metric: "Revenue",
    condition: "< ₹100,000",
    status: "Active",
    lastChecked: "4 min ago"
  },
  {
    name: "Conversion anomaly",
    metric: "Conversion rate",
    condition: "Latest period outside forecast interval",
    status: "Active",
    lastChecked: "4 min ago"
  },
  {
    name: "Profit decline",
    metric: "Profit",
    condition: "> 20% decrease",
    status: "Paused",
    lastChecked: "2 hr ago"
  }
];

export const lineage: LineageEvent[] = [
  {
    time: "10:21 PM",
    type: "LOAD",
    description: "Loaded sample_data.csv",
    detail: "288 rows · 7 columns"
  },
  {
    time: "10:22 PM",
    type: "PROFILE",
    description: "Semantic profile generated",
    detail: "4 measures · 2 dimensions · monthly grain"
  },
  {
    time: "10:24 PM",
    type: "FILTER",
    description: "Region = South",
    detail: "72 rows matched"
  },
  {
    time: "10:26 PM",
    type: "ANALYSIS",
    description: "Revenue trend computed",
    detail: "DuckDB aggregation"
  },
  {
    time: "10:27 PM",
    type: "MODEL",
    description: "Revenue forecast evaluated",
    detail: "Baseline comparison passed"
  }
];
