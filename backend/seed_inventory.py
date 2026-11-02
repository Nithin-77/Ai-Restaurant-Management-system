"""Seed the inventory table with comprehensive ingredients for recipe costing.

Each ingredient has a cost_per_unit that can be used to calculate
the ingredient cost of each menu item.

Run with:
    python seed_inventory.py
"""

import random
from datetime import datetime

from database import SessionLocal
from models import Inventory


# (item_name, category, quantity, unit, minimum_stock, supplier, cost_per_unit)
INVENTORY_ITEMS = [
    # Grains & Rice
    ("Basmati Rice", "Grains", 50, "kg", 10, "Premium Grains Co.", 95.00),
    ("Sona Masoori Rice", "Grains", 30, "kg", 8, "Premium Grains Co.", 55.00),
    ("Wheat Flour (Atta)", "Grains", 40, "kg", 10, "Local Mill", 35.00),
    ("Maida (Refined Flour)", "Grains", 20, "kg", 5, "Local Mill", 30.00),
    ("Semolina (Suji)", "Grains", 15, "kg", 3, "Local Mill", 40.00),
    ("Rice Flour", "Grains", 10, "kg", 2, "Local Mill", 45.00),
    ("Gram Flour (Besan)", "Grains", 15, "kg", 3, "Local Mill", 85.00),

    # Lentils & Pulses
    ("Toor Dal", "Pulses", 25, "kg", 5, "Dal Traders", 120.00),
    ("Moong Dal", "Pulses", 20, "kg", 5, "Dal Traders", 110.00),
    ("Chana Dal", "Pulses", 15, "kg", 3, "Dal Traders", 95.00),
    ("Urad Dal", "Pulses", 10, "kg", 2, "Dal Traders", 130.00),
    ("Masoor Dal", "Pulses", 15, "kg", 3, "Dal Traders", 90.00),
    ("Rajma (Kidney Beans)", "Pulses", 12, "kg", 3, "Dal Traders", 140.00),
    ("Chole (Chickpeas)", "Pulses", 15, "kg", 3, "Dal Traders", 100.00),
    ("Black Urad Dal (Whole)", "Pulses", 8, "kg", 2, "Dal Traders", 150.00),

    # Vegetables
    ("Onion", "Vegetables", 40, "kg", 10, "Fresh Veggies Ltd.", 35.00),
    ("Tomato", "Vegetables", 30, "kg", 8, "Fresh Veggies Ltd.", 40.00),
    ("Potato", "Vegetables", 50, "kg", 10, "Fresh Veggies Ltd.", 25.00),
    ("Cauliflower", "Vegetables", 15, "kg", 3, "Fresh Veggies Ltd.", 50.00),
    ("Spinach (Palak)", "Vegetables", 10, "kg", 2, "Fresh Veggies Ltd.", 45.00),
    ("Green Peas", "Vegetables", 10, "kg", 2, "Fresh Veggies Ltd.", 80.00),
    ("Carrot", "Vegetables", 15, "kg", 3, "Fresh Veggies Ltd.", 40.00),
    ("Bell Pepper (Capsicum)", "Vegetables", 12, "kg", 2, "Fresh Veggies Ltd.", 90.00),
    ("Green Beans", "Vegetables", 10, "kg", 2, "Fresh Veggies Ltd.", 70.00),
    ("Okra (Bhindi)", "Vegetables", 8, "kg", 2, "Fresh Veggies Ltd.", 60.00),
    ("Eggplant (Brinjal)", "Vegetables", 10, "kg", 2, "Fresh Veggies Ltd.", 45.00),
    ("Bottle Gourd (Lauki)", "Vegetables", 10, "kg", 2, "Fresh Veggies Ltd.", 35.00),
    ("Bitter Gourd (Karela)", "Vegetables", 5, "kg", 1, "Fresh Veggies Ltd.", 70.00),
    ("Cabbage", "Vegetables", 12, "kg", 3, "Fresh Veggies Ltd.", 30.00),
    ("Mushroom (Button)", "Vegetables", 8, "kg", 2, "Mushroom Farm", 180.00),
    ("Ginger", "Vegetables", 5, "kg", 1, "Fresh Veggies Ltd.", 120.00),
    ("Garlic", "Vegetables", 5, "kg", 1, "Fresh Veggies Ltd.", 150.00),
    ("Green Chilli", "Vegetables", 3, "kg", 1, "Fresh Veggies Ltd.", 80.00),
    ("Coriander Leaves", "Vegetables", 2, "kg", 0.5, "Fresh Veggies Ltd.", 60.00),
    ("Mint Leaves", "Vegetables", 1, "kg", 0.2, "Fresh Veggies Ltd.", 100.00),
    ("Curry Leaves", "Vegetables", 1, "kg", 0.2, "Fresh Veggies Ltd.", 120.00),
    ("Spring Onion", "Vegetables", 3, "kg", 1, "Fresh Veggies Ltd.", 70.00),
    ("Lemon", "Vegetables", 5, "kg", 1, "Fresh Veggies Ltd.", 60.00),

    # Dairy
    ("Paneer", "Dairy", 10, "kg", 2, "Krishna Dairy", 320.00),
    ("Full Cream Milk", "Dairy", 50, "litre", 10, "Krishna Dairy", 55.00),
    ("Heavy Cream", "Dairy", 10, "litre", 2, "Krishna Dairy", 280.00),
    ("Curd (Yoghurt)", "Dairy", 20, "kg", 5, "Krishna Dairy", 65.00),
    ("Butter", "Dairy", 5, "kg", 1, "Krishna Dairy", 450.00),
    ("Ghee", "Dairy", 5, "kg", 1, "Krishna Dairy", 550.00),
    ("Khoa (Mawa)", "Dairy", 5, "kg", 1, "Krishna Dairy", 380.00),
    ("Cheese (Processed)", "Dairy", 3, "kg", 1, "Krishna Dairy", 380.00),

    # Meat & Seafood
    ("Chicken (Boneless)", "Meat", 20, "kg", 5, "Anand Meat Supply", 220.00),
    ("Chicken (Bone-in)", "Meat", 15, "kg", 3, "Anand Meat Supply", 180.00),
    ("Mutton (Goat)", "Meat", 10, "kg", 2, "Anand Meat Supply", 650.00),
    ("Fish (Basa/Seer)", "Seafood", 8, "kg", 2, "Coastal Seafood", 350.00),
    ("Prawns (Medium)", "Seafood", 5, "kg", 1, "Coastal Seafood", 550.00),
    ("Eggs", "Meat", 50, "dozen", 10, "Local Poultry", 85.00),

    # Oils & Fats
    ("Sunflower Oil", "Oils", 30, "litre", 8, "Oil Distributors", 130.00),
    ("Mustard Oil", "Oils", 15, "litre", 3, "Oil Distributors", 140.00),
    ("Coconut Oil", "Oils", 10, "litre", 2, "Oil Distributors", 180.00),
    ("Gingelly Oil", "Oils", 5, "litre", 1, "Oil Distributors", 200.00),

    # Spices & Masalas
    ("Turmeric Powder", "Spices", 3, "kg", 0.5, "Spice Traders", 180.00),
    ("Red Chilli Powder", "Spices", 3, "kg", 0.5, "Spice Traders", 220.00),
    ("Coriander Powder", "Spices", 3, "kg", 0.5, "Spice Traders", 160.00),
    ("Cumin Powder", "Spices", 2, "kg", 0.5, "Spice Traders", 200.00),
    ("Garam Masala", "Spices", 2, "kg", 0.5, "Spice Traders", 350.00),
    ("Kashmiri Red Chilli", "Spices", 1, "kg", 0.2, "Spice Traders", 280.00),
    ("Black Pepper", "Spices", 1, "kg", 0.2, "Spice Traders", 650.00),
    ("Cumin Seeds (Jeera)", "Spices", 2, "kg", 0.5, "Spice Traders", 240.00),
    ("Mustard Seeds", "Spices", 1, "kg", 0.2, "Spice Traders", 120.00),
    ("Fenugreek Seeds (Methi)", "Spices", 1, "kg", 0.2, "Spice Traders", 100.00),
    ("Fennel Seeds (Saunf)", "Spices", 1, "kg", 0.2, "Spice Traders", 180.00),
    ("Cardamom (Green)", "Spices", 0.5, "kg", 0.1, "Spice Traders", 1200.00),
    ("Cardamom (Black)", "Spices", 0.3, "kg", 0.1, "Spice Traders", 800.00),
    ("Cloves", "Spices", 0.3, "kg", 0.1, "Spice Traders", 900.00),
    ("Cinnamon Sticks", "Spices", 0.5, "kg", 0.1, "Spice Traders", 400.00),
    ("Bay Leaves", "Spices", 0.2, "kg", 0.05, "Spice Traders", 300.00),
    ("Asafoetida (Hing)", "Spices", 0.1, "kg", 0.02, "Spice Traders", 800.00),
    ("Dry Mango Powder (Amchur)", "Spices", 1, "kg", 0.2, "Spice Traders", 180.00),
    ("Chaat Masala", "Spices", 1, "kg", 0.2, "Spice Traders", 200.00),
    ("Kitchen King Masala", "Spices", 2, "kg", 0.5, "Spice Traders", 280.00),
    ("Meat Masala", "Spices", 1, "kg", 0.2, "Spice Traders", 300.00),
    ("Biryani Masala", "Spices", 1, "kg", 0.2, "Spice Traders", 320.00),
    ("Sambar Powder", "Spices", 1, "kg", 0.2, "Spice Traders", 220.00),
    ("Rasam Powder", "Spices", 0.5, "kg", 0.1, "Spice Traders", 240.00),

    # Nuts & Dry Fruits
    ("Cashew Nuts", "Nuts", 3, "kg", 0.5, "Dry Fruit Co.", 850.00),
    ("Almonds", "Nuts", 2, "kg", 0.5, "Dry Fruit Co.", 750.00),
    ("Pistachios", "Nuts", 1, "kg", 0.2, "Dry Fruit Co.", 1200.00),
    ("Raisins", "Nuts", 2, "kg", 0.5, "Dry Fruit Co.", 250.00),
    ("Dry Coconut (Copra)", "Nuts", 3, "kg", 0.5, "Dry Fruit Co.", 180.00),
    ("Poppy Seeds (Khus Khus)", "Nuts", 0.5, "kg", 0.1, "Dry Fruit Co.", 900.00),
    ("Charoli (Chironji)", "Nuts", 0.2, "kg", 0.05, "Dry Fruit Co.", 1500.00),

    # Sweeteners
    ("Sugar", "Sweeteners", 50, "kg", 10, "Sugar Mills", 45.00),
    ("Jaggery (Gur)", "Sweeteners", 10, "kg", 2, "Local Market", 60.00),
    ("Honey", "Sweeteners", 5, "kg", 1, "Bee Farm", 450.00),

    # Canned & Packaged
    ("Tomato Puree", "Canned", 20, "kg", 5, "Food Products", 85.00),
    ("Coconut Milk", "Canned", 15, "litre", 3, "Food Products", 120.00),
    ("Condensed Milk", "Canned", 10, "kg", 2, "Food Products", 220.00),

    # Flavourings
    ("Vanilla Essence", "Flavourings", 2, "litre", 0.5, "Flavour House", 350.00),
    ("Rose Water", "Flavourings", 3, "litre", 0.5, "Flavour House", 180.00),
    ("Kewra Water", "Flavourings", 2, "litre", 0.5, "Flavour House", 200.00),
    ("Saffron (Kesar)", "Flavourings", 0.05, "kg", 0.01, "Spice Traders", 25000.00),
    ("Food Colour (Orange)", "Flavourings", 0.5, "litre", 0.1, "Flavour House", 150.00),
    ("Food Colour (Green)", "Flavourings", 0.5, "litre", 0.1, "Flavour House", 150.00),

    # Beverages Base
    ("Tea Leaves (Assam)", "Beverages", 5, "kg", 1, "Tea Estate", 450.00),
    ("Coffee Powder", "Beverages", 3, "kg", 0.5, "Coffee Roasters", 550.00),
    ("Cocoa Powder", "Beverages", 2, "kg", 0.5, "Food Products", 450.00),

    # Breads & Flours
    ("Yeast", "Bakery", 1, "kg", 0.2, "Bakery Supplies", 300.00),
    ("Baking Powder", "Bakery", 1, "kg", 0.2, "Bakery Supplies", 200.00),
    ("Baking Soda", "Bakery", 1, "kg", 0.2, "Bakery Supplies", 80.00),

    # Fruits for Desserts/Drinks
    ("Mango Pulp (Alphonso)", "Fruits", 10, "kg", 2, "Fruit Processors", 350.00),
    ("Strawberry Pulp", "Fruits", 5, "kg", 1, "Fruit Processors", 400.00),
    ("Pineapple (Canned)", "Fruits", 8, "kg", 2, "Fruit Processors", 120.00),
    ("Pomegranate Seeds", "Fruits", 3, "kg", 0.5, "Fresh Veggies Ltd.", 250.00),

    # Ice Cream Base
    ("Vanilla Ice Cream Base", "Frozen", 20, "litre", 5, "Ice Cream Co.", 180.00),
    ("Chocolate Ice Cream Base", "Frozen", 10, "litre", 2, "Ice Cream Co.", 200.00),
    ("Strawberry Ice Cream Base", "Frozen", 5, "litre", 1, "Ice Cream Co.", 220.00),
]


