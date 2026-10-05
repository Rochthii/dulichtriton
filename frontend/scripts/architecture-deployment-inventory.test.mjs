import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

test('Test 1: Deployment Path Inventory Specification Integrity', () => {
  const jsonPath = path.join(projectRoot, 'docs', 'technical-spec', 'DEPLOYMENT_PATH_INVENTORY.json');
  const mdPath = path.join(projectRoot, 'docs', 'technical-spec', 'DEPLOYMENT_PATH_INVENTORY.md');

  assert.ok(fs.existsSync(jsonPath), 'DEPLOYMENT_PATH_INVENTORY.json must exist');
  assert.ok(fs.existsSync(mdPath), 'DEPLOYMENT_PATH_INVENTORY.md must exist');

  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const inventory = JSON.parse(rawJson);

  assert.equal(inventory.schema_version, '1.0.0', 'Schema version must be 1.0.0');
  assert.ok(inventory.runtime_components, 'Runtime components must be specified');
  assert.ok(inventory.runtime_components.frontend_and_api, 'Frontend & API component must exist');
  assert.ok(inventory.runtime_components.database, 'Database component must exist');
  assert.ok(inventory.runtime_components.ai_engine, 'AI engine component must exist');
  assert.ok(inventory.runtime_components.media_storage, 'Media storage component must exist');
  assert.ok(inventory.runtime_components.python_tooling, 'Python tooling component must exist');

  // Verify component invariants
  const frontend = inventory.runtime_components.frontend_and_api;
  assert.match(frontend.framework, /Next\.js 16/i, 'Framework must be Next.js 16');
  assert.equal(frontend.hosting_provider, 'Vercel', 'Hosting provider must be Vercel');
  assert.equal(frontend.production_url, 'https://dulichtriton.vercel.app', 'Production domain must match Decision Record G0');

  const pythonTooling = inventory.runtime_components.python_tooling;
  assert.equal(pythonTooling.deployed_to_production, false, 'Python tooling must NOT be deployed to production');
  assert.equal(pythonTooling.deployment_status, 'legacy_and_offline_tooling');

  assert.ok(Array.isArray(inventory.route_inventory), 'route_inventory must be an array');
  assert.equal(inventory.route_inventory.length, 65, 'Must contain exactly 65 distinct physical route files');
});

test('Test 2: System Architecture Document Alignment and Obsolete Claim Elimination', () => {
  const archDocPath = path.join(projectRoot, 'docs', '02_System_Architecture.md');
  assert.ok(fs.existsSync(archDocPath), '02_System_Architecture.md must exist');

  const content = fs.readFileSync(archDocPath, 'utf8');

  // Must reference deployment inventory and decision record G0
  assert.match(content, /DEPLOYMENT_PATH_INVENTORY\.md/, 'Must link to DEPLOYMENT_PATH_INVENTORY.md');
  assert.match(content, /DECISION_RECORD_G0\.md/, 'Must cite DECISION_RECORD_G0.md');

  // Must state Next.js 16 and Vercel runtime
  assert.match(content, /Next\.js 16/i, 'Must specify Next.js 16');
  assert.match(content, /Vercel/i, 'Must specify Vercel runtime');
  assert.match(content, /knmlbwsmfljlabhvqfid/, 'Must cite Supabase project ref');

  // Must NOT contain obsolete claims
  assert.doesNotMatch(content, /Next\.js 14/i, 'Must not claim obsolete Next.js 14');
  assert.doesNotMatch(content, /\[ BACKEND API GATEWAY \] \(FastAPI Python 3\.11\)/, 'Must not claim FastAPI Python as production gateway');
  assert.doesNotMatch(content, /tri_ton_master_cleaned\.csv - 105 spots/, 'Must not claim legacy 105 spots master data');
});

test('Test 3: 100% Physical Existence of Route Files Cited in Documentation and Inventory', () => {
  const jsonPath = path.join(projectRoot, 'docs', 'technical-spec', 'DEPLOYMENT_PATH_INVENTORY.json');
  const inventory = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const item of inventory.route_inventory) {
    const filePath = path.join(projectRoot, item.file);
    assert.ok(fs.existsSync(filePath), `Physical route file must exist: ${item.file}`);
  }

  // Also verify links extracted from 02_System_Architecture.md
  const archContent = fs.readFileSync(path.join(projectRoot, 'docs', '02_System_Architecture.md'), 'utf8');
  const linkMatches = archContent.match(/\(\.\.\/(frontend\/src\/app\/[^)]+)\)/g);
  assert.ok(linkMatches && linkMatches.length > 0, 'Must have relative route links in architecture doc');

  for (const match of linkMatches) {
    const rawPath = match.replace(/^\(\.\.\//, '').replace(/\)$/, '');
    const fullPath = path.join(projectRoot, rawPath);
    assert.ok(fs.existsSync(fullPath), `Linked file in 02_System_Architecture.md must exist on disk: ${rawPath}`);
  }
});

test('Test 4: Concordance with Real Next.js Frontend App Directory and Build Output', () => {
  const appDir = path.join(projectRoot, 'frontend', 'src', 'app');
  assert.ok(fs.existsSync(appDir), 'frontend/src/app must exist');

  function scanAppRoutes(dir) {
    let list = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        list = list.concat(scanAppRoutes(full));
      } else if (ent.name === 'page.tsx' || ent.name === 'route.ts') {
        const rel = path.relative(path.join(projectRoot, 'frontend', 'src', 'app'), full).replace(/\\/g, '/');
        list.push(rel);
      }
    }
    return list;
  }

  const diskRoutes = scanAppRoutes(appDir);
  assert.equal(diskRoutes.length, 65, 'Disk scan must yield exactly 65 route files');

  const jsonPath = path.join(projectRoot, 'docs', 'technical-spec', 'DEPLOYMENT_PATH_INVENTORY.json');
  const inventory = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const inventoryFiles = inventory.route_inventory.map(r => r.file.replace('frontend/src/app/', ''));

  for (const route of diskRoutes) {
    assert.ok(inventoryFiles.includes(route), `Inventory must contain route file: ${route}`);
  }

  // Check .next app-path-routes-manifest.json if present
  const manifestPath = path.join(projectRoot, 'frontend', '.next', 'app-path-routes-manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(manifest['/page'] === '/', 'Manifest must contain root page');
    assert.ok(manifest['/api/v1/chat/stream/route'] === '/api/v1/chat/stream', 'Manifest must contain chat stream route');
  }
});

test('Test 5: Build Configuration Invariant Verification', () => {
  const vercelJsonPath = path.join(projectRoot, 'vercel.json');
  const packageJsonPath = path.join(projectRoot, 'frontend', 'package.json');

  assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist');
  assert.ok(fs.existsSync(packageJsonPath), 'frontend/package.json must exist');

  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  const packageConfig = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  assert.equal(vercelConfig.outputDirectory, 'frontend/.next', 'Vercel outputDirectory must be frontend/.next');
  assert.match(vercelConfig.buildCommand, /cd frontend && npm install && npm run build/, 'Vercel buildCommand must build frontend');

  assert.equal(packageConfig.scripts.build, 'next build', 'frontend package.json build script must be next build');
  assert.match(packageConfig.scripts.prebuild, /generate_static_frontend_places\.mjs/, 'Prebuild script must run places generator');
});
