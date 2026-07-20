import re

with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update global variables
code = code.replace("let districtsGeoJSON = null;", "let regionsGeoJSON = null;")

# 2. Replace initMapInteractions
start_interactions = "function initMapInteractions() {"
select_region_start = "function selectRegion("
start_idx = code.find(start_interactions)
end_idx = code.find(select_region_start)

if start_idx != -1 and end_idx != -1:
    old_interactions = code[start_idx:end_idx]
    new_interactions = """function initMapInteractions() {
  if (leafMap) return;

  // Initialize Leaflet Map centered on Tanzania (increased zoom control offset)
  leafMap = L.map('gisMap', {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false
  }).setView([-6.369, 34.888], 6);

  // Set up tile layer (removes tile layers for pure vector map)
  updateMapTiles();

  // Create layer group for Girls' schools markers
  girlsSchoolsLayerGroup = L.layerGroup();

  // Fetch the simplified regional geojson
  fetch('maps/regions.geojson')
    .then(response => {
      if (!response.ok) throw new Error("Failed to load geojson");
      return response.json();
    })
    .then(geojson => {
      regionsGeoJSON = geojson;
      
      // Aggregate classrooms and dormitories by region
      aggregateRegionalClassroomsAndDorms();

      // Render default Choropleth layer
      renderMapLayers();

      // Bind layer toggle button click events
      setupLayerToggle();

      // Select default active region (Dodoma) on map visually
      selectRegion(activeRegion, false);
    })
    .catch(err => {
      console.error("GIS Map Loading Error:", err);
    });
}

"""
    code = code.replace(old_interactions, new_interactions, 1)
    print("Success: Updated initMapInteractions.")
else:
    print("Error: Could not find initMapInteractions bounds.")

# 3. Replace selectRegion
start_select = "function selectRegion("
render_details_start = "function renderRegionDetails("
start_idx = code.find(start_select)
end_idx = code.find(render_details_start)

if start_idx != -1 and end_idx != -1:
    old_select = code[start_idx:end_idx]
    new_select = """function selectRegion(regionName, zoom = true) {
  activeRegion = regionName;
  
  // Highlight the matching region boundary on the map
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const isSelectedRegion = layer.feature.properties.region.toUpperCase() === regionName.toUpperCase();
      if (isSelectedRegion) {
        layer.setStyle({
          weight: 3,
          color: 'var(--accent-gold)',
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }
      } else {
        geoJsonLayer.resetStyle(layer);
      }
    });
  }
  
  renderRegionDetails(regionName);
  
  if (isComparing) {
    updateComparisonView();
  }

  if (zoom) {
    zoomToRegion(regionName);
  }
}

"""
    code = code.replace(old_select, new_select, 1)
    print("Success: Updated selectRegion.")
else:
    print("Error: Could not find selectRegion bounds.")

# 4. Replace updateMapTiles
old_tile_fn = """function updateMapTiles() {
  if (tileLayerInstance) {
    leafMap.removeLayer(tileLayerInstance);
  }
  
  const isDark = currentTheme === 'dark';
  const tileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  
  tileLayerInstance = L.tileLayer(tileUrl, {
    maxZoom: 18,
    attribution: attribution
  }).addTo(leafMap);
}"""

new_tile_fn = """function updateMapTiles() {
  if (tileLayerInstance) {
    leafMap.removeLayer(tileLayerInstance);
    tileLayerInstance = null;
  }
  // Standalone vector map (no background tiles served)
}"""

if old_tile_fn in code:
    code = code.replace(old_tile_fn, new_tile_fn, 1)
    print("Success: Updated updateMapTiles.")
else:
    print("Warning: Could not find updateMapTiles exact match, trying regex...")
    code, count = re.subn(r"function updateMapTiles\(\)\s*\{.*?\}", new_tile_fn, code, flags=re.DOTALL)
    if count > 0:
        print("Success: Updated updateMapTiles via regex.")
    else:
        print("Error: Failed to update updateMapTiles.")

