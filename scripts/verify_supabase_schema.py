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
    print("=== VERIFYING SUPABASE DDL SCHEMA EXECUTION ===")
    load_env()
    conn_str = os.getenv("DATABASE_URL")
    
    if not conn_str:
        print("ERROR: DATABASE_URL not set")
        return

    try:
        conn = psycopg2.connect(conn_str)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('places', 'videos', 'chat_sessions', 'chat_messages', 'audit_logs');
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        # Check indexes
        cursor.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'places';
        """)
        indexes = [row[0] for row in cursor.fetchall()]

        # Check triggers
        cursor.execute("""
            SELECT trigger_name 
            FROM information_schema.triggers 
            WHERE event_object_table = 'places';
        """)
        triggers = [row[0] for row in cursor.fetchall()]

        print(f"✅ TABLES CREATED ({len(tables)}/5): {', '.join(tables)}")
        print(f"✅ INDEXES ON PLACES ({len(indexes)}): {', '.join(indexes)}")
        print(f"✅ TRIGGERS ON PLACES ({len(triggers)}): {', '.join(triggers)}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error checking schema: {e}")

if __name__ == "__main__":
    main()
