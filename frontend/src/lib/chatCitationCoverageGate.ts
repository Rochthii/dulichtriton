/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CITATION COVERAGE GATE FOR FACTUAL CHATBOT ANSWERS (P04-019)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * RÀNG BUỘC KIẾN TRÚC & PRODUCTION-REAL SAFETY:
 * 1. Mọi câu trả lời mang tính sự kiện/thực địa (Factual Answer) — đề cập đến
 *    địa danh, di tích, chùa chiền, danh thắng, món ăn đặc sản, giá vé, giờ mở cửa
 *    hoặc hotline tại Tri Tôn — BẮT BUỘC phải có trích dẫn nguồn xác minh
 *    (Google Maps link, TikTok review link, hoặc CSDL chính thức).
 * 2. CHẶN ĐỨNG (Reject & Fail-closed) mọi Factual Fixture không có nguồn:
 *    - Factual answer nhắc tên POI nhưng có 0 trích dẫn (MISSING_ALL_CITATIONS).
 *    - Factual answer có trích dẫn domain giả mạo / spam (INVALID_CITATION_DOMAIN).
 *    - Tỷ lệ trích dẫn không đạt ngưỡng tối thiểu (INSUFFICIENT_CITATION_COVERAGE).
 * 3. HỖ TRỢ DETERMINISTIC ENRICHMENT:
 *    - Tự động bổ sung trích dẫn xác minh cho các thực thể Tri Tôn hợp lệ đã có
 *      trong CSDL tri thức. Nếu thực thể là fixture ảo/chưa xác minh, từ chối
 *      enrich và fail-closed gate.
 * 4. KÍCH HOẠT FALLBACK AN TOÀN:
 *    - Khi factual answer từ LLM không qua Gate, hệ thống tự động suy thoái
 *      về Local Expert RAG (100% câu trả lời có trích dẫn kiểm chứng thực địa).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CitationItem {
  type: 'google_maps' | 'tiktok' | 'official_gov' | 'canonical_source';
  url: string;
  label?: string;
  matchedEntity?: string;
}

export interface CitationCoverageOptions {
  minCoverageRatio?: number;   // Mặc định 0.4 (ít nhất 40% thực thể có trích dẫn)
  allowEnrichment?: boolean;   // Cho phép tự động bổ sung trích dẫn từ CSDL xác minh
  strictMode?: boolean;        // Chế độ nghiêm ngặt: yêu cầu ít nhất 1 citation cho mọi factual answer
}

export type CitationGateErrorCode =
  | 'PASSED'
  | 'NON_FACTUAL'
  | 'MISSING_ALL_CITATIONS'
  | 'INSUFFICIENT_CITATION_COVERAGE'
  | 'INVALID_CITATION_DOMAIN';

export interface CitationCoverageResult {
  isFactual: boolean;
  passed: boolean;
  code: CitationGateErrorCode;
  reason?: string;
  detectedEntities: string[];
  detectedClaims: string[];
  citations: CitationItem[];
  coverageRatio: number;
  enrichedText?: string;
  wasEnriched?: boolean;
}

/**
 * Danh mục Domain được phép làm nguồn trích dẫn uy tín (Allowlist)
 */
export const ALLOWED_CITATION_DOMAINS = [
  'maps.google.com',
  'www.google.com',
  'google.com',
  'tiktok.com',
  'www.tiktok.com',
  'triton.angiang.gov.vn',
  'angiang.gov.vn',
  'res.cloudinary.com',
];

/**
 * Danh mục thực thể POI & Thắng cảnh Tri Tôn cần kiểm chứng trích dẫn
 */
export interface KnownEntityRegistryItem {
  canonicalName: string;
  aliases: string[];
  commune: string;
  mapsQuery: string;
  tiktokTag: string;
}

