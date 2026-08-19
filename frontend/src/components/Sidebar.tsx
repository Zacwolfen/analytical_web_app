import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  Database,
  FileBarChart,
  GitBranch,
  LayoutDashboard,
  LineChart,
  Settings,
  Sigma,
  Sparkles,
  Table2,
  TrendingUp
} from "lucide-react";
import type { Page } from "../types";

const items: Array<{ id: Page; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
  { id: "data", label: "Data", icon: <Table2 size={17} /> },
  { id: "explore", label: "Explore", icon: <Database size={17} /> },
  { id: "visualize", label: "Visualize", icon: <BarChart3 size={17} /> },
  { id: "analyst", label: "AI Analyst", icon: <BrainCircuit size={17} /> },
  { id: "statistics", label: "Statistics", icon: <Sigma size={17} /> },
  { id: "predict", label: "Predict", icon: <TrendingUp size={17} /> },
  { id: "time-series", label: "Time series", icon: <LineChart size={17} /> },
  { id: "reports", label: "Reports", icon: <FileBarChart size={17} /> },
  { id: "alerts", label: "Alerts", icon: <Bell size={17} /> },
  { id: "lineage", label: "Lineage", icon: <GitBranch size={17} /> }
];

export default function Sidebar({
  page,
  setPage
}: {
  page: Page;
  setPage: (page: Page) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Activity size={17} /></div>
        <div>
          <div className="brand-name">ANALYTIX</div>
          <div className="brand-sub">TRACEABLE ANALYTICS</div>
        </div>
      </div>

      <div className="workspace-card">
        <div className="eyebrow">WORKSPACE</div>
        <div className="workspace-row">
          <div className="workspace-avatar">S</div>
          <div>
            <strong>Sales Analytics</strong>
            <span>Groundtruth engine</span>
          </div>
          <span className="chevron">⌄</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="eyebrow">ANALYZE</div>
        {items.slice(0, 8).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === "analyst" && <span className="nav-badge">AI</span>}
          </button>
        ))}
      </div>

      <div className="nav-section management">
        <div className="eyebrow">MANAGE</div>
        {items.slice(8).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <button className="nav-item" onClick={() => setPage("overview")}>
          <Settings size={17} />
          <span>Settings</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="engine-status">
          <div className="status-line">
            <span className="live-dot" />
            <strong>Analytics engine</strong>
            <span className="online">ONLINE</span>
          </div>
          <span>DuckDB · local workspace</span>
        </div>
        <div className="profile-row">
          <div className="profile-avatar">K</div>
          <div>
            <strong>Kau</strong>
            <span>Pro workspace</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
