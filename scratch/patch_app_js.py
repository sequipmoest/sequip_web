with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Inject global variables
old_globals = "let currentTheme = 'light';"
new_globals = """let currentTheme = 'light';

// Leaflet GIS Global Variables
let leafMap = null;
let tileLayerInstance = null;
let geoJsonLayer = null;
let girlsSchoolsLayerGroup = null;
let districtsGeoJSON = null;
let activeMapLayer = 'choropleth'; // 'choropleth' or 'points'"""

if old_globals in code:
    code = code.replace(old_globals, new_globals, 1)
    print("Success: Injected Leaflet global variables.")
else:
    print("Error: Could not find old_globals")

# 2. Update initTheme to include map tile and layer resets
old_theme_click = """    // Redraw canvas charts for color synchronization
    renderAllCharts();
  });"""

new_theme_click = """    // Redraw canvas charts for color synchronization
    renderAllCharts();
    
    // Sync Leaflet map tiles and styles with the new theme
    if (leafMap) {
      updateMapTiles();
      if (geoJsonLayer) {
        geoJsonLayer.eachLayer(layer => {
          const isSelectedRegion = layer.feature.properties.region.toUpperCase() === activeRegion.toUpperCase();
          if (isSelectedRegion) {
            layer.setStyle({
              weight: 2.5,
              color: 'var(--accent-gold)',
              opacity: 1
            });
          } else {
            geoJsonLayer.resetStyle(layer);
          }
        });
      }
    }
  });"""

if old_theme_click in code:
    code = code.replace(old_theme_click, new_theme_click, 1)
    print("Success: Updated initTheme click handler.")
else:
    print("Error: Could not find old_theme_click")

# 3. Replace initMapInteractions
start_interactions = "function initMapInteractions() {"
# Find the matching closing bracket or use rfind/find
# Since we know initMapInteractions runs from line 143 to 188, let's find the exact block:
# It ends right before "function selectRegion("
select_region_start = "function selectRegion("
start_idx = code.find(start_interactions)
end_idx = code.find(select_region_start)