export const KNOWN_TRI_TON_ENTITIES: KnownEntityRegistryItem[] = [
  {
    canonicalName: 'Chùa Xà Tón',
    aliases: ['chùa xà tón', 'chùa svayton', 'wat xvayton', 'chùa xvayton'],
    commune: 'Thị trấn Tri Tôn',
    mapsQuery: 'Chùa+Xvayton+Thị+trấn+Tri+Tôn+An+Giang',
    tiktokTag: 'chuaxvayton',
  },
  {
    canonicalName: 'Hồ Tà Pạ',
    aliases: ['hồ tà pạ', 'tà pạ', 'tuyệt tình cốc tà pạ'],
    commune: 'Xã Núi Tô',
    mapsQuery: 'Hồ+Tà+Pạ+Xã+Núi+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'hotapa',
  },
  {
    canonicalName: 'Chùa Tà Pạ',
    aliases: ['chùa tà pạ', 'chùa trên núi tà pạ', 'chùa núi tà pạ'],
    commune: 'Xã Núi Tô',
    mapsQuery: 'Chùa+Tà+Pạ+Xã+Núi+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'chuatapa',
  },
  {
    canonicalName: 'Gà Đốt Ô Thum',
    aliases: ['gà đốt ô thum', 'hồ ô thum', 'gà đốt lá chúc ô thum', 'quán gà đốt ô thum'],
    commune: 'Xã Ô Lâm',
    mapsQuery: 'Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang',
    tiktokTag: 'gadotothum',
  },
  {
    canonicalName: 'Đồi Tức Dụp',
    aliases: ['đồi tức dụp', 'khu du lịch tức dụp', 'tức dụp'],
    commune: 'Xã An Tức',
    mapsQuery: 'Khu+du+lịch+Đồi+Tức+Dụp+Xã+An+Tức+Tri+Tôn+An+Giang',
    tiktokTag: 'doitucdup',
  },
  {
    canonicalName: 'Núi Cô Tô',
    aliases: ['núi cô tô', 'cô tô', 'phụng hoàng sơn'],
    commune: 'Xã Cô Tô',
    mapsQuery: 'Núi+Cô+Tô+Xã+Cô+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'nuicoto',
  },
  {
    canonicalName: 'Đá Vồ Hội',
    aliases: ['vồ hội', 'vồ hội mẹ', 'vồ hội đổ', 'đá vồ hội'],
    commune: 'Xã Cô Tô',
    mapsQuery: 'Vồ+Hội+Núi+Cô+Tô+Xã+Cô+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'vohoicoto',
  },
  {
    canonicalName: 'Hồ Soài So',
    aliases: ['hồ soài so', 'suối vàng soài so'],
    commune: 'Xã Núi Tô',
    mapsQuery: 'Hồ+Soài+So+Xã+Núi+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'hosoaiso',
  },
  {
    canonicalName: 'Hồ Soài Chek',
    aliases: ['hồ soài chek', 'soài chek'],
    commune: 'Xã Núi Tô',
    mapsQuery: 'Hồ+Soài+Chek+Xã+Núi+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'hosoaichek',
  },
  {
    canonicalName: 'Cổng Trời Koh Kas',
    aliases: ['cổng trời koh kas', 'cổng trời tri tôn', 'chùa koh kas'],
    commune: 'Xã Châu Lăng',
    mapsQuery: 'Cổng+Trời+Koh+Kas+Xã+Châu+Lăng+Tri+Tôn+An+Giang',
    tiktokTag: 'congtroikohkas',
  },
  {
    canonicalName: 'Hồ Đá Latina',
    aliases: ['hồ đá latina', 'hồ latina', 'vách đá latina'],
    commune: 'Xã An Tức',
    mapsQuery: 'Hồ+Đá+Latina+Xã+An+Tức+Tri+Tôn+An+Giang',
    tiktokTag: 'hodalatina',
  },
  {
    canonicalName: 'Hồ Ô Tà Lọt',
    aliases: ['hồ ô tà lọt', 'ô tà lọt'],
    commune: 'Xã An Tức',
    mapsQuery: 'Hồ+Ô+Tà+Lọt+Xã+An+Tức+Tri+Tôn+An+Giang',
    tiktokTag: 'hootalot',
  },
  {
    canonicalName: 'Đu Đủ Đâm Rina',
    aliases: ['đu đủ đâm rina', 'đu đủ đâm', 'đu đủ đâm tri tôn'],
    commune: 'Xã Châu Lăng',
    mapsQuery: 'Đu+Đủ+Đâm+Rina+Xã+Châu+Lăng+Tri+Tôn+An+Giang',
    tiktokTag: 'dududamrina',
  },
  {
    canonicalName: 'Cháo Bò Tri Tôn',
    aliases: ['cháo bò tri tôn', 'cháo bò thủy mộc', 'quán cháo bò'],
    commune: 'Xã Châu Lăng',
    mapsQuery: 'Cháo+Bò+Tri+Tôn+Xã+Châu+Lăng+Tri+Tôn+An+Giang',
    tiktokTag: 'chaobotriton',
  },
  {
    canonicalName: 'Bún Cá Củ Ngải',
    aliases: ['bún cá củ ngải', 'bún cá khmer tri tôn'],
    commune: 'Thị trấn Tri Tôn',
    mapsQuery: 'Bún+Cá+Củ+Ngải+Thị+trấn+Tri+Tôn+An+Giang',
    tiktokTag: 'buncacungai',
  },
  {
    canonicalName: 'Chùa Tà Miệt',
    aliases: ['chùa tà miệt', 'sân đua bò tà miệt'],
    commune: 'Xã Lương Phi',
    mapsQuery: 'Chùa+Tà+Miệt+Xã+Lương+Phi+Tri+Tôn+An+Giang',
    tiktokTag: 'chuatamiet',
  },
  {
    canonicalName: 'Sân Đua Bò Tri Tôn',
    aliases: ['sân đua bò tri tôn', 'lễ hội đua bò bảy núi', 'đua bò bảy núi', 'sân tà pạ soài chek'],
    commune: 'Xã Núi Tô',
    mapsQuery: 'Sân+Đua+Bò+Tà+Pạ+Soài+Chek+Xã+Núi+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'duabobaynui',
  },
  {
    canonicalName: 'Cánh Đồng Lúa Tà Pạ',
    aliases: ['cánh đồng lúa tà pạ', 'đồng lúa tà pạ'],
    commune: 'Xã Núi Tô',
    mapsQuery: 'Cánh+Đồng+Lúa+Tà+Pạ+Xã+Núi+Tô+Tri+Tôn+An+Giang',
    tiktokTag: 'canhdongluatapa',
  },
  {
    canonicalName: 'Cây Thốt Nốt Trái Tim',
    aliases: ['cây thốt nốt trái tim', 'thốt nốt trái tim'],
    commune: 'Xã An Tức',
    mapsQuery: 'Cây+Thốt+Nốt+Trái+Tim+Xã+An+Tức+Tri+Tôn+An+Giang',
    tiktokTag: 'thotnottraitim',
  },
];

