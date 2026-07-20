import pandas as pd
import geopandas as gpd
import re

def clean_name(name):
    if not name:
        return ""
    name = str(name).upper().strip()
    # Remove suffixes like DC, TC, CC, MC, JIJI, DISTRICT, MUNICIPAL, TOWN, CITY, COUNCIL, ETC.
    suffixes = [
        r'\bDC\b', r'\bTC\b', r'\bCC\b', r'\bMC\b', r'\bJIJI\b', 
        r'\bCITY COUNCIL\b', r'\bTOWN COUNCIL\b', r'\bDISTRICT COUNCIL\b', r'\bMUNICIPAL COUNCIL\b',
        r'\bTOWN\b', r'\bMUNICIPAL\b', r'\bDISTRICT\b'
    ]
    for suf in suffixes:
        name = re.sub(suf, '', name)
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name).strip()
    return name

df_csv = pd.read_csv('district_data.csv')
df_shp = gpd.read_file("maps/Districts and TC as 2020.shp")

# Let's test clean_name on both
df_csv['Clean_Dist'] = df_csv['District'].apply(clean_name)
df_shp['Clean_Dist'] = df_shp['NewDist20'].apply(clean_name)

csv_clean = set(df_csv['Clean_Dist'])
shp_clean = set(df_shp['Clean_Dist'])

print("Clean unique districts in CSV:", len(csv_clean))
print("Clean unique districts in SHP:", len(shp_clean))

missing = csv_clean - shp_clean
print("Still missing after clean:", len(missing))
print("Sample missing:", sorted(list(missing)))

matches = csv_clean.intersection(shp_clean)
print("Matches count:", len(matches))
