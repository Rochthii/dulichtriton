import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

targets = ['latina', 'tức dụp', 'thảo nguyên', 'ô thum']
found = []
for p in pois:
    name_l = p.get('name', '').lower()
    for t in targets:
        if t in name_l:
            found.append(p)
            print(f"Found: [{p.get('id')}] {p.get('name')} | Commune: {p.get('commune')}")

# Update these specific POIs with authentic field warnings and descriptions
updated_count = 0
for p in pois:
    name_l = p.get('name', '').lower()
    
    # 1. Hồ Đá Latina
    if 'latina' in name_l:
        p['commune'] = 'Xã An Hảo (Ranh giới giáp TX. Tịnh Biên)'
        p['description'] = 'Hồ Đá Latina (Vách Đá Latina) — Tuyệt tác vách đá dựng đứng soi bóng mặt nước tĩnh lặng, nằm tại khu vực Xã An Hảo, ngay cung đường giáp ranh TX. Tịnh Biên và Tri Tôn. Điểm check-in chụp ảnh vách đá hùng vĩ nổi tiếng.'
        p['detailed_story'] = '### Vị trí và Ranh giới Thực địa\nHồ Đá Latina nằm dưới chân núi Cấm, thuộc địa phận Xã An Hảo (tiếp giáp ranh giới giữa TX. Tịnh Biên và Tri Tôn). Du khách cần chú ý định vị chính xác vì khu vực này nằm trên trục đường liên ranh giới.\n\n### Trải nghiệm & Cảnh quan\nĐiểm nhấn ấn tượng nhất là vách đá hoa cương dựng đứng sừng sững bên hồ nước trong xanh. Đây là góc săn ảnh check-in thiên nhiên độc đáo, mang vẻ đẹp hoang sơ kỳ vĩ.'
        updated_count += 1
        
    # 2. Đồi Tức Dụp
    elif 'tức dụp' in name_l:
        p['description'] = 'Khu di tích Lịch sử Đồi Tức Dụp (Ngọn Đồi 2 Triệu Đô) — Căn cứ địa cách mạng hào hùng kiên cường thời kháng chiến với hệ thống hang ngầm tự nhiên độc đáo. [Lưu ý thực tế: Du khách nên gọi điện hotline trước khi đến để cập nhật giá vé & dịch vụ mới nhất].'
        p['detailed_story'] = '### Lịch sử Ngọn Đồi 2 Triệu Đô\nĐồi Tức Dụp (tiếng Khmer nghĩa là Nước chảy trong đêm) thuộc Xã An Tức. Nơi đây từng là căn cứ địa kiên cường với hệ thống hang luồn tự nhiên trong lòng đá khối.\n\n### Lưu ý Thực địa Quan Trọng\nHiện tại có phản ánh về việc thay đổi mức giá vé tham quan và một số hạng mục dịch vụ. Du khách được khuyến nghị nên liên hệ ban quản lý/hotline để xác nhận thông tin giá vé và tình trạng hoạt động trước khi xuất phát.'
        updated_count += 1
        
    # 3. Gà đốt Thảo Nguyên / Quán Gà Đốt Ô Thum
    elif 'thảo nguyên' in name_l:
        p['description'] = 'Gà Đốt Thảo Nguyên — Quán phục vụ đặc sản Gà Đốt lá chúc truyền thống ven hồ Ô Thum, Xã Ô Lâm. [Mẹo thực địa: Gà được đốt chín kỹ trong nồi kín với sả và lá chúc tươi từ 35–45 phút, du khách nên gọi đặt món trước khi đến để không phải chờ lâu].'
        p['detailed_story'] = '### Bí quyết Gà Đốt Bản Địa\nGà Đốt là món ăn trứ danh của đồng bào Khmer Bảy Núi. Gà đồi thả vườn được tẩm ướp sả, ớt, tỏi và lá chúc tươi, sau đó xếp vào nồi/thố đậy kín nắp để đốt trên lửa lớn. Hơi nóng và tinh dầu lá chúc thấm sâu vào từng thớ thịt giúp da gà vàng ươm, giòn rụm và thịt ngọt đậm đà.\n\n### Lời khuyên khi dùng bữa\nDo quy trình đốt gà thủ công chuẩn vị mất khoảng 35–45 phút, du khách nên gọi đặt trước 30-45 phút trước khi đến để được thưởng thức gà nóng hổi vừa chín tới.'
        updated_count += 1

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"Successfully updated {updated_count} POIs in data/triton_pois_full.json")
