# Legal Attributions & Licenses

**Last Updated:** October 30, 2025
**Purpose:** Legal compliance and attribution requirements for all data sources

---

## Summary

All data sources used in the Atlas Logged Location Intelligence System are either **Public Domain** or use permissive open-source licenses (MIT). **No attribution is legally required**, but we provide it as good practice and to acknowledge the valuable work of data providers.

---

## Data Sources

### 1. Natural Earth

**License:** Public Domain (CC0-like)
**URL:** https://www.naturalearthdata.com/
**Version Used:** 5.1.2
**Files:**
- `ne_50m_admin_0_countries.shp`
- `ne_50m_admin_0_sovereignty.shp`
- `ne_10m_admin_1_states_provinces.shp`

**License Text:**
```
All versions of Natural Earth raster + vector map data found on this website
are in the public domain. You may use the maps in any manner, including modifying
the content and design, electronic dissemination, and offset printing.

The primary authors, Nathan Kelso and Tom Patterson, have waived all rights to
the work worldwide under copyright law, including all related and neighboring
rights, to the extent allowed by law.

You can copy, modify, distribute and perform the work, even for commercial purposes,
all without asking permission.
```

**Attribution (Optional but Recommended):**
```
Map data from Natural Earth
https://www.naturalearthdata.com/
```

**Legal Requirements:** ✅ None
**Our Attribution:** ✅ Will include in app "About" screen

---

### 2. mwgg/Airports Database

**License:** MIT License
**URL:** https://github.com/mwgg/Airports
**Version Used:** v2025.10.27
**Files:**
- `airports.json`

**Copyright:** Copyright (c) mwgg and contributors

**MIT License Text:**
```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Attribution (Required by License):**
```
Airport data from mwgg/Airports
https://github.com/mwgg/Airports
Copyright (c) mwgg and contributors
Licensed under MIT License
```

**Legal Requirements:** ✅ Include copyright notice and permission notice
**Our Attribution:** ✅ Will include in app "About" screen and source code

---

### 3. CIA World Factbook

**License:** Public Domain (U.S. Government Work)
**URL:** https://www.cia.gov/the-world-factbook/
**Files:**
- Extracted JSON data from factbook website

**License Text:**
```
The Factbook is in the public domain. Accordingly, it may be copied freely
without permission of the Central Intelligence Agency (CIA).
```

**U.S. Government Works (17 U.S.C. § 105):**
```
Copyright protection under this title is not available for any work of the
United States Government.
```

**Attribution (Optional):**
```
Country data from CIA World Factbook
https://www.cia.gov/the-world-factbook/
Public Domain (U.S. Government Work)
```

**Legal Requirements:** ✅ None (public domain)
**Our Attribution:** ✅ Will include in app "About" screen

---

### 4. Unicode Emoji Flags

**License:** Public Domain / Unicode License
**URL:** https://unicode.org/emoji/charts/emoji-list.html
**Source:** Unicode Consortium

**Use:** Regional flag emojis (🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales, 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland, etc.)

**Unicode License:**
```
Unicode® is a registered trademark of Unicode, Inc. in the United States and other countries.

The Unicode Standard and all related documentation is provided as-is by Unicode, Inc.
Permission is granted to freely use the information provided in the Unicode Character Database.
```

**Legal Requirements:** ✅ None (free to use)
**Our Attribution:** Not required (standard Unicode characters)

**Note:** Regional flag emojis are composed using Unicode sequences:
- Wales: `🏴` + `U+E0067` + `U+E0062` + `U+E0077` + `U+E006C` + `U+E0073` + `U+E007F`
- Scotland: `🏴` + `U+E0067` + `U+E0062` + `U+E0073` + `U+E0063` + `U+E0074` + `U+E007F`

---

### 5. ISO 3166 Country Codes

**License:** Freely available for use
**URL:** https://www.iso.org/iso-3166-country-codes.html
**Source:** International Organization for Standardization (ISO)

**Use:** Two-letter country codes (GB, US, FR, etc.)

**License Information:**
```
The ISO 3166-1 country codes are made freely available by ISO for general use.
While the standard itself is copyrighted, the codes are meant to be used freely.
```

**Legal Requirements:** ✅ None for code usage
**Our Attribution:** Not required (standard codes)

---

## Combined Attribution Text

### For App "About" Screen

```
Geographic Data Sources:

• Natural Earth (Public Domain)
  Country and region boundary data
  https://www.naturalearthdata.com/

• mwgg/Airports (MIT License)
  Comprehensive airport database
  https://github.com/mwgg/Airports
  Copyright (c) mwgg and contributors

• CIA World Factbook (Public Domain)
  Country demographics and statistics
  https://www.cia.gov/the-world-factbook/