/**
 * Regex phát hiện các khẳng định định lượng / factual claims
 */
export const FACTUAL_CLAIM_PATTERNS = [
  /(?:giá\s*vé|vé\s*vào\s*cổng|miễn\s*phí|chi\s*phí\s*dự\s*kiến|vé\s*tham\s*quan)/i,
  /(?:giờ\s*mở\s*cửa|thời\s*gian\s*hoạt\s*động|khung\s*giờ\s*vàng)/i,
  /(?:hotline|số\s*điện\s*thoại|cấp\s*cứu|công\s*an\s*huyện|đường\s*dây\s*nóng)/i,
  /(?:di\s*tích\s*lịch\s*sử|di\s*tích\s*quốc\s*gia|kỷ\s*lục\s*vietkings|quyết\s*định\s*số)/i,
  /(?:tọa\s*độ|vĩ\s*độ|kinh\s*độ|quãng\s*đường|khoảng\s*cách\s*~\s*\d+)/i,
];

/**
 * Phát hiện danh sách thực thể và claims factual trong văn bản
 */
export function detectFactualElements(text: string): {
  detectedEntities: string[];
  detectedClaims: string[];
  isFactual: boolean;
} {
  if (!text || typeof text !== 'string') {
    return { detectedEntities: [], detectedClaims: [], isFactual: false };
  }

  const lower = text.toLowerCase();
  const detectedEntities: string[] = [];

  // 1. Quét POI entities
  for (const item of KNOWN_TRI_TON_ENTITIES) {
    const isMatched = item.aliases.some((alias) => lower.includes(alias));
    if (isMatched && !detectedEntities.includes(item.canonicalName)) {
      detectedEntities.push(item.canonicalName);
    }
  }

  // 2. Quét Factual Claims
  const detectedClaims: string[] = [];
  for (const pattern of FACTUAL_CLAIM_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      detectedClaims.push(match[0]);
    }
  }

  const isFactual = detectedEntities.length > 0 || detectedClaims.length > 0;

  return {
    detectedEntities,
    detectedClaims,
    isFactual,
  };
}

