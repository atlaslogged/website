#!/bin/bash

# Location Intelligence System - Data Download Script
# Downloads all required data sources for offline geocoding and location intelligence
# Run from: location_improvements/scripts/

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory (assuming script is in location_improvements/scripts/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$BASE_DIR/data"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Location Intelligence System - Data Download${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p "$DATA_DIR/natural_earth"
mkdir -p "$DATA_DIR/airports"
mkdir -p "$DATA_DIR/cia_factbook"
mkdir -p "$DATA_DIR/existing"
echo -e "${GREEN}✓ Directories created${NC}\n"

# Function to download and extract zip files
download_and_extract() {
    local url=$1
    local output_dir=$2
    local filename=$(basename "$url")

    echo -e "${YELLOW}Downloading: $filename${NC}"

    # Download
    if [ -f "$output_dir/$filename" ]; then
        echo -e "${GREEN}✓ Already downloaded: $filename${NC}"
    else
        curl -L -o "$output_dir/$filename" "$url"
        echo -e "${GREEN}✓ Downloaded: $filename${NC}"
    fi

    # Extract if zip
    if [[ $filename == *.zip ]]; then
        echo -e "${YELLOW}Extracting: $filename${NC}"
        unzip -q -o "$output_dir/$filename" -d "$output_dir"
        echo -e "${GREEN}✓ Extracted: $filename${NC}"
    fi
}

# 1. NATURAL EARTH DATA
echo -e "\n${BLUE}=== 1. Natural Earth Data ===${NC}\n"

# Countries (50m scale)
echo -e "${YELLOW}Downloading Natural Earth 50m Countries...${NC}"
download_and_extract \
    "https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip" \
    "$DATA_DIR/natural_earth"

# Sovereignty (50m scale)
echo -e "\n${YELLOW}Downloading Natural Earth 50m Sovereignty...${NC}"
download_and_extract \
    "https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_sovereignty.zip" \
    "$DATA_DIR/natural_earth"

# States/Provinces (10m scale) - for regions
echo -e "\n${YELLOW}Downloading Natural Earth 10m States/Provinces...${NC}"
download_and_extract \
    "https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip" \
    "$DATA_DIR/natural_earth"

echo -e "\n${GREEN}✓ Natural Earth data downloaded${NC}"

# 2. AIRPORT DATA
echo -e "\n${BLUE}=== 2. Airport Database ===${NC}\n"

echo -e "${YELLOW}Downloading mwgg/Airports database...${NC}"
curl -L -o "$DATA_DIR/airports/airports.json" \
    "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json"
echo -e "${GREEN}✓ Airport database downloaded${NC}"

# Get file size
AIRPORT_SIZE=$(du -h "$DATA_DIR/airports/airports.json" | cut -f1)
AIRPORT_COUNT=$(grep -o '"icao"' "$DATA_DIR/airports/airports.json" | wc -l)
echo -e "  Size: $AIRPORT_SIZE"
echo -e "  Airports: ~$AIRPORT_COUNT"

# 3. CIA FACTBOOK DATA
echo -e "\n${BLUE}=== 3. CIA World Factbook ===${NC}\n"

# Clone the factbook.json repository (offline method)
echo -e "${YELLOW}Downloading factbook.json repository (2021 data)...${NC}"
if [ -d "$DATA_DIR/cia_factbook/factbook.json" ]; then
    echo -e "${GREEN}✓ factbook.json already cloned${NC}"
    cd "$DATA_DIR/cia_factbook/factbook.json"
    git pull
    cd "$SCRIPT_DIR"
else
    cd "$DATA_DIR/cia_factbook"
    if git clone https://github.com/factbook/factbook.json.git; then
        echo -e "${GREEN}✓ factbook.json repository cloned${NC}"
        cd "$SCRIPT_DIR"
    else
        echo -e "${RED}⚠ Failed to clone factbook.json${NC}"
        cd "$SCRIPT_DIR"
    fi
fi

# Count files
if [ -d "$DATA_DIR/cia_factbook/factbook.json" ]; then
    FACTBOOK_COUNT=$(find "$DATA_DIR/cia_factbook/factbook.json" -name "*.json" | wc -l)
    echo -e "  Countries: ~$FACTBOOK_COUNT JSON files"
    echo -e "${YELLOW}  Note: Data is from 2021, may need manual updates for critical countries${NC}"
fi

# Create README
cat > "$DATA_DIR/cia_factbook/README.md" << 'EOF'
# CIA World Factbook Data

## Source
https://www.cia.gov/the-world-factbook/

## License
Public Domain (US Government work)

## Downloaded Data

This folder contains the factbook.json repository (2021 data).

### Processing
Run the extraction script to convert to our format:
```bash
python3 ../scripts/04_extract_factbook.py
```

This will create `cia_factbook.json` with structured data for all countries.

### Data Freshness
- factbook.json repository: Last updated 2021
- For current data: Visit https://www.cia.gov/the-world-factbook/
- Update strategy: Use 2021 as baseline, manually update critical countries if needed

## Data We Extract Per Country
- Geography (area, climate, terrain, elevation)
- People (population, languages, religions)
- Government (type, capital, independence)
- Economy (GDP, currency, industries)

## Next Steps
1. Review downloaded data: `cd factbook.json`
2. Run processing script: `python3 ../scripts/04_extract_factbook.py`
3. Output will be in: `cia_factbook.json`
EOF

echo -e "${GREEN}✓ Factbook data downloaded${NC}"

# 4. EXISTING ATLAS LOGGED DATA
echo -e "\n${BLUE}=== 4. Existing Atlas Logged Data ===${NC}\n"

# Create a note about exporting existing data
cat > "$DATA_DIR/existing/README.md" << 'EOF'
# Existing Atlas Logged Country Data

## Source
`Atlas Logged/Utilities/CountryDetails.swift`

## Export Instructions

Run this Swift script to export existing data to JSON:

```swift
import Foundation

// In a Swift playground or script:
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]

var exportData: [[String: Any]] = []

for (code, details) in countryDetails {
    exportData.append([
        "isoCode": code,
        "flag": details.flag,
        "name": details.name,
        "capital": [
            "name": details.capital,
            "latitude": details.latitude,
            "longitude": details.longitude,
            "altitude": details.altitude
        ],
        "primaryAirport": [
            "name": details.airport,
            "iataCode": details.iataCode,
            "latitude": details.airportLatitude,
            "longitude": details.airportLongitude
        ]
    ])
}

if let jsonData = try? JSONSerialization.data(withJSONObject: exportData, options: .prettyPrinted),
   let jsonString = String(data: jsonData, encoding: .utf8) {
    print(jsonString)
    // Save to: location_improvements/data/existing/country_details_export.json
}
```

## Purpose
- Validation baseline for new data
- Ensure no countries are lost in migration
- Compare coordinate accuracy
- Verify airport selections
EOF

echo -e "${GREEN}✓ Export instructions created${NC}"
echo -e "${YELLOW}Action required: Export CountryDetails.swift to JSON manually${NC}"

# 5. DOWNLOAD SUMMARY
echo -e "\n${BLUE}=== Download Summary ===${NC}\n"

# Calculate total size
TOTAL_SIZE=$(du -sh "$DATA_DIR" | cut -f1)

echo -e "${GREEN}Downloaded:${NC}"
echo -e "  • Natural Earth 50m Countries"
echo -e "  • Natural Earth 50m Sovereignty"
echo -e "  • Natural Earth 10m States/Provinces"
echo -e "  • mwgg/Airports database ($AIRPORT_SIZE, ~$AIRPORT_COUNT airports)"
echo -e "  • CIA Factbook setup (manual extraction needed)"
echo -e "  • Existing data export instructions"
echo -e ""
echo -e "Total size: ${TOTAL_SIZE}"

# 6. NEXT STEPS
echo -e "\n${BLUE}=== Next Steps ===${NC}\n"

echo -e "1. ${YELLOW}Verify Natural Earth files:${NC}"
echo -e "   ls -lh $DATA_DIR/natural_earth/*.shp"
echo -e ""

echo -e "2. ${YELLOW}Export existing CountryDetails:${NC}"
echo -e "   Follow instructions in: $DATA_DIR/existing/README.md"
echo -e ""

echo -e "3. ${YELLOW}Extract CIA Factbook data:${NC}"
echo -e "   cd $DATA_DIR/cia_factbook"
echo -e "   git clone https://github.com/factbook/factbook.json.git"
echo -e ""

echo -e "4. ${YELLOW}Run processing script:${NC}"
echo -e "   ./02_process_boundaries.js"
echo -e ""

# 7. VALIDATION
echo -e "\n${BLUE}=== Validation ===${NC}\n"

# Check if key files exist
validate_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

validate_file "$DATA_DIR/natural_earth/ne_50m_admin_0_countries.shp" "Natural Earth 50m Countries (shapefile)"
validate_file "$DATA_DIR/natural_earth/ne_50m_admin_0_sovereignty.shp" "Natural Earth 50m Sovereignty (shapefile)"
validate_file "$DATA_DIR/natural_earth/ne_10m_admin_1_states_provinces.shp" "Natural Earth 10m States (shapefile)"
validate_file "$DATA_DIR/airports/airports.json" "Airport database (JSON)"

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Download complete!${NC}"
echo -e "${GREEN}================================================${NC}\n"
