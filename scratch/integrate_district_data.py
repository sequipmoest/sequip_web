import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Replace the regionalStatsGrid block
old_stats_grid = """          <!-- Standard stats grid -->
          <div id="regionalStatsGrid" class="regional-grid">
            <div class="regional-metric-card">
              <div id="regSchools" class="regional-metric-num" style="color: var(--accent-gold);">35</div>
              <div class="regional-metric-lbl">New Schools Built</div>
            </div>
            <div class="regional-metric-card">
              <div id="regTeachers" class="regional-metric-num" style="color: var(--accent-green);">1,586</div>
              <div class="regional-metric-lbl">Teachers Trained</div>
            </div>
            <div class="regional-metric-card">
              <div id="regTextbooks" class="regional-metric-num" style="color: var(--accent-blue);">438,825</div>
              <div class="regional-metric-lbl">Textbooks Supplied</div>
            </div>
            <div class="regional-metric-card">
              <div id="regGirlsAep" class="regional-metric-num" style="color: #e040fb;">590</div>
              <div class="regional-metric-lbl">Girls Enrolled (AEP)</div>
            </div>
            <div class="regional-metric-card">
              <div id="regComputers" class="regional-metric-num" style="color: #00e5ff;">71</div>
              <div class="regional-metric-lbl">Computers & IT Assets</div>
            </div>
            <div class="regional-metric-card">
              <div id="regSafeSchools" class="regional-metric-num" style="color: #ff5252;">130</div>
              <div class="regional-metric-lbl">Safe Schools Enrolled</div>
            </div>
          </div>"""

new_stats_grid = """          <!-- Standard stats grid -->
          <div id="regionalStatsGrid" class="regional-grid">
            <div class="regional-metric-card">
              <div id="regSchools" class="regional-metric-num" style="color: var(--accent-gold);">35</div>
              <div class="regional-metric-lbl">New Schools Built</div>
            </div>
            <div class="regional-metric-card">
              <div id="regGirlsSchools" class="regional-metric-num" style="color: var(--accent-green);">1</div>
              <div class="regional-metric-lbl">Girls' Schools Built</div>
            </div>
            <div class="regional-metric-card">
              <div id="regClassrooms" class="regional-metric-num" style="color: var(--accent-blue);">120</div>
              <div class="regional-metric-lbl">Classrooms Built</div>
            </div>
            <div class="regional-metric-card">
              <div id="regDormitories" class="regional-metric-num" style="color: var(--accent-orange);">28</div>
              <div class="regional-metric-lbl">Dormitories Built</div>
            </div>
            <div class="regional-metric-card">
              <div id="regTeachers" class="regional-metric-num" style="color: var(--accent-green);">1,586</div>
              <div class="regional-metric-lbl">Teachers Trained</div>
            </div>
            <div class="regional-metric-card">
              <div id="regTextbooks" class="regional-metric-num" style="color: var(--accent-blue);">438,825</div>
              <div class="regional-metric-lbl">Textbooks Supplied</div>
            </div>
            <div class="regional-metric-card">
              <div id="regGirlsAep" class="regional-metric-num" style="color: #e040fb;">590</div>
              <div class="regional-metric-lbl">Girls Enrolled (AEP)</div>
            </div>
            <div class="regional-metric-card">
              <div id="regComputers" class="regional-metric-num" style="color: #00e5ff;">71</div>
              <div class="regional-metric-lbl">Computers & IT Assets</div>
            </div>
            <div class="regional-metric-card">
              <div id="regSafeSchools" class="regional-metric-num" style="color: #ff5252;">130</div>
              <div class="regional-metric-lbl">Safe Schools Enrolled</div>
            </div>
          </div>"""

html = html.replace(old_stats_grid, new_stats_grid)

# 2. Replace comparison columns
old_comp_column_main = """              <div class="comparison-metric">
                <span class="stat-label">New Schools</span>
                <span id="compMainSchools" class="comparison-val">35</span>
              </div>"""

new_comp_column_main = """              <div class="comparison-metric">
                <span class="stat-label">New Schools</span>
                <span id="compMainSchools" class="comparison-val">35</span>
              </div>
              <div class="comparison-metric">
                <span class="stat-label">Girls' Schools</span>
                <span id="compMainGirlsSchools" class="comparison-val">1</span>
              </div>
              <div class="comparison-metric">
                <span class="stat-label">Classrooms</span>
                <span id="compMainClassrooms" class="comparison-val">120</span>
              </div>
              <div class="comparison-metric">
                <span class="stat-label">Dormitories</span>
                <span id="compMainDormitories" class="comparison-val">28</span>
              </div>"""

html = html.replace(old_comp_column_main, new_comp_column_main, 1)

old_comp_column_comp = """              <div class="comparison-metric">
                <span class="stat-label">New Schools</span>
                <span id="compCompSchools" class="comparison-val">32</span>
              </div>"""

new_comp_column_comp = """              <div class="comparison-metric">
                <span class="stat-label">New Schools</span>
                <span id="compCompSchools" class="comparison-val">32</span>
              </div>
              <div class="comparison-metric">
                <span class="stat-label">Girls' Schools</span>
                <span id="compCompGirlsSchools" class="comparison-val">1</span>
              </div>
              <div class="comparison-metric">
                <span class="stat-label">Classrooms</span>
                <span id="compCompClassrooms" class="comparison-val">115</span>
              </div>
              <div class="comparison-metric">
                <span class="stat-label">Dormitories</span>
                <span id="compCompDormitories" class="comparison-val">25</span>
              </div>"""

html = html.replace(old_comp_column_comp, new_comp_column_comp, 1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Updated index.html elements successfully.")

# Now update app.js
with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update aggregateRegionalClassroomsAndDorms
old_agg_func = """function aggregateRegionalClassroomsAndDorms() {
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
}"""

new_agg_func = """function aggregateRegionalClassroomsAndDorms() {
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
}"""

code = code.replace(old_agg_func, new_agg_func)

# 2. Update renderRegionDetails
old_render_details = """function renderRegionDetails(regionName) {
  const r = SEQUIP_DATA.regional[regionName];
  if (!r) return;

  document.getElementById('selectedRegionName').innerText = regionName;
  document.getElementById('regSchools').innerText = r.schools;
  document.getElementById('regTeachers').innerText = r.teachers_trained.toLocaleString();
  document.getElementById('regTextbooks').innerText = r.textbooks_distributed.toLocaleString();
  document.getElementById('regGirlsAep').innerText = r.aep_girls_registered.toLocaleString();
  document.getElementById('regComputers').innerText = r.ict_computers.toLocaleString();
  document.getElementById('regSafeSchools').innerText = r.safe_schools_reached.toLocaleString();"""

new_render_details = """function renderRegionDetails(regionName) {
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
  document.getElementById('regSafeSchools').innerText = r.safe_schools_reached.toLocaleString();"""

code = code.replace(old_render_details, new_render_details)

# 3. Update updateComparisonView
old_comp_view = """function updateComparisonView() {
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
}"""

new_comp_view = """function updateComparisonView() {
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
}"""

code = code.replace(old_comp_view, new_comp_view)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated app.js code successfully.")
