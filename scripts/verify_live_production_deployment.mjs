/**
 * verify_live_production_deployment.mjs
 * 
 * Live Production Smoke Test & Deployment Verification Suite for:
 * https://dulichtriton.vercel.app
 * 
 * Verifies live endpoints, routes, SSR/SSG rendering, Supabase data synchronization,
 * and server-side admin authorization boundaries directly against Vercel Production.
 */

const BASE_URL = process.env.LIVE_BASE_URL || 'https://dulichtriton.vercel.app';

const TEST_ROUTES = [
  {
    name: 'Home Page (Trang Chủ)',
    path: '/',
    expectedStatuses: [200],
    expectedPatterns: ['Tri Tôn', 'Bảy Núi'],
    contentType: 'text/html'
  },
  {
    name: 'Places Directory (Danh Sách Địa Điểm)',
    path: '/places',
    expectedStatuses: [200],
    expectedPatterns: ['Địa Điểm', 'Tri Tôn'],
    contentType: 'text/html'
  },
  {
    name: 'Place Details - Hồ Tà Pạ (Đặc Sản Bảy Núi)',
    path: '/places/ho-ta-pa',
    expectedStatuses: [200],
    expectedPatterns: ['Hồ Tà Pạ', 'Tri Tôn'],
    contentType: 'text/html'
  },
  {
    name: 'Place Details - Chùa Xà Tón (Wat Svayton Di Tích Quốc Gia)',
    path: '/places/chua-xa-ton-chua-svayton',
    expectedStatuses: [200],
    expectedPatterns: ['Xà Tón', 'Tri Tôn'],
    contentType: 'text/html'
  },
  {
    name: 'Itinerary Planner (Lịch Trình Du Lịch)',
    path: '/itinerary',
    expectedStatuses: [200],
    expectedPatterns: ['Lịch Trình', 'Tri Tôn'],
    contentType: 'text/html'
  },
  {
    name: 'Culture & Heritage (Văn Hóa & Lễ Hội)',
    path: '/culture',
    expectedStatuses: [200],
    expectedPatterns: ['Văn Hóa', 'Tri Tôn'],
    contentType: 'text/html'
  },
  {
    name: 'Interactive Map (Bản Đồ Số Du Lịch)',
    path: '/map',
    expectedStatuses: [200],
    expectedPatterns: ['Bản Đồ', 'Tri Tôn'],
    contentType: 'text/html'
  },
  {
    name: 'AI Chatbot Assistant Page (Trợ Lý AI)',
    path: '/chatbot',
    expectedStatuses: [200],
    expectedPatterns: ['Trợ Lý', 'Du Lịch'],
    contentType: 'text/html'
  },
  {
    name: 'Privacy Policy (Chính Sách Quyền Riêng Tư)',
    path: '/privacy',
    expectedStatuses: [200],
    expectedPatterns: ['Quyền Riêng Tư', 'Chăm Rốch Thi'],
    contentType: 'text/html'
  },
  {
    name: 'Chat Pre-warm Ping API (Health Handshake)',
    path: '/api/v1/chat/ping',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    expectedStatuses: [200],
    expectedPatterns: ['ok'],
    contentType: 'application/json'
  },
  {
    name: 'Privacy Right to Erasure Guard (Negative: Unauthenticated Delete)',
    path: '/api/v1/chat/session?sessionId=c0000000-0000-4000-8000-000000000001',
    method: 'DELETE',
    expectedStatuses: [400, 403], // Strict Fail-Closed (either 400 Invalid ID or 403 Missing Ownership Token)
    expectedPatterns: [],
    contentType: 'application/json'
  },
  {
    name: 'Admin Mutation Route Lockdown (Negative: Places POST)',
    path: '/api/v1/admin/places',
    method: 'POST',
    body: JSON.stringify({ name: 'Hacker Spoof POI' }),
    headers: { 'Content-Type': 'application/json' },
    expectedStatuses: [401, 503], // 503 Kill-Switch disabled OR 401 Unauthorized
    expectedPatterns: [], // Either Kill-Switch message or Unauthorized error
    contentType: 'application/json'
  },
  {
    name: 'Admin Mutation Route Lockdown (Negative: Scrape-Images POST)',
    path: '/api/v1/admin/scrape-images',
    method: 'POST',
    body: JSON.stringify({ url: 'https://evil-attacker.internal' }),
    headers: { 'Content-Type': 'application/json' },
    expectedStatuses: [401, 503], // 503 Kill-Switch disabled OR 401 Unauthorized
    expectedPatterns: [],
    contentType: 'application/json'
  }
];

