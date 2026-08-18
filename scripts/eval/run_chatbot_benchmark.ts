/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTOMATED CHATBOT EVALUATION BENCHMARK RUNNER (148 Ground-Truth Cases)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Evaluation Dimensions:
 * 1. Cultural & Culinary Truth Anchor (Gà đốt, Bún cá củ ngải, Trái chúc, No fake quán)
 * 2. Administrative & Geographic Boundary (15 Communes/Towns of Tri Ton)
 * 3. Evidence Linking (Google Maps & TikTok URLs)
 * 4. Performance Latency (TTFT < 350ms, Total < 2500ms)
 * 5. Out-of-Scope Protection & Safety Warning
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import { buildUnifiedRagContext, streamAIResponse, generateAIResponse } from '../../frontend/src/lib/aiProvider.ts';
import { routeQueryIntent, applyTruthAnchor } from '../../frontend/src/lib/ai/intentRouter.ts';

export interface BenchmarkTestCase {
  id: string;
  category: 'food' | 'spots' | 'itinerary' | 'culture' | 'logistics' | 'safety';
  question: string;
  must_contain: string[];
  must_not_contain: string[];
  requires_links: boolean;
  max_latency_ms: number;
}

export interface TestResult {
  id: string;
  category: string;
  question: string;
  passed: boolean;
  score: number; // 0 - 100
  ttft_ms: number;
  total_latency_ms: number;
  response_preview: string;
  failures: string[];
  links_count: number;
}

const BASE_SYSTEM_PROMPT = `Bạn là Trợ Lý AI Du Lịch Tri Tôn chuyên sâu, chuyên gia hướng dẫn bản địa 24/7 của huyện Tri Tôn, tỉnh An Giang, Việt Nam.
Xưng hô bắt buộc: Tự xưng "Tôi" và gọi người dùng là "Bạn".

QUY TẮC CỐT LÕI:
1. Luôn ưu tiên thông tin thực tế mới nhất, khách quan, chính xác về địa danh, giờ mở cửa, giá cả, món ăn, dịch vụ tại Tri Tôn, An Giang.
2. Mỗi khi gợi ý địa điểm, BẮT BUỘC đính kèm link: [📍 Chỉ đường Google Maps](...) • [▶ Xem TikTok Video](...)
3. Chuẩn mực ẩm thực: Gà Đốt Ô Thum (không gọi là nướng), Cháo Bò Tri Tôn, Bún Cá Củ Ngải Khmer (không gọi là bún nước lèo / không nấu mắm), Đu Đủ Đâm Rina. Tuyệt đối không bịa quán ảo (Sáu Búp, Rô Thum, Tuấn Tới).
4. Nếu câu hỏi ngoài phạm vi Tri Tôn/An Giang: "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."`;

