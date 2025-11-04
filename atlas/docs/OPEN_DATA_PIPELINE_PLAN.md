# Open Source Data Pipeline - Master Plan

**Created:** October 30, 2025
**Status:** 📋 Planning Phase
**Purpose:** Design and implement an automated data pipeline to aggregate, standardize, and maintain global location intelligence data from authoritative open sources

---

## Executive Summary

This document outlines a plan to create a **separate open source repository** containing an automated data pipeline that:

1. **Aggregates** data from 15+ authoritative open sources
2. **Standardizes** all data with ISO 2/3 codes, emoji flags, and consistent country identification
3. **Maintains** data freshness through automated updates
4. **Exposes** clean, unified JSON/CSV datasets for Atlas Logged and the broader community
5. **Tracks** which countries each dataset supports
6. **Documents** all licenses, attributions, and methodologies

**Target Dataset**: 195+ UN-recognized countries + 50+ territories/regions
**Update Frequency**: Monthly automated refresh with CI/CD
**License**: MIT (pipeline code) + Individual data source licenses
**Repository Name**: `atlas-logged-data-pipeline` or `global-location-intelligence`

---

## Current State

### Existing Data in Atlas Logged

Currently implemented (October 2025):

| Source | Countries | Update Frequency | License | Status |
|--------|-----------|------------------|---------|--------|
| Natural Earth Boundaries | 247 | Manual | Public Domain | ✅ Integrated |
| mwgg/Airports | 247 | Manual | MIT | ✅ Integrated |
| CIA World Factbook | 235 | Manual | Public Domain | ✅ Integrated |
| Unicode Flag Emojis | 247 | N/A | Public Domain | ✅ Integrated |

### Issues with Current Approach

❌ **Manual Updates**: No automation, updates require developer intervention
❌ **No Version Control**: Can't track changes in upstream data over time
❌ **Limited Scope**: Missing critical data dimensions (gender equality, human rights, press freedom)
❌ **No Country Mapping**: Unclear which countries each dataset covers
❌ **Inconsistent Codes**: Different sources use different country identifiers
❌ **No Validation**: No automated checks for data quality or completeness

---

## Proposed Solution: Dedicated Data Pipeline Repository

### Architecture Overview

```
atlas-logged-data-pipeline/
├── .github/
│   └── workflows/
│       ├── update-all.yml           # Monthly automated refresh
│       ├── validate.yml             # PR validation checks
│       └── publish.yml              # Release and publish datasets
├── sources/
│   ├── 01_geography/
│   │   ├── natural_earth.py         # Fetch boundary data
│   │   └── config.json              # Source metadata
│   ├── 02_demographics/
│   │   ├── cia_factbook.py
│   │   ├── undp_hdi.py
│   │   └── config.json
│   ├── 03_governance/
│   │   ├── vdem_democracy.py
│   │   ├── transparency_cpi.py
│   │   ├── freedom_house.py
│   │   ├── rsf_press_freedom.py
│   │   └── config.json
│   ├── 04_gender/
│   │   ├── giwps_wps_index.py       # Georgetown WPS Index
│   │   ├── womanstats.py            # WomanStats Project
│   │   ├── wef_gender_gap.py        # WEF Global Gender Gap
│   │   ├── unwomen_data.py          # UN Women Data Hub
│   │   ├── worldbank_gender.py      # World Bank Gender Portal
│   │   └── config.json
│   └── 05_economics/
│       ├── worldbank_indicators.py
│       └── config.json
├── pipeline/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── fetcher.py               # Generic data fetcher
│   │   ├── normalizer.py            # Standardize formats
│   │   ├── validator.py             # Data quality checks
│   │   └── merger.py                # Combine datasets
│   ├── mappings/
│   │   ├── country_codes.json       # ISO 2/3, FIPS, numeric codes
│   │   ├── emoji_flags.json         # Unicode flag sequences
│   │   ├── country_names.json       # Official + common names
│   │   └── regional_subdivisions.json # States, provinces, etc.
│   └── output/
│       ├── builder.py               # Generate final datasets
│       └── publisher.py             # Release to GitHub/NPM
├── output/
│   ├── unified/
│   │   ├── countries_master.json    # Complete unified dataset
│   │   ├── countries_master.csv     # CSV version
│   │   └── schema.json              # JSON Schema definition
│   ├── by_source/
│   │   ├── natural_earth_v5.2.json
│   │   ├── cia_factbook_2025.json
│   │   ├── giwps_2025.json
│   │   └── ...
│   ├── coverage/
│   │   ├── country_coverage_matrix.json  # Which sources cover which countries
│   │   └── data_freshness.json           # Last update dates per source
│   └── metadata/
│       ├── licenses.json            # All source licenses
│       └── attributions.json        # Required attributions
├── tests/
│   ├── test_fetchers.py
│   ├── test_validators.py
│   └── fixtures/
├── docs/
│   ├── README.md                    # Main documentation
│   ├── SOURCES.md                   # All data sources documented
│   ├── SCHEMA.md                    # Data schema specification
│   ├── API.md                       # How to use the data
│   ├── CONTRIBUTING.md              # How to add new sources
│   └── CHANGELOG.md                 # Version history
├── scripts/
│   ├── bootstrap.sh                 # Initial setup
│   ├── update_source.py             # Update single source
│   ├── update_all.py                # Update all sources
│   ├── validate_all.py              # Run all validation
│   └── generate_docs.py             # Auto-generate documentation
├── requirements.txt
├── package.json                     # For NPM distribution
├── LICENSE                          # MIT License
└── README.md
```