async function runLiveVerification() {
  console.log(`================================================================================`);
  console.log(`🌐 LIVE PRODUCTION VERIFICATION SUITE — VERCEL PRODUCTION`);
  console.log(`📍 Target Base URL: ${BASE_URL}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`================================================================================\n`);

  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  for (const route of TEST_ROUTES) {
    const fullUrl = `${BASE_URL}${route.path}`;
    const method = route.method || 'GET';
    const startTime = Date.now();

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'User-Agent': 'TriTon-Production-Smoke-Tester/1.0',
          ...(route.headers || {})
        },
        body: route.body || undefined
      });

      const latencyMs = Date.now() - startTime;
      const status = response.status;
      const text = await response.text();
      const contentTypeHeader = response.headers.get('content-type') || '';

      const isStatusMatch = route.expectedStatuses.includes(status);
      const missingPatterns = (route.expectedPatterns || []).filter(pattern => !text.includes(pattern));
      const isPatternMatch = missingPatterns.length === 0;

      const isPassed = isStatusMatch && isPatternMatch;

      if (isPassed) {
        passedCount++;
        console.log(`✅ [PASS] ${route.name}`);
        console.log(`   Method: ${method} | Path: ${route.path}`);
        console.log(`   Status: ${status} (expected ${route.expectedStatuses.join('/')}) | Latency: ${latencyMs}ms`);
        console.log(`   Content-Type: ${contentTypeHeader}`);
      } else {
        failedCount++;
        console.error(`❌ [FAIL] ${route.name}`);
        console.error(`   Method: ${method} | Path: ${route.path}`);
        console.error(`   Status: ${status} (expected ${route.expectedStatuses.join('/')}) | Latency: ${latencyMs}ms`);
        if (!isStatusMatch) {
          console.error(`   Status Mismatch: Got ${status}, expected ${route.expectedStatuses.join('/')}`);
        }
        if (!isPatternMatch) {
          console.error(`   Missing Expected Patterns: ${JSON.stringify(missingPatterns)}`);
        }
      }
      console.log(`--------------------------------------------------------------------------------`);

      results.push({
        name: route.name,
        path: route.path,
        method,
        status,
        latencyMs,
        passed: isPassed,
        missingPatterns: missingPatterns.length > 0 ? missingPatterns : undefined
      });
    } catch (err) {
      failedCount++;
      const latencyMs = Date.now() - startTime;
      console.error(`💥 [ERROR] ${route.name} failed with network/fetch error:`);
      console.error(`   ${err.message} (${latencyMs}ms)`);
      console.log(`--------------------------------------------------------------------------------`);
      results.push({
        name: route.name,
        path: route.path,
        method,
        error: err.message,
        latencyMs,
        passed: false
      });
    }
  }

  console.log(`\n================================================================================`);
  console.log(`📊 LIVE PRODUCTION SUMMARY:`);
  console.log(`   Total Endpoints Tested: ${TEST_ROUTES.length}`);
  console.log(`   Passed: ${passedCount}`);
  console.log(`   Failed: ${failedCount}`);
  console.log(`   Success Rate: ${((passedCount / TEST_ROUTES.length) * 100).toFixed(1)}%`);
  console.log(`================================================================================`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runLiveVerification();
