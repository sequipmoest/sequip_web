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
let currentLayout = 'hero'; // 'hero' or 'map'
let activeRegion = 'Dodoma';
let compareRegion = 'National Average';
let isComparing = false;
let currentTheme = 'light';

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
  });
}

// Layout Switcher
function initLayoutSwitcher() {
  const heroBtn = document.getElementById('btnHeroLayout');
  const mapBtn = document.getElementById('btnMapLayout');
  const heroView = document.getElementById('heroView');
  const mapView = document.getElementById('mapView');

  heroBtn.addEventListener('click', () => {
    currentLayout = 'hero';
    heroBtn.classList.add('active');
    mapBtn.classList.remove('active');
    heroView.style.display = 'flex';
    mapView.style.display = 'none';
    
    // Animate numbers and charts
    renderAllCharts();
    animateNectaBars();
  });

  mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    heroBtn.classList.remove('active');
    mapView.style.display = 'grid';
    heroView.style.display = 'none';
    
    // Trigger map load adjustments if needed
    renderRegionDetails(activeRegion);
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
  const paths = document.querySelectorAll('.map-region-path');
  const tooltip = document.getElementById('mapTooltip');
  
  paths.forEach(path => {
    const pathIdx = path.getAttribute('data-index');
    const regionName = REGION_MAPPING[pathIdx];
    
    // Add title attribute for default accessibility
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = regionName;
    path.appendChild(title);
    
    path.addEventListener('mouseenter', (e) => {
      const regData = SEQUIP_DATA.regional[regionName];
      tooltip.innerHTML = `
        <div style="font-weight: 700; color: var(--accent-gold);">${regionName} Region</div>
        <div style="margin-top: 4px;">New Schools: ${regData.schools}</div>
        <div>Teachers Trained: ${regData.teachers_trained.toLocaleString()}</div>
      `;
      tooltip.style.opacity = 1;
    });

    path.addEventListener('mousemove', (e) => {
      const mapContainerRect = document.querySelector('.map-container').getBoundingClientRect();
      const x = e.clientX - mapContainerRect.left + 15;
      const y = e.clientY - mapContainerRect.top + 15;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = 0;
    });

    path.addEventListener('click', () => {
      selectRegion(regionName, path);
    });
  });

  // Select Dodoma by default visually
  const defaultPath = document.querySelector(`.map-region-path[data-index="15"]`);
  if (defaultPath) {
    defaultPath.classList.add('active');
  }
}

// Select Region Actions
function selectRegion(regionName, pathElement = null) {
  activeRegion = regionName;
  
  // Update map highlighting
  document.querySelectorAll('.map-region-path').forEach(p => p.classList.remove('active'));
  
  if (pathElement) {
    pathElement.classList.add('active');
  } else {
    // Find path index for name and highlight
    const pathIdx = Object.keys(REGION_MAPPING).find(key => REGION_MAPPING[key] === regionName);
    if (pathIdx !== undefined) {
      const path = document.querySelector(`.map-region-path[data-index="${pathIdx}"]`);
      if (path) path.classList.add('active');
    }
  }
  
  renderRegionDetails(regionName);
  
  if (isComparing) {
    updateComparisonView();
  }
}

// Render Regional Sidebar details
function renderRegionDetails(regionName) {
  const r = SEQUIP_DATA.regional[regionName];
  if (!r) return;

  document.getElementById('selectedRegionName').innerText = regionName;
  document.getElementById('regSchools').innerText = r.schools;
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
        selectRegion(match);
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
  let compData;
  
  if (compName === 'National Average') {
    // Generate averages
    const count = Object.keys(SEQUIP_DATA.regional).length;
    const n = SEQUIP_DATA.national;
    compData = {
      schools: Math.round(n.schools / count),
      teachers_trained: Math.round(n.teachers_trained / count),
      textbooks_distributed: Math.round(n.textbooks_distributed / count),
      aep_girls_registered: Math.round(n.aep_girls_registered / count),
      ict_computers: Math.round(n.ict_computers / count),
      safe_schools_reached: Math.round(n.safe_schools_reached / count)
    };
  } else {
    compData = SEQUIP_DATA.regional[compName];
  }

  // Set comparison header names
  document.getElementById('compHeaderMain').innerText = mainName;
  document.getElementById('compHeaderComp').innerText = compName;

  // Set values
  document.getElementById('compMainSchools').innerText = mainData.schools;
  document.getElementById('compCompSchools').innerText = compData.schools;
  
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
  
  // 3. Regional Distribution Chart (Horizontal Bar Chart)
  const ctxRegional = document.getElementById('regionalDistributionChart');
  if (ctxRegional) {
    const rawRegions = SEQUIP_ME_DATA.New_Schools_By_Region;
    
    const regionalDataList = Object.entries(rawRegions).map(([key, val]) => {
      const titleCaseName = key.toLowerCase().split(' ').map(word => {
        if (word === 'es') return 'es';
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
      return { name: titleCaseName, count: val };
    });
    
    regionalDataList.sort((a, b) => b.count - a.count);
    
    const regLabels = regionalDataList.map(item => item.name);
    const regValues = regionalDataList.map(item => item.count);
    
    const count = regLabels.length;
    const regColors = Array.from({length: count}, (_, i) => {
      const ratio = i / (count - 1);
      const hue = 140 + Math.round(50 * ratio);
      return `hsla(${hue}, 85%, 55%, ${0.9 - ratio * 0.45})`;
    });
    
    charts.regional = new Chart(ctxRegional, {
      type: 'bar',
      data: {
        labels: regLabels,
        datasets: [{
          label: 'New Schools',
          data: regValues,
          backgroundColor: regColors,
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
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
                return ` ${context.raw} New Schools`;
              }
            }
          }
        },
        scales: {
          x: {
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

// Apply dynamic density colors to Map based on school counts
function colorMapChoropleth() {
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
}
