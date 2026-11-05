import re
from collections import Counter

with open('seed_menu.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all image URLs
urls = re.findall(r'https://images\.unsplash\.com/photo-[a-z0-9-]+', content)
print(f'Total image references: {len(urls)}')
print(f'Unique image references: {len(set(urls))}')

# Find duplicates
url_counts = Counter(urls)
duplicates = {url: count for url, count in url_counts.items() if count > 1}
print(f'Duplicate groups: {len(duplicates)}')
for url, count in duplicates.items():
    print(f'  {count}x: {url}')
