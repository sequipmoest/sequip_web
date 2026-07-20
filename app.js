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
let regionalClassroomsAndDorms = {};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLayoutSwitcher();
  initMapInteractions();
  initSearch();
  initCompare();
  
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

  const key = normalizeRegionName(regionName);
  const agg = regionalClassroomsAndDorms[key] || { newSchools: 0, girlsSchools: 0, classrooms: 0, dormitories: 0 };

  document.getElementById('selectedRegionName').innerText = regionName;
  document.getElementById('regSchools').innerText = agg.newSchools;
  document.getElementById('regGirlsSchools').innerText = agg.girlsSchools;
  document.getElementById('regClassrooms').innerText = agg.classrooms.toLocaleString();
  document.getElementById('regDormitories').innerText = agg.dormitories.toLocaleString();
  
  document.getElementById('regTeachers').innerText = r.teachers_trained.toLocaleString();
  document.getElementById('regTextbooks').innerText = r.textbooks_distributed.toLocaleString();
  document.getElementById('regGirlsAep').innerText = r.aep_girls_registered.toLocaleString();
  document.getElementById('regComputers').innerText = r.ict_computers.toLocaleString();
  document.getElementById('regSafeSchools').innerText = r.safe_schools_reached.toLocaleString();
  
  // Set region metadata badge based on location
  const northRegions = ['Kagera', 'Mwanza', 'Mara', 'Geita', 'Shinyanga', 'Simiyu', 'Arusha', 'Kilimanjaro', 'Manyara'];
  const southRegions = ['Rukwa', 'Mbeya', 'Songwe', 'Njombe', 'Iringa', 'Ruvuma', 'Lindi', 'Mtwara'];
  const centralRegions = ['Dodoma', 'Singida', 'Tabora', 'Katavi', 'Kigoma'];
  let zone = 'Eastern Zone';
  if (northRegions.includes(regionName)) zone = 'Northern Zone';
  else if (southRegions.includes(regionName)) zone = 'Southern Zone';
  else if (centralRegions.includes(regionName)) zone = 'Central/Western Zone';
  
  document.getElementById('regionZoneTag').innerText = zone;
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

// Render all M&E Chart.js charts
function renderAllCharts() {
  if (typeof Chart === 'undefined') return;

  // Destroy existing charts to prevent ghost renders on hover
  if (charts.budget) charts.budget.destroy();
  if (charts.infrastructure) charts.infrastructure.destroy();
  if (charts.regional) charts.regional.destroy();
  
  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const fontName = 'Inter, sans-serif';
  
  // 1. Budget Allocation Chart (Donut Chart)
  const ctxBudget = document.getElementById('budgetAllocationChart');
  if (ctxBudget) {
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
      '#00e5ff', // Accent Blue
      '#e040fb', // Purple (Girls)
      '#2196f3', // Darker Blue (Boys)
      '#ffd54f', // Gold
      '#ff5252', // Red
      '#00e676', // Green
      '#81c784', // Light Green
      '#64748b', // Grey-Blue
      '#ff8a65'  // Coral
    ];
    
    charts.budget = new Chart(ctxBudget, {
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
          const tooltipEl = document.getElementById('budgetChartTooltip');
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
  
  // 2. Infrastructure Volume Chart (Bar Chart)
  const ctxInfra = document.getElementById('infrastructureVolumeChart');
  if (ctxInfra) {
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
    
    const infraColors = sortedTotals.map((item, idx) => {
      if (item.Activity.includes("VYOO")) return '#e040fb'; // Purple
      if (item.Activity.includes("MADARASA")) return '#00e676'; // Green
      if (item.Activity.includes("SHULE MPYA")) return '#00e5ff'; // Blue
      if (item.Activity.includes("MABWENI")) return '#2196f3'; // Darker Blue
      if (item.Activity.includes("NYUMBA")) return '#ffd54f'; // Gold
      if (item.Activity.includes("MAABARA")) return '#ff8a65'; // Coral
      return '#64748b'; // Grey
    });
    
    charts.infrastructure = new Chart(ctxInfra, {
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
                return ` ${context.raw.toLocaleString()} Units`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                family: fontName,
                size: 9,
                weight: '500'
              }
            }
          },
          y: {
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
          }
        }
      }
    });
  }
  
  // 3. Regional Distribution Chart (Horizontal Stacked Bar Chart of Classrooms vs Dormitories)
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

function getChoroplethColor(count) {
  const style = getComputedStyle(document.documentElement);
  if (count === 0) return 'rgba(0, 0, 0, 0.05)';
  
  let val1 = style.getPropertyValue('--choropleth-level-1').trim() || 'rgba(0, 230, 118, 0.15)';
  let val2 = style.getPropertyValue('--choropleth-level-2').trim() || 'rgba(0, 230, 118, 0.35)';
  let val3 = style.getPropertyValue('--choropleth-level-3').trim() || 'rgba(0, 230, 118, 0.65)';
  let val4 = style.getPropertyValue('--choropleth-level-4').trim() || 'rgba(0, 230, 118, 0.95)';
  
  if (count <= 20) return val1;
  if (count <= 30) return val2;
  if (count <= 40) return val3;
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
      const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
      const count = regData.schools;
      
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
      const infra = regionalClassroomsAndDorms[regionName] || { classrooms: 0, dormitories: 0 };
      
      const tooltipContent = `
        <div class="map-tooltip-popup">
          <h4 style="font-family: var(--font-title); font-size: 0.85rem; font-weight: 700; color: var(--accent-green); margin-bottom: 6px; border-bottom: 1px solid var(--border-card); padding-bottom: 4px;">${regionName} Region</h4>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;"><span style="color: var(--text-secondary);">New Schools:</span><span style="font-weight:600; color: var(--text-primary);">${regData.schools}</span></div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;"><span style="color: var(--text-secondary);">Classrooms:</span><span style="font-weight:600; color: var(--text-primary);">${infra.classrooms.toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;"><span style="color: var(--text-secondary);">Dormitories:</span><span style="font-weight:600; color: var(--text-primary);">${infra.dormitories.toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;"><span style="color: var(--text-secondary);">Teachers Trained:</span><span style="font-weight:600; color: var(--text-primary);">${regData.teachers_trained.toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:3px;"><span style="color: var(--text-secondary);">Textbooks:</span><span style="font-weight:600; color: var(--text-primary);">${regData.textbooks_distributed.toLocaleString()}</span></div>
          ${regData.girls_science_schools > 0 ? `<div style="margin-top: 6px; color: var(--accent-green); font-weight: 700;">★ ${regData.girls_science_schools} Girls' School(s) Built</div>` : ''}
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
