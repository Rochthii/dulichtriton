import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

test('P03-007 Verified Emergency Hotlines Contract Suite', async (t) => {

  await t.test('1. JSON artifact VERIFIED_EMERGENCY_HOTLINES.json contains required verified hotlines', () => {
    const jsonPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'VERIFIED_EMERGENCY_HOTLINES.json');
    assert.ok(fs.existsSync(jsonPath), 'Artifact JSON file must exist');

    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.ok(Array.isArray(content), 'Content must be an array of hotlines');
    assert.ok(content.length >= 2, 'Must have at least Police and Hospital hotlines');

    const police = content.find(h => h.hotline_id === 'HOTLINE-001');
    assert.ok(police, 'HOTLINE-001 must exist');
    assert.equal(police.phone, '0296 3874 113');
    assert.ok(police.owner.includes('Công an'), 'Owner must be Police authority');
    assert.ok(police.source_url.startsWith('https://'), 'source_url must be HTTPS official URL');
    assert.equal(police.verification_status, 'VERIFIED');
    assert.ok(police.verified_at, 'verified_at timestamp must exist');

    const hospital = content.find(h => h.hotline_id === 'HOTLINE-002');
    assert.ok(hospital, 'HOTLINE-002 must exist');
    assert.equal(hospital.phone, '0296 3874 115');
    assert.ok(hospital.owner.includes('Y tế'), 'Owner must be Medical authority');
    assert.equal(hospital.verification_status, 'VERIFIED');
  });

  await t.test('2. Static Code Invariant: Elimination of mock and placeholder hotlines', () => {
    const constantsPath = path.join(REPO_ROOT, 'frontend', 'src', 'lib', 'constants.ts');
    const constantsCode = fs.readFileSync(constantsPath, 'utf8');

    // Must NOT contain placeholder 0913 789 123
    assert.ok(!constantsCode.includes('0913 789 123'), 'constants.ts must not contain mock number 0913 789 123');
    // Must NOT contain 0296 3760 123
    assert.ok(!constantsCode.includes('0296 3760 123'), 'constants.ts must not contain mock number 0296 3760 123');

    // Must contain verified police and hospital numbers
    assert.ok(constantsCode.includes('0296 3874 113'), 'constants.ts must contain verified police number 0296 3874 113');
    assert.ok(constantsCode.includes('0296 3874 115'), 'constants.ts must contain verified hospital number 0296 3874 115');
  });

  await t.test('3. Offline storage contacts compliance', () => {
    const offlinePath = path.join(REPO_ROOT, 'frontend', 'src', 'lib', 'offlineStorage.ts');
    const offlineCode = fs.readFileSync(offlinePath, 'utf8');

    assert.ok(offlineCode.includes('0296.3874.113'), 'offlineStorage.ts must contain official police number');
    assert.ok(offlineCode.includes('0296.3874.115'), 'offlineStorage.ts must contain official hospital number');
  });

  await t.test('4. Documentation VERIFIED_EMERGENCY_HOTLINES.md exists with complete evidence', () => {
    const mdPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'VERIFIED_EMERGENCY_HOTLINES.md');
    assert.ok(fs.existsSync(mdPath), 'Documentation Markdown file must exist');

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    assert.ok(mdContent.includes('0296 3874 113'), 'MD must include police hotline');
    assert.ok(mdContent.includes('0296 3874 115'), 'MD must include medical hotline');
    assert.ok(mdContent.includes('https://triton.angiang.gov.vn'), 'MD must include official government source URL');
    assert.ok(mdContent.includes('RULE 01'), 'MD must cite RULE 01');
  });

});
