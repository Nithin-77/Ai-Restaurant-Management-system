import os
from database import SessionLocal
from models import Menu
from collections import Counter

base_dir = r"C:\Users\BUDDY\Downloads\Ai-Restaurant-Management-system-main (1) zip file\Ai-Restaurant-Management-system-main\frontend\public\images\menu"

print("=" * 70)
print("IMAGE VALIDATION REPORT - Paradise Restaurant Menu")
print("=" * 70)

# 1. Check image files on disk
print("\n--- Image Files on Disk ---")
svg_files = [f for f in os.listdir(base_dir) if f.endswith(".svg")]
print(f"Total SVG files in /images/menu/: {len(svg_files)}")

# 2. Check database records
print("\n--- Database Records ---")
db = SessionLocal()
try:
    items = db.query(Menu).all()
    print(f"Total menu items in DB: {len(items)}")

    # Category counts
    for cat in ["Veg", "Non-Veg", "Desserts", "Cool Drinks"]:
        count = db.query(Menu).filter(Menu.category == cat).count()
        print(f"  {cat}: {count} items")

    # Check image_url values
    print("\n--- Image Path Validation ---")
    all_have_image = True
    missing_files = []
    duplicate_paths = []
    image_paths = []

    for item in items:
        url = item.image_url
        if not url:
            all_have_image = False
            print(f"  MISSING URL: {item.name}")
            continue

        # Extract filename from path like /images/menu/kadai-paneer.svg
        if url.startswith("/images/menu/"):
            filename = url.replace("/images/menu/", "")
            filepath = os.path.join(base_dir, filename)
            if not os.path.exists(filepath):
                missing_files.append((item.name, url))
            image_paths.append(url)
        else:
            print(f"  NON-LOCAL URL: {item.name} -> {url[:80]}...")

    # Check for duplicates
    path_counts = Counter(image_paths)
    dupes = {path: count for path, count in path_counts.items() if count > 1}
    if dupes:
        print(f"\nDUPLICATE IMAGE PATHS: {len(dupes)} groups")
        for path, count in dupes.items():
            names = [i.name for i in items if i.image_url == path]
            print(f"  {count}x {path}")
            for n in names:
                print(f"    - {n}")
    else:
        print(f"\nDUPLICATE IMAGE PATHS: 0 (all {len(image_paths)} paths are unique)")

    # Check missing files
    if missing_files:
        print(f"\nMISSING IMAGE FILES: {len(missing_files)}")
        for name, url in missing_files:
            print(f"  {name} -> {url}")
    else:
        print(f"\nMISSING IMAGE FILES: 0 (all {len(image_paths)} files exist on disk)")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total products: {len(items)}")
    print(f"Products with images: {sum(1 for i in items if i.image_url)}")
    print(f"Products without images: {sum(1 for i in items if not i.image_url)}")
    print(f"Image files on disk: {len(svg_files)}")
    print(f"Unique image paths in DB: {len(image_paths)}")
    print(f"Duplicate image paths: {len(dupes)}")
    print(f"Missing image files: {len(missing_files)}")
    print(f"All images unique: {len(dupes) == 0}")
    print(f"All image files exist: {len(missing_files) == 0}")
    print(f"All products have images: {all_have_image}")

    # List all products with their images
    print("\n--- Complete Product Image Listing ---")
    for cat in ["Veg", "Non-Veg", "Desserts", "Cool Drinks"]:
        cat_items = [i for i in items if i.category == cat]
        cat_items.sort(key=lambda x: x.name)
        print(f"\n{cat} ({len(cat_items)} items):")
        for item in cat_items:
            filename = item.image_url.replace("/images/menu/", "") if item.image_url else "NONE"
            exists = "OK" if (item.image_url and os.path.exists(os.path.join(base_dir, filename))) else "MISSING"
            print(f"  {item.name:40s} -> {filename:40s} [{exists}]")

finally:
    db.close()

print("\n" + "=" * 70)
print("VALIDATION COMPLETE")
print("=" * 70)
