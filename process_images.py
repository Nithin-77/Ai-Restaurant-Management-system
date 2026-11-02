#!/usr/bin/env python3
"""
Center-crop all menu images to square 1024x1024 and check for duplicates.
"""

import hashlib
import os
import sys
from pathlib import Path

from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MENU_DIR = BASE_DIR / "frontend" / "public" / "images" / "menu"

TARGET_SIZE = 1024


def center_crop_square(img):
    """Center-crop image to square, then resize to TARGET_SIZE."""
    w, h = img.size
    if w == h:
        cropped = img
    elif w > h:
        # Crop from center horizontally
        left = (w - h) // 2
        cropped = img.crop((left, 0, left + h, h))
    else:
        # Crop from center vertically
        top = (h - w) // 2
        cropped = img.crop((0, top, w, top + w))
    return cropped.resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)


def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    # Process all jpg files
    jpg_files = sorted(MENU_DIR.glob("*.jpg"))
    print(f"Found {len(jpg_files)} JPG files in menu directory")

    # Backup originals first
    backup_dir = BASE_DIR / "frontend" / "public" / "images" / "menu_backup"
    if not backup_dir.exists():
        backup_dir.mkdir(parents=True, exist_ok=True)
        print(f"Created backup directory: {backup_dir}")
        for f in jpg_files:
            backup_path = backup_dir / f.name
            if not backup_path.exists():
                import shutil
                shutil.copy2(f, backup_path)
        print(f"Backed up {len(jpg_files)} files")
    else:
        print(f"Backup directory already exists, skipping backup")

    # Process each image
    processed = 0
    errors = []
    for f in jpg_files:
        try:
            img = Image.open(f)
            img = img.convert("RGB")
            square = center_crop_square(img)
            square.save(f, "JPEG", quality=85, optimize=True)
            processed += 1
        except Exception as e:
            errors.append((f.name, str(e)))
            print(f"  ERROR processing {f.name}: {e}")

    print(f"\nProcessed: {processed}, Errors: {len(errors)}")
    if errors:
        for name, err in errors:
            print(f"  {name}: {err}")

    # Check for SHA-256 duplicates
    print("\n--- SHA-256 Duplicate Check ---")
    hashes = {}
    for f in sorted(MENU_DIR.glob("*.jpg")):
        h = sha256_file(f)
        if h in hashes:
            print(f"  DUPLICATE: {f.name} == {hashes[h]}")
        else:
            hashes[h] = f.name
    print(f"Unique hashes: {len(hashes)}, Total files: {len(jpg_files)}")
    dupes = len(jpg_files) - len(hashes)
    print(f"Duplicate groups: {dupes}")

    # Verify dimensions after processing
    print("\n--- Dimension Check ---")
    non_square = 0
    for f in sorted(MENU_DIR.glob("*.jpg")):
        img = Image.open(f)
        if img.size != (TARGET_SIZE, TARGET_SIZE):
            non_square += 1
            print(f"  NOT {TARGET_SIZE}x{TARGET_SIZE}: {f.name} = {img.size}")
    print(f"All {TARGET_SIZE}x{TARGET_SIZE}: {len(jpg_files) - non_square}/{len(jpg_files)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
