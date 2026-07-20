with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# Update mapBtn click listener to fit bounds to all regions of Tanzania
old_map_click = """  mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    homeBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    mapView.style.display = 'grid';
    homeView.style.display = 'none';
    aboutView.style.display = 'none';
    
    // Trigger map load adjustments and invalidate size for Leaflet
    renderRegionDetails(activeRegion);
    if (leafMap) {
      setTimeout(() => {
        leafMap.invalidateSize();
        zoomToRegion(activeRegion);
      }, 50);
    }
  });"""

new_map_click = """  mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    homeBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    mapView.style.display = 'grid';
    homeView.style.display = 'none';
    aboutView.style.display = 'none';
    
    // Trigger map load adjustments and fit bounds to all 26 Tanzania regions
    renderRegionDetails(activeRegion);
    if (leafMap && geoJsonLayer) {
      setTimeout(() => {
        leafMap.invalidateSize();
        leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }, 50);
    }
  });"""

if old_map_click in code:
    code = code.replace(old_map_click, new_map_click, 1)
    print("Success: Updated mapBtn click listener to fit all regions.")
else:
    print("Warning: Could not find old_map_click in app.js.")

# Add listener for btnResetView inside setupLayerToggle()
old_setup = """function setupLayerToggle() {
  const btnChoropleth = document.getElementById('btnChoropleth');
  const btnPoints = document.getElementById('btnPoints');

  btnChoropleth.addEventListener('click', () => {
    activeMapLayer = 'choropleth';
    btnChoropleth.classList.add('active');
    btnPoints.classList.remove('active');
    btnChoropleth.style.background = 'var(--accent-green)';
    btnChoropleth.style.color = '#fff';
    btnPoints.style.background = 'transparent';
    btnPoints.style.color = 'var(--text-secondary)';
    
    renderMapLayers();
  });

  btnPoints.addEventListener('click', () => {
    activeMapLayer = 'points';
    btnPoints.classList.add('active');
    btnChoropleth.classList.remove('active');
    btnPoints.style.background = 'var(--accent-green)';
    btnPoints.style.color = '#fff';
    btnChoropleth.style.background = 'transparent';
    btnChoropleth.style.color = 'var(--text-secondary)';
    
    renderMapLayers();
  });
}"""

new_setup = """function setupLayerToggle() {
  const btnChoropleth = document.getElementById('btnChoropleth');
  const btnPoints = document.getElementById('btnPoints');
  const btnResetView = document.getElementById('btnResetView');

  if (btnChoropleth) {
    btnChoropleth.addEventListener('click', () => {
      activeMapLayer = 'choropleth';
      btnChoropleth.classList.add('active');
      btnPoints.classList.remove('active');
      btnChoropleth.style.background = 'var(--accent-green)';
      btnChoropleth.style.color = '#fff';
      btnPoints.style.background = 'transparent';
      btnPoints.style.color = 'var(--text-secondary)';
      
      renderMapLayers();
    });
  }

  if (btnPoints) {
    btnPoints.addEventListener('click', () => {
      activeMapLayer = 'points';
      btnPoints.classList.add('active');
      btnChoropleth.classList.remove('active');
      btnPoints.style.background = 'var(--accent-green)';
      btnPoints.style.color = '#fff';
      btnChoropleth.style.background = 'transparent';
      btnChoropleth.style.color = 'var(--text-secondary)';
      
      renderMapLayers();
    });
  }

  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      if (leafMap && geoJsonLayer) {
        leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }
    });
  }
}"""

if old_setup in code:
    code = code.replace(old_setup, new_setup, 1)
    print("Success: Updated setupLayerToggle.")

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

# Add btnResetView button to index.html inside map-layer-selector
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

old_selector = """          <div class="map-layer-selector" style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px; padding: 6px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-card); backdrop-filter: blur(10px); z-index: 1000;">
            <button id="btnChoropleth" class="layer-selector-btn active" style="background: var(--accent-green); border: none; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              New Schools Density
            </button>
            <button id="btnPoints" class="layer-selector-btn" style="background: transparent; border: none; color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              Girls' Schools
            </button>
          </div>"""

new_selector = """          <div class="map-layer-selector" style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px; padding: 6px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-card); backdrop-filter: blur(10px); z-index: 1000;">
            <button id="btnChoropleth" class="layer-selector-btn active" style="background: var(--accent-green); border: none; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              New Schools Density
            </button>
            <button id="btnPoints" class="layer-selector-btn" style="background: transparent; border: none; color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              Girls' Schools
            </button>
            <button id="btnResetView" class="layer-selector-btn" style="background: transparent; border: 1px solid var(--border-card); color: var(--text-primary); padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              🌍 All Regions
            </button>
          </div>"""

if old_selector in html:
    html = html.replace(old_selector, new_selector, 1)
    print("Success: Added All Regions button to map layer selector in index.html.")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Map view script completed successfully!")
