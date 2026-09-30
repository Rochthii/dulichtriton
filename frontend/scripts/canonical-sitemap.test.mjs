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

const sitemapPath = path.resolve(__dirname, '../src/app/sitemap.ts');
const manifestPath = path.resolve(REPO_ROOT, 'data/canonical/canonical_manifest.json');
const canonicalPlacesPath = path.resolve(__dirname, '../src/data/places.canonical.json');

test('P03-020: Static code invariant - sitemap.ts must consume places.canonical.json and eliminate legacy references', async () => {
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.ts must exist');
  const content = fs.readFileSync(sitemapPath, 'utf8');

  // Must import canonical places artifact
  assert.match(
    content,
    /places\.canonical\.json/,
    'sitemap.ts must import places.canonical.json'
  );

  // Must not reference legacy unverified or unharmonized full json
  assert.doesNotMatch(
    content,
    /triton_pois_full\.json/,
    'sitemap.ts must NOT reference legacy triton_pois_full.json'
  );

  // Must not contain false historical claim "149 verified POI detail pages"
  assert.doesNotMatch(
    content,
    /149 verified POI/i,
    'sitemap.ts must NOT contain false claim "149 verified POI"'
  );
});

test('P03-020: Concordance check - Dynamic POI count in sitemap must match canonical manifest exactly 100%', async () => {
  assert.ok(fs.existsSync(manifestPath), 'canonical_manifest.json must exist');
  assert.ok(fs.existsSync(canonicalPlacesPath), 'places.canonical.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const canonicalArtifact = JSON.parse(fs.readFileSync(canonicalPlacesPath, 'utf8'));

  const sitemapModule = require(sitemapPath);
  const sitemapFn = sitemapModule.default;
  assert.equal(typeof sitemapFn, 'function', 'sitemap.ts must export default generator function');

  const routes = sitemapFn();
  assert.ok(Array.isArray(routes), 'sitemap() must return an array of routes');

  // Filter dynamic POI routes (pattern: .../places/<canonical_id>)
  // Note: /places is the static index page, dynamic routes have a slug after /places/
  const dynamicPoiRoutes = routes.filter((r) => {
    const parsed = new URL(r.url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length === 2 && parts[0] === 'places';
  });

  // Proof: sitemap count matches manifest count exactly
  assert.equal(
    dynamicPoiRoutes.length,
    manifest.places.length,
    `Dynamic POI count in sitemap (${dynamicPoiRoutes.length}) must match manifest.places count (${manifest.places.length})`
  );

  assert.equal(
    dynamicPoiRoutes.length,
    canonicalArtifact.total_count,
    `Dynamic POI count in sitemap (${dynamicPoiRoutes.length}) must match canonical artifact total_count (${canonicalArtifact.total_count})`
  );
});

test('P03-020: Canonical slug invariant - All POI route URLs must map to canonical IDs from manifest', async () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expectedCanonicalIds = new Set(manifest.places.map((p) => p.canonical_id));

  const sitemapModule = require(sitemapPath);
  const routes = sitemapModule.default();

  const dynamicPoiRoutes = routes.filter((r) => {
    const parsed = new URL(r.url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length === 2 && parts[0] === 'places';
  });

  const seenSlugs = new Set();
  for (const route of dynamicPoiRoutes) {
    const parsed = new URL(route.url);
    const slug = parsed.pathname.split('/')[2];

    assert.ok(slug, `Route ${route.url} must contain a non-empty slug`);
    assert.equal(seenSlugs.has(slug), false, `Slug "${slug}" must not be duplicated in sitemap`);
    seenSlugs.add(slug);

    assert.ok(
      expectedCanonicalIds.has(slug),
      `Slug "${slug}" in sitemap route must exist in canonical manifest`
    );

    // Negative invariant: no legacy UUID prefix in URL
    assert.doesNotMatch(
      slug,
      /^[0-9a-f]{8}-/i,
      `Slug "${slug}" must not contain legacy UUID prefix`
    );
  }
});

test('P03-020: Metadata verification - lastModified, changeFrequency, priority on POI routes', async () => {
  const canonicalArtifact = JSON.parse(fs.readFileSync(canonicalPlacesPath, 'utf8'));
  const placesMap = new Map(canonicalArtifact.places.map((p) => [p.canonical_id, p]));

  const sitemapModule = require(sitemapPath);
  const routes = sitemapModule.default();

  const dynamicPoiRoutes = routes.filter((r) => {
    const parsed = new URL(r.url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length === 2 && parts[0] === 'places';
  });

  for (const route of dynamicPoiRoutes) {
    const parsed = new URL(route.url);
    const slug = parsed.pathname.split('/')[2];
    const place = placesMap.get(slug);

    assert.ok(route.lastModified instanceof Date, `lastModified for ${slug} must be a Date object`);
    assert.equal(Number.isNaN(route.lastModified.getTime()), false, `lastModified for ${slug} must be valid timestamp`);

    if (place?.verified_at) {
      const expectedTime = new Date(place.verified_at).getTime();
      assert.equal(route.lastModified.getTime(), expectedTime, `lastModified for ${slug} must match place.verified_at`);
    }

    assert.equal(route.changeFrequency, 'weekly', `changeFrequency for ${slug} must be 'weekly'`);
    assert.equal(typeof route.priority, 'number', `priority for ${slug} must be a number`);
    assert.ok(route.priority >= 0 && route.priority <= 1, `priority for ${slug} must be between 0 and 1`);
  }
});

test('P03-020: Static core routes preserved alongside dynamic canonical routes', async () => {
  const sitemapModule = require(sitemapPath);
  const routes = sitemapModule.default();

  const expectedStaticPaths = [
    '',
    '/places',
    '/food',
    '/stay',
    '/culture',
    '/map',
    '/planner',
    '/itinerary',
    '/guide',
    '/chatbot',
    '/partner',
    '/emergency',
  ];

  const actualPaths = new Set(routes.map((r) => new URL(r.url).pathname.replace(/\/$/, '')));

  for (const staticPath of expectedStaticPaths) {
    assert.ok(
      actualPaths.has(staticPath),
      `Static core route "${staticPath}" must be preserved in sitemap`
    );
  }
});
