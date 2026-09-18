from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Menu, Order, Reservation, User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):

    total_menu_items = db.query(Menu).count()
    total_orders = db.query(Order).count()
    total_reservations = db.query(Reservation).count()
    total_users = db.query(User).count()

    total_revenue = db.query(
        func.sum(Order.total_price)
    ).scalar() or 0

    return {
        "total_menu_items": total_menu_items,
        "total_orders": total_orders,
        "total_reservations": total_reservations,
        "total_users": total_users,
        "total_revenue": float(total_revenue)
    }