import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function MetricCard({
  label,
  value,
  change,
  icon,
  negative = false
}: {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
  negative?: boolean;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <div className="metric-icon">{icon}</div>
        <span className={negative ? "delta negative" : "delta positive"}>
          {negative ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
          {change}
        </span>
      </div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-foot">vs previous period</span>
    </div>
  );
}
