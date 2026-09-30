"""
Script Seed Dữ Liệu 12 Bài Viết Tri Thức Tổng Quan & Văn Hóa Tri Tôn (knowledge_base)
Vào CSDL Supabase PostgreSQL Live sử dụng Google Gemini Embedding (768d).
"""

import os
import sys
import json
import time
import requests
from dotenv import load_dotenv
from supabase import create_client

# Ensure UTF-8 output encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

GEMINI_API_KEYS = [
    os.environ.get('GEMINI_API_KEY'),
    os.environ.get('GEMINI_API_KEY_2'),
    os.environ.get('GEMINI_API_KEY_3'),
    os.environ.get('GEMINI_API_KEY_4'),
]
GEMINI_API_KEYS = [k for k in GEMINI_API_KEYS if k]

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing Supabase URL or Key in .env.local")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_embedding(text: str) -> list:
    """Generate 768d vector embedding using gemini-embedding-001."""
    for key in GEMINI_API_KEYS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={key}"
        payload = {
            "model": "models/gemini-embedding-001",
            "content": {"parts": [{"text": text}]},
            "outputDimensionality": 768
        }
        try:
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                data = res.json()
                vector = data.get('embedding', {}).get('values', [])
                if len(vector) == 768:
                    return vector
        except Exception as e:
            print(f"⚠️ [Embedding Warning] Key error: {e}")
            continue
    raise RuntimeError("Tất cả Gemini API Keys đều không tạo được Vector Embedding!")

