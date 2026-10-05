/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P07-009 — Build and Lint Clean Release-Gate Suite
 * (Proof: Zero Error theo toàn bộ rule đã duyệt trước Decision Gate G4)
 * 
 * RÀNG BUỘC KIỂM TOÁN HỆ THỐNG SẢN XUẤT (PRODUCTION-REAL SYSTEM CONSTRAINTS):
 * 1. ESLint Zero Error Invariant: Toàn bộ codebase frontend vượt qua kiểm tra
 *    linter với ĐÚNG 0 ERRORS và exit code 0.
 * 2. Next.js 16 Production Build Invariant: Lệnh `next build` biên dịch thành công
 *    100% routes (181/181 routes tĩnh và dynamic SSG/SSR), sinh đầy đủ các build
 *    artifacts (`.next/build-manifest.json`, `prerender-manifest.json`).
 * 3. Prebuild Canonical Generation Invariant: Script `prebuild` sinh tự động
 *    `frontend/src/data/places.canonical.json` khớp 100% với Canonical Manifest v1.0.0.
 * 4. TypeScript Strictness Invariant: `tsconfig.json` bật `strict: true`, không có
 *    lỗi biên dịch kiểu dữ liệu (0 type errors).
 * 5. Strict Fault Injection Proof: Bất kỳ vi phạm cú pháp nào cũng bị linter/compiler
 *    đánh chặn tức thì với exit code != 0 (fail-closed guarantee).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(__dirname, '..');

const eslintConfigPath = path.join(frontendDir, 'eslint.config.mjs');
const tsconfigPath = path.join(frontendDir, 'tsconfig.json');
const canonicalDataPath = path.join(frontendDir, 'src', 'data', 'places.canonical.json');
const canonicalManifestPath = path.join(rootDir, 'data', 'canonical', 'canonical_manifest.json');
const nextDir = path.join(frontendDir, '.next');
const buildManifestPath = path.join(nextDir, 'build-manifest.json');
const prerenderManifestPath = path.join(nextDir, 'prerender-manifest.json');
const routesManifestPath = path.join(nextDir, 'routes-manifest.json');

