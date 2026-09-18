from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from crud import (
    get_settings,
    create_settings,
    update_settings,
)

from schemas import (
    SettingsCreate,
    SettingsUpdate,
)


router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


# =========================================================
# GET SETTINGS
# =========================================================

@router.get("/")
def read_settings(
    db: Session = Depends(get_db)
):

    settings = get_settings(db)

    if not settings:

        return {
            "message": "Settings not configured"
        }

    return settings


# =========================================================
# CREATE SETTINGS
# =========================================================

@router.post("/")
def add_settings(
    item: SettingsCreate,
    db: Session = Depends(get_db)
):

    existing = get_settings(db)

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Settings already exist"
        )

    return create_settings(
        db,
        item
    )


# =========================================================
# UPDATE SETTINGS
# =========================================================

@router.put("/{settings_id}")
def edit_settings(
    settings_id: int,
    item: SettingsUpdate,
    db: Session = Depends(get_db)
):

    settings = update_settings(
        db,
        settings_id,
        item
    )

    if not settings:

        raise HTTPException(
            status_code=404,
            detail="Settings not found"
        )

    return settings