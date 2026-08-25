import glob
import re

api_files = glob.glob('frontend/src/app/api/**/*.ts', recursive=True)
count = 0
for f in api_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = re.sub(
        r'const\s+supabase\s*=\s*createClient\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\);',
        r'const supabase = createClient(\1 || "https://placeholder.supabase.co", \2 || "placeholder");',
        content
    )
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        count += 1
        print(f'Patched: {f}')

print(f'Total patched: {count}')
