// SEQUIP Dashboard Application Logic

const REGION_MAPPING = {
  0: 'Mbeya',
  1: 'Rukwa',
  2: 'Dar es Salaam',
  3: 'Geita',
  4: 'Shinyanga',
  5: 'Tabora',
  6: 'Kagera',
  7: 'Kigoma',
  8: 'Pwani',
  9: 'Morogoro',
  10: 'Tanga',
  11: 'Simiyu',
  12: 'Songwe',
  13: 'Njombe',
  14: 'Lindi',
  15: 'Dodoma',
  16: 'Katavi',
  17: 'Iringa',
  18: 'Mtwara',
  19: 'Ruvuma',
  20: 'Singida',
  21: 'Arusha',
  22: 'Manyara',
  23: 'Kilimanjaro',
  24: 'Mara',
  25: 'Mwanza'
};

// State Variables
let currentLayout = 'home'; // 'home', 'map', or 'about'
let activeRegion = 'Dodoma';
let compareRegion = 'National Average';
let isComparing = false;
let currentTheme = 'light';

// Leaflet GIS Global Variables
let leafMap = null;
let tileLayerInstance = null;
let geoJsonLayer = null;
let girlsSchoolsLayerGroup = null;
let regionsGeoJSON = null;
let activeMapLayer = 'choropleth'; // 'choropleth' or 'points'
let activeMapMetric = 'schools'; // 'schools', 'girls_schools', 'classrooms', 'dormitories', 'teachers_trained', 'textbooks_distributed'
let currentMetricThresholds = [20, 30, 40, 50];
let regionalClassroomsAndDorms = {};

const metricTitles = {
  'schools': "New Schools Built",
  'ward_schools': "Ward Schools",
  'girls_science_schools': "Girls' Science Schools",
  'boys_schools': "Boys' Schools",
  'vocational_schools': "Vocational Schools",
  'classrooms_built': "Classrooms Built",
  'classrooms_upgraded': "Classrooms Upgraded",
  'science_labs': "Science Labs",
  'teachers_houses': "Teachers' Houses",
  'dormitories': "Dormitories Built",
  'pit_latrines_built': "Pit Latrines Built",
  'pit_latrines_completed': "Pit Latrines Completed",
  'teachers_trained': "STEM Teachers Trained",
  'textbooks_distributed': "Textbooks Distributed",
  'safe_schools_reached': "Safe Schools Reached",
  'safe_schools_teachers_trained': "Safe School Teachers Trained",
  'aep_girls_registered': "AEP Girls Registered",
  'aep_returned_formal': "AEP Girls Returned to Formal Ed",
  'aep_passed_form_four': "AEP Girls Passed Form 4",
  'ict_computers': "ICT Computers",
  'ict_laptops': "ICT Laptops",
  'ict_projectors': "ICT Projectors",
  'ict_ups': "ICT UPS Units",
  'ict_schools_reached': "ICT Schools Reached",
  'ict_teachers_trained': "ICT Teachers Trained",
  'ict_smartboard_schools': "ICT Smartboard Schools"
};

const metricColors = {
  'schools': 'var(--accent-gold)',
  'ward_schools': 'var(--accent-gold)',
  'girls_science_schools': 'var(--accent-green)',
  'boys_schools': 'var(--accent-blue)',
  'vocational_schools': 'var(--accent-orange)',
  'classrooms_built': 'var(--accent-blue)',
  'classrooms_upgraded': 'var(--accent-blue)',
  'science_labs': 'var(--accent-orange)',
  'teachers_houses': 'var(--accent-gold)',
  'dormitories': 'var(--accent-orange)',
  'pit_latrines_built': 'var(--text-secondary)',
  'pit_latrines_completed': 'var(--accent-green)',
  'teachers_trained': 'var(--accent-green)',
  'textbooks_distributed': 'var(--accent-blue)',
  'safe_schools_reached': '#ff5252',
  'safe_schools_teachers_trained': '#ff5252',
  'aep_girls_registered': '#e040fb',
  'aep_returned_formal': '#e040fb',
  'aep_passed_form_four': '#e040fb',
  'ict_computers': '#00e5ff',
  'ict_laptops': '#00e5ff',
  'ict_projectors': '#00e5ff',
  'ict_ups': '#00e5ff',
  'ict_schools_reached': '#00e5ff',
  'ict_teachers_trained': '#00e5ff',
  'ict_smartboard_schools': '#00e5ff'
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLayoutSwitcher();
  initMapInteractions();
  initSearch();
  initCompare();
  initCardZoom();
  initMetricsCustomizer();
  
  // Initial renders
  renderNationalDashboard();
  renderRegionDetails(activeRegion);
  renderAllCharts();
  colorMapChoropleth();
  animateNectaBars();
  
  // Set up resize listener for charts
  window.addEventListener('resize', () => {
    renderAllCharts();
    if (isComparing) {
      updateComparisonView();
    }
  });
});

