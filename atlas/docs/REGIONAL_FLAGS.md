# Regional Flag Emojis - Complete Guide

**Last Updated:** October 30, 2025
**Purpose:** Document how to handle flag emojis for countries AND sub-regions

---

## Overview

While country flags are straightforward (🇬🇧 🇺🇸 🇫🇷), sub-regional flags like Wales (🏴󠁧󠁢󠁷󠁬󠁳󠁿) and Scotland (🏴󠁧󠁢󠁳󠁣󠁴󠁿) use special Unicode sequences.

**Challenge:** Not all regions have official Unicode flag emojis.

**Solution:** Use a combination of:
1. Unicode regional flags (where available)
2. Fallback to national flags
3. Custom flag mapping table

---

## How Regional Flags Work (Unicode)

### Standard Country Flags
Country flags use **Regional Indicator Symbols** (U+1F1E6 - U+1F1FF):

```
🇬🇧 = U+1F1EC (G) + U+1F1E7 (B)
🇺🇸 = U+1F1FA (U) + U+1F1F8 (S)
🇫🇷 = U+1F1EB (F) + U+1F1F7 (R)
```

### Regional Flags (Subdivision Flags)
Regional flags use **Tag Sequences** with base black flag (🏴):

```
Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿 =
  🏴 (U+1F3F4)
  + TAG LATIN SMALL LETTER G (U+E0067)
  + TAG LATIN SMALL LETTER B (U+E0062)
  + TAG LATIN SMALL LETTER W (U+E0077)
  + TAG LATIN SMALL LETTER L (U+E006C)
  + TAG LATIN SMALL LETTER S (U+E0073)
  + CANCEL TAG (U+E007F)

Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿 =
  🏴 (U+1F3F4)
  + gbsct (tag sequence)
  + CANCEL TAG
```

**Pattern:** `🏴 + country_code + region_code + cancel`

---

## Supported Regional Flags (Unicode 15.1)

### United Kingdom (GB)
| Region | Code | Flag | Unicode Support |
|--------|------|------|-----------------|
| England | GB-ENG | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | ✅ Full support |
| Scotland | GB-SCT | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 | ✅ Full support |
| Wales | GB-WLS | 🏴󠁧󠁢󠁷󠁬󠁳󠁿 | ✅ Full support |
| Northern Ireland | GB-NIR | (none) | ❌ No Unicode flag |

**Northern Ireland:** Uses 🇬🇧 (UK flag) or custom image

### United States (US)
| Region | Code | Flag | Unicode Support |
|--------|------|------|-----------------|
| Texas | US-TX | 🏴󠁵󠁳󠁴󠁸󠁿 | ✅ Full support |
| California | US-CA | 🏴󠁵󠁳󠁣󠁡󠁿 | ✅ Full support |
| Alaska | US-AK | 🏴󠁵󠁳󠁡󠁫󠁿 | ✅ Full support |
| Hawaii | US-HI | 🏴󠁵󠁳󠁨󠁩󠁿 | ✅ Full support |
| *All 50 states* | US-* | 🏴󠁵󠁳󠁸󠁸󠁿 | ✅ Full support |

### Spain (ES)
| Region | Code | Flag | Unicode Support |
|--------|------|------|-----------------|
| Catalonia | ES-CT | 🏴 (unofficial) | ❌ No Unicode flag |
| Basque Country | ES-PV | 🏴 (unofficial) | ❌ No Unicode flag |
| Galicia | ES-GA | 🏴 (unofficial) | ❌ No Unicode flag |
| Andalusia | ES-AN | 🏴 (unofficial) | ❌ No Unicode flag |

**Spain:** Regional flags exist but not in Unicode standard (political sensitivity)

### Other Notable Regions
| Region | Code | Flag | Unicode Support |
|--------|------|------|-----------------|
| Hong Kong | HK | 🇭🇰 | ✅ Country flag (SAR) |
| Macau | MO | 🇲🇴 | ✅ Country flag (SAR) |
| Puerto Rico | PR | 🇵🇷 | ✅ Country flag (territory) |
| Greenland | GL | 🇬🇱 | ✅ Country flag (territory) |
| Corsica | FR-20R | (none) | ❌ No Unicode flag |
| Sicily | IT-82 | (none) | ❌ No Unicode flag |
| Sardinia | IT-88 | (none) | ❌ No Unicode flag |

---

## Implementation Strategy

### Tier 1: Use Unicode Regional Flags
For regions with official Unicode support:

```swift
struct RegionalFlag {
    static let england = "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
    static let scotland = "🏴󠁧󠁢󠁳󠁣󠁴󠁿"
    static let wales = "🏴󠁧󠁢󠁷󠁬󠁳󠁿"
    static let texas = "🏴󠁵󠁳󠁴󠁸󠁿"
    // ... etc
}
```

### Tier 2: Fallback to National Flag
For regions without Unicode flags:

```swift
// Northern Ireland → UK flag
"GB-NIR": "🇬🇧"

// Catalonia → Spain flag
"ES-CT": "🇪🇸"
```

