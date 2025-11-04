#!/usr/bin/env node

/**
 * Generate Regional Flags Mapping
 *
 * Creates JSON file with Unicode sequences for regional flags
 * Based on ISO 3166-2 subdivision codes
 *
 * Examples:
 * - Wales: GB-WLS → 🏴󠁧󠁢󠁷󠁬󠁳󠁿
 * - Scotland: GB-SCT → 🏴󠁧󠁢󠁳󠁣󠁴󠁿
 * - England: GB-ENG → 🏴󠁧󠁢󠁥󠁮󠁧󠁿
 * - California: US-CA → (fallback to 🇺🇸)
 *
 * Output: regional_flags.json
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(BASE_DIR, 'resources');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'regional_flags.json');

console.log('\n' + '='.repeat(60));
console.log('Regional Flags Generator');
console.log('='.repeat(60));

/**
 * Generate Unicode regional flag sequence
 * Based on: https://en.wikipedia.org/wiki/Regional_indicator_symbol
 */
function generateRegionalFlag(countryCode, subdivisionCode) {
    // Black flag base
    const BLACK_FLAG = '\u{1F3F4}';
    const TAG_END = '\u{E0000}' + '\u{E007F}';

    // Convert codes to tag characters
    const tagChars = (countryCode + subdivisionCode).toLowerCase().split('').map(char => {
        return String.fromCodePoint(0xE0000 + char.charCodeAt(0));
    }).join('');

    return BLACK_FLAG + tagChars + TAG_END;
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
 * Regional flag definitions
 */
const REGIONAL_FLAGS = {
    // United Kingdom (all have official flags)
    'GB': {
        name: 'United Kingdom',
        flag: '🇬🇧',
        regions: {
            'ENG': { name: 'England', code: 'GB-ENG', flag: 'regional', supported: true },
            'SCT': { name: 'Scotland', code: 'GB-SCT', flag: 'regional', supported: true },
            'WLS': { name: 'Wales', code: 'GB-WLS', flag: 'regional', supported: true },
            'NIR': { name: 'Northern Ireland', code: 'GB-NIR', flag: 'fallback' } // Uses UK flag
        }
    },

    // United States (use state flags for major states)
    'US': {
        name: 'United States',
        flag: '🇺🇸',
        regions: {
            'CA': { name: 'California', code: 'US-CA', flag: 'fallback' },
            'TX': { name: 'Texas', code: 'US-TX', flag: 'regional', supported: true },
            'NY': { name: 'New York', code: 'US-NY', flag: 'fallback' },
            'FL': { name: 'Florida', code: 'US-FL', flag: 'fallback' },
            'IL': { name: 'Illinois', code: 'US-IL', flag: 'fallback' },
            'PA': { name: 'Pennsylvania', code: 'US-PA', flag: 'fallback' },
            'OH': { name: 'Ohio', code: 'US-OH', flag: 'fallback' }
        }
    },

    // Spain (autonomous communities)
    'ES': {
        name: 'Spain',
        flag: '🇪🇸',
        regions: {
            'CT': { name: 'Catalonia', code: 'ES-CT', flag: 'regional', supported: true },
            'GA': { name: 'Galicia', code: 'ES-GA', flag: 'regional', supported: true },
            'PV': { name: 'Basque Country', code: 'ES-PV', flag: 'fallback' },
            'AN': { name: 'Andalusia', code: 'ES-AN', flag: 'fallback' }
        }
    },

    // Canada (provinces)
    'CA': {
        name: 'Canada',
        flag: '🇨🇦',
        regions: {
            'ON': { name: 'Ontario', code: 'CA-ON', flag: 'fallback' },
            'QC': { name: 'Quebec', code: 'CA-QC', flag: 'fallback' },
            'BC': { name: 'British Columbia', code: 'CA-BC', flag: 'fallback' },
            'AB': { name: 'Alberta', code: 'CA-AB', flag: 'fallback' }
        }
    },

    // Australia (states)
    'AU': {
        name: 'Australia',
        flag: '🇦🇺',
        regions: {
            'NSW': { name: 'New South Wales', code: 'AU-NSW', flag: 'fallback' },
            'VIC': { name: 'Victoria', code: 'AU-VIC', flag: 'fallback' },
            'QLD': { name: 'Queensland', code: 'AU-QLD', flag: 'fallback' },
            'WA': { name: 'Western Australia', code: 'AU-WA', flag: 'fallback' }
        }
    },

    // China (special administrative regions)
    'CN': {
        name: 'China',
        flag: '🇨🇳',
        regions: {
            'HK': { name: 'Hong Kong', code: 'HK', flag: 'national', isoCode: 'HK' }, // Has own ISO code
            'MO': { name: 'Macau', code: 'MO', flag: 'national', isoCode: 'MO' } // Has own ISO code
        }
    },

    // France (overseas territories)
    'FR': {
        name: 'France',
        flag: '🇫🇷',
        regions: {
            'BRE': { name: 'Brittany', code: 'FR-BRE', flag: 'regional', supported: true },
            'COR': { name: 'Corsica', code: 'FR-COR', flag: 'fallback' }
        }
    }
};

/**
 * Build complete regional flags database
 */
function buildRegionalFlags() {
    console.log('\n🏴 Generating regional flag sequences...');

    const output = {
        version: '1.0.0',
        generated_at: new Date().toISOString().split('T')[0],
        description: 'Regional flag emoji mappings for subdivisions',
        note: 'Regional flags (🏴) require Unicode 15.1+ support. Fallback to national flag if not supported.',
        countries: {}
    };

    let regionalCount = 0;
    let fallbackCount = 0;
    let nationalCount = 0;

    for (const [countryCode, country] of Object.entries(REGIONAL_FLAGS)) {
        output.countries[countryCode] = {
            name: country.name,
            flag: country.flag,
            regions: {}
        };

        for (const [regionCode, region] of Object.entries(country.regions)) {
            let flag, unicodeSequence, fallbackFlag;

            if (region.flag === 'regional' && region.supported) {
                // Generate regional flag
                flag = generateRegionalFlag(countryCode, regionCode);
                unicodeSequence = Array.from(flag).map(c =>
                    '\\u{' + c.codePointAt(0).toString(16).toUpperCase() + '}'
                ).join('');
                fallbackFlag = country.flag;
                regionalCount++;

            } else if (region.flag === 'national' && region.isoCode) {
                // Use national flag (for HK, MO)
                flag = getNationalFlag(region.isoCode);
                unicodeSequence = null;
                fallbackFlag = null;
                nationalCount++;

            } else {
                // Fallback to national flag
                flag = country.flag;
                unicodeSequence = null;
                fallbackFlag = null;
                fallbackCount++;
            }

            output.countries[countryCode].regions[regionCode] = {
                name: region.name,
                code: region.code,
                flag: flag,
                unicode_sequence: unicodeSequence,
                fallback_flag: fallbackFlag,
                type: region.flag
            };
        }
    }

    console.log(`  ✅ Generated ${regionalCount} regional flags`);
    console.log(`  ✅ Generated ${nationalCount} national flags`);
    console.log(`  ✅ Generated ${fallbackCount} fallback flags`);

    return output;
}

/**
 * Save to JSON
 */
function saveRegionalFlags(data) {
    console.log(`\n💾 Saving to: ${path.relative(BASE_DIR, OUTPUT_FILE)}`);

    // Create output directory if needed
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`  ✅ Saved regional flags database`);
    console.log(`  💾 Size: ${(stats.size / 1024).toFixed(2)} KB`);
}

