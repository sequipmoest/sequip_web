import geopandas as gpd
import os

shp_path = "maps/Districts and TC as 2020.shp"
df = gpd.read_file(shp_path)

# Select only necessary columns to keep size tiny
df = df[["Region_Nam", "NewDist20", "geometry"]]

# Rename columns to standard lowercase
df = df.rename(columns={"Region_Nam": "region", "NewDist20": "district"})

# Simplify geometry
df["geometry"] = df["geometry"].simplify(tolerance=0.004, preserve_topology=True)

# Write to GeoJSON
output_path = "maps/districts.geojson"
df.to_file(output_path, driver="GeoJSON")

size_kb = os.path.getsize(output_path) / 1024
print(f"GeoJSON saved successfully to {output_path}. File size: {size_kb:.2f} KB")
