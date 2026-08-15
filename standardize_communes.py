import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

for p in pois:
    name_l = p.get('name', '').lower()
    
    # Ô Thum is in Xã Ô Lâm
    if 'ô thum' in name_l or 'o thum' in name_l:
        p['commune'] = 'Xã Ô Lâm'
        
    # Tà Pạ is in Xã Núi Tô
    elif 'tà pạ' in name_l or 'ta pa' in name_l:
        p['commune'] = 'Xã Núi Tô'
        
    # Tức Dụp is in Xã An Tức
    elif 'tức dụp' in name_l or 'tuc dup' in name_l:
        p['commune'] = 'Xã An Tức'
        
    # Koh Kas is in Xã Châu Lăng
    elif 'koh kas' in name_l or 'cổng trời' in name_l:
        p['commune'] = 'Xã Châu Lăng'
        
    # Latina is in Xã An Hảo
    elif 'latina' in name_l:
        p['commune'] = 'Xã An Hảo (Ranh giới giáp TX. Tịnh Biên)'
        
    # Ba Chúc is in Thị trấn Ba Chúc
    elif 'ba chúc' in name_l or 'ba chuc' in name_l or 'phi lai' in name_l or 'tam bửu' in name_l:
        p['commune'] = 'Thị trấn Ba Chúc'

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print("Accurate communes standardized across master POIs.")