// Theme Management
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  toggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleBtn.innerHTML = currentTheme === 'dark' 
      ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    
    // Redraw canvas charts for color synchronization
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
  });
}

// Card Zoom Interaction Functionality
function initCardZoom() {
  let modal = document.getElementById('cardModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cardModal';
    modal.className = 'card-modal';
    modal.innerHTML = `
      <div class="card-modal-backdrop"></div>
      <div class="card-modal-content">
        <button class="card-modal-close" aria-label="Close modal">&times;</button>
        <div class="card-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.card-modal-backdrop').addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.querySelector('.card-modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    
    // Skip if clicking interactive elements inside the card
    if (e.target.closest('button, input, select, a, .leaflet-container, label, canvas, .tab-btn')) {
      return;
    }
    
    // Skip if it's map container or map sidebar card
    if (card.closest('.map-card') || card.closest('.map-sidebar') || card.classList.contains('map-card') || card.classList.contains('map-sidebar')) {
      return;
    }
    
    const body = modal.querySelector('.card-modal-body');
    body.innerHTML = '';
    
    const clone = card.cloneNode(true);
    
    const originalCanvas = card.querySelector('canvas');
    let modalChartId = null;
    let modalTooltipId = null;
    
    if (originalCanvas) {
      const newCanvas = clone.querySelector('canvas');
      modalChartId = 'modal_' + originalCanvas.id;
      newCanvas.id = modalChartId;
      
      const detailBox = clone.querySelector('.chart-details-box');
      if (detailBox) {
        modalTooltipId = 'modal_' + detailBox.id;
        detailBox.id = modalTooltipId;
      }
    }
    
    body.appendChild(clone);
    modal.classList.add('active');
    
    if (originalCanvas && modalChartId) {
      setTimeout(() => {
        const isDark = currentTheme === 'dark';
        const canvasElement = document.getElementById(modalChartId);
        if (canvasElement) {
          if (originalCanvas.id === 'budgetAllocationChart') {
            drawBudgetChart(canvasElement, isDark, modalTooltipId || 'modal_budgetChartTooltip');
          } else if (originalCanvas.id === 'infrastructureVolumeChart') {
            drawInfrastructureChart(canvasElement, isDark);
          } else if (originalCanvas.id === 'regionalDistributionChart') {
            drawRegionalChart(canvasElement, isDark);
          }
        }
      }, 50);
    }
  });
}

// Layout Switcher
function initLayoutSwitcher() {
  const homeBtn = document.getElementById('btnHomeLayout');
  const mapBtn = document.getElementById('btnMapLayout');
  const aboutBtn = document.getElementById('btnAboutLayout');
  const homeView = document.getElementById('heroView');
  const mapView = document.getElementById('mapView');
  const aboutView = document.getElementById('aboutView');

  homeBtn.addEventListener('click', () => {
    currentLayout = 'home';
    homeBtn.classList.add('active');
    mapBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    homeView.style.display = 'flex';
    mapView.style.display = 'none';
    aboutView.style.display = 'none';
    
    // Animate numbers and charts
    renderAllCharts();
    animateNectaBars();
  });

  mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    homeBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    mapView.style.display = 'grid';
    homeView.style.display = 'none';
    aboutView.style.display = 'none';
    
    renderRegionDetails(activeRegion);
    
    if (leafMap) {
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
    }
  });

  aboutBtn.addEventListener('click', () => {
    currentLayout = 'about';
    aboutBtn.classList.add('active');
    homeBtn.classList.remove('active');
    mapBtn.classList.remove('active');
    aboutView.style.display = 'flex';
    homeView.style.display = 'none';
    mapView.style.display = 'none';
  });
}

// Render National Stats (Hero Grid View)
function renderNationalDashboard() {
  const n = SEQUIP_DATA.national;
  const me = SEQUIP_ME_DATA;
  
  // Set M&E KPI Banner metrics
  const totalInvBillion = (me.Grand_Totals.Total_Investment_TZS / 1e9).toFixed(2);
  document.getElementById('meTotalInvestment').innerText = `${totalInvBillion}B`;
  document.getElementById('meTotalInfrastructure').innerText = me.Grand_Totals.Total_Infrastructure_Units.toLocaleString();
  document.getElementById('meNewSchools').innerText = me.Summary_Totals[0].Count.toString();
  document.getElementById('meGirlsSchools').innerText = me.Summary_Totals[1].Count.toString();
  
  // Set Infrastructure sub-stats (from new ME data!)
  document.getElementById('statSchools').innerText = (me.Summary_Totals[0].Count + me.Summary_Totals[1].Count + me.Summary_Totals[2].Count).toString(); // Total Schools = New + Girls + Boys = 831
  document.getElementById('statClassrooms').innerText = me.Summary_Totals.find(item => item.Activity.includes("MADARASA")).Count.toLocaleString(); // 1,484
  document.getElementById('statLabs').innerText = me.Summary_Totals.find(item => item.Activity.includes("MAABARA")).Count.toString(); // 132
  document.getElementById('statLatrines').innerText = me.Summary_Totals.find(item => item.Activity.includes("VYOO")).Count.toLocaleString(); // 4,858
  
  // Set Safe Schools sub-stats
  document.getElementById('statSafeSchools').innerText = n.safe_schools_reached.toLocaleString();
  document.getElementById('statSafeTeachers').innerText = n.safe_schools_teachers_trained.toLocaleString();
  
  // Set Alternate Education Pathway (AEP)
  document.getElementById('statAepGirls').innerText = n.aep_girls_registered.toLocaleString();
  document.getElementById('statAepReturned').innerText = n.aep_returned_formal.toLocaleString();
  document.getElementById('statAepPassed').innerText = n.aep_passed_form_four.toLocaleString();

  // Set ICT investment
  document.getElementById('statIctComputers').innerText = n.ict_computers.toLocaleString();
  document.getElementById('statIctSchools').innerText = n.ict_schools_reached.toLocaleString();
  document.getElementById('statIctSmart').innerText = n.ict_smartboard_schools.toLocaleString();
}

// Map Interactions
function initMapInteractions() {
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
      
      calculateMetricThresholds();
      renderMapLegend();

      // Render default Choropleth layer
      renderMapLayers();

      // Bind layer toggle button click events
      setupLayerToggle();

      // Select default active region (Dodoma) on map visually
      selectRegion(activeRegion, false);

      if (leafMap) {
        try {
          leafMap.invalidateSize({ pan: false });
          if (geoJsonLayer && typeof geoJsonLayer.getBounds === 'function' && geoJsonLayer.getBounds().isValid()) {
            leafMap.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
          }
        } catch (err) {
          // Silent catch
        }
      }
    })
    .catch(err => {
      console.error("GIS Map Loading Error:", err);
    });
}

function selectRegion(regionName, zoom = false) {
  activeRegion = regionName;
  
  // Highlight the matching region boundary on the map
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const isSelectedRegion = normalizeRegionName(layer.feature.properties.region).toUpperCase() === normalizeRegionName(regionName).toUpperCase();
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

function renderRegionDetails(regionName) {
  const r = SEQUIP_DATA.regional[regionName];
  if (!r) return;

  document.getElementById('selectedRegionName').innerText = regionName;

  // Set region metadata badge based on location
  const northRegions = ['Kagera', 'Mwanza', 'Mara', 'Geita', 'Shinyanga', 'Simiyu', 'Arusha', 'Kilimanjaro', 'Manyara'];
  const southRegions = ['Rukwa', 'Mbeya', 'Songwe', 'Njombe', 'Iringa', 'Ruvuma', 'Lindi', 'Mtwara'];
  const centralRegions = ['Dodoma', 'Singida', 'Tabora', 'Katavi', 'Kigoma'];
  let zone = 'Eastern Zone';
  if (northRegions.includes(regionName)) zone = 'Northern Zone';
  else if (southRegions.includes(regionName)) zone = 'Southern Zone';
  else if (centralRegions.includes(regionName)) zone = 'Central/Western Zone';
  
  document.getElementById('regionZoneTag').innerText = zone;

  // Dynamically render selected metrics grid
  const gridContainer = document.getElementById('regionalStatsGrid');
  if (!gridContainer) return;
  
  const checkboxes = Array.from(document.querySelectorAll('.metric-display-cb:checked'));
  let html = '';
  
  checkboxes.forEach(cb => {
    const valKey = cb.value;
    const count = getMetricValue(regionName, valKey);
    const title = metricTitles[valKey] || valKey;
    const color = metricColors[valKey] || 'var(--text-primary)';
    
    html += `
      <div class="regional-metric-card" style="transition: var(--transition);">
        <div class="regional-metric-num" style="color: ${color};">${count.toLocaleString()}</div>
        <div class="regional-metric-lbl">${title}</div>
      </div>
    `;
  });
  
  if (checkboxes.length === 0) {
    html = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.8rem;">
        No metrics selected. Click "Choose Metrics to Display" to select dashboard cards.
      </div>
    `;
  }
  
  gridContainer.innerHTML = html;
}

