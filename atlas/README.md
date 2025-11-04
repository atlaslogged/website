# Location Intelligence System - Preparation Workspace

**Status:** 📋 Data Gathering Phase
**Created:** October 30, 2025
**Purpose:** Prepare all data and resources for Atlas Logged's enhanced geographic system

---

## Quick Start

This folder contains everything needed to prepare the new location intelligence system **before** implementing it in the app.

### Run Phase 1: Download Data

```bash
cd location_improvements/scripts
./01_download_data.sh
```

This will download:
- Natural Earth country/region boundaries
- Airport database (28,000+ airports)
- CIA Factbook data structure
- Instructions for exporting existing data

---

## What's in This Folder

```
location_improvements/
├── README.md              # This file
├── data/                  # Downloaded raw data (gitignored)
│   ├── natural_earth/    # Shapefiles and GeoJSON
│   ├── airports/         # Airport database
│   ├── cia_factbook/     # CIA Factbook data
│   └── existing/         # Exported CountryDetails
├── scripts/              # Data processing scripts
│   ├── 01_download_data.sh       # Download all sources
│   ├── 02_process_boundaries.js  # Convert to GeoJSON
│   ├── 03_build_airports.js      # Filter airports
│   ├── 04_extract_factbook.py    # Extract CIA data
│   └── 05_build_unified_db.js    # Create final JSONs
├── resources/            # Final processed files (ready for app)
│   ├── countries_v2.json
│   ├── airports_iata.json
│   └── boundaries/
└── docs/                 # Documentation
    ├── MASTER_PLAN.md           # Complete implementation plan
    ├── DATA_SOURCES.md          # All data sources & licenses
    ├── SCHEMA_DESIGN.md         # JSON schema docs
    └── MIGRATION_GUIDE.md       # App integration guide
```

---

## Implementation Phases

### ✅ Phase 0: Setup (Complete)
- [x] Create folder structure
- [x] Write master plan
- [x] Document data sources
- [x] Create download script

### 🔄 Phase 1: Data Acquisition (In Progress)
**Run:** `./scripts/01_download_data.sh`

- [ ] Download Natural Earth data
- [ ] Download airport database
- [ ] Setup CIA Factbook extraction
- [ ] Export existing CountryDetails

**Time:** ~2 hours

### ⏳ Phase 2: Data Processing (Next)
**Run:** `./scripts/02_process_boundaries.js` and others

- [ ] Convert shapefiles to GeoJSON
- [ ] Simplify polygons for file size
- [ ] Filter airports to IATA-only
- [ ] Extract and structure CIA data
- [ ] Build unified database

**Time:** ~4 hours

### ⏳ Phase 3: Validation
- [ ] Validate all JSON schemas
- [ ] Test geocoding accuracy
- [ ] Check file sizes
- [ ] Performance benchmarks

**Time:** ~2 hours

### ⏳ Phase 4: Integration Planning
- [ ] Design Swift models
- [ ] Plan migration strategy
- [ ] Create integration guide
- [ ] Prepare test scenarios

**Time:** ~2 hours

---

## Key Documents

### 📋 Master Plan
**File:** `docs/MASTER_PLAN.md`

Complete roadmap covering:
- Architecture overview
- Phase-by-phase tasks
- Technical requirements
- Success metrics (including regional flags & legal compliance)
- Risk assessment

### 📚 Data Sources
**File:** `docs/DATA_SOURCES.md`

All external data sources:
- Natural Earth (Public Domain)
- mwgg/Airports (MIT License)
- CIA World Factbook (Public Domain)
- Unicode Regional Flags
- Update schedules
- Attribution requirements

### ⚖️ Legal Attributions (NEW!)
**File:** `docs/ATTRIBUTIONS.md`

Complete legal compliance guide:
- All licenses documented
- Ready-to-use attribution text for app "About" screen
- Export compliance verification
- GDPR/privacy analysis

### 🏴 Regional Flags Guide (NEW!)
**File:** `docs/REGIONAL_FLAGS.md`

Complete guide to regional flag emojis:
- Unicode flag sequences for UK regions (🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales, 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland, etc.)
- US state flags (all 50 states)
- Fallback strategies for unsupported regions
- Swift implementation code
- JSON mapping structure

---

## Data Sources Summary

| Source | License | Size | Coverage | Use |
|--------|---------|------|----------|-----|
| Natural Earth 50m | Public Domain | ~5MB | 247 countries | Country boundaries |
| Natural Earth 10m | Public Domain | ~3MB | Regions | Sub-country regions |
| mwgg/Airports | MIT ⚠️ | ~2.5MB | 11,000 airports | IATA airports |
| CIA Factbook | Public Domain | ~3MB | 260+ countries | Rich metadata |
| Regional Flags | Public Domain | <1KB | UK/US regions | Flag emojis |
| **Total** | | **~14MB** | | |

