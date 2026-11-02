#!/usr/bin/env python3
"""
Retry downloading images for 6 previously failed dishes using alternative search terms.
"""

import json
import re
import sys
import time
from pathlib import Path

import requests
from PIL import Image
from io import BytesIO

BASE_DIR = Path(__file__).resolve().parent
MENU_DIR = BASE_DIR / "frontend" / "public" / "images" / "menu"
PROGRESS_FILE = BASE_DIR / "download_progress.json"
ATTRIBUTION_FILE = MENU_DIR / "ATTRIBUTION.md"
USER_AGENT = "ParadiseRestaurantBot/1.0 (contact: admin@paradise-restaurant.example)"
API_BASE = "https://commons.wikimedia.org/w/api.php"
REQUEST_TIMEOUT = 30
DOWNLOAD_TIMEOUT = 60
DELAY_BETWEEN_REQUESTS = 1.0

# Failed dishes with alternative search terms
FAILED_DISHES = [
    ("Chicken Saagwala", "Non-Veg", "chicken-saagwala.jpg", ["Chicken Saag", "Saag Chicken", "Palak Chicken", "Chicken Saagwala"]),
    ("Chicken Tikka Masala", "Non-Veg", "chicken-tikka-masala.jpg", ["Chicken Tikka Masala", "Chicken Tikka", "Tikka Masala"]),
    ("Mutton Korma", "Non-Veg", "mutton-korma.jpg", ["Mutton Korma", "Korma", "Mutton Curry"]),
    ("Anjeer Halwa", "Desserts", "anjeer-halwa.jpg", ["Anjeer Halwa", "Fig Halwa", "Anjeer"]),
    ("Malpua", "Desserts", "malpua.jpg", ["Malpua", "Indian Pancake"]),
    ("Blue Lagoon", "Cool Drinks", "blue-lagoon.jpg", ["Blue Lagoon drink", "Blue Lagoon cocktail", "Blue Curacao"]),
]


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s + ".jpg"


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.setdefault("successful", [])
        data.setdefault("failed", [])
        data.setdefault("skipped", [])
        return data
    return {"successful": [], "failed": [], "skipped": []}


def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def search_commons(session, search_term):
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": search_term,
        "srnamespace": 6,
        "srlimit": 10,
        "origin": "*",
    }
    try:
        resp = session.get(API_BASE, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data.get("query", {}).get("search", [])
    except Exception as e:
        print(f"  Search error for '{search_term}': {e}")
        return []


def get_image_info(session, filename):
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
                    "file_page": f"https://commons.wikimedia.org/wiki/{filename.replace(' ', '_')}",
                }
    except Exception as e:
        print(f"  Image info error for '{filename}': {e}")
    return None


def _clean_html(text):
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
    return text.strip()


def download_image(session, image_url, output_path):
    try:
        resp = session.get(image_url, timeout=DOWNLOAD_TIMEOUT)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type:
            return False, f"Not an image: {content_type}"
        img = Image.open(BytesIO(resp.content))
        img.verify()
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


def append_attribution(entries):
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

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    attribution_entries = []

    for name, category, filename, search_terms in FAILED_DISHES:
        filepath = MENU_DIR / filename
        print(f"\n{'='*60}")
        print(f"Retrying: {name} ({category}) -> {filename}")
        print(f"{'='*60}")

        # Check if file already exists and is valid
        if filepath.exists():
            try:
                img = Image.open(filepath)
                img.verify()
                print(f"  File already exists and is valid: {filepath.stat().st_size} bytes")
                # Still try to find a better match
            except Exception:
                print(f"  Existing file is corrupted, will re-download")
                filepath.unlink()

        downloaded = False
        for term in search_terms:
            print(f"\n  Searching: '{term}'")
            results = search_commons(session, term)
            if not results:
                print(f"  No results for '{term}'")
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            # Pick the first result
            best = results[0]
            file_title = best["title"]
            print(f"  Found: {file_title}")

            info = get_image_info(session, file_title)
            if not info:
                print(f"  Could not get image info")
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            image_url = info["url"] if info["url"] else info["thumburl"]
            if not image_url:
                print(f"  No image URL")
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            print(f"  URL: {image_url}")
            print(f"  License: {info['license']} | Author: {info['author']}")

            success, result = download_image(session, image_url, filepath)
            if not success:
                print(f"  Download failed: {result}")
                time.sleep(DELAY_BETWEEN_REQUESTS)
                continue

            detail = result
            print(f"  Downloaded OK: {detail['format']} {detail['size'][0]}x{detail['size'][1]} ({detail['bytes']} bytes)")

            # Update progress
            # Remove from failed if present
            progress["failed"] = [e for e in progress["failed"] if e[0].lower() != name.lower()]
            progress["successful"].append([name, category, filename, f"Downloaded via '{term}'"])

            attribution_entries.append({
                "product_name": name,
                "filename": filename,
                "file_page": info["file_page"],
                "image_url": image_url,
                "author": info["author"],
                "license": info["license"],
                "license_url": info["license_url"],
            })

            downloaded = True
            break

        time.sleep(DELAY_BETWEEN_REQUESTS)

        if not downloaded:
            print(f"  FAILED: Could not download image for {name} with any search term")

        save_progress(progress)
        time.sleep(DELAY_BETWEEN_REQUESTS)

    # Write attribution
    append_attribution(attribution_entries)

    # Final summary
    print(f"\n{'='*60}")
    print("RETRY COMPLETE")
    print(f"{'='*60}")
    print(f"Successful: {len(progress['successful'])}")
    print(f"Failed: {len(progress['failed'])}")
    print(f"Skipped: {len(progress['skipped'])}")

    if progress["failed"]:
        print("\nStill failed:")
        for entry in progress["failed"]:
            print(f"  - {entry[0]} ({entry[1]}): {entry[3]}")

    save_progress(progress)
    return 0


if __name__ == "__main__":
    sys.exit(main())
