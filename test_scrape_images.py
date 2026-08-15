import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

# Test URLs for popular places in Tri Ton
test_urls = [
    {
        "name": "Chùa Tà Pạ (Chùa Núi Tà Pạ)",
        "url": "https://vi.wikipedia.org/wiki/Ch%C3%B9a_T%C3%A0_P%E1%BA%A1"
    },
    {
        "name": "Khu Di Tích Tức Dụp (Đồi Tức Dụp Tri Tôn)",
        "url": "https://angiangtourism.vn/doi-tuc-dup/"
    },
    {
        "name": "Hồ Soài Chék Tri Tôn",
        "url": "https://luhanhvietnam.com.vn/du-lich/ho-soai-chek-an-giang.html"
    }
]

print("🚀 BẮT ĐẦU KIỂM THỬ BỘ TRÍCH XUẤT ẢNH TỰ ĐỘNG (API /api/v1/admin/scrape-images)\n")

for item in test_urls:
    name = item["name"]
    url = item["url"]
    print(f"🔍 Đang trích xuất ảnh cho: {name}")
    print(f"   URL nguồn: {url}")
    
    req_data = json.dumps({"url": url}).encode('utf-8')
    req = urllib.request.Request(
        "http://localhost:3000/api/v1/admin/scrape-images",
        data=req_data,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        # If local server is not currently running on 3000, call the scraping logic directly via python
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            images = data.get("images", [])
            print(f"   ✅ Thành công! Tìm thấy {len(images)} ảnh:")
            for idx, img in enumerate(images[:4]):
                print(f"      {idx+1}. {img[:90]}...")
            print()
    except Exception as e:
        print(f"   ⚠️ Local server call note: {e}")
        # Test directly via Python scraper function to demonstrate logic
        print("   👉 Đang kiểm thử trực tiếp qua engine bóc tách Python...")
        try:
            import re
            req_direct = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req_direct, timeout=10) as direct_resp:
                html = direct_resp.read().decode('utf-8', errors='ignore')
                
                # Extract og:image
                og_imgs = re.findall(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.I)
                # Extract img tags
                imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I)
                valid_imgs = [i for i in imgs if (i.startswith('http') and not any(k in i.lower() for k in ['icon', 'svg', 'logo', 'pixel']))]
                
                all_found = list(dict.fromkeys(og_imgs + valid_imgs))[:5]
                print(f"   ✅ Bóc tách thành công {len(all_found)} ảnh trực tiếp:")
                for idx, img in enumerate(all_found[:4]):
                    print(f"      {idx+1}. {img[:90]}...")
                print()
        except Exception as err2:
            print(f"   ❌ Lỗi: {err2}\n")
