import { Bell, Command, Search, Upload, Sparkles } from "lucide-react";

export default function Topbar({
  onAskAI,
  onUpload
}: {
  onAskAI: () => void;
  onUpload: () => void;
}) {
  return (
    <header className="topbar">
      <div className="searchbox">
        <Search size={16} />
        <input placeholder="Search data, analyses, reports..." />
        <span className="shortcut"><Command size={11} /> K</span>
      </div>

      <div className="top-actions">
        <button className="ghost-btn" onClick={onUpload}>
          <Upload size={15} />
          Import
        </button>
        <button className="ai-top-btn" onClick={onAskAI}>
          <Sparkles size={15} />
          Ask AI
        </button>
        <button className="notification-btn">
          <Bell size={17} />
          <span />
        </button>
        <div className="top-avatar">K</div>
      </div>
    </header>
  );
}
