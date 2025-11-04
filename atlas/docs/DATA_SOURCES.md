# Data Sources & Licenses

**Last Updated:** October 30, 2025

This document tracks all external data sources used in the Location Intelligence System, their licenses, attribution requirements, and update schedules.

---

## 1. Natural Earth Data

### Overview
- **Provider**: Natural Earth
- **Website**: https://www.naturalearthdata.com/
- **Description**: Public domain map dataset available at 1:10m, 1:50m, and 1:110m scales
- **License**: **Public Domain** (no restrictions)
- **Attribution**: Not required but appreciated

### Files We Use

#### Countries (50m scale)
- **URL**: https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip
- **Version**: 5.1.2 (current)
- **File**: `ne_50m_admin_0_countries.shp` + supporting files
- **Size**: 23.6 MB (unzipped)
- **Coverage**: 247 countries with ISO codes
- **Use**: Country-level boundary detection

#### Sovereignty (50m scale)
- **URL**: https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_sovereignty.zip
- **Version**: 5.1.2
- **File**: `ne_50m_admin_0_sovereignty.shp`
- **Size**: 21.4 MB
- **Coverage**: Sovereign states (handles UK as single entity)
- **Use**: Understanding sovereign state relationships

#### States/Provinces (10m scale)
- **URL**: https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_1_states_provinces.zip
- **Version**: 5.1.2
- **File**: `ne_10m_admin_1_states_provinces.shp`
- **Size**: 53.2 MB
- **Coverage**: Sub-national regions (states, provinces, etc.)
- **Use**: Region detection (Wales, Scotland, Catalonia, etc.)

### License Text
```
All versions of Natural Earth raster + vector map data found on this website
are in the public domain. You may use the maps in any manner, including modifying
the content and design, electronic dissemination, and offset printing. The authors
provide no warranty for any use of the data, but if you encounter any errors or
omissions please report them to naturalearth@googlegroups.com
```

### Update Frequency
- **Natural Earth releases**: Annually (typically March/April)
- **Our update schedule**: With major app versions or as needed
- **Last checked**: October 30, 2025

---

## 2. Airport Database (mwgg/Airports)

### Overview
- **Provider**: mwgg (GitHub)
- **Repository**: https://github.com/mwgg/Airports
- **Description**: JSON database of 28k+ airports with ICAO/IATA codes
- **License**: **MIT License**
- **Attribution**: Not required but encouraged

### Files We Use

#### Main Airport Database
- **URL**: https://raw.githubusercontent.com/mwgg/Airports/master/airports.json
- **Current Version**: v2025.10.27 (October 27, 2025)
- **Size**: 5.8 MB
- **Format**: JSON (ICAO code keys)
- **Coverage**: 28,853 airports worldwide
  - ~11,000 with IATA codes (commercial airports)
  - ~18,000 ICAO-only (small/private/military)

### Data Fields
```json
{
  "ICAO": {
    "icao": "EGLL",
    "iata": "LHR",
    "name": "London Heathrow Airport",
    "city": "London",
    "state": "England",
    "country": "GB",
    "elevation": 83,
    "lat": 51.4706,
    "lon": -0.461941,
    "tz": "Europe/London"
  }
}
```