/**
 * Trích xuất toàn bộ citations/links trong văn bản và kiểm tra domain allowlist
 */
export function extractValidCitations(text: string): {
  citations: CitationItem[];
  hasInvalidDomain: boolean;
  invalidUrls: string[];
} {
  const citations: CitationItem[] = [];
  const invalidUrls: string[] = [];
  let hasInvalidDomain = false;

  // 1. Regex bóc tách markdown links: [label](url)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = mdLinkRegex.exec(text)) !== null) {
    const label = match[1];
    const url = match[2];

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      const isAllowed = ALLOWED_CITATION_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        hasInvalidDomain = true;
        invalidUrls.push(url);
        continue;
      }

      let type: CitationItem['type'] = 'canonical_source';
      if (hostname.includes('google.com')) type = 'google_maps';
      else if (hostname.includes('tiktok.com')) type = 'tiktok';
      else if (hostname.includes('angiang.gov.vn')) type = 'official_gov';

      citations.push({
        type,
        url,
        label,
      });
    } catch {
      hasInvalidDomain = true;
      invalidUrls.push(url);
    }
  }

  return {
    citations,
    hasInvalidDomain,
    invalidUrls,
  };
}

/**
 * Tự động bổ sung trích dẫn xác minh cho các thực thể Tri Tôn hợp lệ (Deterministic Citation Enrichment)
 */
export function enrichFactualCitations(text: string): {
  enrichedText: string;
  injectedCount: number;
} {
  let enriched = text;
  let injectedCount = 0;

  for (const item of KNOWN_TRI_TON_ENTITIES) {
    const lower = enriched.toLowerCase();
    const isPresent = item.aliases.some((alias) => lower.includes(alias));

    if (isPresent) {
      // Kiểm tra xem thực thể này đã có link Google Maps tương ứng chưa
      const hasSpecificMapLink =
        enriched.includes(item.mapsQuery) ||
        enriched.includes(encodeURIComponent(item.canonicalName));

      if (!hasSpecificMapLink) {
        const citationBlock = `\n[📍 Chỉ đường Google Maps](https://maps.google.com/?q=${item.mapsQuery}) • [▶ Xem TikTok Video](https://www.tiktok.com/tag/${item.tiktokTag})`;
        enriched = `${enriched.trimEnd()}\n${citationBlock}\n`;
        injectedCount++;
      }
    }
  }

  return {
    enrichedText: enriched,
    injectedCount,
  };
}

/**
 * THẨM ĐỊNH CITATION COVERAGE GATE (P04-019 Gatekeeper)
 */
