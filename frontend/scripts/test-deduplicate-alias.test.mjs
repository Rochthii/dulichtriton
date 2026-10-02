/**
 * frontend/scripts/test-deduplicate-alias.test.mjs
 * 
 * Automated Verification Suite for P05-011:
 * "Thêm regression test cho alias Hồ Tà Pạ (Proof: deduplicate test pass)"
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

test('P05-011 Assertion 1: tests/test_deduplicate.py executes and passes 100% (4/4 tests)', () => {
  const pyTest = spawnSync('pytest', ['-p', 'no:cacheprovider', 'tests/test_deduplicate.py'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  assert.equal(
    pyTest.status,
    0,
    `tests/test_deduplicate.py must exit with code 0. Stderr: ${pyTest.stderr}\nStdout: ${pyTest.stdout}`
  );
  assert.ok(
    pyTest.stdout.includes('4 passed'),
    'All 4 tests in test_deduplicate.py must pass successfully'
  );
});

test('P05-011 Assertion 2: Full pytest test suite passes with zero failures (13/13 tests)', () => {
  const pyAll = spawnSync('pytest', ['-p', 'no:cacheprovider', 'tests'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  assert.equal(
    pyAll.status,
    0,
    `Full pytest suite must exit with code 0. Stderr: ${pyAll.stderr}\nStdout: ${pyAll.stdout}`
  );
  assert.ok(
    pyAll.stdout.includes('13 passed'),
    'Full pytest suite must pass all 13 tests cleanly'
  );
});

test('P05-011 Assertion 3: Deduplication runtime alias matching accuracy for Ho Ta Pa', () => {
  const pyDedupe = spawnSync(
    'python',
    ['-c', `
from tourism_crawler.deduplicate.similarity import is_duplicate, matches_known_alias

rec_canonical = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
rec_alias1 = {"name": "Hồ Tà Pạ Tuyệt Tình Cốc", "latitude": 10.4217, "longitude": 105.0119}
rec_alias2 = {"name": "Tuyệt Tình Cốc An Giang", "latitude": 10.4218, "longitude": 105.0120}
rec_alias3 = {"name": "Tuyệt Tình Cốc Tà Pạ", "latitude": 10.4215, "longitude": 105.0117}

# True positives: All variations must be recognized as duplicates
assert is_duplicate(rec_canonical, rec_alias1) is True, "Hồ Tà Pạ Tuyệt Tình Cốc must match"
assert is_duplicate(rec_canonical, rec_alias2) is True, "Tuyệt Tình Cốc An Giang must match"
assert is_duplicate(rec_canonical, rec_alias3) is True, "Tuyệt Tình Cốc Tà Pạ must match"

print("HO_TA_PA_ALIASES_VERIFIED")
`],
    {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    }
  );

  assert.equal(
    pyDedupe.status,
    0,
    `Runtime deduplication check must exit with code 0. Stderr: ${pyDedupe.stderr}`
  );
  assert.ok(
    pyDedupe.stdout.includes('HO_TA_PA_ALIASES_VERIFIED'),
    'All Ho Ta Pa alias variations must resolve to duplicates'
  );
});

test('P05-011 Assertion 4: Negative controls - distinct physical attractions are not falsely merged', () => {
  const pyNegative = spawnSync(
    'python',
    ['-c', `
from tourism_crawler.deduplicate.similarity import is_duplicate

rec_lake = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
rec_pagoda = {"name": "Chùa Tà Pạ", "latitude": 10.4230, "longitude": 105.0145}
rec_distant = {"name": "Hồ Soài So", "latitude": 10.3800, "longitude": 104.9800}

# Negative controls: Distinct entities must NEVER be marked as duplicate
assert is_duplicate(rec_lake, rec_pagoda) is False, "Chùa Tà Pạ must NOT be merged with Hồ Tà Pạ"
assert is_duplicate(rec_lake, rec_distant) is False, "Hồ Soài So must NOT be merged with Hồ Tà Pạ"

print("NEGATIVE_CONTROLS_VERIFIED")
`],
    {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    }
  );

  assert.equal(
    pyNegative.status,
    0,
    `Negative control check must exit with code 0. Stderr: ${pyNegative.stderr}`
  );
  assert.ok(
    pyNegative.stdout.includes('NEGATIVE_CONTROLS_VERIFIED'),
    'Negative controls must successfully keep distinct attractions separate'
  );
});

test('P05-011 Assertion 5: Static code invariant - KNOWN_ALIASES registry and canonical landmarks', () => {
  const simPath = path.join(REPO_ROOT, 'tourism_crawler', 'deduplicate', 'similarity.py');
  const content = fs.readFileSync(simPath, 'utf-8');

  assert.ok(content.includes('KNOWN_ALIASES:'), 'similarity.py must define KNOWN_ALIASES registry');
  assert.ok(content.includes('"ho_ta_pa":'), 'KNOWN_ALIASES must register ho_ta_pa landmark group');
  assert.ok(content.includes('tuyệt tình cốc'), 'KNOWN_ALIASES must include "tuyệt tình cốc" alias for Ho Ta Pa');
  assert.ok(content.includes('def matches_known_alias('), 'similarity.py must provide matches_known_alias helper');
});
