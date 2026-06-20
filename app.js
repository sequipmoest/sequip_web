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
let currentTheme = 'dark';

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
  renderEnrolmentChart();
  animateNectaBars();
  
  // Set up resize listener for charts
  window.addEventListener('resize', () => {
    renderEnrolmentChart();
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
    renderEnrolmentChart();
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
    renderEnrolmentChart();
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
  
  // Set National metrics
  document.getElementById('nationalBudget').innerText = `US$${(n.schools * 0.64 + 5).toFixed(0)}M`; // Derived illustration
  document.getElementById('nationalTeachers').innerText = n.teachers_trained.toLocaleString();
  document.getElementById('nationalTextbooks').innerText = n.textbooks_distributed.toLocaleString();
  document.getElementById('nationalEnrolment').innerText = SEQUIP_DATA.enrolment['2026'].toLocaleString();
  
  // Set Infrastructure sub-stats
  document.getElementById('statSchools').innerText = n.schools;
  document.getElementById('statClassrooms').innerText = n.classrooms_built + n.classrooms_upgraded;
  document.getElementById('statLabs').innerText = n.science_labs;
  document.getElementById('statLatrines').innerText = n.pit_latrines_built;
  
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

// Draw Female Enrolment Chart (Canvas-based)
function renderEnrolmentChart() {
  const canvas = document.getElementById('enrolmentChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Set dimensions correctly (accounting for retina display pixel density)
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  
  // Clean canvas
  ctx.clearRect(0, 0, width, height);

  // Setup theme variables for drawing
  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const barGradStart = '#e040fb';
  const barGradEnd = '#00e5ff';
  
  // Data values
  const val2020 = SEQUIP_DATA.enrolment['2020'];
  const val2026 = SEQUIP_DATA.enrolment['2026'];
  const maxVal = 80000;
  
  // Draw Grid Lines (Horizontal)
  const yLines = [0, 20000, 40000, 60000, 80000];
  const chartHeight = height - 40;
  const chartWidth = width - 80;
  const startX = 60;
  const startY = 15;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.font = '10px var(--font-body)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  yLines.forEach(val => {
    const py = startY + chartHeight - (val / maxVal) * chartHeight;
    // Line
    ctx.beginPath();
    ctx.moveTo(startX, py);
    ctx.lineTo(startX + chartWidth, py);
    ctx.stroke();
    
    // Label
    ctx.fillText(val.toLocaleString(), startX - 10, py);
  });

  // Draw Bars (Animated)
  const drawBar = (x, val, yearLabel) => {
    const barHeight = (val / maxVal) * chartHeight;
    const bx = x - 25;
    const by = startY + chartHeight - barHeight;
    const bw = 50;
    
    // Create Gradient
    const gradient = ctx.createLinearGradient(bx, by, bx, by + barHeight);
    gradient.addColorStop(0, barGradStart);
    gradient.addColorStop(1, barGradEnd);
    
    // Rounded bar top
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, barHeight, [8, 8, 0, 0]);
    ctx.fill();
    
    // Draw Value label above
    ctx.fillStyle = isDark ? '#fff' : '#000';
    ctx.font = 'bold 12px var(--font-title)';
    ctx.textAlign = 'center';
    ctx.fillText(val.toLocaleString(), x, by - 10);
    
    // Draw Year label below
    ctx.fillStyle = textColor;
    ctx.font = '600 11px var(--font-title)';
    ctx.fillText(yearLabel, x, startY + chartHeight + 18);
  };

  const gap = chartWidth / 3;
  drawBar(startX + gap, val2020, '2020 (Baseline)');
  drawBar(startX + gap * 2, val2026, '2025 (Enrolled)');
}
