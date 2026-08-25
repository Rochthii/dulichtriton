/**
 * storyFormatter.ts — Typography & Layout Alignment Engine for Tri Tôn Tourism
 * Automatically converts raw unformatted paragraphs, squashed CSV lines,
 * and glued text blocks into perfectly aligned, structured Markdown.
 */

export function formatDetailedStory(text?: string | null, _placeName?: string): string {
  if (!text || typeof text !== 'string') return '';

  let formatted = text.trim();

  // 1. Remove AI prompt boilerplate prefixes
  formatted = formatted
    .replace(/^(?:Dưới đây là|Sau đây là)[\s\S]*?(?:giới thiệu|thông tin|chi tiết|bố cục)[^:\n]*?:\s*/gim, '')
    .replace(/^Dưới đây là bản biên tập[\s\S]*?:\s*/gim, '')
    .replace(/^Thông Tin Thực Tế Về[\s\S]*?:\s*/gim, '')
    .replace(/^Khám phá[\s\S]*?–\s*/gim, '');

  // 2. Clean LaTeX artifacts like $$\text{...}$$ or $$
  formatted = formatted
    .replace(/\$\$\\text\{([^}]+)\}\$\$/g, '$1')
    .replace(/\$\$/g, '')
    .replace(/\\text\{([^}]+)\}/g, '$1');

  // 3. Cultural & Geographical rules
  formatted = formatted
    .replace(/gà nướng đất/gi, 'gà đốt đất')
    .replace(/gà nướng Ô Thum/gi, 'gà đốt Ô Thum')
    .replace(/gà nướng/gi, 'gà đốt')
    .replace(/Huyện Tri Tôn/gi, 'Tri Tôn');

  // 4. Fix glued known phrases & TitleCase gluing
  const gluedPairs: [string, string][] = [
    ['Địa LýVị trí hành chính', 'Địa Lý\n\n- **Vị trí hành chính:** '],
    ['Sơn DânRừng tầm vông', 'Sơn Dân\n\n- **Rừng tầm vông & Vườn cây ăn trái:** '],
    ['Tâm LinhNúi Dài không chỉ', 'Tâm Linh\n\nNúi Dài không chỉ'],
    ['Khám PháPhương tiện', 'Khám Phá\n\n- **Phương tiện:** '],
    ['QuanAn toàn', 'Quan\n\n- **An toàn:** '],
    ['thanh sạch.Thưởng thức', 'thanh sạch.\n\n- **Thưởng thức ẩm thực:** '],
    ['hào hùng:Khu Căn cứ', 'hào hùng:\n\n- **Khu Căn cứ Cách mạng Ô Tà Sóc:** '],
    ['tuyến đường 1C.Hồ Ô Tà Sóc', 'tuyến đường 1C.\n\n- **Hồ Ô Tà Sóc:** '],
  ];

  for (const [oldStr, newStr] of gluedPairs) {
    formatted = formatted.split(oldStr).join(newStr);
  }

  // 5. Fix glued title-to-sentence (e.g. "Thất SơnNằm dưới" -> "Thất Sơn\n\nNằm dưới")
  formatted = formatted.replace(
    /(Sơn|Tôn|Pạ|Chék|Thum|Chúc|Dụp|Sóc|Trì|Tô|Phi|Gia|Quới|Đảnh|Tuyến|Phước|Trà|Vinh|Nam|Việt|Khmer|Đá|Hồ|Núi)([A-ZÀ-Ỹ][a-zà-ỹ]{2,})/g,
    '$1\n\n$2'
  );

  // 6. Guarantee separation of numbered sections (1. 2. 3. 4. 5. 6. 7. 8. 9.)
  // Matches "chữ. 1. Tiêu đề" or "chữ 1. Tiêu đề" or "\n1. Tiêu đề"
  formatted = formatted.replace(/([^\n])\s*(?:###\s*)?([1-9]\.\s+[A-ZÀ-Ỹ0-9][^\n:\.\?]{2,50}?)(?=\n|:\s*|\.\s+[A-ZÀ-Ỹ]|\s+[1-9]\.|$)/g, '$1\n\n### $2\n\n');
  formatted = formatted.replace(/^([1-9]\.\s+[A-ZÀ-Ỹ0-9][^\n:\.\?]{2,50}?)(?=\n|:\s*|\.\s+[A-ZÀ-Ỹ]|$)/gm, '### $1\n\n');

  // 7. Format known labels with bullet tags: - **Label:**
  const labels = [
    'Vị trí hành chính', 'Vị trí & Điểm check-in', 'Vị trí & Đường đi', 'Vị trí', 'Quy mô', 'Lưu ý phân biệt',
    'Núi Dài Lớn (Ngọa Long Sơn)', 'Núi Dài Nhỏ (Ngũ Hồ Sơn / Núi Dài Năm Giếng)',
    'Rừng tầm vông & Vườn cây ăn trái', 'Hệ thống suối & Điểm tập kết nông sản',
    'Khu Căn cứ Cách mạng Ô Tà Sóc', 'Đồi Ma Thiên Lãnh & Hang Quân Y, Điện Trời Gầm',
    'Hồ Ô Tà Sóc', 'Điện Tàu Cau & Các am cốc tu tập', 'Phương tiện', 'Trekking khám phá',
    'Thưởng thức ẩm thực', 'An toàn', 'Tôn nghiêm & Môi trường', 'Giờ mở cửa', 'Giá vé / Mức giá',
    'Thời điểm đẹp nhất', 'Thời điểm lý tưởng', 'Góc chụp ảnh đẹp', 'Mẹo trải nghiệm',
    'Kinh nghiệm thực địa', 'Đặc sản nổi bật', 'Bí quyết thưởng thức', 'Cách đi lại',
    'Hương vị đặc trưng', 'Bí quyết nước chấm', 'Lịch sử hình thành', 'Kiến trúc độc đáo'
  ];

  for (const lbl of labels) {
    const regex = new RegExp(`(?<!\\n- \\*\\*)(?<!### )(${lbl}:)`, 'g');
    formatted = formatted.replace(regex, `\n- **${lbl}:**`);
  }

  // 8. Clean duplicate hashes, spaces & excessive newlines
  formatted = formatted
    .replace(/###\s*###\s*/g, '### ')
    .replace(/:\*\*:/g, ':**')
    .replace(/- \*\*([^*]+):\*\*\s*& Vườn cây ăn trái:/g, '- **$1:**')
    .replace(/- \*\*([^*]+):\*\*\s*ẩm thực:/g, '- **$1:**')
    .replace(/- \*\*([^*]+):\*\*\s*:\s*/g, '- **$1:** ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return formatted;
}