function initMetricsCustomizer() {
  const btnTogglePanel = document.getElementById('btnToggleMetricsPanel');
  const panel = document.getElementById('metricsSelectorPanel');
  const btnSelectAll = document.getElementById('btnSelectAllMetrics');
  const btnClearAll = document.getElementById('btnClearAllMetrics');
  
  if (btnTogglePanel && panel) {
    btnTogglePanel.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = panel.style.display === 'block';
      panel.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (panel.style.display === 'block' && !panel.contains(e.target) && e.target !== btnTogglePanel) {
        panel.style.display = 'none';
      }
    });
    
    // Checkbox change handlers
    document.querySelectorAll('.metric-display-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        renderRegionDetails(activeRegion);
      });
    });
    
    // Select all / Clear all
    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.metric-display-cb').forEach(cb => cb.checked = true);
        renderRegionDetails(activeRegion);
      });
    }
    
    if (btnClearAll) {
      btnClearAll.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.metric-display-cb').forEach(cb => cb.checked = false);
        renderRegionDetails(activeRegion);
      });
    }
  }
}

// Search Feature
function initSearch() {
  const input = document.getElementById('regionSearchInput');
  const suggestions = document.getElementById('searchSuggestions');
  
  input.addEventListener('input', () => {
    const val = input.value.toLowerCase().trim();
    suggestions.innerHTML = '';
    
    if (val === '') {
      suggestions.style.display = 'none';
      return;
    }
    
    const matches = Object.values(REGION_MAPPING).filter(name => 
      name.toLowerCase().includes(val)
    );
    
    if (matches.length === 0) {
      suggestions.style.display = 'none';
      return;
    }
    
    matches.forEach(match => {
      const div = document.createElement('div');
      div.className = 'search-suggestion-item';
      div.innerText = match;
      div.addEventListener('click', () => {
        input.value = match;
        suggestions.style.display = 'none';
        selectRegion(match, false);
      });
      suggestions.appendChild(div);
    });
    
    suggestions.style.display = 'block';
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== suggestions) {
      suggestions.style.display = 'none';
    }
  });
}

