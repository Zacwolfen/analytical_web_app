from __future__ import annotations
import os
from pathlib import Path
from typing import Any
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groundtruth import connectors, stats, timeseries
from groundtruth.semantic import profile
from groundtruth.store import Store
ROOT = Path(__file__).resolve().parent
SAMPLE = ROOT / "sample_data.csv"
app = FastAPI(title="Analytix Groundtruth API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
store = Store(); active: str | None = None

def serializable(value: Any):
    if pd.isna(value): return None
    if hasattr(value, "isoformat"): return value.isoformat()
    if hasattr(value, "item"): return value.item()
    return value

def load_default():
    global active
    if SAMPLE.exists() and not active:
        active = connectors.load_path(store, str(SAMPLE), name="sample_data").dataset.name

def current_dataset():
    load_default()
    if not active or active not in store.datasets: raise HTTPException(404, "No active dataset")
    return store.datasets[active]

class FilterBody(BaseModel):
    region: str = "All regions"
    channel: str = "All channels"
class SQLBody(BaseModel): query: str
class AskBody(BaseModel): question: str

@app.get("/api/health")
def health(): return {"status":"ok","engine":"DuckDB","active_dataset":active}

@app.get("/api/datasets")
def datasets():
    load_default()
    return {"datasets":[{"name":d.name,"source":d.source_kind,"rows":d.rows,"columns":len(d.columns),"column_names":d.columns,"source_detail":d.source_detail} for d in store.datasets.values()],"active":active}

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global active
    raw = await file.read()
    class Incoming:
        name = file.filename or "upload.csv"
        def getvalue(self): return raw
    result = connectors.load_upload(store, Incoming())
    active = result.dataset.name
    return {"name":active,"rows":result.dataset.rows,"columns":result.dataset.columns}

@app.get("/api/datasets/{name}/profile")
def dataset_profile(name:str):
    if name not in store.datasets: raise HTTPException(404,"Dataset not found")
    spec=profile(store,store.datasets[name].table)
    return {"name":name,"rows":spec.rows,"columns":[{"name":c.name,"sql_type":c.sql_type,"role":c.role,"distinct":c.distinct,"missing":c.missing,"missing_pct":c.missing_pct,"min":serializable(c.min_value),"max":serializable(c.max_value),"mean":serializable(c.mean_value),"top_values":c.top_values} for c in spec.columns],"measures":spec.measures,"dimensions":spec.dimensions,"time_column":spec.time_column,"time_grain":spec.time_grain}

def where_for(filters:FilterBody):
    clauses=[]; params=[]
    if filters.region!="All regions": clauses.append('"region" = ?'); params.append(filters.region)
    if filters.channel!="All channels": clauses.append('"channel" = ?'); params.append(filters.channel)
    return " AND ".join(clauses),params

@app.post("/api/data")
def data(filters:FilterBody=FilterBody(),offset:int=0,limit:int=250):
    d=current_dataset(); where,params=where_for(filters); frame=store.page(d.table,where,params,offset=offset,limit=min(limit,1000))
    return {"rows":[{k:serializable(v) for k,v in r.items()} for r in frame.to_dict(orient="records")],"columns":list(frame.columns),"total":store.count(d.table,where,params)}

@app.post("/api/overview")
def overview(filters:FilterBody=FilterBody()):
    d=current_dataset(); where,params=where_for(filters); clause=f" WHERE {where}" if where else ""
    row=store.sql(f'SELECT COALESCE(SUM(revenue),0) revenue, COALESCE(SUM(revenue-cost),0) profit, COALESCE(SUM(orders),0) orders, AVG(conversion_rate) conversion_rate FROM "{d.table}"{clause}',params).iloc[0].to_dict()
    trend=store.sql(f'SELECT date_trunc(\'month\', date) AS "month", SUM(revenue) AS revenue, SUM(revenue-cost) AS profit FROM "{d.table}"{clause} GROUP BY 1 ORDER BY 1',params)
    regions=store.sql(f'SELECT region, SUM(revenue) revenue FROM "{d.table}"{clause} GROUP BY region ORDER BY revenue DESC',params)
    return {"metrics":{k:serializable(v) for k,v in row.items()},"trend":[{k:serializable(v) for k,v in r.items()} for r in trend.to_dict(orient="records")],"regions":[{k:serializable(v) for k,v in r.items()} for r in regions.to_dict(orient="records")],"filtered_rows":store.count(d.table,where,params)}

@app.post("/api/sql")
def sql(body:SQLBody):
    try:
        frame=store.sql_readonly(body.query,limit=5000)
        return {"columns":list(frame.columns),"rows":[{k:serializable(v) for k,v in r.items()} for r in frame.to_dict(orient="records")]}
    except Exception as exc: raise HTTPException(400,str(exc)) from exc

@app.post("/api/statistics/correlation")
def correlation(body:dict):
    d=current_dataset(); x,y=body.get("x"),body.get("y")
    if not x or not y: raise HTTPException(400,"x and y are required")
    return stats.correlation(store.materialize(d.table),x,y,body.get("method","pearson")).as_row()

@app.post("/api/predict")
def predict(body:dict):
    from groundtruth import ml
    d=current_dataset(); target=body.get("target","revenue"); features=body.get("features")
    if not features:
        spec=profile(store,d.table); features=[c for c in spec.measures+spec.dimensions if c!=target]
    result=ml.train(store.materialize(d.table),target=target,features=features,seed=42)
    leaderboard=ml.leaderboard_frame(result)
    return {"problem_type":result.problem_type,"best_model":result.best_model,"metrics":result.metrics,"baseline_metrics":result.baseline_metrics,"leaderboard":leaderboard.to_dict(orient="records"),"leakage_warnings":result.leakage_warnings}

@app.post("/api/time-series/forecast")
def forecast(body:dict):
    d=current_dataset(); time_column=body.get("time_column","date"); value_column=body.get("value_column","revenue"); grain=body.get("grain","month"); periods=int(body.get("periods",6))
    result=timeseries.forecast(timeseries.aggregate(store.materialize(d.table),time_column,value_column,grain),periods=periods,grain=grain)
    return {"model":result.model,"in_sample_mae":result.in_sample_mae,"history":[{"date":serializable(i),"value":serializable(v)} for i,v in result.history.items()],"forecast":[{"date":serializable(i),"mean":serializable(v),"lower":serializable(result.lower.loc[i]),"upper":serializable(result.upper.loc[i])} for i,v in result.mean.items()]}

@app.post("/api/ai/ask")
def ai_ask(body:AskBody):
    question=body.question.strip()
    if not question: raise HTTPException(400,"Question is required")
    d=current_dataset()
    try:
        from openai import OpenAI
        key=os.getenv("OPENAI_API_KEY","")
        if not key: raise RuntimeError("OPENAI_API_KEY is not configured")
        from groundtruth.agent import ToolBox, ask
        spec=profile(store,d.table); store.create_filtered_view("filtered_view",d.table)
        answer=ask(OpenAI(api_key=key),os.getenv("OPENAI_MODEL","gpt-4o"),question,ToolBox(store,"filtered_view",spec))
        return {"text":answer.text,"queries":answer.queries,"rounds":answer.rounds}
    except Exception:
        return {"text":"The AI Analyst endpoint is connected, but OPENAI_API_KEY is not configured yet. Add it to .env to enable live natural-language analysis.","queries":[],"rounds":0}
load_default()
