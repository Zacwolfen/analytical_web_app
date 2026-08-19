# ANALYTIX + Groundtruth

React frontend (`frontend/`) -> FastAPI (`api.py`) -> Groundtruth Python modules -> DuckDB / Pandas / ML / AI.

## Backend
```bash
cd analytical_web_app
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```
Health: http://127.0.0.1:8000/api/health

## Frontend
```bash
cd analytical_web_app/frontend
npm install
npm run dev
```
Open http://localhost:5173

The backend loads `sample_data.csv` automatically. AI uses the existing Groundtruth tool-calling agent when `OPENAI_API_KEY` is configured.