---

## Data Sources: Comprehensive Catalog

### Category 1: Geography & Boundaries

#### 1.1 Natural Earth
- **URL**: https://www.naturalearthdata.com/
- **Data**: Country/region boundaries, physical geography
- **Coverage**: 247 countries and territories
- **Format**: Shapefiles, GeoJSON
- **Update**: Annual (March/April)
- **License**: Public Domain (CC0-like)
- **API**: No (direct downloads)
- **Status**: ✅ Currently integrated

#### 1.2 GADM (Global Administrative Areas)
- **URL**: https://gadm.org/
- **Data**: High-resolution administrative boundaries
- **Coverage**: All countries with sub-national divisions
- **Format**: Shapefiles, GeoPackage
- **Update**: Irregular (country by country)
- **License**: Free for non-commercial (with restrictions)
- **API**: No (direct downloads)
- **Status**: 🟡 Consider for future (licensing requires review)

---

### Category 2: Demographics & Development

#### 2.1 CIA World Factbook
- **URL**: https://www.cia.gov/the-world-factbook/
- **Data**: Geography, population, government, economy
- **Coverage**: 260+ countries and territories
- **Format**: HTML (scraping needed) or JSON (via factbook.json)
- **Update**: Weekly (official) / Sporadic (factbook.json)
- **License**: Public Domain (US Government Work)
- **API**: No official API
- **Status**: ✅ Currently integrated

#### 2.2 UNDP Human Development Index (HDI)
- **URL**: https://hdr.undp.org/ | API: https://hdrdata.org
- **Data**: HDI, life expectancy, education, income, inequality
- **Coverage**: 193 UN member states
- **Format**: JSON, CSV, Excel
- **Update**: Annual (May)
- **License**: Open (Creative Commons Attribution)
- **API**: ✅ Yes - HDRO Data API 2.0 (requires API key)
- **Indicators**:
  - Human Development Index (HDI)
  - Inequality-adjusted HDI (IHDI)
  - Gender Development Index (GDI)
  - Gender Inequality Index (GII)
  - Multidimensional Poverty Index (MPI)
  - Planetary Pressures-Adjusted HDI
- **Status**: 🆕 **HIGH PRIORITY** - Add to pipeline

#### 2.3 World Bank Development Indicators
- **URL**: https://data.worldbank.org/ | API: https://api.worldbank.org/v2/
- **Data**: 1,600+ indicators (GDP, poverty, education, health, environment)
- **Coverage**: 217 economies
- **Format**: JSON, XML, CSV
- **Update**: Quarterly
- **License**: Creative Commons Attribution 4.0 (CC BY 4.0)
- **API**: ✅ Yes - Comprehensive REST API
- **Status**: 🟡 Consider for future (very large dataset)

---

### Category 3: Governance & Democracy

#### 3.1 V-Dem (Varieties of Democracy)
- **URL**: https://www.v-dem.net/
- **Data**: 531 democracy indicators covering 202 countries (1789-2025)
- **Coverage**: 202 countries
- **Format**: CSV, Stata, R, SPSS
- **Update**: Annual (March)
- **License**: Free to use with attribution (CC BY 4.0)
- **API**: No (direct downloads)
- **Key Indices**:
  - Electoral Democracy Index
  - Liberal Democracy Index
  - Participatory Democracy Index
  - Deliberative Democracy Index
  - Egalitarian Democracy Index
- **Status**: 🆕 **HIGH PRIORITY** - Authoritative democracy data

#### 3.2 Freedom House - Freedom in the World
- **URL**: https://freedomhouse.org/
- **Data**: Political rights and civil liberties scores
- **Coverage**: 195 countries + 15 territories
- **Format**: Excel, CSV
- **Update**: Annual (February)
- **License**: Open data (attribution required)
- **API**: No (Excel downloads available)
- **Scores**: 1-7 scale for political rights and civil liberties
- **Status**: 🆕 **HIGH PRIORITY** - Widely cited

#### 3.3 Transparency International - Corruption Perceptions Index (CPI)
- **URL**: https://www.transparency.org/en/cpi/
- **Data**: Public sector corruption perception scores
- **Coverage**: 180 countries
- **Format**: Excel (.xlsx)
- **Update**: Annual (January)
- **License**: Creative Commons Attribution-NoDerivs 4.0
- **API**: No (direct Excel downloads)
- **Score**: 0-100 (0 = highly corrupt, 100 = very clean)
- **Status**: 🆕 **MEDIUM PRIORITY** - Important governance indicator

#### 3.4 International IDEA - Global State of Democracy
- **URL**: https://www.idea.int/gsod/
- **Data**: Democracy tracker with 173 countries, monthly updates
- **Coverage**: 173 countries
- **Format**: JSON, CSV (via Democracy Tracker)
- **Update**: Monthly (event-based)
- **License**: Open data
- **API**: Yes (Democracy Tracker API)
- **Status**: 🟡 Consider for future

---

### Category 4: Press Freedom & Media

