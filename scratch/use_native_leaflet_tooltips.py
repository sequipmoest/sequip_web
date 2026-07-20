with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace manual mouseover/mousemove/mouseout tooltip code with native layer.bindTooltip
old_onEachFeature = """    onEachFeature: function(feature, layer) {
      const properties = feature.properties;
      const regionName = normalizeRegionName(properties.region);
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
    }"""

new_onEachFeature = """    onEachFeature: function(feature, layer) {
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
          selectRegion(regionName, true);
        }
      });
    }"""

if old_onEachFeature in code:
    code = code.replace(old_onEachFeature, new_onEachFeature, 1)
    print("Success: Updated onEachFeature to native sticky tooltips.")
else:
    print("Error: Could not find old_onEachFeature.")

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

# Append CSS for leaflet-custom-tooltip to style.css
with open("style.css", "r", encoding="utf-8") as f:
    css = f.read()

tooltip_css = """

/* Native Leaflet Sticky Tooltip Styling */
.leaflet-custom-tooltip {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-card) !important;
  color: var(--text-primary) !important;
  border-radius: 8px !important;
  box-shadow: var(--shadow-md) !important;
  backdrop-filter: blur(8px);
  padding: 8px 12px !important;
  font-family: var(--font-body) !important;
  font-size: 0.75rem !important;
  opacity: 1 !important;
}

.leaflet-custom-tooltip::before {
  border-top-color: var(--border-card) !important;
}
"""

if ".leaflet-custom-tooltip" not in css:
    css += tooltip_css
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Success: Appended tooltip CSS to style.css.")
else:
    print("Tooltip CSS already exists.")

print("Tooltip upgrade completed successfully!")
