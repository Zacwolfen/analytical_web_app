import { useEffect, useMemo, useState } from "react";
import type { Page } from "../types";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  FileBarChart,
  GitBranch,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sigma,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const DATASET = "sample_data";



/* =========================================================
   TYPES
========================================================= */

type OverviewData = {
  metrics: {
    revenue: number;
    profit: number;
    orders: number;
    conversion_rate: number;
  };

  trend: {
    month: string;
    revenue: number;
    profit: number;
  }[];

  regions: {
    region: string;
    revenue: number;
  }[];

  filtered_rows: number;
};

type ProfileColumn = {
  name: string;
  sql_type: string;
  role: string;
  distinct: number;
  missing: number;
  missing_pct: number;
  min: number | string | null;
  max: number | string | null;
  mean: number | null;
  top_values: [string, number][];
};

type ProfileData = {
  name: string;
  rows: number;
  columns: ProfileColumn[];
  measures: string[];
  dimensions: string[];
  time_column: string;
  time_grain: string;
};

type CorrelationData = {
  test: string;
  statistic: number;
  p_value: number;
  n: number;
  r: number;
  ci_low: number;
  ci_high: number;
  reading: string;
};

type PredictionData = {
  problem_type: string;
  best_model: string;
  metrics: {
    r2: number;
    mae: number;
    rmse: number;
  };
  baseline_metrics: {
    r2: number;
    mae: number;
    rmse: number;
  };
  leaderboard: {
    model: string;
    cv_r2: number;
    std: number;
    beats_baseline: boolean;
  }[];
  leakage_warnings: string[];
};

type ForecastData = {
  model: string;
  in_sample_mae: number;
  history: {
    date: string;
    value: number;
  }[];
  forecast: {
    date: string;
    mean: number;
    lower: number;
    upper: number;
  }[];
};

type AIResponse = {
  text: string;
  queries?: string[];
  rounds?: number;
};

type AlertItem = {
  id: number;
  name: string;
  metric: "Revenue" | "Profit" | "Orders" | "Conversion rate";
  condition: "Above" | "Below";
  threshold: number;
  status: "Active" | "Paused";
  lastChecked: string;
};

type LineageEvent = {
  id: number;
  type: string;
  time: string;
  description: string;
  detail: string;
};

/* =========================================================
   API HELPERS
========================================================= */

