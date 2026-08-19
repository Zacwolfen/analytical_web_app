import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  DollarSign,
  Rows3,
  Sparkles,
  TrendingUp
} from "lucide-react";

import MetricCard from "./MetricCard";
import FilterBar from "./FilterBar";
import { RegionChart, RevenueChart } from "./ChartCard";
import { apiPost } from "../services/api";

type OverviewResponse = {
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

type ProfileResponse = {
  rows: number;
  columns: number;
  measures?: number;
  dimensions?: number;
  time_grain?: string;
  missingness?: number;
};

function formatMoney(value: number) {
  return `₹${(value / 1_000_000).toFixed(2)}M`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export default function Overview({
  region,
  setRegion,
  channel,
  setChannel,
  onAskAI
}: {
  region: string;
  setRegion: (v: string) => void;
  channel: string;
  setChannel: (v: string) => void;
  onAskAI: () => void;
}) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError("");

        const result = await apiPost<OverviewResponse>("/overview", {
          dataset: "sample_data"
        });

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load analytics from Groundtruth.");
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="panel" style={{ padding: "40px" }}>
        <h3>Loading analytics...</h3>
        <p>Connecting to Groundtruth / DuckDB.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel" style={{ padding: "40px" }}>
        <h3>Unable to load analytics</h3>
        <p>{error}</p>
        <p>
          Make sure FastAPI is running on
          <strong> localhost:8000</strong>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="breadcrumb">
            Workspace / sample_data
          </div>

          <h1>Overview</h1>

          <p>
            One analytical view across data, filters,
            statistics, models and lineage.
          </p>
        </div>

        <div className="trace-chip">
          <Activity size={14} />
          Traceable workspace
        </div>
      </div>

      <FilterBar
        region={region}
        setRegion={setRegion}
        channel={channel}
        setChannel={setChannel}
      />

      <div className="metrics-grid">

        <MetricCard
          label="Revenue"
          value={formatMoney(data.metrics.revenue)}
          change="Live"
          icon={<DollarSign size={17} />}
        />

        <MetricCard
          label="Profit"
          value={formatMoney(data.metrics.profit)}
          change="Live"
          icon={<TrendingUp size={17} />}
        />

        <MetricCard
          label="Orders"
          value={formatNumber(data.metrics.orders)}
          change="Live"
          icon={<Rows3 size={17} />}
        />

        <MetricCard
          label="Conversion rate"
          value={formatPercent(data.metrics.conversion_rate)}
          change="Live"
          icon={<Activity size={17} />}
        />

      </div>

      <div className="charts-grid">
        <RevenueChart data={data.trend} />
        <RegionChart data={data.regions} />
      </div>

      <div className="lower-grid">

        <div className="panel">

          <div className="panel-head">
            <div>
              <h3>Data profile</h3>
              <p>
                Semantic information detected from the active dataset.
              </p>
            </div>

            <Database
              size={17}
              className="muted-icon"
            />
          </div>

          <div className="profile-grid">

            <div>
              <span>Rows</span>
              <strong>{data.filtered_rows}</strong>
            </div>

            <div>
              <span>Columns</span>
              <strong>7</strong>
            </div>

            <div>
              <span>Measures</span>
              <strong>4</strong>
            </div>

            <div>
              <span>Dimensions</span>
              <strong>2</strong>
            </div>

            <div>
              <span>Time grain</span>
              <strong>Month</strong>
            </div>

            <div>
              <span>Source</span>
              <strong>DuckDB</strong>
            </div>

          </div>

        </div>

        <div className="panel">

          <div className="panel-head">

            <div>
              <h3>Proactive findings</h3>
              <p>
                Patterns detected before you ask.
              </p>
            </div>

            <Sparkles
              size={17}
              className="ai-icon-inline"
            />

          </div>

          <div className="finding">

            <span className="finding-mark">
              ↗
            </span>

            <div>
              <strong>
                Revenue is available for analysis
              </strong>

              <p>
                Groundtruth calculated{" "}
                {formatMoney(data.metrics.revenue)}{" "}
                in observed revenue.
              </p>
            </div>

          </div>

          <div className="finding">

            <span className="finding-mark warning">
              !
            </span>

            <div>

              <strong>
                Conversion rate
              </strong>

              <p>
                Current observed conversion rate is{" "}
                {formatPercent(
                  data.metrics.conversion_rate
                )}.
              </p>

            </div>

          </div>

          <button
            className="full-ai-btn"
            onClick={onAskAI}
          >
            <Sparkles size={14} />
            Ask the analyst about these findings
          </button>

        </div>

      </div>

      <div className="panel table-panel">

        <div className="panel-head">

          <div>
            <h3>Regional revenue</h3>

            <p>
              Revenue returned directly by Groundtruth.
            </p>
          </div>

          <span className="small-badge">
            SQL-backed
          </span>

        </div>

        <div className="table-head-row">
          <span>Region</span>
          <span>Revenue</span>
          <span>Share</span>
          <span>Status</span>
        </div>

        {data.regions.map((item) => {

          const share =
            item.revenue /
            data.metrics.revenue;

          return (
            <div
              className="table-row"
              key={item.region}
            >

              <div className="segment-name">
                <span>
                  {item.region[0]}
                </span>

                <strong>
                  {item.region}
                </strong>
              </div>

              <strong>
                {formatMoney(item.revenue)}
              </strong>

              <span className="muted">
                {formatPercent(share)}
              </span>

              <span className="growth">
                Live
              </span>

            </div>
          );
        })}

      </div>
    </>
  );
}