import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const workflowPath = path.join(root, '.github', 'workflows', 'ci.yml');
const frontendPackagePath = path.join(root, 'frontend', 'package.json');
const frontendLockPath = path.join(root, 'frontend', 'package-lock.json');
const manifestPath = path.join(root, 'data', 'canonical', 'canonical_manifest.json');

test('CI workflow file exists and passes strict YAML structure validation', () => {
  assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci.yml must exist');
  const content = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(content.length > 50, 'Workflow file must not be empty');

  // Verify YAML syntax via Python pyyaml
  const pyCheck = `python -c "import yaml; data = yaml.safe_load(open(r'${workflowPath.replace(/\\/g, '/')}', encoding='utf-8')); assert 'jobs' in data; assert 'build' in data['jobs']"`;
  assert.doesNotThrow(() => {
    execSync(pyCheck, { stdio: 'pipe' });
  }, 'YAML file must be strictly valid YAML parseable by safe_load');
});

test('CI workflow defines push and pull_request triggers on main branch', () => {
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Must trigger on push to main
  assert.match(content, /push:\s*\n\s*branches:\s*\[main\]|push:\s*\n\s*branches:\s*\n\s*-\s*main/);
  // Must trigger on pull_request to main
  assert.match(content, /pull_request:\s*\n\s*branches:\s*\[main\]|pull_request:\s*\n\s*branches:\s*\n\s*-\s*main/);
});

test('CI build job defines clean checkout, node setup, and build steps on ubuntu-latest', () => {
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Job runs on ubuntu-latest
  assert.match(content, /runs-on:\s*ubuntu-latest/);

  // Uses clean checkout
  assert.match(content, /uses:\s*actions\/checkout@v4/);

  // Sets up Node.js with caching
  assert.match(content, /uses:\s*actions\/setup-node@v4/);
  assert.match(content, /node-version:\s*20/);
  assert.match(content, /cache:\s*['"]?npm['"]?/);
  assert.match(content, /cache-dependency-path:\s*frontend\/package-lock\.json/);

  // Installs dependencies via npm ci
  assert.match(content, /npm\s+--prefix\s+frontend\s+ci/);

  // Executes build
  assert.match(content, /npm\s+--prefix\s+frontend\s+run\s+build/);
});

test('clean checkout dependencies and canonical manifest contract are satisfied', () => {
  assert.ok(fs.existsSync(frontendPackagePath), 'frontend/package.json must exist');
  assert.ok(fs.existsSync(frontendLockPath), 'frontend/package-lock.json must exist');
  assert.ok(fs.existsSync(manifestPath), 'data/canonical/canonical_manifest.json must exist');

  const pkg = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  const lock = JSON.parse(fs.readFileSync(frontendLockPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.equal(pkg.name, 'frontend');
  assert.equal(lock.name, 'frontend');
  assert.ok(Array.isArray(manifest.places), 'Manifest places must be an array');
  assert.ok(manifest.places.length > 0, 'Manifest must contain canonical places');
  assert.ok(pkg.scripts?.build, 'frontend package.json must define a build script');
  assert.ok(pkg.scripts?.prebuild, 'frontend package.json must define a prebuild script');
});

test('static data generator generates canonical artifact on clean environment', () => {
  const generatorScript = path.join(root, 'scripts', 'generate_static_frontend_places.mjs');
  assert.ok(fs.existsSync(generatorScript), 'generate_static_frontend_places.mjs must exist');

  const genResult = execSync(`node "${generatorScript}"`, { cwd: root, encoding: 'utf8' });
  assert.match(genResult, /Generated static frontend places artifact/);

  const outputPath = path.join(root, 'frontend', 'src', 'data', 'places.canonical.json');
  assert.ok(fs.existsSync(outputPath), 'places.canonical.json must exist after generator execution');
  const outputData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  assert.ok(Array.isArray(outputData.places), 'Generated places artifact places field must be an array');
  assert.ok(outputData.total_count > 0, 'Generated places artifact total_count must be greater than 0');
  assert.ok(outputData.source_manifest, 'Artifact must include source_manifest metadata');
});

test('clean checkout build output produces valid Next.js build artifacts', () => {
  const nextDir = path.join(root, 'frontend', '.next');
  const buildIdPath = path.join(nextDir, 'BUILD_ID');
  const routesManifestPath = path.join(nextDir, 'routes-manifest.json');

  assert.ok(fs.existsSync(buildIdPath), 'Next.js BUILD_ID must exist after production build');
  assert.ok(fs.existsSync(routesManifestPath), 'routes-manifest.json must exist after production build');

  const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
  assert.ok(buildId.length > 0, 'BUILD_ID must not be empty');

  const routesManifest = JSON.parse(fs.readFileSync(routesManifestPath, 'utf8'));
  assert.ok(Array.isArray(routesManifest.staticRoutes), 'staticRoutes must be an array');
  assert.ok(routesManifest.staticRoutes.length > 0, 'staticRoutes must contain pre-rendered routes');
});