async function getJSON<T>(
  path: string
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${path}`
  );

  if (!response.ok) {
    throw new Error(
      `API error ${response.status}`
    );
  }

  return response.json();
}

async function postJSON<T>(
  path: string,
  body: unknown
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      text ||
        `API error ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   FORMATTERS
========================================================= */

function money(value: number) {
  return `₹${value.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0
    }
  )}`;
}

function moneyShort(value: number) {
  if (value >= 1_000_000) {
    return `₹${(
      value / 1_000_000
    ).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `₹${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  return money(value);
}

function percent(value: number) {
  return `${(
    value * 100
  ).toFixed(2)}%`;
}

function dateLabel(value: string) {
  return new Date(
    value
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric"
    }
  );
}

/* =========================================================
   MAIN ROUTER
========================================================= */

export default function GenericPage({
  page
}: {
  page: Page;
}) {
  if (page === "explore")
    return <Explore />;

  if (page === "visualize")
    return <Visualize />;

  if (page === "statistics")
    return <Statistics />;

  if (page === "predict")
    return <Predict />;

  if (page === "time-series")
    return <TimeSeries />;

  if (page === "reports")
    return <Reports />;

  if (page === "alerts")
    return <Alerts />;

  if (page === "lineage")
    return <Lineage />;

  /*
    If your Page type contains an AI/analyst page,
    this can be enabled without changing the architecture.
  */

  if (
    page === ("ai" as Page) ||
    page === ("analyst" as Page)
  ) {
    return <AIAnalyst />;
  }

  return null;
}

/* =========================================================
   EXPLORE
========================================================= */

function Explore() {
  const [profile, setProfile] =
    useState<ProfileData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data =
          await getJSON<ProfileData>(
            `/datasets/${DATASET}/profile`
          );

        setProfile(data);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load dataset profile."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <LoadingPage
        title="Explore"
        text="Profiling the active dataset..."
      />
    );

  if (error)
    return (
      <ErrorPage
        title="Explore"
        error={error}
      />
    );

  if (!profile)
    return null;

  const numericColumns =
    profile.columns.filter(
      (c) =>
        c.role === "measure"
    );

  return (
    <>
      <Header
        title="Explore"
        subtitle="Understand the shape, completeness and distribution of every field."
      />

      <div className="metrics-grid">
        <Info
          title="Rows"
          value={profile.rows.toLocaleString(
            "en-IN"
          )}
          detail="Active dataset"
        />

        <Info
          title="Columns"
          value={profile.columns.length.toString()}
          detail="Detected fields"
        />

        <Info
          title="Measures"
          value={profile.measures.length.toString()}
          detail="Numeric measures"
        />

        <Info
          title="Dimensions"
          value={profile.dimensions.length.toString()}
          detail="Categorical fields"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Column profile
            </h3>

            <p>
              Semantic types and
              completeness detected by
              the backend.
            </p>
          </div>

          <Sigma
            size={17}
            className="muted-icon"
          />
        </div>

        <div className="table-head-row">
          <span>Column</span>
          <span>Type</span>
          <span>Role</span>
          <span>Missing</span>
        </div>

        {profile.columns.map(
          (column) => (
            <div
              className="table-row"
              key={column.name}
            >
              <strong>
                {column.name}
              </strong>

              <span className="muted">
                {column.sql_type}
              </span>

              <span>
                {column.role}
              </span>

              <span
                className={
                  column.missing_pct >
                  0
                    ? "warning-text"
                    : "growth"
                }
              >
                {column.missing_pct.toFixed(
                  2
                )}
                %
              </span>
            </div>
          )
        )}
      </div>

      <div className="two-grid">
        {numericColumns.map(
          (column) => (
            <div
              className="panel"
              key={column.name}
            >
              <div className="panel-head">
                <div>
                  <h3>
                    {column.name}
                  </h3>

                  <p>
                    Numeric field
                    statistics.
                  </p>
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <span>
                    Distinct
                  </span>
                  <strong>
                    {column.distinct}
                  </strong>
                </div>

                <div>
                  <span>
                    Missing
                  </span>
                  <strong>
                    {column.missing}
                  </strong>
                </div>

                <div>
                  <span>
                    Minimum
                  </span>
                  <strong>
                    {typeof column.min ===
                    "number"
                      ? column.min.toLocaleString(
                          "en-IN"
                        )
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Maximum
                  </span>
                  <strong>
                    {typeof column.max ===
                    "number"
                      ? column.max.toLocaleString(
                          "en-IN"
                        )
                      : "—"}
                  </strong>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

type TrendItem = {
  month: string;
  revenue: number;
  profit: number;
};

type RegionItem = {
  region: string;
  revenue: number;
};

function formatMoney(value: number) {
  return `₹${(value / 1_000_000).toFixed(2)}M`;
}

function formatMonth(value: string) {
  const date = new Date(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit"
  });
}

function RevenueChart({
  data
}: {
  data: TrendItem[];
}) {
  const totalRevenue = data.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const chartData = data.map((item) => ({
    ...item,
    month: formatMonth(item.month)
  }));

  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h3>Revenue trend</h3>
          <p>
            Monthly revenue and profit across the active view.
          </p>
        </div>

        <button className="icon-btn">
          <MoreHorizontal size={17} />
        </button>
      </div>

      <div className="chart-kpis">
        <strong>{formatMoney(totalRevenue)}</strong>
        <span>
          Live
          <small> Groundtruth / DuckDB</small>
        </span>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="gtRevenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#45c7d3"
                  stopOpacity={0.32}
                />
                <stop
                  offset="100%"
                  stopColor="#45c7d3"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#202734"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#748093",
                fontSize: 11
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#748093",
                fontSize: 11
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#111720",
                border: "1px solid #293240",
                borderRadius: 10
              }}
              formatter={(value: number) =>
                `₹${value.toLocaleString("en-IN")}`
              }
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#45c7d3"
              strokeWidth={2.5}
              fill="url(#gtRevenue)"
            />

            <Area
              type="monotone"
              dataKey="profit"
              stroke="#8f7cff"
              strokeWidth={1.5}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend-cyan" />
          Revenue
        </span>

        <span>
          <i className="legend-purple" />
          Profit
        </span>

        <span className="trace-note">
          SQL-backed · Live
        </span>
      </div>
    </div>
  );
}

function RegionChart({
  data
}: {
  data: RegionItem[];
}) {
  const totalRevenue = data.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const chartData = [...data].sort(
    (a, b) => b.revenue - a.revenue
  );

  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h3>Revenue by region</h3>
          <p>
            Revenue distribution across regions.
          </p>
        </div>

        <button className="icon-btn">
          <MoreHorizontal size={17} />
        </button>
      </div>

      <div className="chart-wrap region">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
          >
            <XAxis
              type="number"
              hide
            />

            <YAxis
              type="category"
              dataKey="region"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#a0a8b7",
                fontSize: 11
              }}
              width={55}
            />

            <Tooltip
              contentStyle={{
                background: "#111720",
                border: "1px solid #293240",
                borderRadius: 10
              }}
              formatter={(value: number) =>
                `₹${value.toLocaleString("en-IN")}`
              }
            />

            <Bar
              dataKey="revenue"
              fill="#45c7d3"
              radius={[0, 5, 5, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mini-summary">
        <span>
          <i className="legend-cyan" />
          Revenue
        </span>

        <strong>{formatMoney(totalRevenue)}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   VISUALIZE
========================================================= */

function Visualize() {
  const [overview, setOverview] =
    useState<OverviewData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data =
          await postJSON<OverviewData>(
            "/overview",
            {
              dataset: DATASET
            }
          );

        setOverview(data);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load visualization data."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <LoadingPage
        title="Visualize"
        text="Building analytical visualizations..."
      />
    );

  if (error)
    return (
      <ErrorPage
        title="Visualize"
        error={error}
      />
    );

  return (
    <>
      <Header
        title="Visualize"
        subtitle="Build visualizations directly from the active analytical dataset."
      />

      <div className="visual-toolbar">
        <span>
          Dataset
        </span>

        <button>
          {DATASET}
        </button>

        <span>
          Measure
        </span>

        <button>
          Revenue
        </button>

        <span>
          Dimension
        </span>

        <button>
          Month
        </button>

        <button
          className="primary-small"
          onClick={() =>
            window.location.reload()
          }
        >
          <RefreshCw
            size={14}
          />
          Refresh
        </button>
      </div>

      <div className="charts-grid">
        <RevenueChart
          data={
            overview?.trend || []
          }
        />

        <RegionChart
          data={
            overview?.regions || []
          }
        />
      </div>
    </>
  );
}

/* =========================================================
   STATISTICS
========================================================= */

function Statistics() {
  const [profile, setProfile] =
    useState<ProfileData | null>(
      null
    );

  const [correlation, setCorrelation] =
    useState<CorrelationData | null>(
      null
    );

  const [x, setX] =
    useState("revenue");

  const [y, setY] =
    useState("cost");

  const [loading, setLoading] =
    useState(true);

  const [running, setRunning] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getJSON<ProfileData>(
            `/datasets/${DATASET}/profile`
          );

        setProfile(data);

        const result =
          await postJSON<CorrelationData>(
            "/statistics/correlation",
            {
              dataset: DATASET,
              x: "revenue",
              y: "cost"
            }
          );

        setCorrelation(result);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load statistical analysis."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function runCorrelation() {
    try {
      setRunning(true);
      setError("");

      const result =
        await postJSON<CorrelationData>(
          "/statistics/correlation",
          {
            dataset: DATASET,
            x,
            y
          }
        );

      setCorrelation(result);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to calculate correlation."
      );
    } finally {
      setRunning(false);
    }
  }

  if (loading)
    return (
      <LoadingPage
        title="Statistics"
        text="Running statistical analysis..."
      />
    );

  if (error && !correlation)
    return (
      <ErrorPage
        title="Statistics"
        error={error}
      />
    );

  const measures =
    profile?.measures || [];

  return (
    <>
      <Header
        title="Statistics"
        subtitle="Run statistical tests against the live analytical dataset."
      />

      <div className="visual-toolbar">
        <span>
          Variable X
        </span>

        <select
          value={x}
          onChange={(e) =>
            setX(e.target.value)
          }
        >
          {measures.map(
            (measure) => (
              <option
                value={measure}
                key={measure}
              >
                {measure}
              </option>
            )
          )}
        </select>

        <span>
          Variable Y
        </span>

        <select
          value={y}
          onChange={(e) =>
            setY(e.target.value)
          }
        >
          {measures.map(
            (measure) => (
              <option
                value={measure}
                key={measure}
              >
                {measure}
              </option>
            )
          )}
        </select>

        <button
          className="primary-small"
          onClick={runCorrelation}
          disabled={
            running || x === y
          }
        >
          <Sigma size={14} />
          {running
            ? "Calculating..."
            : "Calculate"}
        </button>
      </div>

      {error && (
        <div className="panel">
          <p className="warning-text">
            {error}
          </p>
        </div>
      )}

      {correlation && (
        <>
          <div className="metrics-grid">
            <Info
              title="Correlation"
              value={correlation.r.toFixed(
                4
              )}
              detail="Pearson r"
            />

            <Info
              title="P-value"
              value={
                correlation.p_value.toExponential(
                  2
                )
              }
              detail="Statistical significance"
            />

            <Info
              title="Sample size"
              value={correlation.n.toString()}
              detail="Observations"
            />

            <Info
              title="Reading"
              value={
                correlation.reading
              }
              detail="Effect interpretation"
            />
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>
                  Pearson correlation
                </h3>

                <p>
                  {x} vs {y}
                </p>
              </div>

              <TrendingUp
                size={17}
                className="muted-icon"
              />
            </div>

            <div className="profile-grid">
              <div>
                <span>
                  Statistic
                </span>
                <strong>
                  {correlation.statistic.toFixed(
                    4
                  )}
                </strong>
              </div>

              <div>
                <span>
                  95% CI low
                </span>
                <strong>
                  {correlation.ci_low.toFixed(
                    4
                  )}
                </strong>
              </div>

              <div>
                <span>
                  95% CI high
                </span>
                <strong>
                  {correlation.ci_high.toFixed(
                    4
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Interpretation
                </span>
                <strong>
                  {correlation.reading}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* =========================================================
   PREDICT
========================================================= */

function Predict() {
  const [data, setData] =
    useState<PredictionData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const result =
          await postJSON<PredictionData>(
            "/predict",
            {
              dataset: DATASET
            }
          );

        setData(result);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to run prediction models."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <LoadingPage
        title="Predict"
        text="Training and comparing models..."
      />
    );

  if (error || !data)
    return (
      <ErrorPage
        title="Predict"
        error={
          error ||
          "Prediction unavailable."
        }
      />
    );

  return (
    <>
      <Header
        title="Predict"
        subtitle="Compare predictive models against a baseline before trusting a forecast."
      />

      <div className="prediction-hero">
        <div>
          <div className="section-kicker">
            BEST MODEL
          </div>

          <strong>
            {data.best_model}
          </strong>

          <p>
            R² ={" "}
            {data.metrics.r2.toFixed(
              3
            )}
          </p>
        </div>

        <div className="confidence">
          <span>
            RMSE
          </span>

          <strong>
            {money(
              data.metrics.rmse
            )}
          </strong>
        </div>
      </div>

      <div className="metrics-grid">
        <Info
          title="R²"
          value={data.metrics.r2.toFixed(
            3
          )}
          detail="Model fit"
        />

        <Info
          title="MAE"
          value={money(
            data.metrics.mae
          )}
          detail="Mean absolute error"
        />

        <Info
          title="RMSE"
          value={money(
            data.metrics.rmse
          )}
          detail="Root mean squared error"
        />

        <Info
          title="Baseline R²"
          value={data.baseline_metrics.r2.toFixed(
            3
          )}
          detail="Baseline comparison"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Model leaderboard
            </h3>

            <p>
              Cross-validation performance
              against the baseline.
            </p>
          </div>

          <ShieldCheck
            size={17}
            className="muted-icon"
          />
        </div>

        {data.leaderboard.map(
          (model) => (
            <div
              className="model-row"
              key={model.model}
            >
              <div>
                <strong>
                  {model.model}
                </strong>

                <span>
                  CV score ±{" "}
                  {model.std.toFixed(
                    3
                  )}
                </span>
              </div>

              <b>
                {model.cv_r2.toFixed(
                  3
                )}
              </b>

              <em>
                {model.beats_baseline
                  ? "Beats baseline"
                  : "Baseline"}
              </em>
            </div>
          )
        )}
      </div>

      {data.leakage_warnings.length >
        0 && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Leakage warnings
              </h3>
            </div>

            <AlertTriangle
              size={17}
              className="muted-icon"
            />
          </div>

          {data.leakage_warnings.map(
            (warning) => (
              <p
                key={warning}
                className="warning-text"
              >
                {warning}
              </p>
            )
          )}
        </div>
      )}
    </>
  );
}

/* =========================================================
   TIME SERIES
========================================================= */

function TimeSeries() {
  const [data, setData] =
    useState<ForecastData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const result =
          await postJSON<ForecastData>(
            "/time-series/forecast",
            {
              dataset: DATASET
            }
          );

        setData(result);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to generate time-series forecast."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <LoadingPage
        title="Time series"
        text="Generating forecast..."
      />
    );

  if (error || !data)
    return (
      <ErrorPage
        title="Time series"
        error={
          error ||
          "Forecast unavailable."
        }
      />
    );

  const chartData = [
    ...data.history.map(
      (item) => ({
        date: item.date,
        actual: item.value,
        forecast: null,
        lower: null,
        upper: null
      })
    ),

    ...data.forecast.map(
      (item) => ({
        date: item.date,
        actual: null,
        forecast: item.mean,
        lower: item.lower,
        upper: item.upper
      })
    )
  ];

  return (
    <>
      <Header
        title="Time series"
        subtitle="Trend, forecast and confidence intervals generated from the active dataset."
      />

      <div className="metrics-grid">
        <Info
          title="Model"
          value={data.model}
          detail="Selected forecasting model"
        />

        <Info
          title="Forecast horizon"
          value={`${data.forecast.length} months`}
          detail="Future periods"
        />

        <Info
          title="In-sample MAE"
          value={money(
            data.in_sample_mae
          )}
          detail="Historical error"
        />

        <Info
          title="Last actual"
          value={moneyShort(
            data.history[
              data.history.length -
                1
            ]?.value || 0
          )}
          detail="Latest observed period"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Revenue forecast
            </h3>

            <p>
              Historical observations and
              projected future values.
            </p>
          </div>

          <LineChart
            size={17}
            className="muted-icon"
          />
        </div>

        <div
          style={{
            height: "420px"
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
            >
              <CartesianGrid
                stroke="#202734"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#748093",
                  fontSize: 11
                }}
                tickFormatter={(
                  value
                ) =>
                  dateLabel(value)
                }
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#748093",
                  fontSize: 11
                }}
                tickFormatter={(
                  value
                ) =>
                  `₹${(
                    value /
                    1_000_000
                  ).toFixed(1)}M`
                }
              />

              <Tooltip
                contentStyle={{
                  background:
                    "#111720",
                  border:
                    "1px solid #293240",
                  borderRadius: 10
                }}
              />

              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#45c7d3"
                strokeWidth={2.5}
                fill="transparent"
              />

              <Area
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#8f7cff"
                strokeWidth={2.5}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>
              Forecast detail
            </h3>

            <p>
              Forecast values and confidence
              bounds.
            </p>
          </div>
        </div>

        <div className="table-head-row">
          <span>Date</span>
          <span>Forecast</span>
          <span>Lower</span>
          <span>Upper</span>
        </div>

        {data.forecast.map(
          (item) => (
            <div
              className="table-row"
              key={item.date}
            >
              <strong>
                {dateLabel(
                  item.date
                )}
              </strong>

              <strong>
                {money(item.mean)}
              </strong>

              <span className="muted">
                {money(item.lower)}
              </span>

              <span className="growth">
                {money(item.upper)}
              </span>
            </div>
          )
        )}
      </div>
    </>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports() {
  const [overview, setOverview] =
    useState<OverviewData | null>(
      null
    );

  const [prediction, setPrediction] =
    useState<PredictionData | null>(
      null
    );

  const [forecast, setForecast] =
    useState<ForecastData | null>(
      null
    );

  const [profile, setProfile] =
    useState<ProfileData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reportType, setReportType] =
    useState(
      "executive"
    );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [
          overviewData,
          predictionData,
          forecastData,
          profileData
        ] = await Promise.all([
          postJSON<OverviewData>(
            "/overview",
            {
              dataset: DATASET
            }
          ),

          postJSON<PredictionData>(
            "/predict",
            {
              dataset: DATASET
            }
          ),

          postJSON<ForecastData>(
            "/time-series/forecast",
            {
              dataset: DATASET
            }
          ),

          getJSON<ProfileData>(
            `/datasets/${DATASET}/profile`
          )
        ]);

        setOverview(
          overviewData
        );

        setPrediction(
          predictionData
        );

        setForecast(
          forecastData
        );

        setProfile(
          profileData
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to generate report."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function reportJSON() {
    return {
      dataset: DATASET,
      generated_at:
        new Date().toISOString(),
      report_type:
        reportType,
      overview,
      profile,
      prediction,
      forecast
    };
  }

  function exportJSON() {
    const blob =
      new Blob(
        [
          JSON.stringify(
            reportJSON(),
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );

    downloadBlob(
      blob,
      `analytix-${reportType}.json`
    );
  }

  function exportCSV() {
    if (!overview)
      return;

    const rows = [
      [
        "Month",
        "Revenue",
        "Profit"
      ],

      ...overview.trend.map(
        (item) => [
          item.month,
          item.revenue,
          item.profit
        ]
      )
    ];

    const csv =
      rows
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
        )
        .join("\n");

    downloadBlob(
      new Blob([csv], {
        type: "text/csv"
      }),
      `analytix-${reportType}.csv`
    );
  }

  if (loading)
    return (
      <LoadingPage
        title="Reports"
        text="Generating analytical report..."
      />
    );

  if (error)
    return (
      <ErrorPage
        title="Reports"
        error={error}
      />
    );

  return (
    <>
      <Header
        title="Reports"
        subtitle="Generate reproducible reports from the live analytical dataset."
      />

      <div className="visual-toolbar">
        <span>
          Report
        </span>

        <button
          className={
            reportType ===
            "executive"
              ? "active"
              : ""
          }
          onClick={() =>
            setReportType(
              "executive"
            )
          }
        >
          Executive summary
        </button>

        <button
          className={
            reportType ===
            "performance"
              ? "active"
              : ""
          }
          onClick={() =>
            setReportType(
              "performance"
            )
          }
        >
          Monthly performance
        </button>

        <button
          className={
            reportType ===
            "forecast"
              ? "active"
              : ""
          }
          onClick={() =>
            setReportType(
              "forecast"
            )
          }
        >
          Forecast & model review
        </button>

        <button
          className="primary-small"
          onClick={
            exportJSON
          }
        >
          <Download size={14} />
          JSON
        </button>

        <button
          className="ghost-btn"
          onClick={
            exportCSV
          }
        >
          CSV
        </button>

        <button
          className="ghost-btn"
          onClick={() =>
            window.print()
          }
        >
          Print
        </button>
      </div>

      {reportType ===
        "executive" && (
        <ExecutiveReport
          overview={overview}
          profile={profile}
          prediction={prediction}
          forecast={forecast}
        />
      )}

      {reportType ===
        "performance" && (
        <PerformanceReport
          overview={overview}
        />
      )}

      {reportType ===
        "forecast" && (
        <ForecastReport
          prediction={prediction}
          forecast={forecast}
        />
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Report provenance
            </h3>

            <p>
              Generated from live
              DuckDB-backed analytical
              results.
            </p>
          </div>

          <CheckCircle2
            size={18}
            className="muted-icon"
          />
        </div>

        <div className="profile-grid">
          <div>
            <span>
              Dataset
            </span>

            <strong>
              {DATASET}
            </strong>
          </div>

          <div>
            <span>
              Rows
            </span>

            <strong>
              {profile?.rows.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>
              Forecast
            </span>

            <strong>
              {forecast?.model ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              ML model
            </span>

            <strong>
              {prediction?.best_model ||
                "—"}
            </strong>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   EXECUTIVE REPORT
========================================================= */

function ExecutiveReport({
  overview,
  profile,
  prediction,
  forecast
}: {
  overview: OverviewData | null;
  profile: ProfileData | null;
  prediction: PredictionData | null;
  forecast: ForecastData | null;
}) {
  return (
    <>
      <div className="metrics-grid">
        <Info
          title="Revenue"
          value={money(
            overview?.metrics
              .revenue || 0
          )}
          detail="Total observed revenue"
        />

        <Info
          title="Profit"
          value={money(
            overview?.metrics
              .profit || 0
          )}
          detail="Revenue minus cost"
        />

        <Info
          title="Orders"
          value={
            overview?.metrics
              .orders.toLocaleString(
                "en-IN"
              ) || "0"
          }
          detail="Total orders"
        />

        <Info
          title="Conversion"
          value={percent(
            overview?.metrics
              .conversion_rate || 0
          )}
          detail="Average conversion"
        />
      </div>

      <div className="charts-grid">
        <RevenueChart
          data={
            overview?.trend || []
          }
        />

        <RegionChart
          data={
            overview?.regions || []
          }
        />
      </div>

      <div className="two-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Dataset profile
              </h3>

              <p>
                Current analytical
                dataset structure.
              </p>
            </div>

            <Sigma
              size={17}
              className="muted-icon"
            />
          </div>

          <div className="profile-grid">
            <div>
              <span>
                Rows
              </span>

              <strong>
                {profile?.rows.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div>
              <span>
                Columns
              </span>

              <strong>
                {profile?.columns.length}
              </strong>
            </div>

            <div>
              <span>
                Measures
              </span>

              <strong>
                {profile?.measures.length}
              </strong>
            </div>

            <div>
              <span>
                Dimensions
              </span>

              <strong>
                {profile?.dimensions.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Analytical models
              </h3>

              <p>
                Current model outputs.
              </p>
            </div>

            <ShieldCheck
              size={17}
              className="muted-icon"
            />
          </div>

          <div className="profile-grid">
            <div>
              <span>
                ML model
              </span>

              <strong>
                {prediction?.best_model}
              </strong>
            </div>

            <div>
              <span>
                R²
              </span>

              <strong>
                {prediction?.metrics.r2.toFixed(
                  3
                )}
              </strong>
            </div>

            <div>
              <span>
                Forecast
              </span>

              <strong>
                {forecast?.model}
              </strong>
            </div>

            <div>
              <span>
                Forecast MAE
              </span>

              <strong>
                {money(
                  forecast?.in_sample_mae ||
                    0
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   PERFORMANCE REPORT
========================================================= */

function PerformanceReport({
  overview
}: {
  overview: OverviewData | null;
}) {
  return (
    <>
      <div className="charts-grid">
        <RevenueChart
          data={
            overview?.trend || []
          }
        />

        <RegionChart
          data={
            overview?.regions || []
          }
        />
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>
              Monthly performance
            </h3>

            <p>
              Revenue, profit and
              calculated margin.
            </p>
          </div>

          <span className="small-badge">
            SQL-backed
          </span>
        </div>

        <div className="table-head-row">
          <span>
            Month
          </span>

          <span>
            Revenue
          </span>

          <span>
            Profit
          </span>

          <span>
            Margin
          </span>
        </div>

        {overview?.trend.map(
          (item) => {
            const margin =
              item.revenue
                ? (
                    (item.profit /
                      item.revenue) *
                    100
                  ).toFixed(1)
                : "0";

            return (
              <div
                className="table-row"
                key={item.month}
              >
                <strong>
                  {dateLabel(
                    item.month
                  )}
                </strong>

                <strong>
                  {money(
                    item.revenue
                  )}
                </strong>

                <strong>
                  {money(
                    item.profit
                  )}
                </strong>

                <span className="growth">
                  {margin}%
                </span>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}

/* =========================================================
   FORECAST REPORT
========================================================= */

function ForecastReport({
  prediction,
  forecast
}: {
  prediction: PredictionData | null;
  forecast: ForecastData | null;
}) {
  return (
    <>
      <div className="metrics-grid">
        <Info
          title="Forecast model"
          value={
            forecast?.model ||
            "—"
          }
          detail="Statistical forecast"
        />

        <Info
          title="Horizon"
          value={
            forecast
              ? `${forecast.forecast.length} months`
              : "—"
          }
          detail="Future periods"
        />

        <Info
          title="Forecast MAE"
          value={money(
            forecast?.in_sample_mae ||
              0
          )}
          detail="Historical error"
        />

        <Info
          title="Best ML model"
          value={
            prediction?.best_model ||
            "—"
          }
          detail="Regression model"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Forecast detail
            </h3>

            <p>
              Future predictions and
              confidence intervals.
            </p>
          </div>

          <TrendingUp
            size={17}
            className="muted-icon"
          />
        </div>

        <div className="table-head-row">
          <span>
            Date
          </span>

          <span>
            Forecast
          </span>

          <span>
            Lower
          </span>

          <span>
            Upper
          </span>
        </div>

        {forecast?.forecast.map(
          (item) => (
            <div
              className="table-row"
              key={item.date}
            >
              <strong>
                {dateLabel(
                  item.date
                )}
              </strong>

              <strong>
                {money(item.mean)}
              </strong>

              <span className="muted">
                {money(item.lower)}
              </span>

              <span className="growth">
                {money(item.upper)}
              </span>
            </div>
          )
        )}
      </div>
    </>
  );
}

/* =========================================================
   AI ANALYST
========================================================= */

function AIAnalyst() {
  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState<AIResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const suggestions = [
    "What are the main trends in this dataset?",
    "Which region generates the most revenue?",
    "What is the relationship between revenue and cost?",
    "How is revenue expected to change over the next six months?"
  ];

  async function ask() {
    if (!question.trim())
      return;

    try {
      setLoading(true);
      setError("");
      setAnswer(null);

      const result =
        await postJSON<AIResponse>(
          "/ai/ask",
          {
            dataset: DATASET,
            question:
              question.trim()
          }
        );

      setAnswer(result);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to analyze the dataset."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        title="AI Analyst"
        subtitle="Ask natural-language questions about the active analytical dataset."
      />

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="section-kicker">
              NATURAL LANGUAGE ANALYSIS
            </div>

            <h3>
              Ask the analyst
            </h3>

            <p>
              Questions are sent to the
              analytical backend using
              the active dataset.
            </p>
          </div>

          <Sparkles
            size={19}
            className="ai-icon-inline"
          />
        </div>

        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
          placeholder="Ask something about your data..."
          rows={5}
          style={{
            width: "100%",
            resize: "vertical",
            marginBottom:
              "14px"
          }}
        />

        <button
          className="primary-small"
          onClick={ask}
          disabled={
            loading ||
            !question.trim()
          }
        >
          <Sparkles size={14} />

          {loading
            ? "Analyzing..."
            : "Analyze"}
        </button>

        <div
          style={{
            marginTop: "18px"
          }}
        >
          <p className="muted">
            Suggested questions
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}
          >
            {suggestions.map(
              (suggestion) => (
                <button
                  className="ghost-btn"
                  key={suggestion}
                  onClick={() =>
                    setQuestion(
                      suggestion
                    )
                  }
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="panel">
          <p className="warning-text">
            {error}
          </p>
        </div>
      )}

      {answer && (
        <>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>
                  Analysis
                </h3>

                <p>
                  AI-generated analytical
                  response.
                </p>
              </div>

              <MessageSquare
                size={17}
                className="muted-icon"
              />
            </div>

            <div
              style={{
                whiteSpace:
                  "pre-wrap",
                lineHeight:
                  1.7
              }}
            >
              {answer.text}
            </div>
          </div>

          {answer.queries &&
            answer.queries.length >
              0 && (
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h3>
                      Analytical queries
                    </h3>

                    <p>
                      SQL used by the
                      analyst.
                    </p>
                  </div>

                  <GitBranch
                    size={17}
                    className="muted-icon"
                  />
                </div>

                {answer.queries.map(
                  (
                    query,
                    index
                  ) => (
                    <pre
                      key={index}
                      style={{
                        overflowX:
                          "auto",
                        padding:
                          "14px",
                        borderRadius:
                          "8px"
                      }}
                    >
                      {query}
                    </pre>
                  )
                )}
              </div>
            )}
        </>
      )}
    </>
  );
}

/* =========================================================
   ALERTS
========================================================= */

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: 1,
    name:
      "Revenue threshold",
    metric: "Revenue",
    condition: "Below",
    threshold: 1_500_000,
    status: "Active",
    lastChecked:
      "Session start"
  },

  {
    id: 2,
    name:
      "Profit threshold",
    metric: "Profit",
    condition: "Below",
    threshold: 1_000_000,
    status: "Active",
    lastChecked:
      "Session start"
  }
];

function Alerts() {
  const [items, setItems] =
    useState<AlertItem[]>(
      () => {
        try {
          const saved =
            localStorage.getItem(
              "analytix-alerts"
            );

          return saved
            ? JSON.parse(
                saved
              )
            : DEFAULT_ALERTS;
        } catch {
          return DEFAULT_ALERTS;
        }
      }
    );

  const [overview, setOverview] =
    useState<OverviewData | null>(
      null
    );

  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [metric, setMetric] =
    useState<
      AlertItem["metric"]
    >("Revenue");

  const [condition, setCondition] =
    useState<
      AlertItem["condition"]
    >("Below");

  const [threshold, setThreshold] =
    useState("1000000");

  useEffect(() => {
    localStorage.setItem(
      "analytix-alerts",
      JSON.stringify(items)
    );
  }, [items]);

  useEffect(() => {
    async function load() {
      try {
        const data =
          await postJSON<OverviewData>(
            "/overview",
            {
              dataset: DATASET
            }
          );

        setOverview(data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  function currentMetricValue(
    alert: AlertItem
  ) {
    if (!overview)
      return null;

    if (
      alert.metric ===
      "Revenue"
    )
      return overview.metrics
        .revenue;

    if (
      alert.metric ===
      "Profit"
    )
      return overview.metrics
        .profit;

    if (
      alert.metric ===
      "Orders"
    )
      return overview.metrics
        .orders;

    return (
      overview.metrics
        .conversion_rate *
      100
    );
  }

  function triggered(
    alert: AlertItem
  ) {
    const value =
      currentMetricValue(
        alert
      );

    if (
      value === null ||
      alert.status !==
        "Active"
    )
      return false;

    if (
      alert.condition ===
      "Above"
    )
      return (
        value >
        alert.threshold
      );

    return (
      value <
      alert.threshold
    );
  }

  function createAlert() {
    if (!name.trim())
      return;

    const newAlert: AlertItem =
      {
        id: Date.now(),
        name:
          name.trim(),
        metric,
        condition,
        threshold:
          Number(threshold),
        status: "Active",
        lastChecked:
          "Just now"
      };

    setItems([
      ...items,
      newAlert
    ]);

    setName("");
    setShowForm(false);
  }

  function toggleAlert(
    id: number
  ) {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status ===
                "Active"
                  ? "Paused"
                  : "Active"
            }
          : item
      )
    );
  }

  function deleteAlert(
    id: number
  ) {
    setItems(
      items.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (
    <>
      <Header
        title="Alerts"
        subtitle="Monitor analytical thresholds and anomaly conditions."
        action={
          <button
            className="primary-small"
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
          >
            <Plus size={14} />
            New alert
          </button>
        }
      />

      {showForm && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Create alert
              </h3>

              <p>
                Alert state is currently
                stored locally in the
                browser.
              </p>
            </div>
          </div>

          <div className="visual-toolbar">
            <input
              placeholder="Alert name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

            <select
              value={metric}
              onChange={(e) =>
                setMetric(
                  e.target
                    .value as AlertItem["metric"]
                )
              }
            >
              <option>
                Revenue
              </option>

              <option>
                Profit
              </option>

              <option>
                Orders
              </option>

              <option>
                Conversion rate
              </option>
            </select>

            <select
              value={condition}
              onChange={(e) =>
                setCondition(
                  e.target
                    .value as AlertItem["condition"]
                )
              }
            >
              <option>
                Above
              </option>

              <option>
                Below
              </option>
            </select>

            <input
              type="number"
              value={threshold}
              onChange={(e) =>
                setThreshold(
                  e.target.value
                )
              }
            />

            <button
              className="primary-small"
              onClick={
                createAlert
              }
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="alert-list">
        {items.map(
          (alert) => {
            const value =
              currentMetricValue(
                alert
              );

            return (
              <div
                className="panel alert-row"
                key={alert.id}
              >
                <div className="alert-status">
                  <span
                    className={
                      alert.status ===
                      "Active"
                        ? "live-dot"
                        : "paused-dot"
                    }
                  />

                  <div>
                    <strong>
                      {alert.name}
                    </strong>

                    <span>
                      {alert.metric}{" "}
                      ·{" "}
                      {alert.condition}{" "}
                      ·{" "}
                      {alert.threshold.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                <span
                  className={`status-badge ${
                    triggered(
                      alert
                    )
                      ? "active"
                      : alert.status.toLowerCase()
                  }`}
                >
                  {triggered(
                    alert
                  )
                    ? "Triggered"
                    : alert.status}
                </span>

                <span className="muted">
                  {value !==
                  null
                    ? `Current: ${value.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2
                        }
                      )}`
                    : "Checking..."}
                </span>

                <button
                  className="ghost-btn"
                  onClick={() =>
                    toggleAlert(
                      alert.id
                    )
                  }
                >
                  {alert.status ===
                  "Active"
                    ? "Pause"
                    : "Activate"}
                </button>

                <button
                  className="ghost-btn"
                  onClick={() =>
                    deleteAlert(
                      alert.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}

/* =========================================================
   LINEAGE
========================================================= */

function Lineage() {
  const [overview, setOverview] =
    useState<OverviewData | null>(
      null
    );

  const [profile, setProfile] =
    useState<ProfileData | null>(
      null
    );

  const [prediction, setPrediction] =
    useState<PredictionData | null>(
      null
    );

  const [forecast, setForecast] =
    useState<ForecastData | null>(
      null
    );

  const [events, setEvents] =
    useState<LineageEvent[]>(
      []
    );

  useEffect(() => {
    async function load() {
      const generated: LineageEvent[] =
        [];

      try {
        const profileData =
          await getJSON<ProfileData>(
            `/datasets/${DATASET}/profile`
          );

        setProfile(
          profileData
        );

        generated.push({
          id: 1,
          type: "LOAD",
          time: new Date().toLocaleTimeString(),
          description:
            "Dataset profile loaded",
          detail:
            `${profileData.rows} rows · ${profileData.columns.length} columns`
        });

        const overviewData =
          await postJSON<OverviewData>(
            "/overview",
            {
              dataset: DATASET
            }
          );

        setOverview(
          overviewData
        );

        generated.push({
          id: 2,
          type: "QUERY",
          time: new Date().toLocaleTimeString(),
          description:
            "Overview analytics executed",
          detail:
            "Revenue, profit, orders, conversion and regional aggregates"
        });

        const predictionData =
          await postJSON<PredictionData>(
            "/predict",
            {
              dataset: DATASET
            }
          );

        setPrediction(
          predictionData
        );

        generated.push({
          id: 3,
          type: "MODEL",
          time: new Date().toLocaleTimeString(),
          description:
            "Prediction models evaluated",
          detail:
            `Best model: ${predictionData.best_model}`
        });

        const forecastData =
          await postJSON<ForecastData>(
            "/time-series/forecast",
            {
              dataset: DATASET
            }
          );

        setForecast(
          forecastData
        );

        generated.push({
          id: 4,
          type: "FORECAST",
          time: new Date().toLocaleTimeString(),
          description:
            "Time-series forecast generated",
          detail:
            `Model: ${forecastData.model} · ${forecastData.forecast.length} future periods`
        });

        setEvents(
          generated
        );
      } catch (err) {
        console.error(err);
        setEvents(
          generated
        );
      }
    }

    load();
  }, []);

  function exportLineage() {
    const data = {
      dataset: DATASET,
      generated_at:
        new Date().toISOString(),
      profile,
      overview,
      prediction,
      forecast,
      events
    };

    downloadBlob(
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      ),
      "analytix-lineage.json"
    );
  }

  return (
    <>
      <Header
        title="Lineage"
        subtitle="Trace analytical results from dataset loading through queries, models and forecasts."
      />

      <div className="lineage-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Session timeline
              </h3>

              <p>
                Analytical operations
                executed for this session.
              </p>
            </div>

            <GitBranch
              size={17}
              className="muted-icon"
            />
          </div>

          <div className="timeline">
            {events.map(
              (event) => (
                <div
                  className="timeline-item"
                  key={event.id}
                >
                  <div className="timeline-dot" />

                  <div>
                    <span className="timeline-type">
                      {event.type} ·{" "}
                      {event.time}
                    </span>

                    <strong>
                      {
                        event.description
                      }
                    </strong>

                    <p>
                      {
                        event.detail
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="panel lineage-summary">
          <div className="section-kicker">
            REPRODUCIBILITY
          </div>

          <h3>
            Analytical chain
          </h3>

          <p>
            Dataset → Profile →
            SQL analytics → ML →
            Forecast
          </p>

          <button
            className="primary-small"
            onClick={
              exportLineage
            }
          >
            <Download size={14} />
            Export lineage
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Provenance summary
            </h3>

            <p>
              Current session inputs
              and analytical outputs.
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <span>
              Dataset
            </span>

            <strong>
              {DATASET}
            </strong>
          </div>

          <div>
            <span>
              Rows
            </span>

            <strong>
              {profile?.rows ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Best model
            </span>

            <strong>
              {prediction?.best_model ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Forecast
            </span>

            <strong>
              {forecast?.model ||
                "—"}
            </strong>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function Header({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title-row">
      <div>
        <div className="breadcrumb">
          {DATASET} / {title}
        </div>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>
      </div>

      {action}
    </div>
  );
}

function Info({
  title,
  value,
  detail
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric-card">
      <span className="metric-label">
        {title}
      </span>

      <strong className="metric-value">
        {value}
      </strong>

      <span className="metric-foot">
        {detail}
      </span>
    </div>
  );
}

function LoadingPage({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <>
      <Header
        title={title}
        subtitle={text}
      />

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              <RefreshCw
                size={16}
              />{" "}
              {text}
            </h3>

            <p>
              Waiting for the
              analytical backend.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ErrorPage({
  title,
  error
}: {
  title: string;
  error: string;
}) {
  return (
    <>
      <Header
        title={title}
        subtitle="The analytical backend returned an error."
      />

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              Unable to load analytics
            </h3>

            <p>
              {error}
            </p>
          </div>

          <AlertTriangle
            size={18}
            className="muted-icon"
          />
        </div>
      </div>
    </>
  );
}

function downloadBlob(
  blob: Blob,
  filename: string
) {
  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement(
      "a"
    );

  link.href = url;
  link.download = filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}