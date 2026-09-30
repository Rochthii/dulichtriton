import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Module, { createRequire } from 'node:module';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Register TypeScript and path alias loader for @/
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const { outputText } = typescript.transpileModule(content, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  });
  module._compile(outputText, filename);
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const rel = request.slice(2);
    const resolvedPath = path.resolve(__dirname, '../src', rel);
    for (const ext of ['', '.ts', '.tsx', '.js', '.json']) {
      if (fs.existsSync(resolvedPath + ext)) return resolvedPath + ext;
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

const ragEnginePath = path.resolve(__dirname, '../src/lib/ai/ragEngine.ts');
const canonicalPlacesPath = path.resolve(__dirname, '../src/data/places.canonical.json');

test('P03-021: Positive control - ingestCanonicalPlacesForRag successfully ingests production canonical places', async () => {
  assert.ok(fs.existsSync(ragEnginePath), 'ragEngine.ts must exist');
  assert.ok(fs.existsSync(canonicalPlacesPath), 'places.canonical.json must exist');

  const { ingestCanonicalPlacesForRag } = require(ragEnginePath);
  const canonicalArtifact = JSON.parse(fs.readFileSync(canonicalPlacesPath, 'utf8'));

  const ingested = ingestCanonicalPlacesForRag(canonicalArtifact.places, { strict: true });
  assert.equal(
    ingested.length,
    canonicalArtifact.places.length,
    'All production canonical places must be successfully ingested'
  );

  for (const place of ingested) {
    assert.equal(place.verification_status, 'VERIFIED');
    assert.equal(place.is_verified, true);
    assert.ok(place.id, 'Must have id');
    assert.ok(place.name, 'Must have name');
    assert.ok(place.commune, 'Must have commune');
    assert.ok(place.category, 'Must have category');
    assert.equal(typeof place.latitude, 'number');
    assert.equal(typeof place.longitude, 'number');
  }
});

test('P03-021: Positive control - getActiveRagPlaces returns verified places only', async () => {
  const { getActiveRagPlaces } = require(ragEnginePath);
  const activePlaces = getActiveRagPlaces();

  assert.ok(Array.isArray(activePlaces), 'getActiveRagPlaces must return an array');
  assert.ok(activePlaces.length >= 1, 'Must contain at least 1 active verified place');

  for (const place of activePlaces) {
    assert.equal(place.verification_status, 'VERIFIED');
    assert.equal(place.is_verified, true);
  }
});

test('P03-021: Negative control - Ingest gate rejects unverified status fixtures (filter & strict)', async () => {
  const { ingestCanonicalPlacesForRag } = require(ragEnginePath);

  const unverifiedFixtures = [
    { canonical_id: 'place-unverified', name: 'Chỗ Chưa Thẩm Định', verification_status: 'UNVERIFIED', is_verified: false },
    { canonical_id: 'place-pending', name: 'Chỗ Đang Chờ', verification_status: 'PENDING', is_verified: false },
    { canonical_id: 'place-in-review', name: 'Chỗ Đang Review', verification_status: 'IN_REVIEW', is_verified: false },
    { canonical_id: 'place-rejected', name: 'Chỗ Bị Từ Chối', verification_status: 'REJECTED', is_verified: false },
    { canonical_id: 'place-expired', name: 'Chỗ Hết Hạn', verification_status: 'EXPIRED', is_verified: false },
    { canonical_id: 'place-mock', name: 'Chỗ Dữ Liệu Fake', verification_status: 'MOCK', is_verified: false },
  ];

  const validPlace = {
    canonical_id: 'place-valid',
    name: 'Chùa Xà Tón Thật',
    commune: 'Thị trấn Tri Tôn',
    coordinates: { latitude: 10.411, longitude: 105.0089 },
    verification_status: 'VERIFIED',
    is_verified: true,
  };

  // Filter mode (default): unverified fixtures are excluded 100%
  const mixedCandidates = [...unverifiedFixtures, validPlace];
  const filtered = ingestCanonicalPlacesForRag(mixedCandidates, { strict: false });
  assert.equal(filtered.length, 1, 'Only the single verified place must be ingested');
  assert.equal(filtered[0].id, 'place-valid');

  // Strict mode: throws on unverified fixture
  for (const fixture of unverifiedFixtures) {
    assert.throws(
      () => {
        ingestCanonicalPlacesForRag([fixture], { strict: true });
      },
      /Unverified place rejected from RAG ingest/,
      `Must throw error in strict mode for status ${fixture.verification_status}`
    );
  }
});

test('P03-021: Negative control - Ingest gate rejects fixture where is_verified is false or missing', async () => {
  const { ingestCanonicalPlacesForRag } = require(ragEnginePath);

  // Status says VERIFIED but is_verified is false
  const deceptiveFixture = {
    canonical_id: 'place-deceptive',
    name: 'Chỗ Giả Mạo Cờ',
    verification_status: 'VERIFIED',
    is_verified: false,
  };

  const filtered = ingestCanonicalPlacesForRag([deceptiveFixture], { strict: false });
  assert.equal(filtered.length, 0, 'Deceptive fixture with is_verified: false must be rejected');

  assert.throws(
    () => {
      ingestCanonicalPlacesForRag([deceptiveFixture], { strict: true });
    },
    /Unverified place rejected from RAG ingest/,
    'Must throw error on deceptive unverified fixture'
  );
});

test('P03-021: Negative control - Ingest gate handles malformed and non-object inputs safely', async () => {
  const { ingestCanonicalPlacesForRag } = require(ragEnginePath);

  const malformedInputs = [null, undefined, 'string', 12345, true, {}];
  const filtered = ingestCanonicalPlacesForRag(malformedInputs, { strict: false });
  assert.equal(filtered.length, 0, 'Malformed items must yield 0 ingested places');

  assert.equal(ingestCanonicalPlacesForRag(null).length, 0);
  assert.equal(ingestCanonicalPlacesForRag(undefined).length, 0);
});

test('P03-021: End-to-end RAG Context integration - buildUnifiedRagContext output only contains verified canonical places', async () => {
  const { buildUnifiedRagContext } = require(ragEnginePath);

  const result = await buildUnifiedRagContext('Chùa Xà Tón');
  assert.ok(result, 'Must return RagContextResult');
  assert.ok(Array.isArray(result.places), 'places must be an array');
  assert.ok(typeof result.ragContext === 'string', 'ragContext must be string');

  // Grounding header check
  assert.match(
    result.ragContext,
    /CSDL ĐỊA ĐIỂM TRI TÔN CANONICAL XÁC MINH \(VERIFIED GROUNDING\):/,
    'RAG context must use canonical verified grounding header'
  );

  // Elimination of false claim
  assert.doesNotMatch(
    result.ragContext,
    /149 ĐỊA ĐIỂM/,
    'RAG context must NOT contain legacy 149 claim'
  );

  // Verify all returned places are verified
  for (const place of result.places) {
    assert.ok(place.id, 'Place must have id');
    assert.ok(place.name, 'Place must have name');
    assert.ok(place.commune, 'Place must have commune');
  }
});
