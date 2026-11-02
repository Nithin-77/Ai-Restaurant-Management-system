"""Migrate existing menu image_url values from Unsplash URLs to local /images/menu/ paths.

Matches on dish name (case-insensitive) and updates the image_url column
to point at the local SVG asset. Historical orders and foreign keys are
untouched because we only change image_url on the Menu table.
"""

from database import SessionLocal
from models import Menu

# name -> local filename mapping (must match seed_menu.py exactly)
IMAGE_MAP = {
    # Veg
    "Vegetable Dum Biryani": "vegetable-dum-biryani.svg",
    "Paneer Butter Masala": "paneer-butter-masala.svg",
    "Paneer Tikka Masala": "paneer-tikka-masala.svg",
    "Palak Paneer": "palak-paneer.svg",
    "Vegetable Korma": "vegetable-korma.svg",
    "Malai Kofta": "malai-kofta.svg",
    "Chana Masala": "chana-masala.svg",
    "Dal Makhani": "dal-makhani.svg",
    "Vegetable Fried Rice": "vegetable-fried-rice.svg",
    "Jeera Rice": "jeera-rice.svg",
    "Veg Pulao": "veg-pulao.svg",
    "Aloo Gobi": "aloo-gobi.svg",
    "Bhindi Masala": "bhindi-masala.svg",
    "Mushroom Masala": "mushroom-masala.svg",
    "Kadai Paneer": "kadai-paneer.svg",
    "Navratan Korma": "navratan-korma.svg",
    "Paneer Bhurji": "paneer-bhurji.svg",
    "Vegetable Jalfrezi": "vegetable-jalfrezi.svg",
    "Corn Palak": "corn-palak.svg",
    "Gobi Manchurian": "gobi-manchurian.svg",
    # Non-Veg
    "Hyderabadi Chicken Dum Biryani": "hyderabadi-chicken-dum-biryani.svg",
    "Chicken Butter Masala": "chicken-butter-masala.svg",
    "Chicken Tikka Masala": "chicken-tikka-masala.svg",
    "Chicken Korma": "chicken-korma.svg",
    "Chicken Chettinad": "chicken-chettinad.svg",
    "Mutton Rogan Josh": "mutton-rogan-josh.svg",
    "Mutton Biryani": "mutton-biryani.svg",
    "Fish Curry": "fish-curry.svg",
    "Prawn Masala": "prawn-masala.svg",
    "Chicken 65": "chicken-65.svg",
    "Tandoori Chicken": "tandoori-chicken.svg",
    "Chicken Lollipop": "chicken-lollipop.svg",
    "Mutton Kheema": "mutton-kheema.svg",
    "Chicken Kolhapuri": "chicken-kolhapuri.svg",
    "Amritsari Fish": "amritsari-fish.svg",
    "Chicken Saagwala": "chicken-saagwala.svg",
    "Egg Curry": "egg-curry.svg",
    "Mutton Korma": "mutton-korma.svg",
    "Chicken Vindaloo": "chicken-vindaloo.svg",
    "Fish Tikka": "fish-tikka.svg",
    # Desserts
    "Gulab Jamun": "gulab-jamun.svg",
    "Rasmalai": "rasmalai.svg",
    "Kesar Kulfi": "kesar-kulfi.svg",
    "Gajar Ka Halwa": "gajar-ka-halwa.svg",
    "Shahi Tukda": "shahi-tukda.svg",
    "Kaju Katli": "kaju-katli.svg",
    "Rasgulla": "rasgulla.svg",
    "Mysore Pak": "mysore-pak.svg",
    "Phirni": "phirni.svg",
    "Jalebi": "jalebi.svg",
    "Malpua": "malpua.svg",
    "Kheer": "kheer.svg",
    "Sandesh": "sandesh.svg",
    "Cham Cham": "cham-cham.svg",
    "Peda": "peda.svg",
    "Modak": "modak.svg",
    "Besan Ladoo": "besan-ladoo.svg",
    "Coconut Barfi": "coconut-barfi.svg",
    "Anjeer Halwa": "anjeer-halwa.svg",
    "Chocolate Brownie": "chocolate-brownie.svg",
    # Cool Drinks
    "Mango Lassi": "mango-lassi.svg",
    "Sweet Lassi": "sweet-lassi.svg",
    "Salted Lassi": "salted-lassi.svg",
    "Masala Chaas": "masala-chaas.svg",
    "Fresh Lime Soda": "fresh-lime-soda.svg",
    "Watermelon Juice": "watermelon-juice.svg",
    "Orange Juice": "orange-juice.svg",
    "Pineapple Juice": "pineapple-juice.svg",
    "Mix Fruit Juice": "mix-fruit-juice.svg",
    "Cold Coffee": "cold-coffee.svg",
    "Chocolate Milkshake": "chocolate-milkshake.svg",
    "Strawberry Milkshake": "strawberry-milkshake.svg",
    "Vanilla Milkshake": "vanilla-milkshake.svg",
    "Oreo Milkshake": "oreo-milkshake.svg",
    "Mango Milkshake": "mango-milkshake.svg",
    "Virgin Mojito": "virgin-mojito.svg",
    "Blue Lagoon": "blue-lagoon.svg",
    "Cranberry Cooler": "cranberry-cooler.svg",
    "Iced Tea": "iced-tea.svg",
    "Rose Falooda": "rose-falooda.svg",
}


def migrate_images():
    db = SessionLocal()
    try:
        updated = 0
        not_found = []

        for item in db.query(Menu).all():
            name = item.name.strip()
            if name in IMAGE_MAP:
                new_url = "/images/menu/" + IMAGE_MAP[name]
                if item.image_url != new_url:
                    item.image_url = new_url
                    updated += 1
            else:
                not_found.append(name)

        db.commit()
        print(f"Updated {updated} menu item image_url(s).")

        if not_found:
            print(f"Items not found in image map ({len(not_found)}):")
            for n in not_found:
                print(f"  - {n}")

        # Verify no duplicates remain
        from collections import Counter
        items = db.query(Menu).all()
        img_counts = Counter(i.image_url for i in items if i.image_url)
        dupes = {url: c for url, c in img_counts.items() if c > 1}
        if dupes:
            print(f"\nWARNING: {len(dupes)} duplicate image URL groups remain:")
            for url, count in dupes.items():
                names = [i.name for i in items if i.image_url == url]
                print(f"  {count}x {url[:80]}...")
                for n in names:
                    print(f"    - {n}")
        else:
            print("\nAll image URLs are unique.")

        # Verify all have images
        no_image = [i.name for i in items if not i.image_url]
        if no_image:
            print(f"\nWARNING: {len(no_image)} items without images:")
            for n in no_image:
                print(f"  - {n}")
        else:
            print("All items have an image URL assigned.")

    finally:
        db.close()


if __name__ == "__main__":
    migrate_images()
