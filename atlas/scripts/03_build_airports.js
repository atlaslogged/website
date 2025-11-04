#!/usr/bin/env node

/**
 * Build Airports Database
 *
 * Filters airports to IATA-only commercial airports
 * Source: 29,293 total airports
 * Target: ~11,000 commercial airports with IATA codes
 *
 * Output: airports_iata.json
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const AIRPORTS_FILE = path.join(DATA_DIR, 'airports', 'airports.json');
const OUTPUT_DIR = path.join(BASE_DIR, 'resources');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'airports_iata.json');

console.log('\n' + '='.repeat(60));
console.log('Airport Database Builder');
console.log('='.repeat(60));

/**
 * Load airports from JSON
 */
function loadAirports() {
    console.log(`\n📂 Loading airports from: ${path.relative(BASE_DIR, AIRPORTS_FILE)}`);

    if (!fs.existsSync(AIRPORTS_FILE)) {
        console.error('❌ Airports file not found!');
        console.error('   Run: ./scripts/01_download_data.sh');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(AIRPORTS_FILE, 'utf-8'));
    console.log(`✅ Loaded ${Object.keys(data).length} airports`);

    return data;
}

/**
 * Filter to IATA-only commercial airports
 */
function filterAirports(airports) {
    console.log('\n🔍 Filtering airports...');

    const filtered = {};
    let withIATA = 0;
    let withCoordinates = 0;
    let commercial = 0;

    for (const [icao, airport] of Object.entries(airports)) {
        // Must have IATA code
        if (!airport.iata || airport.iata.length !== 3) {
            continue;
        }
        withIATA++;

        // Must have valid coordinates
        if (!airport.lat || !airport.lon) {
            continue;
        }
        if (airport.lat < -90 || airport.lat > 90) {
            continue;
        }
        if (airport.lon < -180 || airport.lon > 180) {
            continue;
        }
        withCoordinates++;

        // Filter out military, private, heliports, etc.
        const type = (airport.type || '').toLowerCase();
        const name = (airport.name || '').toLowerCase();

        // Skip military bases
        if (name.includes('military') ||
            name.includes('air force') ||
            name.includes('naval air') ||
            name.includes('army air') ||
            type.includes('military')) {
            continue;
        }

        // Skip heliports
        if (type.includes('heliport') || name.includes('heliport')) {
            continue;
        }

        // Skip closed airports
        if (type.includes('closed') || name.includes('closed')) {
            continue;
        }

        commercial++;

        // Create cleaned airport entry
        filtered[icao] = {
            icao: icao,
            iata: airport.iata,
            name: airport.name,
            city: airport.city || null,
            country: airport.country || null,
            lat: parseFloat(airport.lat),
            lon: parseFloat(airport.lon),
            elevation: airport.elevation ? parseInt(airport.elevation) : null,
            timezone: airport.timezone || null
        };
    }

    console.log(`  Total airports: ${Object.keys(airports).length}`);
    console.log(`  With IATA code: ${withIATA}`);
    console.log(`  With coordinates: ${withCoordinates}`);
    console.log(`  Commercial (filtered): ${commercial}`);

    return filtered;
}

/**
 * Create IATA lookup index
 */
function createIATAIndex(airports) {
    console.log('\n📇 Creating IATA lookup index...');

    const index = {};

    for (const [icao, airport] of Object.entries(airports)) {
        const iata = airport.iata;
        if (!index[iata]) {
            index[iata] = [];
        }
        index[iata].push(icao);
    }

    console.log(`  ✅ Indexed ${Object.keys(index).length} IATA codes`);

    return index;
}

/**
 * Save airports to JSON
 */
function saveAirports(airports, iataIndex) {
    console.log(`\n💾 Saving to: ${path.relative(BASE_DIR, OUTPUT_FILE)}`);

    // Create output directory if needed
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const output = {
        version: '1.0.0',
        generated_at: new Date().toISOString().split('T')[0],
        source: 'mwgg/Airports (filtered to IATA-only commercial)',
        total_airports: Object.keys(airports).length,
        total_iata_codes: Object.keys(iataIndex).length,
        airports: airports,
        iata_index: iataIndex
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`  ✅ Saved ${Object.keys(airports).length} airports`);
    console.log(`  💾 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    return stats.size;
}

/**
 * Print sample airports
 */
function printSamples(airports) {
    console.log('\n📋 Sample airports:');

    const samples = [
        'LHR', // London Heathrow
        'JFK', // New York JFK
        'CDG', // Paris Charles de Gaulle
        'NRT', // Tokyo Narita
        'SYD'  // Sydney
    ];

    for (const iata of samples) {
        // Find airport by IATA
        const airport = Object.values(airports).find(a => a.iata === iata);
        if (airport) {
            console.log(`  ${airport.iata} (${airport.icao}): ${airport.name} - ${airport.city}, ${airport.country}`);
        }
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Load airports
        const allAirports = loadAirports();

        // Filter to commercial IATA-only
        const filtered = filterAirports(allAirports);

        // Create IATA index
        const iataIndex = createIATAIndex(filtered);

        // Save output
        const size = saveAirports(filtered, iataIndex);

        // Print samples
        printSamples(filtered);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Airport Database Complete!');
        console.log('='.repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`   Filtered: ${Object.keys(filtered).length} commercial airports`);
        console.log(`   IATA codes: ${Object.keys(iataIndex).length}`);
        console.log(`   File size: ${(size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Reduction: ${((1 - size / fs.statSync(AIRPORTS_FILE).size) * 100).toFixed(1)}% smaller`);
        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run
if (require.main === module) {
    main();
}

module.exports = { loadAirports, filterAirports, createIATAIndex, saveAirports };
