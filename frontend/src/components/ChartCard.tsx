import { MoreHorizontal } from "lucide-react";
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

export function RevenueChart({
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
        <strong>
          {formatMoney(totalRevenue)}
        </strong>

        <span>
          Live
          <small> Groundtruth / DuckDB</small>
        </span>
      </div>

      <div className="chart-wrap">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

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

export function RegionChart({
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

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

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

        <strong>
          {formatMoney(totalRevenue)}
        </strong>

      </div>

    </div>
  );
}