# 12 Bài viết Tri Thức Chuyên Sâu
KNOWLEDGE_ARTICLES = [
    {
        "id": "KB001",
        "topic": "overview_tri_ton",
        "title": "Giới thiệu tổng quan về Tri Tôn - Bảy Núi An Giang",
        "category": "overview",
        "summary": "Tri Tôn là khu vực vùng cao đặc biệt thuộc tỉnh An Giang, nổi tiếng với vùng đất Bảy Núi (Thất Sơn), địa hình sơn thủy hữu tình, sự giao thoa văn hóa giữa người Kinh và người Khmer Nam Bộ.",
        "related_pois": ["PL001", "HG001", "PL021"],
        "content": """# Giới Thiệu Tổng Quan Về Tri Tôn — Bảy Núi An Giang

## 1. Vị Trí Địa Lý & Hành Chính
Tri Tôn nằm ở phía tây nam tỉnh An Giang, giáp ranh với Vương quốc Campuchia. Đây là địa bàn sinh sống gắn kết giữa cộng đồng người Kinh và người Khmer Nam Bộ.
Hệ thống hành chính Tri Tôn bao gồm các đơn vị: **Thị trấn Tri Tôn, Thị trấn Ba Chúc, Xã Núi Tô, Chau Lăng, An Tức, Ô Lâm, Lương Phi, An Hảo, Tà Đảnh, Lê Trì**.

## 2. Danh Thắng Bảy Núi (Thất Sơn)
Vùng Bảy Núi mang vẻ đẹp thiên nhiên kỳ vĩ với những ngọn núi nổi tiếng:
- **Núi Cô Tô (Phụng Hoàng Sơn)**: Nổi tiếng với Suối Bạc, Đuôi Nhái và khung cảnh săn mây tuyệt đẹp.
- **Núi Tà Pạ**: Nơi có Hồ Tà Pạ xanh ngọc bích và Chùa Tà Pạ mang kiến trúc Khmer uy nghiêm trên đỉnh núi.
- **Núi Phụng Hoàng & Núi Dài**: Nơi lưu giữ nét hoang sơ của núi rừng Bảy Núi.

## 3. Khí Hậu & Thời Điểm Du Lịch Lý Tưởng
- **Mùa lúa chín vàng (Tháng 8 - 9 & Tháng 11 - 12)**: Cánh đồng lúa Tà Pạ nhuộm sắc vàng rực rỡ, thời điểm check-in tuyệt đẹp.
- **Mùa nước nổi (Tháng 9 - 11)**: Nước về ngập tràn cánh đồng thốt nốt, lòng hồ Tà Pạ và Soài Chek dâng cao xanh trong ngọc.
- **Mùa lễ hội (Tháng 8 - 9 âm lịch)**: Dịp diễn ra Lễ Đôl Ta và Lễ hội Đua bò Bảy Núi sôi động."""
    },
    {
        "id": "KB002",
        "topic": "kinh_la_buong",
        "title": "Kinh Lá Buông Người Khmer — Di Sản Văn Hóa Phi Vật Thể Quốc Gia",
        "category": "culture_heritage",
        "summary": "Kinh lá buông là kho tàng tri thức, phật giáo và văn hóa Khmer Nam Bộ được viết trên lá thốt nốt/lá buông bằng sắt nhọn, bảo tồn độc bản tại các ngôi chùa Khmer Tri Tôn như Chùa Xà Tón.",
        "related_pois": ["HG002", "HG001"],
        "content": """# Di Sản Quốc Gia: Kinh Lá Buông Người Khmer Nam Bộ

## 1. Kinh Lá Buông Là Gì?
Kinh lá buông (Satra Sleok Rith) là những bộ kinh Phật, truyện cổ dân gian, tài liệu y học và luật tục được các chư tăng Khmer viết tỉ mỉ trên lá cây buông (hoặc lá thốt nốt). Đây là Di sản văn hóa phi vật thể quốc gia quý giá.

## 2. Kỹ Thuật Chế Tác Và Khắc Viết Thủ Công
- **Chọn lá**: Lá buông/thốt nốt bánh tẻ được sấy khô, ép phẳng và luộc qua thảo mộc để chống mọt.
- **Khắc chữ**: Sư thầy dùng bút sắt (Đoan) khắc từng nét chữ Khmer cổ lên lá.
- **Quết mực**: Mực được chế tạo từ than củi hòa với dầu rái. Khi quết lên lá, than sẽ bám chặt vào các rãnh chữ đã khắc, tạo nên dòng chữ đen mun tồn tại hàng trăm năm.

## 3. Trung Tâm Bảo Tồn Tại Tri Tôn
Chùa Xà Tón (Chùa Xvayton - Xã Tri Tôn) là nơi lưu giữ nhiều bộ kinh lá buông cổ nhất An Giang, với hơn 100 bộ kinh giá trị lịch sử và tâm linh sâu sắc."""
    },
    {
        "id": "KB003",
        "topic": "sene_dolta_dua_bo",
        "title": "Lễ Hội Đua Bò Bảy Núi & Lễ Sene Dolta Người Khmer",
        "category": "culture_heritage",
        "summary": "Lễ Sene Dolta là lễ cúng ông bà tổ tiên lớn nhất của người Khmer. Đi kèm với lễ hội là Hội Đua bò Bảy Núi kịch tính thu hút đông đảo du khách và nhiếp ảnh gia.",
        "related_pois": ["HG003", "EV002"],
        "content": """# Lễ Sene Dolta & Hội Đua Bò Bảy Núi Chân Thật

## 1. Ý Nghĩa Lễ Sene Dolta
Lễ Sene Dolta (lễ cúng ông bà) diễn ra từ ngày 29/8 đến 1/9 âm lịch hàng năm. Đây là dịp để con cháu người Khmer thể hiện lòng hiếu kính đối với bậc tổ tiên đã khuất, dâng cơm lên chư tăng tại chùa và thắt chặt tình đoàn kết phum sóc.

## 2. Hội Đua Bò Bảy Núi Sôi Động
- **Nguồn gốc**: Xuất phát từ việc các phum sóc đưa bò đến cày ruộng giúp chùa. Sau khi xong việc, các đôi bò được cho thi tài chạy tốc độ dưới ruộng bùn.
- **Thể thức thi đấu**: Gồm 2 vòng — **Vòng Hô** (điều khiển bò đi thong thả biểu diễn) và **Vòng Thả** (người điều khiển bứt tốc, chèn chân lên bừa để bò phi nước đại về đích).
- **Vị trí diễn ra**: Sân đua bò Chùa Thơ Mít (Xã Vĩnh Trung / Châu Lăng)."""
    },
    {
        "id": "KB004",
        "topic": "la_chuc_ga_dot",
        "title": "Văn Hóa Ẩm Thực Lá Chúc & Bí Quyết Gà Đốt Ô Thum Bản Địa",
        "category": "food_culture",
        "summary": "Cây chúc Bảy Núi (Citrus hystrix - Krut) với hương thơm the cay nồng nàn là linh hồn ẩm thực Tri Tôn, tạo nên nghệ thuật Gà đốt Ô Thum trong thố đất lót muối hột trứ danh khắp cả nước.",
        "related_pois": ["FD006", "FD009", "PL004"],
        "content": """# Đặc Sản Trái Trúc & Bí Quyết Gà Đốt Ô Thum Bản Địa

## 1. Cây Trúc Bảy Núi (Trái Chúc — Citrus hystrix — Krut) — Cổ Thụ Thất Sơn
Cây trúc (tiếng Khmer gọi là Krut) là loài cây thân gỗ có gai họ cam chanh bản địa lâu đời tại vùng đồi núi Thất Sơn (Tri Tôn).
- **Lá hình số 8 đặc trưng**: Phiến lá kép với cuống lá có cánh rộng nở như phiến lá, chứa hàm lượng tinh dầu thơm nồng gắt gấp nhiều lần chanh thông thường.
- **Trái trúc vỏ xù xì**: Vỏ dày sần sùi nhiều tinh dầu, nước cốt chua thanh gắt nhưng ngọt hậu, là linh hồn gia vị trong món gà đốt, cháo bò và chén muối ớt chấm.
- **Quy chuẩn bản địa**: Tuyệt đối không gọi là 'chanh rừng' hay đánh đồng với chanh thường, chanh Thái lai tạp.

## 2. Bí Quyết Gà Đốt Ô Thum Chuẩn Bản Địa (Hồ Ô Thum — Xã Ô Lâm)
Món ăn bắt nguồn từ đồng bào Khmer quanh hồ Ô Thum, xã Ô Lâm:
- **Chọn gà**: Dùng gà đồi hoặc gà thả vườn Bảy Núi (1.2kg – 1.5kg), thịt săn chắc, da mỏng ít mỡ.
- **Ướp gia vị**: Gà ướp với sả băm, tỏi khô, ớt hiểm, mật ong rừng hoặc đường thốt nốt nguyên chất và lá trúc xắt chỉ nhuyễn.
- **Kỹ thuật đốt thố đất lót muối hột**: Rải lớp muối hột dày 1-2cm dưới đáy thố đất hoặc nồi gang, phủ kín bằng sả cây đập dập và cành lá trúc tươi. Đặt gà lên trên, đậy kín nắp và ủ than củi hồng trong 35-45 phút. Hơi nóng từ muối hột và tinh dầu lá trúc xông chín gà, da vàng ươm cánh gián giòn ráo, thịt mọng nước ngọt ngào.
- **Phản bác sai lệch**: Tuyệt đối không phải gà chiên dầu giòn và không phải gà nướng vỉ than hoa thông thường."""
    },
    {
        "id": "KB005",
        "topic": "lich_su_ba_chuc_tuc_dup",
        "title": "Lịch Sử Di Tích: Nhà Mồ Ba Chúc & Căn Cứ Đồi Tức Dụp",
        "category": "history",
        "summary": "Tri Tôn lưu giữ những trang sử hào hùng và đau thương của dân tộc qua Di tích lịch sử Nhà mồ Ba Chúc và ngọn đồi Tức Dụp kiên cường trong chiến tranh.",
        "related_pois": ["HG004", "HG005"],
        "content": """# Lịch Sử Di Tích: Nhà Mồ Ba Chúc & Căn Cứ Đồi Tức Dụp

## 1. Di Tích Lịch Sử Nhà Mồ Ba Chúc (Thị Trấn Ba Chúc)
- **Bối cảnh**: Nơi ghi dấu tội ác chiến tranh của tập đoàn Pol Pot năm 1978 đối với 3.157 người dân lành Ba Chúc.
- **Ý nghĩa**: Nhà mồ Ba Chúc lưu giữ hài cốt các nạn nhân, là địa điểm giáo dục truyền thống lịch sử, lòng yêu hòa bình và tưởng niệm thiêng liêng.

## 2. Đồi Tức Dụp — "Ngọn Đồi 2 Triệu Đô" (Xã An Tức)
- **Lịch sử**: Tức Dụp (theo tiếng Khmer nghĩa là "Nước đêm") là hệ thống hang đá tự nhiên kiên cố, từng là căn cứ cách mạng huyền thoại của quân dân An Giang.
- **Tên gọi "2 triệu đô"**: Trong chiến dịch 128 ngày đêm năm 1968-1969, quân đội Mỹ đã ném hàng ngàn tấn bom đạn trị giá hơn 2 triệu USD nhưng không thể đập tan được căn cứ Tức Dụp."""
    },
    {
        "id": "KB006",
        "topic": "chua_khmer_etiquette",
        "title": "Quy Tắc Ứng Xử & Văn Hóa Khi Tham Quan Chùa Nam Tông Khmer",
        "category": "travel_tips",
        "summary": "Những lưu ý quan trọng về trang phục, tác phong và nghi lễ khi bước vào chánh điện và không gian tôn nghiêm của các ngôi chùa Khmer tại Tri Tôn.",
        "related_pois": ["HG001", "HG002", "CK010"],
        "content": """# Cẩm Nang Quy Tắc Ứng Xử Tại Chùa Nam Tông Khmer

## 1. Trang Phục Lịch Sự, Kín Đáo
- Mặc quần dài hoặc váy qua gối. Không mặc áo ba lỗ, áo xẻ sâu hoặc quần đùi mỏng khi bước vào chánh điện.

## 2. Nghi Lễ Bỏ Giày Dép & Nón Mũ
- Trước khi bước lên bậc thềm chánh điện hoặc phòng ở chư tăng, bắt buộc bỏ giày, dép và nón mũ bên ngoài.

## 3. Thái Độ & Hành Vi Xưng Hô
- Chắp hai tay trước ngực chào kính trọng khi gặp các vị Sư Thầy (Sư Thượng tọa/Đại đức).
- Phụ nữ lưu ý **không va chạm trực tiếp** với chư tăng theo giáo luật Nam Tông Phật giáo.

## 4. Giữ Trật Tự & Chụp Ảnh Văn Minh
- Không chỉ trỏ linh vật, tự ý sờ vào tượng Phật linh thiêng.
- Giữ vệ sinh chung, không xả rác tại khuôn viên chùa."""
    },
    {
        "id": "KB007",
        "topic": "lang_nghe_thot_not",
        "title": "Cây Thốt Nốt & Làng Nghề Nấu Đường Thốt Nốt Truyền Thống",
        "category": "craft_villages",
        "summary": "Cây thốt nốt là biểu tượng thanh bình của vùng đất Bảy Núi. Lò đường thốt nốt truyền thống tại Châu Lăng, Ô Lâm đem đến hương vị ngọt thanh tự nhiên độc đáo.",
        "related_pois": ["FD016", "PL011"],
        "content": """# Cây Thốt Nốt & Làng Nghề Nấu Đường Truyền Thống Bảy Núi

## 1. Cây Thốt Nốt — Biểu Tượng Tri Tôn
Cây thốt nốt gắn liền với đời sống người Khmer Nam Bộ. Từ cuống hoa thốt nốt, người dân hứng lấy từng giọt mật ngọt thanh dịu mát để uống tươi hoặc thắng thành đường thốt nốt dẻo quánh.

## 2. Quy Trình Thắng Đường Thủ Công Tại Chau Lăng - Ô Lâm
- **Thu hoạch mật**: Người thợ trèo lên ngọn cây thốt nốt cao 10-15m từ sáng sớm để thu nước mật.
- **Nấu đường**: Nước mật tươi được đun trong chảo lớn liên tục từ 4-5 tiếng cho đến khi sánh dẻo.
- **Đổ khuôn & Đóng gói**: Đường được đánh tẻ cho mịn rồi đổ vào bánh lá thốt nốt tròn hoặc hũ nhựa.

## 3. Món Ngon Từ Thốt Nốt
- Bánh bò thốt nốt nướng cốt dừa, Chè thốt nốt đá lạnh, Kem thốt nốt tươi, Đường thốt nốt chảy dẻo làm quà."""
    },
    {
        "id": "KB008",
        "topic": "cam_nang_theo_mua",
        "title": "Cẩm Nang Kinh Nghiệm Du Lịch Tri Tôn Theo Mùa Trong Năm",
        "category": "travel_tips",
        "summary": "Hướng dẫn lựa chọn thời điểm đẹp nhất để trải nghiệm săn mây, ngắm mùa lúa chín vàng Tà Pạ và mùa nước nổi miền Tây tại Tri Tôn.",
        "related_pois": ["PL001", "PL009", "PL011"],
        "content": """# Cẩm Nang Thời Điểm Du Lịch Tri Tôn Đẹp Nhất

## 1. Mùa Lúa Chín Vàng (Tháng 8 - 9 & Tháng 11 - 12)
- **Đặc điểm**: Cánh đồng lúa Tà Pạ khoác lên màu áo vàng óng tuyệt đẹp.
- **Hoạt động**: Chụp ảnh ruộng lúa, ngắm bình minh trên đồi Tà Pạ, trải nghiệm ngắm đồng lúa từ Cổng Trời Koh Kas.

## 2. Mùa Nước Nổi Bảy Núi (Tháng 9 - 11)
- **Đặc điểm**: Nước từ sông Mê Kông đổ về ngập tràn cánh đồng thốt nốt. Hồ Tà Pạ và Hồ Soài Chek dâng nước xanh ngắt.
- **Hoạt động**: Đi xuồng mùa nước nổi, thưởng thức đặc sản lẩu cá linh bông điên điển, cá lóc nướng trui.

## 3. Mùa Nắng Ráo & Săn Mây (Tháng 1 - 5)
- **Đặc điểm**: Thời tiết khô ráo, lộng gió, thích hợp trekking và cắm trại.
- **Hoạt động**: Cắm trại đêm trên Đồi Tức Dụp / Núi Cô Tô, đón bình minh săn mây hồ Ô Thum."""
    },
    {
        "id": "KB009",
        "topic": "huong_dan_di_chuyen",
        "title": "Hướng Dẫn Di Chuyển & Lộ Trình Đến Tri Tôn Từ TPHCM / Cần Thơ",
        "category": "travel_tips",
        "summary": "Chi tiết các tuyến đường giao thông xe khách, xe máy và lộ trình di chuyển thuận tiện nhất từ TP.HCM, Cần Thơ và TP. Long Xuyên về Tri Tôn.",
        "related_pois": ["PL021"],
        "content": """# Hướng Dẫn Di Chuyển Đến Tri Tôn An Giang

## 1. Từ TP. Hồ Chí Minh đi Tri Tôn (~240 km)
- **Xe khách**: Đặt xe Phương Trang, Huệ Nghĩa hoặc Kim Hương đi thẳng từ Bến xe Miền Tây về Bến xe Tri Tôn (thời gian: 5 - 6 tiếng).
- **Xe máy / Ô tô cá nhân**: 
  - Lộ trình 1: TPHCM $\rightarrow$ Nút giao Cao tốc Trung Lương - Mỹ Thuận $\rightarrow$ Cầu Vàm Cống $\rightarrow$ TP. Long Xuyên $\rightarrow$ Tỉnh lộ 941 $\rightarrow$ Thị trấn Tri Tôn.

## 2. Từ TP. Cần Thơ đi Tri Tôn (~110 km)
- Đi theo Quốc lộ 91 qua Quận Thốt Nốt $\rightarrow$ Thành phố Long Xuyên $\rightarrow$ Tỉnh lộ 941 đến Thị trấn Tri Tôn (thời gian: ~2.5 tiếng).

## 3. Phương Tiện Di Chuyển Tại Tri Tôn
- Thuê xe máy tại các Homestay hoặc nhà khách trung tâm Thị trấn Tri Tôn (giá ~120k - 150k/ngày) để dễ dàng di chuyển trên các cung đường núi hẹp."""
    },
    {
        "id": "KB010",
        "topic": "huyen_thoai_bay_nui",
        "title": "Huyền Thoại Vùng Thất Sơn - Bảy Núi An Giang",
        "category": "overview",
        "summary": "Thất Sơn (Bảy Núi) là vùng núi kỳ vĩ bao gồm Núi Cấm, Núi Cô Tô, Núi Dài, Núi Tượng, Núi Két, Núi Nước và Núi Dài 5 Giếng với nhiều giai thoại văn hóa thiêng liêng.",
        "related_pois": ["PL001", "PL009", "PL010"],
        "content": """# Khám Phá Vùng Đất Huyền Thoại Thất Sơn - Bảy Núi

## 1. Danh Sách 7 Ngọn Núi Trong Thất Sơn
Vùng Thất Sơn bao gồm 7 ngọn núi tiêu biểu mang dấu ấn tâm linh và thiên nhiên kỳ thú:
1. **Phụng Hoàng Sơn (Núi Cô Tô - Tri Tôn)**: Ngọn núi hùng vĩ nổi tiếng với hồ Soài So và danh thắng Suối Bạc.
2. **Thiên Cấm Sơn (Núi Cấm)**: Nóc nhà miền Tây với hồ Thủy Liêm và Chùa Phật Lớn.
3. **Ngọa Long Sơn (Núi Dài)**: Dãy núi dài nhất Bảy Núi với thiên nhiên hoang sơ.
4. **Anh Vũ Sơn (Núi Két)**: Nơi có mỏm đá Sân Tiên hình chiếc mỏ giẻ.
5. **Liên Hoa Sơn (Núi Tượng)**: Nằm tại Ba Chúc, gắn liền với di tích lịch sử.
6. **Ngũ Hồ Sơn (Núi Dài 5 Giếng)**: Nổi tiếng với những giếng đá tự nhiên trên núi.
7. **Thủy Mộc Sơn (Núi Nước)**: Ngọn núi nhỏ nhất nằm giữa cánh đồng Ba Chúc."""
    },
    {
        "id": "KB011",
        "topic": "am_thuc_cho_dem",
        "title": "Văn Hóa Ẩm Thực Chợ Đêm Tri Tôn & Các Món Đặc Trưng Bản Địa",
        "category": "food_culture",
        "summary": "Khám phá ẩm thực phong phú tại Tri Tôn với Cháo bò trái chúc, Bún cá củ ngải Khmer, Bánh bò thốt nốt nướng than và Đu đủ đâm giòn cay chuẩn vị.",
        "related_pois": ["FD009", "FD013", "FD016", "FD017"],
        "content": """# Thiên Đường Ẩm Thực Chợ Đêm & Đường Phố Tri Tôn

## 1. Cháo Bò Trái Chúc Thưởng Thức Sáng Sớm
Cháo bò Tri Tôn có vị ngọt sánh đậm đà từ thịt và lòng bò tươi Bảy Núi, nấu nhừ cùng gạo thơm rang nhẹ, nêm chút lá chúc xắt nhuyễn và vắt nước cốt trái chúc tươi chua thanh dịu mát, chấm kèm chén mắm ruốc sả ớt đậm đà.

## 2. Bún Cá Củ Ngải Khmer Bản Địa (Tuyệt Đối Không Có Bún Nước Lèo Mắm)
Tri Tôn tuyệt đối không có bún nước lèo nấu mắm bồ hóc nồng đục. Món bún cá Khmer bản địa trứ danh là **Bún Cá Củ Ngải**:
- **Nước dùng thanh tao**: Ninh từ xương cá lóc đồng cùng củ ngải bún (Fingerroot) đập dập và nghệ tươi, tạo sắc vàng ươm tự nhiên, vị thanh ngọt mát lành tốt cho đường ruột.
- **Thịt cá vàng ươm**: Cá lóc đồng luộc gỡ thịt nạc, xào nhẹ với nghệ tươi cho săn chắc thơm phức.
- **Rau ăn kèm đồng nội**: Bông điên điển vàng rực mùa nước nổi, rau nhút non giòn, bắp chuối bào và rau muống chẻ.

## 3. Bánh Bò Thốt Nốt Nướng Than Cốt Dừa
Chiếc bánh bò màu vàng óng ả tỏa hương thơm nồng dịu của đường thốt nốt nguyên chất, nướng cháy xèo trên than hồng béo ngậy vị cốt dừa bùi béo."""
    },
    {
        "id": "KB012",
        "topic": "cam_trai_san_may",
        "title": "Hướng Dẫn Cắm Trại & Săn Mây An Toàn Tại Bảy Núi",
        "category": "travel_tips",
        "summary": "Kinh nghiệm cắm trại đón bình minh săn mây trên Đồi Tà Pạ, Suối Bạc Núi Cô Tô và các khu cắm trại ven hồ Ô Thum an toàn.",
        "related_pois": ["PL001", "PL004", "PL009"],
        "content": """# Cẩm Nang Cắm Trại & Săn Mây An Toàn Tại Tri Tôn

## 1. Các Vị Trí Săn Mây & Cắm Trại Đẹp Nhất
- **Đồi Tà Pạ**: Nơi đón bình minh tuyệt đẹp nhìn toàn cảnh cánh đồng lúa và sương mờ dăng lối.
- **Khu vực Suối Bạc - Núi Cô Tô**: Điểm cắm trại lộng gió mát mẻ, ngắm toàn cảnh thị trấn Tri Tôn lên đèn về đêm.
- **Bờ Hồ Ô Thum / Soài Chek**: Không gian cắm trại ven hồ yên tĩnh thích hợp tiệc BBQ ngoài trời.

## 2. Các Lưu Ý An Toàn Quan Trọng
- **Chuẩn bị đồ đạc**: Mang theo lều chống nước, túi ngủ, đèn pin chiếu sáng và thuốc xịt côn trùng.
- **Xin phép địa phương**: Khai báo tạm trú hoặc thông báo với quản lý địa điểm nếu cắm trại qua đêm trên đồi/núi.
- **Bảo vệ môi trường**: Không đốt lửa trại gần rừng khô và thu gom 100% rác thải trước khi rời đi."""
    }
]

