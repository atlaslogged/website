#!/usr/bin/env python3

"""
CIA World Factbook 2025 Scraper
Scrapes current data directly from CIA website for up-to-date information

Requirements: pip3 install requests beautifulsoup4 lxml
"""

import os
import json
import sys
import time
import re
from pathlib import Path
from typing import Dict, Any, Optional, List

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ Missing dependencies!")
    print("   Install with: pip3 install requests beautifulsoup4 lxml")
    sys.exit(1)


class FactbookScraper2025:
    """Scrape live CIA Factbook data (2025)"""

    BASE_URL = "https://www.cia.gov/the-world-factbook"
    COUNTRIES_INDEX = f"{BASE_URL}/countries"

    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def get_country_list(self) -> List[Dict[str, str]]:
        """Fetch list of all countries from factbook"""
        print(f"\n📋 Fetching country list from {self.COUNTRIES_INDEX}")

        try:
            response = self.session.get(self.COUNTRIES_INDEX, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'lxml')

            # Find all country links
            countries = []

            # The factbook lists countries in a specific section
            # We'll look for links that match the pattern /countries/COUNTRY-NAME
            links = soup.find_all('a', href=re.compile(r'^/the-world-factbook/countries/'))

            for link in links:
                country_name = link.get_text(strip=True)
                country_url = self.BASE_URL + link['href'].replace('/the-world-factbook', '')

                if country_name and len(country_name) > 1:  # Filter out empty or single char
                    countries.append({
                        'name': country_name,
                        'url': country_url,
                        'slug': link['href'].split('/')[-1]
                    })

            # Remove duplicates
            seen = set()
            unique_countries = []
            for country in countries:
                if country['slug'] not in seen:
                    seen.add(country['slug'])
                    unique_countries.append(country)

            print(f"✅ Found {len(unique_countries)} countries")
            return unique_countries

        except Exception as e:
            print(f"❌ Error fetching country list: {e}")
            return []

    def scrape_country(self, country: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Scrape data for a single country"""
        print(f"  📥 Scraping: {country['name']}")

        try:
            response = self.session.get(country['url'], timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'lxml')

            data = {
                'name': country['name'],
                'slug': country['slug'],
                'url': country['url'],
                'scraped_at': time.strftime('%Y-%m-%d'),
                'geography': {},
                'people': {},
                'government': {},
                'economy': {}
            }

            # Extract data from sections
            # The CIA factbook uses a specific structure with sections

            # Geography
            data['geography'] = self._extract_geography(soup)

            # People and Society
            data['people'] = self._extract_people(soup)

            # Government
            data['government'] = self._extract_government(soup)

            # Economy
            data['economy'] = self._extract_economy(soup)

            return data

        except Exception as e:
            print(f"  ⚠️  Error scraping {country['name']}: {e}")
            return None

    def _extract_geography(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract geography section"""
        geography = {}

        # Look for geography section
        geo_section = soup.find('h2', string=re.compile(r'Geography', re.I))
        if geo_section:
            # Find all fields in this section until next h2
            current = geo_section.find_next_sibling()
            while current and current.name != 'h2':
                if current.name == 'h3':
                    field_name = current.get_text(strip=True).lower()
                    field_value = current.find_next_sibling()

                    if field_value:
                        value_text = field_value.get_text(strip=True)

                        if 'area' in field_name:
                            geography['area'] = value_text
                        elif 'climate' in field_name:
                            geography['climate'] = value_text
                        elif 'terrain' in field_name:
                            geography['terrain'] = value_text
                        elif 'elevation' in field_name:
                            geography['elevation'] = value_text

                current = current.find_next_sibling()

        return geography

    def _extract_people(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract people and society section"""
        people = {}

        people_section = soup.find('h2', string=re.compile(r'People and Society', re.I))
        if people_section:
            current = people_section.find_next_sibling()
            while current and current.name != 'h2':
                if current.name == 'h3':
                    field_name = current.get_text(strip=True).lower()
                    field_value = current.find_next_sibling()

                    if field_value:
                        value_text = field_value.get_text(strip=True)

                        if 'population' in field_name:
                            people['population'] = value_text
                        elif 'language' in field_name:
                            people['languages'] = value_text
                        elif 'religion' in field_name:
                            people['religions'] = value_text

                current = current.find_next_sibling()

        return people

    def _extract_government(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract government section"""
        government = {}

        gov_section = soup.find('h2', string=re.compile(r'Government', re.I))
        if gov_section:
            current = gov_section.find_next_sibling()
            while current and current.name != 'h2':
                if current.name == 'h3':
                    field_name = current.get_text(strip=True).lower()
                    field_value = current.find_next_sibling()

                    if field_value:
                        value_text = field_value.get_text(strip=True)

                        if 'government type' in field_name:
                            government['type'] = value_text
                        elif 'capital' in field_name:
                            government['capital'] = value_text
                        elif 'independence' in field_name:
                            government['independence'] = value_text

                current = current.find_next_sibling()

        return government

    def _extract_economy(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract economy section"""
        economy = {}

        econ_section = soup.find('h2', string=re.compile(r'Economy', re.I))
        if econ_section:
            current = econ_section.find_next_sibling()
            while current and current.name != 'h2':
                if current.name == 'h3':
                    field_name = current.get_text(strip=True).lower()
                    field_value = current.find_next_sibling()

                    if field_value:
                        value_text = field_value.get_text(strip=True)

                        if 'gdp' in field_name and 'real' in field_name:
                            economy['gdp'] = value_text
                        elif 'industries' in field_name:
                            economy['industries'] = value_text
                        elif 'currency' in field_name:
                            economy['currency'] = value_text

                current = current.find_next_sibling()

        return economy

    def scrape_all(self, limit: Optional[int] = None) -> Dict[str, Any]:
        """Scrape all countries"""
        print("\n" + "="*60)
        print("CIA World Factbook 2025 Scraper")
        print("="*60)

        # Get country list
        countries = self.get_country_list()

        if not countries:
            print("❌ No countries found!")
            return {}

        if limit:
            countries = countries[:limit]
            print(f"\n⚠️  Limited to first {limit} countries for testing")

        # Scrape each country
        all_data = {}
        total = len(countries)

        print(f"\n🌍 Scraping {total} countries...")
        print(f"   (This will take ~{total * 2} seconds with 2s delay per country)\n")

        for i, country in enumerate(countries, 1):
            print(f"[{i}/{total}] {country['name']}")

            data = self.scrape_country(country)
            if data:
                # Use slug as key (e.g., "united-kingdom")
                all_data[country['slug']] = data

            # Be polite to CIA servers
            if i < total:
                time.sleep(2)  # 2 second delay between requests

        # Save results
        output = {
            'version': '2.0.0',
            'source': 'CIA World Factbook (scraped)',
            'scraped_at': time.strftime('%Y-%m-%d'),
            'countries': all_data
        }

        output_file = self.output_dir / 'cia_factbook_2025.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Scraped {len(all_data)} countries")
        print(f"📁 Saved to: {output_file}")
        print(f"📊 File size: {output_file.stat().st_size / 1024:.1f} KB")

        return output


def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape CIA World Factbook 2025')
    parser.add_argument('--limit', type=int, help='Limit to N countries (for testing)')
    parser.add_argument('--output', type=str, default='data/cia_factbook',
                        help='Output directory')
    args = parser.parse_args()

    # Get script directory
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent

    # Output directory
    output_dir = base_dir / args.output
    output_dir.mkdir(parents=True, exist_ok=True)

    # Create scraper
    scraper = FactbookScraper2025(output_dir)

    # Scrape
    scraper.scrape_all(limit=args.limit)

    print("\n" + "="*60)
    print("✅ Scraping complete!")
    print("="*60)


if __name__ == "__main__":
    main()
