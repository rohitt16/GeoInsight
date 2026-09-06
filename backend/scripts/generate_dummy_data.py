#!/usr/bin/env python3
import os
import json
import random
from datetime import datetime, timedelta

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT, "data")
PRE_DIR = os.path.join(DATA_DIR, "precomputed")
LAYERS_DIR = os.path.join(DATA_DIR, "layers")
BOUND_DIR = os.path.join(DATA_DIR, "boundaries")

os.makedirs(PRE_DIR, exist_ok=True)
os.makedirs(LAYERS_DIR, exist_ok=True)
os.makedirs(BOUND_DIR, exist_ok=True)

def gen_months(start_month, end_month):
    cur = datetime.strptime(start_month, "%Y-%m")
    end = datetime.strptime(end_month, "%Y-%m")
    months = []
    while cur <= end:
        months.append(cur.strftime("%Y-%m"))
        # next month
        if cur.month == 12:
            cur = cur.replace(year=cur.year+1, month=1)
        else:
            cur = cur.replace(month=cur.month+1)
    return months


def make_precomputed(district, month, ndvi_base=0.5, rain_base=300, water_pct=3.0):
    # add some random variation
    ndvi = round(ndvi_base + random.uniform(-0.1, 0.1), 2)
    rain = int(max(0, rain_base + random.uniform(-100, 200)))
    water_pct_v = round(max(0.0, water_pct + random.uniform(-2.0, 2.0)), 2)
    area_km2 = round( (water_pct_v/100.0) * 792.0, 2)  # assume district area ~792 km2

    obj = {
        "district": district.title(),
        "month": month,
        "vegetation": {"average_ndvi": ndvi},
        "rainfall": {"value_mm": rain},
        "surface_water": {"coverage_percent": water_pct_v, "area_km2": area_km2},
    }
    fname = f"{district.lower()}_{month}.json"
    with open(os.path.join(PRE_DIR, fname), "w") as fh:
        json.dump(obj, fh, indent=2)


def make_layer_geojson(district, month):
    ndvi_geo = {
        "type": "FeatureCollection",
        "features": [
            {"type":"Feature","properties":{"ndvi": round(random.uniform(0.2,0.8),2)},"geometry":{"type":"Point","coordinates":[91.5 + random.uniform(-0.05,0.05), 26.1 + random.uniform(-0.05,0.05)]}}
            for _ in range(6)
        ]
    }
    sw_geo = {
        "type": "FeatureCollection",
        "features": [
            {"type":"Feature","properties":{"water":1},"geometry":{"type":"Point","coordinates":[91.5 + random.uniform(-0.06,0.06), 26.1 + random.uniform(-0.06,0.06)]}}
            for _ in range(4)
        ]
    }
    with open(os.path.join(LAYERS_DIR, f"{district.lower()}_{month}_ndvi.geojson"), "w") as fh:
        json.dump(ndvi_geo, fh)
    with open(os.path.join(LAYERS_DIR, f"{district.lower()}_{month}_surface_water.geojson"), "w") as fh:
        json.dump(sw_geo, fh)


def make_boundary(district):
    # simple square polygon used for demo only
    geo = {
        "type": "FeatureCollection",
        "features": [
            {"type":"Feature","properties":{"name":district.title()},"geometry":{"type":"Polygon","coordinates":[[[91.4,26.0],[91.7,26.0],[91.7,26.3],[91.4,26.3],[91.4,26.0]]]}}
        ]
    }
    with open(os.path.join(BOUND_DIR, f"{district.lower()}_boundary.geojson"), "w") as fh:
        json.dump(geo, fh)


if __name__ == "__main__":
    district = "kamrup"
    months = gen_months("2025-01", "2026-12")
    for m in months:
        make_precomputed(district, m)
        make_layer_geojson(district, m)
    make_boundary(district)
    print(f"Generated {len(months)} precomputed JSON files and layers for {district} in {PRE_DIR}")
