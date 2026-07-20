with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's inspect the block around line 523-531
old_block_middle = """      </div>
    </div>

      
    </div>
    
    <!-- View 2: Geographical Map-Centric Layout -->"""

new_block_middle = """      </div>
    </div>
    
    <!-- View 2: Geographical Map-Centric Layout -->"""

html_fixed = html.replace(old_block_middle, new_block_middle)

# Now, we need to close mapView right after the PBC tracker card, and before the footer.
# Let's find the closing of the PBC tracker card, which is right before "<!-- Official Ministry Footer -->"
footer_marker = "<!-- Official Ministry Footer -->"
footer_idx = html_fixed.find(footer_marker)

if footer_idx == -1:
    print("Error: Could not find footer marker.")
    exit(1)

# Find the last </div> before the footer marker
insert_idx = html_fixed.rfind("</div>", 0, footer_idx)
if insert_idx == -1:
    print("Error: Could not find last div before footer.")
    exit(1)

# We want to insert a </div> after that div ends (which is at insert_idx + len("</div>"))
# This will close the mapView container.
split_point = insert_idx + len("</div>")
html_final = html_fixed[:split_point] + "\n    </div>" + html_fixed[split_point:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_final)

print("Successfully updated index.html to fix footer nesting.")
