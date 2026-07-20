import json
import re

# Read data.js to extract District_Data
with open("data.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# Find the District_Data array
match = re.search(r"SEQUIP_ME_DATA\.District_Data\s*=\s*(\[\[.*?\]\]);", js_content)
if not match:
    print("Error: Could not extract District_Data from data.js")
    exit(1)

district_data = json.loads(match.group(1))

# Read maps/districts.geojson
with open("maps/districts.geojson", "r", encoding="utf-8") as f:
    geojson = json.load(f)

geojson_districts = [feat["properties"]["district"] for feat in geojson["features"]]

# JS Clean logic python implementation
def clean_name(name):
    if not name:
        return ""
    name = str(name).upper().strip()
    name = re.sub(r"['’`-]", "", name)
    # Remove suffixes
    suffixes = [
        " CITY COUNCIL", " MUNICIPAL COUNCIL", " TOWN COUNCIL", " DISTRICT COUNCIL",
        " CITY", " MUNICIPAL", " TC", " DC", " MC", " CC", " JIJI", " COUNCIL", " HALMASHAURI"
    ]
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
        name = name.replace(suffix, "")
    
    name = re.sub(r"\s+", " ", name).strip()
    
    # Exceptions
    exceptions = {
        "NSIASI": "NSIMBO",
        "TANGANYIKA": "MPANDA",
        "KIGOMA UJIJI": "KIGOMA",
        "MTAMA": "LINDI",
        "NYANGHWALE": "NYANGWALE",
        "WANGINGOMBE": "WANGING'OMBE"
    }
    
    if name in exceptions:
        return exceptions[name]
    return name

# Test matching
csv_cleaned = set()
for row in district_data:
    region, district = row[0], row[1]
    csv_cleaned.add(clean_name(district))

geojson_cleaned = set(clean_name(d) for d in geojson_districts)

missing_in_geojson = csv_cleaned - geojson_cleaned
print(f"Total CSV unique clean districts: {len(csv_cleaned)}")
print(f"Total GeoJSON unique clean districts: {len(geojson_cleaned)}")
print(f"Missing in GeoJSON: {len(missing_in_geojson)}")
if missing_in_geojson:
    print("Missing names:", sorted(list(missing_in_geojson)))
    
    # Print some close suggestions from geojson_cleaned for missing
    for m in missing_in_geojson:
        close = [g for g in geojson_cleaned if g[:3] == m[:3]]
        print(f"  For '{m}', close geojson names: {close}")
else:
    print("Success! 100% match achieved!")
