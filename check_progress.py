import json

with open("download_progress.json") as f:
    data = json.load(f)

print(f"Successful: {len(data['successful'])}")
print(f"Failed: {len(data['failed'])}")
print(f"Skipped: {len(data['skipped'])}")
if data["failed"]:
    print("Failed:")
    for e in data["failed"]:
        print(f"  {e[0]}: {e[3]}")
