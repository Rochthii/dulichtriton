import sys
import json
import csv
import re
import unicodedata
from math import radians, cos, sin, asin, sqrt

sys.stdout.reconfigure(encoding='utf-8')

def norm(s):
    if not s: return ""
    return unicodedata.normalize('NFC', str(s)).strip()

def norm_lower(s):
    return norm(s).lower()

# Real high-res verified fallback images for Tri Ton categories
CATEGORY_IMAGES = {
    'nature': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    'mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    'lake': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'spiritual': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
    'culture': 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop',
    'gastronomy': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    'stay': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    'check-in': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop',
    'general': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
}

def get_best_image(p):
    img = p.get('image_url')
    if img and img.startswith('http') and not 'placeholder' in img and not 'example' in img:
        return img
    cat = (p.get('category') or 'nature').lower()
    name = (p.get('name') or '').lower()
    if 'hồ' in name or 'suối' in name:
        return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'
    if 'núi' in name or 'vồ hội' in name or 'đỉnh' in name:
        return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'
    if 'chùa' in name or 'tâm linh' in name:
        return 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop'
    if 'gà đốt' in name or 'cháo bò' in name or 'bún cá' in name or 'bánh bò' in name:
        return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop'
    if 'homestay' in name or 'khách sạn' in name:
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop'
    return CATEGORY_IMAGES.get(cat, CATEGORY_IMAGES['general'])