### MIT License
```
Copyright (c) mwgg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### Data Sources (Upstream)
- **Timezone data**: TimeAPI (https://timeapi.io)
- **Airport data**: Various open sources, curated by community
- **Contributors**: 43 contributors on GitHub

### Update Frequency
- **Repository updates**: Monthly (tagged releases)
- **Our update schedule**: Quarterly or with app updates
- **Last synced**: October 30, 2025 (v2025.10.27)

---

## 3. CIA World Factbook

### Overview
- **Provider**: Central Intelligence Agency (US Government)
- **Website**: https://www.cia.gov/the-world-factbook/
- **Description**: Comprehensive country profiles with geography, demographics, government, economy
- **License**: **Public Domain** (US Government work)
- **Attribution**: Not required

### Data We Extract

#### Categories
1. **Geography**
   - Area (land, water, total)
   - Climate description
   - Terrain description
   - Elevation extremes
   - Natural resources

2. **People & Society**
   - Population
   - Languages
   - Religions
   - Life expectancy
   - Literacy rate

3. **Government**
   - Government type
   - Capital city
   - Independence date
   - National holidays
   - Legal system

4. **Economy**
   - GDP
   - Currency
   - Major industries
   - Exports/imports

### Access Method
- **Option 1**: Manual extraction from website (free, always current)
- **Option 2**: JSON dumps from third parties (may be outdated)
- **Recommended**: Use https://github.com/factbook/factbook.json (community maintained)

### Factbook.json Repository
- **URL**: https://github.com/factbook/factbook.json
- **License**: Public Domain
- **Format**: JSON files per country
- **Last Updated**: 2021 (Note: Outdated, may need manual updates)
- **Coverage**: ~260 countries/territories

### Update Frequency
- **CIA publishes**: Weekly (web updates)
- **factbook.json**: Sporadic (last 2021)
- **Our approach**: Extract fresh data manually for major countries, use 2021 data as baseline
- **Update schedule**: Annually or as needed

### Attribution
Not required, but ethical to note:
```
Data sourced from CIA World Factbook (Public Domain)
https://www.cia.gov/the-world-factbook/
```

---

## 4. Existing Atlas Logged Data

### Overview
- **Source**: Internal (`Atlas Logged/Utilities/CountryDetails.swift`)
- **License**: Internal/Proprietary
- **Coverage**: 247 countries
- **Purpose**: Migration baseline and validation

### Current Data Structure
```swift
let countryDetails: [String: (
    flag: String,
    name: String,
    capital: String,
    latitude: Double,
    longitude: Double,
    airport: String,
    iataCode: String,
    airportLatitude: Double,
    airportLongitude: Double,
    altitude: Double
)]
```

### What We'll Preserve
- ✅ All country ISO codes
- ✅ Capital city coordinates (validated)
- ✅ Primary airport per country
- ✅ Emoji flags
- ✅ Country names (English)

### What We'll Enhance
- ➕ Add sub-regions (Wales, Scotland, etc.)
- ➕ Add multiple airports per country
- ➕ Add rich metadata (CIA Factbook)
- ➕ Add travel advice
- ➕ Add boundary polygons

---

## 5. Forthcoming Data Sources (Open Data Pipeline)

**Note**: These sources will be integrated through a separate open source data pipeline repository. See [OPEN_DATA_PIPELINE_PLAN.md](OPEN_DATA_PIPELINE_PLAN.md) for complete details.

---

### 5.1 Gender Equality & Women's Rights

#### Georgetown Institute - Women, Peace & Security Index (WPS)
- **URL**: https://giwps.georgetown.edu/the-index/
- **Description**: Comprehensive women's wellbeing index across inclusion, justice, and security
- **Coverage**: 181 countries
- **Format**: Excel spreadsheet (downloadable)
- **Update**: Biennial (latest: 2025/26 edition)
- **License**: Academic use (requires confirmation)
- **API**: No (manual download)
- **Key Indicators**:
  - **Inclusion**: Education, employment, parliament, financial inclusion, cell phone access
  - **Justice**: Legal discrimination, son bias, maternal mortality, access to justice
  - **Security**: Intimate partner violence, community safety, political violence, armed conflict
- **Priority**: 🔴 **HIGH** - User requested, unique comprehensive index

#### WomanStats Project
- **URL**: https://www.womanstats.org/
- **Description**: 315,000+ data points on women's security across 350+ variables
- **Coverage**: 176 countries (population > 300,000)
- **Format**: Web database (requires data access request)
- **Update**: Ongoing (collaborative research project)
- **License**: Publicly available (terms TBD - requires investigation)
- **API**: No public API
- **Dimensions**: Physical, economic, legal, community, family security, maternity, voice, societal investment, state security
- **Contact**: info@womanstats.org
- **Priority**: 🔴 **HIGH** - User requested, most comprehensive database
- **Action Required**: Contact for bulk data access and licensing terms

#### World Economic Forum - Global Gender Gap Index
- **URL**: https://www.weforum.org/publications/global-gender-gap-report-2025/
- **Alternative Sources**:
  - HDX: https://data.humdata.org/dataset/global-gender-gap-index-world-economic-forum
  - QOG: https://datafinder.qog.gu.se/dataset/gggi
- **Description**: Gender gap measures across 4 key dimensions
- **Coverage**: 146 countries (varies by year)
- **Format**: Excel (downloadable from reports)
- **Update**: Annual (June)
- **License**: Requires attribution (WEF terms)
- **API**: No (manual downloads)
- **Dimensions**:
  - Economic Participation and Opportunity
  - Educational Attainment
  - Health and Survival
  - Political Empowerment
- **Priority**: 🔴 **HIGH** - Widely cited, annual updates

#### UN Women Data Hub
- **URL**: https://data.unwomen.org/
- **Description**: Gender-specific SDG indicators, violence data, women-peace-security metrics
- **Coverage**: Global (varies by indicator)
- **Format**: CSV, JSON (via API)
- **Update**: Continuous
- **License**: Open data (UN)
- **API**: ✅ Yes - Data portal with API access
- **Priority**: 🔴 **HIGH** - Authoritative UN source

#### World Bank Gender Data Portal
- **URL**: https://genderdata.worldbank.org/
- **Description**: Sex-disaggregated data across demographics, education, health, economics
- **Coverage**: Global
- **Format**: CSV, JSON, XML (via World Bank API)
- **Update**: Varies by indicator
- **License**: Creative Commons Attribution 4.0 (CC BY 4.0)
- **API**: ✅ Yes - World Bank Data API
- **Priority**: 🟡 Medium (comprehensive but overlaps with other sources)

---

### 5.2 Governance, Democracy & Human Rights

#### V-Dem (Varieties of Democracy)
- **URL**: https://www.v-dem.net/
- **Description**: 531 democracy indicators covering historical and contemporary data
- **Coverage**: 202 countries (1789-2025)
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
- **Priority**: 🔴 **HIGH** - Most authoritative democracy data

#### Freedom House - Freedom in the World
- **URL**: https://freedomhouse.org/
- **Description**: Political rights and civil liberties assessments
- **Coverage**: 195 countries + 15 territories
- **Format**: Excel, CSV
- **Update**: Annual (February)
- **License**: Open data with attribution
- **API**: No (Excel downloads)
- **Scores**: 1-7 scale for political rights and civil liberties
- **Priority**: 🔴 **HIGH** - Widely cited standard

#### Transparency International - Corruption Perceptions Index (CPI)
- **URL**: https://www.transparency.org/en/cpi/
- **Description**: Public sector corruption perception scores
- **Coverage**: 180 countries
- **Format**: Excel (.xlsx)
- **Update**: Annual (January)
- **License**: Creative Commons Attribution-NoDerivs 4.0 (CC BY-ND)
- **API**: No (direct Excel downloads)
- **Score**: 0-100 (0 = highly corrupt, 100 = very clean)
- **Priority**: 🟡 Medium - Important governance indicator

#### International IDEA - Global State of Democracy
- **URL**: https://www.idea.int/gsod/
- **Description**: Democracy tracker with monthly event-based updates
- **Coverage**: 173 countries
- **Format**: JSON, CSV (via Democracy Tracker)
- **Update**: Monthly
- **License**: Open data
- **API**: ✅ Yes - Democracy Tracker API
- **Priority**: 🟢 Low (monthly updates may be overkill; V-Dem + Freedom House cover similar ground)

---

### 5.3 Press Freedom

#### Reporters Without Borders - Press Freedom Index
- **URL**: https://rsf.org/en/index
- **Description**: Press freedom rankings and scores
- **Coverage**: 180 countries
- **Format**: CSV (downloadable)
- **Update**: Annual (May)
- **License**: Open data with attribution
- **API**: No (CSV downloads)
- **Score**: 0-100 (100 = most free)
- **Priority**: 🟡 Medium - Critical civil liberties indicator

---

### 5.4 Development Indicators

#### UNDP Human Development Index (HDI)
- **URL**: https://hdr.undp.org/ | API: https://hdrdata.org
- **Description**: Comprehensive human development metrics
- **Coverage**: 193 UN member states
- **Format**: JSON, CSV, Excel
- **Update**: Annual (May)
- **License**: Open (Creative Commons Attribution)
- **API**: ✅ Yes - HDRO Data API 2.0 (requires API key)
- **Key Indicators**:
  - Human Development Index (HDI)
  - Inequality-adjusted HDI (IHDI)
  - Gender Development Index (GDI)
  - Gender Inequality Index (GII)
  - Multidimensional Poverty Index (MPI)
  - Planetary Pressures-Adjusted HDI
- **Priority**: 🔴 **HIGH** - Authoritative development data with API

#### World Bank Development Indicators
- **URL**: https://data.worldbank.org/ | API: https://api.worldbank.org/v2/
- **Description**: 1,600+ indicators (GDP, poverty, education, health, environment)
- **Coverage**: 217 economies
- **Format**: JSON, XML, CSV
- **Update**: Quarterly
- **License**: Creative Commons Attribution 4.0 (CC BY 4.0)
- **API**: ✅ Yes - Comprehensive REST API
- **Priority**: 🟢 Low (very large dataset; may use selectively)

---

### 5.5 Reference & Standards

#### Unicode CLDR (Common Locale Data Repository)
- **URL**: https://cldr.unicode.org/
- **Description**: Country names in all languages, flag emojis, locale data
- **Coverage**: All countries
- **Format**: XML, JSON
- **Update**: Quarterly
- **License**: Unicode License (permissive)
- **API**: No (download repository)
- **Priority**: 🔴 **HIGH** - Essential for emoji flags and multilingual names

#### REST Countries
- **URL**: https://restcountries.com/
- **Description**: Country information (name, capital, currency, languages, flags)
- **Coverage**: 250+ countries
- **Format**: JSON
- **Update**: Community maintained
- **License**: MPL 2.0
- **API**: ✅ Yes - Free REST API
- **Priority**: 🟢 Low (good for validation)

---

### 5.6 Aviation (Supplementary)

#### OurAirports
- **URL**: https://ourairports.com/data/
- **Description**: Comprehensive airport database with heliports, seaplane bases
- **Coverage**: 76,000+ airports
- **Format**: CSV
- **Update**: Daily
- **License**: Public Domain (CC0)
- **API**: No (direct CSV downloads)
- **Priority**: 🟢 Low (supplement mwgg/Airports if needed)

---

### 5.7 Safety & Travel (Future Consideration)

#### US State Department Travel Advisories
- **URL**: https://travel.state.gov/
- **Description**: Safety warnings and travel advisories
- **Coverage**: All countries
- **Format**: HTML (scraping needed) or API
- **Update**: Continuous
- **License**: Public Domain (US Government)
- **API**: Available
- **Priority**: 🟢 Low (future feature)

---

## Implementation Plan

All forthcoming sources will be integrated through a separate **open source data pipeline repository** with the following goals:

### Goals
1. **Automated Updates**: Monthly refresh via GitHub Actions CI/CD
2. **Unified Schema**: All data standardized with ISO 2/3 codes, emoji flags, consistent country IDs
3. **Coverage Tracking**: Matrix showing which countries each dataset supports
4. **Quality Assurance**: Automated validation, schema checks, outlier detection
5. **Open Source**: MIT licensed pipeline code, respecting individual source licenses
6. **Community Friendly**: Well-documented, easy to contribute new sources

### Priorities
- **Phase 1** (Months 1-2): Foundation + Gender sources (Georgetown WPS, WomanStats, WEF Gender Gap, UN Women)
- **Phase 2** (Month 3): Governance sources (V-Dem, Freedom House, Transparency CPI, RSF)
- **Phase 3** (Month 4): Development sources (UNDP HDI)
- **Phase 4** (Month 5): Automation, publishing, documentation
- **Phase 5** (Month 6): Integration with Atlas Logged app

### Repository
- **Name**: `atlas-logged-data-pipeline` or `global-location-intelligence`
- **Structure**: Sources organized by category, modular fetchers, unified output
- **Output**: JSON + CSV unified datasets, individual source JSONs, coverage matrix
- **Documentation**: Complete source attributions, licenses, API usage guides

### Next Actions
1. Create separate repository for data pipeline
2. **Contact WomanStats** (info@womanstats.org) for bulk data access
3. Confirm licenses for Georgetown WPS and WEF Gender Gap
4. Implement core pipeline infrastructure
5. Begin Phase 1 integrations

---

For complete implementation details, roadmap, technical architecture, and source-by-source breakdowns, see:
📘 **[OPEN_DATA_PIPELINE_PLAN.md](OPEN_DATA_PIPELINE_PLAN.md)**

---

## Attribution in App

### "About" Screen Text (Proposed)

```
Geographic Data Sources:

Natural Earth (Public Domain)
https://www.naturalearthdata.com/
Country and region boundary data

mwgg/Airports (MIT License)
https://github.com/mwgg/Airports
Comprehensive airport database

CIA World Factbook (Public Domain)
https://www.cia.gov/the-world-factbook/
Country demographics and statistics

All data processed and curated by Atlas Logged
```

---

## Data Quality & Validation

### Known Issues

#### Natural Earth
- ✅ Disputed territories handled neutrally
- ⚠️ Some small islands may be missing at 50m scale
- ⚠️ Borders reflect de facto control, not political claims

#### mwgg/Airports
- ✅ Actively maintained, high quality
- ⚠️ Small airports may have inaccurate coordinates
- ⚠️ Some IATA codes may be historical/inactive

#### CIA Factbook
- ✅ Authoritative for most data
- ⚠️ Political bias (US Government source)
- ⚠️ Some population estimates may be outdated

### Our Validation Process
1. Cross-reference country codes across all sources
2. Validate coordinates (capitals, airports within country boundaries)
3. Check for duplicates and conflicts
4. Manual spot-checks for major cities
5. Automated tests for data integrity

---

## Legal Compliance

### Privacy
- ✅ No personal data collected
- ✅ No user tracking
- ✅ All data is public domain or openly licensed
- ✅ Offline-first (no data sent to servers)

### Export Restrictions
- ✅ Geographic data: No restrictions
- ✅ App distribution: Worldwide (no ITAR concerns)

### GDPR/Privacy Laws
- ✅ No data processing of EU citizens
- ✅ No cookies or tracking
- ✅ User data stays on device

---

## Maintenance Schedule

### Monthly
- [ ] Check mwgg/Airports for updates

### Quarterly
- [ ] Review Natural Earth for new releases
- [ ] Update major airport list if needed

### Annually
- [ ] Full data refresh from all sources
- [ ] Validate all coordinates and metadata
- [ ] Update CIA Factbook data for major countries

### As Needed
- [ ] New country formations (Kosovo, South Sudan, etc.)
- [ ] Disputed territory changes
- [ ] Major airport openings/closures

---

## Contact & Support

### Natural Earth
- **Email**: naturalearth@googlegroups.com
- **Forum**: Google Groups
- **Issues**: Report data errors to mailing list

### mwgg/Airports
- **GitHub**: https://github.com/mwgg/Airports/issues
- **Maintainer**: Active on GitHub

### CIA Factbook
- **No direct support**: Public information
- **Errors**: Report via website feedback form

---

**Last Review:** October 30, 2025
**Next Review:** January 30, 2026
**Maintained By:** Atlas Logged Development Team
