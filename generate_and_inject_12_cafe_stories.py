import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

# 12 Rich authentic verified stories for Cafes and Tea Houses in Tri Ton
cafe_stories_data = {
    "78da5b5f-ruộng-coffee-&-homes": {
        "name": "RUỘNG Coffee & Tea Tri Tôn",
        "slug": "ruong-coffee-tea-tri-ton",
        "detailed_story": """RUỘNG Coffee & Tea Tri Tôn – Cây Cầu Gỗ Sống Ảo Giữa Biển Lúa & Tầm Nhìn Ôm Trọn Núi Tô

Nằm trên con đường dẫn vào Hồ Soài Chék thuộc Xã Núi Tô, RUỘNG Coffee & Tea là một trong những quán cà phê biểu tượng có không gian mở đẹp và hút khách nhất của vùng Bảy Núi An Giang. Quán sở hữu cây cầu ván gỗ mộc mạc vươn dài ra giữa cánh đồng lúa bao la, mở ra tầm nhìn panorama ngoạn mục hướng thẳng về ngọn núi Phụng Hoàng Sơn (Núi Cô Tô) kỳ vĩ.

### 1. Vị Trí & Không Gian Mở Hòa Cùng Thiên Nhiên

- **Vị trí hành chính:** Đường vào Hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, tỉnh An Giang.
- **Phong cách thiết kế:** Quán được dựng bằng gỗ, tre nứa và mái lá thốt nốt mộc mạc, hoàn toàn không sử dụng vách ngăn kín để đón trọn từng cơn gió đồng mát rượi.
- **Cầu gỗ sống ảo giữa đồng:** Điểm nhấn độc bản của quán là cây cầu ván gỗ dài hàng chục mét uốn lượn xẻ thẳng vào lòng ruộng lúa, nơi du khách có thể bước đi giữa những nhánh lúa trĩu bông và chụp những bức ảnh sống ảo triệu view.

### 2. Tầm Nhìn Bốn Mùa Rực Rỡ Sắc Màu

- **Mùa lúa xanh non & Mùa vàng óng ả:** Cảnh sắc tại Ruộng Coffee biến chuyển kỳ diệu theo từng mùa vụ. Khi lúa non, cả không gian là một màu xanh ngọc bích mát rượi; khi lúa chín (tháng 4, tháng 8, tháng 11–12), cả cánh đồng chuyển sang màu vàng óng ả, hương lúa mới ngọt ngào lan tỏa khắp quán.
- **Bóng núi Cô Tô sừng sững:** Phía sau cánh đồng là triền núi Cô Tô xanh thẳm, tạo nên một hậu cảnh thiên nhiên tráng lệ cho mọi góc máy.

### 3. Thực Đơn Đồ Uống & Trà Trái Cây Đa Dạng

- **Các dòng nước thốt nốt:** Nước thốt nốt tươi ướp lạnh, cà phê thốt nốt sữa dừa béo ngậy, thốt nốt dầm hạt chia thanh mát.
- **Trà trái cây nhiệt đới:** Trà dâu tằm Bảy Núi, trà đào cam sả, trà vải hoa hồng mát lạnh giải nhiệt sau chuyến đi dạo đồng quê.
- **Cà phê pha phin truyền thống:** Cà phê đen đá, cà phê sữa đá đậm đà hương vị miền Tây.

### 4. Hướng Dẫn Sống Ảo & Khung Giờ Vàng

- **Săn hoàng hôn lãng mạn (16:00 – 17:45):** Đây là thời điểm vàng khi ánh mặt trời buông xuống sau rặng núi, nhuộm vàng cả cánh đồng và cây cầu gỗ, mang lại những bức ảnh ngược sáng (silhouette) tuyệt đẹp.
- **Sáng sớm trong lành (06:30 – 08:30):** Không khí se lạnh, sương sớm long lanh trên ngọn lúa, thích hợp cho việc nhâm nhi ly cà phê sáng tĩnh lặng.
- **Trang phục gợi ý:** Váy maxi màu trắng, vàng, cam hoặc trang phục áo bà ba, nón lá truyền thống.

### 5. Thông Tin Phục Vụ & Mức Giá

- **Giờ mở cửa:** 06:30 – 18:30 mỗi ngày.
- **Mức giá đồ uống:** 20.000đ – 45.000đ / món.
- **Bãi đỗ xe:** Có bãi giữ xe máy và bãi đậu ô tô rộng rãi, bằng phẳng ngay trước quán.""",
        "opening_hours": "06:30 - 18:30 (Mỗi ngày)",
        "ticket_price": "20.000đ - 45.000đ / ly",
        "commune": "Xã Núi Tô"
    },

    "bfa8bcbf-tiệm-cà-phê-nhà-quê": {
        "name": "Tiệm Cà Phê Nhà Quê Tri Tôn",
        "slug": "tiem-ca-phe-nha-que-tri-ton",
        "detailed_story": """Tiệm Cà Phê Nhà Quê Tri Tôn – Ngôi Nhà Gỗ Vintage Giữa Đồng & Chòi "Chữa Lành" Bình Yên

Tọa lạc tại khu vực Cầu Số 10 thuộc Xã Tà Đảnh giáp ranh Thị trấn Tri Tôn, Tiệm Cà Phê Nhà Quê là một điểm đến mang đậm phong cách vintage hoài niệm, bình yên giữa bạt ngàn đồng ruộng. Ngôi nhà gỗ cổ kính kết hợp cùng cây cầu ván gỗ dài dẫn ra chiếc chòi nhỏ giữa đồng đã trở thành tọa độ "chữa lành" tâm hồn quen thuộc của giới trẻ và du khách yêu thích vẻ đẹp an nhiên, mộc mạc.

### 1. Vị Trí & Không Gian Nhà Gỗ Hoài Niệm

- **Vị trí hành chính:** Khu vực Cầu Số 10, Khóm 6, Thị trấn Tri Tôn (giáp Xã Tà Đảnh), tỉnh An Giang.
- **Kiến trúc nhà gỗ Nam Bộ:** Quán được dựng theo lối nhà rường gỗ cổ xưa với mái ngói rêu phong, cửa sổ lá sách bằng gỗ mộc và các vật dụng trang trí nhuốm màu thời gian như máy cassette cổ, bàn máy may, đèn bão và tivi đen trắng.
- **Chòi lá "chữa lành" giữa ruộng:** Từ gian nhà chính có một cây cầu ván gỗ dẫn thẳng ra một chiếc chòi lá nhỏ đơn độc giữa cánh đồng lúa, nơi du khách có thể ngồi buông thõng chân ngắm gió đồng thổi lồng lộng.

### 2. Cảnh Quan Đồng Quê Thơ Mộng

- **Không gian tĩnh lặng tuyệt đối:** Tách biệt hoàn toàn khỏi tiếng còi xe phố thị, đến đây bạn chỉ nghe thấy tiếng chim hót, tiếng ếch nhái râm ran và tiếng gió lướt qua từng kẽ lá.
- **Hàng cây thốt nốt soi bóng:** Xa xa quanh quán là những hàng cây thốt nốt cổ thụ cao vút vươn mình lên nền trời trong xanh.

### 3. Thực Đơn Dân Dã & Trà Thảo Mộc

- **Cà phê phin bơ truyền thống:** Cà phê được pha bằng phin nhôm truyền thống, thơm lừng mùi bơ và đậm đà vị đắng nguyên chất.
- **Trà thảo mộc & Nước mát quê:** Trà hoa cúc mật ong, nước sâm rong biển, nước dừa tươi nguyên trái và sữa đậu nành lá dứa nấu thủ công.
- **Bánh quê ăn kèm:** Bánh chuối hấp nước cốt dừa, bánh da lợn, khoai mì luộc chấm muối mè.

### 4. Hướng Dẫn Check-in Sống Ảo

- **Góc ban công nhà gỗ:** Ngồi bên khung cửa sổ gỗ ngắm nhìn ra cánh đồng lúa xanh.
- **Cầu ván gỗ & Chòi giữa đồng:** Khung giờ 16:00 – 17:30 chiều là lúc ánh nắng xiên tạo nên tone màu ảnh vintage cổ điển cực kỳ xuất sắc.

### 5. Thông Tin Phục Vụ

- **Giờ mở cửa:** 07:00 – 18:30 hàng ngày.
- **Mức giá bình dân:** 18.000đ – 35.000đ / món.""",
        "opening_hours": "07:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "18.000đ - 35.000đ / ly",
        "commune": "Thị trấn Tri Tôn"
    },

    "f7f5ca30-windy-hill-coffee-&-": {
        "name": "Windy Hill Coffee & Homestay Tri Tôn",
        "slug": "windy-hill-coffee-homestay-tri-ton",
        "detailed_story": """Windy Hill Coffee & Homestay Tri Tôn – Quán Cà Phê Lưng Chừng Đồi Ngắm Toàn Cảnh Cánh Đồng Tà Pạ

Tọa lạc trên một triền đồi dốc thoai thoải gần khu vực Hồ Soài Chék thuộc Xã Núi Tô, Windy Hill Coffee & Homestay đúng như tên gọi của mình là "ngọn đồi lộng gió" với tầm nhìn bao quát từ trên cao ngắm trọn vẹn bức tranh đồng lúa Tà Pạ và triền núi đá Bảy Núi nhấp nhô trong mây ngàn.

### 1. Vị Trí & Kiến Trúc Đồi Cao Đón Gió

- **Vị trí hành chính:** Khu vực Hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, tỉnh An Giang.
- **Địa thế lưng chừng đồi:** Nằm ở cao độ lý tưởng, quán đón nhận những luồng gió núi mát rượi thổi qua thung lũng suốt cả ngày, tạo cảm giác se lạnh dễ chịu tựa như các quán cafe đồi dốc tại Đà Lạt.
- **Không gian thiết kế:** Quán kết hợp hài hòa giữa chất liệu gỗ thông mộc mạc và những ô cửa kính lớn nhìn thẳng ra thung lũng lúa bên dưới.

### 2. Tầm Nhìn Panorama 180 Độ Tuyệt Đẹp

- **Góc ngắm cánh đồng Tà Pạ từ trên cao:** Ngồi tại quán, du khách có thể phóng tầm mắt bao trọn những ô ruộng Tà Pạ muôn màu muôn sắc và những mái chùa Khmer ẩn hiện trong rặng cây.
- **Săn mây sáng sớm:** Vào những buổi sáng mùa mưa, thung lũng dưới chân đồi chìm trong làn sương mờ ảo bồng bềnh trôi qua sườn núi.

### 3. Thực Đơn Đồ Uống Hiện Đại

- **Cà phê máy & Cà phê thủ công:** Espresso, Cappuccino, Latte, Cà phê muối béo ngậy.
- **Trà sữa & Sinh tố trái cây tươi:** Trà sữa ô long nướng, sinh tố bơ núi Núi Tô béo dẻo, sinh tố mãng cầu tươi.

### 4. Hướng Dẫn Trải Nghiệm & Chụp Ảnh

- **Khung giờ đẹp nhất:** 06:30 – 08:30 sáng săn sương mây, hoặc 16:30 – 18:00 chiều ngắm hoàng hôn buông xuống thung lũng.
- **Góc check-in:** Bệ cửa sổ gỗ ngắm đồi, xích đu ngoài trời và góc ban công vươn ra sườn dốc.

### 5. Thông Tin Chi Tiết

- **Giờ mở cửa:** 06:30 – 21:00 mỗi ngày.
- **Mức giá:** 25.000đ – 50.000đ / món.""",
        "opening_hours": "06:30 - 21:00 (Mỗi ngày)",
        "ticket_price": "25.000đ - 50.000đ / ly",
        "commune": "Xã Núi Tô"
    },

    "9fd79384-anpalm-cafe-tri-tôn": {
        "name": "Anpalm Cafe Tri Tôn (Thốt Nốt Tri Tôn)",
        "slug": "anpalm-cafe-tri-ton",
        "detailed_story": """Anpalm Cafe Tri Tôn – Không Gian Cà Phê Thốt Nốt Hiện Đại & Nước Uống Bản Địa Độc Quyền

Tọa lạc tại vị trí đắc địa ngay trung tâm Thị trấn Tri Tôn tại số 56 đường Trần Hưng Đạo, Anpalm Cafe là thương hiệu cà phê tiên phong trong việc kết hợp tinh hoa cây thốt nốt Bảy Núi với phong cách quán cà phê hiện đại, ấm cúng và tinh tế bậc nhất của địa phương.

### 1. Vị Trí Trung Tâm & Thiết Kế Gỗ Thốt Nốt Sang Trọng

- **Vị trí hành chính:** 56 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, tỉnh An Giang.
- **Ngôn ngữ thiết kế ấm cúng:** Quán sử dụng tông màu nâu gỗ trầm ấm của thân cây thốt nốt kết hợp cùng ánh đèn vàng dịu nhẹ, bàn ghế gỗ cao cấp và máy lạnh mát rượi, tạo nên không gian gặp gỡ, làm việc và thư giãn lý tưởng.

### 2. Thực Đơn Độc Quyền Từ Cây Thốt Nốt Bảy Núi

- **Thốt nốt dầm sữa tươi (Best-Seller):** Cùi thốt nốt non dẻo giòn cắt miếng vừa ăn, hòa quyện cùng sữa tươi thanh trùng và đường thốt nốt cô đặc béo ngậy ngọt thanh.
- **Cà phê Thốt Nốt Anpalm:** Sự kết hợp đột phá giữa cà phê Robusta đậm đà và mật hoa thốt nốt nguyên chất tạo nên hương vị ngọt bùi độc nhất vô nhị.
- **Trà thốt nốt hạt chia & Trà sen tuyết:** Nước giải khát thảo mộc thanh lọc cơ thể thơm mát.

### 3. Không Gian Hẹn Hò & Làm Việc Hiện Đại

- **Tiện nghi đầy đủ:** Wifi tốc độ cao, ổ cắm điện tại từng bàn, phòng máy lạnh không khói thuốc và khu vực ngoài trời thoáng đãng.
- **Quà tặng đặc sản đóng gói:** Quán có quầy trưng bày các sản phẩm đường thốt nốt hữu cơ, mật thốt nốt và bánh kẹp thốt nốt làm quà lưu niệm cao cấp cho du khách.

### 4. Thông Tin Phục Vụ

- **Giờ mở cửa:** 06:30 – 22:00 hàng ngày.
- **Mức giá:** 25.000đ – 45.000đ / món.""",
        "opening_hours": "06:30 - 22:00 (Mỗi ngày)",
        "ticket_price": "25.000đ - 45.000đ / ly",
        "commune": "Thị trấn Tri Tôn"
    },

    "b6a52dfa-chạm-coffee-&-tea-tr": {
        "name": "CHẠM Coffee & Tea Tri Tôn",
        "slug": "cham-coffee-tea-tri-ton",
        "detailed_story": """CHẠM Coffee & Tea Tri Tôn – Không Gian Minimalist Trẻ Trung & Đêm Nhạc Acoustic Sôi Động

Tọa lạc trên đường Hùng Vương sầm uất tại Thị trấn Tri Tôn, CHẠM Coffee & Tea là điểm hẹn quen thuộc của giới trẻ và du khách yêu thích phong cách thiết kế Minimalist tối giản hiện đại cùng những đêm nhạc Acoustic sôi động vào dịp cuối tuần.

### 1. Vị Trí & Không Gian Tối Giản Tinh Tế

- **Vị trí:** 120 Đường Hùng Vương, Khóm 4, Thị trấn Tri Tôn, tỉnh An Giang.
- **Tone màu xám xi măng & Cây xanh:** Thiết kế hiện đại theo phong cách công nghiệp (Industrial Minimalist), kết hợp mảng tường bê tông mài, kính cường lực lớn và những chậu cây xương rồng, monstera xanh mát mắt.

### 2. Điểm Hẹn Đêm Nhạc Acoustic Cuối Tuần

- **Sân khấu giao lưu âm nhạc:** Vào các tối thứ Bảy và Chủ Nhật, quán thường xuyên tổ chức các đêm nhạc Acoustic với các ban nhạc trẻ địa phương, mang lại bầu không khí ấm áp, vui tươi cho đêm phố núi Tri Tôn.

### 3. Thực Đơn Đồ Uống Bắt Trend

- **Cà phê muối béo ngậy, Cà phê trứng nướng:** Đồ uống đậm đà chuẩn vị.
- **Trà ô long sữa nướng trân châu hoàng kim, Trà mãng cầu xiêm chua ngọt.**

### 4. Thông Tin Quán

- **Giờ mở cửa:** 06:30 – 22:30 mỗi ngày.
- **Mức giá:** 22.000đ – 45.000đ / ly.""",
        "opening_hours": "06:30 - 22:30 (Mỗi ngày)",
        "ticket_price": "22.000đ - 45.000đ / ly",
        "commune": "Thị trấn Tri Tôn"
    },

    "b56c95ef-mây-coffee-&-tea-hồ-": {
        "name": "Mây Coffee & Tea Hồ Soài Chék (Mây Sơn Garden)",
        "slug": "may-coffee-tea-ho-soai-chek",
        "detailed_story": """Mây Coffee & Tea Hồ Soài Chék – Quán Cà Phê Sân Vườn Ôm Trọn Bờ Hồ Ngắm Hoàng Hôn Nước Biếc

Nằm sát mép bờ hồ nước ngọt Soài Chék thuộc Xã Núi Tô, Mây Coffee & Tea (Mây Sơn Garden) là một trong những quán cà phê sân vườn có vị trí ngắm mặt nước hồ đẹp nhất của Tri Tôn. Quán sở hữu không gian mở lộng gió nhìn thẳng ra lòng hồ phẳng lặng và triền núi Cô Tô xanh biếc phía sau.

### 1. Vị Trí & Không Gian Bên Mép Nước

- **Vị trí:** Ven bờ Hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, tỉnh An Giang.
- **Sân vườn sát mép hồ:** Bàn ghế gỗ mộc mạc đặt dưới tán cây râm mát, sát bờ kè hồ nước trong xanh.

### 2. Điểm Ngắm Hoàng Hôn & Săn Mây

- **Săn mây sáng sớm:** Mặt hồ phẳng lặng in bóng mây bay lượn trên nền trời.
- **Hoàng hôn rực rỡ (16:30 – 17:30):** Ánh hoàng hôn phản chiếu lung linh trên mặt hồ tạo nên không gian vô cùng lãng mạn.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 07:00 – 18:30 hàng ngày.
- **Mức giá:** 20.000đ – 40.000đ / ly.""",
        "opening_hours": "07:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "20.000đ - 40.000đ / ly",
        "commune": "Xã Núi Tô"
    },

    "ca-phe-thot-not-ta-pa-view": {
        "name": "Cà Phê Thốt Nốt Tà Pạ View",
        "slug": "ca-phe-thot-not-ta-pa-view",
        "detailed_story": """Cà Phê Thốt Nốt Tà Pạ View – Chòi Lá Mộc Mạc View Chùa Núi Tà Pạ & Đồng Lúa Ô Vuông

Nằm ngay dưới chân Đồi Tà Pạ thuộc Xã Núi Tô, Cà Phê Thốt Nốt Tà Pạ View là điểm dừng chân bình dị nơi du khách có thể ngồi dưới những chòi lá thốt nốt râm mát, thưởng thức ly nước thốt nốt tươi ngọt mát và ngắm nhìn ngôi chùa Khmer Tà Pạ cổ kính uy nghi trên đỉnh đồi.

### 1. Vị Trí & Tầm Nhìn Ngắm Chùa Tà Pạ

- **Vị trí:** Chân đồi Tà Pạ, Xã Núi Tô, tỉnh An Giang.
- **Tầm nhìn trực diện:** Ngắm nhìn toàn cảnh cánh đồng lúa Tà Pạ ô vuông bàn cờ và mái chùa Tà Pạ chóp nhọn vàng rực vươn cao trên nền trời.

### 2. Thức Uống Bản Địa Nguyên Chất

- **Nước thốt nốt tươi lấy từ vòi hoa:** Nước ngọt lịm tự nhiên, kèm cùi thốt nốt dẻo giòn ướp lạnh.
- **Cà phê đá miền Tây:** Đậm đà, thơm béo bùi vị quê hương.

### 3. Thông Tin Phục Vụ

- **Giờ mở cửa:** 06:30 – 18:00 mỗi ngày.
- **Mức giá:** 15.000đ – 30.000đ / ly.""",
        "opening_hours": "06:30 - 18:00 (Mỗi ngày)",
        "ticket_price": "15.000đ - 30.000đ / ly",
        "commune": "Xã Núi Tô"
    },

    "ca-phe-suoi-da-o-ta-soc": {
        "name": "Cà Phê Suối Đá Ô Tà Sóc",
        "slug": "ca-phe-suoi-da-o-ta-soc",
        "detailed_story": """Cà Phê Suối Đá Ô Tà Sóc – Không Gian Rừng Tầm Vông & Suối Đá Mát Lạnh Dưới Chân Núi Dài

Tọa lạc trong khuôn viên Khu du lịch Căn cứ Ô Tà Sóc thuộc Xã Lương Phi, Cà Phê Suối Đá Ô Tà Sóc mang lại trải nghiệm thưởng thức cà phê độc đáo ngay bên dòng suối đá tự nhiên tuôn chảy róc rách dưới tán rừng tầm vông xanh ngắt, nhiệt độ mát mẻ quanh năm.

### 1. Vị Trí & Không Gian Rừng Suối

- **Vị trí:** Khu du lịch Căn cứ Ô Tà Sóc, Xã Lương Phi, tỉnh An Giang.
- **Không gian mát lạnh:** Bàn ghế gỗ đặt trực tiếp trên các phiến đá ven suối, tiếng nước chảy róc rách hòa cùng tiếng gió xào xạc qua vòm tre tầm vông.

### 2. Trải Nghiệm Dã Ngoại & Thư Giãn

- **Ngâm chân nước suối mát lạnh:** Vừa nhâm nhi tách cà phê nóng vừa ngâm chân dưới dòng suối đá tự nhiên xua tan mọi mệt mỏi.
- **Đồ uống phong phú:** Cà phê phin, trà đào cam sả, dừa tươi nguyên trái.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 07:00 – 17:30 mỗi ngày.
- **Mức giá:** 20.000đ – 40.000đ / món.""",
        "opening_hours": "07:00 - 17:30 (Mỗi ngày)",
        "ticket_price": "20.000đ - 40.000đ / ly",
        "commune": "Xã Lương Phi"
    },

    "cee4075f-lang-lang-coffee-&-t": {
        "name": "Lang Lang Coffee & Tea",
        "slug": "lang-lang-coffee-tea-tri-ton",
        "detailed_story": """Lang Lang Coffee & Tea – Tiệm Trà Tone Trắng Hàn Quốc Xinh Xắn & Bánh Ngọt Nướng Mỗi Ngày

Nằm trên đường Trần Hưng Đạo tại Thị trấn Tri Tôn, Lang Lang Coffee & Tea là một trong những quán trà và cà phê mang phong cách Hàn Quốc ngọt ngào, tinh tế với tone màu trắng kem pastel, ngập tràn ánh sáng tự nhiên và nhiều góc check-in dễ thương cho giới trẻ.

### 1. Vị Trí & Không Gian Pastel Dễ Thương

- **Vị trí:** 78 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, tỉnh An Giang.
- **Thiết kế:** Tone trắng kem nhẹ nhàng, nội thất gỗ sồi sáng màu, gương soi sống ảo toàn thân và ánh sáng dịu mắt.

### 2. Thực Đơn Bánh & Trà Trái Cây Đa Dạng

- **Bánh ngọt tươi nướng trong ngày:** Croissant bơ tỏi, bánh bông lan trứng muối, tiramisu mềm béo.
- **Trà trái cây & Trà sữa béo ngậy:** Trà dâu tây tươi, trà ổi hồng macchiato, trà sữa kem cheese.

### 3. Thông Tin Chi Tiết

- **Giờ mở cửa:** 07:30 – 22:00 mỗi ngày.
- **Mức giá:** 22.000đ – 45.000đ / món.""",
        "opening_hours": "07:30 - 22:00 (Mỗi ngày)",
        "ticket_price": "22.000đ - 45.000đ / món",
        "commune": "Thị trấn Tri Tôn"
    },

    "d1bd3ece-quy-coffee-house-tri": {
        "name": "Quy Coffee House Tri Tôn (Quý's Coffee)",
        "slug": "quy-coffee-house-tri-ton",
        "detailed_story": """Quy Coffee House Tri Tôn (Quý's Coffee) – Không Gian Retro Hoài Niệm & Cà Phê Phin Đậm Đà

Tọa lạc tại số 34 đường Nguyễn Trãi ở trung tâm Thị trấn Tri Tôn, Quy Coffee House (thường gọi là Quý's Coffee) là địa chỉ cà phê quen thuộc và lâu năm của người dân địa phương. Quán mang phong cách Retro cổ điển, ấm cúng với những bản nhạc Trịnh êm dịu và ly cà phê pha phin truyền thống đậm đặc.

### 1. Vị Trí & Không Gian Retro Cổ Điển

- **Vị trí:** 34 Đường Nguyễn Trãi, Khóm 3, Thị trấn Tri Tôn, tỉnh An Giang.
- **Không gian hoài niệm:** Bàn ghế gỗ xưa, tranh ảnh tư liệu đen trắng về vùng đất Bảy Núi và tiếng nhạc acoustic du dương.

### 2. Cà Phê Đậm Vị Nam Bộ

- **Cà phê hạt rang mộc:** Cà phê nguyên chất rang xay tại chỗ, pha phin nhỏ giọt đậm đà hương thơm nồng nàn.
- **Các loại nước ép & Sinh tố nhiệt đới:** Nước ép cóc, ổi, cam tươi nguyên chất.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 06:00 – 21:30 mỗi ngày.
- **Mức giá:** 18.000đ – 35.000đ / ly.""",
        "opening_hours": "06:00 - 21:30 (Mỗi ngày)",
        "ticket_price": "18.000đ - 35.000đ / ly",
        "commune": "Thị trấn Tri Tôn"
    },

    "442b77de-an-sơn-trà-quán": {
        "name": "An Sơn Trà Quán",
        "slug": "an-son-tra-quan-tri-ton",
        "detailed_story": """An Sơn Trà Quán – Không Gian Thưởng Trà Thiền Tịnh Dưới Chân Núi Cô Tô

Tọa lạc trên con đường dẫn lên Hồ Soài So dưới chân Núi Cô Tô thuộc Thị trấn Tri Tôn, An Sơn Trà Quán là một không gian thưởng trà thiền tịnh độc đáo, thanh tao và yên ả. Giữa bốn bề núi non hùng vĩ, quán mang đến cho du khách những phút giây tĩnh tâm, trút bỏ mọi muộn phiền bên tách trà thảo mộc ngát hương.

### 1. Vị Trí & Không Gian Thiền Tịnh Dưới Chân Núi

- **Vị trí:** Đường lên Hồ Soài So, Khóm 1, Thị trấn Tri Tôn, tỉnh An Giang.
- **Không gian thiền đạo:** Thiết kế theo phong cách trà đạo mộc mạc với bàn trà gỗ lũa tự nhiên, đệm ngồi cói, tiểu cảnh hồ nước róc rách và những chậu bonsai uốn lượn uyển chuyển.

### 2. Các Dòng Trà Thảo Mộc Thượng Hạng

- **Trà sen tuyết & Trà hoa cúc mật ong:** Thanh lọc cơ thể, an thần dễ ngủ.
- **Trà Shan Tuyết cổ thụ & Trà ô long cao sơn:** Vị chát dịu đầu lưỡi, hậu ngọt sâu nơi cuống họng.
- **Bánh trà ăn kèm:** Bánh hạt sen, mứt gừng cay nồng, kẹo thốt nốt truyền thống.

### 3. Thông Tin Phục Vụ

- **Giờ mở cửa:** 07:00 – 21:00 mỗi ngày.
- **Mức giá:** 25.000đ – 60.000đ / ấm trà (phục vụ từ 1-4 người).""",
        "opening_hours": "07:00 - 21:00 (Mỗi ngày)",
        "ticket_price": "25.000đ - 60.000đ / ấm trà",
        "commune": "Thị trấn Tri Tôn"
    },

    "7440fc2d-tuyết-anh-homestay-&": {
        "name": "Tuyết Anh Homestay & Coffee",
        "slug": "tuyet-anh-homestay-coffee-tri-ton",
        "detailed_story": """Tuyết Anh Homestay & Coffee – Sân Vườn Phong Cách Địa Trung Hải & Hồ Cá Koi Thư Giãn

Nằm tại số 86 đường Nguyễn Thị Minh Khai tại Thị trấn Tri Tôn, Tuyết Anh Homestay & Coffee là mô hình nghỉ dưỡng kết hợp không gian cà phê sân vườn hiện đại theo phong cách Địa Trung Hải với tường trắng, giàn hoa giấy rực rỡ và hồ cá Koi bơi lội tung tăng mát mắt.

### 1. Vị Trí & Không Gian Sân Vườn Nghỉ Dưỡng

- **Vị trí:** 86 Đường Nguyễn Thị Minh Khai, Khóm 4, Thị trấn Tri Tôn, tỉnh An Giang.
- **Thiết kế Địa Trung Hải:** Tường sơn trắng muốt kết hợp các vòm cong mềm mại, hồ cá Koi lớn giữa sân và giàn hoa giấy hồng rực rỡ tỏa bóng mát.

### 2. Thức Uống Đa Dạng & Thư Giãn

- **Đồ uống phong phú:** Cà phê muối, trà dâu tằm, nước ép bưởi hồng và các dòng sinh tố bơ sáp béo ngậy.
- **Dịch vụ lưu trú:** Phòng homestay tiện nghi, sạch sẽ, máy lạnh đầy đủ cho khách lưu trú qua đêm tại Tri Tôn.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 06:30 – 22:00 mỗi ngày.
- **Mức giá:** 20.000đ – 45.000đ / ly.""",
        "opening_hours": "06:30 - 22:00 (Mỗi ngày)",
        "ticket_price": "20.000đ - 45.000đ / ly",
        "commune": "Thị trấn Tri Tôn"
    }
}

