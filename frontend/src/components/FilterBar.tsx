import { ChevronDown, Filter, RotateCcw } from "lucide-react";

export default function FilterBar({
  region,
  setRegion,
  channel,
  setChannel
}: {
  region: string;
  setRegion: (v: string) => void;
  channel: string;
  setChannel: (v: string) => void;
}) {
  return (
    <div className="filterbar">
      <div className="dataset-pill">
        <span className="live-dot" />
        <strong>sample_data</strong>
        <span>288 rows · 7 columns</span>
      </div>
      <div className="filter-controls">
        <div className="filter-label"><Filter size={13} /> FILTERS</div>
        <label>
          <span>Date</span>
          <select defaultValue="2024">
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <ChevronDown size={13} />
        </label>
        <label>
          <span>Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>All regions</option>
            <option>North</option>
            <option>South</option>
            <option>East</option>
            <option>West</option>
          </select>
          <ChevronDown size={13} />
        </label>
        <label>
          <span>Channel</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option>All channels</option>
            <option>Organic</option>
            <option>Paid</option>
            <option>Referral</option>
          </select>
          <ChevronDown size={13} />
        </label>
        <button className="reset-btn" onClick={() => { setRegion("All regions"); setChannel("All channels"); }}>
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  );
}
