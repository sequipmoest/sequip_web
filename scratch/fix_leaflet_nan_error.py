with open("app.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace all occurrences of leafMap.invalidateSize() with leafMap.invalidateSize({ pan: false })
code = code.replace("leafMap.invalidateSize()", "leafMap.invalidateSize({ pan: false })")

with open("app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Success: Updated Leaflet invalidateSize calls to use { pan: false }.")
