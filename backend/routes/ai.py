"""
AI / ML endpoints.

One endpoint per AI component from the presentation:
  1. /ai/recommend/{customer_name}   Food Recommendation
  2. /ai/sentiment  +  /ai/sentiment/summary   Sentiment Analysis
  3. /ai/demand-forecast             Demand Prediction
  4. /ai/revenue-forecast            Revenue Prediction
  5. /ai/waste-analysis              Waste Analysis
  6. /ai/dynamic-pricing             Dynamic Pricing
  7. /ai/insights                    Combined dashboard summary
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

try:
    from database import get_db
except (ImportError, ValueError):
    from ..database import get_db
from models import Menu, Order, Review, Waste, Inventory
from schemas import SentimentRequest

from crud import (
    get_total_revenue,
    get_total_orders,
    get_total_customers,
    get_total_reservations,
    get_low_stock_items,
)

from ml.recommender import recommend_for_customer, popular_dishes
from ml.sentiment import analyze_sentiment, summarize_reviews
from ml.forecasting import predict_demand, predict_revenue
from ml.waste import analyze_waste
from ml.pricing import suggest_prices

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning"])


# =========================================================
# 1. FOOD RECOMMENDATION
# =========================================================

@router.get("/recommend/{customer_name}")
def food_recommendation(
    customer_name: str,
    top_n: int = 5,
    db: Session = Depends(get_db),
):
    return recommend_for_customer(
        customer_name=customer_name,
        menu_items=db.query(Menu).all(),
        orders=db.query(Order).all(),
        top_n=top_n,
    )


@router.get("/popular-dishes")
def trending_dishes(top_n: int = 5, db: Session = Depends(get_db)):
    return {
        "popular_dishes": popular_dishes(db.query(Order).all(), top_n)
    }


# =========================================================
# 2. SENTIMENT ANALYSIS
# =========================================================

@router.post("/sentiment")
def classify_text(data: SentimentRequest):
    """Classify any free-text review without storing it."""
    return analyze_sentiment(data.text)


@router.get("/sentiment/summary")
def sentiment_summary(db: Session = Depends(get_db)):
    return summarize_reviews(db.query(Review).all())


# =========================================================
# 3. DEMAND PREDICTION
# =========================================================

@router.get("/demand-forecast")
def demand_forecast(
    days_ahead: int = 7,
    top_n: int = 5,
    db: Session = Depends(get_db),
):
    return predict_demand(
        db.query(Order).all(),
        days_ahead=days_ahead,
        top_n=top_n,
    )


# =========================================================
# 4. REVENUE PREDICTION
# =========================================================

@router.get("/revenue-forecast")
def revenue_forecast(
    days_ahead: int = 7,
    db: Session = Depends(get_db),
):
    return predict_revenue(
        db.query(Order).all(),
        days_ahead=days_ahead,
    )


# =========================================================
# 5. WASTE ANALYSIS
# =========================================================

@router.get("/waste-analysis")
def ai_waste_analysis(db: Session = Depends(get_db)):
    return analyze_waste(
        db.query(Waste).all(),
        db.query(Order).all(),
    )


# =========================================================
# 6. DYNAMIC PRICING
# =========================================================

@router.get("/dynamic-pricing")
def dynamic_pricing(db: Session = Depends(get_db)):
    return suggest_prices(
        menu_items=db.query(Menu).all(),
        orders=db.query(Order).all(),
        inventory=db.query(Inventory).all(),
    )


# =========================================================
# 7. COMBINED INSIGHTS  (admin dashboard)
# =========================================================

@router.get("/insights")
def get_ai_insights(db: Session = Depends(get_db)):
    orders = db.query(Order).all()

    revenue = get_total_revenue(db)
    order_count = get_total_orders(db)
    customers = get_total_customers(db)
    reservations = get_total_reservations(db)
    low_stock = get_low_stock_items(db)

    sentiment = summarize_reviews(db.query(Review).all())
    forecast = predict_revenue(orders, days_ahead=7)
    demand = predict_demand(orders, days_ahead=7, top_n=3)
    waste = analyze_waste(db.query(Waste).all(), orders)

    insights = []

    if order_count > 0:
        insights.append(
            f"Average order value is ₹{revenue / order_count:.2f} "
            f"across {order_count} orders."
        )
    else:
        insights.append("No orders have been recorded yet.")

    insights.append(
        f"Predicted revenue for the next 7 days is "
        f"₹{forecast.get('predicted_total_revenue', 0):.2f}. "
        f"{forecast.get('outlook', '')}"
    )

    if demand.get("forecast"):
        top = demand["forecast"][0]
        insights.append(
            f"'{top['menu_item']}' shows a {top['trend']} demand trend "
            f"- about {top['predicted_total']:.0f} units expected "
            f"this week."
        )

    if sentiment["total_reviews"] > 0:
        insights.append(
            f"{sentiment['positive_percentage']}% of "
            f"{sentiment['total_reviews']} reviews are positive. "
            f"{sentiment['overall']}."
        )
    else:
        insights.append("No customer reviews collected yet.")

    if waste.get("total_waste_quantity", 0) > 0:
        insights.append(
            f"Recorded food waste costs ₹"
            f"{waste['total_waste_cost']:.2f}; about "
            f"{waste['predicted_next_week_quantity']:.1f} units are "
            f"predicted for next week."
        )

    if low_stock:
        insights.append(
            f"{len(low_stock)} inventory items are at or below "
            f"minimum stock and need reordering."
        )
    else:
        insights.append("Inventory levels are currently healthy.")

    return {
        "revenue": revenue,
        "orders": order_count,
        "customers": customers,
        "reservations": reservations,
        "low_stock_count": len(low_stock),
        "sentiment": sentiment,
        "revenue_forecast": forecast,
        "demand_forecast": demand,
        "waste": waste,
        "insights": insights,
    }