# 5. Replace renderMapLayers
old_render_layers = """function renderMapLayers() {
  if (geoJsonLayer) {
    leafMap.removeLayer(geoJsonLayer);
  }
  
  const isDark = currentTheme === 'dark';
  const strokeColor = isDark ? '#0f172a' : '#f1f5f9';
  
  geoJsonLayer = L.geoJSON(districtsGeoJSON, {
    style: function(feature) {
      const metrics = feature.properties.metrics;
      const count = metrics.new_schools;
      
      const isSelectedRegion = feature.properties.region.toUpperCase() === activeRegion.toUpperCase();
      
      return {
        fillColor: activeMapLayer === 'choropleth' ? getChoroplethColor(count) : 'rgba(0, 0, 0, 0.02)',
        weight: isSelectedRegion ? 2.5 : 1,
        opacity: 0.6,
        color: isSelectedRegion ? 'var(--accent-gold)' : strokeColor,
        fillOpacity: activeMapLayer === 'choropleth' ? 0.85 : 0.1
      };
    },
    onEachFeature: function(feature, layer) {
      const properties = feature.properties;
      const metrics = properties.metrics;
      
      // Bind hover events
      layer.on({
        mouseover: function(e) {
          const l = e.target;
          const isSelected = properties.region.toUpperCase() === activeRegion.toUpperCase();
          
          l.setStyle({
            weight: 3,
            color: '#fff',
            opacity: 1,
            fillOpacity: activeMapLayer === 'choropleth' ? 0.95 : 0.25
          });
          
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
          }
          
          // Update and show floating tooltip
          const tooltip = document.getElementById('mapTooltip');
          tooltip.innerHTML = `
            <h4>${properties.district}</h4>
            <div class="tooltip-row"><span class="tooltip-label">Region:</span><span class="tooltip-val">${properties.region}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">New Schools:</span><span class="tooltip-val">${metrics.new_schools}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Classrooms:</span><span class="tooltip-val">${metrics.classrooms}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Dormitories:</span><span class="tooltip-val">${metrics.dormitories}</span></div>
            ${metrics.girls_schools > 0 ? `<div style="margin-top: 6px; color: var(--accent-green); font-weight: 700;">★ Special Girls' School Built</div>` : ''}
          `;
          tooltip.style.display = 'block';
        },
        mousemove: function(e) {
          const tooltip = document.getElementById('mapTooltip');
          const mapContainerRect = document.querySelector('.map-container').getBoundingClientRect();
          const x = e.originalEvent.clientX - mapContainerRect.left + 15;
          const y = e.originalEvent.clientY - mapContainerRect.top + 15;
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y}px`;
        },
        mouseout: function(e) {
          geoJsonLayer.resetStyle(e.target);
          
          // Restore selected region styles
          const isSelected = properties.region.toUpperCase() === activeRegion.toUpperCase();
          if (isSelected) {
            e.target.setStyle({
              weight: 2.5,
              color: 'var(--accent-gold)',
              opacity: 1
            });
          }
          
          const tooltip = document.getElementById('mapTooltip');
          tooltip.style.display = 'none';
        },
        click: function(e) {
          // Select region and zoom
          selectRegion(properties.region, true);
        }
      });
    }
  }).addTo(leafMap);
  
  // Re-render points layer if needed
  if (activeMapLayer === 'points') {
    girlsSchoolsLayerGroup.addTo(leafMap);
    renderGirlsSchoolsPoints();
  } else {
    leafMap.removeLayer(girlsSchoolsLayerGroup);
  }
}"""

