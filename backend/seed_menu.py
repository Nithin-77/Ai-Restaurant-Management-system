"""Seed the menu table with a ready-to-browse set of dishes.

Each dish carries an image, a short description and the dietary /
prep metadata used by the customer menu and the admin menu screen:

    python seed_menu.py
"""

import random

from database import SessionLocal
from models import Menu

# 80 unique local image files - one per dish, no duplicates
# Format: (dish_name, category, price, image_filename, description, is_veg, featured, spice, prep_min)
VEG_DISHES = [
    ("Vegetable Dum Biryani", "Veg", 240, "vegetable-dum-biryani.jpg",
     "Fragrant basmati layered with seasonal vegetables, mint and fried onions, slow-cooked on dum.", True, True, 1, 25),
    ("Paneer Butter Masala", "Veg", 230, "paneer-butter-masala.jpg",
     "Soft paneer cubes in a rich tomato and cashew gravy finished with cream and butter.", True, True, 1, 20),
    ("Paneer Tikka Masala", "Veg", 220, "paneer-tikka-masala.jpg",
     "Charred paneer tikka folded into a smoky onion and tomato masala with bell peppers.", True, False, 2, 22),
    ("Palak Paneer", "Veg", 210, "palak-paneer.jpg",
     "Fresh spinach puree simmered with paneer cubes, garlic and aromatic spices.", True, False, 1, 18),
    ("Vegetable Korma", "Veg", 220, "vegetable-korma.jpg",
     "Mixed vegetables in a mild cashew and coconut cream sauce with cardamom.", True, False, 1, 18),
    ("Malai Kofta", "Veg", 240, "malai-kofta.jpg",
     "Deep-fried paneer and potato dumplings in a velvety tomato and cashew gravy.", True, False, 1, 25),
    ("Chana Masala", "Veg", 200, "chana-masala.jpg",
     "Chickpeas simmered in a warm ginger and garam masala gravy with tomato.", True, False, 2, 18),
    ("Dal Makhani", "Veg", 200, "dal-makhani.jpg",
     "Black lentils simmered overnight on low heat with butter, cream and fenugreek.", True, False, 1, 20),
    ("Vegetable Fried Rice", "Veg", 200, "vegetable-fried-rice.jpg",
     "Wok-tossed rice with crisp vegetables, spring onion and a light seasoning.", True, False, 1, 15),
    ("Jeera Rice", "Veg", 200, "jeera-rice.jpg",
     "Basmati tempered with cumin, ghee and fresh coriander.", True, False, 0, 12),
    ("Veg Pulao", "Veg", 200, "veg-pulao.jpg",
     "Fragrant basmati cooked with mixed vegetables, whole spices and ghee.", True, False, 1, 20),
    ("Aloo Gobi", "Veg", 200, "aloo-gobi.jpg",
     "Potato and cauliflower cooked with turmeric, cumin and coriander.", True, False, 2, 15),
    ("Bhindi Masala", "Veg", 200, "bhindi-masala.jpg",
     "Tender okra sautéed with onions, tomatoes and aromatic spices.", True, False, 2, 15),
    ("Mushroom Masala", "Veg", 220, "mushroom-masala.jpg",
     "Button mushrooms in a rich onion-tomato gravy with kasuri methi.", True, False, 2, 18),
    ("Kadai Paneer", "Veg", 230, "kadai-paneer.jpg",
     "Paneer with bell peppers and onions in a semi-dry kadai masala.", True, True, 2, 20),
    ("Navratan Korma", "Veg", 250, "navratan-korma.jpg",
     "Nine vegetables, fruits and nuts in a luxurious cashew cream sauce.", True, False, 1, 22),
    ("Paneer Bhurji", "Veg", 200, "paneer-bhurji.jpg",
     "Crumbled paneer scrambled with onions, tomatoes, turmeric and green chilli.", True, False, 2, 12),
    ("Vegetable Jalfrezi", "Veg", 210, "vegetable-jalfrezi.jpg",
     "Mixed vegetables stir-fried with peppers, onions and a tangy tomato sauce.", True, False, 2, 16),
    ("Corn Palak", "Veg", 210, "corn-palak.jpg",
     "Sweet corn kernels in a creamy spinach gravy with garlic and cream.", True, False, 1, 18),
    ("Gobi Manchurian", "Veg", 200, "gobi-manchurian.jpg",
     "Crisp cauliflower florets in a tangy garlic soy glaze, served dry.", True, False, 2, 15),
]

