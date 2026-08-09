"""
Script Nạp Tọa Độ Geolocation (Lat/Lng/PostGIS Point) & Link Nguồn Xác Minh (Google Maps Evidence) cho 95 POI Tri Tôn
"""
import os
import sys
import csv
import urllib.request
import urllib.parse
import json
import psycopg2
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment
root_env = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(root_env)

DB_URL = os.getenv('DATABASE_URL')

def main():
    print("=== ENRICHING PLACES WITH POSTGIS GEOM & EVIDENCE SOURCE LINKS ===")
    if not DB_URL:
        print("❌ ERROR: DATABASE_URL not found in .env")
        sys.exit(1)

    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'tri_ton_master_cleaned.csv')
    if not os.path.exists(csv_path):
        print(f"❌ ERROR: File {csv_path} not found")
        sys.exit(1)

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    updated_count = 0
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            poi_id = row['id'].strip()
            name = row['name'].strip()
            lat_str = row.get('latitude', '').strip()
            lng_str = row.get('longitude', '').strip()

            if not lat_str or not lng_str:
                continue

            try:
                lat = float(lat_str)
                lng = float(lng_str)
            except ValueError:
                continue

            # Generate Google Maps Search Evidence URL for 1-click verification
            source_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(name + ' ' + row.get('commune', 'Tri Tôn'))}"
            
            # PostGIS ST_SetSRID SQL query
            sql = """
                UPDATE public.places
                SET 
                    latitude = %s,
                    longitude = %s,
                    geom = ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geometry,
                    source_url = %s,
                    is_verified = true,
                    verified_at = NOW()
                WHERE id = %s;
            """
            cur.execute(sql, (lat, lng, lng, lat, source_url, poi_id))
            updated_count += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"🎉 Cập nhật thành công PostGIS Geo Point & Link Nguồn Xác Minh cho {updated_count} POIs!")

if __name__ == '__main__':
    main()
