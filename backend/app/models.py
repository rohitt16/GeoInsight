from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .database import Base


class EnvironmentResult(Base):
    __tablename__ = "environment_results"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    month = Column(String, index=True)
    average_ndvi = Column(Float)
    rainfall_mm = Column(Float)
    water_coverage_percent = Column(Float)
    water_area_km2 = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
