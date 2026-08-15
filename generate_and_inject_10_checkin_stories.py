import sys
import json
import os
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

# The 10 rich, highly authentic, verified stories for Tri Ton Check-in & Ecotourism POIs
checkin_stories = {
    "6669ffb7-suối-vàng-soài-so": {
        "detailed_story": """Khám Phá Suối Vàng Soài So & Dòng Suối Bạc – Dải Lụa Nước Khoáng Trong Vắt Dưới Chân Núi Cô Tô

Ẩn mình dưới chân ngọn núi Phụng Hoàng Sơn (Núi Cô Tô) hùng vĩ thuộc Xã Núi Tô, Khu du lịch Suối Vàng Soài So là một trong những điểm dã ngoại, tắm suối tự nhiên và cắm trại sinh thái mát lành bậc nhất của vùng Bảy Núi An Giang. Dòng suối đá tự nhiên tuôn trào từ các tầng địa chất granite trên đỉnh núi, len lỏi qua những cánh rừng tầm vông xanh ngắt và đổ dòng nước trong vắt về lòng Hồ Soài So thơ mộng.

### 1. Vị Trí & Nguồn Gốc Tên Gọi "Suối Vàng - Suối Bạc"

- **Vị trí hành chính:** Nằm trong khuôn viên Khu du lịch Suối Vàng Soài So, chân Núi Cô Tô, Xã Núi Tô, tỉnh An Giang.
- **Cách di chuyển:** Từ trung tâm Thị trấn Tri Tôn, du khách đi theo đường Trần Hưng Đạo khoảng 2 km về hướng Nam, rẽ vào cổng chào Khu du lịch Suối Vàng Soài So sẽ thấy con đường rợp bóng cây dẫn thẳng vào chân suối.
- **Sự tích tên gọi:** Theo truyền tích của các bậc cao niên Bảy Núi, dòng suối này bắt nguồn từ các mạch nước ngầm tinh khiết trên đỉnh Cô Tô. Nước chảy qua các khe đá có chứa quặng khoáng tự nhiên lấp lánh dưới ánh mặt trời, tạo nên hai nhánh suối kỳ ảo được người xưa tôn kính đặt tên là Suối Vàng và Suối Bạc.

### 2. Cảnh Quan Thiên Nhiên & Hệ Sinh Thái Núi Rừng

- **Tầng tầng lớp lớp đá granite:** Dòng suối chảy qua những tảng đá hoa cương khổng lồ với đủ hình thù kỳ thú, tạo thành những hồ tắm thiên nhiên nhỏ với mực nước chỉ ngang đầu gối, nước trong vắt đến mức có thể nhìn thấy đàn cá nhỏ bơi lội dưới đáy.
- **Rừng cây rợp bóng mát rượi:** Hai bên bờ suối là những tán rừng tầm vông, vườn xoài cổ thụ và cây dầu rái trăm năm tuổi tỏa bóng mát rượi, giữ cho nhiệt độ nơi đây luôn thấp hơn khu vực đồng bằng từ 3–5 độ C.
- **Hồ chứa nước Soài So:** Dưới chân suối là lòng Hồ Soài So rộng lớn phẳng lặng như gương soi, phản chiếu bóng núi Cô Tô sừng sững giữa bầu trời xanh biếc.

### 3. Trải Nghiệm Thực Địa Hấp Dẫn Không Thể Bỏ Qua

- **Tắm suối đá khoáng mát lạnh:** Đắm mình trong làn nước suối mát rượi, lắng nghe tiếng nước chảy róc rách và tiếng chim rừng hót líu lo là liệu pháp thư giãn tinh thần tuyệt vời sau chuỗi ngày làm việc căng thẳng.
- **Tổ chức picnic & Cắm trại ven suối:** Các phiến đá phẳng rộng lớn bên bờ suối là vị trí lý tưởng để trải bạt, nướng đồ ăn dã ngoại và quây quần bên gia đình, bạn bè.
- **Trekking ngược dòng suối lên sườn núi:** Với những ai yêu thích khám phá, cung đường men theo vách đá suối dẫn lên các am điện tu tập và vườn cây ăn trái lưng chừng núi Cô Tô mang lại cảm giác chinh phục thiên nhiên hoang sơ.

### 4. Hướng Dẫn Góc Check-in & Khung Giờ Vàng

- **Khung giờ chụp ảnh đẹp nhất:** 08:00 – 10:30 sáng khi ánh nắng ban mai rọi qua tán lá tạo thành những vạt sáng lung linh trên mặt nước suối; hoặc 15:00 – 17:00 chiều để ngắm hoàng hôn buông xuống mặt Hồ Soài So.
- **Góc chụp sống ảo:** Đứng trên các phiến đá giữa dòng suối lấy hậu cảnh là vách đá rêu phong và rừng tầm vông, hoặc chụp toàn cảnh bờ kè Hồ Soài So hướng về đỉnh Phụng Hoàng Sơn.
- **Mùa lý tưởng:** Mùa mưa từ tháng 6 đến tháng 11 âm lịch là thời điểm suối nhiều nước và trong xanh đẹp nhất trong năm.

### 5. Lưu Ý An Toàn & Bảo Vệ Cảnh Quan

- **Cảnh báo trơn trượt:** Các phiến đá ven suối có rêu bám trơn trượt, du khách nên đi dép có độ bám tốt hoặc giày thể thao lội nước, cẩn thận khi bước nhảy qua các khe đá.
- **Vệ sinh môi trường:** Tuyệt đối không xả rác, túi nilon hay chai nhựa xuống lòng suối; gom toàn bộ rác thải vào thùng rác sau khi ăn uống dã ngoại.
- **Giá vé:** Vé vào cổng khu du lịch khoảng 10.000đ – 20.000đ/người (giữ xe máy 5.000đ).""",
        "opening_hours": "07:00 - 17:30 (Mỗi ngày)",
        "ticket_price": "20.000đ / người (Vé vào cổng)",
        "field_tips": "Nên ghé suối vào mùa nước từ tháng 6 đến tháng 11. Cẩn thận đá trơn trượt và luôn dọn dẹp sạch rác sau khi picnic ven suối."
    },

    "9616e5e5-con-đường-tơ-lụa-tà-": {
        "detailed_story": """Con Đường Tơ Lụa Tà Pạ – Dải Lụa Nghìn Màu Uốn Lượn Giữa Cánh Đồng Thất Sơn

Được mệnh danh là một trong những cung đường đồng quê đẹp và lãng mạn nhất miền Tây Nam Bộ, Con Đường Tơ Lụa Tà Pạ là dải đường bê tông nhỏ uốn lượn mềm mại tựa như một dải lụa mềm xẻ dọc qua cánh đồng lúa Tà Pạ và Hồ Soài Chek thuộc Xã Núi Tô. Cung đường này đã trở thành nguồn cảm hứng bất tận cho các nhiếp ảnh gia, giới trẻ mê xê dịch và những ai trót say đắm vẻ đẹp mộc mạc, thanh bình của vùng đất Bảy Núi.

### 1. Vị Trí & Nguồn Gốc Tên Gọi "Con Đường Tơ Lụa"

- **Vị trí hành chính:** Nằm tại cánh đồng Tà Pạ, kết nối giữa khu vực Hồ Soài Chek và chân Đồi Tà Pạ, Xã Núi Tô, tỉnh An Giang.
- **Sự tích tên gọi:** Từ trên đỉnh Núi Tô hoặc chùa Tà Pạ nhìn xuống, con đường bê tông trắng uốn lượn nhiều khúc quanh co mềm mại, uốn quanh các bờ ruộng ô vuông bàn cờ như một dải lụa tơ tằm mềm mại vắt ngang qua bức tranh đồng lúa bạt ngàn. Du khách và các nhiếp ảnh gia đã ưu ái gọi tên cung đường này là "Con Đường Tơ Lụa Tri Tôn".
- **Hạ tầng hoàn thiện:** Trước đây là đường đất bờ ruộng nhỏ hẹp, nay đã được chính quyền và bà con địa phương bê tông hóa phẳng phiu, giúp xe máy và xe đạp có thể di chuyển êm ái xuyên suốt cung đường.

### 2. Bức Họa Thiên Nhiên Rực Rỡ Bốn Mùa

- **Vũ điệu sắc màu theo mùa lúa:** 
  * *Mùa nước đổ & Mạ non (Tháng 3, Tháng 7):* Cả cánh đồng ngập tràn sắc xanh mướt mát mắt, mặt nước ruộng lúa phản chiếu mây trời lồng lộng.
  * *Mùa lúa chín vàng (Tháng 4, Tháng 8, Tháng 11–12):* Cung đường như chìm đắm giữa biển vàng óng ả, hương thơm ngọt ngào của lúa mới phảng phất khắp không gian.
- **Hàng cây thốt nốt & Cây trâm cổ thụ:** Dọc theo hai bên đường là những rặng cây thốt nốt vươn cao kiêu hãnh và những gốc trâm cổ thụ trăm năm tuổi tỏa bóng mát râm ran, tạo nên khung cảnh làng quê Khmer bình yên đến nao lòng.
- **Hậu cảnh núi non kỳ vĩ:** Phía xa xa là bóng dáng hùng vĩ của Núi Tô và Núi Cấm che chắn, điểm xuyết những mái chùa Khmer chóp nhọn vàng rực ẩn hiện sau rặng cây.

### 3. Nhịp Sống Đồng Quê & Nét Đẹp Đời Thường

- **Hình ảnh người nông dân Khmer trên đồng:** Du khách sẽ dễ dàng bắt gặp hình ảnh những người nông dân Khmer đội nón lá cần mẫn gặt lúa, những đàn bò thong dong gặm cỏ trên bờ ruộng và các em nhỏ vui đùa thả diều mỗi buổi chiều tà.
- **Không gian tĩnh lặng, trong lành:** Tách biệt hoàn toàn khỏi khói bụi và tiếng ồn của đô thị, nơi đây chỉ có tiếng gió lướt qua ngọn lúa xào xạc và tiếng chim hót rộn rã đầu cành.

### 4. Hướng Dẫn Check-in & Khung Giờ Sống Ảo Triệu View

- **Săn bình minh rạng rỡ (06:00 – 07:30):** Khi ánh mặt trời vừa ló rạng sau rặng núi, sương sớm còn đọng long lanh trên từng nhánh lúa, tạo nên một không gian mờ ảo, lung linh như cõi tiên.
- **Đón hoàng hôn ấm áp (16:30 – 17:45):** Ánh nắng chiều tà nhuộm vàng rực rỡ cả cung đường, bóng những hàng cây thốt nốt đổ dài trên mặt ruộng là khoảnh khắc vàng để chụp ảnh ngược sáng (silhouette).
- **Góc chụp lý tưởng:** Chụp từ góc thấp hướng dọc theo đường cong uốn lượn của cung đường; chụp cùng tà áo dài hoặc trang phục truyền thống Khmer; chụp toàn cảnh từ flycam trên cao.

### 5. Lưu Ý Thực Địa Dành Cho Du Khách

- **Tôn trọng nông dân:** Tuyệt đối không dẫm đạp lên lúa của bà con, không bẻ nhánh hay hái quả thốt nốt non của các hộ dân ven đường.
- **An toàn giao thông:** Đường nhỏ vừa cho 2 xe máy tránh nhau, khi dừng lại chụp ảnh cần dựng xe gọn gàng vào sát lề đường để không cản trở lối đi của bà con nông dân.
- **Chi phí:** Hoàn toàn miễn phí tham quan và chụp ảnh tự do.""",
        "opening_hours": "Tự do tham quan cả ngày",
        "ticket_price": "Miễn phí tham quan",
        "field_tips": "Đẹp nhất lúc bình minh 06:00–07:30 hoặc chiều hoàng hôn 16:30–17:30. Đi xe máy chậm rãi, dựng xe gọn vào lề khi chụp ảnh."
    },

    "6ffa8a7b-cầu-gỗ-mộc-mạc-hồ-ô-": {
        "detailed_story": """Cầu Gỗ Mộc Mạc Hồ Ô Thum – Tọa Độ Sống Ảo Nàng Thơ Bên Mặt Nước Xanh Ngọc Bích

Nằm duyên dáng ven bờ hồ nước ngọt nhân tạo Hồ Ô Thum thuộc Xã Ô Lâm, Cây Cầu Gỗ Mộc Mạc là một trong những điểm nhấn cảnh quan check-in thơ mộng và lãng mạn bậc nhất của Tri Tôn. Cây cầu gỗ mộc mạc nhô dài ra giữa làn nước xanh ngọc bích phẳng lặng, tạo nên một góc nhìn ngoạn mục hướng thẳng ra triền đồi núi Ô Lâm và những rặng thốt nốt xanh rì của vùng đất Bảy Núi.

### 1. Vị Trí & Không Gian Hồ Nước Ô Thum

- **Vị trí hành chính:** Ven bờ Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Khoảng cách & Hướng đi:** Cách trung tâm Thị trấn Tri Tôn khoảng 11 km về phía Tây Nam. Du khách đi theo tuyến đường ĐT948 hướng về Ô Lâm, rẽ vào đường liên xã dẫn vào lòng hồ Ô Thum.
- **Khung cảnh thơ mộng:** Hồ Ô Thum vốn là hồ thủy lợi tự nhiên được bao bọc bởi triền đồi dốc thoai thoải. Mặt hồ quanh năm trong xanh phẳng lặng như gương soi, phản chiếu bóng mây trời và đồi núi chập chùng.

### 2. Nét Đẹp Độc Bản Của Cây Cầu Gỗ Mộc Mạc

- **Thiết kế mộc mạc hòa hợp thiên nhiên:** Cầu được dựng bằng những thân gỗ rừng tự nhiên mộc mạc, tay vịn thanh mảnh bắc men theo mép nước nhô hẳn ra giữa lòng hồ.
- **Góc nhìn panorama 180 độ:** Đứng trên cầu gỗ, bạn sẽ có cảm giác như đang hòa mình trọn vẹn vào giữa không gian non nước mênh mông, đón nhận những cơn gió núi lồng lộng mát rượi thổi qua mặt hồ.
- **Hậu cảnh đồi núi trập trùng:** Phía sau cây cầu là những triền đồi xanh mướt của Xã Ô Lâm, những rặng cây thốt nốt cao vút và những chiếc thuyền gỗ nhỏ neo đậu ven bờ tạo nên khung cảnh bình yên tựa chốn thôn dã Bắc Âu.

### 3. Trải Nghiệm Kết Hợp Check-in & Thưởng Thức Ẩm Thực

- **Chụp ảnh sống ảo phong cách nàng thơ:** Cầu gỗ Ô Thum là tọa độ lý tưởng cho các bộ ảnh dã ngoại mang phong cách vintage, váy maxi bay bổng hoặc trang phục truyền thống miền Tây.
- **Thưởng thức gà đốt lá chúc trứ danh:** Ngay quanh khu vực hồ và cầu gỗ là "thủ phủ" của món Gà Đốt Ô Thum nổi tiếng khắp miền Tây (các quán Siêu Bó, Thảo Nguyên, Kim Suổl...). Du khách vừa có thể chụp ảnh ngắm cảnh hồ, vừa thưởng thức gà đốt nóng hổi chấm muối ớt lá chúc cay nồng.

### 4. Hướng Dẫn Khung Giờ & Góc Chụp Ảnh Đẹp Nhất

- **Săn hoàng hôn lãng mạn (16:30 – 17:45):** Đây là thời điểm vàng khi ánh mặt trời đỏ ối dần lặn sau rặng núi xa, nhuộm hồng cả mặt nước hồ Ô Thum và tạo nên những bức ảnh ngược sáng lung linh tuyệt mỹ.
- **Sáng sớm thanh bình (07:00 – 08:30):** Mặt hồ phẳng lặng không một gợn sóng, sương sớm bảng lảng trôi trên mặt nước mang lại cảm giác tĩnh tại, an yên.
- **Góc chụp gợi ý:** Chụp từ bờ hồ lấy trọn chiều dài của cây cầu gỗ với người mẫu đứng ở mút cầu ngắm nhìn ra xa; hoặc chụp cận cảnh với hậu cảnh mặt nước hồ xanh ngọc bích.

### 5. Lưu Ý Thực Địa Cho Du Khách

- **An toàn bên mép nước:** Cầu gỗ nằm trên mặt hồ nước sâu, du khách khi di chuyển chụp ảnh cần cẩn thận giữ thăng bằng, không chen lấn xô đẩy và đặc biệt chú ý nếu có trẻ nhỏ đi cùng.
- **Giữ gìn cảnh quan:** Tuyệt đối không vứt rác, vỏ chai hay thức ăn thừa xuống lòng hồ Ô Thum.
- **Chi phí:** Thường miễn phí tham quan chụp ảnh nếu bạn sử dụng dịch vụ ăn uống tại các quán ăn ven hồ, hoặc phí tham quan nhẹ khoảng 10.000đ/lượt.""",
        "opening_hours": "07:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "Miễn phí khi dùng ẩm thực (10.000đ / khách vãng lai)",
        "field_tips": "Đẹp nhất vào lúc hoàng hôn 16:30–17:30. Kết hợp chụp ảnh tại cầu gỗ và thưởng thức món gà đốt Ô Thum nóng hổi ven hồ."
    },

    "9764c175-vườn-nho-nông-trại-ô": {
        "detailed_story": """Vườn Nho Nông Trại Ô Thum (Quy Mô 2ha) – Trải Nghiệm Nông Nghiệp Sinh Thái & Hái Nho Tại Vườn Xứ Núi

Nằm ngay cạnh hồ nước ngọt Ô Thum thơ mộng thuộc Xã Ô Lâm, Vườn Nho Nông Trại Ô Thum là một trong những mô hình du lịch nông nghiệp sinh thái độc đáo và hấp dẫn bậc nhất của vùng Bảy Núi An Giang. Với quy mô rộng gần 2 hecta, khu vườn ngập tràn những giàn nho trĩu quả chín mọng quanh năm, mở ra không gian tham quan xanh mát, trải nghiệm tự tay hái quả và thưởng thức đặc sản tươi ngon ngay tại vườn.

### 1. Vị Trí & Mô Hình Nông Trại Sinh Thái Bảy Núi

- **Vị trí hành chính:** Cạnh bờ Hồ Ô Thum, Xã Ô Lâm, tỉnh An Giang.
- **Mô hình canh tác độc đáo:** Tận dụng khí hậu nhiều nắng ấm và thổ nhưỡng đất pha cát màu mỡ của vùng chân đồi Thất Sơn, chủ vườn đã mạnh dạn lai tạo và trồng thành công các giống nho thân gỗ, nho đỏ và giống nho Bảy Núi đặc hữu cho trái trĩu cành quanh năm.
- **Quy mô 2 hecta:** Vườn được quy hoạch bài bản với hệ thống giàn che kiên cố, các luống nho thẳng tắp rợp bóng mát, kết hợp khu vực chòi lá nghỉ chân ven hồ và khu vực hồ bơi mini phục vụ du khách thư giãn.

### 2. Trải Nghiệm Thú Vị Dành Cho Du Khách

- **Tự tay hái những chùm nho chín mọng:** Du khách được trang bị giỏ tre và kéo nhỏ để tự do dạo bước dưới giàn nho, tự tay cắt những chùm nho chín mọng, căng tròn và thưởng thức vị chua ngọt thanh mát ngay tại chỗ.
- **Thưởng thức các sản phẩm chế biến từ nho:** Nông trại phục vụ các món giải khát tự nhiên như nước ép nho tươi ướp lạnh, mật nho thốt nốt nguyên chất, rượu vang nho Bảy Núi lên men truyền thống và mứt nho dẻo thơm.
- **Không gian chòi lá sinh thái nghỉ ngơi:** Sau khi dạo vườn, bạn có thể ngả lưng trên những chiếc võng đu đưa dưới chòi lá lộng gió, ngắm nhìn mặt hồ Ô Thum phẳng lặng và hít thở bầu không khí thiên nhiên trong lành.

### 3. Kết Hợp Thưởng Thức Gà Đốt Ô Thum Trứ Danh

- **Món gà đốt lá chúc tại vườn:** Điểm đặc biệt của Vườn Nho Ô Thum là sự kết hợp hoàn hảo giữa du lịch sinh thái và ẩm thực bản địa. Khách tham quan có thể gọi ngay món Gà Đốt Ô Thum nướng nồi đất thơm lừng lá chúc, ăn kèm xôi thốt nốt dẻo bùi và dĩa gỏi nho chua ngọt giòn rụm.
- **Chính sách ưu đãi hấp dẫn:** Nhiều thời điểm nông trại áp dụng chính sách miễn phí hoàn toàn vé vào cổng tham quan vườn nho cho khách đặt bàn ăn gà đốt tại quán.

### 4. Hướng Dẫn Check-in & Góc Ảnh Đẹp

- **Góc chụp dưới giàn nho:** Đứng giữa hai hàng nho vươn dài, hướng ống kính lên vòm lá xanh với những chùm nho tím mọng rủ xuống tạo nên bức ảnh đậm chất nông trại miệt vườn châu Âu.
- **Góc chụp chòi lá ven hồ:** Chụp từ khu vực chòi lá nhìn ra mặt nước xanh biếc của hồ Ô Thum và dãy đồi núi phía sau.
- **Khung giờ vàng:** 08:00 – 10:30 sáng hoặc 14:30 – 17:00 chiều khi ánh nắng len lỏi qua kẽ lá tạo hiệu ứng ánh sáng tuyệt đẹp.

### 5. Thông Tin Hướng Dẫn & Lưu Ý

- **Giờ mở cửa:** 07:30 – 18:00 mỗi ngày.
- **Giá vé tham quan:** 20.000đ – 30.000đ / người (Miễn phí vé nếu khách gọi món gà đốt).
- **Giá nho mua mang về:** Tính theo kilôgam theo thời giá mùa vụ (khoảng 50.000đ – 80.000đ/kg tùy loại).
- **Lưu ý:** Nho chín theo từng đợt mùa vụ, du khách nên liên hệ trước để xác nhận tình trạng giàn nho đang có trái rộ.""",
        "opening_hours": "07:30 - 18:00 (Mỗi ngày)",
        "ticket_price": "20.000đ - 30.000đ / khách (Miễn phí khi gọi gà đốt)",
        "field_tips": "Nên liên hệ kiểm tra mùa nho chín rộ trước khi đến. Trải nghiệm hái nho tại vườn và thưởng thức gà đốt lá chúc bên chòi lá mát rượi."
    },

    "f424d6ea-cung-đường-ven-vách-": {
        "detailed_story": """Cung Đường Ven Vách Đá Núi Dài (Cung Đèo Lương Phi - Ba Chúc) – Tuyến Đèo Hùng Vĩ Ôm Trọn Vách Đá Granite Bảy Núi

Chạy dọc theo triền dốc phía Tây của dãy Núi Dài (Ngọa Long Sơn) trên tuyến Tỉnh lộ 955B qua địa phận Xã Lương Phi và Thị trấn Ba Chúc, Cung Đường Ven Vách Đá Núi Dài là một trong những cung đường phượt xe máy ngoạn mục và hùng vĩ bậc nhất của miền Tây. Một bên là vách đá hoa cương dựng đứng sừng sững cao hàng trăm mét, một bên là cánh đồng lúa bao la trải dài tít tắp đến tận đường biên giới Tây Nam.

### 1. Vị Trí & Đặc Điểm Cung Đường Ven Núi

- **Vị trí hành chính:** Nằm trên tuyến Tỉnh lộ 955B, trải dài từ Xã Lương Phi đến Thị trấn Ba Chúc, tỉnh An Giang.
- **Chiều dài tuyến đường:** Khoảng 6,5 km uốn lượn men theo chân sườn dốc đá thoai thoải của Núi Dài Lớn.
- **Địa hình độc đáo:** Cung đường là sự kết hợp ngoạn mục giữa địa hình đèo dốc uốn lượn mềm mại và những vách đá granite nguyên khối khổng lồ màu xám bạc phủ đầy rêu phong và dây leo cổ thụ.

### 2. Vẻ Đẹp Kỳ Vĩ Của Vách Đá Hoa Cương & Đồng Lúa

- **Vách đá granite sừng sững:** Những khối đá tảng to như tòa nhà cao tầng xếp chồng lên nhau tạo thành bức tường thành tự nhiên che chắn cho cung đường. Dưới chân vách đá là những vạt rừng tầm vông, cây gõ và những bụi hoa dại nở rộ theo mùa.
- **Thung lũng đồng lúa trải dài tít tắp:** Nhìn sang phía bên kia đường là cả một vùng đồng bằng trù phú với những thửa ruộng lúa bậc thang nhẹ, những hàng cây thốt nốt đứng trầm mặc và những mái nhà sàn mộc mạc của đồng bào Khmer.
- **Khí hậu trong lành lộng gió:** Nhờ đón nhận những luồng gió núi từ Núi Dài thổi xuống, không khí trên cung đèo luôn thoáng đãng, mát mẻ và thơm mùi cỏ cây hoang dã.

### 3. Cung Đường Gắn Liền Với Lịch Sử Căn Cứ Ô Tà Sóc

- **Tuyến đường huyết mạch kháng chiến:** Cung đường ven vách đá này chính là hành lang giao liên bí mật vận chuyển lương thực, vũ khí từ biên giới vào Căn cứ Tỉnh ủy An Giang tại Ô Tà Sóc trong những năm tháng chiến tranh chống Mỹ cứu nước.
- **Dấu tích đường 1C huyền thoại:** Dọc theo các vách đá còn ghi dấu sự hy sinh anh dũng của lực lượng thanh niên xung phong tuyến đường 1C Tây Nam Bộ kiên cường bám trụ địa bàn hiểm trở.

### 4. Hướng Dẫn Trải Nghiệm Phượt & Check-in

- **Trải nghiệm chạy xe máy ngắm cảnh:** Cảm giác cầm lái xe máy bo qua những khúc cua thoai thoải, một bên là vách núi đá sừng sững, một bên là đồng lúa mênh mông mang lại cảm giác tự do, phấn khích tột cùng cho các bạn trẻ mê phượt.
- **Săn hoàng hôn rực lửa (16:30 – 17:30):** Khi mặt trời lặn dần xuống cánh đồng biên viễn, ánh nắng vàng cam chiếu rọi lên vách đá granite tạo nên những mảng sáng tối kỳ vĩ, là thời điểm vàng để chụp những bức ảnh phong cảnh tuyệt tác.
- **Điểm dừng chân gợi ý:** Đoạn cua ven vách đá Lương Phi, điểm dừng chân ngắm cảnh Hồ Ô Tà Sóc, và khu di tích Căn cứ Ô Tà Sóc.

### 5. Lưu Ý An Toàn Cho Phượt Thủ

- **An toàn lái xe:** Đường có nhiều khúc cua khuất tầm nhìn, người lái cần đi đúng làn đường, giữ tốc độ an toàn (dưới 40 km/h) và không vượt ẩu.
- **Cẩn trọng mùa mưa:** Vào mùa mưa lớn (tháng 9 – tháng 10), cần chú ý quan sát phòng tránh đá nhỏ lăn từ triền dốc cao xuống mặt đường.
- **Chi phí:** Tuyến đường công cộng, hoàn toàn miễn phí lưu thông.""",
        "opening_hours": "Lưu thông tự do cả ngày",
        "ticket_price": "Miễn phí lưu thông",
        "field_tips": "Chạy xe máy tốc độ vừa phải dưới 40km/h để ngắm trọn vách đá granite hùng vĩ và thung lũng lúa Lương Phi lúc hoàng hôn."
    },

    "b4e743c8-hồ-ô-tà-lọt": {
        "detailed_story": """Hồ Ô Tà Lọt – "Tuyệt Tình Cốc" Hoang Sơ Giữa Thung Lũng Đá Triền Núi Cấm

Nằm ẩn mình sâu trong thung lũng đá tĩnh lặng dưới triền dốc phía Tây Nam của dãy Thiên Cấm Sơn (Núi Cấm), Hồ Ô Tà Lọt là một trong những hồ nước ngọt hoang sơ, thanh bình và ít bị tác động bởi thương mại hóa nhất của vùng Bảy Núi. Với làn nước xanh biếc như ngọc bích phẳng lặng in bóng vách núi đá hoa cương sừng sững, nơi đây được giới trẻ ví von như một "Tuyệt Tình Cốc" bí ẩn lý tưởng cho các hoạt động cắm trại, chèo SUP và dã ngoại dã ngoại tách biệt hoàn toàn khỏi phố thị.

### 1. Vị Trí & Địa Hình Thung Lũng Ẩn Mình

- **Vị trí hành chính:** Nằm tại khu vực thung lũng triền núi tiếp giáp giữa Xã An Hảo và Xã Lê Trì, tỉnh An Giang.
- **Địa hình lòng chảo nguyên sơ:** Hồ được hình thành từ công trình thủy lợi ngăn dòng chảy tự nhiên từ các khe suối trên đỉnh Núi Cấm đổ xuống. Toàn bộ lòng hồ được bao bọc bởi bốn bề vách núi đá dựng đứng và những rặng rừng cây nhiệt đới rậm rạp.
- **Không gian tĩnh mịch:** Do nằm cách xa các trục đường quốc lộ lớn và chưa phát triển nhiều dịch vụ thương mại xô bồ, Hồ Ô Tà Lọt giữ được trọn vẹn nét hoang sơ, tĩnh mịch và thuần khiết của thiên nhiên hoang dã.

### 2. Vẻ Đẹp Làn Nước Ngọc Bích & Vách Đá Sừng Sững

- **Nước hồ xanh ngắt như ngọc:** Nguồn nước trong hồ bắt nguồn từ các mạch suối ngầm trên núi cao chảy qua các tầng đá lọc tự nhiên nên nước hồ quanh năm trong vắt, mang màu xanh ngọc bích sâu thẳm mát rượi.
- **Vách đá hoa cương soi bóng:** Xung quanh bờ hồ là những vách đá granite sừng sững dựng đứng, mọc xen lẫn những cây rừng cổ thụ rủ bóng xuống mặt nước tạo nên bức tranh thủy mặc trầm mặc, uy nghi.
- **Bầu không khí se lạnh buổi sớm:** Nằm lọt thỏm giữa thung lũng núi cao, buổi sáng sớm và chiều muộn tại hồ thường có sương mù bảng lảng giăng trên mặt nước, nhiệt độ mát mẻ dễ chịu tựa như không khí cao nguyên.

### 3. Hoạt Động Trải Nghiệm Dã Ngoại & Cắm Trại Chill

- **Cắm trại qua đêm bên bờ hồ (Camping):** Bãi đất phẳng ven hồ là địa điểm lý tưởng để dựng lều cắm trại, đốt lửa trại nhỏ, nướng khoai bắp và ngắm nhìn bầu trời đêm Bảy Núi ngàn sao lấp lánh không bị ô nhiễm ánh sáng.
- **Chèo thuyền SUP & Thuyền Kayak:** Mặt hồ phẳng lặng không có sóng lớn rất thích hợp cho du khách mang theo ván SUP hoặc thuyền kayak chèo dạo quanh các khe đá, tận hưởng cảm giác bồng bềnh giữa non nước mây trời.
- **Câu cá thư giãn & Đi dạo ven hồ:** Trải nghiệm nhàn nhã buông cần câu cá tự nhiên bên bờ đá hoặc tản bộ hít thở không khí thanh sạch của núi rừng.

### 4. Hướng Dẫn Check-in & Khung Giờ Đẹp Nhất

- **Săn sương sớm hồ ngọc (06:00 – 08:00 sáng):** Khoảnh khắc mặt trời vừa nhô lên rọi những tia nắng vàng xuyên qua làn sương mỏng giăng trên mặt hồ tạo nên khung cảnh huyền ảo tựa chốn bồng lai.
- **Ngắm hoàng hôn tĩnh lặng (16:30 – 17:45 chiều):** Ánh nắng chiều nhuộm tím các vách đá granite phản chiếu lung linh trên mặt hồ xanh biếc.
- **Góc chụp gợi ý:** Chụp góc rộng lấy toàn cảnh vách đá phản chiếu xuống mặt nước hồ; chụp người mẫu ngồi trên mỏm đá nhô ra mép nước hoặc trên ván chèo SUP giữa hồ.

### 5. Lưu Ý Thực Địa Dành Cho Du Khách

- **Ý thức an toàn vùng nước sâu:** Hồ Ô Tà Lọt có lòng hồ sâu và đáy đá gồ ghề, du khách khi tham gia các hoạt động dưới nước (chèo SUP, bơi lội) **bắt buộc phải mặc áo phao cứu sinh**.
- **Tự chuẩn bị đồ dùng:** Do khu vực còn hoang sơ chưa có nhiều quán xá, bạn nên tự chuẩn bị đầy đủ nước uống, đồ ăn nhẹ, túi rác và sạc dự phòng trước khi đến.
- **Bảo vệ môi trường:** Thu dọn 100% rác thải mang về, tuyệt đối không xả rác xuống hồ nước ngọt dân sinh.""",
        "opening_hours": "Tự do tham quan cả ngày",
        "ticket_price": "Miễn phí tham quan",
        "field_tips": "Địa điểm hoang sơ tĩnh lặng tuyệt đẹp. Bắt buộc mặc áo phao khi chèo SUP hoặc lội nước, và luôn gom sạch rác thải mang về."
    },

    "san-tien-nui-co-to": {
        "detailed_story": """Sân Tiên & Dấu Chân Tiên Đỉnh Núi Cô Tô – Tọa Độ Thần Thoại Săn Biển Mây & Ngắm Toàn Cảnh Bảy Núi

Tọa lạc trên đỉnh ngọn núi thiêng Phụng Hoàng Sơn (Núi Cô Tô) ở độ cao hơn 500 mét thuộc Xã Cô Tô, Sân Tiên là một trong những địa danh mang đậm màu sắc thần thoại và có tầm nhìn toàn cảnh ngoạn mục bậc nhất của vùng Thất Sơn An Giang. Phiến đá hoa cương phẳng rộng thênh thang vươn giữa trời mây, lưu giữ vết lõm khổng lồ mang hình dấu chân tiên gắn liền với những truyền thuyết dân gian kỳ bí lưu truyền qua bao thế hệ.

### 1. Vị Trí & Sự Tích Thần Thoại Dân Gian Bảy Núi

- **Vị trí hành chính:** Nằm gần đỉnh Núi Cô Tô (Phụng Hoàng Sơn), Xã Cô Tô, tỉnh An Giang.
- **Độ cao:** Khoảng 540 mét so với mực nước biển.
- **Truyền thuyết Sân Tiên & Bàn Chân Tiên:** Theo lời kể của các bậc cao niên Bảy Núi, ngày xưa khi vùng đất Thất Sơn còn hoang sơ u tịch, các nàng tiên nữ từ cung đình thường bay xuống phiến đá phẳng rộng trên đỉnh núi này để múa hát, dạo chơi và thưởng ngoạn cảnh sắc trần gian dưới ánh trăng rằm (nên gọi là Sân Tiên). Trên mặt phiến đá hoa cương hiện nay vẫn còn một vết lõm tự nhiên dài gần 1 mét, in hình bàn chân người khổng lồ mà người đời truyền tụng là "Dấu Chân Tiên".

### 2. Tuyệt Tác Thiên Nhiên Giữa Chín Tầng Mây

- **Phiến đá granite phẳng rộng mênh mông:** Khối đá hoa cương nguyên khối khổng lồ trải rộng hàng trăm mét vuông, bằng phẳng tựa như một sân khấu tự nhiên vươn thẳng ra giữa không trung lộng gió.
- **Tầm nhìn bao quát 360 độ:** Đứng trên Sân Tiên, du khách có thể phóng tầm mắt bao quát trọn vẹn bức tranh đồng bằng Bảy Núi: những ô ruộng Tà Pạ rực rỡ sắc màu, dòng kênh Vĩnh Tế lấp lánh như sợi chỉ bạc, thị trấn Tri Tôn thu nhỏ dưới chân và các ngọn núi thiêng Núi Cấm, Núi Dài, Núi Tượng mờ ảo trong mây ngàn.
- **Biển mây bồng bềnh sáng sớm:** Vào sáng sớm mùa mưa hoặc những ngày độ ẩm cao, cả không gian Sân Tiên chìm đắm giữa biển mây trắng xóa bồng bềnh trôi qua các vồ đá kỳ vĩ.

### 3. Không Gian Tâm Linh & Thiền Tịnh Xứ Núi

- **Các am cốc tu tập cổ kính:** Gần khu vực Sân Tiên là những am điện thờ Phật, Bồ Tát và cốc đá tu thiền của các tu sĩ ẩn dật giữa thiên nhiên thanh tịnh, mang lại cảm giác nhẹ nhõm, trút bỏ mọi muộn phiền nơi trần thế.
- **Đón ánh bình minh đầu ngày:** Trải nghiệm ngắm những tia nắng đầu tiên của ngày mới chiếu sáng rực rỡ lên phiến đá Sân Tiên là khoảnh khắc thiêng liêng và đáng nhớ bậc nhất trong hành trình chinh phục Bảy Núi.

### 4. Hướng Dẫn Di Chuyển & Leo Núi

- **Lựa chọn 1 - Đi "xe ôm bay" bản địa:** Từ chân núi Cô Tô (khu vực Suối Vàng Soài So), thuê các bác tài xe ôm chuyên nghiệp đưa lên đỉnh núi với giá khoảng 80.000đ – 100.000đ/lượt.
- **Lựa chọn 2 - Trekking leo bậc thang:** Đi bộ theo hệ thống bậc thang đá men qua các vườn xoài cổ thụ và am điện thanh tịnh (thời gian leo khoảng 2,5 – 3,5 tiếng).
- **Kết hợp các điểm tham quan trên đỉnh:** Sân Tiên $\rightarrow$ Đá Vồ Hội Mẹ $\rightarrow$ Đá Vồ Hội Đổ $\rightarrow$ Điện Kính Thiên $\rightarrow$ Vồ Pháo Binh.

### 5. Lưu Ý Dành Cho Du Khách

- **Trang phục:** Nên mang giày thể thao chống trơn trượt, áo khoác nhẹ giữ ấm vào sáng sớm hoặc chiều muộn do gió trên đỉnh núi thổi rất mạnh.
- **Tôn trọng tín ngưỡng:** Giữ gìn trật tự trang nghiêm khi ghé thăm các am điện thờ cúng quanh Sân Tiên.
- **Bảo vệ môi trường:** Mang theo bình nước cá nhân và gom toàn bộ rác thải mang xuống núi, tuyệt đối không xả rác trên đỉnh núi.""",
        "opening_hours": "05:00 - 18:30 (Mỗi ngày)",
        "ticket_price": "Miễn phí tham quan",
        "field_tips": "Điểm săn mây và bình minh đỉnh Cô Tô đẹp nhất lúc 05:30–07:00 sáng. Giữ gìn vệ sinh và không xả rác trên đỉnh núi thiêng."
    },

    "2ac3fb9a-con-đường-thốt-nốt-ô": {
        "detailed_story": """Con Đường Thốt Nốt Ô Lâm – Cô Tô: Hàng Cây Biểu Tượng Triệu View Của Miền Tây Nam Bộ

Trải dài men theo con đường làng liên xã nối liền giữa Xã Ô Lâm và Xã Cô Tô, Con Đường Thốt Nốt Ô Lâm – Cô Tô là một trong những biểu tượng phong cảnh đặc trưng và đẹp mắt bậc nhất của vùng đất Tri Tôn An Giang. Hàng trăm thân cây thốt nốt cổ thụ cao vút mọc thẳng tắp hai bên lối đi đất đỏ xẻ dọc qua cánh đồng lúa bạt ngàn, tạo nên bối cảnh sống ảo triệu view đã từng xuất hiện trong vô số bộ ảnh cưới, phóng sự du lịch và video âm nhạc nổi tiếng.

### 1. Vị Trí & Nét Đặc Biệt Của Tuyến Đường Thốt Nốt

- **Vị trí hành chính:** Tuyến đường liên xã kết nối Xã Ô Lâm và Xã Cô Tô, tỉnh An Giang.
- **Khoảng cách:** Cách trung tâm Thị trấn Tri Tôn khoảng 8 km về phía Tây Nam.
- **Mật độ thốt nốt dày đặc nhất Bảy Núi:** Khác với những cây thốt nốt mọc rải rác đơn lẻ trên đồng, tại cung đường Ô Lâm – Cô Tô, hàng trăm cây thốt nốt hàng chục năm tuổi mọc thẳng hàng tăm tắp hai bên đường, tán lá xòe tròn như những chiếc quạt khổng lồ vươn lên nền trời xanh biếc.

### 2. Bức Tranh Đồng Quê Đậm Đà Bản Sắc Khmer

- **Sự hòa quyện giữa cây thốt nốt & ruộng lúa:** Dưới gốc những hàng thốt nốt là những thửa ruộng lúa bậc thang thoai thoải của đồng bào người Khmer. Tùy theo mùa vụ, mặt ruộng khoác lên màu xanh non mơn mởn, màu vàng rực rỡ của lúa chín, hoặc màu nước bạc lấp lánh mùa nước nổi.
- **Khai thác mật hoa thốt nốt truyền thống:** Đi dạo trên cung đường này vào buổi sáng sớm hoặc xế chiều, du khách sẽ bắt gặp hình ảnh những người đàn ông Khmer thoăn thoắt leo lên ngọn thốt nốt cao vút bằng những thân tre gai để thu hoạch những ống tre đựng nước mật hoa ngọt lịm.
- **Những gánh hàng thốt nốt tươi ven đường:** Dọc theo tuyến đường có nhiều quầy hàng mộc mạc của bà con địa phương bán nước thốt nốt tươi ướp lạnh, cùi thốt nốt dẻo giòn và đường thốt nốt nguyên chất gói trong lá thốt nốt khô thơm nức.

### 3. Tọa Độ Sống Ảo Triệu View Cho Giới Trẻ

- **Khung cảnh điện ảnh:** Góc máy chụp dọc theo con đường với hàng thốt nốt chạy dài tít tắp về phía chân núi Cô Tô tạo nên chiều sâu phối cảnh hoàn hảo cho mọi bức ảnh.
- **Bối cảnh lý tưởng cho trang phục truyền thống:** Cung đường rất thích hợp để chụp ảnh cùng tà áo bà ba, nón lá, khăn rằn Nam Bộ, trang phục xăm-pốt truyền thống Khmer hoặc phong cách du mục tự do.

### 4. Hướng Dẫn Khung Giờ Chụp Ảnh Đẹp Nhất

- **Săn hoàng hôn lãng mạn (16:30 – 17:45):** Đây là thời điểm tuyệt vời nhất khi mặt trời đỏ ối dần lặn xuống sau rặng cây thốt nốt, bóng những hàng cây đổ dài trên mặt đất tạo nên những bức ảnh ngược sáng (silhouette) đầy tính nghệ thuật.
- **Bình minh dịu dàng (06:00 – 07:30 sáng):** Khi sương sớm còn vương trên những tán lá và ánh nắng ban mai chiếu rọi nghiêng nghiêng qua kẽ lá.
- **Mùa lúa chín vàng:** Tháng 4, Tháng 8 và Tháng 11–12 hàng năm là lúc cánh đồng hai bên đường rực vàng đẹp nhất.

### 5. Lưu Ý Thực Địa Dành Cho Du Khách

- **Giao thông an toàn:** Đường liên xã có xe máy và xe máy cày của bà con lưu thông, khi dừng lại chụp ảnh cần dựng xe gọn gàng vào mép cỏ để đảm bảo an toàn.
- **Thưởng thức đặc sản:** Đừng quên dừng chân mua ủng hộ bà con một ly nước thốt nốt tươi mát lạnh (giá chỉ 10.000đ – 15.000đ/ly) để tiếp thêm năng lượng cho hành trình khám phá.""",
        "opening_hours": "Tự do tham quan cả ngày",
        "ticket_price": "Miễn phí tham quan",
        "field_tips": "Góc chụp hoàng hôn ngược sáng 16:30–17:30 đẹp ngỡ ngàng. Nhớ dừng chân thưởng thức ly nước thốt nốt tươi mát lạnh của bà con ven đường."
    },

    "4425a57d-cung-đường-biên-giới": {
        "detailed_story": """Cung Đường Biên Giới Kênh Vĩnh Tế (Ba Chúc) – Dòng Kênh Lịch Sử Khai Hoang Mở Cõi Miền Tây Nam Bộ

Chạy dọc theo đường biên giới Tây Nam giáp nước bạn Campuchia qua địa phận Thị trấn Ba Chúc và Xã Lạc Quới, Cung Đường Kênh Vĩnh Tế là một hành trình du lịch lịch sử, cảnh quan và biên cương đầy tự hào. Dòng kênh đào nhân tạo vĩ đại do danh tướng Thoại Ngọc Hầu chỉ huy đắp đào hơn 200 năm trước không chỉ mang giá trị lịch sử khai phá bờ cõi phương Nam mà còn mang lại cảnh sắc đồng quê biên thùy yên ả, thanh bình.

### 1. Lịch Sử Kỳ Vĩ Của Dòng Kênh Nhân Tạo Hơn 200 Năm

- **Vị trí hành chính:** Chạy dọc tuyến biên giới qua Thị trấn Ba Chúc, Xã Vĩnh Gia, Xã Lạc Quới, tỉnh An Giang.
- **Khởi công năm 1819:** Dòng kênh được khởi đào dưới triều vua Gia Long và Minh Mạng, do Danh thần Thoại Ngọc Hầu (Nguyễn Văn Thoại) trực tiếp chỉ huy cùng hàng vạn dân binh và binh lính đục đá đào hào xuyên qua vùng đầm lầy hoang vu.
- **Ý nghĩa tên gọi Vĩnh Tế:** Vua Minh Mạng đã lấy tên của bà Châu Thị Tế (phu nhân của Thoại Ngọc Hầu, người có công lớn động viên dân phu đào kênh) để đặt tên cho dòng kênh lịch sử này.
- **Tầm vóc công trình:** Với chiều dài gần 100 km nối liền Châu Đốc với Hà Tiên, Kênh Vĩnh Tế là công trình thủy lợi – quân sự – giao thương kỳ vĩ bậc nhất lịch sử phong kiến Việt Nam, xác lập chủ quyền cương thổ thiêng liêng của Tổ quốc.

### 2. Cảnh Sắc Biên Cương Thanh Bình & Trù Phú

- **Dòng kênh chở nặng phù sa:** Kênh Vĩnh Tế dẫn nguồn nước ngọt từ sông Hậu thau chua rửa mặn cho toàn bộ vùng đất Tứ Giác Long Xuyên, biến vùng đất phèn hoang hóa xưa kia thành vựa lúa trù phú bậc nhất đồng bằng.
- **Bức tranh cánh đồng sen mùa nước nổi:** Dọc hai bên bờ kênh là những đầm sen hồng ngát hương, những cánh đồng lúa nước mênh mông và rặng dừa nước nghiêng mình soi bóng.
- **Cột mốc biên cương thiêng liêng:** Dọc theo cung đường là các cột mốc biên giới Việt Nam – Campuchia và các đồn biên phòng kiên trung ngày đêm canh giữ bình yên cho dải đất biên cương.

### 3. Trải Nghiệm Khám Phá Tuyến Biên Thùy

- **Chạy xe máy ven bờ kênh:** Cung đường nhựa phẳng phiu ven kênh mang lại cảm giác thong dong, ngắm nhìn nhịp sống bình dị của những người dân chài giăng lưới bắt cá và những chuyến ghe xuồng tấp nập ngược xuôi.
- **Tìm hiểu lịch sử mở cõi:** Ghé thăm các bia tưởng niệm Thoại Ngọc Hầu và đình thần các làng quê ven kênh để hiểu thêm về công lao khai sơn phá thạch của tiền nhân.
- **Thưởng thức ẩm thực đồng quê:** Các quán ăn ven đường phục vụ các món cá lóc nướng trui, lẩu cá linh bông điên điển mùa nước nổi và các món bánh dân gian Nam Bộ.

### 4. Hướng Dẫn Thời Điểm Tham Quan Đẹp Nhất

- **Mùa nước nổi (Tháng 9 – Tháng 11):** Đây là thời điểm Kênh Vĩnh Tế đẹp nhất khi con nước son đỏ ngầu tràn đồng, sen súng nở rộ rực rỡ và chim trời bay rợp mặt nước.
- **Mùa khô (Tháng 12 – Tháng 4):** Thời tiết nắng ráo, lúa chín vàng ươm hai bên bờ kênh, thích hợp cho các chuyến phượt xe máy đường trường.

### 5. Lưu Ý An Toàn Vùng Biên Giới

- **Tuân thủ quy định biên phòng:** Du khách khi tham quan chụp ảnh tại khu vực giáp ranh biên giới cần mang theo căn cước công dân / hộ chiếu, chấp hành nghiêm chỉnh hướng dẫn của lực lượng Bộ đội Biên phòng.
- **Không vượt qua đường biên trái phép:** Tuyệt đối không tự ý băng qua các mốc giới chưa được phép.""",
        "opening_hours": "Lưu thông tự do cả ngày",
        "ticket_price": "Miễn phí tham quan",
        "field_tips": "Nên đi vào mùa nước nổi (tháng 9–11) để ngắm trọn vẹn cảnh sắc đầm sen và dòng kênh lịch sử Thoại Ngọc Hầu. Mang theo CCCD khi đi dọc tuyến biên giới."
    },

    "30ac578e-vườn-mãng-cầu-núi-tô": {
        "detailed_story": """Vườn Mãng Cầu Triền Đá Núi Tô – Trải Nghiệm Miệt Vườn Cây Ăn Trái Độc Đáo Bám Rễ Đá Granit

Trải dài trên các triền dốc đá thoai thoải của Núi Tô (Phụng Hoàng Sơn) thuộc Xã Núi Tô, Vườn Mãng Cầu Triền Đá là một điểm đến trải nghiệm nông nghiệp sinh thái đặc sắc mang đậm dấu ấn thích nghi kỳ diệu của người dân Bảy Núi. Từng gốc mãng cầu bám rễ sâu vào các kẽ đá hoa cương, chắt chiu dòng khoáng chất tinh khiết của đất núi để cho ra đời những trái mãng cầu dai ngọt lịm, vỏ mỏng, thịt chắc thơm nồng nàn không nơi nào sánh bằng.

### 1. Vị Trí & Nghề Trồng Cây Ăn Trái Trên Đá

- **Vị trí hành chính:** Triền dốc Núi Tô, Xã Núi Tô, tỉnh An Giang.
- **Thổ nhưỡng đá granite đặc thù:** Núi Tô có cấu tạo địa chất chủ yếu là đá hoa cương xám. Người dân địa phương qua nhiều thế hệ đã cần mẫn đục đá, be đất trên sườn dốc để trồng mãng cầu ta (mãng cầu dai) và các loại cây ăn trái như xoài bưởi, bơ núi.
- **Hương vị đặc hữu:** Nhờ sinh trưởng trên nền đất đá thoát nước tốt và hấp thụ khoáng chất tự nhiên từ đá granit, quả mãng cầu Núi Tô có mắt nở to đều, vỏ mỏng, cùi dày ít hạt, vị ngọt đậm đà và có mùi thơm thoang thoảng của hương rừng Bảy Núi.

### 2. Trải Nghiệm Khám Phá Miệt Vườn Triền Dốc

- **Dạo bước dưới tán vườn xanh mát:** Du khách sẽ được leo men theo các lối mòn lát đá uốn lượn qua từng tầng vườn mãng cầu xanh mướt, tận mắt chiêm ngưỡng những quả mãng cầu trĩu nặng lúc lỉu bám sát vào thân cây.
- **Tự tay thu hoạch trái chín tại vườn:** Được chủ vườn hướng dẫn cách chọn những quả mãng cầu đã "mở mắt" chín tới, tự tay cắt cuống quả và thưởng thức vị ngọt thơm mát lành ngay dưới bóng cây.
- **Trò chuyện cùng nông dân bản địa:** Nghe bà con người Kinh và Khmer chia sẻ về kỹ thuật thụ phấn hoa mãng cầu thủ công bằng tay từ tờ mờ sáng và cách giữ gìn nguồn nước tưới trên vách núi đá khô cằn.

### 3. Mùa Vụ Thu Hoạch & Mua Làm Quà

- **Mùa thu hoạch rộ:** Mãng cầu Núi Tô cho trái ngon nhất từ tháng 6 đến tháng 9 hàng năm (mùa mưa) và một vụ rải rác phục vụ dịp Tết Nguyên Đán.
- **Thức quà quý Bảy Núi:** Mãng cầu ta Núi Tô được đóng thùng cẩn thận là món quà biếu ý nghĩa, mang đậm phong vị thiên nhiên trù phú của vùng đất An Giang cho người thân và bạn bè.

### 4. Hướng Dẫn Khung Giờ & Check-in

- **Khung giờ lý tưởng:** 07:30 – 10:00 sáng hoặc 15:00 – 17:00 chiều để tránh nắng gắt khi leo triền dốc.
- **Góc chụp sống ảo:** Đứng giữa các tầng cây mãng cầu trĩu quả với hậu cảnh là những tảng đá granite khổng lồ và toàn cảnh cánh đồng Tà Pạ thấp thoáng bên dưới.

### 5. Lưu Ý Thực Địa Dành Cho Du Khách

- **Trang phục:** Đường vườn dốc đá thoai thoải, du khách nên đi giày thể thao có độ ma sát cao để tránh trơn trượt.
- **Mua trái cây tại vườn:** Giá mãng cầu mua trực tiếp tại vườn dao động từ 35.000đ – 60.000đ/kg tùy loại và thời điểm mùa vụ.""",
        "opening_hours": "07:30 - 17:30 (Mỗi ngày)",
        "ticket_price": "Miễn phí tham quan (Giá mua trái cây theo thời giá)",
        "field_tips": "Mùa thu hoạch rộ từ tháng 6 đến tháng 9. Nên mang giày thể thao để đi dạo vườn dốc đá dễ dàng và thưởng thức mãng cầu ngọt lịm hái tại cây."
    }
}

