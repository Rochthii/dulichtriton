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
const sanitizerPath = path.resolve(__dirname, '../src/lib/postgrestFilterSanitizer.ts');
const searchRoutePath = path.resolve(__dirname, '../src/app/api/v1/search/route.ts');
const videosRoutePath = path.resolve(__dirname, '../src/app/api/v1/videos/route.ts');
const adminPlacesRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/places/route.ts');
const adminAuditLogsRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/audit-logs/route.ts');
const adminKnowledgeBaseRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/knowledge-base/route.ts');
const adminItinerariesRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/itineraries/route.ts');
const placesLibPath = path.resolve(__dirname, '../src/lib/places.ts');
const chatTokenSearchHelperPath = path.resolve(__dirname, '../src/lib/chatTokenSearchHelper.ts');

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

test('P04-008: PostgREST Filter Sanitizer & Injection Resistance Invariant', async (t) => {
  const {
    sanitizeFilterTerm,
    buildSafeOrIlikeFilter,
    buildSafeMultiTermOrFilter,
    countPostgrestClauses,
  } = loadModule(sanitizerPath);

  // 1. Static Code Invariant: All routes use sanitized filters, NO raw user interpolation in .or()
  await t.test('1. Static Code Invariant: Routes do NOT contain raw unshielded interpolation in .or()', () => {
    const filesToCheck = [
      { name: 'search/route.ts', path: searchRoutePath, expectedHelper: 'buildSafeOrIlikeFilter' },
      { name: 'videos/route.ts', path: videosRoutePath, expectedHelper: 'buildSafeOrIlikeFilter' },
      { name: 'admin/places/route.ts', path: adminPlacesRoutePath, expectedHelper: 'buildSafeOrIlikeFilter' },
      { name: 'admin/audit-logs/route.ts', path: adminAuditLogsRoutePath, expectedHelper: 'buildSafeOrIlikeFilter' },
      { name: 'admin/knowledge-base/route.ts', path: adminKnowledgeBaseRoutePath, expectedHelper: 'buildSafeOrIlikeFilter' },
      { name: 'admin/itineraries/route.ts', path: adminItinerariesRoutePath, expectedHelper: 'sanitizeFilterTerm' },
      { name: 'lib/places.ts', path: placesLibPath, expectedHelper: 'sanitizeFilterTerm' },
      { name: 'lib/chatTokenSearchHelper.ts', path: chatTokenSearchHelperPath, expectedHelper: 'buildSafeMultiTermOrFilter' },
    ];

    for (const file of filesToCheck) {
      assert.ok(fs.existsSync(file.path), `${file.name} must exist`);
      const code = fs.readFileSync(file.path, 'utf8');

      // Must import sanitizer
      assert.match(
        code,
        /from\s*['"](@\/lib\/postgrestFilterSanitizer|\.\/postgrestFilterSanitizer)['"]/,
        `${file.name} must import from postgrestFilterSanitizer`
      );

      // Must NOT contain dangerous raw interpolation patterns like .or(`...${search}...`) or .or(`...${q}...`)
      assert.doesNotMatch(
        code,
        /\.or\(`[^`]*\$\{(search|q|category|location|targetId|itinerary_id)\}[^`]*`\)/,
        `${file.name} must NOT interpolate raw search/q/category/targetId directly into .or()`
      );
    }
  });

  // 2. sanitizeFilterTerm neutralizes structural delimiters and preserves search intent
  await t.test('2. sanitizeFilterTerm: Neutralizes PostgREST delimiters, operators, and preserves text', () => {
    // Delimiters neutralization
    assert.strictEqual(sanitizeFilterTerm('hồ tà pạ,is_active.eq.false'), 'hồ tà pạ is_active.eq.false');
    assert.strictEqual(sanitizeFilterTerm('test,(id.gt.0)'), 'test id.gt.0');
    assert.strictEqual(sanitizeFilterTerm('name.eq."hacked"'), 'name.eq. hacked');
    assert.strictEqual(sanitizeFilterTerm('slash\\escape'), 'slash escape');

    // Wildcard normalization
    assert.strictEqual(sanitizeFilterTerm('gà đốt%%%ô thum'), 'gà đốt%ô thum');

    // Whitespace trimming
    assert.strictEqual(sanitizeFilterTerm('   chùa svay ton   '), 'chùa svay ton');

    // Null/undefined/empty
    assert.strictEqual(sanitizeFilterTerm(null), '');
    assert.strictEqual(sanitizeFilterTerm(undefined), '');
    assert.strictEqual(sanitizeFilterTerm('   '), '');
    assert.strictEqual(sanitizeFilterTerm(12345), '');
  });

  // 3. buildSafeOrIlikeFilter: Guarantees invariant clause count and bounds
  await t.test('3. buildSafeOrIlikeFilter: Bounded clause count, immunity against filter injection', () => {
    const fields = ['name', 'commune', 'description'];

    // Normal query
    const normalFilter = buildSafeOrIlikeFilter(fields, 'chùa xà tón');
    assert.strictEqual(
      normalFilter,
      'name.ilike.%chùa xà tón%,commune.ilike.%chùa xà tón%,description.ilike.%chùa xà tón%'
    );
    assert.strictEqual(countPostgrestClauses(normalFilter), 3);

    // Injection attempt: payload containing commas and filter operators
    const attackPayload = 'hồ tà pạ,is_active.eq.false,rating.gt.5,(id.neq.0)';
    const safeFilter = buildSafeOrIlikeFilter(fields, attackPayload);

    // CRITICAL PROOF: The number of clauses MUST remain strictly equal to fields.length (3)
    // Attack payload cannot inject extra filter clauses into the PostgREST AST
    assert.strictEqual(countPostgrestClauses(safeFilter), fields.length, 'Clause count MUST NOT increase under injection');
    assert.ok(!safeFilter.includes('is_active.eq.false,'), 'Must not form separate is_active clause');
    assert.ok(!safeFilter.includes('(id.neq.0)'), 'Must neutralize parentheses');

    // Invalid fields handling
    assert.strictEqual(buildSafeOrIlikeFilter([], 'test'), null);
    assert.strictEqual(buildSafeOrIlikeFilter(['name', 'malicious.field,inject'], 'test'), 'name.ilike.%test%');
    assert.strictEqual(buildSafeOrIlikeFilter(fields, '   ,,,   '), null);
  });

  // 4. buildSafeMultiTermOrFilter: Multi-term bounded generation
  await t.test('4. buildSafeMultiTermOrFilter: Guarantees clause count equals fields * terms', () => {
    const fields = ['name', 'commune'];
    const terms = ['tà pạ', 'núi tô', 'soài so'];

    const multiFilter = buildSafeMultiTermOrFilter(fields, terms);
    // 2 fields * 3 terms = 6 clauses
    assert.strictEqual(countPostgrestClauses(multiFilter), 6);
    assert.strictEqual(
      multiFilter,
      'name.ilike.%tà pạ%,commune.ilike.%tà pạ%,name.ilike.%núi tô%,commune.ilike.%núi tô%,name.ilike.%soài so%,commune.ilike.%soài so%'
    );

    // Attack payload in terms array
    const maliciousTerms = ['hồ tà pạ,is_active.eq.false', '(delete*all)', '   '];
    const safeMulti = buildSafeMultiTermOrFilter(fields, maliciousTerms);

    // 2 valid terms (sanitized) * 2 fields = 4 clauses
    assert.strictEqual(countPostgrestClauses(safeMulti), 4);
  });

  // 5. countPostgrestClauses utility verification
  await t.test('5. countPostgrestClauses: Accurately counts comma-separated PostgREST filter clauses', () => {
    assert.strictEqual(countPostgrestClauses(null), 0);
    assert.strictEqual(countPostgrestClauses(''), 0);
    assert.strictEqual(countPostgrestClauses('name.ilike.%a%'), 1);
    assert.strictEqual(countPostgrestClauses('name.ilike.%a%,commune.ilike.%a%'), 2);
    assert.strictEqual(countPostgrestClauses('a,b,c,d,e'), 5);
  });
});
