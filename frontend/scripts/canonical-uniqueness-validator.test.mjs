import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const validatorModulePath = path.join(REPO_ROOT, 'scripts', 'validate_canonical_dataset.mjs');

test('P03-016: Positive control - Production dataset and manifest canonical IDs are 100% unique', async () => {
  assert.ok(fs.existsSync(validatorModulePath), 'validate_canonical_dataset.mjs must exist');
  const { validateCanonicalDataset, validateCanonicalIdUniqueness } = await import(`file://${validatorModulePath}`);

  // 1. Overall dataset and manifest validation
  const summary = validateCanonicalDataset();
  assert.equal(summary.valid, true, `Dataset validation failed: ${JSON.stringify(summary, null, 2)}`);
  assert.ok(summary.uniqueness, 'Uniqueness report must be present');
  assert.equal(summary.uniqueness.valid, true, 'Disk places uniqueness must be true');
  assert.equal(summary.uniqueness.duplicates.length, 0, 'No duplicates allowed in production dataset');
  assert.ok(summary.uniqueness.unique_count >= 1, 'At least 1 unique POI must be present');

  // 2. Direct manifest check
  const manifestPath = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'canonical_manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifestPlaces = manifest.places || [];
  const manifestUniqueness = validateCanonicalIdUniqueness(manifestPlaces);
  assert.equal(manifestUniqueness.valid, true, 'Manifest places must be 100% unique');
  assert.equal(manifestUniqueness.duplicates.length, 0);
  assert.equal(manifestUniqueness.unique_count, manifestPlaces.length);
});

test('P03-016: Negative Fixture - Duplicate canonical_id in object array fails closed', async () => {
  const { validateCanonicalIdUniqueness } = await import(`file://${validatorModulePath}`);

  const duplicatePlacesFixture = [
    {
      canonical_id: 'chua-xa-ton',
      name: 'Chùa Xà Tón (Wat Xvayton)',
      commune: 'Thị trấn Tri Tôn'
    },
    {
      canonical_id: 'ho-ta-pa',
      name: 'Hồ Tà Pạ',
      commune: 'Xã Núi Tô'
    },
    {
      canonical_id: 'chua-xa-ton', // Duplicate of index 0
      name: 'Chùa Xà Tón Bản Sao Cố Ý',
      commune: 'Thị trấn Tri Tôn'
    }
  ];

  const res = validateCanonicalIdUniqueness(duplicatePlacesFixture);
  assert.equal(res.valid, false, 'Duplicate fixture must fail validation');
  assert.equal(res.duplicates.length, 1, 'Must detect exactly 1 duplicate group');
  assert.equal(res.duplicates[0].canonical_id, 'chua-xa-ton');
  assert.equal(res.duplicates[0].count, 2);
  assert.deepEqual(res.duplicates[0].indices, [0, 2]);
  assert.equal(res.duplicates[0].error_code, 'DUPLICATE_CANONICAL_ID');
  assert.ok(res.errors.some(e => e.includes('[DUPLICATE_CANONICAL_ID]')), 'Error message must contain [DUPLICATE_CANONICAL_ID]');
});

test('P03-016: Negative Fixture - Duplicate canonical_id in string list fails closed', async () => {
  const { validateCanonicalIdUniqueness } = await import(`file://${validatorModulePath}`);

  const duplicateStringList = [
    'chua-xa-ton',
    'doi-tuc-dup',
    'ho-o-thum',
    'doi-tuc-dup', // Duplicate
    'chua-ta-pa',
    'doi-tuc-dup'  // Triplicate
  ];

  const res = validateCanonicalIdUniqueness(duplicateStringList);
  assert.equal(res.valid, false, 'Duplicate string list must fail validation');
  assert.equal(res.duplicates.length, 1);
  assert.equal(res.duplicates[0].canonical_id, 'doi-tuc-dup');
  assert.equal(res.duplicates[0].count, 3);
  assert.deepEqual(res.duplicates[0].indices, [1, 3, 5]);
  assert.equal(res.duplicates[0].error_code, 'DUPLICATE_CANONICAL_ID');
});

test('P03-016: Negative Fixture - Alias colliding with canonical_id of another record fails closed', async () => {
  const { validateCanonicalIdUniqueness } = await import(`file://${validatorModulePath}`);

  const aliasCollidingFixture = [
    {
      canonical_id: 'chua-xa-ton',
      name: 'Chùa Xà Tón',
      alt_names: ['Wat Xvayton', 'Chùa Svayton']
    },
    {
      canonical_id: 'chua-ta-pa',
      name: 'Chùa Tà Pạ',
      // Collision: declaring 'chua-xa-ton' as an alias
      alt_names: ['Chùa Núi Tri Tôn', 'chua-xa-ton']
    }
  ];

  const res = validateCanonicalIdUniqueness(aliasCollidingFixture, { checkAliases: true });
  assert.equal(res.valid, false, 'Alias collision must fail validation');
  assert.ok(res.errors.some(e => e.includes('[DUPLICATE_CANONICAL_ID] Collision: Alias "chua-xa-ton"')));
  assert.ok(res.duplicates.some(d => d.error_code === 'DUPLICATE_CANONICAL_ID' && d.colliding_alias === 'chua-xa-ton'));
});