NON_VEG_DISHES = [
    ("Hyderabadi Chicken Dum Biryani", "Non-Veg", 340, "hyderabadi-chicken-dum-biryani.jpg",
     "Sealed-pot dum biryani with long-grain basmati, saffron chicken and fried onions.", False, True, 3, 30),
    ("Chicken Butter Masala", "Non-Veg", 320, "chicken-butter-masala.jpg",
     "Tandoor-roasted chicken folded into a mild tomato and butter gravy with cream.", False, True, 1, 22),
    ("Chicken Tikka Masala", "Non-Veg", 310, "chicken-tikka-masala.jpg",
     "Charred chicken tikka simmered in a smoky onion-tomato masala with fenugreek.", False, True, 2, 22),
    ("Chicken Korma", "Non-Veg", 320, "chicken-korma.jpg",
     "Chicken in a mild cashew and coconut cream sauce with whole spices.", False, False, 1, 20),
    ("Chicken Chettinad", "Non-Veg", 330, "chicken-chettinad.jpg",
     "Spicy chicken curry with roasted coconut, curry leaves and black pepper.", False, True, 3, 25),
    ("Mutton Rogan Josh", "Non-Veg", 350, "mutton-rogan-josh.jpg",
     "Slow-cooked mutton in a fragrant Kashmiri chilli and fennel gravy.", False, True, 3, 35),
    ("Mutton Biryani", "Non-Veg", 350, "mutton-biryani.jpg",
     "Layered basmati with tender mutton, saffron milk and caramelised onions.", False, False, 3, 35),
    ("Fish Curry", "Non-Veg", 320, "fish-curry.jpg",
     "Fresh fish fillets in a tangy coconut and tamarind gravy with curry leaves.", False, False, 2, 20),
    ("Prawn Masala", "Non-Veg", 340, "prawn-masala.jpg",
     "Succulent prawns in a spicy onion-tomato masala with kokum and coconut.", False, False, 3, 18),
    ("Chicken 65", "Non-Veg", 300, "chicken-65.jpg",
     "Crisp fried chicken tossed with curry leaf, chilli and yoghurt.", False, True, 3, 14),
    ("Tandoori Chicken", "Non-Veg", 320, "tandoori-chicken.jpg",
     "Chicken marinated in yoghurt and spices, roasted until charred at the edges.", False, False, 2, 24),
    ("Chicken Lollipop", "Non-Veg", 310, "chicken-lollipop.jpg",
     "Frenched chicken wings coated in a spicy batter and deep-fried.", False, False, 2, 20),
    ("Mutton Kheema", "Non-Veg", 330, "mutton-kheema.jpg",
     "Minced mutton cooked with peas, tomatoes and garam masala.", False, False, 2, 25),
    ("Chicken Kolhapuri", "Non-Veg", 330, "chicken-kolhapuri.jpg",
     "Fiery chicken curry with Kolhapuri masala, coconut and tamarind.", False, False, 3, 25),
    ("Amritsari Fish", "Non-Veg", 330, "amritsari-fish.jpg",
     "Fish fillets coated in spiced gram flour batter, deep-fried crisp.", False, False, 2, 18),
    ("Chicken Saagwala", "Non-Veg", 310, "chicken-saagwala.jpg",
     "Chicken simmered in a creamy spinach gravy with garlic and fenugreek.", False, False, 2, 20),
    ("Egg Curry", "Non-Veg", 300, "egg-curry.jpg",
     "Boiled eggs in a spiced onion tomato gravy, best with paratha.", False, False, 2, 17),
    ("Mutton Korma", "Non-Veg", 350, "mutton-korma.jpg",
     "Tender mutton in a rich cashew and almond cream sauce with saffron.", False, False, 2, 30),
    ("Chicken Vindaloo", "Non-Veg", 320, "chicken-vindaloo.jpg",
     "Goan-style fiery chicken curry with vinegar, garlic and red chillies.", False, False, 3, 25),
    ("Fish Tikka", "Non-Veg", 320, "fish-tikka.jpg",
     "Fish cubes marinated in yoghurt and spices, charred in the tandoor.", False, False, 2, 18),
]

