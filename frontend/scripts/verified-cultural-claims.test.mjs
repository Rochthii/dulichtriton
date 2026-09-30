import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

test('VERIFIED_CULTURAL_CLAIMS: JSON schema and data integrity', () => {
  const jsonPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'VERIFIED_CULTURAL_CLAIMS.json');
  assert.ok(fs.existsSync(jsonPath), 'VERIFIED_CULTURAL_CLAIMS.json must exist');

  const content = fs.readFileSync(jsonPath, 'utf8');
  const claims = JSON.parse(content);
  assert.ok(Array.isArray(claims), 'Claims must be an array');
  assert.ok(claims.length >= 3, 'Must contain at least 3 verified cultural claims');

  const claimIds = new Set();
  for (const claim of claims) {
    assert.match(claim.claim_id, /^CUL-CLAIM-\d{3}$/, `Invalid claim_id format: ${claim.claim_id}`);
    assert.ok(!claimIds.has(claim.claim_id), `Duplicate claim_id: ${claim.claim_id}`);
    claimIds.add(claim.claim_id);

    assert.ok(claim.canonical_name && claim.canonical_name.length > 0, `Missing canonical_name in ${claim.claim_id}`);
    assert.ok(claim.geographic_origin && claim.geographic_origin.region, `Missing geographic_origin in ${claim.claim_id}`);
    assert.ok(Array.isArray(claim.prohibited_misconceptions) && claim.prohibited_misconceptions.length >= 2, 
      `Must specify at least 2 prohibited misconceptions in ${claim.claim_id}`);
    
    assert.ok(claim.verification_source, `Missing verification_source in ${claim.claim_id}`);
    assert.ok(claim.verification_source.issuing_authority, `Missing issuing_authority in ${claim.claim_id}`);
    assert.ok(claim.verification_source.citation_title, `Missing citation_title in ${claim.claim_id}`);

    assert.equal(claim.verification_status, 'VERIFIED', `Status must be VERIFIED in ${claim.claim_id}`);
    assert.equal(claim.verified_by, 'Chăm Rốch Thi', `Reviewer must be Chăm Rốch Thi in ${claim.claim_id}`);
    assert.ok(!isNaN(Date.parse(claim.verified_at)), `Invalid verified_at timestamp in ${claim.claim_id}`);
  }

  // Check CUL-CLAIM-001: Trái Trúc Bảy Núi
  const trucClaim = claims.find(c => c.claim_id === 'CUL-CLAIM-001');
  assert.ok(trucClaim, 'Must contain CUL-CLAIM-001');
  assert.equal(trucClaim.scientific_name, 'Citrus hystrix');
  assert.match(trucClaim.khmer_name, /Krut/i);
  assert.match(trucClaim.botanical_and_sensory_traits.leaf_shape, /số 8/i);

  // Check CUL-CLAIM-002: Gà Đốt Ô Thum
  const gaDotClaim = claims.find(c => c.claim_id === 'CUL-CLAIM-002');
  assert.ok(gaDotClaim, 'Must contain CUL-CLAIM-002');
  assert.match(gaDotClaim.cooking_technique.vessel, /thố đất|nồi gang/i);
  assert.match(gaDotClaim.cooking_technique.base_bed, /muối hột/i);
  assert.match(gaDotClaim.cooking_technique.base_bed, /sả cây/i);

  // Check CUL-CLAIM-003: Bún Cá Củ Ngải
  const bunCaClaim = claims.find(c => c.claim_id === 'CUL-CLAIM-003');
  assert.ok(bunCaClaim, 'Must contain CUL-CLAIM-003');
  assert.match(bunCaClaim.canonical_name, /Bún Cá Củ Ngải/i);
  const misconceptions = bunCaClaim.prohibited_misconceptions.join(' ');
  assert.match(misconceptions, /KHÔNG CÓ BÚN NƯỚC LÈO/i);
  assert.match(misconceptions, /KHÔNG NẤU MẮM/i);
});

test('VERIFIED_CULTURAL_CLAIMS: Markdown spec file exists and documents all claims', () => {
  const mdPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'VERIFIED_CULTURAL_CLAIMS.md');
  assert.ok(fs.existsSync(mdPath), 'VERIFIED_CULTURAL_CLAIMS.md must exist');

  const content = fs.readFileSync(mdPath, 'utf8');
  assert.match(content, /CULTURAL-CLAIM-CONTRACT-001/);
  assert.match(content, /CUL-CLAIM-001/);
  assert.match(content, /CUL-CLAIM-002/);
  assert.match(content, /CUL-CLAIM-003/);
  assert.match(content, /Chăm Rốch Thi/);
  assert.match(content, /Citrus hystrix/);
  assert.match(content, /Gà Đốt Lá Chúc Ô Thum/);
  assert.match(content, /Bún Cá Củ Ngải/);
  assert.match(content, /TUYỆT ĐỐI KHÔNG CÓ BÚN NƯỚC LÈO/);
});

test('KNOWLEDGE_BASE_SEED: Must strictly comply with RULE 05 without cultural drift', () => {
  const seedPath = path.join(REPO_ROOT, 'scripts', 'seed_knowledge_base.py');
  assert.ok(fs.existsSync(seedPath), 'seed_knowledge_base.py must exist');

  const content = fs.readFileSync(seedPath, 'utf8');

  // Verify KB004 has authentic Trái Trúc and Gà Đốt Ô Thum
  assert.match(content, /Citrus hystrix — Krut/i);
  assert.match(content, /Lá hình số 8 đặc trưng/i);
  assert.match(content, /Kỹ thuật đốt thố đất lót muối hột/i);

  // Verify KB011 does NOT contain corrupted bún nước lèo with mắm
  assert.doesNotMatch(content, /Bún Nước Lèo Cá Lóc Khmer/i, 'Must not claim Tri Ton has bun nuoc leo');
  assert.doesNotMatch(content, /thơm mùi mắm bồ hóc đặc trưng/i, 'Must not claim bun ca Tri Ton is cooked with mam bo hoc');

  // Verify KB011 uses authentic Bun Ca Cu Ngai
  assert.match(content, /Bún Cá Củ Ngải Khmer Bản Địa/i);
  assert.match(content, /Tuyệt Đối Không Có Bún Nước Lèo Mắm/i);
  assert.match(content, /củ ngải bún/i);
});

test('DATA_SANITIZER: Menu signature must reflect thố đất lót muối hột and Bún Cá Củ Ngải', () => {
  const sanitizerPath = path.join(REPO_ROOT, 'frontend', 'src', 'lib', 'dataSanitizer.ts');
  assert.ok(fs.existsSync(sanitizerPath), 'dataSanitizer.ts must exist');

  const content = fs.readFileSync(sanitizerPath, 'utf8');

  assert.match(content, /đốt thố đất lót muối hột sả cây 35-45p/i);
  assert.match(content, /Bún Cá Củ Ngải Châu Lăng/i);
});
