from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

try:
    from database import get_db
except (ImportError, ValueError):
    from ..database import get_db

from crud import (
    get_total_revenue,
    get_total_orders,
    get_total_customers,
    get_total_reservations,
    get_total_menu_items,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================================================
# OVERALL ANALYTICS
# =========================================================

@router.get("/")
def read_analytics(
    db: Session = Depends(get_db)
):

    total_revenue = get_total_revenue(db)

    total_orders = get_total_orders(db)

    total_customers = get_total_customers(db)

    total_reservations = get_total_reservations(db)

    total_menu_items = get_total_menu_items(db)


    average_order_value = 0

    if total_orders > 0:
        average_order_value = (
            total_revenue / total_orders
        )


    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_reservations": total_reservations,
        "total_menu_items": total_menu_items,
        "average_order_value": average_order_value,
    }