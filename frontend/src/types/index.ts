export type Page =
  | "overview"
  | "data"
  | "explore"
  | "visualize"
  | "analyst"
  | "statistics"
  | "predict"
  | "time-series"
  | "reports"
  | "alerts"
  | "lineage";

export type Dataset = {
  name: string;
  source: "CSV" | "Excel" | "JSON" | "Parquet" | "Database" | "API";
  rows: number;
  columns: number;
  measures: number;
  dimensions: number;
  timeGrain: string;
  updated: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export type Alert = {
  name: string;
  metric: string;
  condition: string;
  status: "Active" | "Paused";
  lastChecked: string;
};

export type LineageEvent = {
  time: string;
  type: string;
  description: string;
  detail: string;
};