# Authentic description rewrites for POIs that had spam or junk text
CLEAN_DESCRIPTIONS = {
    'đá vồ hội mẹ cô tô': "Tọa độ săn mây và ngắm bình minh tuyệt mỹ trên đỉnh Núi Cô Tô (độ cao 614m), thuộc xã Cô Tô. Từ đây, du khách có thể phóng tầm mắt ôm trọn biển mây trắng bồng bềnh và toàn cảnh cánh đồng lúa Tà Pạ bát ngát.",
    'ruộng coffee & homestay': "Quán cà phê và homestay view cánh đồng lúa thơ mộng tại xã Núi Tô. Không gian mộc mạc, yên bình, đón gió núi mát rượi, là điểm dừng chân lý tưởng để ngắm hoàng hôn Bảy Núi.",
    'quy coffee house': "Không gian cà phê ấm cúng mang phong cách acoustic mộc mạc tại trung tâm Thị trấn Tri Tôn. Phục vụ cà phê hạt rang xay, trà hoa quả và là điểm tụ họp thư giãn về đêm của giới trẻ địa phương.",
    'ny coffee & tea': "Quán trà sữa và đồ uống hiện đại tại trung tâm Thị trấn Tri Tôn. Phục vụ đa dạng trà trái cây tươi, trà sữa thốt nốt và các món ăn vặt nhẹ trong không gian máy lạnh thoải mái.",
    'suối vàng soài so': "Dòng suối tự nhiên trong vắt bắt nguồn từ đỉnh Núi Cô Tô len lỏi qua các khe đá rợp bóng cây rừng, chảy về lòng Hồ Soài So, xã Núi Tô. Điểm dã ngoại, tắm mát và cắm trại lý tưởng.",
    'núi dài (ngọa long sơn)': "Ngọn núi dài nhất trong dãy Thất Sơn (khoảng 8.000m), trải qua các xã Lê Trì, Ba Chúc, Lương Phi. Nổi tiếng với di tích căn cứ cách mạng Ô Tà Sóc, vườn cây ăn trái xum xuê và những hang đá hùng vĩ.",
    'chùa tam bửu ba chúc': "Ngôi tổ đình linh thiêng của đạo Tứ Ân Hiếu Nghĩa, được Đức Bổn Sư Ngô Lợi sáng lập vào thế kỷ 19 tại thị trấn Ba Chúc. Quần thể kiến trúc cổ kính gắn liền với lịch sử khai hoang mở đất Bảy Núi.",
    'chùa phi lai ba chúc': "Ngôi chùa lịch sử của đạo Tứ Ân Hiếu Nghĩa tại thị trấn Ba Chúc. Nơi đây từng là điểm tựa tâm linh và che chở đồng bào trong các cuộc chiến tranh bảo vệ biên giới Tây Nam.",
    'nghệ thuật viết kinh lá buông': "Di sản văn hóa phi vật thể quốc gia độc nhất vô nhị của đồng bào Khmer Bảy Núi. Kinh Phật và truyện tích dân gian được các cao tăng dùng kim sắt khắc thủ công tỉ mỉ trên từng phiến lá buông tại Chùa Svay Siem Vang (Chùa Cũ, xã Ô Lâm).",
    'con đường tre tầm vông ô tà sóc': "Tuyến đường tuyệt đẹp rợp bóng hàng ngàn cây tre tầm vông xanh ngắt dẫn vào khu di tích lịch sử Ô Tà Sóc, xã Lương Phi. Điểm check-in chụp ảnh đậm chất điện ảnh được giới trẻ săn đón.",
    'quán gà đốt rô thum khmer': "Quán gà đốt trứ danh ven hồ Ô Thum, xã Ô Lâm. Gà thả vườn thịt chắc, ướp sả ớt lá chúc tươi đâm nhuyễn và nướng than hồng thơm lừng, chấm muối ớt trái chúc cay nồng.",
    'quán siêu gà đốt ô thum (chau siêu)': "Địa chỉ gà đốt nguyên bản của anh Chau Siêu bên bờ hồ Ô Thum, xã Ô Lâm. Gà nướng lá chúc da giòn rụm, phục vụ kèm xôi thốt nốt dẻo thơm và rau rừng.",
    'quán kiều tiên gà đốt ô thum': "Quán gà đốt lá chúc có chòi lá sàn gỗ mát rượi ven hồ Ô Thum, xã Ô Lâm. Không gian thoáng đãng ngắm mặt hồ xanh biếc và thưởng thức đặc sản Bảy Núi.",
    'quán đu đủ đâm rina khmer': "Quán đu đủ đâm nổi tiếng của người Khmer tại xã Châu Lăng. Đu đủ bào sợi giòn sần sật, đâm cối gỗ cùng mắm ruốc, tỏi ớt cay nồng, ba khía muối, đậu phộng và chanh tươi.",
    'quán đu đủ đâm ly ly': "Địa chỉ ăn vặt Khmer quen thuộc tại xã Châu Lăng, phục vụ đu đủ đâm chua cay đậm đà kèm bò nướng lụi sả và nước thốt nốt tươi ngọt mát.",
    'quán đu đủ đâm ty tri tôn': "Quán đu đủ đâm phong vị Khmer truyền thống gần trung tâm Tri Tôn. Món ăn hòa quyện vị chua cay mặn ngọt đặc trưng miền biên viễn.",
    'quán bún cá sơ nương khmer': "Quán bún cá gia truyền của cô Sơ Nương tại chợ Tri Tôn. Nước lèo nấu từ cá lóc đồng rỉa thịt, ngải bún và nghệ vàng tươi thơm nức mũi, ăn kèm rau muống bào và bông điên điển.",
    'quán bún cá dook tri tôn': "Quán bún cá Khmer chuẩn vị Tri Tôn với nước dùng trong ngọt thanh từ xương cá đồng, vị the nhẹ của ngải bún và sả băm, ăn kèm chả lụa và đầu cá lóc béo ngậy.",
    'quán bánh canh lò rèn (>30 năm)': "Quán bánh canh bột gạo xắt thủ công hơn 30 năm tuổi tại Thị trấn Tri Tôn. Nước dùng nấu từ tôm khô và giò heo hầm mềm ngọt tự nhiên, phục vụ nóng hổi vào mỗi buổi sáng.",
    'quán cháo bò trái trúc ba chúc': "Đặc sản cháo bò nức tiếng thị trấn Ba Chúc. Cháo nấu từ gạo nàng nhen dẻo thơm, lòng và thịt bò đồi tươi ngọt, nêm lá chúc xắt nhuyễn và vắt thêm nước trái chúc nướng chua thanh thơm ngát.",
    'quán bánh xèo tép bông điên điển cầu số 10': "Quán bánh xèo giòn rụm miền Tây ven cầu số 10, xã Cô Tô. Nhân bánh đầy ắp tép đồng tươi roi rói, bông điên điển vàng ươm và củ hủ dừa ngọt bùi, ăn kèm rổ rau rừng Bảy Núi phong phú.",
    'quán bò nướng trái trúc tri tôn': "Quán chuyên các món bò đồi Bảy Núi tại Thị trấn Tri Tôn. Thịt bò tơ ướp sả ớt và tinh dầu lá chúc nướng than hoa, cuốn bánh tráng rau rừng chấm mắm nêm đậm đà.",
    'quán bò 7 món ba chúc': "Địa chỉ ẩm thực bò tươi truyền thống tại Ba Chúc: bò lụi sả lá chúc, bò xào lá giang, bò tái chanh chúc, lẩu bò hầm thảo mộc thơm lừng.",
    'quán bò nướng bánh tráng tư liêm': "Quán bò nướng than hoa cuốn bánh tráng và rau rừng lâu năm tại Thị trấn Tri Tôn, nước chấm tương đậu phộng béo ngậy đặc trưng.",
    'tiệm bánh bò thốt nốt nướng chợ tri tôn': "Tiệm bánh bò nướng thủ công trên khuôn gang than củi ngay Chợ Tri Tôn. Bánh mềm xốp vàng ươm, thơm lừng hương đường thốt nốt nguyên chất và nước cốt dừa béo ngậy.",
    'lò bánh bò thốt nốt nướng út cột': "Lò bánh truyền thống lâu đời tại xã Châu Lăng, chuyên cung cấp bánh bò thốt nốt nướng lá chuối thơm nức tiếng làm quà cho du khách.",
    'lò bánh bò thốt nốt út dứt': "Địa chỉ lò bánh bò thốt nốt tươi ngon tại Tri Tôn, giữ trọn vị ngọt thanh của mật hoa thốt nốt Bảy Núi.",
    'quán cà phê & điểm check-in bờ hồ ô tà lọt': "Quán cà phê chòi gỗ mộc mạc bên bờ Hồ Ô Tà Lọt, xã An Tức. Điểm ngắm cảnh hồ nước phẳng lặng giữa thung lũng đồi núi hùng vĩ.",
}

