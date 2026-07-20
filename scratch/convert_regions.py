import geopandas as gpd
import os

shp_path = "maps/Districts and TC as 2020.shp"
print("Loading shapefile...")
df = gpd.read_file(shp_path)

print("Dissolving districts by Region_Nam...")
# Dissolve by Region_Nam
regions_df = df.dissolve(by="Region_Nam").reset_index()

# Select only necessary columns
regions_df = regions_df[["Region_Nam", "geometry"]]
regions_df = regions_df.rename(columns={"Region_Nam": "region"})

# Clean region names to title case or standard upper case
# The map regions are in standard title case or uppercase. Let's keep them uppercase, 
# but we can standardise them. Let's make sure it matches what is in data.js.
# In data.js they are uppercase in District_Data (e.g. "ARUSHA", "DAR ES SALAAM", "DODOMA"), 
# and in SEQUIP_DATA.regional they are Title Case (e.g. "Mbeya", "Rukwa", "Dar es Salaam").
# Let's keep them as original (which is uppercase in the shapefile, e.g. "ARUSHA") and 
# we can clean it to title case in the script or in JS. Doing it in JS is extremely easy.
# Let's clean it in Python so it matches exactly:
def to_title_case(name):
    if not name:
        return ""
    name = str(name).strip().upper()
    # Exceptions
    if name == "DAR ES SALAAM":
        return "Dar es Salaam"
    words = name.split()
    return " ".join(w.capitalize() for w in words)

regions_df["region"] = regions_df["region"].apply(to_title_case)

# Simplify geometries to keep file size small and render very fast
print("Simplifying geometry...")
regions_df["geometry"] = regions_df["geometry"].simplify(tolerance=0.005, preserve_topology=True)

output_path = "maps/regions.geojson"
print(f"Saving to GeoJSON at {output_path}...")
regions_df.to_file(output_path, driver="GeoJSON")

size_kb = os.path.getsize(output_path) / 1024
print(f"Regions GeoJSON saved successfully! Size: {size_kb:.2f} KB")
