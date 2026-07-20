import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Locate the <div class="map-container">...</div> section
start_tag = '<div class="map-container">'
start_idx = content.find(start_tag)
if start_idx == -1:
    print("Error: Could not find map-container tag")
    exit(1)

# Search for '</section>' after start_idx
end_section_idx = content.find('</section>', start_idx)
if end_section_idx == -1:
    print("Error: Could not find matching </section>")
    exit(1)

# Find the last '</div>' before '</section>'
end_idx = content.rfind('</div>', start_idx, end_section_idx)
if end_idx == -1:
    print("Error: Could not find closing </div> before </section>")
    exit(1)

# We include the '</div>' itself in the match to replace the whole container contents
end_idx += 6

old_container = content[start_idx:end_idx]
print(f"Found container of length {len(old_container)}")

new_container = """<div class="map-container" style="position: relative; height: 600px; width: 100%;">
          <div id="gisMap" style="height: 100%; width: 100%; border-radius: 8px; background: transparent; z-index: 1;"></div>
          
          <!-- Custom Floating Layer Selector -->
          <div class="map-layer-selector" style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px; padding: 6px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-card); backdrop-filter: blur(10px); z-index: 1000;">
            <button id="btnChoropleth" class="layer-selector-btn active" style="background: var(--accent-green); border: none; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              New Schools Density
            </button>
            <button id="btnPoints" class="layer-selector-btn" style="background: transparent; border: none; color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: var(--transition);">
              Girls' Schools
            </button>
          </div>
          
          <!-- Floating Map Tooltip -->
          <div id="mapTooltip" class="map-tooltip" style="position: absolute; display: none; background: var(--bg-secondary); border: 1px solid var(--border-card); padding: 10px; border-radius: 8px; font-size: 0.75rem; color: var(--text-primary); backdrop-filter: blur(8px); z-index: 1000; pointer-events: none; box-shadow: var(--shadow-md);"></div>

          <!-- Choropleth Map Legend -->
          <div class="map-choropleth-legend" style="position: absolute; bottom: 15px; left: 15px; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-card); backdrop-filter: blur(10px); z-index: 1000;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">New Schools Built</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: var(--choropleth-level-1); border-radius: 2px; border: 1px solid var(--border-card);"></div>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">1 - 2 schools</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: var(--choropleth-level-2); border-radius: 2px; border: 1px solid var(--border-card);"></div>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">3 - 4 schools</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: var(--choropleth-level-3); border-radius: 2px; border: 1px solid var(--border-card);"></div>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">5 - 6 schools</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: var(--choropleth-level-4); border-radius: 2px; border: 1px solid var(--border-card);"></div>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">7 - 8 schools</span>
            </div>
          </div>
        </div>"""

content = content.replace(old_container, new_container)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("index.html map replacement done successfully!")