new_render_layers = """function renderMapLayers() {
  if (geoJsonLayer) {
    leafMap.removeLayer(geoJsonLayer);
  }
  
  const isDark = currentTheme === 'dark';
  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.2)';
  
  geoJsonLayer = L.geoJSON(regionsGeoJSON, {
    style: function(feature) {
      const regionName = feature.properties.region;
      const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
      const count = regData.schools;
      
      const isSelectedRegion = regionName.toUpperCase() === activeRegion.toUpperCase();
      
      return {
        fillColor: activeMapLayer === 'choropleth' ? getChoroplethColor(count) : 'rgba(148, 163, 184, 0.04)',
        weight: isSelectedRegion ? 3 : 1.5,
        opacity: 0.8,
        color: isSelectedRegion ? 'var(--accent-gold)' : strokeColor,
        fillOpacity: activeMapLayer === 'choropleth' ? 0.85 : 0.2
      };
    },
    onEachFeature: function(feature, layer) {
      const properties = feature.properties;
      const regionName = properties.region;
      const regData = SEQUIP_DATA.regional[regionName] || { schools: 0, teachers_trained: 0, textbooks_distributed: 0, girls_science_schools: 0 };
      const infra = regionalClassroomsAndDorms[regionName] || { classrooms: 0, dormitories: 0 };
      
      // Bind hover events
      layer.on({
        mouseover: function(e) {
          const l = e.target;
          l.setStyle({
            weight: 3,
            color: '#fff',
            opacity: 1,
            fillOpacity: activeMapLayer === 'choropleth' ? 0.95 : 0.35
          });
          
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
          }
          
          // Update and show floating tooltip
          const tooltip = document.getElementById('mapTooltip');
          tooltip.innerHTML = `
            <h4>${regionName} Region</h4>
            <div class="tooltip-row"><span class="tooltip-label">New Schools:</span><span class="tooltip-val">${regData.schools}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Classrooms:</span><span class="tooltip-val">${infra.classrooms.toLocaleString()}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Dormitories:</span><span class="tooltip-val">${infra.dormitories.toLocaleString()}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Teachers Trained:</span><span class="tooltip-val">${regData.teachers_trained.toLocaleString()}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Textbooks:</span><span class="tooltip-val">${regData.textbooks_distributed.toLocaleString()}</span></div>
            ${regData.girls_science_schools > 0 ? `<div style="margin-top: 6px; color: var(--accent-green); font-weight: 700;">★ ${regData.girls_science_schools} Girls' School(s) Built</div>` : ''}
          `;
          tooltip.style.display = 'block';
        },
        mousemove: function(e) {
          const tooltip = document.getElementById('mapTooltip');
          const mapContainerRect = document.querySelector('.map-container').getBoundingClientRect();
          const x = e.originalEvent.clientX - mapContainerRect.left + 15;
          const y = e.originalEvent.clientY - mapContainerRect.top + 15;
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y}px`;
        },
        mouseout: function(e) {
          geoJsonLayer.resetStyle(e.target);
          
          // Restore selected region styles
          const isSelected = regionName.toUpperCase() === activeRegion.toUpperCase();
          if (isSelected) {
            e.target.setStyle({
              weight: 3,
              color: 'var(--accent-gold)',
              opacity: 1
            });
          }
          
          const tooltip = document.getElementById('mapTooltip');
          tooltip.style.display = 'none';
        },
        click: function(e) {
          selectRegion(regionName, true);
        }
      });
    }
  }).addTo(leafMap);
  
  // Re-render points layer if needed
  if (activeMapLayer === 'points') {
    girlsSchoolsLayerGroup.addTo(leafMap);
    renderGirlsSchoolsPoints();
  } else {
    leafMap.removeLayer(girlsSchoolsLayerGroup);
  }
}"""

if old_render_layers in code:
    code = code.replace(old_render_layers, new_render_layers, 1)
    print("Success: Updated renderMapLayers.")
else:
    print("Warning: Could not find renderMapLayers exact match, trying regex...")
    code, count = re.subn(r"function renderMapLayers\(\)\s*\{.*?\}", new_render_layers, code, flags=re.DOTALL)
    if count > 0:
        print("Success: Updated renderMapLayers via regex.")
    else:
        print("Error: Failed to update renderMapLayers.")

# 6. Replace renderGirlsSchoolsPoints
old_render_points = """function renderGirlsSchoolsPoints() {
  girlsSchoolsLayerGroup.clearLayers();
  
  geoJsonLayer.eachLayer(layer => {
    const properties = layer.feature.properties;
    const metrics = properties.metrics;
    
    if (metrics.girls_schools > 0) {
      const center = layer.getBounds().getCenter();
      
      const customIcon = L.divIcon({
        className: 'girls-school-marker',
        html: `
          <div class="girls-school-marker-inner"></div>
          <div class="girls-school-marker-pulse"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      const marker = L.marker(center, { icon: customIcon });
      
      marker.bindTooltip(`
        <div style="font-weight: 700; color: var(--accent-green); font-family: var(--font-title);">${properties.district} Girls' School</div>
        <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">Region: ${properties.region}</div>
        <div style="font-size: 0.7rem; color: var(--text-secondary);">Count: ${metrics.girls_schools} built</div>
      `, {
        direction: 'top',
        offset: [0, -10]
      });
      
      marker.on('click', () => {
        selectRegion(properties.region, true);
      });
      
      girlsSchoolsLayerGroup.addLayer(marker);
    }
  });
}"""

