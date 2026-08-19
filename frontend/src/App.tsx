import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./components/Overview";
import Analyst from "./components/Analyst";
import DataView from "./components/DataView";
import GenericPage from "./components/GenericPages";
import type { Page } from "./types";

export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [region, setRegion] = useState("All regions");
  const [channel, setChannel] = useState("All channels");
  const [modal, setModal] = useState<"upload" | null>(null);

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <div className="main-shell">
        <Topbar onAskAI={() => setPage("analyst")} onUpload={() => setModal("upload")} />
        <main className="main-content">
          {page === "overview" && (
            <Overview
              region={region}
              setRegion={setRegion}
              channel={channel}
              setChannel={setChannel}
              onAskAI={() => setPage("analyst")}
            />
          )}
          {page === "data" && <DataView />}
          {page === "analyst" && <Analyst />}
          {["explore","visualize","statistics","predict","time-series","reports","alerts","lineage"].includes(page) && (
            <GenericPage page={page} />
          )}
        </main>
      </div>

      {modal === "upload" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}><X size={17}/></button>
            <div className="upload-icon"><UploadCloud size={25}/></div>
            <div className="section-kicker">DATA SOURCE</div>
            <h2>Connect a dataset</h2>
            <p>Choose a file now. The FastAPI adapter will later forward it to the Groundtruth connector layer.</p>
            <div className="dropzone">
              <UploadCloud size={24}/>
              <strong>Drop CSV, Excel, JSON or Parquet</strong>
              <span>Up to 500 MB per file</span>
              <button className="primary-small" onClick={() => setModal(null)}>Choose file</button>
            </div>
            <div className="source-options">
              <span>Database</span><span>API</span><span>File path</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
