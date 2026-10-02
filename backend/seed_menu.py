import random
from backend.database import SessionLocal
from backend import models, crud

# Sample dishes (30+)
SAMPLE_DISHES = [
    {"name": "Margherita Pizza", "category": "Main", "price": 8.99, "image_url": "https://picsum.photos/seed/pizza1/400/300"},
    {"name": "Pepperoni Pizza", "category": "Main", "price": 9.99, "image_url": "https://picsum.photos/seed/pizza2/400/300"},
    {"name": "BBQ Chicken Pizza", "category": "Main", "price": 10.49, "image_url": "https://picsum.photos/seed/pizza3/400/300"},
    {"name": "Veggie Supreme", "category": "Main", "price": 9.49, "image_url": "https://picsum.photos/seed/pizza4/400/300"},
    {"name": "Four Cheese Pizza", "category": "Main", "price": 10.99, "image_url": "https://picsum.photos/seed/pizza5/400/300"},
    {"name": "Garlic Bread", "category": "Appetizer", "price": 3.99, "image_url": "https://picsum.photos/seed/garlicbread/400/300"},
    {"name": "Bruschetta", "category": "Appetizer", "price": 4.49, "image_url": "https://picsum.photos/seed/bruschetta/400/300"},
    {"name": "Caesar Salad", "category": "Appetizer", "price": 5.99, "image_url": "https://picsum.photos/seed/caesar/400/300"},
    {"name": "Caprese Salad", "category": "Appetizer", "price": 6.49, "image_url": "https://picsum.photos/seed/caprese/400/300"},
    {"name": "Greek Salad", "category": "Appetizer", "price": 5.79, "image_url": "https://picsum.photos/seed/greek/400/300"},
    {"name": "Spaghetti Bolognese", "category": "Main", "price": 11.99, "image_url": "https://picsum.photos/seed/spaghetti1/400/300"},
    {"name": "Fettuccine Alfredo", "category": "Main", "price": 12.49, "image_url": "https://picsum.photos/seed/fettuccine/400/300"},
    {"name": "Lasagna", "category": "Main", "price": 13.99, "image_url": "https://picsum.photos/seed/lasagna/400/300"},
    {"name": "Ravioli", "category": "Main", "price": 12.79, "image_url": "https://picsum.photos/seed/ravioli/400/300"},
    {"name": "Minestrone Soup", "category": "Appetizer", "price": 4.99, "image_url": "https://picsum.photos/seed/minestrone/400/300"},
    {"name": "Mushroom Soup", "category": "Appetizer", "price": 4.79, "image_url": "https://picsum.photos/seed/mushroomsoup/400/300"},
    {"name": "Tiramisu", "category": "Dessert", "price": 5.99, "image_url": "https://picsum.photos/seed/tiramisu/400/300"},
    {"name": "Cheesecake", "category": "Dessert", "price": 6.49, "image_url": "https://picsum.photos/seed/cheesecake/400/300"},
    {"name": "Chocolate Brownie", "category": "Dessert", "price": 4.99, "image_url": "https://picsum.photos/seed/brownie/400/300"},
    {"name": "Panna Cotta", "category": "Dessert", "price": 5.49, "image_url": "https://picsum.photos/seed/pannacotta/400/300"},
    {"name": "Lemon Sorbet", "category": "Dessert", "price": 3.99, "image_url": "https://picsum.photos/seed/sorbet/400/300"},
    {"name": "Cappuccino", "category": "Beverage", "price": 2.99, "image_url": "https://picsum.photos/seed/cappuccino/400/300"},
    {"name": "Espresso", "category": "Beverage", "price": 2.49, "image_url": "https://picsum.photos/seed/espresso/400/300"},
    {"name": "Latte", "category": "Beverage", "price": 3.49, "image_url": "https://picsum.photos/seed/latte/400/300"},
    {"name": "Iced Tea", "category": "Beverage", "price": 2.79, "image_url": "https://picsum.photos/seed/icedtea/400/300"},
    {"name": "Lemonade", "category": "Beverage", "price": 2.69, "image_url": "https://picsum.photos/seed/lemonade/400/300"},
    {"name": "Mojito Mocktail", "category": "Beverage", "price": 3.99, "image_url": "https://picsum.photos/seed/mojito/400/300"},
    {"name": "Chicken Wings", "category": "Appetizer", "price": 6.99, "image_url": "https://picsum.photos/seed/wings/400/300"},
    {"name": "Fish & Chips", "category": "Main", "price": 11.49, "image_url": "https://picsum.photos/seed/fishchips/400/300"},
    {"name": "Steak Frites", "category": "Main", "price": 14.99, "image_url": "https://picsum.photos/seed/steak/400/300"},
    {"name": "Chocolate Milkshake", "category": "Beverage", "price": 4.49, "image_url": "https://picsum.photos/seed/milkshake/400/300"},
    {"name": "Apple Pie", "category": "Dessert", "price": 5.29, "image_url": "https://picsum.photos/seed/applepie/400/300"}
]

def seed_menu():
    db = SessionLocal()
    try:
        # Skip if any menu already exists
        if db.query(models.Menu).first():
            print("Menu already seeded – skipping.")
            return
        for dish in SAMPLE_DISHES:
            crud.create_menu(db, crud.MenuCreate(**dish))
        db.commit()
        print(f"Seeded {len(SAMPLE_DISHES)} menu items.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_menu()
