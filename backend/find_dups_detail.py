import re
from collections import Counter

with open('seed_menu.py', 'r', encoding='utf-8') as f:
    content = f.read()

urls = re.findall(r'https://images\.unsplash\.com/photo-[a-z0-9-]+', content)
url_counts = Counter(urls)
duplicates = {url: count for url, count in url_counts.items() if count > 1}

print("DUPLICATE URLS TO FIX:")
for url, count in duplicates.items():
    # Find which dishes use this URL
    pattern = rf'\(([^,]+),\s*"[^"]+",\s*\d+,\s*"{re.escape(url)}'
    matches = re.findall(pattern, content)
    print(f'  {count}x {url}')
    for m in matches:
        print(f'    - {m}')
