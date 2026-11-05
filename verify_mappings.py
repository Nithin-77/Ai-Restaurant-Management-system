#!/usr/bin/env python3
"""Verify dishImages.js mappings against actual files."""

import re
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
with open(BASE_DIR / "frontend" / "src" / "dishImages.js", "r") as f:
    content = f.read()

matches = re.findall(r'"([^"]+)":\s*"/images/menu/([^"]+)"', content)
print(f"Total mappings in DISH_IMAGE_LIBRARY: {len(matches)}")

svg_count = sum(1 for _, url in matches if url.endswith(".svg"))
jpg_count = sum(1 for _, url in matches if url.endswith(".jpg"))
print(f"  .jpg: {jpg_count}, .svg: {svg_count}")

for name, url in matches:
    if not url.endswith(".jpg"):
        print(f"  NON-JPG: {name} -> {url}")

urls = [url for _, url in matches]
dup_urls = [url for url in set(urls) if urls.count(url) > 1]
if dup_urls:
    print(f"Duplicate URLs: {dup_urls}")
else:
    print("No duplicate URLs in DISH_IMAGE_LIBRARY")

menu_dir = BASE_DIR / "frontend" / "public" / "images" / "menu"
missing = []
for name, url in matches:
    fp = menu_dir / url
    if not fp.exists():
        missing.append((name, url))

print(f"Missing files on disk: {len(missing)}")
for name, url in missing:
    print(f"  {name} -> {url}")

if not missing and not dup_urls and svg_count == 0:
    print("\nAll mappings verified OK!")
