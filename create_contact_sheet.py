#!/usr/bin/env python3
"""
Create a contact sheet showing all 80 generated images with dish names.
"""

from pathlib import Path
import re
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent
MENU_DIR = BASE_DIR / "frontend" / "public" / "images" / "menu"
OUTPUT_FILE = BASE_DIR / "contact_sheet.png"

# All 80 dishes in order: (name, category)
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
    ("Kadai Paneer", "Veg"),
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

THUMB_SIZE = 200
LABEL_HEIGHT = 60
COLS = 10
ROWS = 8

# Category colors for visual grouping
CAT_COLORS = {
    "Veg": (76, 175, 80),
    "Non-Veg": (211, 47, 47),
    "Desserts": (233, 30, 99),
    "Cool Drinks": (33, 150, 243),
}

# Load all images
cells = []
for name, category in ALL_DISHES:
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-") + ".jpg"
    fp = MENU_DIR / slug
    if fp.exists():
        img = Image.open(fp).convert("RGB")
        img = img.resize((THUMB_SIZE, THUMB_SIZE), Image.LANCZOS)
        cells.append((img, name, category))
    else:
        # Create a placeholder cell
        img = Image.new("RGB", (THUMB_SIZE, THUMB_SIZE), (200, 200, 200))
        cells.append((img, name, category))

# Calculate sheet dimensions
sheet_w = COLS * THUMB_SIZE
sheet_h = ROWS * (THUMB_SIZE + LABEL_HEIGHT) + 40
sheet = Image.new("RGB", (sheet_w, sheet_h), (245, 245, 245))
draw = ImageDraw.Draw(sheet)

# Try to load a font
try:
    font = ImageFont.truetype("arial.ttf", 16)
    font_small = ImageFont.truetype("arial.ttf", 12)
except Exception:
    font = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Title
draw.text((20, 10), "Paradise Restaurant - Menu Image Contact Sheet", fill=(30, 30, 30), font=font)
draw.text((20, 32), f"Total: {len(cells)} images | 20 Veg | 20 Non-Veg | 20 Desserts | 20 Cool Drinks",
          fill=(80, 80, 80), font=font_small)

# Draw each cell
for idx, (img, name, category) in enumerate(cells):
    row = idx // COLS
    col = idx % COLS
    x = col * THUMB_SIZE
    y = 50 + row * (THUMB_SIZE + LABEL_HEIGHT)

    # Paste image
    sheet.paste(img, (x, y))

    # Draw category color bar
    color = CAT_COLORS.get(category, (128, 128, 128))
    draw.rectangle([x, y + THUMB_SIZE, x + THUMB_SIZE, y + THUMB_SIZE + 6], fill=color)

    # Draw dish name (wrapped)
    name_lines = []
    words = name.split()
    line = ""
    for word in words:
        if len(line + word) < 22:
            line = (line + " " + word).strip()
        else:
            name_lines.append(line)
            line = word
    if line:
        name_lines.append(line)

    text_y = y + THUMB_SIZE + 10
    for line in name_lines[:3]:
        draw.text((x + 2, text_y), line, fill=(30, 30, 30), font=font_small)
        text_y += 14

sheet.save(OUTPUT_FILE, "PNG")
print(f"Contact sheet saved: {OUTPUT_FILE} ({sheet.size[0]}x{sheet.size[1]})")
