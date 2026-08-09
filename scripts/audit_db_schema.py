import os
import sys
import psycopg2
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('.env.local')
db_url = os.environ.get('DATABASE_URL')

if not db_url:
    print("[ERROR] DATABASE_URL missing")
    sys.exit(1)

conn = psycopg2.connect(db_url)
cur = conn.cursor()

print("==========================================================")
print("     AUDIT HE THONG CSDL SUPABASE POSTGRESQL (TRI TON)    ")
print("==========================================================")

# 1. Get all tables in public schema
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
tables = [r[0] for r in cur.fetchall()]

print("\n--- 1. DANH SÁCH BẢNG CSDL VA SO LUONG BAN GHI ---")
for t in tables:
    try:
        cur.execute(f"SELECT count(*) FROM public.{t};")
        cnt = cur.fetchone()[0]
        print(f"  [+] Bảng '{t}': {cnt} bản ghi")
    except Exception as e:
        print(f"  [!] Bảng '{t}': Lỗi đếm bản ghi - {e}")

# 2. Get foreign key constraints
fk_query = """
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
"""

cur.execute(fk_query)
fks = cur.fetchall()

print("\n--- 2. KHÓA NGOẠI & QUAN HỆ (FOREIGN KEYS) ---")
if not fks:
    print("  [!] Chưa có khóa ngoại trực tiếp nào được định nghĩa!")
else:
    for fk in fks:
        print(f"  [🔗 FK] {fk[0]}.{fk[1]} ===> {fk[2]}.{fk[3]}")

# 3. Check RLS status
rls_query = """
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
"""
cur.execute(rls_query)
rls_list = cur.fetchall()

print("\n--- 3. TRẠNG THÁI ROW LEVEL SECURITY (RLS) ---")
for rls in rls_list:
    status = "✅ ENABLED" if rls[1] else "⚠️ DISABLED"
    print(f"  [{status}] Bảng '{rls[0]}'")

cur.close()
conn.close()