#### 4.1 Reporters Without Borders - Press Freedom Index
- **URL**: https://rsf.org/en/index
- **Data**: Press freedom rankings and scores
- **Coverage**: 180 countries
- **Format**: CSV (downloadable)
- **Update**: Annual (May)
- **License**: Open data (attribution required)
- **API**: No (CSV downloads)
- **Score**: 0-100 (100 = most free)
- **Status**: 🆕 **MEDIUM PRIORITY** - Critical civil liberties indicator

#### 4.2 Freedom House - Freedom of the Press
- **URL**: https://freedomhouse.org/
- **Data**: Press freedom scores and analysis
- **Coverage**: ~200 countries and territories
- **Format**: Excel
- **Update**: Annual
- **License**: Open data
- **API**: No
- **Status**: 🟡 Consider (overlaps with RSF)

---

### Category 5: Gender Equality & Women's Rights

#### 5.1 Georgetown Institute - Women, Peace & Security Index (WPS)
- **URL**: https://giwps.georgetown.edu/the-index/
- **Data**: Women's wellbeing across inclusion, justice, and security
- **Coverage**: 181 countries
- **Format**: Excel spreadsheet (downloadable)
- **Update**: Biennial (every 2 years) - Latest: 2025/26 edition
- **License**: Not explicitly stated (assume academic use with attribution)
- **API**: No (Excel download)
- **Indicators**: 13 indicators covering:
  - **Inclusion**: Education, employment, parliament, financial inclusion, cell phone access
  - **Justice**: Legal discrimination, son bias, maternal mortality, access to justice
  - **Security**: Intimate partner violence, community safety, political violence, armed conflict
- **Score**: 0-1 (1 = best)
- **Status**: 🆕 **HIGH PRIORITY** - User requested, unique comprehensive index

#### 5.2 WomanStats Project
- **URL**: https://www.womanstats.org/
- **Data**: 315,000+ data points on women's security across 350+ variables
- **Coverage**: 176 countries (population > 300,000)
- **Format**: Web database (may require scraping or data request)
- **Update**: Ongoing (collaborative research project)
- **License**: Publicly available (terms unclear - requires investigation)
- **API**: No public API mentioned
- **Dimensions**: Physical security, economic security, legal security, community security, family security, maternity, voice, societal investment, state security
- **Status**: 🆕 **HIGH PRIORITY** - User requested, most comprehensive database
- **Note**: Need to contact info@womanstats.org to clarify data access and licensing

#### 5.3 World Economic Forum - Global Gender Gap Index
- **URL**: https://www.weforum.org/publications/global-gender-gap-report-2025/
- **Data**: Gender gap measures across 4 dimensions
- **Coverage**: 146 countries (varies by year)
- **Format**: Excel spreadsheet (downloadable from annual reports)
- **Update**: Annual (June)
- **License**: Not explicitly stated (WEF content, likely requires attribution)
- **API**: No (manual downloads)
- **Dimensions**:
  - Economic Participation and Opportunity
  - Educational Attainment
  - Health and Survival
  - Political Empowerment
- **Score**: 0-1 (1 = parity)
- **Alternative Sources**:
  - HDX: https://data.humdata.org/dataset/global-gender-gap-index-world-economic-forum
  - QOG DataFinder: https://datafinder.qog.gu.se/dataset/gggi (2006-2024)
- **Status**: 🆕 **HIGH PRIORITY** - Widely cited, annual updates

#### 5.4 UN Women Data Hub
- **URL**: https://data.unwomen.org/
- **Data**: Gender-specific SDG indicators, violence against women, peace & security
- **Coverage**: Global (varies by indicator)
- **Format**: CSV, JSON (via API)
- **Update**: Continuous
- **License**: Open data (UN)
- **API**: ✅ Yes - Data portal with API access
- **Status**: 🆕 **HIGH PRIORITY** - Authoritative UN source

#### 5.5 World Bank Gender Data Portal
- **URL**: https://genderdata.worldbank.org/
- **Data**: Sex-disaggregated data across demographics, education, health, economics
- **Coverage**: Global
- **Format**: CSV, JSON, XML (via World Bank API)
- **Update**: Varies by indicator
- **License**: Creative Commons Attribution 4.0 (CC BY 4.0)
- **API**: ✅ Yes - World Bank Data API
- **Status**: 🟡 Consider (overlaps with other sources but comprehensive)

#### 5.6 OECD Social Institutions and Gender Index (SIGI)
- **URL**: https://www.oecd.org/dev/sigi.htm
- **Data**: Discrimination in laws, social norms, and practices
- **Coverage**: 179 countries
- **Format**: Excel, CSV
- **Update**: ~3-4 years
- **License**: OECD data (open with attribution)
- **API**: OECD.Stat API
- **Status**: 🟡 Consider for future

---

### Category 6: Human Rights

#### 6.1 US State Department - Human Rights Reports
- **URL**: https://www.state.gov/reports-bureau-of-democracy-human-rights-and-labor/country-reports-on-human-rights-practices/
- **Data**: Annual country reports on human rights practices
- **Coverage**: All UN member states (~195)
- **Format**: HTML/PDF (scraping required)
- **Update**: Annual (March)
- **License**: Public Domain (US Government Work)
- **API**: No (web scraping needed)
- **Status**: 🟡 Consider (requires NLP processing, politically oriented)

