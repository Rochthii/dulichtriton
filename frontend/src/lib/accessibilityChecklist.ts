/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DU LỊCH TRI TÔN AI — ACCESSIBILITY & CONTRAST CHECKLIST MODULE
 * Mã quy chuẩn: A11Y-WCAG-TRITON-V1
 * 
 * Đáp ứng đầy đủ các tiêu chí trợ năng Web & Di động theo chuẩn WCAG 2.1 AA/AAA:
 * 1. WCAG 1.4.3 Contrast Minimum:
 *    - 4.5:1 đối với văn bản thông thường (Normal text, < 18pt / 24px hoặc < 14pt bold).
 *    - 3.0:1 đối với văn bản lớn (Large text, >= 18pt hoặc >= 14pt bold) và UI controls/icons.
 *    - 7.0:1 đối với chuẩn Enhanced Contrast (WCAG AAA).
 * 2. WCAG 2.1.1 Keyboard Navigation & 2.1.2 No Keyboard Trap:
 *    - Mọi tương tác di động/desktop đều có thể truy cập qua bàn phím.
 *    - Phím Escape đóng ngay lập tức các modal / drawer.
 * 3. WCAG 2.4.7 Focus Visible:
 *    - Mọi element tương tác có visual focus ring (:focus-visible).
 * 4. WCAG 2.3.3 Animation from Interactions (Reduced Motion):
 *    - Tuân thủ prefers-reduced-motion: reduce vô hiệu hóa animation/transition.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ColorPairContrast {
  name: string;
  foreground: string;
  background: string;
  ratio: number;
  wcagAANormalText: boolean; // >= 4.5:1
  wcagAALargeTextOrUI: boolean; // >= 3.0:1
  wcagAAAEnhanced: boolean; // >= 7.0:1
  notes: string;
}

/**
 * Chuyển đổi mã màu HEX sang RGB dạng mảng 3 số nguyên [0, 255].
 */
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace(/^#/, '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Invalid HEX color format: "${hex}"`);
}

/**
 * Tính toán độ chói tương đối (Relative Luminance) theo công thức W3C WCAG 2.1:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function calculateRelativeLuminance(hex: string): number {
  const [r255, g255, b255] = hexToRgb(hex);

  const transformChannel = (c: number): number => {
    const sRGB = c / 255;
    return sRGB <= 0.04045
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };

  const r = transformChannel(r255);
  const g = transformChannel(g255);
  const b = transformChannel(b255);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Tính tỷ lệ tương phản (Contrast Ratio) theo chuẩn W3C WCAG 2.1:
 * Ratio = (L1 + 0.05) / (L2 + 0.05) với L1 là luminance sáng hơn, L2 là tối hơn.
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const l1 = calculateRelativeLuminance(color1);
  const l2 = calculateRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  // Làm tròn 2 chữ số thập phân
  return Math.round(ratio * 100) / 100;
}

/**
 * Danh mục kiểm tra độ tương phản các cặp màu trong Folk-Modern Bảy Núi Design System
 */
export const FOLK_MODERN_CONTRAST_PAIRS: Array<{
  name: string;
  foreground: string;
  background: string;
  notes: string;
}> = [
  {
    name: 'Primary Text on Main Background (--ink on --bg)',
    foreground: '#26221B',
    background: '#FAF3E7',
    notes: 'Heading và body text trên nền nắng đồng lúa & cát sương'
  },
  {
    name: 'Primary Text on Surface Card (--ink on --surface)',
    foreground: '#26221B',
    background: '#FFFDF7',
    notes: 'Text chính trên thẻ POI, bưu thiếp và card container'
  },
  {
    name: 'Secondary/Muted Text on Main Background (--ink-soft on --bg)',
    foreground: '#6B6355',
    background: '#FAF3E7',
    notes: 'Chữ phụ, địa chỉ, subtitle, metadata thời gian'
  },
  {
    name: 'Secondary/Muted Text on Surface Card (--ink-soft on --surface)',
    foreground: '#6B6355',
    background: '#FFFDF7',
    notes: 'Chữ phụ trên nền ngà giấy bưu thiếp'
  },
  {
    name: 'Primary CTA Palm Button (--ink on --palm)',
    foreground: '#26221B',
    background: '#F0A32F',
    notes: 'Nút hành động chính vàng mật thốt nốt (Chỉ đường, Lập tour)'
  },
  {
    name: 'White Text on Deep Jade (--surface on --jade-deep)',
    foreground: '#FFFFFF',
    background: '#0B6B60',
    notes: 'Hover state nút xanh ngọc hồ Tà Pạ'
  },
  {
    name: 'Night Mode Primary Text (--firefly on --night-bg)',
    foreground: '#FFD37A',
    background: '#151B34',
    notes: 'Điểm nhấn đèn đom đóm trên nền bầu trời đêm Bảy Núi'
  },
  {
    name: 'Night Mode White Text (White on --night-bg)',
    foreground: '#F8FAFC',
    background: '#151B34',
    notes: 'Văn bản đọc trong Dark Mode Đêm Tri Tôn'
  }
];

/**
 * Đánh giá toàn bộ ma trận tương phản của hệ thống
 */
export function evaluatePaletteContrastMatrix(): ColorPairContrast[] {
  return FOLK_MODERN_CONTRAST_PAIRS.map((pair) => {
    const ratio = calculateContrastRatio(pair.foreground, pair.background);
    return {
      name: pair.name,
      foreground: pair.foreground,
      background: pair.background,
      ratio,
      wcagAANormalText: ratio >= 4.5,
      wcagAALargeTextOrUI: ratio >= 3.0,
      wcagAAAEnhanced: ratio >= 7.0,
      notes: pair.notes
    };
  });
}