// Comparison Mode
function initCompare() {
  const compareCheckbox = document.getElementById('compareCheckbox');
  const compareSelect = document.getElementById('compareRegionSelect');
  const regionalGrid = document.getElementById('regionalStatsGrid');
  const comparisonView = document.getElementById('comparisonView');

  // Populate compare dropdown
  compareSelect.innerHTML = '<option value="National Average">National Average (Mean)</option>';
  Object.values(REGION_MAPPING).sort().forEach(name => {
    compareSelect.innerHTML += `<option value="${name}">${name} Region</option>`;
  });

  compareCheckbox.addEventListener('change', () => {
    isComparing = compareCheckbox.checked;
    if (isComparing) {
      regionalGrid.style.display = 'none';
      comparisonView.style.display = 'grid';
      document.getElementById('compareSelectContainer').style.display = 'block';
      updateComparisonView();
    } else {
      regionalGrid.style.display = 'grid';
      comparisonView.style.display = 'none';
      document.getElementById('compareSelectContainer').style.display = 'none';
    }
  });

  compareSelect.addEventListener('change', () => {
    compareRegion = compareSelect.value;
    updateComparisonView();
  });
}

// Update side-by-side comparison tables
function updateComparisonView() {
  const mainName = activeRegion;
  const compName = compareRegion;
  
  const mainData = SEQUIP_DATA.regional[mainName];
  const mainKey = normalizeRegionName(mainName);
  const mainAgg = regionalClassroomsAndDorms[mainKey] || { newSchools: 0, girlsSchools: 0, classrooms: 0, dormitories: 0 };
  
  let compData;
  let compAgg;
  
  if (compName === 'National Average') {
    const count = Object.keys(SEQUIP_DATA.regional).length;
    const n = SEQUIP_DATA.national;
    
    // Sum from all aggregates
    let totalNewSchools = 0;
    let totalGirlsSchools = 0;
    let totalClassrooms = 0;
    let totalDormitories = 0;
    for (const k in regionalClassroomsAndDorms) {
      totalNewSchools += regionalClassroomsAndDorms[k].newSchools;
      totalGirlsSchools += regionalClassroomsAndDorms[k].girlsSchools;
      totalClassrooms += regionalClassroomsAndDorms[k].classrooms;
      totalDormitories += regionalClassroomsAndDorms[k].dormitories;
    }
    
    compData = {
      schools: Math.round(totalNewSchools / count),
      teachers_trained: Math.round(n.teachers_trained / count),
      textbooks_distributed: Math.round(n.textbooks_distributed / count),
      aep_girls_registered: Math.round(n.aep_girls_registered / count),
      ict_computers: Math.round(n.ict_computers / count),
      safe_schools_reached: Math.round(n.safe_schools_reached / count)
    };
    
    compAgg = {
      newSchools: Math.round(totalNewSchools / count),
      girlsSchools: Math.round(totalGirlsSchools / count),
      classrooms: Math.round(totalClassrooms / count),
      dormitories: Math.round(totalDormitories / count)
    };
  } else {
    compData = SEQUIP_DATA.regional[compName];
    const compKey = normalizeRegionName(compName);
    compAgg = regionalClassroomsAndDorms[compKey] || { newSchools: 0, girlsSchools: 0, classrooms: 0, dormitories: 0 };
  }

  // Set comparison header names
  document.getElementById('compHeaderMain').innerText = mainName;
  document.getElementById('compHeaderComp').innerText = compName;

  // Set values
  document.getElementById('compMainSchools').innerText = mainAgg.newSchools;
  document.getElementById('compCompSchools').innerText = compAgg.newSchools;
  
  document.getElementById('compMainGirlsSchools').innerText = mainAgg.girlsSchools;
  document.getElementById('compCompGirlsSchools').innerText = compAgg.girlsSchools;
  
  document.getElementById('compMainClassrooms').innerText = mainAgg.classrooms.toLocaleString();
  document.getElementById('compCompClassrooms').innerText = compAgg.classrooms.toLocaleString();
  
  document.getElementById('compMainDormitories').innerText = mainAgg.dormitories.toLocaleString();
  document.getElementById('compCompDormitories').innerText = compAgg.dormitories.toLocaleString();
  
  document.getElementById('compMainTeachers').innerText = mainData.teachers_trained.toLocaleString();
  document.getElementById('compCompTeachers').innerText = compData.teachers_trained.toLocaleString();
  
  document.getElementById('compMainTextbooks').innerText = mainData.textbooks_distributed.toLocaleString();
  document.getElementById('compCompTextbooks').innerText = compData.textbooks_distributed.toLocaleString();
  
  document.getElementById('compMainAep').innerText = mainData.aep_girls_registered.toLocaleString();
  document.getElementById('compCompAep').innerText = compData.aep_girls_registered.toLocaleString();
  
  document.getElementById('compMainComputers').innerText = mainData.ict_computers.toLocaleString();
  document.getElementById('compCompComputers').innerText = compData.ict_computers.toLocaleString();
  
  document.getElementById('compMainSafe').innerText = mainData.safe_schools_reached.toLocaleString();
  document.getElementById('compCompSafe').innerText = compData.safe_schools_reached.toLocaleString();
}