#### 6.2 Human Rights Watch - World Report
- **URL**: https://www.hrw.org/world-report/
- **Data**: Human rights developments by country
- **Coverage**: 100+ countries
- **Format**: Web pages, PDF
- **Update**: Annual (January)
- **License**: Copyright HRW (fair use for research)
- **API**: No
- **Status**: 🔴 Low priority (qualitative, not structured data)

---

### Category 7: Aviation

#### 7.1 mwgg/Airports
- **URL**: https://github.com/mwgg/Airports
- **Data**: 28,853 airports worldwide with ICAO/IATA codes
- **Coverage**: Global
- **Format**: JSON
- **Update**: Monthly (GitHub releases)
- **License**: MIT
- **API**: No (GitHub raw file)
- **Status**: ✅ Currently integrated

#### 7.2 OurAirports
- **URL**: https://ourairports.com/data/
- **Data**: 76,000+ airports, heliports, seaplane bases
- **Coverage**: Global
- **Format**: CSV
- **Update**: Daily
- **License**: Public Domain (CC0)
- **API**: No (direct CSV downloads)
- **Status**: 🟡 Consider (larger but may include non-commercial airports)

---

### Category 8: Standards & Reference Data

#### 8.1 ISO 3166 Country Codes
- **URL**: https://www.iso.org/iso-3166-country-codes.html
- **Data**: ISO 3166-1 alpha-2, alpha-3, and numeric codes
- **Coverage**: All countries and territories
- **Format**: Various (can use python packages like `pycountry`)
- **Update**: Ongoing (as countries change)
- **License**: Free to use (codes themselves)
- **API**: No (use `pycountry` Python package)
- **Status**: ✅ Should be core infrastructure

#### 8.2 Unicode CLDR (Common Locale Data Repository)
- **URL**: https://cldr.unicode.org/
- **Data**: Country names in all languages, flag emojis, locale data
- **Coverage**: All countries
- **Format**: XML, JSON
- **Update**: Quarterly
- **License**: Unicode License (permissive)
- **API**: No (download repo)
- **Status**: 🆕 **HIGH PRIORITY** - For emoji flags and multilingual country names

#### 8.3 REST Countries
- **URL**: https://restcountries.com/
- **Data**: Country information (name, capital, currency, languages, flags)
- **Coverage**: 250+ countries
- **Format**: JSON
- **Update**: Community maintained
- **License**: MPL 2.0
- **API**: ✅ Yes - Free REST API
- **Status**: 🟡 Consider (community-maintained, good for validation)

---

## Prioritized Implementation Roadmap

### Phase 1: Foundation (Month 1)
**Goal**: Set up pipeline infrastructure and integrate existing sources

✅ **Done** (already in Atlas project):
- Natural Earth boundaries
- CIA Factbook data
- mwgg/Airports database

🆕 **New Work**:
- [ ] Create separate `atlas-logged-data-pipeline` repository
- [ ] Set up Python/Node.js development environment
- [ ] Implement core pipeline classes (Fetcher, Normalizer, Validator, Merger)
- [ ] Create country code mapping infrastructure (ISO 2/3, emoji flags)
- [ ] Set up GitHub Actions for CI/CD
- [ ] Write initial documentation (README, CONTRIBUTING, SCHEMA)

**Deliverables**:
- Empty repository with structure
- Working development environment
- Core pipeline framework
- Country mapping files (ISO codes + emoji flags)

---

### Phase 2: High-Priority Gender & Governance Data (Month 2)
**Goal**: Integrate the most impactful new data sources

#### Gender Equality Sources:
- [ ] **Georgetown WPS Index** (giwps_wps_index.py)
  - Download Excel from website
  - Parse 13 indicators
  - Map to ISO codes
  - Score: 0-1 scale

- [ ] **WomanStats Project** (womanstats.py)
  - **Action Required**: Contact info@womanstats.org for data access
  - Investigate API or bulk download options
  - Parse 350+ variables
  - Complex: 9 dimensions, 315K+ data points

- [ ] **WEF Global Gender Gap** (wef_gender_gap.py)
  - Download Excel from annual reports
  - Alternative: Use HDX or QOG DataFinder
  - Parse 4 sub-indices
  - Score: 0-1 scale

- [ ] **UN Women Data Hub** (unwomen_data.py)
  - Use data portal API
  - Focus on SDG gender indicators
  - Violence against women data
  - Women, peace & security data

#### Governance Sources:
- [ ] **V-Dem Democracy Indices** (vdem_democracy.py)
  - Download CSV from v-dem.net
  - Parse 5 main democracy indices
  - 531 indicators available (start with key indices)
  - Historical data 1789-2025

- [ ] **Freedom House** (freedom_house.py)
  - Download Excel files
  - Parse political rights + civil liberties scores
  - 1-7 scale

**Deliverables**:
- 6 new data sources integrated
- Coverage matrix showing which countries have data from each source
- Updated unified dataset
- Validation tests for all sources

---

### Phase 3: Development & Human Rights (Month 3)
**Goal**: Add authoritative development and rights indicators

