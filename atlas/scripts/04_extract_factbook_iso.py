#!/usr/bin/env python3

"""
CIA World Factbook Data Extractor - ISO VERSION
Extracts data from factbook.json (Oct 2025) with proper ISO country codes

This version:
- Uses FIPS to ISO mapping for correct country codes
- Processes latest factbook.json data (updated weekly)
- Handles nested text structures properly
"""

import os
import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional


class FactbookExtractorISO:
    """Extract and process CIA World Factbook data with ISO codes"""

    def __init__(self, data_dir: str, mapping_file: str):
        self.data_dir = Path(data_dir)
        self.output_file = self.data_dir / "cia_factbook_2025_iso.json"

        # Load FIPS to ISO mapping
        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping_data = json.load(f)

        self.fips_to_iso = {}
        for entry in mapping_data:
            fips = entry.get('FIPS_GEC')
            iso = entry.get('ISO_3166_2')
            name = entry.get('NAME.EN')
            if fips and iso:
                self.fips_to_iso[fips] = {
                    'iso': iso,
                    'name': name
                }

    def extract_text(self, obj: Any) -> Optional[str]:
        """Extract text from nested structure"""
        if isinstance(obj, dict):
            if 'text' in obj:
                # Strip HTML tags
                text = obj['text']
                import re
                text = re.sub(r'<[^>]+>', '', text)
                text = text.strip()
                return text if text else None
            # Try other common keys
            for key in ['total', 'value', 'note']:
                if key in obj and isinstance(obj[key], dict) and 'text' in obj[key]:
                    return self.extract_text(obj[key])
        elif isinstance(obj, str):
            return obj
        return None

    def extract_number(self, obj: Any) -> Optional[float]:
        """Extract number from text or structure"""
        text = self.extract_text(obj)
        if not text:
            return None

        import re
        match = re.search(r'([\d,]+\.?\d*)', text)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except:
                return None
        return None

    def process_country_file(self, json_file: Path) -> Optional[Dict[str, Any]]:
        """Process a single country JSON file"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            fips_code = json_file.stem.upper()

            # Convert FIPS to ISO
            iso_info = self.fips_to_iso.get(fips_code)
            if not iso_info:
                print(f"  ⚠️  No ISO mapping for FIPS code: {fips_code}")
                return None

            iso_code = iso_info['iso']
            country_name = iso_info['name']

            processed = {
                'code': iso_code,
                'fips_code': fips_code,
                'name': country_name,
                'geography': {},
                'people': {},
                'government': {},
                'economy': {}
            }

            # Extract Geography
            if 'Geography' in data:
                geo = data['Geography']
                processed['geography'] = {
                    'location': self.extract_text(geo.get('Location')),
                    'coordinates': self.extract_text(geo.get('Geographic coordinates')),
                    'area': self.extract_area(geo.get('Area')),
                    'climate': self.extract_text(geo.get('Climate')),
                    'terrain': self.extract_text(geo.get('Terrain')),
                    'elevation': self.extract_elevation(geo.get('Elevation')),
                    'natural_resources': self.extract_text(geo.get('Natural resources')),
                    'natural_hazards': self.extract_text(geo.get('Natural hazards')),
                    'environment_issues': self.extract_text(geo.get('Environment - current issues'))
                }

            # Extract People and Society
            if 'People and Society' in data:
                people = data['People and Society']
                processed['people'] = {
                    'population': self.extract_population(people.get('Population')),
                    'nationality': self.extract_text(people.get('Nationality', {}).get('noun')),
                    'languages': self.extract_languages(people.get('Languages')),
                    'religions': self.extract_religions(people.get('Religions')),
                    'median_age': self.extract_text(people.get('Median age', {}).get('total'))
                }

            # Extract Government
            if 'Government' in data:
                gov = data['Government']
                processed['government'] = {
                    'country_name': self.extract_text(gov.get('Country name', {}).get('conventional long form')),
                    'government_type': self.extract_text(gov.get('Government type')),
                    'capital': self.extract_capital(gov.get('Capital')),
                    'independence': self.extract_text(gov.get('Independence')),
                    'national_holiday': self.extract_text(gov.get('National holiday')),
                    'administrative_divisions': self.extract_text(gov.get('Administrative divisions'))
                }

            # Extract Economy
            if 'Economy' in data:
                econ = data['Economy']
                processed['economy'] = {
                    'gdp': self.extract_gdp(econ.get('Real GDP (purchasing power parity)')),
                    'gdp_per_capita': self.extract_number(econ.get('Real GDP per capita')),
                    'currency': self.extract_currency(econ.get('Currency')),
                    'industries': self.extract_text(econ.get('Industries'))
                }

            return processed

        except Exception as e:
            print(f"  ⚠️  Error processing {json_file.name}: {e}")
            return None

    def extract_area(self, area_obj: Any) -> Optional[Dict]:
        """Extract area data"""
        if not isinstance(area_obj, dict):
            return None

        return {
            'total_sq_km': self.extract_number(area_obj.get('total ')),
            'land_sq_km': self.extract_number(area_obj.get('land')),
            'water_sq_km': self.extract_number(area_obj.get('water')),
            'note': self.extract_text(area_obj.get('note'))
        }

    def extract_elevation(self, elev_obj: Any) -> Optional[Dict]:
        """Extract elevation data"""
        if not isinstance(elev_obj, dict):
            return None

        return {
            'highest_point': self.extract_text(elev_obj.get('highest point')),
            'lowest_point': self.extract_text(elev_obj.get('lowest point')),
            'mean_elevation': self.extract_text(elev_obj.get('mean elevation'))
        }

    def extract_population(self, pop_obj: Any) -> Optional[Dict]:
        """Extract population data"""
        if not isinstance(pop_obj, dict):
            return {'total': self.extract_number(pop_obj)}

        return {
            'total': self.extract_number(pop_obj.get('total')),
            'male': self.extract_number(pop_obj.get('male')),
            'female': self.extract_number(pop_obj.get('female'))
        }

    def extract_languages(self, lang_obj: Any) -> Optional[str]:
        """Extract languages"""
        return self.extract_text(lang_obj)

    def extract_religions(self, rel_obj: Any) -> Optional[str]:
        """Extract religions"""
        return self.extract_text(rel_obj)

    def extract_capital(self, cap_obj: Any) -> Optional[Dict]:
        """Extract capital information"""
        if not isinstance(cap_obj, dict):
            return {'name': self.extract_text(cap_obj)}

        return {
            'name': self.extract_text(cap_obj.get('name')),
            'coordinates': self.extract_text(cap_obj.get('geographic coordinates')),
            'time_difference': self.extract_text(cap_obj.get('time difference'))
        }

    def extract_gdp(self, gdp_obj: Any) -> Optional[Dict]:
        """Extract GDP data"""
        if not isinstance(gdp_obj, dict):
            return {'value': self.extract_number(gdp_obj)}

        result = {
            'value': self.extract_number(gdp_obj),
            'note': self.extract_text(gdp_obj.get('note'))
        }

        # Try to find year-specific data
        for key in gdp_obj:
            if key.startswith('$') or 'billion' in str(key).lower() or 'trillion' in str(key).lower():
                result['value'] = self.extract_number(gdp_obj[key])
                break

        return result

    def extract_currency(self, curr_obj: Any) -> Optional[Dict]:
        """Extract currency data"""
        if not isinstance(curr_obj, dict):
            return {'name': self.extract_text(curr_obj)}

        return {
            'name': self.extract_text(curr_obj.get('name')),
            'code': self.extract_text(curr_obj.get('code')),
            'symbol': self.extract_text(curr_obj.get('symbol'))
        }

    def process_all(self) -> Dict[str, Any]:
        """Process all country files"""
        print("\n" + "="*60)
        print("CIA World Factbook Extractor - ISO Version")
        print("="*60)

        factbook_repo = self.data_dir / "factbook.json"

        if not factbook_repo.exists():
            print(f"\n❌ factbook.json repository not found at: {factbook_repo}")
            return {}

        print(f"✅ Found repository: {factbook_repo}")
        print(f"✅ Loaded {len(self.fips_to_iso)} FIPS to ISO mappings")

        # Find all JSON files
        all_countries = {}
        regions = [
            "africa", "antarctica", "australia-oceania", "central-america-n-caribbean",
            "central-asia", "east-n-southeast-asia", "europe", "middle-east",
            "north-america", "south-america", "south-asia"
        ]

        total_files = 0
        processed = 0
        errors = 0
        skipped = 0

        for region in regions:
            region_path = factbook_repo / region
            if not region_path.exists():
                continue

            json_files = list(region_path.glob("*.json"))
            total_files += len(json_files)

            print(f"\n📂 Processing {region}: {len(json_files)} files")

            for json_file in json_files:
                result = self.process_country_file(json_file)
                if result:
                    # Use ISO code as key
                    all_countries[result['code']] = result
                    processed += 1
                    print(f"  ✓ {result['code']}: {result['name']} (FIPS: {result['fips_code']})")
                elif result is None:
                    skipped += 1
                else:
                    errors += 1

        # Save output
        output_data = {
            'version': '3.0.0',
            'source': 'CIA World Factbook (factbook.json, updated weekly)',
            'extracted_at': __import__('time').strftime('%Y-%m-%d'),
            'total_countries': processed,
            'countries': all_countries
        }

        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print("\n" + "="*60)
        print(f"✅ Processing complete!")
        print(f"   Total files: {total_files}")
        print(f"   Processed: {processed}")
        print(f"   Skipped (no ISO mapping): {skipped}")
        print(f"   Errors: {errors}")
        print(f"   Success rate: {processed/total_files*100:.1f}%")
        print(f"\n📁 Saved to: {self.output_file}")
        print(f"📊 Size: {self.output_file.stat().st_size / 1024:.1f} KB")
        print("="*60)

        return output_data


def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    data_dir = base_dir / "data" / "cia_factbook"
    mapping_file = script_dir / "fips_iso_mapping.json"

    if not mapping_file.exists():
        print(f"\n❌ FIPS to ISO mapping not found: {mapping_file}")
        print("   Download from: https://raw.githubusercontent.com/dieghernan/Country-Codes-and-International-Organizations/master/outputs/Countrycodesfull.json")
        return

    extractor = FactbookExtractorISO(data_dir, mapping_file)
    extractor.process_all()


if __name__ == "__main__":
    main()