def seed_inventory(reset=False):
    """Insert inventory items with cost_per_unit for recipe costing."""
    db = SessionLocal()

    try:
        if reset:
            db.query(Inventory).delete()
            db.commit()

        added = 0
        existing = {row.item_name for row in db.query(Inventory).all()}

        for item_data in INVENTORY_ITEMS:
            (
                item_name, category, quantity, unit, minimum_stock,
                supplier, cost_per_unit,
            ) = item_data

            if item_name in existing:
                continue

            db.add(Inventory(
                item_name=item_name,
                category=category,
                quantity=quantity,
                unit=unit,
                minimum_stock=minimum_stock,
                supplier=supplier,
                cost_per_unit=cost_per_unit,
                created_at=datetime.utcnow(),
            ))

            existing.add(item_name)
            added += 1

        db.commit()

        total = db.query(Inventory).count()

        print(f"Added {added} new inventory item(s). Inventory now has {total} items.")

        # Print category counts
        from sqlalchemy import func
        cat_counts = db.query(Inventory.category, func.count(Inventory.id)).group_by(Inventory.category).all()
        for cat, count in cat_counts:
            print(f"  {cat}: {count} items")

        return added

    finally:
        db.close()


if __name__ == "__main__":
    random.seed(42)
    seed_inventory(reset=True)