def main():
    print(f"🚀 Đang khởi chạy Script Seed Knowledge Base ({len(KNOWLEDGE_ARTICLES)} bài viết)...")
    success_count = 0
    
    for idx, article in enumerate(KNOWLEDGE_ARTICLES):
        print(f"[{idx+1}/{len(KNOWLEDGE_ARTICLES)}] Đang xử lý: {article['id']} - {article['title']}...")
        
        # Combined text for high-quality embedding
        embed_text = f"{article['title']}\n{article['summary']}\nCategory: {article['category']}\n{article['content']}"
        
        try:
            vector_768 = generate_embedding(embed_text)
            
            record = {
                "id": article["id"],
                "topic": article["topic"],
                "title": article["title"],
                "category": article["category"],
                "content": article["content"],
                "summary": article["summary"],
                "related_pois": article["related_pois"],
                "embedding": vector_768
            }
            
            # Upsert into Supabase knowledge_base table
            data = supabase.table('knowledge_base').upsert(record, on_conflict='id').execute()
            if data:
                print(f"  ✅ [THÀNH CÔNG] Đã lưu {article['id']} vào Supabase knowledge_base!")
                success_count += 1
        except Exception as e:
            print(f"  ❌ [LỖI] Không thể seed {article['id']}: {e}")
            
        time.sleep(0.5)

    print("\n----------------------------------------------------------------------")
    print(f"🎉 Hoàn thành seed {success_count}/{len(KNOWLEDGE_ARTICLES)} bài viết Tri Thức Tổng Quan vào Supabase!")
    print("----------------------------------------------------------------------")

if __name__ == "__main__":
    main()
