import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from pydantic import ConfigDict

from .models import Severity, Status


class IncidentBase(BaseModel):
    type: str
    description: str
    latitude: float
    longitude: float
    media_url: Optional[str] = None
    severity: Severity = Severity.medium


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    status: Optional[Status] = None
    severity: Optional[Severity] = None
    is_verified: Optional[bool] = None
    note: Optional[str] = Field(default=None, description="Optional internal note")
    author: Optional[str] = Field(default=None, description="Note author")


class IncidentNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    note: str
    author: str
    created_at: datetime


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    description: str
    latitude: float
    longitude: float
    media_url: Optional[str]
    severity: Severity
    status: Status
    is_verified: bool
    possible_duplicate_of: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    notes: list[IncidentNoteOut] = []


class IncidentFilter(BaseModel):
    type: Optional[str] = None
    radius_m: Optional[float] = Field(default=None, description="Search radius in meters")
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    since_minutes: Optional[int] = Field(default=None, description="Lookback window in minutes")
