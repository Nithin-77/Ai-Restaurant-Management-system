"""Update existing menu records with unique images and correct details.

This script updates menu items in place (preserving IDs) so that
foreign-key references from MenuCustomization and order snapshots
remain valid. It matches items case-insensitively by name.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Menu

# name, category, price, photo_id, description, is_veg, featured, spice, prep_min
CANONICAL_MENU = [
    # Veg (20 items) - base price ₹200-250
    ("Vegetable Dum Biryani", "Veg", 240, "1563379091339-03b21ab4a4f8",
     "Fragrant basmati layered with seasonal vegetables, mint and fried onions, slow-cooked on dum.", True, True, 1, 25),
    ("Paneer Butter Masala", "Veg", 230, "1603894584373-5ac82b2ae398",
     "Soft paneer cubes in a rich tomato and cashew gravy finished with cream and butter.", True, True, 1, 20),
    ("Paneer Tikka Masala", "Veg", 220, "1567188040759-fb8a883dc6d8",
     "Charred paneer tikka folded into a smoky onion and tomato masala with bell peppers.", True, False, 2, 22),
    ("Palak Paneer", "Veg", 210, "1631452180519-c014fe946bc7",
     "Fresh spinach puree simmered with paneer cubes, garlic and aromatic spices.", True, False, 1, 18),
    ("Vegetable Korma", "Veg", 220, "1547592180-85f173990554",
     "Mixed vegetables in a mild cashew and coconut cream sauce with cardamom.", True, False, 1, 18),
    ("Malai Kofta", "Veg", 240, "1546833999-b9f581a1996d",
     "Deep-fried paneer and potato dumplings in a velvety tomato and cashew gravy.", True, False, 1, 25),
    ("Chana Masala", "Veg", 200, "1626064710248-d9a578bbf440",
     "Chickpeas simmered in a warm ginger and garam masala gravy with tomato.", True, False, 2, 18),
    ("Dal Makhani", "Veg", 200, "1611205973086-c15e9375c3ab",
     "Black lentils simmered overnight on low heat with butter, cream and fenugreek.", True, False, 1, 20),
    ("Vegetable Fried Rice", "Veg", 200, "1512058564366-18510be2db19",
     "Wok-tossed rice with crisp vegetables, spring onion and a light seasoning.", True, False, 1, 15),
    ("Jeera Rice", "Veg", 200, "1596797038530-2c107229654b",
     "Basmati tempered with cumin, ghee and fresh coriander.", True, False, 0, 12),
    ("Veg Pulao", "Veg", 200, "1534056188712-a9b69a8d6b4f",
     "Fragrant basmati cooked with mixed vegetables, whole spices and ghee.", True, False, 1, 20),
    ("Aloo Gobi", "Veg", 200, "1547592166-23ac45744acd",
     "Potato and cauliflower cooked with turmeric, cumin and coriander.", True, False, 2, 15),
    ("Bhindi Masala", "Veg", 200, "1619338951746-143d3a126973",
     "Tender okra sautéed with onions, tomatoes and aromatic spices.", True, False, 2, 15),
    ("Mushroom Masala", "Veg", 220, "1565557618308-c3055e93c0a4",
     "Button mushrooms in a rich onion-tomato gravy with kasuri methi.", True, False, 2, 18),
    ("Kadai Paneer", "Veg", 230, "1597796981572-398629759e6a",
     "Paneer with bell peppers and onions in a semi-dry kadai masala.", True, True, 2, 20),
    ("Navratan Korma", "Veg", 250, "1598537210267-ab982dcbf526",
     "Nine vegetables, fruits and nuts in a luxurious cashew cream sauce.", True, False, 1, 22),
    ("Paneer Bhurji", "Veg", 200, "1600891288442-4f7e5e2f3e73",
     "Crumbled paneer scrambled with onions, tomatoes, turmeric and green chilli.", True, False, 2, 12),
    ("Vegetable Jalfrezi", "Veg", 210, "1603504661338-c4eaddabba34",
     "Mixed vegetables stir-fried with peppers, onions and a tangy tomato sauce.", True, False, 2, 16),
    ("Corn Palak", "Veg", 210, "1583238242560-ed7e2476c88e",
     "Sweet corn kernels in a creamy spinach gravy with garlic and cream.", True, False, 1, 18),
    ("Gobi Manchurian", "Veg", 200, "1594768004230-a9b7e9e7f0b3",
     "Crisp cauliflower florets in a tangy garlic soy glaze, served dry.", True, False, 2, 15),

    # Non-Veg (20 items) - base price ₹300-350
    ("Hyderabadi Chicken Dum Biryani", "Non-Veg", 340, "1601050690117-94f5f6fa8bd7",
     "Sealed-pot dum biryani with long-grain basmati, saffron chicken and fried onions.", False, True, 3, 30),
    ("Chicken Butter Masala", "Non-Veg", 320, "1565299624946-b28f40a0ae38",
     "Tandoor-roasted chicken folded into a mild tomato and butter gravy with cream.", False, True, 1, 22),
    ("Chicken Tikka Masala", "Non-Veg", 310, "1544025162-d76694265947",
     "Charred chicken tikka simmered in a smoky onion-tomato masala with fenugreek.", False, True, 2, 22),
    ("Chicken Korma", "Non-Veg", 320, "1592653467107-4b084f5c6783",
     "Chicken in a mild cashew and coconut cream sauce with whole spices.", False, False, 1, 20),
    ("Chicken Chettinad", "Non-Veg", 330, "1604908556856-b7a6c479f62d",
     "Spicy chicken curry with roasted coconut, curry leaves and black pepper.", False, True, 3, 25),
    ("Mutton Rogan Josh", "Non-Veg", 350, "1604908176997-125e7c0d7f0f",
     "Slow-cooked mutton in a fragrant Kashmiri chilli and fennel gravy.", False, True, 3, 35),
    ("Mutton Biryani", "Non-Veg", 350, "1623923882006-6f0e9c3a1b2d",
     "Layered basmati with tender mutton, saffron milk and caramelised onions.", False, False, 3, 35),
    ("Fish Curry", "Non-Veg", 320, "1544943910-4c1dc44aab44",
     "Fresh fish fillets in a tangy coconut and tamarind gravy with curry leaves.", False, False, 2, 20),
    ("Prawn Masala", "Non-Veg", 340, "1565680018434-b513d5e5fd47",
     "Succulent prawns in a spicy onion-tomato masala with kokum and coconut.", False, False, 3, 18),
    ("Chicken 65", "Non-Veg", 300, "1588639990595-1c8d7c999e7a",
     "Crisp fried chicken tossed with curry leaf, chilli and yoghurt.", False, True, 3, 14),
    ("Tandoori Chicken", "Non-Veg", 320, "1598103442097-8b74394b95c6",
     "Chicken marinated in yoghurt and spices, roasted until charred at the edges.", False, False, 2, 24),
    ("Chicken Lollipop", "Non-Veg", 310, "1607082348742-389454998fe1",
     "Frenched chicken wings coated in a spicy batter and deep-fried.", False, False, 2, 20),
    ("Mutton Kheema", "Non-Veg", 330, "1592392297242-4b9a0a9f669b",
     "Minced mutton cooked with peas, tomatoes and garam masala.", False, False, 2, 25),
    ("Chicken Kolhapuri", "Non-Veg", 330, "1587105204436-2a2f95e2175f",
     "Fiery chicken curry with Kolhapuri masala, coconut and tamarind.", False, False, 3, 25),
    ("Amritsari Fish", "Non-Veg", 330, "1580489944761-15a39a6e819d",
     "Fish fillets coated in spiced gram flour batter, deep-fried crisp.", False, False, 2, 18),
    ("Chicken Saagwala", "Non-Veg", 310, "1566073871433-7c4e4a1f5c0d",
     "Chicken simmered in a creamy spinach gravy with garlic and fenugreek.", False, False, 2, 20),
    ("Egg Curry", "Non-Veg", 300, "1606491956689-2ea866880c84",
     "Boiled eggs in a spiced onion tomato gravy, best with paratha.", False, False, 2, 17),
    ("Mutton Korma", "Non-Veg", 350, "1574677009873-8d1e8b3247c0",
     "Tender mutton in a rich cashew and almond cream sauce with saffron.", False, False, 2, 30),
    ("Chicken Vindaloo", "Non-Veg", 320, "1613462821158-f3a1b3b9c0e1",
     "Goan-style fiery chicken curry with vinegar, garlic and red chillies.", False, False, 3, 25),
    ("Fish Tikka", "Non-Veg", 320, "1545447483-c7f8b7f9e3a2",
     "Fish cubes marinated in yoghurt and spices, charred in the tandoor.", False, False, 2, 18),

    # Desserts (20 items)
    ("Gulab Jamun", "Desserts", 120, "1601055654745-9f7d84fbb0d7",
     "Warm milk dumplings soaked in cardamom sugar syrup, served with pistachio slivers.", True, True, 0, 5),
    ("Rasmalai", "Desserts", 140, "1571877227200-a0d98ea607e9",
     "Soft cheese dumplings in a saffron pistachio milk reduction.", True, False, 0, 5),
    ("Kesar Kulfi", "Desserts", 130, "1578985545062-69928b1d9587",
     "Traditional Indian ice cream with saffron, cardamom and pistachios.", True, False, 0, 4),
    ("Gajar Ka Halwa", "Desserts", 150, "1606313564200-e75d5e30476c",
     "Slow-cooked carrot dessert with ghee, cardamom and almond slivers.", True, True, 0, 12),
    ("Shahi Tukda", "Desserts", 160, "1541783245831-57d6fb0926d3",
     "Fried bread soaked in saffron rabri, topped with nuts and silver leaf.", True, False, 0, 8),
    ("Kaju Katli", "Desserts", 180, "1565958011703-44f9829ba187",
     "Diamond-shaped cashew fudge with a silver leaf finish.", True, False, 0, 4),
    ("Rasgulla", "Desserts", 110, "1589302168068-964664d93dc0",
     "Spongy cheese balls in a light cardamom sugar syrup.", True, False, 0, 5),
    ("Mysore Pak", "Desserts", 140, "1599487488170-d11ec9c172f0",
     "Rich gram flour fudge with ghee, sugar and a hint of cardamom.", True, False, 0, 6),
    ("Phirni", "Desserts", 120, "1488477181946-6428a0291777",
     "Ground rice pudding with saffron, cardamom and rose water.", True, False, 0, 5),
    ("Jalebi", "Desserts", 100, "1560459061-a54c7f2e2c3d",
     "Crispy spiral fermented batter soaked in saffron syrup.", True, False, 0, 6),
    ("Malpua", "Desserts", 130, "1597734794950-a40b2b8a0b62",
     "Deep-fried pancakes soaked in sugar syrup, served with rabri.", True, False, 0, 8),
    ("Kheer", "Desserts", 110, "1543356401-d5f4297e61a8",
     "Creamy rice pudding slow-cooked with milk, sugar, cardamom and nuts.", True, False, 0, 8),
    ("Sandesh", "Desserts", 120, "1587204812352-4c3e79919a7e",
     "Bengali sweet made from fresh chhena, cardamom and pistachio.", True, False, 0, 4),
    ("Cham Cham", "Desserts", 130, "1597734794951-b51c3c8a0b63",
     "Cylindrical chhena sweets stuffed with khoya and coated with coconut.", True, False, 0, 5),
    ("Peda", "Desserts", 110, "1591720861088-6637c5a6ce0f",
     "Milk solids cooked with sugar and cardamom, shaped into rounds.", True, False, 0, 4),
    ("Modak", "Desserts", 130, "1578985545063-7a039c2d9588",
     "Steamed rice flour dumplings filled with coconut and jaggery.", True, False, 0, 8),
    ("Besan Ladoo", "Desserts", 100, "1592528196944-541a97c74ab1",
     "Roasted gram flour balls with ghee, sugar and cardamom.", True, False, 0, 6),
    ("Coconut Barfi", "Desserts", 110, "1606313564201-f75d5e30476d",
     "Fresh coconut and milk solids cooked to a fudge-like texture.", True, False, 0, 5),
    ("Anjeer Halwa", "Desserts", 160, "1565557618309-d3055e93c0a5",
     "Fig halwa with khoya, ghee and aromatic cardamom.", True, True, 0, 10),
    ("Chocolate Brownie", "Desserts", 180, "1605534360278-b9b7e9e7f0b4",
     "Fudgy dark chocolate brownie served warm with vanilla ice cream.", True, False, 0, 6),

    # Cool Drinks (20 items)
    ("Mango Lassi", "Cool Drinks", 120, "1621263764928-df1444c5e859",
     "Thick mango pulp whisked with cool yoghurt and a touch of honey.", True, True, 0, 5),
    ("Sweet Lassi", "Cool Drinks", 90, "1571934811356-5cc061b6821f",
     "Classic sweet yoghurt drink with a hint of cardamom.", True, False, 0, 4),
    ("Salted Lassi", "Cool Drinks", 90, "1580489944762-15a39a6e819e",
     "Savoury yoghurt drink with roasted cumin and black salt.", True, False, 0, 4),
    ("Masala Chaas", "Cool Drinks", 80, "1611564797223-f1c104971e3b",
     "Spiced buttermilk with green chilli, ginger and coriander.", True, False, 0, 4),
    ("Fresh Lime Soda", "Cool Drinks", 80, "1594569949079-5b16e29c0c35",
     "Sweet or salted lime soda with a sprig of mint.", True, False, 0, 3),
    ("Watermelon Juice", "Cool Drinks", 100, "1566345413309-1c39184c2f19",
     "Fresh watermelon juice with a hint of black salt and mint.", True, False, 0, 4),
    ("Orange Juice", "Cool Drinks", 110, "1557800636-894a64c1696f",
     "Freshly squeezed orange juice served chilled.", True, False, 0, 4),
    ("Pineapple Juice", "Cool Drinks", 110, "1567620905733-2d1ec7ab7446",
     "Fresh pineapple juice with a touch of ginger.", True, False, 0, 4),
    ("Mix Fruit Juice", "Cool Drinks", 120, "161247557130-4a1b4c9c6c3a",
     "Blend of seasonal fruits - apple, orange, pineapple and pomegranate.", True, False, 0, 5),
    ("Cold Coffee", "Cool Drinks", 130, "1572442388796-11668a67e53d",
     "Chilled coffee with milk, sugar and a scoop of vanilla ice cream.", True, True, 0, 5),
    ("Chocolate Milkshake", "Cool Drinks", 150, "1572490122747-3968b75cc699",
     "Thick chocolate shake topped with whipped cream and cocoa.", True, True, 0, 6),
    ("Strawberry Milkshake", "Cool Drinks", 150, "1565958011704-44f9829ba188",
     "Fresh strawberry milkshake with vanilla ice cream and whipped cream.", True, False, 0, 6),
    ("Vanilla Milkshake", "Cool Drinks", 140, "1588139910581-2d2e998c575f",
     "Classic vanilla milkshake with a cherry on top.", True, False, 0, 5),
    ("Oreo Milkshake", "Cool Drinks", 160, "1563805042-7684c819e15a",
     "Cookies and cream milkshake with crushed Oreo cookies.", True, False, 0, 6),
    ("Mango Milkshake", "Cool Drinks", 150, "1591343129959-9b906c6b3c11",
     "Ripe mango blended with milk and vanilla ice cream.", True, False, 0, 5),
    ("Virgin Mojito", "Cool Drinks", 120, "1513558161293-cdaf765ed2fd",
     "Alcohol-free lime, mint and soda with a sugar cane stirrer.", True, False, 0, 4),
    ("Blue Lagoon", "Cool Drinks", 130, "1551218878-a0e0e7e9e4a2",
     "Blue curacao syrup with lemonade and sprite, served over ice.", True, False, 0, 4),
    ("Cranberry Cooler", "Cool Drinks", 120, "1596436736217-cc3a5e319592",
     "Cranberry juice with lime, mint and a splash of soda.", True, False, 0, 4),
    ("Iced Tea", "Cool Drinks", 100, "1556679343-c7306c1976bc",
     "Black tea chilled over ice with lemon and a hint of mint.", True, False, 0, 3),
    ("Rose Falooda", "Cool Drinks", 140, "1578985545064-7a039c2d9589",
     "Rose syrup with vermicelli, basil seeds, milk and ice cream.", True, True, 0, 6),
]


def _photo_url(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=600&q=80"


def update_menu():
    db = SessionLocal()
    try:
        updated = 0
        not_found = []

        for dish in CANONICAL_MENU:
            (
                name, category, price, photo_id, description,
                is_vegetarian, is_featured, spice_level, prep_time,
            ) = dish

            image_url = _photo_url(photo_id)

            # Case-insensitive match by name
            item = (
                db.query(Menu)
                .filter(Menu.name.ilike(name))
                .first()
            )

            if item:
                # Only update fields that differ
                changed = False
                if item.category != category:
                    item.category = category
                    changed = True
                if float(item.price) != price:
                    item.price = price
                    changed = True
                if item.image_url != image_url:
                    item.image_url = image_url
                    changed = True
                if item.description != description:
                    item.description = description
                    changed = True
                if item.is_vegetarian != is_vegetarian:
                    item.is_vegetarian = is_vegetarian
                    changed = True
                if item.is_featured != is_featured:
                    item.is_featured = is_featured
                    changed = True
                if item.spice_level != spice_level:
                    item.spice_level = spice_level
                    changed = True
                if item.prep_time != prep_time:
                    item.prep_time = prep_time
                    changed = True

                if changed:
                    updated += 1
            else:
                not_found.append(name)

        db.commit()
        print(f"Updated {updated} menu item(s).")

        if not_found:
            print(f"Items not found in database (will be seeded):")
            for name in not_found:
                print(f"  - {name}")

        # Verify final state
        total = db.query(Menu).count()
        print(f"\nTotal menu items: {total}")
        for cat in ["Veg", "Non-Veg", "Desserts", "Cool Drinks"]:
            count = db.query(Menu).filter(Menu.category == cat).count()
            print(f"  {cat}: {count} items")

        # Check for duplicate images
        from collections import Counter
        items = db.query(Menu).all()
        image_counts = Counter(i.image_url for i in items if i.image_url)
        dupes = {url: c for url, c in image_counts.items() if c > 1}
        if dupes:
            print(f"\nWARNING: {len(dupes)} duplicate image URL groups found:")
            for url, count in dupes.items():
                names = [i.name for i in items if i.image_url == url]
                print(f"  {count}x {url[:80]}...")
                for n in names:
                    print(f"    - {n}")
        else:
            print("\nAll image URLs are unique.")

        return updated

    finally:
        db.close()


if __name__ == "__main__":
    update_menu()
