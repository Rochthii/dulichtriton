import os
import sys
import psycopg2

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    for env_file in [".env.local", ".env"]:
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip()

def main():
    load_env()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not set")
        return

    print("=== RESOLVING SPATIAL_REF_SYS POSTGREST EXPOSURE ===")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()

    queries = [
        "REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated, public;",
        "GRANT SELECT ON TABLE public.spatial_ref_sys TO postgres, service_role;"
    ]

    for q in queries:
        try:
            cursor.execute(q)
            print(f"SUCCESS: Executed -> {q}")
        except Exception as e:
            print(f"Notice: {e}")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
