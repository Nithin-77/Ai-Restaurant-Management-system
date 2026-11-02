#!/usr/bin/env python3
"""
Download real food photographs from Wikimedia Commons for Paradise Restaurant menu items.

Processes dishes in batches, validates each image, records attribution.
Resumes from where it left off using a progress manifest.
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import requests
from PIL import Image
from io import BytesIO

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MENU_DIR = BASE_DIR / "frontend" / "public" / "images" / "menu"
ATTRIBUTION_FILE = MENU_DIR / "ATTRIBUTION.md"
PROGRESS_FILE = BASE_DIR / "download_progress.json"
USER_AGENT = "ParadiseRestaurantBot/1.0 (contact: admin@paradise-restaurant.example)"
API_BASE = "https://commons.wikimedia.org/w/api.php"
REQUEST_TIMEOUT = 30
DOWNLOAD_TIMEOUT = 60
BATCH_SIZE = 10
DELAY_BETWEEN_REQUESTS = 1.0  # seconds, respect Wikimedia rate limits

# All 80 menu dishes from seed_menu.py, in order: (name, category)
ALL_DISHES = [
    # Veg (20)
    ("Vegetable Dum Biryani", "Veg"),
    ("Paneer Butter Masala", "Veg"),
    ("Paneer Tikka Masala", "Veg"),
    ("Palak Paneer", "Veg"),
    ("Vegetable Korma", "Veg"),
    ("Malai Kofta", "Veg"),
    ("Chana Masala", "Veg"),
    ("Dal Makhani", "Veg"),
    ("Vegetable Fried Rice", "Veg"),
    ("Jeera Rice", "Veg"),
    ("Veg Pulao", "Veg"),
    ("Aloo Gobi", "Veg"),
    ("Bhindi Masala", "Veg"),
    ("Mushroom Masala", "Veg"),
    ("Kadai Paneer", "Veg"),           # already downloaded - skip
    ("Navratan Korma", "Veg"),
    ("Paneer Bhurji", "Veg"),
    ("Vegetable Jalfrezi", "Veg"),
    ("Corn Palak", "Veg"),
    ("Gobi Manchurian", "Veg"),
    # Non-Veg (20)
    ("Hyderabadi Chicken Dum Biryani", "Non-Veg"),
    ("Chicken Butter Masala", "Non-Veg"),
    ("Chicken Tikka Masala", "Non-Veg"),
    ("Chicken Korma", "Non-Veg"),
    ("Chicken Chettinad", "Non-Veg"),
    ("Mutton Rogan Josh", "Non-Veg"),
    ("Mutton Biryani", "Non-Veg"),
    ("Fish Curry", "Non-Veg"),
    ("Prawn Masala", "Non-Veg"),
    ("Chicken 65", "Non-Veg"),
    ("Tandoori Chicken", "Non-Veg"),
    ("Chicken Lollipop", "Non-Veg"),
    ("Mutton Kheema", "Non-Veg"),
    ("Chicken Kolhapuri", "Non-Veg"),
    ("Amritsari Fish", "Non-Veg"),
    ("Chicken Saagwala", "Non-Veg"),
    ("Egg Curry", "Non-Veg"),
    ("Mutton Korma", "Non-Veg"),
    ("Chicken Vindaloo", "Non-Veg"),
    ("Fish Tikka", "Non-Veg"),
    # Desserts (20)
    ("Gulab Jamun", "Desserts"),
    ("Rasmalai", "Desserts"),
    ("Kesar Kulfi", "Desserts"),
    ("Gajar Ka Halwa", "Desserts"),
    ("Shahi Tukda", "Desserts"),
    ("Kaju Katli", "Desserts"),
    ("Rasgulla", "Desserts"),
    ("Mysore Pak", "Desserts"),
    ("Phirni", "Desserts"),
    ("Jalebi", "Desserts"),
    ("Malpua", "Desserts"),
    ("Kheer", "Desserts"),
    ("Sandesh", "Desserts"),
    ("Cham Cham", "Desserts"),
    ("Peda", "Desserts"),
    ("Modak", "Desserts"),
    ("Besan Ladoo", "Desserts"),
    ("Coconut Barfi", "Desserts"),
    ("Anjeer Halwa", "Desserts"),
    ("Chocolate Brownie", "Desserts"),
    # Cool Drinks (20)
    ("Mango Lassi", "Cool Drinks"),
    ("Sweet Lassi", "Cool Drinks"),
    ("Salted Lassi", "Cool Drinks"),
    ("Masala Chaas", "Cool Drinks"),
    ("Fresh Lime Soda", "Cool Drinks"),
    ("Watermelon Juice", "Cool Drinks"),
    ("Orange Juice", "Cool Drinks"),
    ("Pineapple Juice", "Cool Drinks"),
    ("Mix Fruit Juice", "Cool Drinks"),
    ("Cold Coffee", "Cool Drinks"),
    ("Chocolate Milkshake", "Cool Drinks"),
    ("Strawberry Milkshake", "Cool Drinks"),
    ("Vanilla Milkshake", "Cool Drinks"),
    ("Oreo Milkshake", "Cool Drinks"),
    ("Mango Milkshake", "Cool Drinks"),
    ("Virgin Mojito", "Cool Drinks"),
    ("Blue Lagoon", "Cool Drinks"),
    ("Cranberry Cooler", "Cool Drinks"),
    ("Iced Tea", "Cool Drinks"),
    ("Rose Falooda", "Cool Drinks"),
]


def slugify(name: str) -> str:
    """Convert dish name to a lowercase filename slug."""
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s + ".jpg"


def load_progress():
    """Load the progress manifest if it exists."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Ensure all required keys exist
        data.setdefault("successful", [])
        data.setdefault("failed", [])
        data.setdefault("skipped", [])
        return data
    return {"successful": [], "failed": [], "skipped": []}


