import math
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Incident


EARTH_RADIUS_M = 6371000.0


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return EARTH_RADIUS_M * c


async def find_possible_duplicate(
    db: AsyncSession,
    *,
    incident_type: str,
    latitude: float,
    longitude: float,
    lookback_minutes: int = 10,
    radius_m: float = 200.0,
) -> Optional[UUID]:
    window_start = datetime.now(timezone.utc) - timedelta(minutes=lookback_minutes)

    stmt = (
        select(Incident)
        .where(
            and_(
                Incident.type == incident_type,
                Incident.created_at >= window_start,
            )
        )
        .order_by(Incident.created_at.desc())
    )
    rows = (await db.execute(stmt)).scalars().all()

    closest_id: Optional[UUID] = None
    closest_distance = radius_m

    for row in rows:
        dist = haversine_distance_m(latitude, longitude, float(row.latitude), float(row.longitude))
        if dist <= radius_m and dist <= closest_distance:
            closest_distance = dist
            closest_id = row.id

    return closest_id
