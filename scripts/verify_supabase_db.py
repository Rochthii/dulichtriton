import os
import sys
import psycopg2

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    if os.path.exists(".env.local"):
        with open(".env.local", "r", encoding="utf-8") as f:
            for line in f:
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

def main():
    print("=== VERIFYING LIVE SUPABASE DATABASE ===")
    load_env()
    conn_str = os.getenv("DATABASE_URL")
    
    if not conn_str:
        print("ERROR: DATABASE_URL not set in .env.local")
        return

    try:
        conn = psycopg2.connect(conn_str)
        cursor = conn.cursor()
        
        # Check places count
        cursor.execute("SELECT COUNT(*) FROM public.places;")
        places_count = cursor.fetchone()[0]
        
        # Check videos count
        cursor.execute("SELECT COUNT(*) FROM public.videos;")
        videos_count = cursor.fetchone()[0]
        
        # Check sample place
        cursor.execute("SELECT id, name, commune, address FROM public.places LIMIT 3;")
        samples = cursor.fetchall()
        
        print(f"✅ PLACES TABLE COUNT: {places_count} records")
        print(f"✅ VIDEOS TABLE COUNT: {videos_count} records")
        print("\nSAMPLE RECORDED PLACES IN SUPABASE:")
        for s in samples:
            print(f" - [{s[0]}] {s[1]} ({s[2]}) - Address: {s[3]}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting/querying Supabase: {e}")

if __name__ == "__main__":
    main()
