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
        
        # Check Hot Top 12 places
        cursor.execute("SELECT id, hot_rank, name, commune, golden_time_windows, hot_score FROM public.places WHERE is_hot = TRUE ORDER BY hot_rank ASC LIMIT 6;")
        hot_samples = cursor.fetchall()
        
        print(f"✅ PLACES TABLE COUNT: {places_count} records")
        print(f"✅ VIDEOS TABLE COUNT: {videos_count} records")
        print("\n🔥 TOP HOT PLACES LIVE IN SUPABASE DB:")
        for h in hot_samples:
            print(f" - Top {h[1]} [{h[0]}] {h[2]} ({h[3]}) - Golden Time: {h[4]} - Score: {h[5]}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting/querying Supabase: {e}")

if __name__ == "__main__":
    main()
