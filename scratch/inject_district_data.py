import pandas as pd
import json

# Read the CSV
df = pd.read_csv("district_data.csv")

# Convert to list of lists: [Region, District, New_Schools, Girls_Schools, Dormitories, Classrooms]
records = df.values.tolist()

# Let's read data.js
with open("data.js", "r") as f:
    content = f.read()

# Let's find where SEQUIP_ME_DATA is defined and append District_Data to it, or we can just append it at the end
# Since SEQUIP_ME_DATA is a global const, we can modify it or append a line:
# SEQUIP_ME_DATA.District_Data = [...];
# Let's format the records nicely
records_str = json.dumps(records)

injection = f"\n\n// District-level pre-aggregated dataset for GIS maps and regional roll-ups\nSEQUIP_ME_DATA.District_Data = {records_str};\n"

# We should insert this injection right before the export block
# Let's find "if (typeof module !== \"undefined\")"
target = 'if (typeof module !== "undefined") {'
parts = content.split(target)

if len(parts) == 2:
    new_content = parts[0] + injection + "\n" + target + parts[1]
    with open("data.js", "w") as f:
        f.write(new_content)
    print("District data injected successfully before module export!")
else:
    # Just append at the end
    new_content = content + injection
    with open("data.js", "w") as f:
        f.write(new_content)
    print("District data appended at the end of data.js!")
