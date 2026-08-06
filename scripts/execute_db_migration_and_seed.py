import os
import sys
import subprocess

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    if os.path.exists(".env.local"):
        with open(".env.local", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()
    elif os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

def main():
    print("=== DIRECT SUPABASE POSTGRESQL MIGRATION & SEEDING ===")
    load_env()
    conn_str = os.getenv("DATABASE_URL")
    if not conn_str:
        print("ERROR: DATABASE_URL environment variable is missing!")
        return

    # Try importing psycopg2 or pg8000
    try:
        import psycopg2
        print("Found psycopg2! Connecting to Supabase Direct Postgres Pooler...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 1. Execute schema.sql
        schema_path = "tourism_crawler/database/schema.sql"
        if os.path.exists(schema_path):
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            print(f"Executing DDL Schema from {schema_path}...")
            cursor.execute(schema_sql)
            print("SUCCESS: DDL Schema applied to Supabase PostgreSQL!")
            
        cursor.execute("ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_platform_check;")
        cursor.execute("ALTER TABLE public.videos ADD CONSTRAINT videos_platform_check CHECK (platform IN ('tiktok', 'youtube', 'facebook', 'youtube_shorts'));")

        # 2. Execute seed_places.sql
        seed_path = "export/seed_places.sql"
        if os.path.exists(seed_path):
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_sql = f.read()
            print(f"Executing Seed SQL from {seed_path}...")
            cursor.execute(seed_sql)
            print("SUCCESS: 106 Places & Videos Seeded directly into Supabase PostgreSQL!")
            
        cursor.close()
        conn.close()
        return
    except ImportError:
        print("psycopg2 not found, installing psycopg2-binary...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        print("psycopg2-binary installed! Re-running migration...")
        os.execv(sys.executable, [sys.executable] + sys.argv)
    except Exception as e:
        print(f"PostgreSQL Execution Error: {e}")

if __name__ == "__main__":
    main()