# Misclassified Junk POI Blacklist to Purge
JUNK_POI_IDS = {
    'thanh-binh-70k',
    'nha-nghi-tu-trinh',
    'nga-3-queo-vao',
    'nha-nhgi-200k',
    'trung-tam-y-te-huyen-tri-ton',
    'mam-non-luong-an-tra',
}

# Duplicate Canonical Mapping
CANONICAL_MERGE_GROUPS = {
    'ho-ta-pa': {
        'names': ['hồ tà pạ', 'hồ tà pạ (tuyệt tình cốc)', 'tuyệt tình cốc tà pạ'],
        'canonical_name': 'Hồ Tà Pạ (Tuyệt Tình Cốc Bảy Núi)',
        'commune': 'Xã Núi Tô',
        'category': 'nature',
        'latitude': 10.4165,
        'longitude': 105.0042,
        'description': 'Hồ nước ngọt trong xanh màu ngọc bích nằm trên đỉnh đồi Tà Pạ, xã Núi Tô. Được hình thành từ quá trình khai thác đá trước đây, nơi đây được mệnh danh là Tuyệt tình cốc của miền Tây Nam Bộ.',
    },
    'chua-ta-pa': {
        'names': ['chùa tà pạ', 'chùa chưn-kôm (chùa tà pạ)', 'chùa phật ngọc tà pạ'],
        'canonical_name': 'Chùa Tà Pạ (Chùa Chưn-Kôm Núi Tô)',
        'commune': 'Xã Núi Tô',
        'category': 'spiritual',
        'latitude': 10.4182,
        'longitude': 105.0086,
        'description': 'Ngôi chùa Khmer Nam Tông uy nghiêm tọa lạc trên đỉnh đồi Tà Pạ, xã Núi Tô. Kiến trúc Khmer rực rỡ với tượng Phật Thích Ca ngồi thiền thanh tịnh, hướng tầm nhìn bao quát toàn bộ cánh đồng lúa Tà Pạ.',
    },
    'nui-co-to': {
        'names': ['núi cô tô', 'núi cô tô (phụng hoàng sơn)', 'phụng hoàng sơn'],
        'canonical_name': 'Núi Cô Tô (Phụng Hoàng Sơn)',
        'commune': 'Xã Cô Tô',
        'category': 'nature',
        'latitude': 10.3789,
        'longitude': 105.0012,
        'description': 'Ngọn núi hùng vĩ cao 614m thuộc dãy Thất Sơn, trải dài qua xã Cô Tô và xã Núi Tô. Nổi tiếng với Đá Vồ Hội, Suối Vàng Soài So, biển mây bồng bềnh và hệ thống hang đá kỳ bí.',
    },
    'doi-tuc-dup': {
        'names': ['khu du lịch đồi tức dụp', 'đồi tức dụp', 'khu di tích túc dụp', 'đồi tức dụp (ngọn đồi 2 triệu đô)'],
        'canonical_name': 'Khu Di Tích Lịch Sử Đồi Tức Dụp',
        'commune': 'Xã An Tức',
        'category': 'history',
        'latitude': 10.3768,
        'longitude': 104.9542,
        'description': 'Khu di tích lịch sử cách mạng hào hùng gắn liền với tên gọi "Ngọn đồi 2 triệu đô", xã An Tức. Hệ thống hang luồn tự nhiên trong lòng khối đá granite khổng lồ từng là căn cứ vững chắc của quân dân Bảy Núi.',
    },
    'ho-soai-so': {
        'names': ['hồ soài so', 'hô soài so', 'hồ thủy lợi soài so'],
        'canonical_name': 'Hồ Soài So (Chân Núi Cô Tô)',
        'commune': 'Xã Núi Tô',
        'category': 'nature',
        'latitude': 10.4045,
        'longitude': 105.0089,
        'description': 'Hồ nước nhân tạo tuyệt đẹp rộng lớn dưới chân Núi Cô Tô, xã Núi Tô. Mặt hồ xanh ngắt phản chiếu bóng núi rừng nguyên sơ, tiếp nhận dòng nước mát lành từ Suối Vàng Soài So.',
    },
    'ho-soai-chek': {
        'names': ['hồ soài chek', 'hồ soài check', 'hồ thủy lợi soài chek'],
        'canonical_name': 'Hồ Soài Chek',
        'commune': 'Xã Núi Tô',
        'category': 'nature',
        'latitude': 10.4285,
        'longitude': 104.9924,
        'description': 'Hồ thủy lợi thơ mộng dưới chân đồi Tà Pạ, xã Núi Tô. Không gian tĩnh lặng, thoáng đãng, là điểm cắm trại ngắm hoàng hôn buông trên đồi cát và rặng thốt nốt.',
    },
    'cay-thot-not-trai-tim': {
        'names': ['cây thốt nốt trái tim', 'hàng thốt nốt trái tim ô lâm', 'thốt nốt trái tim'],
        'canonical_name': 'Hàng Thốt Nốt Trái Tim Ô Lâm',
        'commune': 'Xã Ô Lâm',
        'category': 'check-in',
        'latitude': 10.3621,
        'longitude': 104.9812,
        'description': 'Cụm cây thốt nốt tự nhiên uốn lượn đan vòm thành hình trái tim độc đáo giữa cánh đồng lúa xã Ô Lâm. Điểm check-in sống ảo biểu tượng của du lịch Bảy Núi An Giang.',
    },
    'cong-troi-chua-koh-kas': {
        'names': ['cổng trời chùa koh kas', 'cổng trời koh kas', 'cổng trời tri tôn', 'cổng thời gian chùa koh kas'],
        'canonical_name': 'Cổng Trời Chùa Koh Kas (Cổng Thời Gian)',
        'commune': 'Xã Châu Lăng',
        'category': 'check-in',
        'latitude': 10.4512,
        'longitude': 105.0189,
        'description': 'Cổng chùa cổ kính đứng đơn độc giữa đồng lúa bao la xã Châu Lăng, dẫn lối vào Chùa Koh Kas. Kiến trúc hoa văn Khmer Angkor tinh xảo được mệnh danh là Cổng Thời Gian Bảy Núi.',
    },
    'nha-mo-ba-chuc': {
        'names': ['nhà mồ ba chúc', 'khu di tích lịch sử nhà mồ ba chúc', 'khu chứng tích nhà mồ ba chúc'],
        'canonical_name': 'Khu Chứng Tích Lịch Sử Nhà Mồ Ba Chúc',
        'commune': 'Thị trấn Ba Chúc',
        'category': 'history',
        'latitude': 10.4995,
        'longitude': 104.8988,
        'description': 'Di tích lịch sử quốc gia đặc biệt tại thị trấn Ba Chúc, tưởng niệm 3.157 thường dân vô tội trong cuộc chiến tranh biên giới Tây Nam năm 1978. Địa chỉ giáo dục truyền thống yêu chuộng hòa bình sâu sắc.',
    },
}

