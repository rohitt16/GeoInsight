from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from . import crud, schemas
from .database import SessionLocal, init_db
from .geo_processing import compute_indicators, load_precomputed
from .config import settings
import os
import json


app = FastAPI(title="GeoInsight Backend")


# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup():
    init_db()


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/districts")
def list_districts():
    # For hackathon, return the single district supported
    return {"districts": ["Kamrup"]}


@app.get("/api/v1/districts/{district}/boundary")
def district_boundary(district: str):
    # Serve a GeoJSON boundary file if present
    fname = f"{district.lower()}_boundary.geojson"
    path = os.path.join(settings.DATA_DIR, "boundaries", fname)
    if os.path.exists(path):
        return FileResponse(path, media_type="application/geo+json")
    raise HTTPException(status_code=404, detail="Boundary not found")


@app.get("/api/v1/layers/{district}/{month}/{layer}")
def layer_geojson(district: str, month: str, layer: str):
    # layer: ndvi | surface_water | rainfall
    fname = f"{district.lower()}_{month}_{layer}.geojson"
    path = os.path.join(settings.DATA_DIR, "layers", fname)
    if os.path.exists(path):
        return FileResponse(path, media_type="application/geo+json")
    raise HTTPException(status_code=404, detail="Layer not found")


@app.get("/api/v1/environment", response_model=schemas.EnvironmentResponse)
def get_environment(district: str, month: str, db: Session = Depends(get_db)):
    district_norm = district.strip().lower()
    month_norm = month.strip()

    # Check cache
    cached = crud.get_result(db, district_norm, month_norm)
    if cached:
        return {
            "district": cached.district,
            "month": cached.month,
            "vegetation": {"average_ndvi": cached.average_ndvi},
            "rainfall": {"value_mm": cached.rainfall_mm},
            "surface_water": {
                "coverage_percent": cached.water_coverage_percent,
                "area_km2": cached.water_area_km2,
            },
        }

    # Compute indicators (scaffolded)
    try:
        data = compute_indicators(district_norm, month_norm)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {e}")

    result = crud.create_result(db, district_norm, month_norm, data)

    response = {
        "district": result.district,
        "month": result.month,
        "vegetation": {"average_ndvi": result.average_ndvi},
        "rainfall": {"value_mm": result.rainfall_mm},
        "surface_water": {
            "coverage_percent": result.water_coverage_percent,
            "area_km2": result.water_area_km2,
        },
    }

    return JSONResponse(response)