- [ ] **UNDP HDI** (undp_hdi.py)
  - Use HDRO Data API 2.0 (https://hdrdata.org)
  - Requires API key
  - Fetch: HDI, IHDI, GDI, GII, MPI
  - 193 countries

- [ ] **Transparency International CPI** (transparency_cpi.py)
  - Download Excel from transparency.org
  - Parse corruption scores (0-100)
  - 180 countries
  - CC BY-ND 4.0 license

- [ ] **Reporters Without Borders** (rsf_press_freedom.py)
  - Download CSV from rsf.org
  - Parse press freedom scores (0-100)
  - 180 countries

**Deliverables**:
- 3 additional sources
- Enhanced unified dataset with development indicators
- Country rankings and comparisons
- Data freshness tracking

---

### Phase 4: Automation & Quality (Month 4)
**Goal**: Automate updates and ensure data quality

- [ ] **GitHub Actions Workflows**:
  - Monthly automated refresh (update-all.yml)
  - PR validation (validate.yml)
  - Automated releases (publish.yml)

- [ ] **Data Validation**:
  - Schema validation (JSON Schema)
  - Country code consistency checks
  - Data completeness reports
  - Outlier detection
  - Temporal consistency (year-over-year changes)

- [ ] **Coverage Analysis**:
  - Generate country coverage matrix
  - Identify data gaps
  - Track which sources cover which countries

- [ ] **Documentation**:
  - Auto-generate source documentation
  - Create data dictionaries
  - Write integration guides for consumers

**Deliverables**:
- Fully automated monthly updates
- Comprehensive validation suite
- Coverage matrix and gap analysis
- Complete documentation

---

### Phase 5: Publishing & Distribution (Month 5)
**Goal**: Make data easily accessible to Atlas Logged and external users

- [ ] **Output Formats**:
  - Unified JSON (countries_master.json)
  - CSV exports (countries_master.csv)
  - Individual source JSONs (by_source/)
  - JSON Schema definitions

- [ ] **NPM Package** (optional):
  - Publish as `@atlas-logged/country-data`
  - JavaScript/TypeScript typings
  - Tree-shakeable modules

- [ ] **GitHub Releases**:
  - Semantic versioning (v1.0.0, v1.1.0, etc.)
  - Release notes with changelog
  - Attach built datasets as release assets

- [ ] **Documentation Site** (optional):
  - GitHub Pages or Netlify
  - Interactive data explorer
  - API documentation
  - Source attributions

**Deliverables**:
- Published NPM package (if desired)
- GitHub releases with datasets
- Documentation website
- Integration guide for Atlas Logged app

---

### Phase 6: Integration with Atlas Logged (Month 6)
**Goal**: Update Atlas Logged iOS app to consume pipeline data

- [ ] **Swift Models**:
  - Update existing models to match new schema
  - Add new properties for gender/governance data

- [ ] **Data Integration**:
  - Download latest dataset from pipeline
  - Update app bundle with new data
  - Migrate from old CountryDetails.swift

- [ ] **Feature Development**:
  - Add UI to display new metrics (HDI, Gender Gap, Press Freedom, etc.)
  - Create country comparison features
  - Add data source attributions to Settings

- [ ] **Testing**:
  - Validate data loads correctly
  - Performance testing (larger datasets)
  - User testing

**Deliverables**:
- Atlas Logged updated with new data
- New features showcasing additional metrics
- Complete attribution in app

---

## Master Data Schema

### Unified Country Object

```json
{
  "codes": {
    "iso_a2": "US",
    "iso_a3": "USA",
    "iso_numeric": "840",
    "fips": "US",
    "un_code": "840"
  },
  "names": {
    "common": "United States",
    "official": "United States of America",
    "native": "United States",
    "translations": {
      "de": "Vereinigte Staaten",
      "es": "Estados Unidos",
      "fr": "États-Unis",
      "ja": "アメリカ合衆国",
      "zh": "美国"
    }
  },
  "flags": {
    "emoji": "🇺🇸",
    "unicode": "U+1F1FA U+1F1F8",
    "svg_url": "https://flagcdn.com/us.svg",
    "png_url": "https://flagcdn.com/w320/us.png"
  },
  "geography": {
    "continent": "North America",
    "region": "Americas",
    "subregion": "Northern America",
    "coordinates": {
      "lat": 38.0,
      "lon": -97.0
    },
    "area_sq_km": 9833517,
    "boundaries": {
      "type": "FeatureCollection",
      "features": [...]
    }
  },
  "demographics": {
    "population": 341963408,
    "population_year": 2025,
    "capital": "Washington, D.C.",
    "languages": ["English", "Spanish"],
    "religions": ["Protestant", "Roman Catholic", "Jewish"]
  },
  "development": {
    "hdi": {
      "value": 0.921,
      "rank": 17,
      "year": 2024,
      "source": "UNDP",
      "category": "Very High"
    },
    "gdp_per_capita": 73143,
    "life_expectancy": 79.1,
    "literacy_rate": 99.0
  },
  "governance": {
    "democracy": {
      "vdem_liberal_democracy": 0.69,
      "vdem_electoral_democracy": 0.79,
      "vdem_rank": 29,
      "year": 2024,
      "source": "V-Dem"
    },
    "freedom": {
      "freedom_house_status": "Free",
      "freedom_house_score": 83,
      "political_rights": 1,
      "civil_liberties": 1,
      "year": 2025,
      "source": "Freedom House"
    },
    "corruption": {
      "cpi_score": 69,
      "cpi_rank": 27,
      "year": 2024,
      "source": "Transparency International"
    },
    "press_freedom": {
      "rsf_score": 71.2,
      "rsf_rank": 55,
      "year": 2025,
      "source": "Reporters Without Borders"
    }
  },
  "gender": {
    "wps_index": {
      "score": 0.930,
      "rank": 2,
      "year": 2025,
      "source": "Georgetown GIWPS",
      "dimensions": {
        "inclusion": 0.943,
        "justice": 0.969,
        "security": 0.878
      }
    },
    "gender_gap": {
      "score": 0.748,
      "rank": 43,
      "year": 2024,
      "source": "WEF",
      "sub_indices": {
        "economic_participation": 0.774,
        "educational_attainment": 1.000,
        "health_survival": 0.970,
        "political_empowerment": 0.247
      }
    },
    "gii": {
      "value": 0.162,
      "rank": 54,
      "year": 2024,
      "source": "UNDP"
    }
  },
  "aviation": {
    "airports": [
      {
        "icao": "KJFK",
        "iata": "JFK",
        "name": "John F. Kennedy International Airport",
        "city": "New York",
        "lat": 40.6398,
        "lon": -73.7789,
        "elevation": 13,
        "timezone": "America/New_York"
      }
    ],
    "airport_count": 10
  },
  "regions": [
    {
      "code": "US-CA",
      "name": "California",
      "flag": "🏴󠁵󠁳󠁣󠁡󠁿",
      "type": "state",
      "capital": "Sacramento"
    }
  ],
  "metadata": {
    "sources": [
      "natural_earth_v5.2",
      "cia_factbook_2025",
      "undp_hdi_2024",
      "vdem_v15",
      "freedom_house_2025",
      "transparency_cpi_2024",
      "rsf_2025",
      "giwps_2025",
      "wef_gggi_2024"
    ],
    "last_updated": "2025-10-30",
    "data_completeness": 0.95,
    "has_boundary": true,
    "has_airports": true,
    "has_regions": true
  }
}
```

---

## Country Coverage Matrix

Example of tracking which sources cover which countries:

```json
{
  "coverage_matrix": {
    "US": {
      "natural_earth": true,
      "cia_factbook": true,
      "mwgg_airports": true,
      "undp_hdi": true,
      "vdem": true,
      "freedom_house": true,
      "transparency_cpi": true,
      "rsf_press_freedom": true,
      "giwps_wps": true,
      "wef_gender_gap": true,
      "unwomen": true,
      "coverage_percentage": 100
    },
    "XK": {
      "natural_earth": true,
      "cia_factbook": false,
      "mwgg_airports": true,
      "undp_hdi": false,
      "vdem": true,
      "freedom_house": true,
      "transparency_cpi": false,
      "rsf_press_freedom": false,
      "giwps_wps": false,
      "wef_gender_gap": false,
      "unwomen": false,
      "coverage_percentage": 36
    }
  },
  "summary": {
    "total_countries": 247,
    "sources_count": 11,
    "average_coverage": 87.3,
    "countries_with_full_coverage": 168,
    "countries_with_partial_coverage": 79,
    "countries_with_no_coverage": 0
  }
}
```

---

## Emoji Flag Mapping Strategy

### Standard Country Flags (ISO 3166-1 alpha-2)

Standard flags use Regional Indicator Symbols:
- `🇺🇸` = 🇺 (U+1F1FA) + 🇸 (U+1F1F8)
- `🇬🇧` = 🇬 (U+1F1EC) + 🇧 (U+1F1E7)

**Implementation**:
```python
def country_flag_emoji(iso_a2: str) -> str:
    """Convert ISO 3166-1 alpha-2 to emoji flag."""
    if len(iso_a2) != 2:
        return ""

    # Convert to regional indicator symbols
    base = 0x1F1E6 - ord('A')
    emoji = chr(base + ord(iso_a2[0])) + chr(base + ord(iso_a2[1]))
    return emoji
```

### Regional/Subdivision Flags

Regional flags use Tag Sequences:
- `🏴󠁧󠁢󠁷󠁬󠁳󠁿` Wales = 🏴 + gbwls tags
- `🏴󠁧󠁢󠁳󠁣󠁴󠁿` Scotland = 🏴 + gbsct tags

**Supported**:
- England (🏴󠁧󠁢󠁥󠁮󠁧󠁿 gbeng)
- Scotland (🏴󠁧󠁢󠁳󠁣󠁴󠁿 gbsct)
- Wales (🏴󠁧󠁢󠁷󠁬󠁳󠁿 gbwls)
- Texas (🏴󠁵󠁳󠁴󠁸󠁿 ustx)
- California (🏴󠁵󠁳󠁣󠁡󠁿 usca)
- All 50 US states

**Fallback Strategy**:
1. Try regional flag emoji
2. Fall back to country flag if not supported
3. Fall back to 🏳️ generic flag
4. Document which OS/devices support which flags

---

## License Compliance Matrix

| Source | License | Attribution Required | Commercial Use | Redistribution | NoDerivs |
|--------|---------|---------------------|----------------|----------------|----------|
| Natural Earth | Public Domain | No (but nice) | ✅ Yes | ✅ Yes | ✅ Yes |
| CIA Factbook | Public Domain | No | ✅ Yes | ✅ Yes | ✅ Yes |
| mwgg/Airports | MIT | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| UNDP HDI | CC BY 4.0 | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| V-Dem | CC BY 4.0 | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Freedom House | Open (attr) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Transparency CPI | CC BY-ND 4.0 | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| RSF Press Freedom | Open (attr) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Georgetown WPS | TBD (likely attr) | ✅ Yes (assume) | ✅ Yes | ✅ Yes | ✅ Yes |
| WomanStats | TBD (investigate) | ⚠️ TBD | ⚠️ TBD | ⚠️ TBD | ⚠️ TBD |
| WEF Gender Gap | TBD (likely attr) | ✅ Yes (assume) | ✅ Yes | ✅ Yes | ✅ Yes |
| UN Women | Open (UN) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| World Bank | CC BY 4.0 | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Unicode CLDR | Unicode License | No | ✅ Yes | ✅ Yes | ✅ Yes |

**Action Items**:
- [ ] Confirm Georgetown WPS Index license (contact if needed)
- [ ] **CRITICAL**: Contact WomanStats (info@womanstats.org) for data access and license terms
- [ ] Confirm WEF Global Gender Gap license
- [ ] Document all attribution requirements in ATTRIBUTIONS.md

---

## Technical Stack

### Languages & Frameworks
- **Python 3.11+**: Data fetching, processing, validation
  - `requests`: HTTP requests
  - `pandas`: Data manipulation
  - `pycountry`: ISO code handling
  - `jsonschema`: Schema validation
  - `BeautifulSoup4`: Web scraping (if needed)
  - `openpyxl`: Excel file parsing

- **Node.js 18+** (optional): If JavaScript/TypeScript distribution desired
  - TypeScript typings for JSON datasets
  - NPM package publishing

### Infrastructure
- **GitHub Actions**: CI/CD automation
- **GitHub Releases**: Dataset distribution
- **GitHub Pages** (optional): Documentation site

### Data Formats
- **JSON**: Primary format for structured data
- **CSV**: Alternative format for spreadsheet users
- **GeoJSON**: Geographic boundary data
- **JSON Schema**: Data validation

### Testing
- **pytest**: Python unit tests
- **coverage.py**: Code coverage
- **JSON Schema validators**: Data validation

---

## Success Metrics

### Coverage Goals
- ✅ **100% UN member states** (193 countries) have ISO codes + flags
- ✅ **90%+ coverage** for core metrics (HDI, democracy, gender gap)
- ✅ **80%+ coverage** for specialized metrics (WomanStats, WPS)
- ✅ **50+ territories** included (non-UN members)

### Quality Goals
- ✅ **Zero schema violations** in unified dataset
- ✅ **<5% missing data** for high-priority countries (G20, EU, etc.)
- ✅ **Data freshness <3 months** on average
- ✅ **100% test coverage** for pipeline code

### Automation Goals
- ✅ **Monthly automated refresh** via GitHub Actions
- ✅ **<30 minute** total pipeline execution time
- ✅ **Zero manual intervention** for updates
- ✅ **Automated release** on successful validation

### Community Goals
- ✅ **Open source** (MIT license for pipeline code)
- ✅ **Well documented** (README, API docs, contribution guide)
- ✅ **10+ external users** (beyond Atlas Logged)
- ✅ **Community contributions** accepted and merged

---

## Risks & Mitigations

### Risk 1: Data Source Availability
**Risk**: External sources change URLs, formats, or go offline
**Mitigation**:
- Monitor with automated health checks
- Version control downloaded raw data
- Maintain fallback to previous versions
- Document alternative sources

### Risk 2: License Changes
**Risk**: Source changes license terms, restricting use
**Mitigation**:
- Document current licenses with dates
- Subscribe to source announcements
- Have alternative sources for critical data
- Archive data under current licenses

### Risk 3: WomanStats Data Access
**Risk**: WomanStats may not provide bulk data export or API
**Mitigation**:
- **Immediate**: Contact info@womanstats.org to request access
- **Fallback**: Use web scraping (if ToS allows)
- **Alternative**: Focus on other gender sources (WEF, UN Women, Georgetown)

### Risk 4: API Rate Limits / Keys
**Risk**: APIs may have rate limits or require registration
**Mitigation**:
- Use GitHub Secrets for API keys
- Implement rate limiting in fetchers
- Cache responses to reduce requests
- Schedule updates during off-peak hours

### Risk 5: Data Quality Issues
**Risk**: Sources may have errors, inconsistencies, outliers
**Mitigation**:
- Comprehensive validation suite
- Cross-reference between sources
- Manual review of outliers
- Transparency in data provenance

### Risk 6: Pipeline Maintenance Burden
**Risk**: Maintaining 10+ sources is time-consuming
**Mitigation**:
- Prioritize sources by value
- Automate everything possible
- Design for easy source addition/removal
- Community contributions welcome

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ **Read and approve this plan**
2. [ ] **Create new GitHub repository**: `atlas-logged-data-pipeline`
3. [ ] **Contact WomanStats**: Email info@womanstats.org requesting bulk data access and license terms
4. [ ] **Set up development environment**: Python 3.11, dependencies, pre-commit hooks
5. [ ] **Create core mapping files**:
   - `country_codes.json` (ISO 2/3, numeric, FIPS)
   - `emoji_flags.json` (country + regional flags)
   - `country_names.json` (official, common, translations)

### Month 1: Foundation
6. [ ] Implement core pipeline classes (Fetcher, Normalizer, Validator, Merger)
7. [ ] Set up GitHub Actions workflows (CI/CD)
8. [ ] Write initial documentation (README, CONTRIBUTING, SOURCES.md)
9. [ ] Create JSON Schema for unified dataset
10. [ ] Migrate existing data (Natural Earth, CIA Factbook, Airports) to new pipeline

### Month 2: High-Priority Sources
11. [ ] Integrate Georgetown WPS Index
12. [ ] Integrate WEF Global Gender Gap (from HDX or direct)
13. [ ] Integrate UN Women Data Hub
14. [ ] Integrate V-Dem Democracy Indices
15. [ ] Integrate Freedom House scores
16. [ ] Generate first coverage matrix

### Month 3: Development Indicators
17. [ ] Integrate UNDP HDI (via API)
18. [ ] Integrate Transparency CPI
19. [ ] Integrate RSF Press Freedom Index
20. [ ] Build unified dataset with all sources
21. [ ] Comprehensive validation and testing

### Month 4: Automation
22. [ ] Automated monthly refresh
23. [ ] Data quality monitoring
24. [ ] Coverage analysis reports
25. [ ] Auto-generated documentation

### Month 5: Publishing
26. [ ] GitHub releases with semantic versioning
27. [ ] NPM package (if desired)
28. [ ] Documentation website (if desired)
29. [ ] Integration guide for Atlas Logged

### Month 6: Integration
30. [ ] Update Atlas Logged app with new data
31. [ ] Add UI for new metrics
32. [ ] User testing and feedback
33. [ ] Launch! 🚀

---

## Questions to Resolve

1. **Repository Name**:
   - Option A: `atlas-logged-data-pipeline` (specific to project)
   - Option B: `global-location-intelligence` (generic, community-friendly)
   - **Your preference?**

2. **WomanStats Access**:
   - Need to contact them - can you draft the email or should I?
   - What should we do if they don't provide bulk access?

3. **NPM Distribution**:
   - Do you want to publish as an NPM package for easy JS/TS consumption?
   - Package name: `@atlas-logged/country-data`?

4. **Documentation Site**:
   - Do you want a GitHub Pages site with interactive data explorer?
   - Or is repo README sufficient?

5. **Update Frequency**:
   - Monthly automated refresh (GitHub Actions)?
   - Or quarterly to reduce API usage?

6. **Priorities**:
   - Are gender equality sources the top priority?
   - Any other sources you'd like added to high-priority list?

---

## Resources

### Learning Resources
- **Python Data Engineering**: https://realpython.com/
- **GitHub Actions**: https://docs.github.com/en/actions
- **JSON Schema**: https://json-schema.org/
- **Emoji Flags**: https://emojipedia.org/flags/

### Similar Projects
- **REST Countries**: https://restcountries.com/ (inspiration)
- **countries**: https://github.com/mledoze/countries (JSON data)
- **world.geo.json**: https://github.com/johan/world.geo.json (boundaries)

### Data Sources Index
- **Our World in Data**: https://ourworldindata.org/
- **HDX**: https://data.humdata.org/ (humanitarian data)
- **Data.gov**: https://data.gov/ (US government open data)

---

**Last Updated**: October 30, 2025
**Version**: 1.0 (Draft)
**Author**: Claude Code AI + Tim Apple
**Status**: 📋 Awaiting Approval

---

## Appendix: Source Comparison Table

| Source | Countries | Update Freq | License | API | Priority | Status |
|--------|-----------|-------------|---------|-----|----------|--------|
| Natural Earth | 247 | Annual | Public Domain | No | ✅ High | Integrated |
| CIA Factbook | 235 | Weekly | Public Domain | No | ✅ High | Integrated |
| mwgg/Airports | Global | Monthly | MIT | No | ✅ High | Integrated |
| UNDP HDI | 193 | Annual | CC BY 4.0 | ✅ Yes | ✅ High | Planned |
| V-Dem | 202 | Annual | CC BY 4.0 | No | ✅ High | Planned |
| Freedom House | 195 | Annual | Open | No | ✅ High | Planned |
| Georgetown WPS | 181 | Biennial | TBD | No | ✅ High | Planned |
| WomanStats | 176 | Ongoing | TBD | No | ✅ High | Needs contact |
| WEF Gender Gap | 146 | Annual | TBD | No | ✅ High | Planned |
| UN Women | Global | Continuous | Open (UN) | ✅ Yes | ✅ High | Planned |
| Transparency CPI | 180 | Annual | CC BY-ND 4.0 | No | 🟡 Medium | Planned |
| RSF Press Freedom | 180 | Annual | Open | No | 🟡 Medium | Planned |
| World Bank | 217 | Quarterly | CC BY 4.0 | ✅ Yes | 🟡 Medium | Future |
| OECD SIGI | 179 | ~3 years | Open | ✅ Yes | 🟡 Medium | Future |
| OurAirports | 76K+ | Daily | CC0 | No | 🟡 Medium | Future |
| Int'l IDEA | 173 | Monthly | Open | ✅ Yes | 🔴 Low | Future |
| US State Dept | 195 | Annual | Public Domain | No | 🔴 Low | Future |

---

**End of Document**
