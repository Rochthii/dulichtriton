import os
import psycopg2
from dotenv import load_dotenv

# Load database environment variables
load_dotenv('.env.local')
db_url = os.getenv('DATABASE_URL')

if not db_url:
    print('ERROR: DATABASE_URL missing in .env.local')
    exit(1)

migration_file = 'supabase/migrations/20260810_system_configs.sql'
with open(migration_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

print(f'Executing SQL migration: {migration_file}')

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    cursor.execute(sql_content)
    print('SUCCESS: SQL Migration executed successfully on Supabase PostgreSQL!')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'ERROR: Migration failed: {e}')
    exit(1)