// Animate Necta Progress Bars (Hero view)
function animateNectaBars() {
  const bars = document.querySelectorAll('.subject-bar-fill');
  bars.forEach(bar => {
    const val = bar.getAttribute('data-val');
    // Start width at 0, then transition to actual percent
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = `${val}%`;
    }, 100);
  });
}

let charts = {};

// Modular Chart.js Drawing Helpers
function drawBudgetChart(ctx, isDark, tooltipId) {
  if (typeof Chart === 'undefined') return null;
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const fontName = 'Inter, sans-serif';
  
  const nameMap = {
    "UJENZI WA SHULE MPYA (New Schools)": "New Schools",
    "UJENZI WA SHULE ZA WASICHANA (Girls' Schools)": "Girls' Schools",
    "UJENZI WA SHULE ZA WAVULANA (Boys' Schools)": "Boys' Schools",
    "NYUMBA (Houses)": "Staff Houses",
    "UKARABATI (Renovations)": "Renovations",
    "MABWENI (Dormitories)": "Dormitories",
    "MADARASA (Classrooms)": "Classrooms",
    "VYOO (Toilets)": "Toilet Units",
    "MAABARA (Laboratories)": "Laboratories"
  };
  
  const budgetLabels = SEQUIP_ME_DATA.Summary_Totals.map(item => nameMap[item.Activity] || item.Activity);
  const budgetValues = SEQUIP_ME_DATA.Summary_Totals.map(item => item.Amount_TZS);
  
  const budgetColors = [
    '#00e5ff', '#e040fb', '#2196f3', '#ffd54f', '#ff5252', '#00e676', '#81c784', '#64748b', '#ff8a65'
  ];
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: budgetLabels,
      datasets: [{
        data: budgetValues,
        backgroundColor: budgetColors,
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f1621' : '#fff',
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#0f1621' : '#fff',
          titleColor: isDark ? '#fff' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#475569',
          borderColor: gridColor,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const billionVal = (val / 1e9).toFixed(2);
              return ` ${billionVal}B TZS`;
            }
          }
        }
      },
      onHover: (evt, activeEls) => {
        const tooltipEl = document.getElementById(tooltipId);
        if (!tooltipEl) return;
        if (activeEls.length > 0) {
          const idx = activeEls[0].index;
          const label = budgetLabels[idx];
          const val = budgetValues[idx];
          const pct = ((val / 772478159166) * 100).toFixed(1);
          tooltipEl.innerHTML = `<span style="color: ${budgetColors[idx]}; font-weight: 700;">${label}</span>: <strong>${(val / 1e9).toFixed(2)} Billion TZS</strong> (${pct}%)`;
        } else {
          tooltipEl.innerHTML = "Hover over sections to see category details";
        }
      }
    }
  });
}