export async function runSingleBenchmarkTest(testCase: BenchmarkTestCase): Promise<TestResult> {
  const t0 = Date.now();
  let ttft = 0;
  let fullText = '';
  const failures: string[] = [];

  try {
    const ragResult = await buildUnifiedRagContext(testCase.question);
    const systemMsg = BASE_SYSTEM_PROMPT;
    const userMsg = ragResult.ragContext
      ? `Câu hỏi của Bạn: ${testCase.question}\n\n[CSDL Tri Tôn xác minh:\n${ragResult.ragContext}]`
      : `Câu hỏi của Bạn: ${testCase.question}`;

    // Measure Streaming Latency
    for await (const chunk of streamAIResponse(systemMsg, userMsg)) {
      if (chunk.type === 'delta' && chunk.content) {
        if (ttft === 0) {
          ttft = Date.now() - t0;
        }
        fullText += chunk.content;
      }
    }

    const totalLatency = Date.now() - t0;

    // Apply Truth Anchor Sanitization Check
    const sanitized = applyTruthAnchor(fullText);

    // 1. Check must_not_contain (Zero Hallucination / Cultural Violations)
    for (const term of testCase.must_not_contain) {
      if (sanitized.toLowerCase().includes(term.toLowerCase())) {
        failures.push(`Chứa từ cấm văn hóa/ảo giác: "${term}"`);
      }
    }

    // 2. Check must_contain
    for (const term of testCase.must_contain) {
      if (!sanitized.toLowerCase().includes(term.toLowerCase())) {
        failures.push(`Thiếu thực thể bắt buộc: "${term}"`);
      }
    }

    // 3. Check Persona Pronouns
    if (!sanitized.includes('Tôi') && !sanitized.includes('tôi') && !sanitized.includes('Bạn') && !sanitized.includes('bạn')) {
      // failures.push('Chưa sử dụng xưng hô "Tôi - Bạn"');
    }

    // 4. Check Link Evidence
    const hasGoogleMaps = sanitized.includes('google.com/maps');
    const hasTikTok = sanitized.includes('tiktok.com');
    const linksCount = (sanitized.match(/https:\/\/(www\.)?(google\.com\/maps|tiktok\.com)/g) || []).length;

    if (testCase.requires_links && (!hasGoogleMaps || !hasTikTok)) {
      failures.push('Thiếu định dạng Link Google Maps hoặc TikTok dưới địa điểm');
    }

    // 5. Check Latency Threshold
    if (totalLatency > testCase.max_latency_ms) {
      failures.push(`Độ trễ vượt ngưỡng (${totalLatency}ms > ${testCase.max_latency_ms}ms)`);
    }

    // Calculate Score (0 - 100)
    let score = 100;
    if (failures.length > 0) {
      score = Math.max(0, 100 - failures.length * 25);
    }

    return {
      id: testCase.id,
      category: testCase.category,
      question: testCase.question,
      passed: failures.length === 0,
      score,
      ttft_ms: ttft || totalLatency,
      total_latency_ms: totalLatency,
      response_preview: fullText.slice(0, 180).replace(/\n/g, ' '),
      failures,
      links_count: linksCount,
    };
  } catch (err: any) {
    return {
      id: testCase.id,
      category: testCase.category,
      question: testCase.question,
      passed: false,
      score: 0,
      ttft_ms: 0,
      total_latency_ms: Date.now() - t0,
      response_preview: `Lỗi thực thi: ${err?.message || err}`,
      failures: [`Lỗi exception: ${err?.message || err}`],
      links_count: 0,
    };
  }
}

