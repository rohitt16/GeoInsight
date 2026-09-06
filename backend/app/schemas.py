from pydantic import BaseModel
from typing import Optional


class SurfaceWater(BaseModel):
    coverage_percent: float
    area_km2: float


class Vegetation(BaseModel):
    average_ndvi: float


class Rainfall(BaseModel):
    value_mm: float


class EnvironmentResponse(BaseModel):
    district: str
    month: str
    vegetation: Vegetation
    rainfall: Rainfall
    surface_water: SurfaceWater

    class Config:
        orm_mode = True