*Sizes are after processing and compression*
*⚠️ MIT license requires attribution - see docs/ATTRIBUTIONS.md*

---

## Requirements

### System Requirements
- **macOS**: 11.0+ (for running scripts)
- **Node.js**: 18+ (for JavaScript processing)
- **Python**: 3.8+ (for CIA Factbook extraction)
- **GDAL/OGR**: For shapefile conversion (optional, can use online tools)

### Install Dependencies

```bash
# Install Node.js (if not installed)
brew install node

# Install Python (if not installed)
brew install python@3.11

# Install GDAL (optional, for shapefile conversion)
brew install gdal

# Install Node packages (from scripts directory)
cd scripts
npm install
```

---

## Processing Order

Run scripts in this order:

1. **Download Data**
   ```bash
   ./01_download_data.sh
   ```
   Downloads all raw data sources

2. **Process Boundaries**
   ```bash
   node 02_process_boundaries.js
   ```
   Converts shapefiles to optimized GeoJSON

3. **Build Airport Database**
   ```bash
   node 03_build_airports.js
   ```
   Filters to IATA-only, adds metadata

4. **Extract CIA Factbook**
   ```bash
   python3 04_extract_factbook.py
   ```
   Structures CIA data to JSON

5. **Build Unified Database**
   ```bash
   node 05_build_unified_db.js
   ```
   Combines all sources into final JSONs

---

## Testing the Data

Before integrating into the app, test the processed data:

```bash
# Validate JSON schemas
node scripts/validate_schemas.js

# Test geocoding accuracy
node scripts/test_geocoding.js

# Check file sizes
du -sh resources/*

# Performance benchmark
node scripts/benchmark_queries.js
```

---

## Integration Checklist

When data is ready:

- [ ] All JSON files validated
- [ ] File sizes under budget (<15MB total)
- [ ] Geocoding accuracy >99% vs CLGeocoder
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Migration guide ready

Then proceed to app integration:
1. Copy `resources/` to `Atlas Logged/Resources/GeoData/`
2. Implement Swift models (see `docs/MIGRATION_GUIDE.md`)
3. Add feature flag for testing
4. Test with existing data in parallel

---

## File Size Budget

| Component | Raw | Processed | Compressed | Target |
|-----------|-----|-----------|------------|--------|
| Countries GeoJSON | 23MB | 5MB | 2MB | <3MB |
| Regions GeoJSON | 53MB | 8MB | 3MB | <4MB |
| Airports JSON | 6MB | 2.5MB | 1MB | <2MB |
| CIA Factbook | Variable | 3MB | 1.5MB | <2MB |
| Travel Advice | N/A | 1MB | 500KB | <1MB |
| **Total** | **~82MB** | **~20MB** | **~8MB** | **<12MB** |

*iOS automatically compresses assets in the bundle (~40-60% reduction)*

---

## FAQ

### Q: Why not implement directly in the app?
**A:** Preparing data separately allows us to:
- Test and validate without affecting the app
- Iterate on data structure quickly
- Compare different processing approaches
- Measure file sizes and performance before committing

### Q: What if the data is too large?
**A:** We can:
- Increase simplification (20% tolerance instead of 10%)
- Use 110m scale instead of 50m for some countries
- Filter to fewer airports
- Lazy-load some metadata

### Q: How often will data be updated?
**A:**
- Natural Earth: Annually with major app versions
- Airports: Quarterly or as needed
- CIA Factbook: Annually
- Travel Advice: As you add/update tips

### Q: Can users update data over-the-air?
**A:** Future consideration. Initial version bundles all data. Could add:
- Background updates for airports
- Cloud-delivered travel advisories
- User-contributed tips (moderated)

---

## Support & Maintenance

### Getting Help
- See `docs/MASTER_PLAN.md` for complete roadmap
- Check `docs/DATA_SOURCES.md` for upstream issues
- Review script comments for technical details

### Reporting Issues
If you find data errors:
1. Document the error (coordinates, country code, etc.)
2. Check upstream sources (Natural Earth, mwgg/Airports)
3. Report to upstream if issue is there
4. Apply local fix in processing scripts

---

## Next Steps

1. **Review the Master Plan**
   ```bash
   open docs/MASTER_PLAN.md
   ```

2. **Review Data Sources**
   ```bash
   open docs/DATA_SOURCES.md
   ```

3. **Run Phase 1: Download Data**
   ```bash
   cd scripts
   ./01_download_data.sh
   ```

4. **Verify Downloads**
   ```bash
   ls -lh data/natural_earth/
   ls -lh data/airports/
   ```

---

**Ready to begin?** Run `./scripts/01_download_data.sh` to start Phase 1!
