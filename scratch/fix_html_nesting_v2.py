with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Helper function to extract a balanced div block
def extract_balanced_div(text, start_pos):
    div_count = 0
    i = start_pos
    while i < len(text):
        if text[i:i+4] == "<div":
            div_count += 1
            i += 4
        elif text[i:i+5] == "</div":
            div_count -= 1
            i += 5
            if div_count == 0:
                return text[start_pos:i]
        else:
            i += 1
    return None

# 1. Locate the PBC Tracker comment and its card
pbc_comment = "<!-- Performance-Based Conditions (PBC) Tracker Card (occupies full width) -->"
pbc_comment_pos = html.find(pbc_comment)
if pbc_comment_pos == -1:
    print("Error: Could not find PBC comment.")
    exit(1)

# Find the next `<div class="card global-summary-card">`
card_start_pos = html.find('<div class="card global-summary-card">', pbc_comment_pos)
if card_start_pos == -1:
    print("Error: Could not find PBC card div.")
    exit(1)

# Extract the full clean PBC card
clean_pbc_card = extract_balanced_div(html, card_start_pos)
if not clean_pbc_card:
    print("Error: Could not extract balanced PBC card.")
    exit(1)

# The full block to remove starts at the comment and ends at the end of the clean card
pbc_full_block = html[pbc_comment_pos : card_start_pos + len(clean_pbc_card)]

# Let's check what trailing extra divs are present between the end of PBC card and the start of heroView
hero_view_comment = "<!-- View 1: Executive Dashboard (Hero Metric Grid) -->"
hero_view_pos = html.find(hero_view_comment)
if hero_view_pos == -1:
    print("Error: Could not find heroView comment.")
    exit(1)

# The region to delete is from pbc_comment_pos to hero_view_pos
# But wait, we want to keep the closing of `#aboutView` if it is closed there.
# Let's find the closing `</div>` of `#aboutView` before the PBC comment.
# Where does `#aboutView` start?
about_view_start = html.find('<div id="aboutView"')
if about_view_start == -1:
    print("Error: Could not find aboutView start.")
    exit(1)

# Let's find the end of aboutView content
# The last section is the governance card.
gov_card_pos = html.find('<!-- Institutional Governance & Lead Agencies -->')
if gov_card_pos == -1:
    print("Error: Could not find governance card.")
    exit(1)

gov_card_div_start = html.find('<div class="card about-section-card">', gov_card_pos)
gov_card_block = extract_balanced_div(html, gov_card_div_start)

about_view_end_pos = gov_card_div_start + len(gov_card_block)

# Construct clean index.html parts
header_part = html[:about_view_end_pos]
# Add the closing div for aboutView
about_view_close = "\n    </div>\n\n"

# The next part should start from hero_view_comment
hero_part = html[hero_view_pos:]

# Combine them to clean up the middle region completely
html_cleaned = header_part + about_view_close + hero_part

# 3. Locate the Executive Project Summary card inside heroView
exec_summary_comment = "<!-- Global Executive Project Summary (occupies full width) -->"
exec_summary_pos = html_cleaned.find(exec_summary_comment)
if exec_summary_pos == -1:
    # Try alternate text
    exec_summary_comment = "<!-- Global Executive Project Summary -->"
    exec_summary_pos = html_cleaned.find(exec_summary_comment)

if exec_summary_pos == -1:
    print("Error: Could not find Executive Project Summary card comment inside heroView.")
    exit(1)

exec_card_start = html_cleaned.find('<div class="card global-summary-card">', exec_summary_pos)
exec_card_block = extract_balanced_div(html_cleaned, exec_card_start)

# Insert the PBC Tracker card right after the Executive Summary card
full_exec_plus_pbc = exec_card_block + "\n\n      <!-- Performance-Based Conditions (PBC) Tracker Card -->\n" + clean_pbc_card

# Replace the old exec card block with the combined block
html_final = html_cleaned.replace(exec_card_block, full_exec_plus_pbc, 1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_final)

print("Success: Balanced HTML nesting completed successfully!")