new_render_points = """function renderGirlsSchoolsPoints() {
  girlsSchoolsLayerGroup.clearLayers();
  
  geoJsonLayer.eachLayer(layer => {
    const properties = layer.feature.properties;
    const regionName = properties.region;
    const regData = SEQUIP_DATA.regional[regionName] || { girls_science_schools: 0 };
    
    if (regData.girls_science_schools > 0) {
      const center = layer.getBounds().getCenter();
      
      const customIcon = L.divIcon({
        className: 'girls-school-marker',
        html: `
          <div class="girls-school-marker-inner"></div>
          <div class="girls-school-marker-pulse"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      const marker = L.marker(center, { icon: customIcon });
      
      marker.bindTooltip(`
        <div style="font-weight: 700; color: var(--accent-green); font-family: var(--font-title);">${regionName} Girls' Schools</div>
        <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">Count: ${regData.girls_science_schools} built</div>
      `, {
        direction: 'top',
        offset: [0, -10]
      });
      
      marker.on('click', () => {
        selectRegion(regionName, true);
      });
      
      girlsSchoolsLayerGroup.addLayer(marker);
    }
  });
}"""

if old_render_points in code:
    code = code.replace(old_render_points, new_render_points, 1)
    print("Success: Updated renderGirlsSchoolsPoints.")
else:
    print("Warning: Could not find renderGirlsSchoolsPoints exact match, trying regex...")
    code, count = re.subn(r"function renderGirlsSchoolsPoints\(\)\s*\{.*?\}", new_render_points, code, flags=re.DOTALL)
    if count > 0:
        print("Success: Updated renderGirlsSchoolsPoints via regex.")
    else:
        print("Error: Failed to update renderGirlsSchoolsPoints.")

# 7. Add normalization and aggregation functions to the end
helpers_addon = """

function normalizeRegionName(name) {
  if (!name) return "";
  let normalized = name.trim();
  normalized = normalized.toLowerCase().split(' ').map(word => {
    if (word === 'es') return 'es';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  return normalized;
}

function aggregateRegionalClassroomsAndDorms() {
  regionalClassroomsAndDorms = {};
  SEQUIP_ME_DATA.District_Data.forEach(row => {
    const region = row[0];
    const dorms = parseInt(row[4]) || 0;
    const classrooms = parseInt(row[5]) || 0;
    
    const key = normalizeRegionName(region);
    
    if (!regionalClassroomsAndDorms[key]) {
      regionalClassroomsAndDorms[key] = {
        classrooms: 0,
        dormitories: 0
      };
    }
    regionalClassroomsAndDorms[key].classrooms += classrooms;
    regionalClassroomsAndDorms[key].dormitories += dorms;
  });
}
"""

code += helpers_addon

# Ensure the global lookup variable is declared
code = code.replace("let activeMapLayer = 'choropleth'; // 'choropleth' or 'points'", "let activeMapLayer = 'choropleth'; // 'choropleth' or 'points'\nlet regionalClassroomsAndDorms = {};")

# 8. Update getChoroplethColor count thresholds
old_color_scale = """  if (count <= 2) return val1;
  if (count <= 4) return val2;
  if (count <= 6) return val3;
  return val4;"""

new_color_scale = """  if (count <= 20) return val1;
  if (count <= 30) return val2;
  if (count <= 40) return val3;
  return val4;"""

if old_color_scale in code:
    code = code.replace(old_color_scale, new_color_scale, 1)
    print("Success: Updated getChoroplethColor threshold bins.")
else:
    print("Error: Could not find old_color_scale threshold bins.")

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Patching completed successfully!")
