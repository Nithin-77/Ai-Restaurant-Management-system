from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from crud import (
    get_total_revenue,
    get_total_orders,
    get_total_customers,
    get_total_reservations,
    get_low_stock_items,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Insights"]
)


# =========================================================
# AI RESTAURANT INSIGHTS
# =========================================================

@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db)
):

    revenue = get_total_revenue(db)

    orders = get_total_orders(db)

    customers = get_total_customers(db)

    reservations = get_total_reservations(db)

    low_stock = get_low_stock_items(db)


    insights = []


    # Revenue insight

    if revenue > 0:

        insights.append(
            f"Restaurant revenue is currently ₹{revenue:.2f}."
        )

    else:

        insights.append(
            "No revenue has been recorded yet."
        )


    # Orders insight

    if orders > 0:

        average = revenue / orders

        insights.append(
            f"Average order value is ₹{average:.2f}."
        )

    else:

        insights.append(
            "No orders have been recorded yet."
        )


    # Customer insight

    if customers > 0:

        insights.append(
            f"The restaurant currently has {customers} customers."
        )

    else:

        insights.append(
            "No customers have been registered yet."
        )


    # Reservation insight

    if reservations > 0:

        insights.append(
            f"There are {reservations} table reservations."
        )

    else:

        insights.append(
            "There are currently no reservations."
        )


    # Inventory insight

    if len(low_stock) > 0:

        insights.append(
            f"{len(low_stock)} inventory items are at or below minimum stock."
        )

    else:

        insights.append(
            "Inventory levels are currently healthy."
        )


    return {
        "revenue": revenue,
        "orders": orders,
        "customers": customers,
        "reservations": reservations,
        "low_stock_count": len(low_stock),
        "insights": insights,
    }