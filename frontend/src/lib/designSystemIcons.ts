/**
 * DU LỊCH TRI TÔN AI — DESIGN SYSTEM ICONS & EMOJI REPLACEMENT REGISTRY
 * Folk-Modern Bảy Núi Design Tokens: replaces raw OS emojis with crisp Lucide SVG vectors.
 * Rule: Zero Asset Placeholders (0% dummy images, 0% unverified CDN assets).
 */

export type AudienceFilter = "all" | "youth" | "family" | "trekking" | "spiritual";

export interface AudienceFilterItem {
  key: AudienceFilter;
  label: string;
  iconName: "Camera" | "Users" | "Mountain" | "Landmark" | null;
  replacesEmoji?: string;
  description: string;
}

/**
 * Standardized Audience Filters according to Folk-Modern Bảy Núi Design System
 * Replaces emojis (📸, 👨‍👩‍👧‍👦, 🥾, 🙏) with Lucide SVG vectors.
 */
export const AUDIENCE_FILTERS: AudienceFilterItem[] = [
  {
    key: "all",
    label: "Tất Cả",
    iconName: null,
    description: "Tất cả các điểm đến phù hợp mọi đối tượng",
  },
  {
    key: "youth",
    label: "Sống Ảo",
    iconName: "Camera",
    replacesEmoji: "📸",
    description: "Điểm check-in nổi tiếng cho giới trẻ với góc chụp ảnh đẹp",
  },
  {
    key: "family",
    label: "Gia Đình",
    iconName: "Users",
    replacesEmoji: "👨‍👩‍👧‍👦",
    description: "Điểm đến nhẹ nhàng, an toàn, phù hợp gia đình có người lớn tuổi và trẻ nhỏ",
  },
  {
    key: "trekking",
    label: "Săn Mây",
    iconName: "Mountain",
    replacesEmoji: "🥾",
    description: "Trekking leo núi, săn mây và khám phá thiên nhiên Bảy Núi hùng vĩ",
  },
  {
    key: "spiritual",
    label: "Tâm Linh",
    iconName: "Landmark",
    replacesEmoji: "🙏",
    description: "Chiêm bái các ngôi chùa cổ kính Nam Tông Khmer và di tích lịch sử",
  },
];

/**
 * Generates canonical rendered UI DOM snapshot fragment for an audience persona chip
 */
export function renderAudienceChipSnapshot(
  item: AudienceFilterItem,
  isActive: boolean = false
): string {
  const activeClasses = isActive
    ? "bg-[#0E8C7F] text-white shadow-xs"
    : "bg-[#FFFDF7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/30";

  const iconMarkup = item.iconName
    ? `<svg class="lucide lucide-${item.iconName.toLowerCase()} w-3.5 h-3.5 shrink-0" data-icon="${item.iconName}"></svg>`
    : "";

  return `<button type="button" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 ${activeClasses}">${iconMarkup}<span>${item.label}</span></button>`;
}

/**
 * Validates that an audience filter item does NOT use asset placeholders or raw emojis
 */
export function validateDesignSystemChip(item: AudienceFilterItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for raw emoji in label
  const emojiRegex = /[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F900-\U0001F9FF\u2600-\u26FF\u2700-\u27BF]/;
  if (emojiRegex.test(item.label)) {
    errors.push(`Label "${item.label}" still contains raw emoji`);
  }

  // Check for placeholder keywords
  const placeholderRegex = /placeholder|dummy|mock|fake|avatar_default/i;
  if (placeholderRegex.test(item.label) || (item.iconName && placeholderRegex.test(item.iconName))) {
    errors.push(`Chip contains placeholder asset reference`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
