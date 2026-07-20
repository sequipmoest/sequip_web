import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Extract the PBC Tracker block
pbc_pattern = r'<!-- Performance-Based Conditions \(PBC\) Tracker Card \(occupies full width\) -->.*?</div>\s*</div>\s*</div>\s*</div>'
match = re.search(pbc_pattern, html, re.DOTALL)
if not match:
    # Try alternate match if closing divs differ
    pbc_pattern = r'<!-- Performance-Based Conditions \(PBC\) Tracker Card \(occupies full width\) -->.*?</div>\s*</div>\s*</div>'
    match = re.search(pbc_pattern, html, re.DOTALL)

if not match:
    print("Error: Could not extract PBC Tracker block.")
    exit(1)

pbc_block = match.group(0)

# Remove the trailing extra closing divs from the block to make it a clean single card div
# The card starts with <div class="card global-summary-card"> ... and should end with the matching </div>.
# Let's count divs to find the exact end of the card.
def extract_clean_div(text, start_index):
    div_count = 0
    i = start_index
    while i < len(text):
        if text[i:i+4] == "<div":
            div_count += 1
            i += 4
        elif text[i:i+5] == "</div":
            div_count -= 1
            i += 5
            if div_count == 0:
                return text[start_index:i]
        else:
            i += 1
    return None

start_pos = pbc_block.find('<div class="card global-summary-card">')
clean_pbc_card = extract_clean_div(pbc_block, start_pos)
if not clean_pbc_card:
    print("Error: Could not clean PBC card.")
    exit(1)

clean_pbc_card = "<!-- Performance-Based Conditions (PBC) Tracker Card -->\n" + clean_pbc_card

# 2. Delete the float PBC block from between aboutView and heroView
html_cleaned = html.replace(pbc_block, "")

# Ensure aboutView closes cleanly with just one </div>
# Find the end of aboutView:
about_start = html_cleaned.find('<div id="aboutView"')
# The governance card is the last card in aboutView. Let's find its matching closing div.
gov_pos = html_cleaned.find('<!-- Institutional Governance & Lead Agencies -->')
gov_card_plus = html_cleaned[gov_pos:]
gov_card_clean = extract_clean_div(gov_card_plus, gov_card_plus.find('<div class="card about-section-card">'))

# Replace aboutView content up to closing aboutView div
about_view_full = html_cleaned[about_start:gov_pos + len(gov_card_clean)] + "\n    </div>"
# Let's see: we want to replace the whole region from `<div id="aboutView"` to the start of `#heroView` with:
# about_view_full + "\n"
pattern_between = r'<div id="aboutView".*?<div id="heroView"'
match_between = re.search(pattern_between, html_cleaned, re.DOTALL)
if not match_between:
    print("Error: Could not match region between aboutView and heroView.")
    exit(1)

old_region = match_between.group(0)
# We want to replace it with:
# about_view_full + "\n\n      <!-- View 1: Executive Dashboard (Hero Metric Grid) -->\n    <div id=\"heroView\""
new_region = about_view_full + "\n\n      <!-- View 1: Executive Dashboard (Hero Metric Grid) -->\n    <div id=\"heroView\""
html_cleaned = html_cleaned.replace(old_region, new_region)

# 3. Insert the PBC Tracker card inside heroView, right after the Executive Project Summary card ends.
exec_summary_pattern = r'<!-- Global Executive Project Summary \(occupies full width\) -->.*?</div>\s*</div>\s*</div>'
match_exec = re.search(exec_summary_pattern, html_cleaned, re.DOTALL)
if not match_exec:
    print("Error: Could not find Executive Project Summary card inside heroView.")
    exit(1)

exec_block = match_exec.group(0)
# Clean exec block using div counter
exec_start = exec_block.find('<div class="card global-summary-card">')
clean_exec_card = extract_clean_div(exec_block, exec_start)
clean_exec_card = "<!-- Global Executive Project Summary -->\n" + clean_exec_card

# Insert PBC card right after Executive Summary card
html_cleaned = html_cleaned.replace(exec_block, clean_exec_card + "\n\n      " + clean_pbc_card)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_cleaned)

print("Success: Restructured HTML container nesting and moved PBC tracker inside heroView.")
