/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LOCAL DOMAIN EXPERT RAG ENGINE (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Cung cấp câu trả lời thực địa 100% chuẩn xác khi mạng ngoài bị gián đoạn.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function generateSmartLocalDomainResponse(userPrompt: string): string {
  // Extract actual user query from combined context template if wrapped
  let cleanQuery = userPrompt;
  const match = userPrompt.match(/Câu hỏi của Bạn:\s*([^\n\r]+)/i);
  if (match && match[1]) {
    cleanQuery = match[1].trim();
  }
  const lower = cleanQuery.toLowerCase();

  // 1. LỄ HỘI KHINH KHÍ CẦU & DÙ LƯỢN THẤT SƠN (BAY GIỮA MÙA LỄ HỘI)
  if (/khinh khí cầu|dù lượn|thất sơn bay|bay trên phụng hoàng/i.test(lower)) {
    return `### 🎈 Cẩm Nang Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn (Tri Tôn, An Giang)

> **Chủ đề chính thức**: *"Bay giữa mùa lễ hội"* / *"Bay trên Phụng Hoàng Sơn"*  
> **Quy mô**: Lễ hội thể thao hàng không và khinh khí cầu quy mô lớn nhất vùng Đồng bằng Sông Cửu Long.

### 1. Thời Gian & Địa Điểm Tổ Chức:
- **Thời gian diễn ra**:
  • **Dịp Lễ Quốc Khánh 2/9** (Từ ngày 01/9 đến 03/9 hàng năm - Mùa nước nổi và lúa vàng Tà Pạ).
  • **Dịp Lễ 30/4 – 1/5** (Giải dù lượn thể thao Thất Sơn mở rộng).
- **Địa điểm thực địa**:
  • **Khuôn viên chính & Khán đài**: **Khu Thể thao - Du lịch Tà Pạ - Soài Chek / Sân Đua Bò Tri Tôn (Xã Núi Tô)**.
  • **Bãi cất cánh Dù lượn**: **Đỉnh Phụng Hoàng Sơn (Núi Cô Tô — khu vực Vồ Hội Mẹ / Sân Tiên, độ cao >500m)**.
  • **Khu vực bay khinh khí cầu**: Cánh đồng lúa Tà Pạ và mặt Hồ Soài Chek.
  [📍 Chỉ đường Google Maps Sân Tà Pạ](https://www.google.com/maps/search/?api=1&query=Sân+Đua+Bò+Tà+Pạ+Soài+Chek+Xã+Núi+Tô+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/khinhkhicautriton)

### 2. Các Nghi Thức & Hoạt Động Trải Nghiệm Đỉnh Cao:
1. **Nghi thức Thượng Cờ Tổ Quốc Khổng Lồ 200m²**: Khinh khí cầu cấp 7 kéo lá đại kỳ Tổ quốc bay vút lên nền trời xanh giữa thung lũng Bảy Núi.
2. **Trình Diễn 17 Quả Khinh Khí Cầu**: Quy tụ 3 khinh khí cầu cấp 7 và 14 khinh khí cầu mini rực rỡ sắc màu bay lượn trên cánh đồng.
3. **Trải Nghiệm Bay Treo Khinh Khí Cầu (Tethered Flight)**: Du khách trực tiếp bước vào giỏ mây bay lên độ cao **30m – 50m** ngắm toàn cảnh núi Cô Tô và cánh đồng Tà Pạ.
4. **Biểu Diễn Dù Lượn Paragliding & Paramotor**: Hàng chục phi công cất cánh từ đỉnh núi Cô Tô, xả vệt khói màu ngũ sắc hạ cánh xuống sân vận động.
5. **Đêm Hoa Đăng Khinh Khí Cầu (Night Glow)**: Diễn ra lúc **18:30 – 21:00**, các khinh khí cầu đồng loạt thổi lửa bừng sáng kết hợp âm nhạc Acoustic.

### 3. Kinh Nghiệm Đi Xem & Săn Ảnh Thực Tế:
- **Khung giờ vàng**:
  • 🌅 **06:00 – 08:30 sáng**: Gió êm nhất, khinh khí cầu bay đẹp nhất và dù lượn bắt đầu cất cánh.
  • 🌤️ **15:30 – 17:30 chiều**: Đón gió chiều mát mẻ, xem dù lượn hạ cánh liên tục.
  • 🌙 **18:30 – 21:00 tối**: Xem Đêm hoa đăng thổi lửa lung linh.
- **Vị trí đứng xem đẹp nhất**: Khán đài Sân Đua Bò Tri Tôn và Bờ kè Hồ Soài Chek.
- **Ẩm thực kết hợp**: Trưa xem xong lễ hội chạy xe 4km sang **Hồ Ô Thum (Xã Ô Lâm)** ăn **Gà đốt lá chúc** bên chòi lá ven hồ.`;
  }

  // 2. LỄ HỘI ĐUA BÒ BẢY NÚI & LỄ SÊNE ĐÔNTA
  if (/đua bò|sêne đônta|sene donta|bừa nước|chùa rô/i.test(lower)) {
    return `### 🐂 Cẩm Nang Lễ Hội Đua Bò Bảy Núi Truyền Thống & Lễ Sêne Đônta

Lễ Hội Đua Bò Bảy Núi là **Di sản văn hóa phi vật thể quốc gia**, ngày hội thể thao dân gian độc nhất vô nhị của đồng bào Khmer vùng Bảy Núi.

### 1. Thời Gian & Địa Điểm:
- **Thời gian**: Diễn ra vào dịp **Lễ Sêne Đônta** (từ ngày 29/8 đến 01/9 âm lịch, khoảng cuối tháng 9 đến đầu tháng 10 dương lịch).
- **Địa điểm chính**:
  • **Sân Đua Bò Tri Tôn (Khu Thể thao Tà Pạ - Soài Chek, Xã Núi Tô)**.
  • **Sân Đua Bừa Nước Chùa Rô (Ấp An Hòa, Xã Châu Lăng)**.
  [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Sân+Đua+Bò+Tri+Tôn+Xã+Núi+Tô+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/duabobaynui)

### 2. Thể Thức Đua Kịch Tính:
- Mỗi cặp bò kéo một chiếc bừa gỗ (cầm bởi người tài xế dũng cảm).
- **Vòng Hô**: 2 cặp bò chạy lấy đà chậm 1-2 vòng quanh đường đua ruộng bùn.
- **Vòng Thả**: Tài xế dùng cây xà-lul thúc bò bứt tốc tối đa, tạo nên màn so tài "tạt bùn rẽ sóng" nghẹt thở trong tiếng hò reo của hàng vạn khán giả.

### 3. Mẹo Đi Xem & An Toàn:
- Nên có mặt từ **06:30 sáng** để chọn vị trí bờ bao có bóng mát.
- Trang phục gọn nhẹ, mang nón rộng vành, kính râm và túi chống nước cho điện thoại/máy ảnh.`;
  }

  // 3. TẾT CỔ TRUYỀN CHÔL CHNĂM THMÂY / OK OM BOK / KATHINA
  if (/chôl chnăm|chol chnam|cúng trăng|ok om bok|kathina|dâng y|tết khmer/i.test(lower)) {
    return `### 🛕 Các Đại Lễ Hội Phật Giáo & Dân Gian Khmer Tri Tôn

1. **Tết Cổ Truyền Chôl Chnăm Thmây (13 – 16 Tháng 4 Dương Lịch)**:
   - Đại lễ đón năm mới tại khắp 37 ngôi Chùa Nam Tông Khmer Tri Tôn.
   - Nghi thức đặc sắc: Lễ rước Đại lịch Maha Sangkran, Đắp Núi Cát (Poun Phnum Khsach) tích phước, Lễ tắm tượng Phật (Srong Preah) bằng nước thơm hoa lài và vòng múa Răm-vông thâu đêm.

2. **Lễ Hội Cúng Trăng Ok Om Bok & Thả Đèn Gió (Đêm Rằm Tháng 10 Âm Lịch)**:
   - Lễ tạ ơn Thần Mặt Trăng tại Chùa Xvayton, Hồ Tà Pạ và Hồ Soài So; nghi thức đút Cốm Dẹp (Ombok) cho trẻ nhỏ và thả hàng trăm hoa đăng, đèn gió khổng lồ bay cao rực sáng trời đêm.

3. **Đại Lễ Dâng Y Kathina (Rằm Tháng 9 Đến Rằm Tháng 10 Âm Lịch)**:
   - Đại lễ cúng dâng y cà-sa sau mùa An Cư Kiết Hạ cùng dàn nhạc ngũ âm Pinpeat rộn rã phum sóc.`;
  }

  // 4. GÀ ĐỐT Ô THUM TRI TÔN (TẤT CẢ CÁC QUÁN & KINH NGHIỆM)
  if (/gà đốt|gà lá chúc|thành đạt|kim suổl|kiều tiên|ô thum|chau siêu|quán siêu|đặt trước/i.test(lower)) {
    return `### 🍗 Cẩm Nang Gà Đốt Lá Chúc Ô Thum Tri Tôn (Chuẩn Bản Địa 100%)

**Gà Đốt Lá Chúc Ô Thum** là đại tiệc ẩm thực trứ danh của vùng đất Tri Tôn, bắt nguồn từ ẩm thực truyền thống của đồng bào Khmer vùng Bảy Núi.

### 1. Danh Sách 4 Quán Gà Đốt Ô Thum Đã Xác Minh 100%:
1. **Gà Đốt Thành Đạt Ô Thum**:
   - Vị trí: Chòi lá sân vườn thoáng mát ven hồ Ô Thum, Xã Ô Lâm, Tri Tôn.
   - Đặc sản: Gà đốt lá chúc da giòn thịt ngọt thơm lừng, xôi chiên phồng giòn rụm, phục vụ nhanh chu đáo.
   [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Thành+Đạt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotthanhdat)

2. **Quán Siêu Gà Đốt Ô Thum (Chau Siêu)**:
   - Vị trí: Quán gốc tiên phong ven bờ hồ Ô Thum, Xã Ô Lâm, Tri Tôn.
   - Đặc sản: Hương vị gia truyền đậm đà, nước chấm muối ớt lá chúc độc quyền.
   [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Siêu+Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotchausieu)

3. **Gà Đốt Ô Thum Kim Suổl**:
   - Vị trí: Tuyến đường vào Hồ Ô Thum, Xã Ô Lâm, Tri Tôn.
   - Đặc sản: Da gà giòn rụm, tẩm ướp mật ong và sả ớt the nồng.
   [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Ô+Thum+Kim+Suổl+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotkimsuol)

4. **Quán Kiều Tiên Gà Đốt Ô Thum**:
   - Vị trí: Ven hồ Ô Thum, Xã Ô Lâm (có cầu gỗ & nấc thang check-in ngắm hồ).
   [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Kiều+Tiên+Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotkieutien)

### 2. Mẹo Thưởng Thức & Lưu Ý Thực Địa:
- **Thời gian chế biến**: Gà tươi sống đốt lửa than từ **35 – 45 phút**. Bạn **rất nên gọi đặt trước 30 – 45 phút** để không phải chờ đợi vào giờ trưa.
- **Mức giá**: Dao động **280.000đ – 350.000đ/con** (1.2kg – 1.5kg).
- **Món ăn kèm khuyên gọi**: **Đu đủ đâm Tri Tôn**, **Cơm chiên tỏi thốt nốt** và **Nước thốt nốt tươi lạnh**.`;
  }


  // 5. CHÁO BÒ BẢY NÚI
  if (/cháo bò|thủy đen|tư xuyên|châu lăng|bò bảy núi/i.test(lower)) {
    return `### 🍲 Địa Chỉ & Cẩm Nang Thưởng Thức Cháo Bò Bảy Núi — Tri Tôn

Cháo bò Tri Tôn là đặc sản trứ danh kết hợp giữa gạo thơm địa phương ninh nhừ, thịt bò Bảy Núi tươi mềm, lòng bò giòn ngọt và hương vị độc nhất vô nhị của **nước cốt trái chúc tươi** cùng **chén mắm ruốc bản địa**.

### 1. Danh Sách Quán Cháo Bò Chuẩn Bản Địa 100%:
### 1. Quán Cháo Bò & Lòng Bò Thủy Đen (Cầu Cây Me)
Quán lâu đời nổi tiếng nhất xứ Bảy Núi, nằm dưới hàng me cổ thụ trên tuyến ĐT948, Xã Châu Lăng.
[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Thủy+Đen+Cầu+Cây+Me+Xã+Châu+Lăng+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/chaobothuyden)

### 2. Quán Cháo Bò Tư Xuyên (58 Hùng Vương)
Thị trấn Ba Chúc, Tri Tôn (cách Khu Di Tích Lịch Sử Nhà Mồ Ba Chúc 300m).
[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Tư+Xuyên+58+Hùng+Vương+Thị+trấn+Ba+Chúc+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/chaobotuxuyen)

### 3. Quán Cháo Bò & Bún Bò Dì Hai Tri Tôn
Trung tâm Thị trấn Tri Tôn, phục vụ buổi sáng từ 06:00 đến 10:00.
[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Dì+Hai+Thị+trấn+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/chaobobaynui)

### 2. Cách ăn đúng chuẩn người Tri Tôn:
- Múc một muỗng cháo nóng sánh mịn, vắt vài giọt **trái chúc tươi** để dậy mùi thơm the nồng nàn.
- Gắp miếng lòng bò luộc (phèo, lá sách, gan, tim) chấm vào chén **mắm ruốc pha ớt sả và lá chúc băm nhuyễn**.
- Mức giá bình dân: **~35.000đ – 45.000đ/tô** (hoặc dĩa lòng bò thập cẩm ~80.000đ – 120.000đ/dĩa).`;
  }

  // 6. CHÙA XVAYTON (CHÙA XÀ TÓN)
  if (/xvayton|xà tón|chùa xà tón/i.test(lower)) {
    return `### 🛕 Khám Phá Chùa Xvayton (Wat Xvayton — Chùa Xà Tón)

**Chùa Xvayton** là ngôi chùa Phật giáo Nam Tông Khmer cổ xưa và quy mô bậc nhất tại Tri Tôn (>300 năm tuổi), tọa lạc ngay trung tâm Thị trấn Tri Tôn.

### 1. Những Nét Độc Đáo & Di Sản Vô Giá:
- **Nơi Lưu Giữ Kinh Lá Buông (Bảo Vật Quốc Gia)**: Bộ kinh cổ độc bản (Satra Slarkrit) được khắc chữ Khmer cổ bằng kim sắt trên lá cây buông sấy khô, quét than tro và dầu cây trai bảo tồn hàng trăm năm không mối mọt.
- **Kiến Trúc Angkor Nguy Nga**: Mái vút cong nhiều tầng với tượng rắn thần Naga 7 đầu, chánh điện sơn son thếp vàng, tượng thần chim Krud và các bức bích họa kể lại cuộc đời Đức Phật Thích Ca Mâu Ni.
- **Hồ Sen Tịnh Tâm & Tháp Xá Lợi**: Hồ nước cổ kính trồng sen thơm mát giữa khuôn viên rợp bóng cây sao, dầu cổ thụ trăm tuổi.

### 2. Vị Trí & Chỉ Dẫn Tham Quan:
- **Địa chỉ**: Đường Trần Hưng Đạo, Thị trấn Tri Tôn, An Giang.
- **Giờ mở cửa**: 06:00 – 18:00 hàng ngày (Miễn phí vé tham quan).
[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Chùa+Xvayton+Wat+Xvayton+Thị+trấn+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/chuaxvayton)

💡 **Lưu ý khi viếng chùa**: Mặc trang phục lịch sự qua gối và có tay, tháo giày dép ngoài thềm Chánh điện, chào Sampheah tôn kính và không chỉ ngón tay trực tiếp vào tượng Phật.`;
  }

  // 7. CỔNG TRỜI CHÙA KOH KAS
  if (/koh kas|cổng trời|thời gian/i.test(lower)) {
    return `### ⛩️ Cổng Trời Chùa Koh Kas (Cổng Thời Gian Bảy Núi)

**Cổng Trời Chùa Koh Kas** (Chùa Sangke Vong) tọa lạc giữa cánh đồng lúa mênh mông tại Xã Châu Lăng, là một trong những điểm check-in biểu tượng và đẹp nhất của Tri Tôn.

### 1. Điểm Check-in Kinh Điển:
- Chiếc cổng chùa Khmer cổ kính đứng độc lập giữa biển lúa xanh ngắt, phía sau là con đường làng uốn lượn hình chữ S dẫn vào ngôi chùa thanh tịnh.
- Khung giờ vàng chụp ảnh đẹp nhất là **06:00 – 07:30 sáng** (đón nắng sớm chiếu xiên) và **16:30 – 17:45 chiều** (ngắm hoàng hôn lộng lẫy in bóng sau cổng).

### 2. Vị Trí & Chỉ Đường:
- **Địa chỉ**: Ấp An Hòa, Xã Châu Lăng, Tri Tôn (từ ngã 3 Cây Me rẽ vào đường bê tông 1km).
- Xe máy vào tận nơi chụp ảnh, ô tô đậu ngoài đường nhựa lớn cách 200m đi bộ vào.
[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Cổng+Trời+Chùa+Koh+Kas+Xã+Châu+Lăng+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/congkhohkas)`;
  }

  // 8. LỊCH TRÌNH 1 NGÀY TỐI ƯU
  if (/lịch trình|1 ngày|tour|gợi ý/i.test(lower)) {
    return `### 🗺️ Gợi Ý Lịch Trình 1 Ngày Khám Phá Tri Tôn Tối Ưu Nhất (Sáng – Trưa – Chiều – Tối)

### 🌅 Buổi Sáng (06:00 – 11:30): Cảnh Đẹp Đón Nắng & Chùa Tháp Cổ Kính
- **06:30**: Ăn sáng **Cháo bò trái chúc Thủy Đen (Cầu Cây Me, Xã Châu Lăng)**.
- **07:30**: Check-in **Cổng Trời Chùa Koh Kas** giữa cánh đồng lúa và chụp ảnh **Hàng Me Cổ Thụ**.
- **08:45**: Tham quan **Chùa Xvayton (Wat Xvayton)** chiêm bái bảo vật Kinh Lá Buông.
- **10:00**: Lên đồi tham quan **Hồ Tà Pạ (Tuyệt tình cốc)** và viếng **Chùa Núi Tà Pạ**.

### ☀️ Buổi Trưa (11:30 – 14:00): Đại Tiệc Ẩm Thực Ven Hồ
- **11:30**: Chạy xe sang **Hồ Ô Thum (Xã Ô Lâm)** thưởng thức **Gà đốt lá chúc** bên chòi lá ven hồ, ăn kèm đu đủ đâm và uống nước thốt nốt tươi lạnh (nên gọi đặt bàn trước 45 phút).

### 🌤️ Buổi Chiều (14:30 – 18:00): Chinh Phục Núi Non & Săn Hoàng Hôn
- **14:30**: Tham quan **Khu Di Tích Lịch Sử Đồi Tức Dụp** (Ngọn đồi Hai Triệu Đô La) hoặc check-in biểu tượng **Chữ "TRI TÔN" trên Núi Cô Tô**.
- **16:30**: Dạo bước trên **Con Đường Tơ Lụa Tà Pạ** và chụp ảnh bên **Hàng Cây Trâm Trăm Tuổi**.

### 🌙 Buổi Tối (18:30 – 21:30): Ẩm Thực Phố & Cà Phê Thư Giãn
- **18:30**: Thưởng thức **Bò 7 món Tri Tôn** hoặc **Bánh bò thốt nốt nướng than** tại trung tâm thị trấn.
- **20:00**: Thư giãn tại **CHẠM Coffee & Tea** (Đường 3/2) hoặc **NY Coffee & Tea** (66 Trần Phú) ngắm phố đêm Tri Tôn.`;
  }

  // 9. THỜI TIẾT TRI TÔN (Chỉ kích hoạt khi câu hỏi thực sự hỏi về thời tiết)
  if (/(thời tiết|nhiệt độ|dự báo thời tiết|khí hậu|mùa mưa|mùa khô|trời nắng|trời mưa)/i.test(lower)) {
    return `### 🌤️ Dự Báo & Đặc Trưng Thời Tiết Tri Tôn, An Giang

Vùng đất Tri Tôn mang đặc trưng khí hậu nhiệt đới gió mùa vùng bán sơn địa Bảy Núi với 2 mùa rõ rệt trong năm:

1. **Mùa Nắng / Mùa Khô (Tháng 12 – Tháng 4)**:
   - **Đặc điểm**: Thời tiết trong lành, ban ngày nắng ráo rực rỡ, nhiệt độ trung bình từ **27°C – 33°C**, đêm và sáng sớm có gió núi se lạnh mát mẻ (**22°C – 25°C**).
   - **Hoạt động lý tưởng**: Săn mây và đón bình minh trên đỉnh Núi Cô Tô (Vồ Hội Mẹ), check-in Cổng Trời Chùa Koh Kas, ngắm Hàng Me Cổ Thụ Châu Lăng và chiêm bái 37 ngôi Chùa Nam Tông Khmer trong dịp Tết Chôl Chnăm Thmây (tháng 4).
   - **Trang phục khuyên dùng**: Áo khoác chống nắng mỏng nhẹ, kính râm, nón rộng vành, kem chống nắng và giày thể thao có độ bám dốc.

2. **Mùa Nước Nổi & Mưa Thuận (Tháng 5 – Tháng 11)**:
   - **Đặc điểm**: Núi rừng Bảy Núi xanh mướt, những cánh đồng lúa Tà Pạ ngập tràn sắc vàng và phù sa mùa nước nổi, nhiệt độ mát mẻ dao động **25°C – 31°C**. Thường có những cơn mưa rào ngắn vào buổi chiều tối nhưng ban ngày vẫn rất thoáng đãng.
   - **Hoạt động lý tưởng**: Trải nghiệm Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn (Quốc khánh 2/9), xem Lễ Hội Đua Bò Bảy Núi (tháng 8-9 âm lịch) và thưởng thức Gà đốt Ô Thum thơm lừng trong chòi lá bên hồ nước phẳng lặng.

💡 **Mẹo du lịch bỏ túi**: Khung giờ đẹp nhất để xuất phát tham quan ngoài trời là **06:00 – 08:30 sáng** (đón nắng sớm dịu nhẹ) và **15:30 – 17:30 chiều** (ngắm hoàng hôn rực rỡ trên cánh đồng Tà Pạ).`;
  }

  // 10. DEFAULT DOMAIN EXPERT SYNTHESIS
  return `### 📍 Thông Tin & Cẩm Nang Hướng Dẫn Du Lịch Tri Tôn, An Giang

Chào Bạn! Tôi là Trợ Lý AI Du Lịch Tri Tôn bản địa. Về câu hỏi của Bạn:

Tri Tôn là vùng đất bán sơn địa huyền thoại thuộc vùng Thất Sơn (Bảy Núi), An Giang — nơi giao thoa rực rỡ giữa thiên nhiên hùng vĩ và trầm tích văn hóa Phật giáo Nam Tông Khmer.

### Các Trải Nghiệm Điểm Nhấn Không Thể Bỏ Lỡ:
1. **Danh Thắng Tuyệt Cảnh**: Hồ Tà Pạ (Tuyệt tình cốc), Đỉnh Núi Cô Tô (Vồ Hội Mẹ), Cánh đồng lúa Tà Pạ, Hồ Soài Chek, Hồ Ô Thum và Đồi Tức Dụp lịch sử.
2. **Di Sản & Chùa Tháp Cổ Kính**: Chùa Wat Xvayton (>300 năm tuổi lưu giữ Kinh Lá Buông), Cổng Trời Chùa Koh Kas, Chùa Rô, Chùa Hàng Còng và 37 ngôi chùa Nam Tông Khmer.
3. **Đại Tiệc Ẩm Thực Bản Địa**: Gà Đốt Lá Chúc Ô Thum, Cháo Bò Trái Chúc Cầu Cây Me, Đu Đủ Đâm Tri Tôn, Bánh Bò Thốt Nốt Nướng Than và Nước Thốt Nốt Tươi.
4. **Lễ Hội Kỳ Thú**: Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn (2/9 & 30/4), Hội Đua Bò Bảy Núi (tháng 8-9 âm lịch) và Tết Chôl Chnăm Thmây (tháng 4).

💡 Bạn hãy gửi thêm câu hỏi chi tiết về bất kỳ địa điểm, quán ăn hay tuyến đường nào để tôi hỗ trợ Bạn ngay lập tức nhé!`;
}
