# ANALYTIX — Groundtruth Frontend

A redesigned React + TypeScript frontend for the Groundtruth analytical engine.

## Run

```bash
npm install
npm run dev
```

Open:

http://localhost:5173

## Stack

- React
- TypeScript
- Vite
- Recharts
- Lucide React

## Current state

This frontend is intentionally decoupled from the Python Streamlit app. It uses realistic mock data while exposing a small API adapter in `src/services/api.ts`.

The intended architecture is:

React frontend
→ FastAPI
→ Groundtruth Python modules
→ DuckDB / Pandas / ML / AI / reports / alerts

## Groundtruth mapping

- Data → `connectors.py` + `store.py`
- Explore → `semantic.py` + `filters.py`
- Visualize → `charts.py`
- AI Analyst → `agent.py`
- Statistics → `stats.py`
- Predict → `ml.py`
- Time series → `timeseries.py`
- Reports → `report.py`
- Alerts → `alerts.py`
- Lineage → `provenance.py`

## Next integration step

Expose the Groundtruth functions through FastAPI endpoints and set:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

The React UI can then replace mock data with real responses without redesigning the frontend.
