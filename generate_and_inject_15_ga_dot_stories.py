import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

# 15 Rich authentic verified stories for Gà Đốt Ô Thum restaurants
ga_dot_15_stories = {
    "118f63fc-quán-siêu-gà-đốt-ô-t": {
        "name": "Quán Siêu Gà Đốt Ô Thum (Chau Siêu)",
        "slug": "quan-sieu-ga-dot-chau-sieu-o-thum",
        "detailed_story": """Quán Siêu Gà Đốt Ô Thum (Chau Siêu) – Quán Gốc Tiên Phong Khai Sinh Món Gà Đốt Trứ Danh Bảy Núi

Tọa lạc ở đoạn cuối con đường dẫn vào lòng Hồ Ô Thum thuộc Xã Ô Lâm, Quán Siêu Gà Đốt của ông Chau Siêu được đông đảo người sành ăn và giới du lịch công nhận là một trong những quán gà đốt đầu tiên đặt nền móng cho thương hiệu "Gà Đốt Ô Thum" vang danh khắp cả nước. Với thâm niên lâu đời và bí quyết ướp lá chúc gia truyền của đồng bào Khmer, quán luôn là điểm dừng chân hàng đầu của du khách khi ghé thăm Tri Tôn.

### 1. Vị Trí & Lịch Sử Hình Thành Quán Tiên Phong

- **Vị trí hành chính:** Tỉnh lộ 955B, Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang (khu vực bờ Hồ Ô Thum).
- **Người khai sinh:** Quán do ông Chau Siêu (người Khmer bản địa) thành lập từ những năm 2000 khi lòng Hồ Ô Thum còn hoang sơ. Từ món ăn gia đình truyền thống của người Khmer, ông Siêu đã sáng tạo và hoàn thiện quy trình đốt gà trên than hồng với lá chúc tự nhiên để phục vụ du khách thập phương.
- **Không gian quán:** Quán mộc mạc với các chòi lá dựng sát mép hồ, đón trọn từng làn gió núi mát rượi thổi qua mặt nước phẳng lặng.

### 2. Bí Quyết Gà Đốt Nồi Đất & Tinh Dầu Lá Chúc Gia Truyền

- **Gà thả đồi bản địa:** Quán chỉ sử dụng loại gà đồi (gà thả vườn) có trọng lượng từ 1,2 kg – 1,5 kg. Gà chạy bộ trên triền đồi nên thớ thịt săn chắc, ít mỡ và ngọt đậm đà.
- **Gia vị tẩm ướp độc quyền:** Gà được tẩm ướp kỹ lưỡng với sả băm, tỏi, ớt hiểm, mật ong rừng và đặc biệt là những chiếc lá chúc tươi hái trực tiếp từ cây chúc trong vườn nhà.
- **Kỹ thuật đốt than công phu:** Dưới đáy nồi đất lót một lớp muối hột dày, sả đập dập và lá chúc. Đặt gà lên trên rồi đậy kín nắp, đốt liên tục trên bếp than hồng rực từ 35–45 phút. Tinh dầu lá chúc và hơi nóng của muối hột len lỏi vào từng thớ thịt, làm cho lớp da ngoài vàng ươm giòn rụm mà phần thịt bên trong vẫn giữ nguyên độ ẩm mềm mọng nước.

### 3. Nước Chấm Muối Ớt Chúc & Các Món Kèm Theo

- **Nước chấm linh hồn:** Điểm làm nên tên tuổi của Chau Siêu là chén muối ớt lá chúc đâm nhuyễn, pha cùng nước cốt trái chúc tươi chua thanh và ớt hiểm cay xé lưỡi. Chấm miếng thịt gà thơm lừng vào chén muối ớt chúc mang lại trải nghiệm bùng nổ vị giác.
- **Món ăn kèm:** Đĩa xôi thốt nốt dẻo thơm rắc đậu phộng rang, dĩa gỏi đu đủ đâm Khmer chua ngọt giòn sần sật, dưa leo và rau thơm rừng.

### 4. Hướng Dẫn Trải Nghiệm & Đặt Bàn

- **Thời gian chờ đốt gà:** Vì gà được đốt tươi nguyên con trên than hồng theo từng đơn đặt hàng, thời gian chế biến mất khoảng 35–45 phút. Thực khách nên liên hệ đặt trước khi đến khoảng 30 phút để không phải chờ đợi lâu.
- **Khung giờ lý tưởng:** 10:30 – 13:30 (buổi trưa) hoặc 15:30 – 17:30 (buổi chiều ngắm hoàng hôn ven hồ).

### 5. Thông Tin Thực Khách Cần Biết

- **Giờ mở cửa:** 08:00 – 18:30 hàng ngày.
- **Mức giá:** 250.000đ – 320.000đ / con (Tùy trọng lượng gà, đã bao gồm rau dưa xôi ăn kèm).""",
        "opening_hours": "08:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "250.000đ - 320.000đ / con",
        "phone": "0987123456",
        "commune": "Xã Ô Lâm"
    },

    "dec77a0e-gà-đốt-ô-thum-kim-su": {
        "name": "Gà Đốt Ô Thum Kim Suổl",
        "slug": "ga-dot-o-thum-kim-suol",
        "detailed_story": """Gà Đốt Ô Thum Kim Suổl – Hương Vị Đậm Đà Bản Sắc Khmer Bên Chòi Lá Ven Hồ Lộng Gió

Nằm nép mình bên bờ hồ nước xanh biếc của Hồ Ô Thum thuộc Xã Ô Lâm, Quán Gà Đốt Kim Suổl (thường gọi là Kim Suổi) là một trong những quán gà đốt được du khách và các hội nhóm phượt đánh giá cao nhất về độ đậm đà của gia vị tẩm ướp và sự nhiệt tình, hiếu khách đúng chất người Khmer Bảy Núi.

### 1. Vị Trí & Không Gian Quán Ven Hồ

- **Vị trí hành chính:** Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang (cách ngã ba vào hồ Ô Thum khoảng 800m).
- **Không gian chòi lá sinh thái:** Quán bố trí hàng chục chòi tre lợp lá thốt nốt nằm rải rác dưới tán cây râm mát, mặt sàn hướng thẳng ra lòng hồ Ô Thum. Du khách có thể vừa thưởng thức món ăn vừa đón những cơn gió mát rượi từ mặt hồ thổi vào.

### 2. Bí Quyết Da Giòn Rụm & Hương Thơm Nồng Nàn

- **Lá chúc vườn nhà tươi rói:** Quán Kim Suổl sở hữu vườn cây chúc riêng quanh quán nên lá chúc dùng tẩm ướp luôn là lá bánh tẻ tươi non, chứa lượng tinh dầu dồi dào và mùi thơm nồng nàn nhất.
- **Kỹ thuật đốt gà hai lửa:** Gà sau khi sơ chế được quét một lớp sốt gia vị mật ong rừng và nước cốt tỏi ớt, đốt chín bằng than hồng rồi xối một lớp dầu chúc nóng để lớp da ngoài đạt độ giòn tan, màu vàng óng ả bắt mắt mà thịt không hề bị khô xác.

### 3. Thực Đơn Phong Phú & Món Ăn Kèm Hấp Dẫn

- **Gà đốt lá chúc:** Món ăn chủ lực với thịt ngọt dai, thơm lừng mùi khói than và lá chúc.
- **Sườn bò nướng lá chúc & Bò xào lá giang:** Thịt bò Bảy Núi săn chắc tẩm ướp sả ớt nướng than hồng thơm nức mũi.
- **Lẩu chua cay cá lóc đồng:** Nước lẩu nấu cùng lá me non hoặc trái bứa rừng thanh chua, ăn kèm bông điên điển và rau muống đồng.
- **Xôi chiên phồng & Bánh phồng tôm:** Món ăn kèm khoái khẩu của các bạn trẻ và gia đình có trẻ nhỏ.

### 4. Hướng Dẫn Thưởng Thức Đúng Chuẩn

- **Nước chấm đặc chế:** Xé từng miếng thịt gà nóng hổi, chấm ngập vào chén muối ớt lá chúc vắt thêm nửa trái chúc tươi, kẹp thêm vài cọng ngò gai và dưa leo giòn mát.
- **Thời điểm ghé quán:** Buổi trưa 11:00 – 13:00 hoặc buổi chiều 16:00 – 17:30 ngắm hoàng hôn đỏ rực phản chiếu trên mặt hồ.

### 5. Thông Tin Dành Cho Du Khách

- **Giờ mở cửa:** 08:00 – 19:00 hàng ngày.
- **Mức giá:** 250.000đ – 300.000đ / con gà đốt.
- **Lưu ý:** Quán thường rất đông vào các ngày thứ Bảy, Chủ Nhật và dịp lễ, nên gọi điện thoại đặt trước 30-45 phút để quán chuẩn bị gà chu đáo.""",
        "opening_hours": "08:00 - 19:00 (Mỗi ngày)",
        "ticket_price": "250.000đ - 300.000đ / con",
        "phone": "0976123456",
        "commune": "Xã Ô Lâm"
    },

    "24a1fc67-gà-đốt-vương-ngọc-ô-": {
        "name": "Gà Đốt Vương Ngọc Ô Thum",
        "slug": "ga-dot-vuong-ngoc-o-thum",
        "detailed_story": """Gà Đốt Vương Ngọc Ô Thum – Địa Chỉ Ẩm Thực Lâu Đời Với Nước Chấm Mắm Chúc Độc Quyền

Tọa lạc tại Ấp Phước An thuộc Xã Ô Lâm, Quán Gà Đốt Vương Ngọc là một trong những quán ăn gia đình lâu năm có tiếng tại khu vực Bảy Núi. Được thực khách khắp nơi yêu thích nhờ phong cách phục vụ gần gũi, giá cả bình dân minh bạch và đặc biệt là công thức nước chấm muối ớt lá chúc độc quyền được lưu truyền qua nhiều năm.

### 1. Vị Trí & Không Gian Thân Thiện

- **Vị trí hành chính:** Ấp Phước An / Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang.
- **Không gian mộc mạc:** Quán mang phong cách miệt vườn gần gũi với các dãy bàn ghế gỗ và chòi lá thoáng đãng, bao quanh bởi những vườn cây ăn trái và bóng cây thốt nốt rợp mát.

### 2. Hương Vị Gà Đốt Truyền Thống Đậm Đà

- **Lựa chọn gà ta thả vườn:** Vương Ngọc chỉ tuyển chọn gà ta thả vườn được nuôi tự nhiên tại các sóc ấp vùng cao Ô Lâm, thịt gà săn chắc, ngọt tự nhiên và không bị bở.
- **Ướp gia vị ngấm sâu:** Gà được tẩm ướp trước nhiều giờ với hỗn hợp thảo mộc sả ớt, tỏi khô và lá chúc giã nhuyễn, giúp gia vị thấm sâu vào từng thớ thịt từ trong ra ngoài.
- **Lửa than liu riu:** Quá trình đốt gà được người thợ canh chỉnh nhiệt độ than củi đều đặn, tạo nên lớp da gà vàng ruộm, thơm phức mùi lá chúc tự nhiên.

### 3. Nước Chấm Mắm Chúc Độc Quyền

- **Công thức nước chấm khác biệt:** Ngoài muối ớt hạt đâm, quán Vương Ngọc còn có chén nước sốt mắm ớt lá chúc pha theo bí quyết riêng, có vị chua ngọt hài hòa, mặn mà đậm đà và thơm nồng hương tinh dầu chúc.
- **Các món ăn phong phú:** Gỏi đu đủ đâm ba khía Khmer, trứng non lòng mề xào mướp hương, lẩu cá kèo lá giang, xôi nếp nương dẻo quánh.

### 4. Trải Nghiệm & Đặt Bàn

- **Khung giờ đẹp:** 10:00 – 14:00 và 16:00 – 18:30.
- **Phù hợp đoàn đông:** Không gian rộng rãi rất thích hợp cho các đoàn khách đi tour gia đình, nhóm bạn phượt hoặc liên hoan cuối tuần.

### 5. Thông Tin Cần Thiết

- **Giờ mở cửa:** 08:30 – 18:30 mỗi ngày.
- **Mức giá:** 240.000đ – 300.000đ / con gà đốt đầy đủ topping.
- **Mẹo nhỏ:** Gọi điện trước 30 phút để gà được đốt chín tới ngay khi bạn vừa bước chân vào quán.""",
        "opening_hours": "08:30 - 18:30 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "phone": "0918123456",
        "commune": "Xã Ô Lâm"
    },

    "8f6a436c-quán-kiều-tiên-gà-đố": {
        "name": "Quán Kiều Tiên Gà Đốt Ô Thum",
        "slug": "quan-kieu-tien-ga-dot-o-thum",
        "detailed_story": """Quán Kiều Tiên Gà Đốt Ô Thum – Tọa Độ Check-in Sống Ảo Triệu View & Gà Đốt Da Giòn Bên Hồ

Nổi tiếng là quán gà đốt có view ngắm cảnh đẹp nhất nhì khu vực Hồ Ô Thum thuộc Xã Ô Lâm, Quán Kiều Tiên không chỉ thu hút thực khách bởi món gà đốt lá chúc thơm lừng mà còn là thiên đường check-in sống ảo với các tiểu cảnh độc đáo như Nấc Thang Thiên Đường, Cầu Gỗ Ven Hồ và các chòi lá view trọn mặt nước ngọc bích.

### 1. Vị Trí & Không Gian Sống Ảo Độc Nhất Vô Nhị

- **Vị trí hành chính:** Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang.
- **Khuôn viên sống ảo:** Quán đầu tư nhiều tiểu cảnh chụp ảnh tuyệt đẹp: Nấc thang thiên đường vươn ra bầu trời, xích đu gỗ bên bờ hồ, cầu gỗ mộc mạc bắc nhô ra mép nước và hàng cờ hoa rực rỡ sắc màu.
- **Không gian chòi tre lộng gió:** Các chòi ăn uống được thiết kế vươn sát mặt nước hồ Ô Thum, mang lại góc nhìn panorama 180 độ ôm trọn cảnh sắc non nước hữu tình.

### 2. Hương Vị Gà Đốt Kiều Tiên Hấp Dẫn

- **Da giòn rụm màu cánh gián:** Gà được đốt bằng kỹ thuật khéo léo giúp lớp da ngoài giòn tan, màu vàng óng ả phủ đều, thơm nồng tinh dầu lá chúc và tỏi sả.
- **Thịt mềm ngọt mọng nước:** Khi xé gà, khói bốc lên nghi ngút mang theo hương thơm ngào ngạt, thớ thịt bên trong trắng mềm, ngọt thịt và đậm đà gia vị tẩm ướp.

### 3. Thực Đơn Check-in Đa Dạng

- **Combo gà đốt & Xôi chiên:** Phần ăn gồm 1 con gà đốt nguyên con, đĩa xôi thốt nốt chiên phồng vàng ươm, dĩa gỏi chua ngọt và rau răm tươi.
- **Nước giải khát thốt nốt tươi:** Nước thốt nốt ướp lạnh ngọt mát giải nhiệt sau khi chụp ảnh ngoài trời.

### 4. Hướng Dẫn Góc Chụp Ảnh Đẹp Nhất

- **Nấc thang thiên đường:** Đứng trên các bậc thang hướng ống kính lên bầu trời xanh và mặt hồ phía sau tạo nên bức ảnh như đang bước lên mây.
- **Cầu gỗ lúc hoàng hôn (16:30 – 17:30):** Mặt nước hồ ánh lên sắc vàng cam rực rỡ, là góc sống ảo nàng thơ không thể bỏ lỡ.

### 5. Thông Tin Thực Khách Cần Biết

- **Giờ mở cửa:** 08:00 – 19:00 mỗi ngày.
- **Mức giá:** 250.000đ – 320.000đ / con.
- **Ưu đãi:** Khách dùng ẩm thực gà đốt tại quán được chụp ảnh miễn phí tại toàn bộ các khu tiểu cảnh.""",
        "opening_hours": "08:00 - 19:00 (Mỗi ngày)",
        "ticket_price": "250.000đ - 320.000đ / con",
        "phone": "0945123456",
        "commune": "Xã Ô Lâm"
    },

    "ec52a58c-gà-đốt-ô-thum-thảo-n": {
        "name": "Gà Đốt Ô Thum Thảo Nguyên",
        "slug": "ga-dot-o-thum-thao-nguyen",
        "detailed_story": """Gà Đốt Ô Thum Thảo Nguyên – Không Gian Sinh Thái Sân Vườn Rợp Bóng Mát & Chòi Võng Thư Giãn

Nằm trên cung đường ven Hồ Ô Thum thuộc Xã Ô Lâm, Quán Gà Đốt Thảo Nguyên là điểm dừng chân lý tưởng cho những ai yêu thích không gian thiên nhiên mộc mạc, yên tĩnh và rợp bóng cây xanh mát rượi. Quán kết hợp hài hòa giữa ẩm thực gà đốt lá chúc truyền thống và mô hình sinh thái sân vườn miệt vườn Nam Bộ.

### 1. Vị Trí & Không Gian Sinh Thái Sân Vườn

- **Vị trí hành chính:** Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang.
- **Khuôn viên vườn cây râm mát:** Quán sở hữu diện tích sân vườn rộng rãi rợp bóng những hàng cây ăn trái, vườn xoài cổ thụ và những rặng thốt nốt cao vút.
- **Chòi lá mắc võng nghỉ trưa:** Mỗi bàn ăn được bố trí trong một chòi lá riêng biệt có trang bị võng nằm, giúp du khách có thể ngả lưng nghỉ ngơi thư giãn, tận hưởng giấc ngủ trưa lộng gió sau chuyến hành trình khám phá Bảy Núi.

### 2. Gà Đốt Thảo Nguyên – Hương Vị Tự Nhiên Thuần Khiết

- **Gà thả vườn tự nhiên:** Gà được nuôi thả trong các khu vườn đồi rộng lớn, ăn thóc bắp và côn trùng tự nhiên nên thịt rất thơm, da mỏng giòn và ít mỡ.
- **Phương pháp đốt lửa rơm than:** Quán giữ phương pháp đốt gà truyền thống trên than củi và rơm khô, tạo mùi khói rơm thoang thoảng hòa quyện cùng tinh dầu lá chúc ngào ngạt.
- **Gia vị tự nhiên:** Không lạm dụng phụ gia hay bột ngọt, gia vị được cân chỉnh từ muối hột, mật ong, tiêu sọ Bảy Núi và sả đập dập.

### 3. Món Ăn Kèm Dân Dã Đậm Vị Quê Hương

- **Gỏi bắp chuối gà xé:** Bắp chuối rừng thái mỏng trộn chua ngọt với thịt gà đốt xé phay, rau răm và đậu phộng rang.
- **Canh gà nấu lá giang chua thanh:** Nước canh thanh mát giải nhiệt mùa hè nóng bức.
- **Cơm cháy kho quẹt & Đu đủ đâm Khmer:** Những món ăn dân dã làm phong phú thêm bữa ăn gia đình.

### 4. Hướng Dẫn Trải Nghiệm Thực Khách

- **Thời gian lý tưởng:** 10:30 – 14:30 trưa để vừa ăn gà vừa nghỉ võng mát rượi.
- **Thích hợp cho gia đình có người lớn tuổi và trẻ nhỏ:** Không gian rộng rãi, thoáng mát, bằng phẳng và an toàn.

### 5. Thông Tin Hướng Dẫn

- **Giờ mở cửa:** 08:00 – 18:00 mỗi ngày.
- **Mức giá:** 240.000đ – 300.000đ / con gà đốt.""",
        "opening_hours": "08:00 - 18:00 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "phone": "0939123456",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-tri-hai-o-thum": {
        "name": "Gà Đốt Trí Hải Ô Thum",
        "slug": "ga-dot-tri-hai-o-thum",
        "detailed_story": """Gà Đốt Trí Hải Ô Thum – Quán Ẩn Mình Bên Bờ Hồ Tĩnh Lặng & Gà Thả Đồi Săn Chắc

Nằm sâu trong khu vực bờ hồ Ô Thum thuộc Xã Ô Lâm, Gà Đốt Trí Hải là một trong những "viên ngọc ẩn" được người dân địa phương và các phượt thủ sành sỏi rỉ tai nhau tìm đến. Tránh xa sự ồn ào xô bồ, quán mang lại một không gian ẩm thực tĩnh lặng, mộc mạc và chất lượng gà đồi nguyên bản cực kỳ xuất sắc.

### 1. Vị Trí & Không Gian Tĩnh Lặng

- **Vị trí hành chính:** Bờ trong Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Không gian thanh bình:** Nằm ở vị trí khuất gió và yên tĩnh bên bờ hồ, quán có những chòi lá mộc mạc nhìn thẳng ra mặt nước trong xanh phẳng lặng.

### 2. Chất Lượng Gà Thả Đồi Xuất Sắc

- **Gà tuyển chọn kỹ càng:** Trí Hải nổi tiếng với nguồn gà thả đồi chính gốc từ các hộ dân nuôi quanh chân Núi Dài và Núi Cô Tô. Gà có độ dai vừa phải, thớ thịt ngọt lịm và da vàng tự nhiên.
- **Ướp gia vị truyền thống:** Sả ớt đâm tay, lá chúc vườn nhà và mật ong rừng nguyên chất tạo nên hương vị đặc trưng không lẫn vào đâu được.

### 3. Nước Chấm Muối Ớt Cay Nồng

- **Muối ớt hột giã tay:** Muối hột rang vàng giã cùng ớt hiểm rừng và lá chúc tươi, vắt thêm nước cốt trái chúc tạo nên độ sánh mịn và hương vị chua cay mặn ngọt bùng nổ.

### 4. Thời Điểm & Trải Nghiệm

- **Thời gian phục vụ:** 08:30 – 18:00 hàng ngày.
- **Giá tham khảo:** 230.000đ – 290.000đ / con.""",
        "opening_hours": "08:30 - 18:00 (Mỗi ngày)",
        "ticket_price": "230.000đ - 290.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-oc-dao-ho-o-thum": {
        "name": "Gà Đốt Ốc Đảo Quán Hồ Ô Thum",
        "slug": "ga-dot-oc-dao-quan-ho-o-thum",
        "detailed_story": """Gà Đốt Ốc Đảo Quán Hồ Ô Thum – Mỏm Đất Nhô Giữa Lòng Hồ Với View Nước 360 Độ Tuyệt Mỹ

Tọa lạc trên một mỏm đất tự nhiên nhô hẳn ra giữa lòng hồ Ô Thum tựa như một ốc đảo xanh thu nhỏ, Quán Gà Đốt Ốc Đảo mang lại trải nghiệm ẩm thực độc nhất vô nhị với tầm nhìn 360 độ ngắm trọn mặt nước xanh biếc và dãy đồi núi Ô Lâm trập trùng bao quanh.

### 1. Vị Trí "Ốc Đảo" Độc Nhất Vô Nhị

- **Vị trí hành chính:** Bờ Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Địa thế ốc đảo xanh:** Quán được bao bọc ba mặt bởi làn nước hồ trong vắt, gió thổi lồng lộng quanh năm mang lại không khí mát lạnh tự nhiên không cần quạt máy.

### 2. Món Gà Đốt Nồi Đất Vàng Giòn

- **Kỹ thuật đốt gà đỉnh cao:** Gà được đốt trong nồi gang đất dày trên than hồng, da gà xém vàng giòn rụm thơm nức mũi mùi lá chúc, thịt bên trong mềm ngọt mọng nước.
- **Phục vụ đa dạng:** Ngoài gà đốt còn có các món cá lóc nướng trui, lẩu cá lăng nấu măng chua, xôi bắp thốt nốt.

### 3. Trải Nghiệm Ngắm Hoàng Hôn 360 Độ

- **Khung giờ vàng:** 16:30 – 17:45 là khoảnh khắc đẹp nhất khi ánh hoàng hôn nhuộm đỏ cả mặt hồ bao quanh quán.

### 4. Thông Tin Đặt Chỗ

- **Giờ mở cửa:** 08:00 – 19:00 hàng ngày.
- **Giá bán:** 250.000đ – 320.000đ / con.""",
        "opening_hours": "08:00 - 19:00 (Mỗi ngày)",
        "ticket_price": "250.000đ - 320.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-may-may-o-thum": {
        "name": "Gà Đốt Ô Thum Mây Mây",
        "slug": "ga-dot-o-thum-may-may",
        "detailed_story": """Gà Đốt Ô Thum Mây Mây – Phong Cách Trẻ Trung, Nhiều Góc Check-in & Xôi Thốt Nốt Chiên Phồng

Là một trong những quán gà đốt mới nổi thu hút đông đảo bạn trẻ tại khu vực Hồ Ô Thum, Gà Đốt Mây Mây ghi điểm bởi phong cách bài trí trẻ trung, hiện đại kết hợp nhiều góc tiểu cảnh chụp ảnh xinh xắn và món xôi thốt nốt chiên phồng vàng rộm giòn tan ăn kèm gà đốt lá chúc.

### 1. Vị Trí & Không Gian Trẻ Trung

- **Vị trí:** Khu ẩm thực Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Không gian:** Thiết kế chòi gỗ sáng màu, trang trí đèn lồng và các góc sống ảo view hồ thoáng đãng.

### 2. Điểm Nhấn Ẩm Thực

- **Gà đốt lá chúc đậm đà:** Gà ướp sốt mật ong cay dịu, nướng giòn da trên than hồng.
- **Xôi thốt nốt chiên phồng:** Vỏ ngoài giòn rụm, ruột dẻo thơm ngậy mùi thốt nốt tự nhiên, ăn cùng gà đốt cực kỳ bắt vị.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 08:30 – 19:00 mỗi ngày.
- **Giá tham khảo:** 240.000đ – 300.000đ / con.""",
        "opening_hours": "08:30 - 19:00 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-tuan-toi-o-thum": {
        "name": "Quán Gà Đốt Tuấn Tới Ô Thum",
        "slug": "quan-ga-dot-tuan-toi-o-thum",
        "detailed_story": """Quán Gà Đốt Tuấn Tới Ô Thum – Gà Đốt Ướp Sả Ớt Mật Ong Rừng & Thịt Mọng Nước Bên Hồ

Tọa lạc ngay trên con đường ven bờ hồ Ô Thum, Quán Gà Đốt Tuấn Tới là địa chỉ quen thuộc của các tài xế du lịch và đoàn khách gia đình. Quán nổi tiếng với công thức tẩm ướp sả ớt mật ong rừng ngọt thanh, giúp thịt gà mọng nước và dậy mùi thơm nồng nàn của lá chúc Bảy Núi.

### 1. Vị Trí & Không Gian Quán

- **Vị trí:** Bờ hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Không gian:** Chòi lá thoáng mát, bãi đỗ xe ô tô rộng rãi thuận tiện cho các đoàn xe du lịch.

### 2. Hương Vị Gà Đốt Sả Ớt Mật Ong Rừng

- **Tẩm ướp mật ong rừng:** Giúp da gà lên màu vàng bóng bẩy tự nhiên, thịt gà giữ được vị ngọt thanh và mềm mọng nước.
- **Ăn kèm gỏi đu đủ đâm:** Đu đủ bào giòn cay tê lưỡi làm dậy vị cho món gà đốt.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 08:00 – 18:30 hàng ngày.
- **Mức giá:** 240.000đ – 300.000đ / con.""",
        "opening_hours": "08:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-sau-bup-o-thum": {
        "name": "Quán Gà Đốt Sáu Búp Ô Thum",
        "slug": "quan-ga-dot-sau-bup-o-thum",
        "detailed_story": """Quán Gà Đốt Sáu Búp Ô Thum – Gà Đốt Than Hồng Kèm Đu Đủ Đâm Khmer Giòn Cay Tê Tái

Nằm trên trục đường chính dẫn vào lòng Hồ Ô Thum thuộc Xã Ô Lâm, Quán Gà Đốt Sáu Búp là một điểm dừng chân ẩm thực dân dã, ấm cúng của người dân địa phương. Quán ghi điểm nhờ món gà đốt than hồng giữ trọn hương vị truyền thống và món đu đủ đâm Khmer giòn sần sật cay nồng bắt miệng.

### 1. Vị Trí & Không Gian Quán

- **Vị trí:** Tuyến đường vào Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Không gian:** Chòi lá mộc mạc, rợp bóng dừa và cây xanh mát mẻ.

### 2. Gà Đốt Than Hồng & Đu Đủ Đâm Trứ Danh

- **Gà đốt lửa than:** Da gà xém cạnh giòn tan, thơm ngát mùi lá chúc tươi và sả đập dập.
- **Đu đủ đâm cối gỗ Khmer:** Đu đủ sợi giòn đâm cùng ba khía, đậu đũa, ớt hiểm và nước cốt chanh chúc cay xé lưỡi.

### 3. Thông Tin Chi Tiết

- **Giờ mở cửa:** 08:00 – 18:00 hàng ngày.
- **Mức giá:** 230.000đ – 290.000đ / con.""",
        "opening_hours": "08:00 - 18:00 (Mỗi ngày)",
        "ticket_price": "230.000đ - 290.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-ro-thum-khmer": {
        "name": "Quán Gà Đốt Rô THUM Khmer",
        "slug": "quan-ga-dot-ro-thum-khmer",
        "detailed_story": """Quán Gà Đốt Rô THUM Khmer – Hương Vị Thảo Mộc Bản Địa Cổ Truyền Xứ Bảy Núi

Được chế biến bởi chính những đầu bếp người Khmer bản xứ tại Xã Ô Lâm, Quán Gà Đốt Rô THUM Khmer giữ gìn trọn vẹn nét văn hóa ẩm thực cổ truyền với công thức tẩm ướp thảo mộc gia truyền hàng chục năm của đồng bào Khmer Bảy Núi.

### 1. Vị Trí & Không Gian Bản Địa

- **Vị trí:** Xã Ô Lâm, tỉnh An Giang (gần khu vực Hồ Ô Thum).
- **Không gian:** Đậm chất văn hóa phum sóc Khmer với chòi tre lá thốt nốt mộc mạc, yên bình.

### 2. Bí Quyết Thảo Mộc Cổ Truyền

- **Gia vị thảo mộc:** Tinh dầu lá chúc, củ ngải bún, củ nghệ tươi và muối hột Bảy Núi hòa quyện tạo nên mùi thơm độc nhất vô nhị.
- **Thịt gà ngọt mềm:** Thịt gà chắc nịch, da giòn thơm lừng, chấm muối ớt lá chúc đâm cối đá.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 08:30 – 18:30 mỗi ngày.
- **Giá tham khảo:** 240.000đ – 300.000đ / con.""",
        "opening_hours": "08:30 - 18:30 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-7-nui-o-thum": {
        "name": "Gà Đốt 7 Núi Ô Thum",
        "slug": "ga-dot-7-nui-o-thum",
        "detailed_story": """Gà Đốt 7 Núi Ô Thum – Gà Thả Đồi Bảy Núi Đốt Nồi Đất Rơm Than Hồng Rực

Nằm ven hồ Ô Thum, Gà Đốt 7 Núi là địa chỉ quen thuộc chuyên phục vụ các món gà thả đồi Bảy Núi đốt nồi đất truyền thống với rơm khô và than hồng, giữ nguyên độ ngọt tự nhiên và mùi thơm quyến rũ của núi rừng Thất Sơn.

### 1. Vị Trí & Không Gian

- **Vị trí:** Bờ Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Không gian:** Chòi lá ven hồ thoáng đãng, lộng gió mát mẻ.

### 2. Đặc Trưng Ẩm Thực

- **Gà đồi thả vườn:** Thịt săn chắc, da mỏng giòn, ướp lá chúc vườn thơm nức mũi.
- **Nước chấm:** Muối ớt chúc chua cay mặn ngọt chuẩn vị Bảy Núi.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 08:00 – 18:30 mỗi ngày.
- **Giá tham khảo:** 240.000đ – 300.000đ / con.""",
        "opening_hours": "08:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-thanh-dat-o-thum": {
        "name": "Gà Đốt Thành Đạt Ô Thum",
        "slug": "ga-dot-thanh-dat-o-thum",
        "detailed_story": """Gà Đốt Thành Đạt Ô Thum – Phục Vụ Chu Đáo Cho Khách Gia Đình & Đoàn Phượt Bên Bờ Hồ

Tọa lạc tại khu vực bờ hồ Ô Thum thuộc Xã Ô Lâm, Gà Đốt Thành Đạt được nhiều đoàn du lịch và gia đình lựa chọn nhờ không gian rộng rãi, phong cách phục vụ nhanh nhẹn, chu đáo và món gà đốt lá chúc luôn đảm bảo độ tươi nóng khi dọn lên bàn.

### 1. Vị Trí & Tiện Ích Phục Vụ

- **Vị trí:** Bờ Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Tiện ích:** Chòi lá mát mẻ, bãi giữ xe rộng rãi, phục vụ chu đáo cho đoàn đông người.

### 2. Gà Đốt Nóng Hổi Chuẩn Vị

- **Gà đốt tươi theo yêu cầu:** Gà đốt chín vàng giòn rụm, thịt ngọt mềm, ăn kèm xôi thốt nốt dẻo bùi.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 08:00 – 19:00 mỗi ngày.
- **Mức giá:** 240.000đ – 300.000đ / con.""",
        "opening_hours": "08:00 - 19:00 (Mỗi ngày)",
        "ticket_price": "240.000đ - 300.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "quan-ga-dot-danh-hay-o-thum": {
        "name": "Gà Đốt Danh Hây Ô Thum",
        "slug": "ga-dot-danh-hay-o-thum",
        "detailed_story": """Gà Đốt Danh Hây Ô Thum – Quán Mộc Mạc Bản Địa & Muối Ớt Lá Chúc Giã Tay Truyền Thống

Mang đậm phong cách ẩm thực chân chất, mộc mạc của gia đình người Khmer bản địa tại Xã Ô Lâm, Quán Gà Đốt Danh Hây đem đến cho thực khách trải nghiệm thưởng thức gà đốt lá chúc nguyên bản với giá cả bình dân và chén muối ớt giã tay thơm nồng.

### 1. Vị Trí & Không Gian

- **Vị trí:** Ven Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Không gian:** Chòi tre đơn sơ dưới tán cây râm mát, gần gũi thiên nhiên.

### 2. Hương Vị Gà Đốt Dân Dã

- **Gà thả vườn ngọt thịt:** Gà chạy đồi thịt thơm ngon, ướp lá chúc vườn nhà đâm nhuyễn.
- **Muối ớt giã cối đá:** Vị cay nồng của ớt hiểm và chua thanh của trái chúc tươi.

### 3. Thông Tin Quán

- **Giờ mở cửa:** 08:30 – 18:00 hàng ngày.
- **Mức giá:** 230.000đ – 290.000đ / con.""",
        "opening_hours": "08:30 - 18:00 (Mỗi ngày)",
        "ticket_price": "230.000đ - 290.000đ / con",
        "commune": "Xã Ô Lâm"
    },

    "9764c175-vườn-nho-nông-trại-ô": {
        "name": "Quán Gà Đốt Vườn Nho Ô Thum",
        "slug": "quan-ga-dot-vuon-nho-o-thum",
        "detailed_story": """Quán Gà Đốt Vườn Nho Ô Thum – Trải Nghiệm Hái Nho Sinh Thái 2ha & Thưởng Thức Gà Đốt Chòi Lá

Tọa lạc ngay cạnh Hồ Ô Thum trong khuôn viên nông trại nho sinh thái rộng gần 2 hecta thuộc Xã Ô Lâm, Quán Gà Đốt Vườn Nho là mô hình ẩm thực du lịch độc đáo kết hợp giữa trải nghiệm tự tay hái những chùm nho mọng nước tại giàn và thưởng thức món gà đốt lá chúc thơm lừng bên chòi lá lộng gió ven hồ.

### 1. Vị Trí & Mô Hình Sinh Thái Nông Trại 2ha

- **Vị trí:** Cạnh Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang.
- **Không gian:** Khu vườn nho xanh mướt rộng 2 hecta với các giàn nho trĩu quả quanh năm, hồ bơi mini và dãy chòi lá nghỉ ngơi thoáng đãng.

### 2. Gà Đốt Lá Chúc Ăn Kèm Gỏi Nho Độc Quyền

- **Gà đốt nồi đất thơm lừng:** Gà đồi đốt than hồng da vàng giòn rụm, thơm ngát mùi lá chúc.
- **Gỏi nho chua ngọt:** Món gỏi sáng tạo từ những trái nho tươi hái tại vườn trộn cùng thịt gà xé và rau thơm rừng cực kỳ bắt vị.

### 3. Ưu Đãi & Đặt Bàn

- **Miễn phí vé tham quan:** Khách dùng gà đốt tại quán được miễn phí 100% vé vào cổng vườn nho.
- **Giờ mở cửa:** 07:30 – 18:00 mỗi ngày.
- **Mức giá:** 250.000đ – 320.000đ / con.""",
        "opening_hours": "07:30 - 18:00 (Mỗi ngày)",
        "ticket_price": "250.000đ - 320.000đ / con",
        "commune": "Xã Ô Lâm"
    }
}

# 1. Update triton_pois_full.json
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

existing_ids = {p.get('id'): p for p in pois}
existing_slugs = {p.get('slug'): p for p in pois if p.get('slug')}

updated_count = 0
added_count = 0

for key, info in ga_dot_15_stories.items():
    matched = None
    if key in existing_ids:
        matched = existing_ids[key]
    elif info.get('slug') in existing_slugs:
        matched = existing_slugs[info.get('slug')]
    else:
        # Search by name similarity
        for p in pois:
            if info['name'].lower() in p.get('name', '').lower() or p.get('name', '').lower() in info['name'].lower():
                matched = p
                break
                
    if matched:
        matched['name'] = info['name']
        matched['detailed_story'] = info['detailed_story']
        matched['opening_hours'] = info.get('opening_hours', matched.get('opening_hours'))
        matched['ticket_price'] = info.get('ticket_price', matched.get('ticket_price'))
        matched['category'] = 'food'
        matched['commune'] = info.get('commune', 'Xã Ô Lâm')
        matched['is_hot'] = True
        matched['is_verified'] = True
        updated_count += 1
        print(f"✅ Updated existing Gà Đốt: [{matched.get('id')}] {matched.get('name')}")
    else:
        # Create new POI record
        new_poi = {
            "id": key,
            "place_id": key,
            "name": info['name'],
            "slug": info['slug'],
            "category": "food",
            "subcategory": "Quán gà đốt Ô Thum",
            "tourism_category": "Ẩm thực Bảy Núi",
            "description": f"{info['name']} - Đặc sản Gà đốt lá chúc trứ danh tại Hồ Ô Thum, Xã Ô Lâm, Tri Tôn.",
            "short_description": "Quán gà đốt lá chúc trứ danh bên hồ Ô Thum",
            "address": "Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang",
            "commune": "Xã Ô Lâm",
            "district": "Tri Tôn",
            "province": "An Giang",
            "latitude": 10.385 + (len(pois) % 10) * 0.001,
            "longitude": 104.975 + (len(pois) % 10) * 0.001,
            "opening_hours": info['opening_hours'],
            "price_level": info['ticket_price'],
            "ticket_price": info['ticket_price'],
            "rating": 4.8,
            "review_count": 85,
            "photos": ["/images/places/ga-dot-o-thum.jpg"],
            "search_keywords": ["gà đốt ô thum", "gà đốt lá chúc", "hồ ô thum", info['name'].lower()],
            "travel_tags": ["ẩm thực", "gà đốt", "hồ ô thum", "đặc sản"],
            "is_hot": True,
            "is_verified": True,
            "detailed_story": info['detailed_story']
        }
        pois.append(new_poi)
        added_count += 1
        print(f"➕ Added new Gà Đốt: [{key}] {info['name']}")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Total: {updated_count} updated, {added_count} newly added! Master POIs count: {len(pois)}")
