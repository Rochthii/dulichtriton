import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const validatorModulePath = path.join(REPO_ROOT, 'scripts', 'validate_canonical_dataset.mjs');

test('P03-018: Positive control - All 15 canonical communes in TRI_TON_15_COMMUNES pass validation', async () => {
  assert.ok(fs.existsSync(validatorModulePath), 'validate_canonical_dataset.mjs must exist');
  const { validateCommuneGlossary, TRI_TON_15_COMMUNES } = await import(`file://${validatorModulePath}`);

  assert.equal(TRI_TON_15_COMMUNES.length, 15, 'Must contain exactly 15 Tri Ton administrative units');

  for (const commune of TRI_TON_15_COMMUNES) {
    const res = validateCommuneGlossary(commune);
    assert.equal(res.valid, true, `Commune "${commune}" must be valid`);
    assert.equal(res.canonical_commune, commune);
    assert.equal(res.suggested_commune, null);
    assert.equal(res.error_code, null);
    assert.equal(res.errors.length, 0);
  }
});

test('P03-018: Positive control - Production canonical dataset places have 100% compliant commune labels', async () => {
  const { validateCommuneGlossary } = await import(`file://${validatorModulePath}`);

  const placesDir = path.join(REPO_ROOT, 'data', 'canonical', 'places');
  assert.ok(fs.existsSync(placesDir), 'data/canonical/places directory must exist');

  const files = fs.readdirSync(placesDir).filter(f => f.endsWith('.json'));
  assert.ok(files.length >= 1, 'Must contain at least 1 verified canonical place');

  for (const file of files) {
    const place = JSON.parse(fs.readFileSync(path.join(placesDir, file), 'utf8'));
    assert.ok(place.commune, `Place in ${file} must have commune property`);

    const res = validateCommuneGlossary(place.commune);
    assert.equal(res.valid, true, `Place "${place.canonical_id}" commune "${place.commune}" must be valid in glossary`);
    assert.equal(res.errors.length, 0);
  }
});

test('P03-018: Negative Fixture - Known typo (Xã Lương Cương) fails closed with suggestion Xã Lương Phi', async () => {
  const { validateCommuneGlossary } = await import(`file://${validatorModulePath}`);

  // Historical typo from Row 120 of Master CSV resolved in P03-006 / CRQ-086
  const res = validateCommuneGlossary('Xã Lương Cương');
  assert.equal(res.valid, false);
  assert.equal(res.error_code, 'INVALID_COMMUNE_GLOSSARY');
  assert.equal(res.suggested_commune, 'Xã Lương Phi');
  assert.ok(res.errors.some(e => e.includes('[INVALID_COMMUNE_GLOSSARY]') && e.includes('Did you mean "Xã Lương Phi"?')));
});

test('P03-018: Negative Fixture - Short/bare commune name without administrative prefix fails closed with suggestion', async () => {
  const { validateCommuneGlossary } = await import(`file://${validatorModulePath}`);

  const bareNames = [
    { input: 'Tri Tôn', expected: 'Thị trấn Tri Tôn' },
    { input: 'Ba Chúc', expected: 'Thị trấn Ba Chúc' },
    { input: 'Cô Tô', expected: 'Xã Cô Tô' },
    { input: 'Núi Tô', expected: 'Xã Núi Tô' },
    { input: 'Ô Lâm', expected: 'Xã Ô Lâm' },
    { input: 'An Tức', expected: 'Xã An Tức' },
    { input: 'Lương Phi', expected: 'Xã Lương Phi' }
  ];

  for (const { input, expected } of bareNames) {
    const res = validateCommuneGlossary(input);
    assert.equal(res.valid, false, `Bare commune "${input}" must fail validation`);
    assert.equal(res.error_code, 'INVALID_COMMUNE_GLOSSARY');
    assert.equal(res.suggested_commune, expected, `Suggestion for "${input}" must be "${expected}"`);
    assert.ok(res.errors.some(e => e.includes('Short name detected without administrative prefix')));
  }
});

test('P03-018: Negative Fixture - External communes from other districts/provinces strictly rejected', async () => {
  const { validateCommuneGlossary } = await import(`file://${validatorModulePath}`);

  const externalCommunes = [
    'Xã Vĩnh Tế',       // TP. Châu Đốc
    'Phường Núi Sam',   // TP. Châu Đốc
    'Phường Mỹ Bình',   // TP. Long Xuyên
    'Xã Vọng Thê',      // Huyện Thoại Sơn
    'Quận Ninh Kiều',   // TP. Cần Thơ
    'Phường Bến Nghé'   // TP. Hồ Chí Minh
  ];

  for (const external of externalCommunes) {
    const res = validateCommuneGlossary(external);
    assert.equal(res.valid, false, `External commune "${external}" must be rejected`);
    assert.equal(res.error_code, 'INVALID_COMMUNE_GLOSSARY');
    assert.ok(res.errors.some(e => e.includes('[INVALID_COMMUNE_GLOSSARY]') && e.includes('Invalid commune')));
  }
});

test('P03-018: Negative Fixture - Non-string, null, undefined, and empty commune labels fail closed', async () => {
  const { validateCommuneGlossary } = await import(`file://${validatorModulePath}`);

  const invalidInputs = [null, undefined, '', '   ', 12345, true, false, {}, []];

  for (const input of invalidInputs) {
    const res = validateCommuneGlossary(input);
    assert.equal(res.valid, false, `Invalid input "${JSON.stringify(input)}" must fail validation`);
    assert.equal(res.error_code, 'INVALID_COMMUNE_TYPE');
    assert.ok(res.errors.some(e => e.includes('commune must be a non-empty string')));
  }
});

test('P03-018: Full Dataset & Manifest Integration - 0% non-glossary commune labels across all records', async () => {
  const { validateCanonicalDataset, TRI_TON_15_COMMUNES } = await import(`file://${validatorModulePath}`);

  const summary = validateCanonicalDataset();
  assert.equal(summary.valid, true, `Validation failed: ${JSON.stringify(summary, null, 2)}`);
  assert.equal(summary.totalErrors, 0);

  // Check manifest directly
  const manifestPath = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'canonical_manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const p of manifest.places) {
    assert.ok(
      TRI_TON_15_COMMUNES.includes(p.commune),
      `Manifest place "${p.canonical_id}" has non-glossary commune "${p.commune}"`
    );
  }
});
