#!/usr/bin/env node

/**
 * Build Unified Countries Database
 *
 * Combines all data sources into a single unified database:
 * - Natural Earth boundaries (GeoJSON)
 * - CIA Factbook metadata
 * - Regional flags
 * - Airport associations
 *
 * Output: countries_v2.json (complete database with ISO codes)
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const RESOURCES_DIR = path.join(BASE_DIR, 'resources');

// Input files
const COUNTRIES_GEOJSON = path.join(RESOURCES_DIR, 'countries_50m.geojson');
const FACTBOOK_JSON = path.join(DATA_DIR, 'cia_factbook', 'cia_factbook_2025_iso.json');
const REGIONAL_FLAGS_JSON = path.join(RESOURCES_DIR, 'regional_flags.json');
const AIRPORTS_JSON = path.join(RESOURCES_DIR, 'airports_iata.json');

// Output file
const OUTPUT_FILE = path.join(RESOURCES_DIR, 'countries_v2.json');

console.log('\n' + '='.repeat(60));
console.log('Unified Countries Database Builder');
console.log('='.repeat(60));

/**
 * Load all data sources
 */
function loadDataSources() {
    console.log('\n📂 Loading data sources...');

    const sources = {};

    // Load GeoJSON boundaries
    if (fs.existsSync(COUNTRIES_GEOJSON)) {
        sources.boundaries = JSON.parse(fs.readFileSync(COUNTRIES_GEOJSON, 'utf-8'));
        console.log(`  ✅ Boundaries: ${sources.boundaries.features.length} countries`);
    } else {
        console.error('  ❌ Boundaries not found! Run: node scripts/02_process_boundaries.js');
        process.exit(1);
    }

    // Load CIA Factbook
    if (fs.existsSync(FACTBOOK_JSON)) {
        sources.factbook = JSON.parse(fs.readFileSync(FACTBOOK_JSON, 'utf-8'));
        console.log(`  ✅ Factbook: ${sources.factbook.total_countries} countries`);
    } else {
        console.error('  ❌ Factbook not found! Run: python3 scripts/04_extract_factbook_iso.py');
        process.exit(1);
    }

    // Load regional flags
    if (fs.existsSync(REGIONAL_FLAGS_JSON)) {
        sources.regionalFlags = JSON.parse(fs.readFileSync(REGIONAL_FLAGS_JSON, 'utf-8'));
        console.log(`  ✅ Regional flags: ${Object.keys(sources.regionalFlags.countries).length} countries`);
    } else {
        console.warn('  ⚠️  Regional flags not found (optional)');
        sources.regionalFlags = { countries: {} };
    }

    // Load airports
    if (fs.existsSync(AIRPORTS_JSON)) {
        sources.airports = JSON.parse(fs.readFileSync(AIRPORTS_JSON, 'utf-8'));
        console.log(`  ✅ Airports: ${sources.airports.total_airports} airports`);
    } else {
        console.warn('  ⚠️  Airports not found (optional)');
        sources.airports = { airports: {} };
    }

    return sources;
}

/**
 * Get national flag emoji from ISO code
 */
function getNationalFlag(isoCode) {
    if (!isoCode || isoCode.length !== 2) return null;

    const codePoints = isoCode.toUpperCase().split('').map(char =>
        0x1F1E6 - 65 + char.charCodeAt(0)
    );

    return String.fromCodePoint(...codePoints);
}

/**
 * Find airports near a country
 */
function findCountryAirports(countryISO, airports) {
    const countryAirports = [];

    for (const [icao, airport] of Object.entries(airports.airports || {})) {
        if (airport.country === countryISO) {
            countryAirports.push({
                icao: airport.icao,
                iata: airport.iata,
                name: airport.name,
                city: airport.city
            });
        }
    }

    return countryAirports.slice(0, 10); // Limit to top 10
}

/**
 * Build unified country entry
 */