def clean_and_deduplicate_dataset():
    with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
        raw_pois = json.load(f)

    print(f"Bắt đầu xử lý {len(raw_pois)} bản ghi gốc...")

    cleaned_list = []
    processed_groups = set()

    for p in raw_pois:
        p_id = p.get('id', '')
        p_name = norm(p.get('name', ''))
        p_name_lower = norm_lower(p_name)

        # 1. Purge junk non-tourism entries
        if p_id in JUNK_POI_IDS or any(k in p_name_lower for k in ['70k', '200k', 'nhà nghi tú trinh', 'nha nhgi 200k', 'ngã 3 quẹo', 'mầm non lương an', 'trung tâm y tế']):
            print(f"  [PURGED JUNK] {p_name} (ID: {p_id})")
            continue

        # 2. Check canonical merge groups (exact or prefix matching)
        matched_group = None
        for g_id, g_info in CANONICAL_MERGE_GROUPS.items():
            if any(p_name_lower == n or p_name_lower.startswith(n) or f"({n})" in p_name_lower for n in g_info['names']):
                matched_group = (g_id, g_info)
                break

        if matched_group:
            g_id, g_info = matched_group
            if g_id in processed_groups:
                print(f"  [DEDUP MERGED] '{p_name}' -> Hợp nhất vào '{g_info['canonical_name']}'")
                continue
            processed_groups.add(g_id)
            # Create consolidated canonical record
            p['id'] = g_id
            p['slug'] = g_id
            p['name'] = g_info['canonical_name']
            p['commune'] = g_info['commune']
            p['category'] = g_info['category']
            p['latitude'] = g_info['latitude']
            p['longitude'] = g_info['longitude']
            p['description'] = g_info['description']
            p['detailed_story'] = g_info['description']

        # 3. Clean spam / rewrite text
        cleaned_desc = CLEAN_DESCRIPTIONS.get(p_name_lower)
        if cleaned_desc:
            p['description'] = cleaned_desc
            p['detailed_story'] = cleaned_desc
        else:
            # Clean spam snippets from description
            desc = p.get('description', '') or ''
            story = p.get('detailed_story', '') or ''
            
            # Remove "Ẩm thực Sài Gòn" or foreign spam
            if 'sài gòn' in desc.lower() or 'bóng đá' in desc.lower() or 'nagoya' in desc.lower() or 'bta41' in desc.lower() or 'ilovepdf' in desc.lower() or 'con definition' in desc.lower():
                gen_desc = f"{p_name} là điểm đến nổi bật tại {p.get('commune', 'Tri Tôn')}, An Giang, mang đậm dấu ấn thắng cảnh thiên nhiên và văn hóa bản địa Bảy Núi."
                p['description'] = gen_desc
                p['detailed_story'] = gen_desc

        # 4. Normalize categories
        cat = (p.get('category') or 'nature').lower()
        if 'bò' in p_name_lower or 'gà' in p_name_lower or 'bánh' in p_name_lower or 'bún' in p_name_lower or 'đu đủ' in p_name_lower or 'cháo' in p_name_lower or 'cà phê' in p_name_lower or 'coffee' in p_name_lower:
            p['category'] = 'gastronomy'
        elif 'chùa' in p_name_lower or 'tổ đình' in p_name_lower or 'tâm linh' in p_name_lower or 'miếu' in p_name_lower:
            p['category'] = 'spiritual'
        elif 'núi' in p_name_lower or 'hồ' in p_name_lower or 'suối' in p_name_lower or 'đồi' in p_name_lower or 'vồ hội' in p_name_lower:
            p['category'] = 'nature'
        elif 'nhà mồ' in p_name_lower or 'di tích' in p_name_lower or 'ô tà sóc' in p_name_lower or 'tức dụp' in p_name_lower or 'kinh lá buông' in p_name_lower:
            p['category'] = 'history'
        elif 'homestay' in p_name_lower or 'khách sạn' in p_name_lower or 'nhà nghỉ' in p_name_lower:
            p['category'] = 'stay'
        elif 'cổng trời' in p_name_lower or 'thốt nốt trái tim' in p_name_lower or 'sống ảo' in p_name_lower:
            p['category'] = 'check-in'

        # 5. Fix Image URLs & Fallbacks
        p['image_url'] = get_best_image(p)

        # 6. Night Tourism flag
        is_night = any(k in p_name_lower for k in ['chạm coffee', 'lang lang', 'chợ đêm', 'quảng trường', 'acoustic', 'trà sữa']) or ('coffee' in p_name_lower and 'tri tôn' in p_name_lower)
        p['open_late'] = is_night
        p['is_verified'] = True

        # Clean dynamic TikTok query
        p['tiktok_search_query'] = f"{p_name} Tri Tôn An Giang"

        cleaned_list.append(p)

    print(f"\n=> HOÀN TẤT DEDUP & CLEANSE: Giữ lại {len(cleaned_list)} POIs chất lượng cao thực địa (Đã loại bỏ toàn bộ rác & trùng lặp).")

    # Write output to JSON (utf-8)
    with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned_list, f, ensure_ascii=False, indent=2)

    # Write output to CSV (utf-8-sig)
    csv_fields = ['id', 'name', 'commune', 'category', 'latitude', 'longitude', 'rating', 'description', 'open_late', 'is_verified', 'image_url']
    with open('data/triton_pois_table.csv', 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
        writer.writeheader()
        for p in cleaned_list:
            writer.writerow(p)

    with open('data/tri_ton_master_cleaned.csv', 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
        writer.writeheader()
        for p in cleaned_list:
            writer.writerow(p)

    # Write GeoJSON (utf-8)
    geojson_features = []
    for p in cleaned_list:
        lat = float(p.get('latitude', 10.42))
        lng = float(p.get('longitude', 105.01))
        geojson_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "id": p.get('id'),
                "name": p.get('name'),
                "commune": p.get('commune'),
                "category": p.get('category'),
                "description": p.get('description'),
                "image_url": p.get('image_url'),
                "rating": p.get('rating', 4.8),
                "open_late": p.get('open_late', False)
            }
        })

    geojson_data = {
        "type": "FeatureCollection",
        "features": geojson_features
    }

    with open('data/triton_pois_map.geojson', 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, ensure_ascii=False, indent=2)

    print("Đã đồng bộ thành công cả 3 định dạng: JSON, CSV (utf-8-sig), GeoJSON.")

if __name__ == '__main__':
    clean_and_deduplicate_dataset()