function drawInfrastructureChart(ctx, isDark) {
  if (typeof Chart === 'undefined') return null;
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const nameMap = {
    "UJENZI WA SHULE MPYA (New Schools)": "New Schools",
    "UJENZI WA SHULE ZA WASICHANA (Girls' Schools)": "Girls' Schools",
    "UJENZI WA SHULE ZA WAVULANA (Boys' Schools)": "Boys' Schools",
    "NYUMBA (Houses)": "Staff Houses",
    "UKARABATI (Renovations)": "Renovations",
    "MABWENI (Dormitories)": "Dormitories",
    "MADARASA (Classrooms)": "Classrooms",
    "VYOO (Toilets)": "Toilet Units",
    "MAABARA (Laboratories)": "Laboratories"
  };
  
  const sortedTotals = [...SEQUIP_ME_DATA.Summary_Totals].sort((a, b) => b.Count - a.Count);
  const infraLabels = sortedTotals.map(item => nameMap[item.Activity] || item.Activity);
  const infraValues = sortedTotals.map(item => item.Count);
  
  const infraColors = sortedTotals.map((item) => {
    if (item.Activity.includes("VYOO")) return '#e040fb';
    if (item.Activity.includes("MADARASA")) return '#00e676';
    if (item.Activity.includes("SHULE MPYA")) return '#00e5ff';
    if (item.Activity.includes("MABWENI")) return '#2196f3';
    if (item.Activity.includes("NYUMBA")) return '#ffd54f';
    if (item.Activity.includes("MAABARA")) return '#ff8a65';
    return '#64748b';
  });
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: infraLabels,
      datasets: [{
        label: 'Units Built',
        data: infraValues,
        backgroundColor: infraColors,
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#0f1621' : '#fff',
          titleColor: isDark ? '#fff' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#475569',
          borderColor: gridColor,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return ` ${context.raw} units`;
            }
          }
        }
      }
    }
  });
}

function drawRegionalChart(ctx, isDark) {
  if (typeof Chart === 'undefined') return null;
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const fontName = 'Inter, sans-serif';
  
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
  
  regionalList.sort((a, b) => b.total - a.total);
  
  const regLabels = regionalList.map(item => item.name);
  const classroomsValues = regionalList.map(item => item.classrooms);
  const dormsValues = regionalList.map(item => item.dormitories);
  
  return new Chart(ctx, {
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

function renderAllCharts() {
  if (typeof Chart === 'undefined') return;

  if (charts.budget) charts.budget.destroy();
  if (charts.infrastructure) charts.infrastructure.destroy();
  if (charts.regional) charts.regional.destroy();
  
  const isDark = currentTheme === 'dark';
  
  const ctxBudget = document.getElementById('budgetAllocationChart');
  if (ctxBudget) {
    charts.budget = drawBudgetChart(ctxBudget, isDark, 'budgetChartTooltip');
  }
  
  const ctxInfra = document.getElementById('infrastructureVolumeChart');
  if (ctxInfra) {
    charts.infrastructure = drawInfrastructureChart(ctxInfra, isDark);
  }
  
  const ctxRegional = document.getElementById('regionalDistributionChart');
  if (ctxRegional) {
    charts.regional = drawRegionalChart(ctxRegional, isDark);
  }
}

function colorMapChoropleth() {
  // Sync styling for choropleth layers
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      geoJsonLayer.resetStyle(layer);
    });
  }
}


// ==========================================
// GIS Map Helper Functions
// ==========================================

