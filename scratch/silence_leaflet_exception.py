with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update the layout switcher tab click listener Leaflet logic
old_block_tab = """    if (leafMap) {
      try {
        leafMap.invalidateSize({ pan: false });
      } catch (err) {
        console.warn("Leaflet invalidateSize error handled:", err);
      }
      setTimeout(() => {
        try {
          leafMap.invalidateSize({ pan: false });
          if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
            leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
          } else {
            leafMap.setView([-6.369, 34.888], 6);
          }
        } catch (err) {
          console.warn("Leaflet map resize handler error handled:", err);
        }
      }, 100);
    }"""

new_block_tab = """    if (leafMap) {
      try {
        leafMap.setView([-6.369, 34.888], 6, { animate: false });
        leafMap.invalidateSize({ pan: false });
      } catch (err) {
        // Silent catch
      }
      setTimeout(() => {
        try {
          leafMap.invalidateSize({ pan: false });
          if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
            leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
          } else {
            leafMap.setView([-6.369, 34.888], 6, { animate: false });
          }
        } catch (err) {
          // Silent catch
        }
      }, 100);
    }"""

code = code.replace(old_block_tab, new_block_tab)

# 2. Update initial load fitBounds catch to be silent
old_block_init = """      if (leafMap) {
        try {
          leafMap.invalidateSize({ pan: false });
          if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
            leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
          }
        } catch (err) {
          console.warn("Leaflet initial fitBounds error handled:", err);
        }
      }"""

new_block_init = """      if (leafMap) {
        try {
          leafMap.invalidateSize({ pan: false });
          if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
            leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
          }
        } catch (err) {
          // Silent catch
        }
      }"""

code = code.replace(old_block_init, new_block_init)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully silenced Leaflet console warnings.")
