with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Fix Bug 1: Invalidate map size on layout tab switch
old_map_click = """  mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    heroBtn.classList.remove('active');
    mapView.style.display = 'grid';
    heroView.style.display = 'none';
    
    // Trigger map load adjustments if needed
    renderRegionDetails(activeRegion);
  });"""

new_map_click = """  mapBtn.addEventListener('click', () => {
    currentLayout = 'map';
    mapBtn.classList.add('active');
    heroBtn.classList.remove('active');
    mapView.style.display = 'grid';
    heroView.style.display = 'none';
    
    // Trigger map load adjustments and invalidate size for Leaflet
    renderRegionDetails(activeRegion);
    if (leafMap) {
      setTimeout(() => {
        leafMap.invalidateSize();
        zoomToRegion(activeRegion);
      }, 50);
    }
  });"""

if old_map_click in code:
    code = code.replace(old_map_click, new_map_click, 1)
    print("Success: Patched layout switcher map tab click listener.")
else:
    print("Error: Could not find layout switcher map click block.")

# 2. Fix Bug 2: Normalize region names with hyphen support
old_normalize_fn = """function normalizeRegionName(name) {
  if (!name) return "";
  let normalized = name.trim();
  normalized = normalized.toLowerCase().split(' ').map(word => {
    if (word === 'es') return 'es';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  return normalized;
}"""

new_normalize_fn = """function normalizeRegionName(name) {
  if (!name) return "";
  let normalized = name.replace(/[-_]/g, " ").trim();
  normalized = normalized.toLowerCase().split(' ').map(word => {
    if (word === 'es') return 'es';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  if (normalized === "Dar Es Salaam") return "Dar es Salaam";
  return normalized;
}"""

if old_normalize_fn in code:
    code = code.replace(old_normalize_fn, new_normalize_fn, 1)
    print("Success: Updated normalizeRegionName.")
else:
    print("Error: Could not find old_normalize_fn.")

# 3. Ensure normalizeRegionName is used in selectRegion, zoomToRegion, and when resetting style
# In selectRegion:
# const isSelectedRegion = layer.feature.properties.region.toUpperCase() === regionName.toUpperCase();
# should become:
# const isSelectedRegion = normalizeRegionName(layer.feature.properties.region).toUpperCase() === normalizeRegionName(regionName).toUpperCase();
code = code.replace(
    "const isSelectedRegion = layer.feature.properties.region.toUpperCase() === regionName.toUpperCase();",
    "const isSelectedRegion = normalizeRegionName(layer.feature.properties.region).toUpperCase() === normalizeRegionName(regionName).toUpperCase();"
)

# In zoomToRegion:
# if (layer.feature.properties.region.toUpperCase() === regionName.toUpperCase()) {
# should become:
# if (normalizeRegionName(layer.feature.properties.region).toUpperCase() === normalizeRegionName(regionName).toUpperCase()) {
code = code.replace(
    "if (layer.feature.properties.region.toUpperCase() === regionName.toUpperCase()) {",
    "if (normalizeRegionName(layer.feature.properties.region).toUpperCase() === normalizeRegionName(regionName).toUpperCase()) {"
)

# In renderMapLayers style:
# const isSelectedRegion = regionName.toUpperCase() === activeRegion.toUpperCase();
# let's check what is in renderMapLayers style function:
# We have:
# const regionName = feature.properties.region;
# const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
# We should change it to normalize regionName first!
# Let's inspect the exact lines of renderMapLayers in code.
# In renderMapLayers:
# const regionName = feature.properties.region;
# const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
# const count = regData.schools;
# const isSelectedRegion = regionName.toUpperCase() === activeRegion.toUpperCase();
# We replace it with:
# const regionName = normalizeRegionName(feature.properties.region);
# const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
# const count = regData.schools;
# const isSelectedRegion = regionName.toUpperCase() === normalizeRegionName(activeRegion).toUpperCase();
old_style_block = """    style: function(feature) {
      const regionName = feature.properties.region;
      const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
      const count = regData.schools;
      
      const isSelectedRegion = regionName.toUpperCase() === activeRegion.toUpperCase();"""

new_style_block = """    style: function(feature) {
      const regionName = normalizeRegionName(feature.properties.region);
      const regData = SEQUIP_DATA.regional[regionName] || { schools: 0 };
      const count = regData.schools;
      
      const isSelectedRegion = regionName.toUpperCase() === normalizeRegionName(activeRegion).toUpperCase();"""

if old_style_block in code:
    code = code.replace(old_style_block, new_style_block, 1)
    print("Success: Updated style function inside renderMapLayers.")
else:
    print("Warning: Could not find old_style_block in renderMapLayers. Let's do regex replacement.")

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Patching completed successfully!")
