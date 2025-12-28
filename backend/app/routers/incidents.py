import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import require_role
from ..db import SessionLocal
from ..models import Incident, IncidentNote, Severity, Status
from ..schemas import IncidentCreate, IncidentOut, IncidentUpdate
from ..services.dedupe import find_possible_duplicate, haversine_distance_m
from ..websocket import push

router = APIRouter(prefix="/incidents", tags=["incidents"])


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


@router.post("", response_model=IncidentOut)
async def create_incident(payload: IncidentCreate, db: AsyncSession = Depends(get_db)) -> IncidentOut:
    duplicate_id = await find_possible_duplicate(
        db,
        incident_type=payload.type,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )

    incident = Incident(
        type=payload.type,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        media_url=payload.media_url,
        severity=payload.severity,
        status=Status.reported,
        is_verified=False,
        possible_duplicate_of=duplicate_id,
    )
    db.add(incident)
    await db.commit()
    await db.refresh(incident)

    incident_out = IncidentOut(
        id=incident.id,
        type=incident.type,
        description=incident.description,
        latitude=incident.latitude,
        longitude=incident.longitude,
        media_url=incident.media_url,
        severity=incident.severity,
        status=incident.status,
        is_verified=incident.is_verified,
        possible_duplicate_of=incident.possible_duplicate_of,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
        notes=[],
    )
    await push("incident_created", incident_out.model_dump())
    return incident_out


@router.get("", response_model=list[IncidentOut])
async def list_incidents(
    type: str | None = Query(default=None, description="Filter by incident type"),
    origin_lat: float | None = Query(default=None, description="Latitude for distance filter"),
    origin_lng: float | None = Query(default=None, description="Longitude for distance filter"),
    radius_m: float | None = Query(default=None, description="Radius in meters"),
    since_minutes: int | None = Query(default=None, description="Lookback window in minutes"),
    db: AsyncSession = Depends(get_db),
) -> list[IncidentOut]:
    stmt = select(Incident).order_by(Incident.created_at.desc())
    if type:
        stmt = stmt.where(Incident.type == type)
    if since_minutes:
        window_start = datetime.now(timezone.utc) - timedelta(minutes=since_minutes)
        stmt = stmt.where(Incident.created_at >= window_start)

    results = (await db.execute(stmt)).scalars().all()

    # Apply radius filter in Python for simplicity during hackathon
    filtered = []
    for item in results:
        if radius_m is not None and origin_lat is not None and origin_lng is not None:
            distance = haversine_distance_m(origin_lat, origin_lng, float(item.latitude), float(item.longitude))
            if distance > radius_m:
                continue
        filtered.append(item)

    return [
        IncidentOut(
            id=i.id,
            type=i.type,
            description=i.description,
            latitude=i.latitude,
            longitude=i.longitude,
            media_url=i.media_url,
            severity=i.severity,
            status=i.status,
            is_verified=i.is_verified,
            possible_duplicate_of=i.possible_duplicate_of,
            created_at=i.created_at,
            updated_at=i.updated_at,
            notes=[],
        )
        for i in filtered
    ]


@router.patch("/{incident_id}", response_model=IncidentOut)
async def update_incident(
    incident_id: uuid.UUID,
    payload: IncidentUpdate,
    db: AsyncSession = Depends(get_db),
    _: Any = Depends(require_role(["admin", "responder"])),
) -> IncidentOut:
    incident = await db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if payload.status:
        incident.status = payload.status
    if payload.severity:
        incident.severity = payload.severity
    if payload.is_verified is not None:
        incident.is_verified = payload.is_verified

    if payload.note and payload.author:
        note = IncidentNote(incident_id=incident.id, note=payload.note, author=payload.author)
        db.add(note)

    await db.commit()
    await db.refresh(incident)

    incident_out = IncidentOut(
        id=incident.id,
        type=incident.type,
        description=incident.description,
        latitude=incident.latitude,
        longitude=incident.longitude,
        media_url=incident.media_url,
        severity=incident.severity,
        status=incident.status,
        is_verified=incident.is_verified,
        possible_duplicate_of=incident.possible_duplicate_of,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
        notes=[],
    )
    await push("incident_updated", incident_out.model_dump())
    return incident_out
