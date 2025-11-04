#!/usr/bin/env python3

"""
CIA World Factbook Data Extractor
Downloads and extracts country data from CIA World Factbook

Two methods:
1. Use existing factbook.json repository (2021 data, offline)
2. Scrape live CIA website (current data, requires internet)

License: Public Domain (CIA Factbook is US Government work)
"""

import os
import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional

# Try to import requests for live scraping
try:
    import requests
    from bs4 import BeautifulSoup
    SCRAPING_AVAILABLE = True
except ImportError:
    SCRAPING_AVAILABLE = False
    print("⚠️  requests/beautifulsoup4 not installed - live scraping unavailable")
    print("   Install with: pip3 install requests beautifulsoup4")
    print("   Or use offline method (factbook.json repository)\n")


class FactbookExtractor:
    """Extract and process CIA World Factbook data"""

    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.output_file = self.data_dir / "cia_factbook.json"

    def method_1_use_existing_repo(self) -> bool:
        """Method 1: Use existing factbook.json repository (offline)"""
        print("\n📦 Method 1: Using factbook.json Repository (Offline)")
        print("=" * 60)

        factbook_repo = self.data_dir / "factbook.json"

        if not factbook_repo.exists():
            print("\n❌ factbook.json repository not found")
            print("\n📥 To download:")
            print(f"   cd {self.data_dir}")
            print("   git clone https://github.com/factbook/factbook.json.git")
            print("\nNote: This data is from 2021 and may be outdated")
            return False

        print(f"✅ Found factbook.json repository at: {factbook_repo}")

        # Process existing JSON files
        countries_data = {}
        country_dirs = [
            "africa", "antarctica", "australia-oceania", "central-america-n-caribbean",
            "central-asia", "east-n-southeast-asia", "europe", "middle-east",
            "north-america", "oceans", "south-america", "south-asia", "world"
        ]

        total_files = 0
        for region in country_dirs:
            region_path = factbook_repo / region
            if not region_path.exists():
                continue

            for json_file in region_path.glob("*.json"):
                total_files += 1
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Extract country code (filename without .json)
                    country_code = json_file.stem.upper()

                    # Process and simplify data
                    processed = self._process_factbook_entry(data)
                    if processed:
                        countries_data[country_code] = processed

                except Exception as e:
                    print(f"⚠️  Error processing {json_file.name}: {e}")

        print(f"\n✅ Processed {len(countries_data)} countries from {total_files} files")

        # Save combined output
        output = {
            "version": "1.0.0",
            "lastUpdated": "2021-01-01",  # factbook.json is from 2021
            "source": "CIA World Factbook via factbook.json (2021)",
            "countries": countries_data
        }

        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"✅ Saved to: {self.output_file}")
        print(f"   Size: {self.output_file.stat().st_size / 1024:.1f} KB")

        return True

    def method_2_scrape_live(self, countries: list) -> bool:
        """Method 2: Scrape live CIA Factbook website (requires internet)"""
        if not SCRAPING_AVAILABLE:
            print("❌ Scraping dependencies not installed")
            return False

        print("\n🌐 Method 2: Scraping Live CIA Factbook (Online)")
        print("=" * 60)
        print("\n⚠️  This method is not yet implemented")
        print("   Reason: CIA website structure changes frequently")
        print("   Recommendation: Use Method 1 (factbook.json) for now")
        print("\n   If you need current data, manually update critical countries")
        return False

    def _process_factbook_entry(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process raw factbook JSON into our simplified schema"""
        try:
            processed = {}

            # Geography
            if "Geography" in data:
                geo = data["Geography"]
                processed["geography"] = {
                    "area": self._extract_area(geo.get("Area", {})),
                    "climate": self._extract_text(geo.get("Climate", {})),
                    "terrain": self._extract_text(geo.get("Terrain", {})),
                    "elevation": self._extract_elevation(geo.get("Elevation", {}))
                }

            # People and Society
            if "People and Society" in data:
                people = data["People and Society"]
                processed["people"] = {
                    "population": self._extract_number(people.get("Population", {})),
                    "languages": self._extract_languages(people.get("Languages", {})),
                    "religions": self._extract_religions(people.get("Religions", {}))
                }

            # Government
            if "Government" in data:
                gov = data["Government"]
                processed["government"] = {
                    "type": self._extract_text(gov.get("Government type", {})),
                    "capital": self._extract_capital(gov.get("Capital", {})),
                    "independence": self._extract_text(gov.get("Independence", {}))
                }

            # Economy
            if "Economy" in data:
                econ = data["Economy"]
                processed["economy"] = {
                    "gdp": self._extract_gdp(econ.get("Real GDP (purchasing power parity)", {})),
                    "currency": self._extract_text(econ.get("Currency", {})),
                    "industries": self._extract_text(econ.get("Industries", {}))
                }

            return processed if processed else None

        except Exception as e:
            print(f"⚠️  Error processing entry: {e}")
            return None

    def _extract_text(self, obj: Any) -> Optional[str]:
        """Extract text from factbook object"""
        if isinstance(obj, dict) and "text" in obj:
            return obj["text"]
        elif isinstance(obj, str):
            return obj
        return None

    def _extract_number(self, obj: Any) -> Optional[int]:
        """Extract number from factbook object"""
        if isinstance(obj, dict) and "total" in obj:
            return int(obj["total"])
        elif isinstance(obj, (int, float)):
            return int(obj)
        return None

    def _extract_area(self, area_obj: Dict) -> Optional[Dict]:
        """Extract area information"""
        if not area_obj:
            return None

        return {
            "total": self._extract_number(area_obj.get("total", {})),
            "land": self._extract_number(area_obj.get("land", {})),
            "water": self._extract_number(area_obj.get("water", {})),
            "unit": "km²"
        }

    def _extract_elevation(self, elev_obj: Dict) -> Optional[Dict]:
        """Extract elevation information"""
        if not elev_obj:
            return None

        return {
            "highest": self._extract_text(elev_obj.get("highest point", {})),
            "lowest": self._extract_text(elev_obj.get("lowest point", {}))
        }

    def _extract_capital(self, cap_obj: Dict) -> Optional[str]:
        """Extract capital city name"""
        if isinstance(cap_obj, dict) and "name" in cap_obj:
            return cap_obj["name"]
        return None

    def _extract_languages(self, lang_obj: Any) -> Optional[list]:
        """Extract language list"""
        if isinstance(lang_obj, dict) and "language" in lang_obj:
            langs = lang_obj["language"]
            if isinstance(langs, list):
                return [l.get("name", l) if isinstance(l, dict) else l for l in langs]
        return None

    def _extract_religions(self, rel_obj: Any) -> Optional[list]:
        """Extract religion list with percentages"""
        if isinstance(rel_obj, dict) and "religion" in rel_obj:
            rels = rel_obj["religion"]
            if isinstance(rels, list):
                processed = []
                for r in rels:
                    if isinstance(r, dict):
                        processed.append({
                            "name": r.get("name", ""),
                            "percent": float(r.get("percent", 0))
                        })
                return processed
        return None

    def _extract_gdp(self, gdp_obj: Any) -> Optional[int]:
        """Extract GDP value"""
        if isinstance(gdp_obj, dict) and "annual_values" in gdp_obj:
            values = gdp_obj["annual_values"]
            if isinstance(values, list) and len(values) > 0:
                latest = values[0]
                if isinstance(latest, dict) and "value" in latest:
                    return int(latest["value"])
        return None


def main():
    """Main execution"""
    print("\n" + "=" * 60)
    print("CIA World Factbook Data Extractor")
    print("=" * 60)

    # Get base directory
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / "data" / "cia_factbook"

    print(f"\n📁 Data directory: {data_dir}")

    # Create extractor
    extractor = FactbookExtractor(data_dir)

    # Try method 1 first (offline)
    print("\n🎯 Attempting Method 1: Offline factbook.json repository")

    success = extractor.method_1_use_existing_repo()

    if not success:
        print("\n" + "=" * 60)
        print("📥 To use offline method:")
        print("=" * 60)
        print(f"\n1. Clone the factbook.json repository:")
        print(f"   cd {data_dir}")
        print("   git clone https://github.com/factbook/factbook.json.git")
        print("\n2. Re-run this script:")
        print("   python3 04_extract_factbook.py")

        print("\n" + "=" * 60)
        print("🌐 Alternative: Manual extraction")
        print("=" * 60)
        print("\nVisit: https://www.cia.gov/the-world-factbook/")
        print("For critical countries, manually extract data")
        print("\nTemplate structure in: docs/DATA_SOURCES.md")

        return 1

    print("\n" + "=" * 60)
    print("✅ Factbook data extraction complete!")
    print("=" * 60)
    print(f"\nOutput: {extractor.output_file}")
    print("\nNext steps:")
    print("  1. Review generated data")
    print("  2. Run: node 05_build_unified_db.js")

    return 0


if __name__ == "__main__":
    sys.exit(main())