DESSERTS = [
    ("Gulab Jamun", "Desserts", 120, "gulab-jamun.jpg",
     "Warm milk dumplings soaked in cardamom sugar syrup, served with pistachio slivers.", True, True, 0, 5),
    ("Rasmalai", "Desserts", 140, "rasmalai.jpg",
     "Soft cheese dumplings in a saffron pistachio milk reduction.", True, False, 0, 5),
    ("Kesar Kulfi", "Desserts", 130, "kesar-kulfi.jpg",
     "Traditional Indian ice cream with saffron, cardamom and pistachios.", True, False, 0, 4),
    ("Gajar Ka Halwa", "Desserts", 150, "gajar-ka-halwa.jpg",
     "Slow-cooked carrot dessert with ghee, cardamom and almond slivers.", True, True, 0, 12),
    ("Shahi Tukda", "Desserts", 160, "shahi-tukda.jpg",
     "Fried bread soaked in saffron rabri, topped with nuts and silver leaf.", True, False, 0, 8),
    ("Kaju Katli", "Desserts", 180, "kaju-katli.jpg",
     "Diamond-shaped cashew fudge with a silver leaf finish.", True, False, 0, 4),
    ("Rasgulla", "Desserts", 110, "rasgulla.jpg",
     "Spongy cheese balls in a light cardamom sugar syrup.", True, False, 0, 5),
    ("Mysore Pak", "Desserts", 140, "mysore-pak.jpg",
     "Rich gram flour fudge with ghee, sugar and a hint of cardamom.", True, False, 0, 6),
    ("Phirni", "Desserts", 120, "phirni.jpg",
     "Ground rice pudding with saffron, cardamom and rose water.", True, False, 0, 5),
    ("Jalebi", "Desserts", 100, "jalebi.jpg",
     "Crispy spiral fermented batter soaked in saffron syrup.", True, False, 0, 6),
    ("Malpua", "Desserts", 130, "malpua.jpg",
     "Deep-fried pancakes soaked in sugar syrup, served with rabri.", True, False, 0, 8),
    ("Kheer", "Desserts", 110, "kheer.jpg",
     "Creamy rice pudding slow-cooked with milk, sugar, cardamom and nuts.", True, False, 0, 8),
    ("Sandesh", "Desserts", 120, "sandesh.jpg",
     "Bengali sweet made from fresh chhena, cardamom and pistachio.", True, False, 0, 4),
    ("Cham Cham", "Desserts", 130, "cham-cham.jpg",
     "Cylindrical chhena sweets stuffed with khoya and coated with coconut.", True, False, 0, 5),
    ("Peda", "Desserts", 110, "peda.jpg",
     "Milk solids cooked with sugar and cardamom, shaped into rounds.", True, False, 0, 4),
    ("Modak", "Desserts", 130, "modak.jpg",
     "Steamed rice flour dumplings filled with coconut and jaggery.", True, False, 0, 8),
    ("Besan Ladoo", "Desserts", 100, "besan-ladoo.jpg",
     "Roasted gram flour balls with ghee, sugar and cardamom.", True, False, 0, 6),
    ("Coconut Barfi", "Desserts", 110, "coconut-barfi.jpg",
     "Fresh coconut and milk solids cooked to a fudge-like texture.", True, False, 0, 5),
    ("Anjeer Halwa", "Desserts", 160, "anjeer-halwa.jpg",
     "Fig halwa with khoya, ghee and aromatic cardamom.", True, True, 0, 10),
    ("Chocolate Brownie", "Desserts", 180, "chocolate-brownie.jpg",
     "Fudgy dark chocolate brownie served warm with vanilla ice cream.", True, False, 0, 6),
]