def save_progress(progress):
    """Save the progress manifest."""
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def already_done(progress, name):
    """Check if a dish is already in successful or skipped list."""
    for entry in progress.get("successful", []) + progress.get("skipped", []):
        if entry[0].lower() == name.lower():
            return True
    return False


def search_commons(session, dish_name):
    """Search Wikimedia Commons for an image file matching the dish name.
    Returns list of search results (titles)."""
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": dish_name,
        "srnamespace": 6,  # File namespace
        "srlimit": 10,
        "origin": "*",
    }
    try:
        resp = session.get(API_BASE, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data.get("query", {}).get("search", [])
    except Exception as e:
        print(f"  Search error for '{dish_name}': {e}")
        return []


def get_image_info(session, filename):
    """Get image URL, license, author, and dimensions for a Wikimedia file."""
    params = {
        "action": "query",
        "format": "json",
        "titles": filename,
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": 1024,
        "iiurlheight": 1024,
        "origin": "*",
    }
    try:
        resp = session.get(API_BASE, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in pages.items():
            if "imageinfo" in page:
                info = page["imageinfo"][0]
                ext = info.get("extmetadata", {})
                return {
                    "url": info.get("url", ""),
                    "thumburl": info.get("thumburl", ""),
                    "width": info.get("width", 0),
                    "height": info.get("height", 0),
                    "mime": info.get("mime", ""),
                    "author": _clean_html(ext.get("Artist", {}).get("value", "Unknown")),
                    "license": ext.get("LicenseShortName", {}).get("value", "Unknown"),
                    "license_url": ext.get("LicenseUrl", {}).get("value", ""),
                    "usage_terms": _clean_html(ext.get("UsageTerms", {}).get("value", "")),
                    "description": _clean_html(ext.get("ImageDescription", {}).get("value", "")),
                    "file_page": f"https://commons.wikimedia.org/wiki/{filename.replace(' ', '_')}",
                }
    except Exception as e:
        print(f"  Image info error for '{filename}': {e}")
    return None


def _clean_html(text):
    """Strip basic HTML tags from a string."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
    return text.strip()


def download_image(session, image_url, output_path):
    """Download an image from a URL and save it locally."""
    try:
        resp = session.get(image_url, timeout=DOWNLOAD_TIMEOUT)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type:
            return False, f"Not an image: {content_type}"
        # Validate with Pillow
        img = Image.open(BytesIO(resp.content))
        img.verify()
        # Re-open to get format and ensure it's loadable
        img = Image.open(BytesIO(resp.content))
        img.load()
        with open(output_path, "wb") as f:
            f.write(resp.content)
        return True, {
            "format": img.format,
            "size": img.size,
            "mode": img.mode,
            "bytes": len(resp.content),
        }
    except Exception as e:
        return False, str(e)


def select_best_result(search_results, dish_name):
    """From search results, pick the best matching image.
    Prefers exact dish name matches in title."""
    dish_lower = dish_name.lower()
    # First pass: exact-ish match in title
    exact_matches = []
    partial_matches = []
    for r in search_results:
        title = r.get("title", "")
        title_lower = title.lower()
        # Check if dish name words appear in title
        dish_words = dish_lower.split()
        if all(w in title_lower for w in dish_words if len(w) > 2):
            exact_matches.append(r)
        else:
            partial_matches.append(r)
    if exact_matches:
        return exact_matches[0]
    if partial_matches:
        return partial_matches[0]
    return None


def append_attribution(entries):
    """Append attribution entries to the ATTRIBUTION.md file."""
    if not entries:
        return
    with open(ATTRIBUTION_FILE, "a", encoding="utf-8") as f:
        for e in entries:
            f.write(f"\n## {e['product_name']}\n")
            f.write(f"- **Local filename:** {e['filename']}\n")
            f.write(f"- **File page:** {e['file_page']}\n")
            f.write(f"- **Direct URL:** {e['image_url']}\n")
            f.write(f"- **Author:** {e['author']}\n")
            f.write(f"- **License:** {e['license']}\n")
            f.write(f"- **License URL:** {e['license_url']}\n")


def main():
    MENU_DIR.mkdir(parents=True, exist_ok=True)
    progress = load_progress()

    # Determine which dishes still need processing
    remaining = []
    for name, category in ALL_DISHES:
        if name.lower() == "kadai paneer":
            # Already done - mark as skipped in progress
            if not any(e[0].lower() == "kadai paneer" for e in progress["skipped"]):
                progress["skipped"].append(["Kadai Paneer", "Veg", "kadai-paneer.jpg", "Already installed"])
            continue
        if already_done(progress, name):
            continue
        filename = slugify(name)
        filepath = MENU_DIR / filename
        if filepath.exists():
            # File already exists on disk, mark as successful
            progress["successful"].append([name, category, filename, "File already existed"])
            continue
        remaining.append((name, category))

    print(f"Total dishes: {len(ALL_DISHES)}")
    print(f"Already processed: {len(progress['successful']) + len(progress['skipped'])}")
    print(f"Remaining to download: {len(remaining)}")
    print(f"Output directory: {MENU_DIR}")
    print()

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    # Process in batches
    attribution_entries = []
    batch_num = 0

    for i in range(0, len(remaining), BATCH_SIZE):
        batch = remaining[i:i + BATCH_SIZE]
        batch_num += 1
        print(f"\n{'='*60}")
        print(f"BATCH {batch_num}: processing {len(batch)} dishes")
        print(f"{'='*60}")

        for name, category in batch:
            filename = slugify(name)
            filepath = MENU_DIR / filename

            print(f"\nProcessing: {name} ({category}) -> {filename}")

            # Step 1: Search
            results = search_commons(session, name)
            if not results:
                print(f"  No search results for '{name}'")
                progress["failed"].append([name, category, filename, "No search results"])
                save_progress(progress)
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            # Step 2: Select best result
            best = select_best_result(results, name)
            if not best:
                print(f"  No suitable result for '{name}'")
                progress["failed"].append([name, category, filename, "No suitable result"])
                save_progress(progress)
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            file_title = best["title"]
            print(f"  Found: {file_title}")

            # Step 3: Get image info
            info = get_image_info(session, file_title)
            if not info:
                print(f"  Could not get image info for '{file_title}'")
                progress["failed"].append([name, category, filename, "No image info"])
                save_progress(progress)
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            # Prefer original URL over thumbnail
            image_url = info["url"] if info["url"] else info["thumburl"]
            if not image_url:
                print(f"  No image URL for '{file_title}'")
                progress["failed"].append([name, category, filename, "No image URL"])
                save_progress(progress)
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            print(f"  URL: {image_url}")
            print(f"  License: {info['license']} | Author: {info['author']} | Size: {info['width']}x{info['height']}")

            # Step 4: Download
            success, result = download_image(session, image_url, filepath)
            if not success:
                print(f"  Download failed: {result}")
                progress["failed"].append([name, category, filename, f"Download failed: {result}"])
                save_progress(progress)
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            # Step 5: Record success
            detail = result
            print(f"  Downloaded OK: {detail['format']} {detail['size'][0]}x{detail['size'][1]} ({detail['bytes']} bytes)")

            progress["successful"].append([name, category, filename, "Downloaded"])
            attribution_entries.append({
                "product_name": name,
                "filename": filename,
                "file_page": info["file_page"],
                "image_url": image_url,
                "author": info["author"],
                "license": info["license"],
                "license_url": info["license_url"],
            })

            # Write attribution after each success
            append_attribution(attribution_entries)
            attribution_entries = []

            save_progress(progress)
            time.sleep(DELAY_BETWEEN_REQUESTS)

    # Final summary
    print(f"\n{'='*60}")
    print("DOWNLOAD COMPLETE")
    print(f"{'='*60}")
    print(f"Successful: {len(progress['successful'])}")
    print(f"Failed: {len(progress['failed'])}")
    print(f"Skipped: {len(progress['skipped'])}")

    if progress["failed"]:
        print("\nFailed dishes:")
        for entry in progress["failed"]:
            print(f"  - {entry[0]} ({entry[1]}): {entry[3]}")

    save_progress(progress)
    return 0


if __name__ == "__main__":
    sys.exit(main())
