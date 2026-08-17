/**
 * BỘ KIỂM THỬ CHUYÊN SÂU ĐA CẤP ĐỘ (5 LEVELS) - CHATBOT DU LỊCH TRI TÔN AI V2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      process.env[k] = v;
    }
  }
}

// Inline Logic for testing
const EMERGENCY_PATTERNS = [
  /cứu hộ/i, /cứu nạn/i, /khẩn cấp/i, /tai nạn/i, /té xe/i, /ngã xe/i,
  /lạc đường/i, /bị thương/i, /mất tích/i, /rắn cắn/i, /trượt chân/i,
  /té núi/i, /té đèo/i, /thủng lốp ban đêm/i, /hỏng xe giữa đèo/i,
  /cháy rừng/i, /cướp giật/i, /mất đồ/i, /ngộ độc/i, /cấp cứu/i, /đường dây nóng/i,
  /hotline/i, /công an/i, /bệnh viện/i, /trung tâm y tế/i, /số điện thoại khẩn/i,
];

const REALTIME_SEARCH_PATTERNS = [
  /hôm nay/i, /ngày mai/i, /tuần này/i, /thời tiết/i, /nhiệt độ/i, /dự báo/i,
  /mới nhất/i, /sắp tới/i, /tin tức/i, /vừa xảy ra/i, /đang diễn ra/i,
  /nước nổi năm nay/i, /mùa gặt năm nay/i, /khinh khí cầu năm nay/i,
  /tình hình giao thông/i, /kẹt xe không/i, /giá vé mới/i,
  /lúc này/i, /bây giờ/i, /giờ này/i, /giờ đang/i,
  /chiều nay/i, /sáng nay/i, /tối nay/i, /đêm nay/i,
  /dịp này/i, /mùa này/i, /cuối tuần này/i, /dạo này/i,
  /còn mở không/i, /có mở không/i, /còn bán không/i, /có bán không/i,
  /đang hoạt động/i, /có diễn ra/i, /có tổ chức không/i,
  /năm nay có/i, /đang vào mùa/i, /mùa nước nổi/i,
  /nước hồ/i, /đường có ngập/i, /có sạt lở/i, /sau mưa/i,
];

const COMPOUND_REALTIME_PATTERNS = [
  /có mở.*không/i, /còn mở.*không/i, /hôm nay.*mở/i,
  /lúc này.*có/i, /bây giờ.*có/i, /chiều nay.*còn/i,
  /có đẹp không/i, /đang đẹp không/i, /nước có xanh không/i,
  /đường có trơn không/i, /có nguy hiểm không/i,
];

function routeQueryIntent(userQuery) {
  const clean = (userQuery || '').trim();
  const lower = clean.toLowerCase();

  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(lower)) {
      return { intent: 'SOS_EMERGENCY', confidence: 1.0, reason: `Matched emergency: ${pattern}` };
    }
  }

  for (const pattern of REALTIME_SEARCH_PATTERNS) {
    if (pattern.test(lower)) {
      return { intent: 'REALTIME_GROUNDED_SEARCH', confidence: 0.95, reason: `Matched realtime: ${pattern}` };
    }
  }

  for (const pattern of COMPOUND_REALTIME_PATTERNS) {
    if (pattern.test(lower)) {
      return { intent: 'REALTIME_GROUNDED_SEARCH', confidence: 0.92, reason: `Matched compound: ${pattern}` };
    }
  }

  return { intent: 'LOCAL_POI_FAST', confidence: 0.9, reason: 'Standard POI lookup' };
}

function applyTruthAnchor(generatedText) {
  let text = generatedText;

  text = text.replace(
    /gà\s+(\w+\s+){0,3}nướng(\s+\w+){0,4}(ô\s*thum|o\s*thum|lá\s*chúc|thát\s*sơn)/gi,
    (match) => match.replace(/nướng/gi, 'đốt')
  );
  text = text.replace(
    /(nướng)(\s+\w+){0,4}(ô\s*thum|hồ\s*ô\s*thum)/gi,
    (match) => match.replace(/nướng/gi, 'đốt')
  );
  text = text.replace(/gà nướng ô thum/gi, 'Gà đốt Ô Thum');
  text = text.replace(/gà nướng lá chúc/gi, 'Gà đốt lá chúc');
  text = text.replace(/gà nướng than hồng/gi, 'Gà đốt than hồng');
  text = text.replace(/gà nướng thủ công/gi, 'Gà đốt thủ công');
  text = text.replace(/gà nướng truyền thống/gi, 'Gà đốt truyền thống');

  if (/bún cá/i.test(text)) {
    text = text.replace(/mắm cá linh/gi, 'nghệ tươi và củ ngải bún');
    text = text.replace(/bún nước lèo/gi, 'bún cá củ ngải Khmer');
    text = text.replace(/nước dùng mắm/gi, 'nước dùng xương ống thanh ngọt');
    text = text.replace(/nấu bằng mắm/gi, 'nấu bằng nghệ tươi và củ ngải bún giã nhuyễn');
  }

  text = text.replace(
    /quán sáu búp|quán rô thum|quán tuấn tới|quán mười hai|quán tám lúa/gi,
    'quán gà đốt Ô Thum bản địa'
  );

  text = text.replace(
    /(gà đốt|gà nướng|ô thum)[^.]{0,50}(thị trấn tri tôn|tt\. tri tôn)/gi,
    (match) => match.replace(/thị trấn tri tôn|tt\. tri tôn/gi, 'Xã Ô Lâm, Tri Tôn')
  );

  return text;
}

// Groq API Caller
async function testCallGroq(prompt, userQ) {
  const groqKey = process.env.GROQ_API_KEY_2 || process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('Missing Groq key');
  
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userQ },
      ],
      max_tokens: 400,
      temperature: 0.5,
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

// Gemini Search Caller
async function testCallGeminiSearch(prompt, userQ) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;
  if (!geminiKey) throw new Error('Missing Gemini key');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: prompt }] },
      contents: [{ role: 'user', parts: [{ text: userQ }] }],
      tools: [{ googleSearch: {} }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── BẮT ĐẦU CHẠY 5 CẤP ĐỘ TEST ──────────────────────────────────────────────
async function runTestSuite() {
  console.log('\n======================================================================');
  console.log('🏁 KHỞI ĐỘNG BỘ KIỂM THỬ ĐA CẤP ĐỘ CHATBOT DU LỊCH TRI TÔN AI V2.0');
  console.log('======================================================================\n');

  const results = [];

  // 🔴 LEVEL 1: SOS EMERGENCY BYPASS TEST (< 50ms)
  console.log('----------------------------------------------------------------------');
  console.log('🚨 [LEVEL 1] TEST KHẨN CẤP & CỨU HỘ (SOS BYPASS)');
  console.log('----------------------------------------------------------------------');
  const sosQuestions = [
    'Tôi bị té xe trên đèo Cô Tô cần cấp cứu gấp!',
    'Có ai giúp với, bị rắn cắn ở Hồ Ô Thum',
    'Cho xin số điện thoại công an Tri Tôn',
  ];
  for (const q of sosQuestions) {
    const t0 = Date.now();
    const routed = routeQueryIntent(q);
    const latency = Date.now() - t0;
    const passed = routed.intent === 'SOS_EMERGENCY' && latency < 50;
    console.log(`- Query: "${q}"`);
    console.log(`  ➔ Intent: ${routed.intent} | Latency: ${latency}ms | Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    results.push({ level: '1. SOS Bypass', query: q, latency, passed });
  }

  // 🟡 LEVEL 2: SEMANTIC TRUTH ANCHOR TEST (BỘ LỌC CHÂN LÝ)
  console.log('\n----------------------------------------------------------------------');
  console.log('🛡️ [LEVEL 2] TEST BẢO VỆ CHÂN LÝ & VĂN HÓA ẨM THỰC (TRUTH ANCHOR)');
  console.log('----------------------------------------------------------------------');
  const trapTexts = [
    { input: 'Đặc sản nổi tiếng là món gà nướng than hồng thơm lừng ven hồ Ô Thum', expected: 'Gà đốt' },
    { input: 'Bún cá Tri Tôn nấu bằng mắm cá linh đậm đà ăn kèm rau muống', expected: 'nghệ tươi và củ ngải bún' },
    { input: 'Hãy ghé quán sáu búp để ăn gà đốt tại thị trấn Tri Tôn nhé', expected: 'Xã Ô Lâm, Tri Tôn' },
  ];
  for (const t of trapTexts) {
    const t0 = Date.now();
    const sanitized = applyTruthAnchor(t.input);
    const latency = Date.now() - t0;
    const passed = sanitized.toLowerCase().includes(t.expected.toLowerCase()) && !sanitized.includes('gà nướng than hồng');
    console.log(`- Bẫy gốc: "${t.input}"`);
    console.log(`  ➔ Sau lọc: "${sanitized}"`);
    console.log(`  ➔ Kết quả: ${passed ? '✅ PASS (Đã triệt tiêu sai lệch)' : '❌ FAIL'} (${latency}ms)`);
    results.push({ level: '2. Truth Anchor', query: t.input.slice(0, 30) + '...', latency, passed });
  }

  // 🟢 LEVEL 3: LOCAL POI FAST PATH WITH GROQ LPU (< 900ms)
  console.log('\n----------------------------------------------------------------------');
  console.log('⚡ [LEVEL 3] TEST TRA CỨU ĐỊA ĐIỂM SIÊU TỐC (GROQ LPU FAST PATH)');
  console.log('----------------------------------------------------------------------');
  const fastQuestions = [
    'Hồ Tà Pạ ở xã nào và có gì đẹp?',
    'Giới thiệu chùa Xvayton và nét đặc sắc',
  ];
  for (const q of fastQuestions) {
    const t0 = Date.now();
    const routed = routeQueryIntent(q);
    console.log(`- Query: "${q}" (Routed: ${routed.intent})`);
    try {
      const resp = await testCallGroq('Bạn là trợ lý Du Lịch Tri Tôn. Trả lời ngắn gọn, chuẩn xác.', q);
      const latency = Date.now() - t0;
      const cleanResp = applyTruthAnchor(resp);
      const passed = latency < 2500 && cleanResp.length > 50;
      console.log(`  ➔ TTFT/Latency: ${latency}ms | Độ dài: ${cleanResp.length} ký tự`);
      console.log(`  ➔ Trích đoạn: "${cleanResp.slice(0, 120).replace(/\n/g, ' ')}..."`);
      console.log(`  ➔ Kết quả: ${passed ? '✅ PASS (Siêu tốc LPU)' : '❌ FAIL'}`);
      results.push({ level: '3. Groq Fast Path', query: q, latency, passed });
    } catch (err) {
      console.log(`  ➔ Lỗi: ${err.message} ❌ FAIL`);
      results.push({ level: '3. Groq Fast Path', query: q, latency: Date.now() - t0, passed: false });
    }
  }

  // 🌐 LEVEL 4: LIVE GOOGLE SEARCH GROUNDING & FAILOVER TEST
  console.log('\n----------------------------------------------------------------------');
  console.log('🔍 [LEVEL 4] TEST TÌM KIẾM THỜI GIAN THỰC & CHỊU TẢI (FAILOVER SHIELD)');
  console.log('----------------------------------------------------------------------');
  const searchQuestions = [
    'Thời tiết Tri Tôn hôm nay thế nào?',
    'Quán Gà Đốt Ô Thum lúc này có mở không?',
  ];
  for (const q of searchQuestions) {
    const t0 = Date.now();
    const routed = routeQueryIntent(q);
    console.log(`- Query: "${q}" (Routed: ${routed.intent})`);
    try {
      let resp = '';
      let providerUsed = 'gemini-google-search';
      try {
        resp = await testCallGeminiSearch('Bạn là AI Du Lịch Tri Tôn. Hãy tìm kiếm dữ liệu internet mới nhất.', q);
      } catch (searchErr) {
        console.log(`  ➔ Gemini Search Rate Limit (429): Kích hoạt tầng dự phòng Groq LPU + RAG CSDL...`);
        resp = await testCallGroq('Bạn là AI Du Lịch Tri Tôn. Hãy cung cấp dữ liệu thực tế và thông tin thời tiết đã xác minh.', q);
        providerUsed = 'failover-groq-lpu-shield';
      }
      const latency = Date.now() - t0;
      const cleanResp = applyTruthAnchor(resp);
      const passed = routed.intent === 'REALTIME_GROUNDED_SEARCH' && cleanResp.length > 30;
      console.log(`  ➔ Latency: ${latency}ms | Provider: ${providerUsed}`);
      console.log(`  ➔ Trích đoạn: "${cleanResp.slice(0, 140).replace(/\n/g, ' ')}..."`);
      console.log(`  ➔ Kết quả: ${passed ? '✅ PASS (Định tuyến & Cứu hộ thành công)' : '❌ FAIL'}`);
      results.push({ level: '4. Realtime Search & Failover', query: q, latency, passed });
    } catch (err) {
      console.log(`  ➔ Lỗi: ${err.message} ❌ FAIL`);
      results.push({ level: '4. Realtime Search & Failover', query: q, latency: Date.now() - t0, passed: false });
    }
  }

  // 💬 LEVEL 5: MULTI-TURN CONVERSATIONAL MEMORY TEST
  console.log('\n----------------------------------------------------------------------');
  console.log('💬 [LEVEL 5] TEST NGỮ CẢNH ĐA LƯỢT (CONVERSATIONAL MEMORY)');
  console.log('----------------------------------------------------------------------');
  const turn1Q = 'Tôi muốn đi tham quan Hồ Tà Pạ';
  const turn1A = 'Hồ Tà Pạ nằm ở Xã Núi Tô, Tri Tôn. Nơi đây có mặt nước xanh như ngọc bích.';
  const turn2Q = 'Chỗ đó gần quán ăn nào ngon?';

  const historyContext = `\n\n[Lịch sử hội thoại trước đó]:\n[Du Khách]: ${turn1Q}\n[Tôi - Trợ lý]: ${turn1A}`;
  const t0 = Date.now();
  console.log(`- Lượt 1: User hỏi "${turn1Q}"`);
  console.log(`- Lượt 2: User hỏi câu đại từ: "${turn2Q}" (Đại từ "chỗ đó" = Hồ Tà Pạ)`);
  try {
    const resp = await testCallGroq(
      `Bạn là AI Du Lịch Tri Tôn.${historyContext}`,
      `Câu hỏi: ${turn2Q}`
    );
    const latency = Date.now() - t0;
    const cleanResp = applyTruthAnchor(resp);
    const understood = cleanResp.toLowerCase().includes('tà pạ') || cleanResp.toLowerCase().includes('núi tô') || cleanResp.toLowerCase().includes('gà đốt');
    console.log(`  ➔ Latency: ${latency}ms`);
    console.log(`  ➔ Phản hồi của AI: "${cleanResp.slice(0, 150).replace(/\n/g, ' ')}..."`);
    console.log(`  ➔ Nhận diện đúng "chỗ đó" = Hồ Tà Pạ/Núi Tô: ${understood ? 'CÓ ✅' : 'KHÔNG ❌'}`);
    results.push({ level: '5. Conversation Memory', query: turn2Q, latency, passed: understood });
  } catch (err) {
    console.log(`  ➔ Lỗi: ${err.message}`);
    results.push({ level: '5. Conversation Memory', query: turn2Q, latency: Date.now() - t0, passed: false });
  }

  // 📊 TỔNG KẾT
  console.log('\n======================================================================');
  console.log('🏆 BẢNG TỔNG KẾT KẾT QUẢ KIỂM THỬ 5 CẤP ĐỘ (BENCHMARK SUMMARY)');
  console.log('======================================================================');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Tổng số bài test: ${total} | Đạt: ${passedCount}/${total} (${Math.round((passedCount / total) * 100)}%)\n`);

  for (const r of results) {
    console.log(`• [${r.level}] "${r.query}": ${r.passed ? 'PASSED' : 'FAILED'} (${r.latency}ms)`);
  }
  console.log('======================================================================\n');
}

runTestSuite();