function cleanDistrictName(name) {
  if (!name) return "";
  let cleaned = name.toUpperCase().trim();
  cleaned = cleaned.replace(/['’`-]/g, "");
  cleaned = cleaned.replace(/\s+/g, " ");
  
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
    tileLayerInstance = null;
  }
  // Standalone vector map (no background tiles served)
}

function getMetricValue(regionName, metric) {
  const regNameNorm = normalizeRegionName(regionName);
  const regData = SEQUIP_DATA.regional[regNameNorm] || {};
  const infra = regionalClassroomsAndDorms[regNameNorm] || {};
  
  if (metric === 'dormitories') {
    return infra.dormitories || 0;
  }
  
  return regData[metric] || 0;
}

function calculateMetricThresholds() {
  const values = Object.keys(SEQUIP_DATA.regional).map(regionName => {
    return getMetricValue(regionName, activeMapMetric);
  }).filter(val => val > 0);
  
  if (values.length === 0) {
    currentMetricThresholds = [1, 2, 3, 4];
    return;
  }
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  const diff = max - min;
  if (diff <= 3) {
    currentMetricThresholds = [1, 2, 3, Math.max(4, max)];
  } else {
    const q1 = min + diff * 0.25;
    const q2 = min + diff * 0.5;
    const q3 = min + diff * 0.75;
    
    currentMetricThresholds = [
      Math.ceil(q1),
      Math.ceil(q2),
      Math.ceil(q3),
      max
    ];
  }
}


function renderMapLegend() {
  const legendContainer = document.getElementById('mapLegend');
  if (!legendContainer) return;
  
  const title = metricTitles[activeMapMetric] || "Project Metric";
  
  let rangesHtml = `
    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${title}</div>
  `;
  
  const style = getComputedStyle(document.documentElement);
  let val1 = style.getPropertyValue('--choropleth-level-1').trim() || 'rgba(0, 230, 118, 0.15)';
  let val2 = style.getPropertyValue('--choropleth-level-2').trim() || 'rgba(0, 230, 118, 0.35)';
  let val3 = style.getPropertyValue('--choropleth-level-3').trim() || 'rgba(0, 230, 118, 0.65)';
  let val4 = style.getPropertyValue('--choropleth-level-4').trim() || 'rgba(0, 230, 118, 0.95)';
  
  const colors = [val1, val2, val3, val4];
  
  function formatLegendNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(0) + 'k';
    return num;
  }
  
  for (let i = 0; i < 4; i++) {
    let rangeText = "";
    if (i === 0) {
      rangeText = `1 - ${formatLegendNumber(currentMetricThresholds[0])}`;
    } else if (i < 3) {
      const lower = currentMetricThresholds[i - 1] + 1;
      const upper = currentMetricThresholds[i];
      if (lower > upper) {
        rangeText = `${formatLegendNumber(upper)}`;
      } else {
        rangeText = `${formatLegendNumber(lower)} - ${formatLegendNumber(upper)}`;
      }
    } else {
      const lower = currentMetricThresholds[2] + 1;
      rangeText = `${formatLegendNumber(lower)}+`;
    }
    
    rangesHtml += `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 12px; height: 12px; background: ${colors[i]}; border-radius: 2px; border: 1px solid var(--border-card);"></div>
        <span style="font-size: 0.7rem; color: var(--text-secondary);">${rangeText}</span>
      </div>
    `;
  }
  
  legendContainer.innerHTML = rangesHtml;
}

function getChoroplethColor(count) {
  const style = getComputedStyle(document.documentElement);
  if (count === 0) return 'rgba(0, 0, 0, 0.05)';
  
  let val1 = style.getPropertyValue('--choropleth-level-1').trim() || 'rgba(0, 230, 118, 0.15)';
  let val2 = style.getPropertyValue('--choropleth-level-2').trim() || 'rgba(0, 230, 118, 0.35)';
  let val3 = style.getPropertyValue('--choropleth-level-3').trim() || 'rgba(0, 230, 118, 0.65)';
  let val4 = style.getPropertyValue('--choropleth-level-4').trim() || 'rgba(0, 230, 118, 0.95)';
  
  if (count <= currentMetricThresholds[0]) return val1;
  if (count <= currentMetricThresholds[1]) return val2;
  if (count <= currentMetricThresholds[2]) return val3;
  return val4;
}

