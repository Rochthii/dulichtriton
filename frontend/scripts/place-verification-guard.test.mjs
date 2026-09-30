import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const guardPath = path.resolve(__dirname, '../src/lib/placeVerificationGuard.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const adminPlacesRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/places/route.ts');
const tokenSearchHelperPath = path.resolve(__dirname, '../src/lib/chatTokenSearchHelper.ts');
const searchRoutePath = path.resolve(__dirname, '../src/app/api/v1/search/route.ts');
const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20260930_p04_009_places_is_verified_default_false.sql');

// Transpile and load TypeScript helper
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

test('P04-009: Place Verification Guard — Missing field MUST NEVER default to verified=true', async (t) => {
  const {
    isRecordVerified,
    resolveVerificationMetadata,
    sanitizePlaceVerification,
  } = loadModule(guardPath);

  // 1. Unit Tests: isRecordVerified fail-closed semantics
  await t.test('1. Unit Test: isRecordVerified returns false for any missing, null, undefined, or falsy value', () => {
    // Missing / empty inputs
    assert.strictEqual(isRecordVerified(null), false, 'null must return false');
    assert.strictEqual(isRecordVerified(undefined), false, 'undefined must return false');
    assert.strictEqual(isRecordVerified({}), false, 'empty object must return false');
    assert.strictEqual(isRecordVerified({ name: 'Chùa Xà Tón' }), false, 'missing is_verified must return false');

    // Falsy / invalid types
    assert.strictEqual(isRecordVerified({ is_verified: null }), false, 'null is_verified must return false');
    assert.strictEqual(isRecordVerified({ is_verified: undefined }), false, 'undefined is_verified must return false');
    assert.strictEqual(isRecordVerified({ is_verified: false }), false, 'false is_verified must return false');
    assert.strictEqual(isRecordVerified({ is_verified: 0 }), false, '0 is_verified must return false');
    assert.strictEqual(isRecordVerified({ is_verified: '' }), false, 'empty string is_verified must return false');
    assert.strictEqual(isRecordVerified({ is_verified: 'true' }), false, 'string "true" must return false');

    // Conflicting verification_status
    assert.strictEqual(isRecordVerified({ is_verified: true, verification_status: 'UNVERIFIED' }), false, 'UNVERIFIED status must fail-closed');
    assert.strictEqual(isRecordVerified({ is_verified: true, verification_status: 'REJECTED' }), false, 'REJECTED status must fail-closed');
    assert.strictEqual(isRecordVerified({ is_verified: true, verification_status: 'IN_REVIEW' }), false, 'IN_REVIEW status must fail-closed');
    assert.strictEqual(isRecordVerified({ is_verified: true, verification_status: 'EXPIRED' }), false, 'EXPIRED status must fail-closed');

    // Valid positive verified record
    assert.strictEqual(isRecordVerified({ is_verified: true, verification_status: 'VERIFIED' }), true, 'VERIFIED status with true must return true');
    assert.strictEqual(isRecordVerified({ is_verified: true }), true, 'Omitted status with true returns true');
  });

  // 2. Unit Tests: resolveVerificationMetadata strips false claims
  await t.test('2. Unit Test: resolveVerificationMetadata resolves safe metadata and strips invalid timestamps', () => {
    // Missing field
    const emptyMeta = resolveVerificationMetadata({});
    assert.deepStrictEqual(emptyMeta, {
      is_verified: false,
      verification_status: 'UNVERIFIED',
      verified_at: null,
    }, 'Missing field must resolve to unverified with null timestamp');

    // Unverified record with fake verified_at timestamp
    const fakeTimestampMeta = resolveVerificationMetadata({
      is_verified: false,
      verification_status: 'UNVERIFIED',
      verified_at: '2026-09-30T20:00:00Z',
    });
    assert.strictEqual(fakeTimestampMeta.is_verified, false);
    assert.strictEqual(fakeTimestampMeta.verified_at, null, 'Must strip verified_at on unverified record');

    // Valid verified record
    const validMeta = resolveVerificationMetadata({
      is_verified: true,
      verification_status: 'VERIFIED',
      verified_at: '2026-09-28T22:00:00+07:00',
    });
    assert.strictEqual(validMeta.is_verified, true);
    assert.strictEqual(validMeta.verification_status, 'VERIFIED');
    assert.strictEqual(validMeta.verified_at, '2026-09-28T22:00:00+07:00');
  });

  // 3. Unit Tests: sanitizePlaceVerification preserves non-verification fields
  await t.test('3. Unit Test: sanitizePlaceVerification preserves place fields while enforcing verification safety', () => {
    const rawPlace = {
      id: 'ho-ta-pa',
      name: 'Hồ Tà Pạ',
      commune: 'Xã Núi Tô',
      rating: 4.8,
      // is_verified is missing!
    };

    const sanitized = sanitizePlaceVerification(rawPlace);
    assert.strictEqual(sanitized.id, 'ho-ta-pa');
    assert.strictEqual(sanitized.name, 'Hồ Tà Pạ');
    assert.strictEqual(sanitized.is_verified, false, 'Missing field MUST become false');
    assert.strictEqual(sanitized.verification_status, 'UNVERIFIED');
    assert.strictEqual(sanitized.verified_at, null);
  });

  // 4. Static Code Invariant: Elimination of `?? true` and `|| true` on is_verified
  await t.test('4. Static Code Invariant: Codebase contains 0% defaulting of is_verified to true', () => {
    // 4.1 query/route.ts
    assert.ok(fs.existsSync(queryRoutePath), 'query/route.ts must exist');
    const queryCode = fs.readFileSync(queryRoutePath, 'utf8');

    assert.doesNotMatch(
      queryCode,
      /is_verified\s*(\?\?|\|\|)\s*true/,
      'query/route.ts must NOT contain `is_verified ?? true` or `is_verified || true`'
    );
    assert.match(
      queryCode,
      /import\s*\{[^}]*resolveVerificationMetadata[^}]*\}\s*from\s*['"]@\/lib\/placeVerificationGuard['"]/,
      'query/route.ts must import resolveVerificationMetadata'
    );

    // 4.2 admin/places/route.ts
    assert.ok(fs.existsSync(adminPlacesRoutePath), 'admin/places/route.ts must exist');
    const adminPlacesCode = fs.readFileSync(adminPlacesRoutePath, 'utf8');

    assert.doesNotMatch(
      adminPlacesCode,
      /newRecord\s*=\s*\{[^}]*is_verified:\s*true\s*,/,
      'admin places POST must NOT hardcode is_verified: true unconditionally'
    );
    assert.match(
      adminPlacesCode,
      /import\s*\{[^}]*resolveVerificationMetadata[^}]*\}\s*from\s*['"]@\/lib\/placeVerificationGuard['"]/,
      'admin/places/route.ts must import resolveVerificationMetadata'
    );

    // 4.3 chatTokenSearchHelper.ts
    assert.ok(fs.existsSync(tokenSearchHelperPath), 'chatTokenSearchHelper.ts must exist');
    const tokenSearchCode = fs.readFileSync(tokenSearchHelperPath, 'utf8');
    assert.match(
      tokenSearchCode,
      /\.select\([^)]*is_verified[^)]*\)/,
      'chatTokenSearchHelper.ts select must query is_verified'
    );

    // 4.4 search/route.ts
    assert.ok(fs.existsSync(searchRoutePath), 'search/route.ts must exist');
    const searchCode = fs.readFileSync(searchRoutePath, 'utf8');
    assert.match(
      searchCode,
      /import\s*\{[^}]*resolveVerificationMetadata[^}]*\}\s*from\s*['"]@\/lib\/placeVerificationGuard['"]/,
      'search/route.ts must import resolveVerificationMetadata'
    );
  });

  // 5. Database Migration Invariant
  await t.test('5. Database Migration Invariant: Migration sets is_verified default to false and cleanses NULLs', () => {
    assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    assert.match(
      migrationSql,
      /ALTER\s+TABLE\s+public\.places\s+ALTER\s+COLUMN\s+is_verified\s+SET\s+DEFAULT\s+false/i,
      'Migration must ALTER COLUMN is_verified SET DEFAULT false'
    );
    assert.match(
      migrationSql,
      /UPDATE\s+public\.places\s+SET\s+is_verified\s*=\s*false\s+WHERE\s+is_verified\s+IS\s+NULL/i,
      'Migration must set NULL is_verified records to false'
    );
  });
});
