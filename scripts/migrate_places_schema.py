import os
import sys
import psycopg2

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    env = {}
    for filename in [".env.local", ".env"]:
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env[k.strip()] = v.strip()
    return env

def main():
    print("=== MIGRATING PLACES TABLE SCHEMA FOR MEDIA & ALIASES ===")
    env = load_env()
    conn_str = env.get("DATABASE_URL")
    
    if not conn_str:
        print("ERROR: DATABASE_URL not found in environment.")
        return

    try:
        conn = psycopg2.connect(conn_str)
        cursor = conn.cursor()
        
        alter_queries = [
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS image_url TEXT;",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS video_url TEXT;",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS photos JSONB;",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS aliases TEXT[];",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS data_flags TEXT[];"
        ]
        
        for q in alter_queries:
            cursor.execute(q)
            print(f"Executed: {q}")
            
        conn.commit()
        cursor.close()
        conn.close()
        print("SCHEMA MIGRATION SUCCESSFUL!")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