test('P03-016: Negative Fixture - Cross-record duplicate alias collision fails closed', async () => {
  const { validateCanonicalIdUniqueness } = await import(`file://${validatorModulePath}`);

  const duplicateAliasFixture = [
    {
      canonical_id: 'chua-xa-ton',
      name: 'Chùa Xà Tón',
      alt_names: ['Chùa Cổ Bảy Núi']
    },
    {
      canonical_id: 'chua-hang',
      name: 'Chùa Hang',
      alt_names: ['Chùa Cổ Bảy Núi'] // Duplicate alias
    }
  ];

  const res = validateCanonicalIdUniqueness(duplicateAliasFixture, { checkAliases: true });
  assert.equal(res.valid, false, 'Shared identical alias across records must fail validation');
  assert.ok(res.errors.some(e => e.includes('[DUPLICATE_CANONICAL_ID] Alias collision: Alias "Chùa Cổ Bảy Núi"')));
});

test('P03-016: Negative Fixture - File name mismatch against canonical_id fails closed', async () => {
  const { validateCanonicalDataset } = await import(`file://${validatorModulePath}`);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triton-test-mismatch-'));
  try {
    const validChuaXaTon = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'data', 'canonical', 'places', 'chua-xa-ton.json'), 'utf8')
    );

    // Save with deliberately mismatched filename: 'wat-xvayton-wrong-slug.json'
    fs.writeFileSync(path.join(tempDir, 'wat-xvayton-wrong-slug.json'), JSON.stringify(validChuaXaTon, null, 2), 'utf8');

    const res = validateCanonicalDataset(tempDir, null, { checkDiskReview: true, repoRoot: REPO_ROOT });
    assert.equal(res.valid, false, 'Mismatched file name must fail validation');
    assert.ok(res.results.some(r => r.errors.some(e => e.includes('File name mismatch'))));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('P03-016: Negative Fixture - Duplicate canonical_id in multiple files fails closed', async () => {
  const { validateCanonicalDataset } = await import(`file://${validatorModulePath}`);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triton-test-dup-files-'));
  try {
    const validChuaXaTon = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'data', 'canonical', 'places', 'chua-xa-ton.json'), 'utf8')
    );

    // Place 1
    fs.writeFileSync(path.join(tempDir, 'chua-xa-ton.json'), JSON.stringify(validChuaXaTon, null, 2), 'utf8');

    // Place 2 with different filename but same canonical_id
    const duplicatePlace = { ...validChuaXaTon, name: 'Chùa Xà Tón Bản Sao' };
    fs.writeFileSync(path.join(tempDir, 'chua-xa-ton-clone.json'), JSON.stringify(duplicatePlace, null, 2), 'utf8');

    const res = validateCanonicalDataset(tempDir, null, { checkDiskReview: true, repoRoot: REPO_ROOT });
    assert.equal(res.valid, false, 'Directory with duplicate canonical_id records must fail validation');
    assert.equal(res.uniqueness.valid, false);
    assert.ok(res.uniqueness.errors.some(e => e.includes('[DUPLICATE_CANONICAL_ID]')));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('P03-016: Negative Fixture - Manifest concordance discrepancy fails closed', async () => {
  const { validateCanonicalDataset } = await import(`file://${validatorModulePath}`);

  const tempManifestFile = path.join(os.tmpdir(), `manifest-concordance-test-${Date.now()}.json`);
  try {
    // Deliberately declare a POI that does not exist on disk
    const fakeManifest = {
      manifest_name: 'Test Manifest',
      manifest_version: '1.0.0',
      places: [
        {
          canonical_id: 'dia-diem-ma-khong-ton-tai-tren-dia'
        }
      ]
    };
    fs.writeFileSync(tempManifestFile, JSON.stringify(fakeManifest, null, 2), 'utf8');

    const res = validateCanonicalDataset(path.join(REPO_ROOT, 'data', 'canonical', 'places'), tempManifestFile, {
      checkDiskReview: true,
      repoRoot: REPO_ROOT
    });

    assert.equal(res.valid, false, 'Manifest discrepancy must fail validation');
    assert.ok(res.manifestValidation);
    assert.equal(res.manifestValidation.valid, false);
    assert.ok(res.manifestValidation.errors.some(e => e.includes('Concordance discrepancy')));
  } finally {
    if (fs.existsSync(tempManifestFile)) {
      fs.unlinkSync(tempManifestFile);
    }
  }
});