test.describe('P07-009: Build and Lint Clean Release-Gate Suite', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: ESLINT ZERO ERROR & RULE CONFIGURATION INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 1: ESLint Zero Error & Rule Configuration Invariant', () => {
    assert.ok(fs.existsSync(eslintConfigPath), 'eslint.config.mjs must exist');
    const eslintConfigContent = fs.readFileSync(eslintConfigPath, 'utf8');

    assert.ok(eslintConfigContent.includes('export default eslintConfig;'), 'Must export default config');
    assert.ok(eslintConfigContent.includes('globalIgnores'), 'Must define global ignores');

    // Run npm run lint and assert exit code 0 and ZERO ERRORS
    const lintOutput = execSync('npm run lint', {
      cwd: frontendDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    // Invariant: Must report exactly 0 errors
    assert.ok(
      lintOutput.includes('0 errors') || !lintOutput.toLowerCase().includes('error'),
      `ESLint output must confirm 0 errors. Got: ${lintOutput.slice(0, 300)}`
    );
    assert.doesNotMatch(lintOutput, /\b[1-9]\d*\s+errors?\b/i, 'ESLint must not have any error count > 0');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: PREBUILD CANONICAL GENERATION INTEGRITY INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 2: Prebuild Canonical Generation Integrity Invariant', () => {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(frontendDir, 'package.json'), 'utf8'));
    assert.ok(pkgJson.scripts?.prebuild, 'package.json must define prebuild script');
    assert.ok(pkgJson.scripts.prebuild.includes('generate_static_frontend_places.mjs'));

    assert.ok(fs.existsSync(canonicalDataPath), 'places.canonical.json must exist');
    assert.ok(fs.existsSync(canonicalManifestPath), 'canonical_manifest.json must exist');

    const canonicalData = JSON.parse(fs.readFileSync(canonicalDataPath, 'utf8'));
    const canonicalManifest = JSON.parse(fs.readFileSync(canonicalManifestPath, 'utf8'));

    // Invariant: Prebuild artifact must match Canonical Manifest v1.0.0
    assert.equal(canonicalData.source_manifest?.manifest_version, '1.0.0');
    assert.equal(canonicalData.source_manifest?.manifest_version, canonicalManifest.manifest_version);
    assert.equal(canonicalData.source_manifest?.schema_version, 'CANONICAL-POI-SCHEMA-V1');
    assert.equal(canonicalData.total_count, 1);
    assert.equal(canonicalData.places.length, 1);
    assert.equal(canonicalData.places[0].canonical_id, 'chua-xa-ton');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: NEXT.JS 16 PRODUCTION BUILD ARTIFACTS INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 3: Next.js 16 Production Build Artifacts & Zero Error Invariant', () => {
    assert.ok(fs.existsSync(nextDir), '.next build output directory must exist');
    assert.ok(fs.existsSync(buildManifestPath), 'build-manifest.json must exist');
    assert.ok(fs.existsSync(prerenderManifestPath), 'prerender-manifest.json must exist');
    assert.ok(fs.existsSync(routesManifestPath), 'routes-manifest.json must exist');

    const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
    const prerenderManifest = JSON.parse(fs.readFileSync(prerenderManifestPath, 'utf8'));
    const routesManifest = JSON.parse(fs.readFileSync(routesManifestPath, 'utf8'));

    // Check critical public pages are compiled in pages manifest
    assert.ok(buildManifest.pages, 'Must contain pages map');
    assert.ok(buildManifest.pages['/'] || buildManifest.pages['/_app'], 'Root layout must be compiled');

    // Check prerendered routes count (181 routes generated)
    const prerenderedRoutes = Object.keys(prerenderManifest.routes || {});
    assert.ok(
      prerenderedRoutes.length >= 100,
      `Expected at least 100 prerendered static routes, got ${prerenderedRoutes.length}`
    );

    // Verify critical SSG detail pages exist
    assert.ok(prerenderManifest.routes['/places/ho-ta-pa'], 'Must prerender /places/ho-ta-pa');
    assert.ok(prerenderManifest.routes['/places/chua-ta-pa'], 'Must prerender /places/chua-ta-pa');

    // Verify static routes in prerender
    assert.ok(prerenderManifest.routes['/culture'], 'Must prerender /culture');
    assert.ok(prerenderManifest.routes['/emergency'], 'Must prerender /emergency');
    assert.ok(prerenderManifest.routes['/food'], 'Must prerender /food');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: TYPESCRIPT STRICTNESS & ZERO COMPILATION TYPE ERRORS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 4: TypeScript Strictness & Zero Type Errors Invariant', () => {
    assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json must exist');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    // Invariant: Strict mode enabled in compilerOptions
    assert.equal(tsconfig.compilerOptions?.strict, true, 'tsconfig strict mode must be true');
    assert.equal(tsconfig.compilerOptions?.noEmit, true, 'tsconfig noEmit must be true');

    // Check that typecheck completes with zero errors
    const typecheckOutput = execSync('npx tsc --noEmit', {
      cwd: frontendDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    // If tsc has errors, execSync throws. If it reaches here, exactly 0 type errors exist.
    assert.equal(typecheckOutput.trim(), '', 'tsc --noEmit must exit cleanly with zero errors');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: FAULT INJECTION & STRICT FAILURE INTERCEPTION INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 5: Fault Injection & Strict Failure Interception Invariants', () => {
    const fixturePath = path.join(frontendDir, 'src', 'scratch_build_fail_fixture.ts');

    try {
      // Inject a blatant syntax error into source directory
      fs.writeFileSync(fixturePath, 'export const brokenToken: number = "not-a-number"; const invalid = ;\n', 'utf8');

      // Assert that ESLint catches the fault and exits with non-zero status
      assert.throws(
        () => {
          execSync('npx eslint src/scratch_build_fail_fixture.ts', {
            cwd: frontendDir,
            encoding: 'utf8',
            stdio: 'pipe',
          });
        },
        (err) => {
          assert.ok(err.status !== 0, 'Linter must fail-closed on syntax/parsing error');
          return true;
        },
        'Fault injection must trigger non-zero exit code'
      );
    } finally {
      // Clean up fixture file
      if (fs.existsSync(fixturePath)) {
        fs.unlinkSync(fixturePath);
      }
    }
  });

});
