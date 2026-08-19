#!/bin/zsh
cd "$(dirname "$0")"
source .venv/bin/activate 2>/dev/null || true
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
