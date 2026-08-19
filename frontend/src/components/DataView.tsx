import { useEffect, useMemo, useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { apiPost } from "../services/api";

type DataResponse = {
  columns: string[];
  rows: Record<string, unknown>[];
  total_rows?: number;
};

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
  }

  return String(value);
}

export default function DataView() {
  const [data, setData] = useState<DataResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const result = await apiPost<DataResponse>("/data", {
          dataset: "sample_data",
          limit: 250,
          offset: 0
        });

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load dataset from Groundtruth.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    if (!data) return [];

    if (!search.trim()) {
      return data.rows;
    }

    const query = search.toLowerCase();

    return data.rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [data, search]);

  function exportCSV() {
    if (!data) return;

    const header = data.columns.join(",");

    const body = data.rows
      .map((row) =>
        data.columns
          .map((column) => {
            const value = row[column] ?? "";
            const text = String(value).replace(/"/g, '""');

            return `"${text}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [`${header}\n${body}`],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_data.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="panel" style={{ padding: "40px" }}>
        <h3>Loading dataset...</h3>
        <p>Connecting to Groundtruth / DuckDB.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel" style={{ padding: "40px" }}>
        <h3>Unable to load dataset</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="breadcrumb">
            sample_data / Data
          </div>

          <h1>Data explorer</h1>

          <p>
            Inspect the active DuckDB view without leaving
            the analytical workspace.
          </p>
        </div>

        <button
          className="ghost-btn"
          onClick={exportCSV}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <div className="panel">

        <div className="data-toolbar">

          <div className="data-search">
            <Search size={14} />

            <input
              placeholder="Search rows..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <button className="ghost-btn">
            <SlidersHorizontal size={14} />
            Columns
          </button>

          <span className="rows-note">
            {filteredRows.length} rows
          </span>

        </div>

        <div className="data-table">

          <div className="data-table-head">

            {data.columns.map((column) => (
              <span key={column}>
                {column}
              </span>
            ))}

          </div>

          {filteredRows.map((row, index) => (

            <div
              className="data-table-row"
              key={index}
            >

              {data.columns.map((column) => {

                const value = row[column];

                const numeric =
                  typeof value === "number";

                return (
                  <span
                    key={column}
                    className={
                      numeric
                        ? "numeric"
                        : ""
                    }
                  >
                    {formatCell(value)}
                  </span>
                );
              })}

            </div>

          ))}

        </div>

        {filteredRows.length === 0 && (
          <div
            style={{
              padding: "30px",
              textAlign: "center"
            }}
          >
            No matching rows found.
          </div>
        )}

      </div>
    </>
  );
}