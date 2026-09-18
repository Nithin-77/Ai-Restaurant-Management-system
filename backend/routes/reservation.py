from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from crud import (
    get_all_reservations,
    create_reservation,
    update_reservation,
    delete_reservation,
)

from schemas import ReservationCreate


router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)


# =========================
# GET ALL RESERVATIONS
# =========================

@router.get("/")
def read_reservations(
    db: Session = Depends(get_db)
):
    return get_all_reservations(db)


# =========================
# CREATE RESERVATION
# =========================

@router.post("/")
def add_reservation(
    item: ReservationCreate,
    db: Session = Depends(get_db)
):
    return create_reservation(db, item)


# =========================
# UPDATE RESERVATION
# =========================

@router.put("/{reservation_id}")
def edit_reservation(
    reservation_id: int,
    item: ReservationCreate,
    db: Session = Depends(get_db)
):

    reservation = update_reservation(
        db,
        reservation_id,
        item
    )

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    return reservation


# =========================
# DELETE RESERVATION
# =========================

@router.delete("/{reservation_id}")
def remove_reservation(
    reservation_id: int,
    db: Session = Depends(get_db)
):

    reservation = delete_reservation(
        db,
        reservation_id
    )

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    return {
        "message": "Reservation deleted successfully"
    }