if start_idx != -1 and end_idx != -1:
    old_interactions = code[start_idx:end_idx]
    new_interactions = """function initMapInteractions() {
  if (leafMap) return;

  // Initialize Leaflet Map centered on Tanzania
  leafMap = L.map('gisMap', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([-6.369, 34.888], 6);

  // Set up tile layer based on current theme
  updateMapTiles();

  // Create layer group for Girls' schools markers
  girlsSchoolsLayerGroup = L.layerGroup();

  // Fetch the simplified geojson
  fetch('maps/districts.geojson')
    .then(response => {
      if (!response.ok) throw new Error("Failed to load geojson");
      return response.json();
    })
    .then(geojson => {
      districtsGeoJSON = geojson;
      
      // MergeCSV district metrics
      mergeDistrictData(districtsGeoJSON);

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
    print("Success: Replaced initMapInteractions.")
else:
    print("Error: Could not find initMapInteractions bounds.")

# 4. Replace selectRegion
start_select = "function selectRegion("
render_details_start = "function renderRegionDetails("
start_idx = code.find(start_select)
end_idx = code.find(render_details_start)

if start_idx != -1 and end_idx != -1:
    old_select = code[start_idx:end_idx]
    new_select = """function selectRegion(regionName, zoom = true) {
  activeRegion = regionName;
  
  // Highlight the matching district boundaries on the map
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const isSelectedRegion = layer.feature.properties.region.toUpperCase() === regionName.toUpperCase();
      if (isSelectedRegion) {
        layer.setStyle({
          weight: 2.5,
          color: 'var(--accent-gold)',
          opacity: 1
        });
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
    print("Success: Replaced selectRegion.")
else:
    print("Error: Could not find selectRegion bounds.")

# 5. Overwrite regionalDistributionChart (Chart 3) in renderAllCharts
start_chart3 = "  // 3. Regional Distribution Chart (Horizontal Bar Chart)"
end_chart3_anchor = "  // Destroy existing charts" # or looking for end of that function
# Let's locate the entire regionalDistributionChart canvas block:
# It starts with "  // 3. Regional Distribution Chart" and ends with "    });\n  }\n}" (end of renderAllCharts)
start_idx = code.find(start_chart3)
end_idx = code.find("function colorMapChoropleth()")

if start_idx != -1 and end_idx != -1:
    old_chart3 = code[start_idx:end_idx]
    new_chart3 = """  // 3. Regional Distribution Chart (Horizontal Stacked Bar Chart of Classrooms vs Dormitories)
  const ctxRegional = document.getElementById('regionalDistributionChart');
  if (ctxRegional) {
    const regionalDataMap = {};
    
    SEQUIP_ME_DATA.District_Data.forEach(row => {
      const region = row[0];
      const dorms = parseInt(row[4]) || 0;
      const classrooms = parseInt(row[5]) || 0;
      
      const titleCaseRegion = region.toLowerCase().split(' ').map(word => {
        if (word === 'es') return 'es';
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
      
      if (!regionalDataMap[titleCaseRegion]) {
        regionalDataMap[titleCaseRegion] = {
          classrooms: 0,
          dormitories: 0
        };
      }
      regionalDataMap[titleCaseRegion].classrooms += classrooms;
      regionalDataMap[titleCaseRegion].dormitories += dorms;
    });
    
    const regionalList = Object.entries(regionalDataMap).map(([name, data]) => ({
      name,
      classrooms: data.classrooms,
      dormitories: data.dormitories,
      total: data.classrooms + data.dormitories
    }));
    
    // Sort descending by classrooms + dormitories count
    regionalList.sort((a, b) => b.total - a.total);
    
    const regLabels = regionalList.map(item => item.name);
    const classroomsValues = regionalList.map(item => item.classrooms);
    const dormsValues = regionalList.map(item => item.dormitories);
    
    charts.regional = new Chart(ctxRegional, {
      type: 'bar',
      data: {
        labels: regLabels,
        datasets: [
          {
            label: 'Classrooms',
            data: classroomsValues,
            backgroundColor: isDark ? 'rgba(0, 230, 118, 0.85)' : 'rgba(0, 168, 107, 0.85)',
            borderRadius: 4,
            borderWidth: 0
          },
          {
            label: 'Dormitories',
            data: dormsValues,
            backgroundColor: isDark ? 'rgba(224, 64, 251, 0.85)' : 'rgba(156, 39, 176, 0.85)',
            borderRadius: 4,
            borderWidth: 0
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: textColor,
              font: {
                family: fontName,
                size: 9
              }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#0f1621' : '#fff',
            titleColor: isDark ? '#fff' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: gridColor,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: fontName,
                size: 9
              }
            }
          },
          y: {
            stacked: true,
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              autoSkip: false,
              font: {
                family: fontName,
                size: 9,
                weight: '600'
              }
            }
          }
        }
      }
    });
  }
}

"""
    code = code.replace(old_chart3, new_chart3, 1)
    print("Success: Replaced regionalDistributionChart block.")
else:
    print("Error: Could not find regionalDistributionChart bounds.")

# 6. Replace colorMapChoropleth to be a stub or sync styling
old_colormap = """function colorMapChoropleth() {
  const paths = document.querySelectorAll('.map-region-path');
  paths.forEach(path => {
    const pathIdx = path.getAttribute('data-index');
    const regionName = REGION_MAPPING[pathIdx];
    const regData = SEQUIP_DATA.regional[regionName];
    if (!regData) return;
    
    const count = regData.schools;
    let level = 1;
    if (count >= 40) level = 4;
    else if (count >= 33) level = 3;
    else if (count >= 26) level = 2;
    
    path.classList.remove('choropleth-level-1', 'choropleth-level-2', 'choropleth-level-3', 'choropleth-level-4');
    path.classList.add(`choropleth-level-${level}`);
  });
}"""

new_colormap = """function colorMapChoropleth() {
  // Sync styling for choropleth layers
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      geoJsonLayer.resetStyle(layer);
    });
  }
}"""

if old_colormap in code:
    code = code.replace(old_colormap, new_colormap, 1)
    print("Success: Replaced colorMapChoropleth.")
else:
    # Let's search with regex in case whitespaces differ
    import re
    code, count = re.subn(r"function colorMapChoropleth\(\)\s*\{.*?\}", new_colormap, code, flags=re.DOTALL)
    if count > 0:
        print("Success: Replaced colorMapChoropleth via regex.")
    else:
        print("Error: Could not find colorMapChoropleth block.")

# 7. Add helper functions at the end of the file
helpers = """

// ==========================================
// GIS Map Helper Functions
// ==========================================

function cleanDistrictName(name) {
  if (!name) return "";
  let cleaned = name.toUpperCase().trim();
  cleaned = cleaned.replace(/['’`-]/g, "");
  cleaned = cleaned.replace(/\\s+/g, " ");
  
  const suffixes = [
    " CITY COUNCIL", " MUNICIPAL COUNCIL", " TOWN COUNCIL", " DISTRICT COUNCIL",
    " CITY", " MUNICIPAL", " TC", " DC", " MC", " CC", " JIJI", " COUNCIL", " HALMASHAURI"
  ];
  
  suffixes.forEach(suffix => {
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.substring(0, cleaned.length - suffix.length);
    }
    cleaned = cleaned.replace(new RegExp(suffix, "g"), "");
  });
  
  cleaned = cleaned.trim();
  
  const exceptions = {
    "NSIASI": "NSIMBO",
    "TANGANYIKA": "MPANDA",
    "KIGOMA UJIJI": "KIGOMA",
    "MTAMA": "LINDI",
    "NYANGHWALE": "NYANGWALE",
    "WANGINGOMBE": "WANGING'OMBE"
  };
  
  if (exceptions[cleaned]) {
    return exceptions[cleaned];
  }
  return cleaned;
}

function mergeDistrictData(geojson) {
  const districtMap = {};
  
  SEQUIP_ME_DATA.District_Data.forEach(row => {
    const region = row[0];
    const rawDistrict = row[1];
    const newSchools = parseInt(row[2]) || 0;
    const girlsSchools = parseInt(row[3]) || 0;
    const dorms = parseInt(row[4]) || 0;
    const classrooms = parseInt(row[5]) || 0;
    
    const key = cleanDistrictName(rawDistrict);
    
    if (!districtMap[key]) {
      districtMap[key] = {
        raw_name: rawDistrict,
        region: region,
        new_schools: 0,
        girls_schools: 0,
        dormitories: 0,
        classrooms: 0
      };
    }
    
    districtMap[key].new_schools += newSchools;
    districtMap[key].girls_schools += girlsSchools;
    districtMap[key].dormitories += dorms;
    districtMap[key].classrooms += classrooms;
  });
  
  geojson.features.forEach(feature => {
    const distName = feature.properties.district;
    const key = cleanDistrictName(distName);
    feature.properties.metrics = districtMap[key] || {
      new_schools: 0,
      girls_schools: 0,
      dormitories: 0,
      classrooms: 0
    };
  });
}

function updateMapTiles() {
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
}

function getChoroplethColor(count) {
  const style = getComputedStyle(document.documentElement);
  if (count === 0) return 'rgba(0, 0, 0, 0.05)';
  
  let val1 = style.getPropertyValue('--choropleth-level-1').trim() || 'rgba(0, 230, 118, 0.15)';
  let val2 = style.getPropertyValue('--choropleth-level-2').trim() || 'rgba(0, 230, 118, 0.35)';
  let val3 = style.getPropertyValue('--choropleth-level-3').trim() || 'rgba(0, 230, 118, 0.65)';
  let val4 = style.getPropertyValue('--choropleth-level-4').trim() || 'rgba(0, 230, 118, 0.95)';
  
  if (count <= 2) return val1;
  if (count <= 4) return val2;
  if (count <= 6) return val3;
  return val4;
}

function renderMapLayers() {
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
}

function renderGirlsSchoolsPoints() {
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
}

function setupLayerToggle() {
  const btnChoropleth = document.getElementById('btnChoropleth');
  const btnPoints = document.getElementById('btnPoints');
  const legend = document.querySelector('.map-choropleth-legend');
  
  if (!btnChoropleth || !btnPoints) return;
  
  btnChoropleth.addEventListener('click', () => {
    activeMapLayer = 'choropleth';
    btnChoropleth.classList.add('active');
    btnChoropleth.style.background = 'var(--accent-green)';
    btnChoropleth.style.color = '#fff';
    
    btnPoints.classList.remove('active');
    btnPoints.style.background = 'transparent';
    btnPoints.style.color = 'var(--text-secondary)';
    
    legend.style.display = 'flex';
    
    renderMapLayers();
  });
  
  btnPoints.addEventListener('click', () => {
    activeMapLayer = 'points';
    btnPoints.classList.add('active');
    btnPoints.style.background = 'var(--accent-green)';
    btnPoints.style.color = '#fff';
    
    btnChoropleth.classList.remove('active');
    btnChoropleth.style.background = 'transparent';
    btnChoropleth.style.color = 'var(--text-secondary)';
    
    legend.style.display = 'none';
    
    renderMapLayers();
  });
}

function zoomToRegion(regionName) {
  if (!leafMap || !geoJsonLayer) return;
  
  let bounds = L.latLngBounds();
  let found = false;
  
  geoJsonLayer.eachLayer(layer => {
    if (layer.feature.properties.region.toUpperCase() === regionName.toUpperCase()) {
      bounds.extend(layer.getBounds());
      found = true;
    }
  });
  
  if (found) {
    leafMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }
}
"""

code += helpers

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Patching of app.js completed successfully!")
