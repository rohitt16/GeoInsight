from sqlalchemy.orm import Session
from . import models


def get_result(session: Session, district: str, month: str):
    return (
        session.query(models.EnvironmentResult)
        .filter(models.EnvironmentResult.district == district)
        .filter(models.EnvironmentResult.month == month)
        .first()
    )


def create_result(session: Session, district: str, month: str, data: dict):
    r = models.EnvironmentResult(
        district=district,
        month=month,
        average_ndvi=data.get("average_ndvi"),
        rainfall_mm=data.get("rainfall_mm"),
        water_coverage_percent=data.get("water_coverage_percent"),
        water_area_km2=data.get("water_area_km2"),
    )
    session.add(r)
    session.commit()
    session.refresh(r)
    return r