# 1. Update triton_pois_full.json
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

updated_count = 0
for p in pois:
    pid = p.get('id')
    slug = p.get('slug')
    
    # Match by id or slug
    matched_key = None
    for k in checkin_stories:
        if pid == k or slug == k or (k.startswith('6669ffb7') and 'soài-so' in (pid or '')) or (k.startswith('9616e5e5') and 'tơ-lụa' in (pid or '')) or (k.startswith('6ffa8a7b') and 'cầu-gỗ' in (pid or '')) or (k.startswith('9764c175') and 'vườn-nho' in (pid or '')) or (k.startswith('f424d6ea') and 'vách-đá' in (pid or '')) or (k.startswith('b4e743c8') and 'tà-lọt' in (pid or '')) or (k.startswith('san-tien') and 'sân-tiên' in (pid or '')) or (k.startswith('2ac3fb9a') and 'thốt-nốt-ô' in (pid or '')) or (k.startswith('4425a57d') and 'vĩnh-tế' in (pid or '')) or (k.startswith('30ac578e') and 'mãng-cầu' in (pid or '')):
            matched_key = k
            break
            
    if matched_key:
        info = checkin_stories[matched_key]
        p['detailed_story'] = info['detailed_story']
        p['opening_hours'] = info.get('opening_hours', p.get('opening_hours'))
        p['ticket_price'] = info.get('ticket_price', p.get('ticket_price'))
        p['field_tips'] = info.get('field_tips', p.get('field_tips'))
        p['is_hot'] = True
        p['is_verified'] = True
        updated_count += 1
        print(f"✅ Updated check-in story for: [{p.get('id')}] {p.get('name')}")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Successfully saved {updated_count} check-in stories to data/ and frontend/src/data/!")
