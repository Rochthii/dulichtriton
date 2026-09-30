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
const helperPath = path.resolve(__dirname, '../src/lib/chatTokenSearchHelper.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');

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

  const customRequire = (id) => {
    if (id.includes('postgrestFilterSanitizer')) {
      return loadModule(path.resolve(__dirname, '../src/lib/postgrestFilterSanitizer.ts'));
    }
    if (id.includes('placeVerificationGuard')) {
      return loadModule(path.resolve(__dirname, '../src/lib/placeVerificationGuard.ts'));
    }
    return require(id);
  };

  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', outputText);
  fn(m, m.exports, customRequire, path.dirname(filePath), filePath);
  return m.exports;
}

test('P04-007: Single Bounded POI Token Search Invariant & Query-Count Proof', async (t) => {
  const {
    STOP_WORDS,
    extractSearchTerms,
    buildBoundedOrFilter,
    executeBoundedTokenSearch,
  } = loadModule(helperPath);

  // 1. Static Code Invariant: query/route.ts replaces sequential loops with single bounded query
  await t.test('1. Static Code Invariant: Route imports and uses executeBoundedTokenSearch without sequential loops', () => {
    assert.ok(fs.existsSync(queryRoutePath), 'query/route.ts must exist');
    const routeCode = fs.readFileSync(queryRoutePath, 'utf8');

    // Must import executeBoundedTokenSearch
    assert.match(
      routeCode,
      /import\s*\{[^}]*executeBoundedTokenSearch[^}]*\}\s*from\s*['"]@\/lib\/chatTokenSearchHelper['"]/,
      'Must import executeBoundedTokenSearch from @/lib/chatTokenSearchHelper'
    );

    // Must invoke executeBoundedTokenSearch
    assert.match(
      routeCode,
      /await\s+executeBoundedTokenSearch\s*\(\s*supabase,\s*lowerQuery,\s*\{[^}]*\}\s*\)/,
      'Must invoke executeBoundedTokenSearch with bounded options'
    );

    // Must NOT contain sequential loops over n-gram phrases or filtered tokens
    assert.doesNotMatch(
      routeCode,
      /for\s*\(\s*const\s+phrase\s+of\s+nGramPhrases\s*\)/,
      'Must eliminate sequential for loop over nGramPhrases'
    );

    assert.doesNotMatch(
      routeCode,
      /for\s*\(\s*const\s+token\s+of\s+filteredTokens\s*\)/,
      'Must eliminate sequential for loop over filteredTokens'
    );
  });

  // 2. Unit Test: Term extraction and PostgREST .or() filter building
  await t.test('2. Unit Test: extractSearchTerms filters stop words, sanitizes delimiters, and bounds term count', () => {
    const complexQuery = 'Cho tôi hỏi lịch trình đi ngắm hoàng hôn đồi Tà Pạ và ăn gà đốt Ô Thum ở đâu ngon?';
    const terms = extractSearchTerms(complexQuery, 6);

    assert.ok(Array.isArray(terms), 'Extracted terms must be an array');
    assert.ok(terms.length > 0 && terms.length <= 6, `Terms count must be bounded <= 6, got ${terms.length}`);

    // Verify no stop words present in extracted terms
    for (const term of terms) {
      const parts = term.split(/\s+/);
      for (const p of parts) {
        assert.ok(!STOP_WORDS.has(p), `Term "${term}" contains stop word "${p}"`);
      }
      // Verify no dangerous delimiter characters
      assert.doesNotMatch(term, /[,%()\\/]/, `Term "${term}" must not contain SQL/PostgREST delimiter chars`);
    }

    // Verify PostgREST .or() filter clause building
    const orFilter = buildBoundedOrFilter(terms);
    assert.ok(typeof orFilter === 'string' && orFilter.length > 0, 'Filter must be non-empty string');

    // Each term must produce 3 clauses: name, category, commune
    for (const term of terms) {
      assert.ok(orFilter.includes(`name.ilike.%${term}%`), `Filter must contain name clause for "${term}"`);
      assert.ok(orFilter.includes(`category.ilike.%${term}%`), `Filter must contain category clause for "${term}"`);
      assert.ok(orFilter.includes(`commune.ilike.%${term}%`), `Filter must contain commune clause for "${term}"`);
    }
  });

  // 3. Query-Count Benchmark: Proof that DB round-trips drop from N sequential queries to exactly ONE
  await t.test('3. Query-Count Proof: Sequential loop causes 12+ queries, executeBoundedTokenSearch uses exactly 1', async () => {
    const userQuery = 'Kinh nghiệm leo núi Cô Tô ngắm bình minh và ăn cháo bò Tri Tôn';

    // Simulate Legacy Sequential Algorithm
    let legacyQueryCount = 0;
    const legacyStopWords = ['ở', 'đâu', 'có', 'gì', 'đẹp', 'nào', 'ngon', 'mấy', 'giờ', 'bao', 'nhiêu', 'cho', 'mình', 'với', 'thì', 'lên', 'ăn', 'đi', 'muốn', 'ngắm', 'chỗ', 'hãy', 'bạn', 'tối', 'sáng', 'thế', 'nào', 'từ', 'vé', 'quán', 'thích'];
    const rawTokens = userQuery.toLowerCase().replace(/[?,.!]/g, '').split(/\s+/).filter(Boolean);
    const filteredTokens = rawTokens.filter((w) => !legacyStopWords.includes(w));

    const nGramPhrases = [];
    for (let i = 0; i < filteredTokens.length - 1; i++) {
      nGramPhrases.push(`${filteredTokens[i]} ${filteredTokens[i + 1]}`);
    }
    for (let i = 0; i < filteredTokens.length - 2; i++) {
      nGramPhrases.push(`${filteredTokens[i]} ${filteredTokens[i + 1]} ${filteredTokens[i + 2]}`);
    }

    for (const phrase of nGramPhrases) {
      if (phrase.length >= 3) legacyQueryCount++;
    }
    // Fallback loop if size < 2
    for (const token of filteredTokens) {
      if (token.length >= 2) legacyQueryCount++;
    }

    assert.ok(legacyQueryCount >= 10, `Legacy sequential loop generates ${legacyQueryCount} queries (expected >= 10)`);

    // Execute Bounded Token Search with Spy Supabase Client
    let singleBoundedQueryCount = 0;
    let capturedFilter = null;
    let capturedLimit = null;

    const mockPlacesData = [
      { id: 'PL001', name: 'Đỉnh Núi Cô Tô', commune: 'Xã Cô Tô', category: 'Thắng cảnh', is_verified: true, verification_status: 'VERIFIED' },
      { id: 'FD009', name: 'Cháo Bò Bảy Núi', commune: 'Xã Châu Lăng', category: 'Ẩm thực', is_verified: true, verification_status: 'VERIFIED' },
    ];

    const spySupabase = {
      from(table) {
        assert.equal(table, 'places', 'Must query places table');
        const queryBuilder = {
          select(fields) {
            return queryBuilder;
          },
          eq(col, val) {
            return queryBuilder;
          },
          or(filterStr) {
            capturedFilter = filterStr;
            return queryBuilder;
          },
          async limit(limitNum) {
            singleBoundedQueryCount++;
            capturedLimit = limitNum;
            return { data: mockPlacesData, error: null };
          },
        };
        return queryBuilder;
      },
    };

    const results = await executeBoundedTokenSearch(spySupabase, userQuery, {
      maxTerms: 6,
      limit: 8,
    });

    // PROOF ASSERTIONS:
    // 1. Query count must be STRICTLY 1
    assert.equal(singleBoundedQueryCount, 1, 'executeBoundedTokenSearch must execute exactly 1 database query');

    // 2. Query reduction percentage must be >= 85%
    const reductionPercent = ((legacyQueryCount - singleBoundedQueryCount) / legacyQueryCount) * 100;
    assert.ok(reductionPercent >= 85, `Query reduction should be >= 85%, got ${reductionPercent.toFixed(1)}%`);

    // 3. Limit must be respected
    assert.equal(capturedLimit, 8, 'Query limit must be 8');

    // 4. Returned results match mock data
    assert.deepEqual(results, mockPlacesData, 'Results should match returned data');
    assert.ok(capturedFilter.includes('núi cô tô'), 'Filter should contain search phrase');
  });

  // 4. Robustness: Empty, whitespace, or stop-words-only query triggers 0 DB queries
  await t.test('4. Robustness: Queries with no meaningful terms trigger 0 DB calls and return []', async () => {
    let callCount = 0;
    const spySupabase = {
      from() {
        callCount++;
        return {};
      },
    };

    const res1 = await executeBoundedTokenSearch(spySupabase, '');
    const res2 = await executeBoundedTokenSearch(spySupabase, '   ');
    const res3 = await executeBoundedTokenSearch(spySupabase, 'ở đâu có gì đẹp nào'); // all stop words
    const res4 = await executeBoundedTokenSearch(null, 'Hồ Tà Pạ');

    assert.equal(callCount, 0, 'No database calls should be made when query lacks valid terms or supabase is null');
    assert.deepEqual(res1, []);
    assert.deepEqual(res2, []);
    assert.deepEqual(res3, []);
    assert.deepEqual(res4, []);
  });

  // 5. Robustness: Supabase error or throw degrades gracefully without crashing
  await t.test('5. Robustness: Supabase error degrades gracefully to empty array', async () => {
    const errorSupabase = {
      from() {
        const queryBuilder = {
          select() {
            return queryBuilder;
          },
          eq() {
            return queryBuilder;
          },
          or() {
            return queryBuilder;
          },
          async limit() {
            return { data: null, error: { message: 'Database connection timeout' } };
          },
        };
        return queryBuilder;
      },
    };

    const res = await executeBoundedTokenSearch(errorSupabase, 'Gà đốt Ô Thum');
    assert.deepEqual(res, [], 'Should degrade gracefully to [] on DB error');
  });
});
