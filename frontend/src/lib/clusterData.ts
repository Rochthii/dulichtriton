/**
 * DU LỊCH TRI TÔN AI — 4 GEOGRAPHIC TOURISM CLUSTERS (QUY HOẠCH ĐỊA LÝ DU LỊCH)
 * Aligned with Glossary G1 and RULE 02 Administrative Boundaries.
 */

export interface TourismCluster {
  id: string;
  name: string;
  commune: string;
  badge: string;
  desc: string;
  link: string;
  communeFilters: string[];
  nameKeywords: string[];
  fallbackImg: string;
}

export const CLUSTER_DEFS: TourismCluster[] = [
  {
    id: "cluster-tapa",
    name: "Cụm Tà Pạ & Núi Tô",
    commune: "Xã Núi Tô & Xã Châu Lăng",
    badge: "Check-in Biểu Tượng",
    desc: "Hồ Tà Pạ, Chùa Tà Pạ, Cánh đồng lúa Tà Pạ, Hàng thốt nốt trái tim, Cổng trời Koh Kas.",
    link: "/places?cluster=cluster-tapa",
    communeFilters: ["Núi Tô", "Châu Lăng"],
    nameKeywords: ["Tà Pạ", "Thốt Nốt", "Koh Kas", "Trái Tim", "Soài Chek", "Sân Cu"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
  },
  {
    id: "cluster-othum",
    name: "Cụm Ô Lâm & Hồ Ô Thum",
    commune: "Xã Ô Lâm & Xã An Tức",
    badge: "Ẩm Thực & Lịch Sử",
    desc: "Gà Đốt Ô Thum lá chúc, Hồ Ô Thum, Chùa Kirivong Ô Lâm, Khu Di Tích Đồi Tức Dụp.",
    link: "/places?cluster=cluster-othum",
    communeFilters: ["Ô Lâm", "An Tức"],
    nameKeywords: ["Ô Thum", "Tức Dụp", "Gà Đốt", "Kirivong", "Đồi Tức Dụp"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg",
  },
  {
    id: "cluster-coto",
    name: "Cụm Cô Tô & Soài So",
    commune: "Xã Cô Tô, Xã Núi Tô & Thị trấn Tri Tôn",
    badge: "Trekking & Săn Mây",
    desc: "Đỉnh Núi Cô Tô 614m, Đá Vồ Hội, Suối Vàng Soài So, Hồ Soài So, Chùa Sà Lôn.",
    link: "/places?cluster=cluster-coto",
    communeFilters: ["Cô Tô", "Thị trấn Tri Tôn"],
    nameKeywords: ["Cô Tô", "Soài So", "Suối Vàng", "Vồ Hội", "Sân Tiên", "Phụng Hoàng Sơn", "Chùa Sà Lôn", "Xà Tón"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg",
  },
  {
    id: "cluster-bachuc",
    name: "Cụm Ba Chúc & Lương Phi",
    commune: "Thị trấn Ba Chúc & Xã Lương Phi",
    badge: "Văn Hóa & Tâm Linh",
    desc: "Khu Di Tích Nhà Mồ Ba Chúc, Chùa Phi Lai, Chùa Tam Bửu, Căn cứ Ô Tà Sóc Núi Dài.",
    link: "/places?cluster=cluster-bachuc",
    communeFilters: ["Ba Chúc", "Lương Phi", "Lê Trì", "Lạc Quới", "Vĩnh Gia"],
    nameKeywords: ["Ba Chúc", "Nhà Mồ", "Phi Lai", "Tam Bửu", "Núi Tượng", "Núi Dài", "Ô Tà Sóc"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif",
  },
];

/**
 * Renders the simulated UI DOM snapshot fragment for cluster commune badge on Home page
 */
export function renderClusterCommuneBadgeSnapshot(commune: string): string {
  return `<p class="text-[10px] sm:text-[11px] text-[#FAF3E7]/80 flex items-center gap-1 mt-0.5 font-body truncate"><MapPin class="w-3 h-3 text-[#0E8C7F] shrink-0" /><span class="truncate">${commune}</span></p>`;
}