### Tier 3: Custom Flag Images (Future)
For important regions needing distinct flags:

```swift
// Use SF Symbol or custom image
"ES-CT": UIImage(named: "flag_catalonia")
```

---

## Flag Mapping Table

### JSON Structure

```json
{
  "version": "1.0.0",
  "flags": {
    "GB": {
      "flag": "🇬🇧",
      "type": "country",
      "regions": {
        "GB-ENG": {
          "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          "type": "unicode_regional",
          "name": "England"
        },
        "GB-SCT": {
          "flag": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
          "type": "unicode_regional",
          "name": "Scotland"
        },
        "GB-WLS": {
          "flag": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
          "type": "unicode_regional",
          "name": "Wales"
        },
        "GB-NIR": {
          "flag": "🇬🇧",
          "type": "fallback_national",
          "name": "Northern Ireland",
          "note": "No official Unicode flag"
        }
      }
    },
    "ES": {
      "flag": "🇪🇸",
      "type": "country",
      "regions": {
        "ES-CT": {
          "flag": "🇪🇸",
          "type": "fallback_national",
          "name": "Catalonia",
          "note": "Regional flag exists but not in Unicode"
        },
        "ES-PV": {
          "flag": "🇪🇸",
          "type": "fallback_national",
          "name": "Basque Country"
        }
      }
    }
  }
}
```

---

## Swift Implementation

### Helper Function to Generate Regional Flags

```swift
extension String {
    /// Generate regional flag emoji from ISO 3166-2 code
    /// Examples: "GB-WLS" → "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "US-CA" → "🏴󠁵󠁳󠁣󠁡󠁿"
    func regionalFlag() -> String? {
        let components = self.split(separator: "-")
        guard components.count == 2 else { return nil }

        let country = String(components[0]).lowercased()
        let region = String(components[1]).lowercased()

        // Build tag sequence
        var scalars: [UnicodeScalar] = [UnicodeScalar(0x1F3F4)!] // Black flag

        // Add country code tags
        for char in country {
            guard let scalar = UnicodeScalar(0xE0000 + char.unicodeScalars.first!.value) else {
                return nil
            }
            scalars.append(scalar)
        }

        // Add region code tags
        for char in region {
            guard let scalar = UnicodeScalar(0xE0000 + char.unicodeScalars.first!.value) else {
                return nil
            }
            scalars.append(scalar)
        }

        // Add cancel tag
        scalars.append(UnicodeScalar(0xE007F)!)

        return String(String.UnicodeScalarView(scalars))
    }
}

// Usage:
"GB-WLS".regionalFlag()  // "🏴󠁧󠁢󠁷󠁬󠁳󠁿"
"US-TX".regionalFlag()   // "🏴󠁵󠁳󠁴󠁸󠁿"
```

### Flag Resolver with Fallback

```swift
struct FlagResolver {
    private static let regionalFlags: [String: String] = [
        // UK
        "GB-ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "GB-SCT": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "GB-WLS": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
        "GB-NIR": "🇬🇧",  // Fallback

        // US States (all 50)
        "US-CA": "🏴󠁵󠁳󠁣󠁡󠁿",
        "US-TX": "🏴󠁵󠁳󠁴󠁸󠁿",
        // ... etc
    ]

    static func flag(for code: String) -> String {
        // Check regional mapping first
        if let regional = regionalFlags[code] {
            return regional
        }

        // Try to generate from code
        if code.contains("-"), let generated = code.regionalFlag() {
            return generated
        }

        // Fallback to country flag
        let countryCode = code.split(separator: "-").first.map(String.init) ?? code
        return countryFlag(for: countryCode)
    }

    private static func countryFlag(for code: String) -> String {
        guard code.count == 2 else { return "🏳️" }

        let base: UInt32 = 127397
        var flag = ""

        for scalar in code.uppercased().unicodeScalars {
            if let flagScalar = UnicodeScalar(base + scalar.value) {
                flag.append(String(flagScalar))
            }
        }

        return flag.isEmpty ? "🏳️" : flag
    }
}

// Usage:
FlagResolver.flag(for: "GB")        // "🇬🇧"
FlagResolver.flag(for: "GB-WLS")    // "🏴󠁧󠁢󠁷󠁬󠁳󠁿"
FlagResolver.flag(for: "ES-CT")     // "🇪🇸" (fallback)
```

---

## Complete Regional Flag List for Atlas Logged

### Priority Regions (Tier 1 - Include First)

**United Kingdom:**
```json
{
  "GB-ENG": {"name": "England", "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "unicode": true},
  "GB-SCT": {"name": "Scotland", "flag": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "unicode": true},
  "GB-WLS": {"name": "Wales", "flag": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "unicode": true},
  "GB-NIR": {"name": "Northern Ireland", "flag": "🇬🇧", "unicode": false}
}
```

**Spain (Autonomous Communities):**
```json
{
  "ES-CT": {"name": "Catalonia", "flag": "🇪🇸", "unicode": false},
  "ES-PV": {"name": "Basque Country", "flag": "🇪🇸", "unicode": false},
  "ES-GA": {"name": "Galicia", "flag": "🇪🇸", "unicode": false},
  "ES-AN": {"name": "Andalusia", "flag": "🇪🇸", "unicode": false}
}
```

