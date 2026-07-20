import geopandas as gpd
import os

shp_path = "maps/Districts and TC as 2020.shp"
df = gpd.read_file(shp_path)

print("Original coordinate system:", df.crs)
print("Original row count:", len(df))

# Simplify the geometry to reduce size
# Since it is in EPSG:4326 (degrees), a tolerance of 0.005 degrees is approx 550 meters.
# Let's try different tolerances and measure the sizes.
for tol in [0.001, 0.002, 0.005, 0.01]:
    simplified = df.copy()
    simplified["geometry"] = simplified["geometry"].simplify(tolerance=tol, preserve_topology=True)
    temp_path = f"maps/districts_simplified_{tol}.geojson"
    simplified.to_file(temp_path, driver="GeoJSON")
    size_kb = os.path.getsize(temp_path) / 1024
    print(f"Tolerance {tol}: size = {size_kb:.2f} KB")
    # Clean up temp file
    os.remove(temp_path)