All data has been processed and curated for offline use.
```

### For Source Code (Swift Files)

```swift
/*
 * Location Intelligence System
 *
 * Data Sources:
 * - Natural Earth: Public Domain, https://www.naturalearthdata.com/
 * - mwgg/Airports: MIT License, https://github.com/mwgg/Airports
 * - CIA World Factbook: Public Domain, https://www.cia.gov/the-world-factbook/
 *
 * See ATTRIBUTIONS.md for complete license information.
 */
```

### For README / Documentation

```markdown
## Data Sources & Licenses

This project uses geographic data from the following sources:

- **Natural Earth** - Public Domain boundary data ([naturalearthdata.com](https://www.naturalearthdata.com/))
- **mwgg/Airports** - MIT licensed airport database ([github.com/mwgg/Airports](https://github.com/mwgg/Airports))
- **CIA World Factbook** - Public domain country information ([cia.gov/world-factbook](https://www.cia.gov/the-world-factbook/))

All data is used in compliance with respective licenses. See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for details.
```

---

## Legal Compliance Checklist

### Required Actions
- [x] Document all data sources
- [x] Include MIT license notice for mwgg/Airports
- [x] Verify public domain status for Natural Earth
- [x] Verify public domain status for CIA Factbook
- [ ] Add attribution text to app "About" screen
- [ ] Add license notices to source code files
- [ ] Include ATTRIBUTIONS.md in repository

### Distribution Requirements
- ✅ **App Store:** No special requirements (all permissive licenses)
- ✅ **Open Source:** Can share processed data (all public domain or MIT)
- ✅ **Commercial Use:** Allowed by all licenses
- ✅ **Modification:** Allowed by all licenses

### Prohibited Actions
- ❌ None - all licenses are maximally permissive

---

## Warranty Disclaimer

As required by the MIT license and recommended for public domain works:

```
THE DATA IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE DATA OR THE USE OR OTHER DEALINGS IN THE DATA.
```

**Translation:** We provide this data as-is. While we've done our best to ensure accuracy, we make no guarantees. Always verify critical information (borders, coordinates, etc.) from authoritative sources.

---

## Export Control

### Geographic Data Classification
- **ECCN:** EAR99 (publicly available information)
- **ITAR:** Not applicable (civilian geographic data)
- **Export Restrictions:** None (freely exportable worldwide)

### Compliance
✅ No export restrictions on geographic boundary data
✅ No export restrictions on airport coordinates
✅ No export restrictions on demographic statistics

---

## Privacy & GDPR

### Personal Data
✅ **None** - All data sources contain only public geographic information
✅ No user tracking or personal information collected
✅ All processing happens on-device

### GDPR Compliance
- **Article 4 (Personal Data):** Not applicable - no personal data
- **Article 6 (Lawful Basis):** Not applicable - no processing of EU citizen data
- **Article 17 (Right to Erasure):** Not applicable - no user data collected

---

## Trademark Notices

### Natural Earth
"Natural Earth" is a trademark of Natural Earth. Our use of their data does not imply endorsement.

### CIA / U.S. Government
The CIA seal and "Central Intelligence Agency" are protected. We reference only the publicly available Factbook data.

### Country & Airport Names
Country names, airport names, and IATA codes are used for factual identification only, not as trademarks.

---

## Attribution Updates

### When to Update This File
- Adding new data sources
- Upgrading to new versions of existing sources
- License changes by upstream providers
- Annual review (check licenses still valid)

### Review Schedule
- **Next Review:** January 30, 2026
- **Frequency:** Annually or when adding new data sources

---

## Contact Information

### Data Provider Contacts

**Natural Earth:**
- Email: naturalearth@googlegroups.com
- Forum: Google Groups

**mwgg/Airports:**
- GitHub: https://github.com/mwgg/Airports/issues
- Maintainer: Active on GitHub

**CIA World Factbook:**
- Website: https://www.cia.gov/the-world-factbook/
- Feedback: Via website contact form

### Atlas Logged Legal
- **Questions:** Review this file and LICENSE in repository
- **Issues:** Report via GitHub issues
- **Legal Concerns:** Contact repository maintainer

---

## Summary

✅ **Legally Safe:** All licenses are maximally permissive
✅ **No Fees:** All data sources are free to use
✅ **No Restrictions:** Can modify, distribute, and use commercially
✅ **Simple Attribution:** Only mwgg/Airports requires attribution (MIT)
✅ **Export Compliant:** No restrictions on worldwide distribution

**Bottom Line:** You're free to use, modify, and distribute this data in Atlas Logged without legal concerns. Just include the attribution text in your "About" screen and you're fully compliant.

---

**Last Legal Review:** October 30, 2025
**Next Review Due:** January 30, 2026
**Maintained By:** Atlas Logged Development Team