function renderMapLayers() {
  if (geoJsonLayer) {
    leafMap.removeLayer(geoJsonLayer);
  }
  
  const isDark = currentTheme === 'dark';
  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.2)';
  
  geoJsonLayer = L.geoJSON(regionsGeoJSON, {
    style: function(feature) {
      const regionName = normalizeRegionName(feature.properties.region);
      const count = getMetricValue(regionName, activeMapMetric);
      
      const isSelectedRegion = regionName.toUpperCase() === normalizeRegionName(activeRegion).toUpperCase();
      
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
      const regionName = normalizeRegionName(properties.region);
      const regData = SEQUIP_DATA.regional[regionName] || { schools: 0, teachers_trained: 0, textbooks_distributed: 0, girls_science_schools: 0 };
      const infra = regionalClassroomsAndDorms[regionName] || { classrooms: 0, dormitories: 0, girlsSchools: 0 };
      
      const count = getMetricValue(regionName, activeMapMetric);
      const title = metricTitles[activeMapMetric] || "Active Metric";
      
      const tooltipContent = `
        <div class="map-tooltip-popup" style="min-width: 200px;">
          <h4 style="font-family: var(--font-title); font-size: 0.85rem; font-weight: 700; color: var(--accent-green); margin-bottom: 6px; border-bottom: 1px solid var(--border-card); padding-bottom: 4px;">${regionName} Region</h4>
          
          <!-- Selected Active Metric Highlight -->
          <div style="background: rgba(0, 230, 118, 0.08); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; border: 1px solid rgba(0, 230, 118, 0.2);">
            <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary);">${title}</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold);">${count.toLocaleString()}</div>
          </div>
          
          <!-- Key Background Metrics -->
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;">
            <span style="color: var(--text-secondary);">New Schools:</span>
            <span style="color: var(--text-primary); font-weight: 600;">${regData.schools}</span>
          </div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;">
            <span style="color: var(--text-secondary);">Classrooms Built:</span>
            <span style="color: var(--text-primary); font-weight: 600;">${(regData.classrooms_built || 0).toLocaleString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;">
            <span style="color: var(--text-secondary);">Dormitories Built:</span>
            <span style="color: var(--text-primary); font-weight: 600;">${(infra.dormitories || 0).toLocaleString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;">
            <span style="color: var(--text-secondary);">Teachers Trained:</span>
            <span style="color: var(--text-primary); font-weight: 600;">${(regData.teachers_trained || 0).toLocaleString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;">
            <span style="color: var(--text-secondary);">Textbooks:</span>
            <span style="color: var(--text-primary); font-weight: 600;">${(regData.textbooks_distributed || 0).toLocaleString()}</span>
          </div>
        </div>
      `;

      layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'auto',
        className: 'leaflet-custom-tooltip'
      });

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
        },
        mouseout: function(e) {
          geoJsonLayer.resetStyle(e.target);
          const isSelected = regionName.toUpperCase() === normalizeRegionName(activeRegion).toUpperCase();
          if (isSelected) {
            e.target.setStyle({
              weight: 3,
              color: 'var(--accent-gold)',
              opacity: 1
            });
          }
        },
        click: function(e) {
          selectRegion(regionName, false);
        }
      });
    }
  }).addTo(leafMap);
  
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
        selectRegion(regionName, false);
      });
      
      girlsSchoolsLayerGroup.addLayer(marker);
    }
  });
}

function setupLayerToggle() {
  const btnChoropleth = document.getElementById('btnChoropleth');
  const btnPoints = document.getElementById('btnPoints');
  const legend = document.querySelector('.map-choropleth-legend');
  const metricSelector = document.getElementById('mapMetricSelector');
  
  if (!btnChoropleth || !btnPoints) return;
  
  if (metricSelector) {
    metricSelector.addEventListener('change', (e) => {
      activeMapMetric = e.target.value;
      calculateMetricThresholds();
      renderMapLegend();
      renderMapLayers();
    });
  }
  
  btnChoropleth.addEventListener('click', () => {
    activeMapLayer = 'choropleth';
    btnChoropleth.classList.add('active');
    btnChoropleth.style.background = 'var(--accent-green)';
    btnChoropleth.style.color = '#fff';
    
    btnPoints.classList.remove('active');
    btnPoints.style.background = 'transparent';
    btnPoints.style.color = 'var(--text-secondary)';
    
    legend.style.display = 'flex';
    if (metricSelector) {
      metricSelector.style.display = 'inline-block';
    }
    
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
    if (metricSelector) {
      metricSelector.style.display = 'none';
    }
    
    renderMapLayers();
  });
}

function zoomToRegion(regionName) {
  if (!leafMap || !geoJsonLayer) return;
  
  let bounds = L.latLngBounds();
  let found = false;
  
  geoJsonLayer.eachLayer(layer => {
    if (normalizeRegionName(layer.feature.properties.region).toUpperCase() === normalizeRegionName(regionName).toUpperCase()) {
      bounds.extend(layer.getBounds());
      found = true;
    }
  });
  
  if (found) {
    leafMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }
}


function normalizeRegionName(name) {
  if (!name) return "";
  let normalized = name.replace(/[-_]/g, " ").trim();
  normalized = normalized.toLowerCase().split(' ').map(word => {
    if (word === 'es') return 'es';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  if (normalized === "Dar Es Salaam") return "Dar es Salaam";
  return normalized;
}

function aggregateRegionalClassroomsAndDorms() {
  regionalClassroomsAndDorms = {};
  SEQUIP_ME_DATA.District_Data.forEach(row => {
    const region = row[0];
    const newSchools = parseInt(row[2]) || 0;
    const girlsSchools = parseInt(row[3]) || 0;
    const dorms = parseInt(row[4]) || 0;
    const classrooms = parseInt(row[5]) || 0;
    
    const key = normalizeRegionName(region);
    
    if (!regionalClassroomsAndDorms[key]) {
      regionalClassroomsAndDorms[key] = {
        newSchools: 0,
        girlsSchools: 0,
        classrooms: 0,
        dormitories: 0
      };
    }
    regionalClassroomsAndDorms[key].newSchools += newSchools;
    regionalClassroomsAndDorms[key].girlsSchools += girlsSchools;
    regionalClassroomsAndDorms[key].classrooms += classrooms;
    regionalClassroomsAndDorms[key].dormitories += dorms;
  });
}
