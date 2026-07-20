with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update function selectRegion signature to default zoom=false
code = code.replace("function selectRegion(regionName, zoom = true) {", "function selectRegion(regionName, zoom = false) {", 1)

# 2. Update search suggestion click
code = code.replace("selectRegion(match);", "selectRegion(match, false);", 1)

# 3. Update layer click
code = code.replace("selectRegion(regionName, true);", "selectRegion(regionName, false);", 1)

# 4. Update marker click
code = code.replace("selectRegion(regionName, true);", "selectRegion(regionName, false);", 1)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Success: Disabled automatic zoom on region click in app.js.")