**Special Administrative Regions:**
```json
{
  "HK": {"name": "Hong Kong", "flag": "🇭🇰", "unicode": true},
  "MO": {"name": "Macau", "flag": "🇲🇴", "unicode": true}
}
```

---

## Device Support Matrix

| Device/OS | Regional Flags | Notes |
|-----------|----------------|-------|
| **iOS 17+** | ✅ Full support | All Unicode 15.1 flags render |
| **macOS 14+** | ✅ Full support | Sonoma and later |
| **iOS 16** | ⚠️ Partial | Some regional flags may show as squares |
| **Android 13+** | ✅ Most supported | Depends on OEM font |
| **Windows 11** | ⚠️ Limited | Few regional flags render |
| **Web Browsers** | ⚠️ Varies | Chrome/Safari best support |

**Recommendation:** Always include fallback for unsupported devices

---

## Testing Regional Flags

### Test Cases

```swift
func testRegionalFlags() {
    // Test UK regions
    XCTAssertEqual(FlagResolver.flag(for: "GB-WLS"), "🏴󠁧󠁢󠁷󠁬󠁳󠁿")
    XCTAssertEqual(FlagResolver.flag(for: "GB-SCT"), "🏴󠁧󠁢󠁳󠁣󠁴󠁿")
    XCTAssertEqual(FlagResolver.flag(for: "GB-ENG"), "🏴󠁧󠁢󠁥󠁮󠁧󠁿")

    // Test fallbacks
    XCTAssertEqual(FlagResolver.flag(for: "GB-NIR"), "🇬🇧")
    XCTAssertEqual(FlagResolver.flag(for: "ES-CT"), "🇪🇸")

    // Test country flags still work
    XCTAssertEqual(FlagResolver.flag(for: "GB"), "🇬🇧")
    XCTAssertEqual(FlagResolver.flag(for: "US"), "🇺🇸")
}
```

### Visual Testing
Create a test view to render all flags:

```swift
struct FlagTestView: View {
    let regions = ["GB", "GB-ENG", "GB-SCT", "GB-WLS", "GB-NIR"]

    var body: some View {
        List(regions, id: \.self) { code in
            HStack {
                Text(FlagResolver.flag(for: code))
                    .font(.largeTitle)
                Text(code)
            }
        }
    }
}
```

---

## Data Files to Create

### 1. `resources/regional_flags.json`

Complete mapping of all regions to flags:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-30",
  "flags": {
    "GB-ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "GB-SCT": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "GB-WLS": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "GB-NIR": "🇬🇧",
    "ES-CT": "🇪🇸",
    "ES-PV": "🇪🇸"
  },
  "metadata": {
    "GB-ENG": {"unicode": true, "type": "regional"},
    "GB-SCT": {"unicode": true, "type": "regional"},
    "GB-WLS": {"unicode": true, "type": "regional"},
    "GB-NIR": {"unicode": false, "type": "fallback"},
    "ES-CT": {"unicode": false, "type": "fallback"}
  }
}
```

---

## Processing Script Addition

Add to `05_build_unified_db.js`:

```javascript
// Generate regional flags
function generateRegionalFlags() {
    const regionalFlags = {};

    // UK regions
    regionalFlags['GB-ENG'] = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    regionalFlags['GB-SCT'] = '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
    regionalFlags['GB-WLS'] = '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
    regionalFlags['GB-NIR'] = '🇬🇧'; // Fallback

    // Spanish regions (fallback to ES flag)
    regionalFlags['ES-CT'] = '🇪🇸';
    regionalFlags['ES-PV'] = '🇪🇸';
    regionalFlags['ES-GA'] = '🇪🇸';

    return regionalFlags;
}
```

---

## Future Enhancements

### Custom Flag Images
For regions without Unicode support but with distinct identity:

1. **Vector flags** (SF Symbols style)
2. **PNG fallbacks** for older devices
3. **User preference** (Unicode vs. images)

### Dynamic Flag Loading
- Bundle common flags
- Download rare flags on demand
- Cache in local storage

---

## Checklist

### Implementation
- [ ] Create `regional_flags.json` mapping
- [ ] Implement `FlagResolver` utility
- [ ] Add UK regional flags (GB-ENG, GB-SCT, GB-WLS, GB-NIR)
- [ ] Add Spanish regional flags (fallback to ES)
- [ ] Add flag generation helper function
- [ ] Test on iOS 17+ devices
- [ ] Test fallback on older devices

### Data Integration
- [ ] Include flag data in `countries_v2.json`
- [ ] Add flag field to `GeoEntity` model
- [ ] Update processing scripts to include flags
- [ ] Validate all flag emojis render correctly

---

**Summary:** We'll use Unicode regional flags where available (UK regions, US states) and fall back to national flags for regions without Unicode support (Spain, Italy). All mappings will be in `regional_flags.json` for easy maintenance.

**Next:** Add flag mapping generation to processing scripts.
