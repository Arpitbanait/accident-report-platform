import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, UploadFile

from ..config import get_settings

router = APIRouter(prefix="/media", tags=["media"])
settings = get_settings()
media_dir = Path(settings.media_dir)
media_dir.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> dict[str, str]:
    ext = Path(file.filename).suffix or ""
    fname = f"{uuid.uuid4()}{ext}"
    dest = media_dir / fname

    contents = await file.read()
    with open(dest, "wb") as f:
        f.write(contents)

    url = f"{settings.media_base_url}/{fname}"
    return {"url": url}
