"""
Seed the database with 60 days of demo data.

ML models cannot learn from an empty table - run this once before
opening the AI Insights page:

    python seed_data.py
"""

import random
from datetime import datetime, timedelta

from database import SessionLocal, engine, Base
from models import (
    Menu, Order, Customer, Inventory, Review, Supplier,
    Staff, Waste, Reservation,
)
from ml.sentiment import analyze_sentiment

random.seed(42)

MENU = [
    ("Chicken Biryani", "Main Course", 220),
    ("Mutton Biryani", "Main Course", 320),
    ("Paneer Butter Masala", "Main Course", 180),
    ("Veg Fried Rice", "Main Course", 140),
    ("Masala Dosa", "South Indian", 90),
    ("Idli Sambar", "South Indian", 60),
    ("Chicken 65", "Starter", 190),
    ("Gobi Manchurian", "Starter", 150),
    ("Gulab Jamun", "Dessert", 70),
    ("Filter Coffee", "Beverage", 40),
]

CUSTOMERS = [
    "Nithin", "Charan", "Priya", "Arjun", "Meena",
    "Karthik", "Divya", "Rahul",
]

POSITIVE_COMMENTS = [
    "the food was delicious and fresh",
    "excellent service and tasty biryani",
    "loved the ambience and quick service",
    "great experience, highly recommended",
]

NEGATIVE_COMMENTS = [
    "the food was cold and stale",
    "very bad service, waited one hour",
    "overpriced and poor quality",
    "the order was wrong and late",
]

NEUTRAL_COMMENTS = [
    "the food was okay nothing special",
    "average taste, normal service",
    "decent place, ordinary food",
]

WASTE_REASONS = [
    "Expired", "Over-preparation", "Spoiled",
    "Customer return", "Storage damage",
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Menu).count() == 0:
        for name, category, price in MENU:
            db.add(Menu(
                name=name,
                category=category,
                price=price,
                available=True,
            ))
        db.commit()
        print(f"Inserted {len(MENU)} menu items")

    # ---------- Customers ----------
    if db.query(Customer).count() == 0:
        for i, name in enumerate(CUSTOMERS):
            db.add(Customer(
                name=name,
                email=f"{name.lower()}@example.com",
                phone=f"90000000{i:02d}",
                address="Chennai, Tamil Nadu",
                loyalty_points=random.randint(0, 500),
            ))
        db.commit()
        print(f"Inserted {len(CUSTOMERS)} customers")

    # ---------- 60 days of orders ----------
    if db.query(Order).count() == 0:
        count = 0
        for day_offset in range(60, 0, -1):
            order_date = datetime.utcnow() - timedelta(days=day_offset)

            # weekends are busier -> gives the models a real pattern
            base = 12 if order_date.weekday() >= 5 else 7

            for _ in range(random.randint(base - 3, base + 4)):
                name, category, price = random.choice(MENU)
                quantity = random.randint(1, 3)

                db.add(Order(
                    customer_name=random.choice(CUSTOMERS),
                    menu_item=name,
                    quantity=quantity,
                    total_price=price * quantity,
                    status="Completed",
                    created_at=order_date,
                ))
                count += 1

        db.commit()
        print(f"Inserted {count} orders across 60 days")

    # ---------- Inventory ----------
    if db.query(Inventory).count() == 0:
        items = [
            ("Basmati Rice", "Grains", 40, "kg", 15, 95),
            ("Chicken", "Meat", 8, "kg", 10, 220),
            ("Paneer", "Dairy", 5, "kg", 6, 320),
            ("Onion", "Vegetable", 25, "kg", 10, 35),
            ("Tomato", "Vegetable", 4, "kg", 8, 40),
            ("Cooking Oil", "Grocery", 30, "litre", 12, 130),
        ]
        for n, c, q, u, m, cost in items:
            db.add(Inventory(
                item_name=n, category=c, quantity=q, unit=u,
                minimum_stock=m, supplier="Local Vendor",
                cost_per_unit=cost, created_at=datetime.utcnow(),
            ))
        db.commit()
        print(f"Inserted {len(items)} inventory items")

    # ---------- Reviews (auto-classified) ----------
    if db.query(Review).count() == 0:
        pool = (
            POSITIVE_COMMENTS * 5
            + NEUTRAL_COMMENTS * 2
            + NEGATIVE_COMMENTS * 2
        )
        for i, comment in enumerate(pool):
            result = analyze_sentiment(comment)
            db.add(Review(
                customer_name=random.choice(CUSTOMERS),
                menu_item=random.choice(MENU)[0],
                rating=(
                    5 if result["sentiment"] == "Positive"
                    else 2 if result["sentiment"] == "Negative"
                    else 3
                ),
                comment=comment,
                sentiment=result["sentiment"],
                sentiment_score=result["score"],
                created_at=datetime.utcnow() - timedelta(days=i),
            ))
        db.commit()
        print(f"Inserted {len(pool)} reviews")

    # ---------- Waste records ----------
    if db.query(Waste).count() == 0:
        count = 0
        for day_offset in range(30, 0, -1):
            record_date = datetime.utcnow() - timedelta(days=day_offset)

            for _ in range(random.randint(1, 3)):
                item, _c, _q, _u, _m, cost = random.choice([
                    ("Chicken", "", 0, "", 0, 220),
                    ("Tomato", "", 0, "", 0, 40),
                    ("Paneer", "", 0, "", 0, 320),
                    ("Basmati Rice", "", 0, "", 0, 95),
                ])
                quantity = round(random.uniform(0.3, 3.0), 2)

                db.add(Waste(
                    item_name=item,
                    quantity=quantity,
                    unit="kg",
                    reason=random.choice(WASTE_REASONS),
                    cost=round(quantity * cost, 2),
                    recorded_at=record_date,
                ))
                count += 1

        db.commit()
        print(f"Inserted {count} waste records")

    # ---------- Suppliers & staff ----------
    if db.query(Supplier).count() == 0:
        for name, category in [
            ("Sri Vegetables", "Vegetable"),
            ("Anand Meat Supply", "Meat"),
            ("Krishna Dairy", "Dairy"),
        ]:
            db.add(Supplier(
                name=name,
                contact_person="Manager",
                phone="9876543210",
                email=f"{name.split()[0].lower()}@supply.com",
                category=category,
                address="Chennai",
            ))
        db.commit()
        print("Inserted suppliers")

    if db.query(Staff).count() == 0:
        for name, role, shift, salary in [
            ("Ramesh", "Head Chef", "Morning", 35000),
            ("Suresh", "Chef", "Evening", 25000),
            ("Lakshmi", "Waiter", "Morning", 15000),
            ("Vijay", "Cashier", "Evening", 18000),
        ]:
            db.add(Staff(
                name=name, role=role, phone="9000000000",
                email=f"{name.lower()}@restaurant.com",
                shift=shift, salary=salary, active=True,
                joined_on=datetime.utcnow().date(),
            ))
        db.commit()
        print("Inserted staff")

    db.close()
    print("\nSeeding complete. Start the server with: uvicorn main:app --reload")


if __name__ == "__main__":
    seed()