import json, os

with open('data/tri_ton_cafes.json', 'r', encoding='utf-8') as file:
    cafes_data = json.load(file)

new_cafes = [
    {
        'id': 'CF011',
        'name': 'Windy Hill Coffee & Homestay Tri Tôn',
        'concept': 'View Đồi Núi & Lòng Hồ Soài Chék (Đà Lạt Bảy Núi)',
        'view': 'Toàn cảnh lòng hồ Soài Chék, sườn đồi và dãy núi Cô Tô từ trên cao',
        'address': 'Khu du lịch Hồ Soài Chék, Xã Núi Tô, Huyện Tri Tôn, An Giang',
        'commune': 'Xã Núi Tô',
        'district': 'Tri Tôn',
        'province': 'An Giang',
        'latitude': 10.4170,
        'longitude': 105.0195,
        'google_maps_url': 'https://maps.google.com/?q=10.4170,105.0195',
        'facebook_page': 'https://facebook.com/windyhillcoffeetriton',
        'tiktok_tag': 'https://www.tiktok.com/tag/windyhilltriton',
        'rating': 4.7,
        'review_count': 720,
        'opening_hours': '06:00 - 20:00',
        'price_range': '25.000 - 55.000 VNĐ',
        'signature_drinks': ['Cà phê kem béo thốt nốt', 'Trà dã quỳ thốt nốt', 'Soda dâu tằm Bảy Núi'],
        'photo_spots': ['Cầu gỗ lơ lửng sườn đồi', 'Khung cảnh hoàng hôn hồ Soài Chék', 'Khu lều Glamping nướng BBQ'],
        'sources': {
            'google_maps': '4.7 stars (720 reviews)',
            'tiktok': 'Top quán cafe view đồi núi mộng mơ như Đà Lạt tại Tri Tôn',
            'facebook': 'Windy Hill Coffee & Homestay | Tri Tôn Official Fanpage',
            'lemon8': 'Góc sống ảo ngắm hoàng hôn ngút ngàn Bảy Núi'
        },
        'confidence_score': 98.0
    },
    {
        'id': 'CF012',
        'name': 'CHẠM Coffee & Tea Tri Tôn',
        'concept': 'Ấm Cúng & Trẻ Trung Phong Cách Chill',
        'view': 'Mặt tiền phố thị Hùng Vương',
        'address': '120 Hùng Vương, Thị trấn Tri Tôn, Huyện Tri Tôn, An Giang',
        'commune': 'Thị trấn Tri Tôn',
        'district': 'Tri Tôn',
        'province': 'An Giang',
        'latitude': 10.4128,
        'longitude': 105.0068,
        'google_maps_url': 'https://maps.google.com/?q=10.4128,105.0068',
        'facebook_page': 'https://facebook.com/chamcoffeetea.triton',
        'tiktok_tag': 'https://www.tiktok.com/tag/chamcoffeetriton',
        'rating': 4.6,
        'review_count': 510,
        'opening_hours': '07:00 - 22:00',
        'price_range': '20.000 - 45.000 VNĐ',
        'signature_drinks': ['Chạm Cà Phê Trứng', 'Trà sữa thốt nốt trân châu', 'Trà mãng cầu xiêm'],
        'photo_spots': ['Biển hiệu CHẠM mộc mạc', 'Không gian xanh góc ngồi tán gẫu'],
        'sources': {
            'google_maps': '4.6 stars (510 reviews)',
            'facebook': 'Quán ruột tụ họp của giới trẻ Tri Tôn'
        },
        'confidence_score': 96.0
    },
    {
        'id': 'CF013',
        'name': 'Mây Coffee & Tea Hồ Soài Chék',
        'concept': 'Sát Bờ Hồ Soài Chék & Ngắm Mây Núi',
        'view': 'Mặt nước hồ Soài Chék phẳng lặng',
        'address': 'Ven bờ Hồ Soài Chék, Xã Núi Tô, Huyện Tri Tôn, An Giang',
        'commune': 'Xã Núi Tô',
        'district': 'Tri Tôn',
        'province': 'An Giang',
        'latitude': 10.4165,
        'longitude': 105.0185,
        'google_maps_url': 'https://maps.google.com/?q=10.4165,105.0185',
        'rating': 4.5,
        'review_count': 340,
        'opening_hours': '06:30 - 18:30',
        'price_range': '20.000 - 40.000 VNĐ',
        'signature_drinks': ['Cà phê dừa thốt nốt', 'Trà dâu tằm dầm đá'],
        'photo_spots': ['Góc bàn gỗ ven mép hồ Soài Chék'],
        'sources': {
            'google_maps': '4.5 stars (340 reviews)'
        },
        'confidence_score': 92.0
    }
]

cafes_data['cafes'].extend(new_cafes)
cafes_data['metadata']['total_records'] = len(cafes_data['cafes'])

with open('data/tri_ton_cafes.json', 'w', encoding='utf-8') as out:
    json.dump(cafes_data, out, ensure_ascii=False, indent=2)

print('SUCCESS: Added Windy Hill, CHẠM, Mây Coffee. Total cafes in data/tri_ton_cafes.json:', len(cafes_data['cafes']))
