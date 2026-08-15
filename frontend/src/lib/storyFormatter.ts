/**
 * storyFormatter.ts — Typography & Layout Alignment Engine for Tri Tôn Tourism
 * Automatically converts raw unformatted paragraphs, squashed CSV lines,
 * and glued text blocks into perfectly aligned, structured Markdown.
 */

export function formatDetailedStory(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';

  let formatted = text.trim();

  // 1. Cultural & Geographical rules
  formatted = formatted
    .replace(/gà nướng đất/gi, 'gà đốt đất')
    .replace(/gà nướng Ô Thum/gi, 'gà đốt Ô Thum')
    .replace(/gà nướng/gi, 'gà đốt')
    .replace(/Huyện Tri Tôn/gi, 'Tri Tôn');

  // 2. Fix dot-numbers (e.g. "miền biên viễn.4. Hướng Dẫn" -> "miền biên viễn.\n\n4. Hướng Dẫn")
  formatted = formatted.replace(/(\.)([1-9]\.)/g, '$1\n\n$2');
  formatted = formatted.replace(/([a-zà-ỹ])([1-9]\.\s*)/g, '$1\n\n$2');

  // 3. Fix glued known phrases
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

  // 4. Insert section headings for numbered items (### 1. Title)
  formatted = formatted.replace(/(?<!\n\n)(?:\s+|^)([1-9]\.\s+[^\n:\.]{3,45}?)(?=\n|$|\.\s)/g, '\n\n### $1\n\n');

  // 5. Format known labels with bullet tags: - **Label:**
  const labels = [
    'Vị trí hành chính', 'Vị trí & Điểm check-in', 'Vị trí', 'Quy mô', 'Lưu ý phân biệt',
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

  // 6. Clean duplicate colons or accidental duplicates
  formatted = formatted
    .replace(/:\*\*:/g, ':**')
    .replace(/- \*\*([^*]+):\*\*\s*& Vườn cây ăn trái:/g, '- **$1:**')
    .replace(/- \*\*([^*]+):\*\*\s*ẩm thực:/g, '- **$1:**')
    .replace(/- \*\*([^*]+):\*\*\s*:\s*/g, '- **$1:** ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ');

  return formatted.trim();
}