/**
 * Print samples
 */
function printSamples(data) {
    console.log('\n📋 Sample regional flags:');

    const samples = [
        ['GB', 'ENG', 'England'],
        ['GB', 'SCT', 'Scotland'],
        ['GB', 'WLS', 'Wales'],
        ['US', 'TX', 'Texas'],
        ['ES', 'CT', 'Catalonia'],
        ['CN', 'HK', 'Hong Kong']
    ];

    for (const [country, region, name] of samples) {
        if (data.countries[country] && data.countries[country].regions[region]) {
            const r = data.countries[country].regions[region];
            console.log(`  ${r.flag} ${name} (${r.code}) - ${r.type}`);
        }
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Build regional flags
        const data = buildRegionalFlags();

        // Save output
        saveRegionalFlags(data);

        // Print samples
        printSamples(data);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Regional Flags Complete!');
        console.log('='.repeat(60));

        const totalRegions = Object.values(data.countries).reduce(
            (sum, c) => sum + Object.keys(c.regions).length, 0
        );

        console.log(`\n📊 Summary:`);
        console.log(`   Countries with regions: ${Object.keys(data.countries).length}`);
        console.log(`   Total regions: ${totalRegions}`);
        console.log(`\n💡 Usage:`);
        console.log(`   - Regional flags require Unicode 15.1+`);
        console.log(`   - Always provide fallback to national flag`);
        console.log(`   - Test on iOS simulator before deployment`);
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

module.exports = { generateRegionalFlag, getNationalFlag, buildRegionalFlags };
