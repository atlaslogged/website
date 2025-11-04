#!/usr/bin/env node

/**
 * Process Natural Earth Boundaries
 *
 * Converts shapefiles to GeoJSON format for offline geocoding:
 * - Countries (50m scale)
 * - Sovereignty (50m scale)
 * - States/Provinces (10m scale for UK regions, US states, etc.)
 *
 * Output: GeoJSON files ready for iOS bundle
 */

const fs = require('fs');
const path = require('path');
const shapefile = require('shapefile');

const BASE_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const NATURAL_EARTH_DIR = path.join(DATA_DIR, 'natural_earth');
const OUTPUT_DIR = path.join(BASE_DIR, 'resources');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('\n' + '='.repeat(60));
console.log('Natural Earth Boundary Processor');
console.log('='.repeat(60));

/**
 * Convert shapefile to GeoJSON
 */
async function convertShapefile(shpPath, outputPath, options = {}) {
    console.log(`\n📂 Processing: ${path.basename(shpPath)}`);

    try {
        const features = [];

        // Open shapefile
        const source = await shapefile.open(shpPath);

        // Read all features
        let result = await source.read();
        let count = 0;

        while (!result.done) {
            const feature = result.value;

            // Apply filters if specified
            if (options.filter && !options.filter(feature)) {
                result = await source.read();
                continue;
            }

            // Transform properties if specified
            if (options.transform) {
                feature.properties = options.transform(feature.properties);
            }

            features.push(feature);
            count++;

            result = await source.read();
        }

        // Create GeoJSON FeatureCollection
        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        // Write to file
        fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

        const stats = fs.statSync(outputPath);
        console.log(`  ✅ Converted ${count} features`);
        console.log(`  💾 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        return { count, size: stats.size };

    } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        throw error;
    }
}

/**
 * Process countries shapefile
 */
async function processCountries() {
    console.log('\n📍 Processing Countries (50m scale)');

    const shpPath = path.join(NATURAL_EARTH_DIR, 'ne_50m_admin_0_countries.shp');
    const outputPath = path.join(OUTPUT_DIR, 'countries_50m.geojson');

    return await convertShapefile(shpPath, outputPath, {
        transform: (props) => ({
            // Keep only essential properties to reduce file size
            iso_a2: props.ISO_A2 || props.ADM0_A3,
            iso_a3: props.ISO_A3 || props.ADM0_A3,
            name: props.NAME || props.ADMIN,
            name_long: props.NAME_LONG || props.FORMAL_EN,
            continent: props.CONTINENT,
            region_un: props.REGION_UN,
            subregion: props.SUBREGION,
            population: props.POP_EST,
            gdp: props.GDP_MD_EST
        })
    });
}

/**
 * Process sovereignty shapefile (for grouping territories)
 */
async function processSovereignty() {
    console.log('\n📍 Processing Sovereignty (50m scale)');

    const shpPath = path.join(NATURAL_EARTH_DIR, 'ne_50m_admin_0_sovereignty.shp');
    const outputPath = path.join(OUTPUT_DIR, 'sovereignty_50m.geojson');

    return await convertShapefile(shpPath, outputPath, {
        transform: (props) => ({
            sov_a3: props.SOV_A3,
            sovereignt: props.SOVEREIGNT,
            iso_a2: props.ISO_A2,
            iso_a3: props.ISO_A3,
            name: props.NAME,
            admin: props.ADMIN,
            type: props.TYPE
        })
    });
}

/**
 * Process states/provinces (for UK regions, US states, etc.)
 */
async function processRegions() {
    console.log('\n📍 Processing States/Provinces (10m scale)');

    const shpPath = path.join(NATURAL_EARTH_DIR, 'ne_10m_admin_1_states_provinces.shp');
    const outputPath = path.join(OUTPUT_DIR, 'regions_10m.geojson');

    // Countries we care about for regional breakdown
    const REGION_COUNTRIES = ['GB', 'US', 'ES', 'CN', 'FR', 'CA', 'AU'];

    return await convertShapefile(shpPath, outputPath, {
        filter: (feature) => {
            const iso = feature.properties.iso_a2;
            return REGION_COUNTRIES.includes(iso);
        },
        transform: (props) => ({
            iso_a2: props.iso_a2,
            iso_3166_2: props.iso_3166_2,
            name: props.name,
            name_local: props.name_local,
            type: props.type,
            region: props.region,
            region_cod: props.region_cod
        })
    });
}

/**
 * Main execution
 */
async function main() {
    try {
        // Check if Natural Earth data exists
        if (!fs.existsSync(NATURAL_EARTH_DIR)) {
            console.error('\n❌ Natural Earth data not found!');
            console.error('   Run: ./scripts/01_download_data.sh');
            process.exit(1);
        }

        const results = {};

        // Process all datasets
        results.countries = await processCountries();
        results.sovereignty = await processSovereignty();
        results.regions = await processRegions();

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Processing Complete!');
        console.log('='.repeat(60));

        const totalSize = Object.values(results).reduce((sum, r) => sum + r.size, 0);
        const totalFeatures = Object.values(results).reduce((sum, r) => sum + r.count, 0);

        console.log(`\n📊 Summary:`);
        console.log(`   Total features: ${totalFeatures}`);
        console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
        console.log(`   - countries_50m.geojson (${results.countries.count} countries)`);
        console.log(`   - sovereignty_50m.geojson (${results.sovereignty.count} entities)`);
        console.log(`   - regions_10m.geojson (${results.regions.count} regions)`);

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

module.exports = { convertShapefile, processCountries, processSovereignty, processRegions };