function buildCountryEntry(boundaryFeature, factbook, regionalFlags, airports) {
    const props = boundaryFeature.properties;
    // Trim null bytes from ISO codes (Natural Earth uses fixed-width strings)
    const iso = (props.iso_a2 || '').replace(/\x00/g, '').trim();

    // Get factbook data
    const factbookData = factbook.countries[iso] || {};

    // Get regional flags
    const regionData = regionalFlags.countries[iso] || null;

    // Get airports
    const countryAirports = findCountryAirports(iso, airports);

    // Extract capital coordinates from factbook
    let capitalCoords = null;
    if (factbookData.government && factbookData.government.capital) {
        const coordsText = factbookData.government.capital.coordinates;
        if (coordsText) {
            // Parse "51 30 N, 0 10 W" format
            const match = coordsText.match(/(\d+)\s+(\d+)\s+([NS]),\s+(\d+)\s+(\d+)\s+([EW])/);
            if (match) {
                const lat = parseInt(match[1]) + parseInt(match[2]) / 60;
                const lon = parseInt(match[4]) + parseInt(match[5]) / 60;
                capitalCoords = {
                    lat: match[3] === 'N' ? lat : -lat,
                    lon: match[6] === 'E' ? lon : -lon
                };
            }
        }
    }

    return {
        code: iso,
        iso_a3: (props.iso_a3 || '').replace(/\x00/g, '').trim(),
        name: props.name,
        name_long: props.name_long,
        flag: getNationalFlag(iso),

        // Geography
        geography: {
            continent: props.continent,
            region: props.region_un,
            subregion: props.subregion,
            location: factbookData.geography?.location || null,
            coordinates: factbookData.geography?.coordinates || null,
            area: factbookData.geography?.area || null,
            climate: factbookData.geography?.climate || null,
            terrain: factbookData.geography?.terrain || null,
            elevation: factbookData.geography?.elevation || null,
            natural_hazards: factbookData.geography?.natural_hazards || null,
            environment_issues: factbookData.geography?.environment_issues || null
        },

        // People & Society
        people: {
            population: factbookData.people?.population || { total: props.population },
            nationality: factbookData.people?.nationality || null,
            languages: factbookData.people?.languages || null,
            religions: factbookData.people?.religions || null,
            median_age: factbookData.people?.median_age || null
        },

        // Government
        government: {
            name: factbookData.government?.country_name || props.name_long,
            type: factbookData.government?.government_type || null,
            capital: {
                name: factbookData.government?.capital?.name || null,
                coordinates: capitalCoords
            },
            independence: factbookData.government?.independence || null,
            administrative_divisions: factbookData.government?.administrative_divisions || null
        },

        // Economy
        economy: {
            gdp: factbookData.economy?.gdp || { value: props.gdp },
            gdp_per_capita: factbookData.economy?.gdp_per_capita || null,
            currency: factbookData.economy?.currency || null
        },

        // Regions (if applicable)
        regions: regionData ? Object.entries(regionData.regions).map(([code, region]) => ({
            code: region.code,
            name: region.name,
            flag: region.flag,
            type: region.type
        })) : [],

        // Airports
        airports: countryAirports,

        // Metadata
        metadata: {
            has_boundary: true,
            has_factbook: !!factbookData.code,
            has_regions: regionData !== null,
            airport_count: countryAirports.length
        }
    };
}

/**
 * Build unified database
 */
function buildUnifiedDatabase(sources) {
    console.log('\n🔨 Building unified database...');

    const countries = {};
    let withBoundary = 0;
    let withFactbook = 0;
    let withRegions = 0;
    let withAirports = 0;

    for (const feature of sources.boundaries.features) {
        const iso = (feature.properties.iso_a2 || '').replace(/\x00/g, '').trim();
        if (!iso || iso === '-99') continue; // Skip invalid codes

        const country = buildCountryEntry(
            feature,
            sources.factbook,
            sources.regionalFlags,
            sources.airports
        );

        countries[iso] = country;

        withBoundary++;
        if (country.metadata.has_factbook) withFactbook++;
        if (country.metadata.has_regions) withRegions++;
        if (country.metadata.airport_count > 0) withAirports++;
    }

    console.log(`  ✅ Processed ${withBoundary} countries`);
    console.log(`     - With factbook data: ${withFactbook}`);
    console.log(`     - With regions: ${withRegions}`);
    console.log(`     - With airports: ${withAirports}`);

    return countries;
}

/**
 * Save unified database
 */
function saveUnifiedDatabase(countries) {
    console.log(`\n💾 Saving to: ${path.relative(BASE_DIR, OUTPUT_FILE)}`);

    const output = {
        version: '2.0.0',
        generated_at: new Date().toISOString().split('T')[0],
        description: 'Unified geographic intelligence database with ISO codes',
        sources: {
            boundaries: 'Natural Earth 50m',
            factbook: 'CIA World Factbook (Oct 2025)',
            airports: 'mwgg/Airports (IATA-only)',
            regional_flags: 'Custom Unicode mappings'
        },
        total_countries: Object.keys(countries).length,
        entities: countries
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`  ✅ Saved ${Object.keys(countries).length} countries`);
    console.log(`  💾 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    return stats.size;
}

/**
 * Print sample countries
 */
function printSamples(countries) {
    console.log('\n📋 Sample countries:');

    const samples = ['GB', 'US', 'FR', 'JP', 'AU'];

    for (const iso of samples) {
        const country = countries[iso];
        if (country) {
            console.log(`  ${country.flag} ${iso}: ${country.name}`);
            console.log(`     Capital: ${country.government.capital.name}`);
            console.log(`     Population: ${country.people.population.total?.toLocaleString() || 'N/A'}`);
            console.log(`     Regions: ${country.regions.length}`);
            console.log(`     Airports: ${country.airports.length}`);
        }
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Load all data sources
        const sources = loadDataSources();

        // Build unified database
        const countries = buildUnifiedDatabase(sources);

        // Save output
        const size = saveUnifiedDatabase(countries);

        // Print samples
        printSamples(countries);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Unified Database Complete!');
        console.log('='.repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`   Total countries: ${Object.keys(countries).length}`);
        console.log(`   Database size: ${(size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`\n📁 All resources ready in: ${RESOURCES_DIR}`);
        console.log(`   - countries_v2.json (unified database)`);
        console.log(`   - countries_50m.geojson (boundaries)`);
        console.log(`   - airports_iata.json (7,793 airports)`);
        console.log(`   - regional_flags.json (27 regions)`);
        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run
if (require.main === module) {
    main();
}

module.exports = { loadDataSources, buildCountryEntry, buildUnifiedDatabase };
