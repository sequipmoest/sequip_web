with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Identify and extract the PBC tracker code block
pbc_start_tag = "<!-- Performance-Based Conditions (PBC) Tracker Card -->"
pbc_end_tag = "</div>\n    </div>\n    \n    <!-- View 2: Geographical Map-Centric Layout -->"

pbc_start_idx = html.find(pbc_start_tag)
pbc_end_idx = html.find(pbc_end_tag)

if pbc_start_idx == -1 or pbc_end_idx == -1:
    print("Error: Could not locate PBC tracker block boundaries in index.html.")
    exit(1)

# The end index should include the closing div of the global-summary-card
# Let's find the closing div index precisely
actual_end_idx = pbc_end_idx + len("</div>")

pbc_block = html[pbc_start_idx:actual_end_idx]

# 2. Modify the outer card of PBC tracker to include grid-column: span 12;
modified_pbc_block = pbc_block.replace(
    '<div class="card global-summary-card">',
    '<div class="card global-summary-card" style="grid-column: span 12;">',
    1
)

# Remove the PBC tracker block from its current location in HTML
html_cleaned = html[:pbc_start_idx] + html[actual_end_idx:]

# 3. Locate where mapView closes
# mapView closing tag is right before the official ministry footer
map_view_close_tag = "<!-- Official Ministry Footer -->"
map_view_close_idx = html_cleaned.find(map_view_close_tag)

if map_view_close_idx == -1:
    print("Error: Could not locateMapView close boundary in index.html.")
    exit(1)

# Find the </div> tag just before the footer
# We can search backwards from map_view_close_idx for "</div>"
pbc_insert_idx = html_cleaned.rfind("</div>", 0, map_view_close_idx)

if pbc_insert_idx == -1:
    print("Error: Could not find insert position inside mapView.")
    exit(1)

# Insert the modified PBC block right before that closing </div> of mapView
html_final = html_cleaned[:pbc_insert_idx] + "\n      " + modified_pbc_block + "\n    " + html_cleaned[pbc_insert_idx:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_final)

print("Successfully moved PBC Tracker to the Maps view below the maps container.")