COOL_DRINKS = [
    ("Mango Lassi", "Cool Drinks", 120, "mango-lassi.jpg",
     "Thick mango pulp whisked with cool yoghurt and a touch of honey.", True, True, 0, 5),
    ("Sweet Lassi", "Cool Drinks", 90, "sweet-lassi.jpg",
     "Classic sweet yoghurt drink with a hint of cardamom.", True, False, 0, 4),
    ("Salted Lassi", "Cool Drinks", 90, "salted-lassi.jpg",
     "Savoury yoghurt drink with roasted cumin and black salt.", True, False, 0, 4),
    ("Masala Chaas", "Cool Drinks", 80, "masala-chaas.jpg",
     "Spiced buttermilk with green chilli, ginger and coriander.", True, False, 0, 4),
    ("Fresh Lime Soda", "Cool Drinks", 80, "fresh-lime-soda.jpg",
     "Sweet or salted lime soda with a sprig of mint.", True, False, 0, 3),
    ("Watermelon Juice", "Cool Drinks", 100, "watermelon-juice.jpg",
     "Fresh watermelon juice with a hint of black salt and mint.", True, False, 0, 4),
    ("Orange Juice", "Cool Drinks", 110, "orange-juice.jpg",
     "Freshly squeezed orange juice served chilled.", True, False, 0, 4),
    ("Pineapple Juice", "Cool Drinks", 110, "pineapple-juice.jpg",
     "Fresh pineapple juice with a touch of ginger.", True, False, 0, 4),
    ("Mix Fruit Juice", "Cool Drinks", 120, "mix-fruit-juice.jpg",
     "Blend of seasonal fruits - apple, orange, pineapple and pomegranate.", True, False, 0, 5),
    ("Cold Coffee", "Cool Drinks", 130, "cold-coffee.jpg",
     "Chilled coffee with milk, sugar and a scoop of vanilla ice cream.", True, True, 0, 5),
    ("Chocolate Milkshake", "Cool Drinks", 150, "chocolate-milkshake.jpg",
     "Thick chocolate shake topped with whipped cream and cocoa.", True, True, 0, 6),
    ("Strawberry Milkshake", "Cool Drinks", 150, "strawberry-milkshake.jpg",
     "Fresh strawberry milkshake with vanilla ice cream and whipped cream.", True, False, 0, 6),
    ("Vanilla Milkshake", "Cool Drinks", 140, "vanilla-milkshake.jpg",
     "Classic vanilla milkshake with a cherry on top.", True, False, 0, 5),
    ("Oreo Milkshake", "Cool Drinks", 160, "oreo-milkshake.jpg",
     "Cookies and cream milkshake with crushed Oreo cookies.", True, False, 0, 6),
    ("Mango Milkshake", "Cool Drinks", 150, "mango-milkshake.jpg",
     "Ripe mango blended with milk and vanilla ice cream.", True, False, 0, 5),
    ("Virgin Mojito", "Cool Drinks", 120, "virgin-mojito.jpg",
     "Alcohol-free lime, mint and soda with a sugar cane stirrer.", True, False, 0, 4),
    ("Blue Lagoon", "Cool Drinks", 130, "blue-lagoon.jpg",
     "Blue curacao syrup with lemonade and sprite, served over ice.", True, False, 0, 4),
    ("Cranberry Cooler", "Cool Drinks", 120, "cranberry-cooler.jpg",
     "Cranberry juice with lime, mint and a splash of soda.", True, False, 0, 4),
    ("Iced Tea", "Cool Drinks", 100, "iced-tea.jpg",
     "Black tea chilled over ice with lemon and a hint of mint.", True, False, 0, 3),
    ("Rose Falooda", "Cool Drinks", 140, "rose-falooda.jpg",
     "Rose syrup with vermicelli, basil seeds, milk and ice cream.", True, True, 0, 6),
]


def _photo_url(image_filename: str) -> str:
    return "/images/menu/" + image_filename


ALL_DISHES = VEG_DISHES + NON_VEG_DISHES + DESSERTS + COOL_DRINKS


def seed_menu(reset=False):
    """Insert any missing dish.

    Matches on the dish name, so running this twice is safe and a menu
    that is already stocked only gains the new dishes. Pass reset=True to
    wipe the table first and rebuild it from ALL_DISHES.
    """
    db = SessionLocal()

    try:
        if reset:
            db.query(Menu).delete()
            db.commit()

        added = 0
        existing = {row.name.lower() for row in db.query(Menu).all()}

        for dish in ALL_DISHES:
            (
                name, category, price, photo_id, description,
                is_vegetarian, is_featured, spice_level, prep_time,
            ) = dish

            image_url = _photo_url(photo_id)

            # Case-insensitive duplicate check
            if name.lower() in existing:
                continue

            db.add(Menu(
                name=name,
                category=category,
                price=price,
                image_url=image_url,
                description=description,
                is_vegetarian=is_vegetarian,
                is_featured=is_featured,
                spice_level=spice_level,
                prep_time=prep_time,
                available=True,
            ))

            existing.add(name.lower())
            added += 1

        db.commit()

        total = db.query(Menu).count()

        print(f"Added {added} new menu item(s). Menu now has {total} items.")

        # Print category counts
        for cat in ["Veg", "Non-Veg", "Desserts", "Cool Drinks"]:
            count = db.query(Menu).filter(Menu.category == cat).count()
            print(f"  {cat}: {count} items")

        return added

    finally:
        db.close()


if __name__ == "__main__":
    random.seed(42)

    seed_menu(reset=True)
