# GeoInsight Backend

This backend provides a FastAPI service exposing geospatial indicators for a district and month.

Quick start (development):

1. Create a virtualenv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. (Optional) Place precomputed results under `data/precomputed/{district}_{YYYY-MM}.json`.

3. Run the app:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Request the API:

```bash
curl 'http://localhost:8000/api/v1/environment?district=kamrup&month=2026-06'
```

Docker compose (includes Postgres):

```bash
docker compose up --build
```

Notes:
- The project contains a scaffolding for geospatial processing in `app/geo_processing.py`.
- To run real processing, install the geospatial dependencies and place datasets in `backend/data/`.
