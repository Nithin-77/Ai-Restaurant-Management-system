from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
    from middleware.auth import require_admin
except (ImportError, ValueError):
    from ..database import get_db
    from ..middleware.auth import require_admin

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
# PUBLIC SETTINGS
# Read-only, no authentication required. Only safe, display-facing
# fields are returned - nothing secret, nothing the browser should not
# see. Customers use this for currency formatting and tax display.
# =========================================================

@router.get("/public")
def read_public_settings(
    db: Session = Depends(get_db),
):

    settings = get_settings(db)

    if not settings:
        return {
            "currency": "INR",
            "tax_percentage": 5.0,
            "service_charge_percentage": 0.0,
        }

    return {
        "id": settings.id,
        "restaurant_name": settings.restaurant_name,
        "currency": settings.currency,
        "tax_percentage": settings.tax_percentage,
        "service_charge_percentage": settings.service_charge_percentage,
        "opening_time": settings.opening_time,
        "closing_time": settings.closing_time,
        "notifications_enabled": settings.notifications_enabled,
        "ai_enabled": settings.ai_enabled,
    }


# =========================================================
# GET SETTINGS (admin)
# Full settings row - admin only. Contains contact details that are
# not secret but are not part of the public contract either.
# =========================================================

@router.get("/")
def read_settings(
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
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
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
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
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
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