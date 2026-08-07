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
    print("=== MIGRATING HOT PLACES COLUMNS IN SUPABASE POSTGRESQL ===")
    env = load_env()
    conn_str = env.get("DATABASE_URL")
    
    if not conn_str:
        print("ERROR: DATABASE_URL not found in environment.")
        return

    try:
        conn = psycopg2.connect(conn_str)
        cursor = conn.cursor()
        
        alter_queries = [
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS is_hot BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS hot_rank INT DEFAULT 99;",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS golden_time_windows TEXT[];",
            "ALTER TABLE public.places ADD COLUMN IF NOT EXISTS hot_score NUMERIC(10,2) DEFAULT 0;"
        ]
        
        for q in alter_queries:
            cursor.execute(q)
            print(f"Executed: {q}")
            
        conn.commit()
        cursor.close()
        conn.close()
        print("SUCCESSFULLY MIGRATED HOT PLACES COLUMNS IN DATABASE!")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
