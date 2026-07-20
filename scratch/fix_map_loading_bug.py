import re

# Update app.js
with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# Fix mapBtn listener
old_map_listener_pattern = r'mapBtn\.addEventListener\(\'click\', \(\) => \{.*?\}\);'

new_map_listener = """mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    homeBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    mapView.style.display = 'grid';
    homeView.style.display = 'none';
    aboutView.style.display = 'none';
    
    renderRegionDetails(activeRegion);
    
    if (leafMap) {
      leafMap.invalidateSize();
      setTimeout(() => {
        leafMap.invalidateSize();
        if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
          leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        } else {
          leafMap.setView([-6.369, 34.888], 6);
        }
      }, 100);
    }
  });"""

code = re.sub(old_map_listener_pattern, new_map_listener, code, flags=re.DOTALL)

# Fix initMapInteractions GeoJSON then block
old_then_pattern = r'regionsGeoJSON = geojson;\s*// Aggregate classrooms.*?\.catch'

new_then_block = """regionsGeoJSON = geojson;
      
      // Aggregate classrooms and dormitories by region
      aggregateRegionalClassroomsAndDorms();

      // Render default Choropleth layer
      renderMapLayers();

      // Bind layer toggle button click events
      setupLayerToggle();

      // Select default active region (Dodoma) on map visually
      selectRegion(activeRegion, false);

      if (leafMap) {
        leafMap.invalidateSize();
        if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
          leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        }
      }
    })
    .catch"""

code = re.sub(old_then_pattern, new_then_block, code, flags=re.DOTALL)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Success: Updated app.js map invalidation logic.")

# Update index.html to ensure #gisMap has min-height: 700px
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

old_gis_div = '<div id="gisMap" style="height: 100%; width: 100%; border-radius: 8px; background: transparent; z-index: 1;"></div>'
new_gis_div = '<div id="gisMap" style="height: 100%; min-height: 700px; width: 100%; border-radius: 8px; background: transparent; z-index: 1;"></div>'

if old_gis_div in html:
    html = html.replace(old_gis_div, new_gis_div)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Success: Updated #gisMap min-height in index.html.")