export function checkCitationCoverage(
  text: unknown,
  options?: CitationCoverageOptions
): CitationCoverageResult {
  const minRatio = options?.minCoverageRatio ?? 0.4;
  const allowEnrichment = options?.allowEnrichment ?? false;
  const strictMode = options?.strictMode ?? false;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return {
      isFactual: false,
      passed: true,
      code: 'NON_FACTUAL',
      reason: 'Empty or non-string input is non-factual',
      detectedEntities: [],
      detectedClaims: [],
      citations: [],
      coverageRatio: 1.0,
    };
  }

  // 1. Phân loại Factual Elements
  const { detectedEntities, detectedClaims, isFactual } = detectFactualElements(text);

  // Nếu không phải Factual Answer (chào hỏi xã giao, out-of-scope guard) -> Pass tức thì
  if (!isFactual) {
    return {
      isFactual: false,
      passed: true,
      code: 'NON_FACTUAL',
      reason: 'Conversational response without factual Tri Ton entities or claims',
      detectedEntities: [],
      detectedClaims: [],
      citations: [],
      coverageRatio: 1.0,
    };
  }

  // 2. Trích xuất Citations
  let extraction = extractValidCitations(text);

  // Nếu có domain giả mạo hoặc URL spam không an toàn -> REJECT ngay lập tức
  if (extraction.hasInvalidDomain) {
    return {
      isFactual: true,
      passed: false,
      code: 'INVALID_CITATION_DOMAIN',
      reason: `Answer contains unapproved or suspicious citation URLs: ${extraction.invalidUrls.join(', ')}`,
      detectedEntities,
      detectedClaims,
      citations: extraction.citations,
      coverageRatio: 0,
    };
  }

  let workingText = text;
  let wasEnriched = false;

  // 3. Cơ chế Deterministic Enrichment (nếu được kích hoạt và đang thiếu citations)
  if (allowEnrichment && extraction.citations.length === 0 && detectedEntities.length > 0) {
    const enrichResult = enrichFactualCitations(workingText);
    if (enrichResult.injectedCount > 0) {
      workingText = enrichResult.enrichedText;
      wasEnriched = true;
      extraction = extractValidCitations(workingText);
    }
  }

  // 4. Đánh giá tính đầy đủ của Citation Coverage
  const citationCount = extraction.citations.length;

  // Tính Coverage Ratio: tỷ lệ số lượng citation hợp lệ so với số thực thể được đề cập
  const totalEntities = Math.max(detectedEntities.length, 1);
  const coverageRatio = Math.min(citationCount / totalEntities, 1.0);

  // Chặn đứng nếu Factual Answer mà HOÀN TOÀN KHÔNG CÓ TRÍCH DẪN NÀO
  if (citationCount === 0) {
    return {
      isFactual: true,
      passed: false,
      code: 'MISSING_ALL_CITATIONS',
      reason: `Factual answer mentions verified entities [${detectedEntities.join(', ')}] but lacks any verified citations or evidence links`,
      detectedEntities,
      detectedClaims,
      citations: [],
      coverageRatio: 0,
      enrichedText: wasEnriched ? workingText : undefined,
      wasEnriched,
    };
  }

  // Kiểm tra ngưỡng tối thiểu nếu ở strictMode
  if (strictMode && coverageRatio < minRatio) {
    return {
      isFactual: true,
      passed: false,
      code: 'INSUFFICIENT_CITATION_COVERAGE',
      reason: `Citation coverage ratio (${coverageRatio.toFixed(2)}) is below required threshold (${minRatio})`,
      detectedEntities,
      detectedClaims,
      citations: extraction.citations,
      coverageRatio,
      enrichedText: wasEnriched ? workingText : undefined,
      wasEnriched,
    };
  }

  return {
    isFactual: true,
    passed: true,
    code: 'PASSED',
    reason: `Factual answer passed citation coverage gate (${citationCount} citation(s), ratio: ${coverageRatio.toFixed(2)})`,
    detectedEntities,
    detectedClaims,
    citations: extraction.citations,
    coverageRatio,
    enrichedText: wasEnriched ? workingText : undefined,
    wasEnriched,
  };
}