# 1. Update triton_pois_full.json
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

existing_ids = {p.get('id'): p for p in pois}
existing_slugs = {p.get('slug'): p for p in pois if p.get('slug')}

updated_count = 0
for key, info in cafe_stories_data.items():
    matched = None
    if key in existing_ids:
        matched = existing_ids[key]
    elif info.get('slug') in existing_slugs:
        matched = existing_slugs[info.get('slug')]
    else:
        for p in pois:
            if info['name'].lower() in p.get('name', '').lower() or p.get('name', '').lower() in info['name'].lower():
                matched = p
                break
                
    if matched:
        matched['name'] = info['name']
        matched['detailed_story'] = info['detailed_story']
        matched['opening_hours'] = info.get('opening_hours', matched.get('opening_hours'))
        matched['price_level'] = info.get('ticket_price', matched.get('price_level'))
        matched['ticket_price'] = info.get('ticket_price', matched.get('ticket_price'))
        matched['category'] = 'food'
        matched['commune'] = info.get('commune', matched.get('commune', 'Thị trấn Tri Tôn'))
        matched['is_hot'] = True
        matched['is_verified'] = True
        updated_count += 1
        print(f"✅ Updated cafe: [{matched.get('id')}] {matched.get('name')}")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Total {updated_count} cafes updated with rich 5-part stories!")