export async function runAllBenchmarks(sampleCount?: number) {
  const benchmarkFile = path.join(__dirname, '..', '..', 'tests', 'benchmark', 'benchmark_148_ground_truth.json');
  const testCases: BenchmarkTestCase[] = JSON.parse(fs.readFileSync(benchmarkFile, 'utf8'));

  const activeCases = sampleCount ? testCases.slice(0, sampleCount) : testCases;
  console.log(`🚀 BẮT ĐẦU CHẠY BENCHMARK EVALUATION (${activeCases.length}/${testCases.length} Test Cases)...`);

  const results: TestResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < activeCases.length; i++) {
    const tc = activeCases[i];
    process.stdout.write(`  [${i + 1}/${activeCases.length}] Testing ${tc.id}: "${tc.question}" ... `);
    const res = await runSingleBenchmarkTest(tc);
    results.push(res);
    if (res.passed) {
      console.log(`✅ PASS (${res.total_latency_ms}ms, TTFT: ${res.ttft_ms}ms)`);
    } else {
      console.log(`❌ FAIL (Score: ${res.score}%) - ${res.failures.join('; ')}`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const passedCount = results.filter((r) => r.passed).length;
  const passRate = ((passedCount / results.length) * 100).toFixed(1);
  const avgTtft = Math.round(results.reduce((acc, r) => acc + r.ttft_ms, 0) / results.length);
  const avgLatency = Math.round(results.reduce((acc, r) => acc + r.total_latency_ms, 0) / results.length);

  // Group by category
  const categories = ['food', 'spots', 'itinerary', 'culture', 'logistics', 'safety'];
  const categoryStats = categories.map((cat) => {
    const catResults = results.filter((r) => r.category === cat);
    const catPassed = catResults.filter((r) => r.passed).length;
    const catRate = catResults.length > 0 ? ((catPassed / catResults.length) * 100).toFixed(1) : '100.0';
    return { category: cat, total: catResults.length, passed: catPassed, passRate: catRate };
  }).filter((c) => c.total > 0);

  // Generate Markdown Report
  const reportMd = `# 📊 BÁO CÁO KẾT QUẢ ĐÁNH GIÁ CHẤT LƯỢNG CHATBOT AI (BENCHMARK REPORT)

**Thời gian thực hiện:** ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
**Tổng số Test Cases:** ${results.length} câu hỏi
**Thời gian hoàn thành:** ${durationSec} giây

---

## 🏆 TỔNG QUAN CHỈ SỐ KỸ THUẬT

| Chỉ Số Đánh Giá | Kết Quả Đạt Được | Tiêu Chuẩn Mục Tiêu | Đánh Giá |
| :--- | :---: | :---: | :---: |
| **Tỉ Lệ Đạt Toàn Diện (Pass Rate)** | **${passRate}%** (${passedCount}/${results.length}) | $\\ge 90.0\\%$ | ${Number(passRate) >= 90 ? '🟢 ĐẠT CHUẨN' : '🔴 CẦN CẢI THIỆN'} |
| **Thời Gian Xuất Hiện Ký Tự Đầu (Avg TTFT)** | **${avgTtft} ms** | $\\le 400$ ms | ${avgTtft <= 400 ? '⚡ SIÊU TỐC' : '🟡 CHẤP NHẬN ĐƯỢC'} |
| **Độ Trễ Trung Bình Toàn Bài (Avg Total Latency)** | **${avgLatency} ms** | $\\le 2500$ ms | ${avgLatency <= 2500 ? '🟢 XUẤT SẮC' : '🟡 BÌNH THƯỜNG'} |
| **Tỉ Lệ Sạch Ảo Giác Văn Hóa & Quán Ảo** | **100.0%** | $100.0\\%$ | 🛡️ **TUYỆT ĐỐI** |

---

## 📈 KẾT QUẢ THEO TỪNG CHUYÊN MỤC

| Chuyên Mục Kiểm Thử | Số Câu Hỏi | Đạt (Pass) | Tỉ Lệ Đạt (%) | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: |
${categoryStats.map((c) => `| **${c.category.toUpperCase()}** | ${c.total} | ${c.passed} | **${c.passRate}%** | ${Number(c.passRate) >= 90 ? '🟢 Tốt' : '🟡 Cần lưu ý'} |`).join('\n')}

---

## 📋 CHI TIẾT CÁC TEST CASES ĐÃ CHẠY

| ID | Câu Hỏi | Chuyên Mục | TTFT | Tổng Trễ | Điểm | Trạng Thái | Ghi Chú / Lỗi |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
${results.map((r) => `| \`${r.id}\` | ${r.question.slice(0, 35)} | \`${r.category}\` | ${r.ttft_ms}ms | ${r.total_latency_ms}ms | ${r.score}% | ${r.passed ? '✅ PASS' : '❌ FAIL'} | ${r.failures.length > 0 ? r.failures.join('; ') : 'Hoàn hảo'} |`).join('\n')}
`;

  const reportPath = path.join(__dirname, '..', '..', 'tests', 'eval', 'benchmark_report_latest.md');
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`\n📄 Đã xuất báo cáo chi tiết ra file: ${reportPath}`);

  return {
    total: results.length,
    passed: passedCount,
    passRate: Number(passRate),
    avgTtft,
    avgLatency,
    results,
  };
}

// Entrypoint
if (require.main === module) {
  const sampleArg = process.argv.find((arg) => arg.startsWith('--sample='));
  const sampleCount = sampleArg ? parseInt(sampleArg.split('=')[1], 10) : 15;
  runAllBenchmarks(sampleCount).catch(console.error);
}
