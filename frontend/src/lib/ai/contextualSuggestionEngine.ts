/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DYNAMIC CONTEXTUAL SUGGESTION ENGINE v3.1 (Real-time Entity & Intent Extraction)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Cơ chế sinh từ khóa & câu hỏi tiếp theo DYNAMIC 100%:
 * 1. Dynamic Entity Detection: Quét trực tiếp các POIs/Địa danh/Món ăn xuất hiện trong câu trả lời của AI
 * 2. Next Best Interaction: Tự động ghép thành các câu hỏi bước tiếp theo mang tính thực địa cao
 * 3. Topic & Journey Transition: Tự động chuyển luồng từ Tham quan -> Ẩm thực -> Lưu trú -> Di chuyển
 * 4. Time-Aware Golden Window: Tự động điều chỉnh theo khung giờ thực tế (sáng/trưa/chiều/tối)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ContextualSuggestionInput {
  query: string;
  assistantAnswer?: string;
  matchedPlaces?: Array<{ id: string; name: string; commune?: string; category?: string }>;
  currentHour?: number;
}

export function generateSmartSuggestions(input: ContextualSuggestionInput): string[] {
  const queryLower = (input.query || '').toLowerCase();
  const answerLower = (input.assistantAnswer || '').toLowerCase();
  const combinedText = `${queryLower} ${answerLower}`;

  const currentHour = input.currentHour ?? (() => {
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      hour12: false,
    });
    return parseInt(formatter.format(new Date()), 10);
  })();

  const suggestions: string[] = [];

  const add = (...items: string[]) => {
    for (const item of items) {
      if (item && !suggestions.includes(item) && suggestions.length < 4) {
        suggestions.push(item);
      }
    }
  };

  // ── 1. DYNAMIC POI EXTRACTION TỪ CÂU TRẢ LỜI CỦA AI ────────────────────────
  if (input.matchedPlaces && input.matchedPlaces.length > 0) {
    for (const place of input.matchedPlaces.slice(0, 3)) {
      const pName = place.name;
      const pCat = place.category || '';
      
      // Nếu tên địa điểm có mặt trong câu trả lời của AI -> Sinh câu hỏi đào sâu về địa điểm đó
      if (answerLower.includes(pName.toLowerCase())) {
        if (pCat.includes('gastro') || pCat.includes('ẩm thực') || pName.toLowerCase().includes('quán') || pName.toLowerCase().includes('gà đốt')) {
          add(
            `Đặt bàn trước tại ${pName}`,
            `Điểm check-in đẹp gần ${pName}`,
            `Món ngon nổi tiếng nhất tại ${pName}`
          );
        } else if (pCat.includes('stay') || pName.toLowerCase().includes('homestay') || pName.toLowerCase().includes('khách sạn')) {
          add(
            `Giá phòng tham khảo tại ${pName}`,
            `Quán ăn ngon gần ${pName}`,
            `Thuê xe máy tại ${pName}`
          );
        } else {
          add(
            `Góc chụp ảnh đẹp nhất tại ${pName}`,
            `Đường đi đến ${pName} có dễ không?`,
            `Từ ${pName} đi đâu tiếp theo tiện đường?`
          );
        }
      }
    }
  }

  // ── 2. DYNAMIC INTENT & ENTITY MATRIX THEO NGỮ CẢNH CÂU HỎI & CÂU TRẢ LỜI ──

  // 2.1 Gà Đốt Ô Thum & Hồ Ô Thum
  if (combinedText.includes('ô thum') || combinedText.includes('gà đốt')) {
    add(
      'Đặt trước Gà Đốt Ô Thum để không phải chờ',
      'Hồ Ô Thum có chèo kayak không?',
      'Quán Đu Đủ Đâm Rina cách đây bao xa?',
      'Lịch trình 1 ngày trưa ăn Gà Đốt Ô Thum'
    );
  }

  // 2.2 Hồ Tà Pạ & Cánh Đồng Lúa Tà Pạ & Chùa Núi Tà Pạ
  else if (combinedText.includes('tà pạ') || combinedText.includes('tuyệt tình cốc')) {
    add(
      'Mùa lúa chín Tà Pạ tháng mấy đẹp nhất?',
      'Quán Bò Leo Núi ngon gần Hồ Tà Pạ',
      'Đường lên Chùa Núi Tà Pạ xe máy đi được không?',
      'Sơ đồ cung đường vòng quanh Tà Pạ 1 ngày'
    );
  }

  // 2.3 Núi Cô Tô & Vồ Hội & Sân Tiên & Chữ TRI TÔN
  else if (combinedText.includes('cô tô') || combinedText.includes('vồ hội') || combinedText.includes('sân tiên') || combinedText.includes('chữ tri tôn')) {
    add(
      'Giá xe ôm lên Vồ Hội Mẹ săn hoàng hôn',
      'Kinh nghiệm cắm trại đêm đỉnh Núi Cô Tô',
      'Vị trí chụp ảnh chữ TRI TÔN trên vách núi',
      'Homestay view ngắm Núi Cô Tô đẹp nhất'
    );
  }

  // 2.4 Chùa Xvayton & Kinh Lá Buông
  else if (combinedText.includes('xvayton') || combinedText.includes('svayton') || combinedText.includes('lá buông')) {
    add(
      'Bảo vật Kinh Lá Buông Chùa Xvayton',
      'Lò Bánh Bò Thốt Nốt Út Cột gần Chùa Xvayton',
      'Từ Chùa Xvayton đi Cổng Trời Koh Kas bao xa?',
      'Trang phục chuẩn khi vào chiêm bái Chùa Khmer'
    );
  }

  // 2.5 Cổng Trời Koh Kas & Chùa Hàng Còng
  else if (combinedText.includes('koh kas') || combinedText.includes('cổng trời') || combinedText.includes('hàng còng')) {
    add(
      'Khung giờ vàng chụp ảnh Cổng Trời Koh Kas',
      'Đường vào Cổng Trời ô tô đi được không?',
      'Chùa Hàng Còng cách đây bao xa?',
      'Quán Đu Đủ Đâm Rina Châu Lăng'
    );
  }

  // 2.6 Hồ Soài Chek & Đồi Tà Pạ
  else if (combinedText.includes('soài chek') || combinedText.includes('soài chék')) {
    add(
      'Khung giờ săn hoàng hôn đẹp ở Hồ Soài Chek',
      'Cung đường chạy bộ ven Hồ Soài Chek',
      'Soài Chek Homestay có phòng không?',
      'Từ Soài Chek đi Hồ Tà Pạ bao xa?'
    );
  }

  // 2.7 Đồi Tức Dụp & Nhà Mồ Ba Chúc
  else if (combinedText.includes('tức dụp') || combinedText.includes('tuc dup') || combinedText.includes('nhà mồ') || combinedText.includes('ba chúc')) {
    add(
      'Giá vé tham quan Hang C7 Đồi Tức Dụp',
      'Hướng dẫn viếng Nhà Mồ Ba Chúc',
      'Quán Bò 7 Món Ba Chúc chuẩn vị',
      'Tour Lịch sử Về Nguồn Tri Tôn 1 ngày'
    );
  }

  // 2.8 Cây Thốt Nốt Trái Tim & Con Đường Thốt Nốt
  else if (combinedText.includes('trái tim') || combinedText.includes('thốt nốt')) {
    add(
      'Tọa độ Cây Thốt Nốt Trái Tim An Tức',
      'Địa chỉ mua Đường Thốt Nốt nguyên chất làm quà',
      'Tiệm Bánh Kẹp Thốt Nốt nướng giòn gần đó',
      'Cung đường thốt nốt chụp ảnh sống ảo đẹp nhất'
    );
  }

  // 2.9 Cháo Bò / Bún Cá / Bò 7 Món
  else if (combinedText.includes('cháo bò') || combinedText.includes('bún cá') || combinedText.includes('bò 7 món') || combinedText.includes('bò leo núi') || combinedText.includes('lẩu bò')) {
    add(
      'Quán Cháo Bò Thủy Đen Cầu Cây Me',
      'Quán Bún Cá Củ Ngải Dook chuẩn vị Khmer',
      'Quán Bò 7 Món ngon tại Thị trấn Tri Tôn',
      'Các món ăn vặt chợ đêm Tri Tôn'
    );
  }

  // 2.10 Cà Phê Tri Tôn (Cafe Hopping)
  else if (combinedText.includes('cà phê') || combinedText.includes('cafe') || combinedText.includes('coffee') || combinedText.includes('quán nước')) {
    add(
      'Quán RUỘNG Coffee view cánh đồng lúa',
      'CHẠM Coffee & Tea mở muộn về đêm',
      'Tiệm Cà Phê Nhà Quê ngắm hoàng hôn',
      'NY Coffee & Tea máy lạnh mát mẻ'
    );
  }

  // 2.11 Homestay & Khách Sạn
  else if (combinedText.includes('homestay') || combinedText.includes('khách sạn') || combinedText.includes('nhà nghỉ') || combinedText.includes('nghỉ đêm')) {
    add(
      'Top 5 Homestay view núi Cô Tô đẹp nhất',
      'Khách sạn trung tâm Thị trấn Tri Tôn',
      'Bảng giá thuê xe máy tại homestay',
      'Ăn tối và cà phê đêm gần khu lưu trú'
    );
  }

  // 2.12 Lễ Hội & Thể Thao
  else if (combinedText.includes('đua bò') || combinedText.includes('lễ hội') || combinedText.includes('dù lượn') || combinedText.includes('khinh khí cầu')) {
    add(
      'Lịch Lễ hội Đua Bò Bảy Núi năm nay',
      'Sân đua bò Chùa Tà Miệt ở đâu?',
      'Lễ hội Dù Lượn & Khinh Khí Cầu Thất Sơn Bay',
      'Phong tục ngày Tết Chôl Chnăm Thmây'
    );
  }

  // 2.13 Phương Tiện & Di Chuyển
  else if (combinedText.includes('xe máy') || combinedText.includes('thuê xe') || combinedText.includes('đường đi') || combinedText.includes('xe khách')) {
    add(
      'Địa chỉ thuê xe máy 100k - 150k/ngày ở Tri Tôn',
      'Số hotline cứu hộ xe máy 24/7',
      'Tuyến xe khách Sài Gòn về Tri Tôn đón tận nơi',
      'Lưu ý an toàn khi lái xe qua đèo dốc Núi Cô Tô'
    );
  }

  // ── 3. NHÓM LỊCH TRÌNH / TOUR (ITINERARY CONTINUATION) ─────────────────────
  if (suggestions.length < 3) {
    if (combinedText.includes('lịch trình') || combinedText.includes('tour') || combinedText.includes('1 ngày') || combinedText.includes('2 ngày') || combinedText.includes('3 ngày')) {
      add(
        'Tổng chi phí dự kiến cho lịch trình này?',
        'Thời gian chạy xe máy giữa các chặng?',
        'Quán ăn trưa ngon dọc cung đường này',
        'Hotline cứu hộ xe máy khi đi tour'
      );
    }
  }

  // ── 4. TIME-AWARE DYNAMIC FALLBACK (KHUNG GIỜ VÀNG THỰC TẾ) ───────────────
  if (suggestions.length < 3) {
    if (currentHour >= 6 && currentHour < 10) {
      add(
        'Quán Cháo Bò Bảy Núi ăn sáng ngon',
        'Quán Bún Cá Củ Ngải Dook gần đây',
        'Đường lên Cổng Trời Koh Kas sáng sớm'
      );
    } else if (currentHour >= 10 && currentHour < 14) {
      add(
        'Quán Gà Đốt Ô Thum nào chuẩn vị nhất?',
        'Có cần gọi đặt bàn Gà Đốt trước không?',
        'Chòi lá ven Hồ Ô Thum nghỉ trưa mát'
      );
    } else if (currentHour >= 14 && currentHour < 18) {
      add(
        'Khung giờ săn hoàng hôn đẹp ở Hồ Soài Chek',
        'Lò Bánh Bò Thốt Nốt Út Cột ăn xế',
        'Vị trí Cây Thốt Nốt Trái Tim chụp ảnh'
      );
    } else if (currentHour >= 18 && currentHour < 22) {
      add(
        'Quán Bò 7 Món ngon ăn tối Tri Tôn',
        'Quán Cà Phê mở muộn view đẹp về đêm',
        'Chợ Đêm Tri Tôn có món gì ngon?'
      );
    } else {
      add(
        'Hotline cứu hộ xe máy đêm 24/7',
        'Homestay gần nhất còn phòng',
        'Kinh nghiệm săn mây Vồ Hội Mẹ 05:00 sáng'
      );
    }
  }

  return suggestions.slice(0, 4);
}
