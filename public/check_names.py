import json
import csv
import sys

def normalize(name):
    return name.replace(" Province", "").replace(" County", "").replace(" ", "")

if len(sys.argv) != 3:
    print("Usage: python check_names.py <geojson_path> <csv_path>")
    sys.exit(1)

geojson_path = sys.argv[1]
csv_path = sys.argv[2]

# Load GeoJSON names
with open(geojson_path, encoding="utf-8") as f:
    geojson = json.load(f)
geojson_names = set()
for feature in geojson["features"]:
    name = feature.get("properties", {}).get("tags", {}).get("name:en", "")
    geojson_names.add(normalize(name))

# Load CSV names
with open(csv_path, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    csv_names = set()
    for row in reader:
        csv_names.add(normalize(row["name"]))

# Compare
print("GeoJSON names not in CSV:")
for name in sorted(geojson_names - csv_names):
    print("  ", name)

print("\nCSV names not in GeoJSON:")
for name in sorted(csv_names - geojson_names):
    print("  ", name)

print("\nNames present in both:")
for name in sorted(geojson_names & csv_names):
    print("  ", name)