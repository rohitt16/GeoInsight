import json
import os
from typing import Dict
from .config import settings


def load_precomputed(district: str, month: str) -> Dict:
    """Load a precomputed JSON result from data/precomputed if present."""
    data_dir = settings.DATA_DIR
    fname = f"{district.lower()}_{month}.json"
    path = os.path.join(data_dir, "precomputed", fname)
    if os.path.exists(path):
        with open(path, "r") as fh:
            return json.load(fh)
    return {}


def compute_indicators(district: str, month: str) -> Dict:
    """Compute NDVI, rainfall, and water coverage.

    This function contains simple scaffolding for real geospatial processing.
    If heavy geospatial libs are available and data are placed under `data/`, the
    implementation can be extended to perform real calculations.
    For the hackathon delivery we support precomputed JSON placed in `data/precomputed/`.
    """
    # Try precomputed first
    pre = load_precomputed(district, month)
    if pre:
        return {
            "average_ndvi": pre.get("vegetation", {}).get("average_ndvi"),
            "rainfall_mm": pre.get("rainfall", {}).get("value_mm"),
            "water_coverage_percent": pre.get("surface_water", {}).get("coverage_percent"),
            "water_area_km2": pre.get("surface_water", {}).get("area_km2"),
        }

    # Fallback: return simple dummy values and note that processing is not available
    # Real implementation would use rasterio, geopandas, xarray, rioxarray, etc.
    return {
        "average_ndvi": 0.0,
        "rainfall_mm": 0.0,
        "water_coverage_percent": 0.0,
        "water_area_km2": 0.0,
    }
