import urllib.request
import urllib.parse
import json
import re

def search_duckduckgo_lite(query):
    encoded = urllib.parse.quote(query)
    url = f"https://html.duckduckgo.com/html/?q={encoded}"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8')
            # Extract snippets
            results = []
            snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.DOTALL)
            titles = re.findall(r'<a class="result__url[^>]*>(.*?)</a>', html, re.DOTALL)
            for i in range(min(len(snippets), 5)):
                clean_snippet = re.sub(r'<[^>]+>', '', snippets[i]).strip()
                results.append(clean_snippet)
            return results
    except Exception as e:
        print("Search error:", e)
        return []

res = search_duckduckgo_lite("tri tôn có gì chơi")
print(f"Found {len(res)} live search snippets:")
for r in res:
    print(" -", r)
