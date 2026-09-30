import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// File Paths
const guardPath = path.resolve(__dirname, '../src/lib/placeVerificationGuard.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const tokenSearchHelperPath = path.resolve(__dirname, '../src/lib/chatTokenSearchHelper.ts');
const searchRoutePath = path.resolve(__dirname, '../src/app/api/v1/search/route.ts');
const rpcMigrationPath = path.resolve(__dirname, '../../supabase/migrations/20260930_p04_010_match_places_verified_retrieval.sql');

function loadModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { outputText } = typescript.transpileModule(content, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });

  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', outputText);
  fn(m, m.exports, require, path.dirname(filePath), filePath);
  return m.exports;
}

test('P04-010: Retrieval Filtering by Approved verification_status — Unverified Fixtures Exclusion Proof', async (t) => {
  const {
    isRetrievalEligiblePlace,
    filterVerifiedRetrievalPlaces,
  } = loadModule(guardPath);

  // Fixtures Definition
  const fixtures = {
    unverified: {
      id: 'fixture-unverified-01',
      name: 'Quán Ảo Thử Nghiệm 1',
      commune: 'Xã Núi Tô',
      category: 'Ẩm thực',
      verification_status: 'UNVERIFIED',
      is_verified: false,
    },
    inReview: {
      id: 'fixture-in-review-02',
      name: 'Điểm Checkin Chưa Phê Duyệt',
      commune: 'Xã Ô Lâm',
      category: 'Check-in',
      verification_status: 'IN_REVIEW',
      is_verified: false,
    },
    rejected: {
      id: 'fixture-rejected-03',
      name: 'Quán Giả Mạo Bị Từ Chối',
      commune: 'Xã Cô Tô',
      category: 'Cà phê',
      verification_status: 'REJECTED',
      is_verified: false,
    },
    expired: {
      id: 'fixture-expired-04',
      name: 'Dịch Vụ Đã Hết Hạn Giấy Phép',
      commune: 'Xã Lương Phi',
      category: 'Lưu trú',
      verification_status: 'EXPIRED',
      is_verified: true, // Malformed edge case: flag true but expired
    },
    missingStatus: {
      id: 'fixture-missing-status-05',
      name: 'Địa Điểm Thiếu Trường Status',
      commune: 'Thị trấn Tri Tôn',
      category: 'Thắng cảnh',
      is_verified: true, // Missing verification_status
    },
    nullStatus: {
      id: 'fixture-null-status-06',
      name: 'Địa Điểm Status Null',
      commune: 'Xã Châu Lăng',
      category: 'Ẩm thực',
      verification_status: null,
      is_verified: true,
    },
    contradictoryFlag: {
      id: 'fixture-contradictory-07',
      name: 'Địa Điểm Cờ Boolean Sai Lệch',
      commune: 'Xã An Tức',
      category: 'Văn hóa',
      verification_status: 'VERIFIED',
      is_verified: false, // Invariant conflict
    },
    verifiedValid1: {
      id: 'PL001',
      slug: 'ho-ta-pa',
      name: 'Hồ Tà Pạ',
      commune: 'Xã Núi Tô',
      category: 'Thắng cảnh',
      verification_status: 'VERIFIED',
      is_verified: true,
      verified_at: '2026-09-28T00:00:00Z',
    },
    verifiedValid2: {
      id: 'FD006',
      slug: 'ga-dot-thao-nguyen-o-thum',
      name: 'Gà Đốt Thảo Nguyên Ô Thum',
      commune: 'Xã Ô Lâm',
      category: 'Ẩm thực',
      verification_status: 'VERIFIED',
      is_verified: true,
      verified_at: '2026-09-28T00:00:00Z',
    },
  };

  // 1. Unit Tests: isRetrievalEligiblePlace predicate
  await t.test('1. Unit Test: isRetrievalEligiblePlace strictly accepts ONLY VERIFIED status + is_verified=true', () => {
    assert.strictEqual(isRetrievalEligiblePlace(null), false, 'null must return false');
    assert.strictEqual(isRetrievalEligiblePlace(undefined), false, 'undefined must return false');
    assert.strictEqual(isRetrievalEligiblePlace({}), false, 'empty object must return false');

    // Negative tests for unverified fixtures
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.unverified), false, 'UNVERIFIED fixture must return false');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.inReview), false, 'IN_REVIEW fixture must return false');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.rejected), false, 'REJECTED fixture must return false');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.expired), false, 'EXPIRED fixture must return false');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.missingStatus), false, 'Missing status fixture must return false');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.nullStatus), false, 'Null status fixture must return false');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.contradictoryFlag), false, 'Contradictory flag must return false');

    // Positive tests for valid verified records
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.verifiedValid1), true, 'Valid verified POI 1 must return true');
    assert.strictEqual(isRetrievalEligiblePlace(fixtures.verifiedValid2), true, 'Valid verified POI 2 must return true');
  });

  // 2. Unit Tests: filterVerifiedRetrievalPlaces array filter
  await t.test('2. Unit Test: filterVerifiedRetrievalPlaces filters out 100% of unverified fixtures from candidate pool', () => {
    const rawPool = [
      fixtures.unverified,
      fixtures.verifiedValid1,
      fixtures.inReview,
      fixtures.rejected,
      fixtures.verifiedValid2,
      fixtures.expired,
      fixtures.missingStatus,
      fixtures.nullStatus,
      fixtures.contradictoryFlag,
    ];

    const filtered = filterVerifiedRetrievalPlaces(rawPool);

    // Exact count assertion
    assert.strictEqual(filtered.length, 2, 'Filtered pool must contain exactly 2 valid places');
    assert.deepStrictEqual(
      filtered.map(p => p.id),
      ['PL001', 'FD006'],
      'Only PL001 and FD006 must survive retrieval filtering'
    );

    // Proof: None of the unverified fixture IDs exist in result
    const unverifiedIds = [
      'fixture-unverified-01',
      'fixture-in-review-02',
      'fixture-rejected-03',
      'fixture-expired-04',
      'fixture-missing-status-05',
      'fixture-null-status-06',
      'fixture-contradictory-07',
    ];

    for (const uid of unverifiedIds) {
      const exists = filtered.some(p => p.id === uid);
      assert.strictEqual(exists, false, `Proof: Fixture ${uid} must NOT appear in retrieval output`);
    }
  });

  // 3. Static Code Invariant: chat/query/route.ts
  await t.test('3. Static Code Invariant: chat/query/route.ts enforces verification_status in all retrieval flows', () => {
    assert.ok(fs.existsSync(queryRoutePath), 'query/route.ts must exist');
    const code = fs.readFileSync(queryRoutePath, 'utf8');

    // 3.1 Clustered places query filters verification_status = 'VERIFIED'
    assert.match(
      code,
      /\.in\(['"]id['"],\s*targetPoiIds\)\s*\.eq\(['"]is_verified['"],\s*true\)\s*\.eq\(['"]verification_status['"],\s*['"]VERIFIED['"]\)/,
      'Clustered places query must filter by is_verified=true and verification_status=VERIFIED'
    );

    // 3.2 Clustered places results passed through filterVerifiedRetrievalPlaces
    assert.match(
      code,
      /filterVerifiedRetrievalPlaces\(clusteredPlaces\)/,
      'Clustered places results must be wrapped in filterVerifiedRetrievalPlaces'
    );

    // 3.3 Token matches filtered
    assert.match(
      code,
      /filterVerifiedRetrievalPlaces\(tokenMatches\)/,
      'Token matches must be filtered by filterVerifiedRetrievalPlaces'
    );

    // 3.4 Vector matches filtered
    assert.match(
      code,
      /filterVerifiedRetrievalPlaces\(vectorMatches\)/,
      'Vector matches must be filtered by filterVerifiedRetrievalPlaces'
    );

    // 3.5 Nearby matches filtered
    assert.match(
      code,
      /filterVerifiedRetrievalPlaces\(nearbyPlaces\)/,
      'Nearby matches must be filtered by filterVerifiedRetrievalPlaces'
    );

    // 3.6 Final places list guarded before context generation
    assert.match(
      code,
      /places\s*=\s*filterVerifiedRetrievalPlaces\(Array\.from\(placesMap\.values\(\)\)\)/,
      'Final places array must be guarded by filterVerifiedRetrievalPlaces'
    );

    // 3.7 Fallback hotPlaces query filters verification_status = 'VERIFIED'
    assert.match(
      code,
      /\.eq\(['"]is_hot['"],\s*true\)\s*\.eq\(['"]is_verified['"],\s*true\)\s*\.eq\(['"]verification_status['"],\s*['"]VERIFIED['"]\)/,
      'Fallback hotPlaces query must filter by is_verified=true and verification_status=VERIFIED'
    );
  });

  // 4. Static Code Invariant: chatTokenSearchHelper.ts
  await t.test('4. Static Code Invariant: chatTokenSearchHelper.ts PostgREST query enforces verification_status', () => {
    assert.ok(fs.existsSync(tokenSearchHelperPath), 'chatTokenSearchHelper.ts must exist');
    const code = fs.readFileSync(tokenSearchHelperPath, 'utf8');

    assert.match(
      code,
      /\.eq\(['"]is_verified['"],\s*true\)\s*\.eq\(['"]verification_status['"],\s*['"]VERIFIED['"]\)/,
      'chatTokenSearchHelper PostgREST query must filter by is_verified=true and verification_status=VERIFIED'
    );
    assert.match(
      code,
      /filterVerifiedRetrievalPlaces\(data\)/,
      'chatTokenSearchHelper must return filterVerifiedRetrievalPlaces(data)'
    );
  });

  // 5. Static Code Invariant: search/route.ts
  await t.test('5. Static Code Invariant: search/route.ts enforces verification_status on DB query and memory pool', () => {
    assert.ok(fs.existsSync(searchRoutePath), 'search/route.ts must exist');
    const code = fs.readFileSync(searchRoutePath, 'utf8');

    assert.match(
      code,
      /\.eq\(['"]is_verified['"],\s*true\)\s*\.eq\(['"]verification_status['"],\s*['"]VERIFIED['"]\)/,
      'search/route.ts query must filter by is_verified=true and verification_status=VERIFIED'
    );
    assert.match(
      code,
      /pool:\s*any\[\]\s*=\s*filterVerifiedRetrievalPlaces\(rawPool\)/,
      'search/route.ts must wrap pool in filterVerifiedRetrievalPlaces'
    );
  });

  // 6. Database Migration Invariant: match_places and match_places_nearby RPCs
  await t.test('6. Database Migration Invariant: RPCs filter WHERE verification_status = VERIFIED and is_verified = true', () => {
    assert.ok(fs.existsSync(rpcMigrationPath), 'RPC migration file must exist');
    const sql = fs.readFileSync(rpcMigrationPath, 'utf8');

    // match_places
    assert.match(
      sql,
      /places\.is_verified\s*=\s*true\s+AND\s+places\.verification_status\s*=\s*'VERIFIED'/i,
      'match_places RPC must filter by places.is_verified = true AND places.verification_status = VERIFIED'
    );

    // match_places_nearby
    assert.match(
      sql,
      /p\.is_verified\s*=\s*true\s+AND\s+p\.verification_status\s*=\s*'VERIFIED'/i,
      'match_places_nearby RPC must filter by p.is_verified = true AND p.verification_status = VERIFIED'
    );
  });
});
