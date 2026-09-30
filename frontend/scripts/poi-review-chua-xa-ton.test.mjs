import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const TRI_TON_15_COMMUNES = [
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã Châu Lăng',
  'Xã Lương Phi',
  'Xã Vĩnh Phước',
  'Xã Lương An Trà',
  'Xã Lạc Quới',
  'Xã Lê Trì',
  'Xã Ô Lâm',
  'Xã An Tức',
  'Xã Cô Tô',
  'Xã Tân Tuyến',
  'Xã Tà Đảnh',
  'Xã Vĩnh Gia',
  'Xã Núi Tô'
];

test('POI_REVIEW_CHUA_XA_TON: Atomic review file integrity and full schema compliance', () => {
  const reviewFilePath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'poi-reviews', 'PVR-CHUA-XA-TON.json');
  assert.ok(fs.existsSync(reviewFilePath), 'PVR-CHUA-XA-TON.json must exist');

  const content = fs.readFileSync(reviewFilePath, 'utf8');
  const review = JSON.parse(content);

  // 1. review_id
  assert.equal(review.review_id, 'PVR-CHUA-XA-TON-2026');

  // 2. target_poi
  assert.ok(review.target_poi, 'Must contain target_poi');
  assert.equal(review.target_poi.canonical_id, 'chua-xa-ton');
  assert.equal(review.target_poi.canonical_name, 'Chùa Xà Tón (Wat Xvayton)');
  assert.equal(review.target_poi.commune, 'Thị trấn Tri Tôn');
  assert.ok(TRI_TON_15_COMMUNES.includes(review.target_poi.commune), 'Commune must match RULE 02');

  assert.ok(review.target_poi.coordinates.latitude >= 10.30 && review.target_poi.coordinates.latitude <= 10.55,
    'Latitude must be inside Tri Ton BBOX');
  assert.ok(review.target_poi.coordinates.longitude >= 104.80 && review.target_poi.coordinates.longitude <= 105.15,
    'Longitude must be inside Tri Ton BBOX');
  assert.equal(review.target_poi.category, 'culture');
  assert.equal(review.target_poi.cross_border_flag, 'NONE');

  // 3. source (Mandatory Pillar 1)
  assert.ok(review.source, 'Must contain source pillar');
  assert.equal(review.source.type, 'GOVERNMENT_DECISION');
  assert.match(review.source.title, /Di tích Kiến trúc Nghệ thuật/i);
  assert.match(review.source.issuing_authority, /Bộ Văn hóa/i);
  assert.match(review.source.source_url, /^https:\/\//i);

  // 4. evidence (Mandatory Pillar 2)
  assert.ok(review.evidence, 'Must contain evidence pillar');
  assert.match(review.evidence.reference_number, /224\/QĐ-BVHTT/);
  assert.equal(review.evidence.legal_classification, 'NATIONAL_HERITAGE');
  assert.equal(review.evidence.gps_audit_status, 'AUDITED_IN_BOUNDS');
  assert.ok(Array.isArray(review.evidence.photos_evidence) && review.evidence.photos_evidence.length >= 3,
    'Must have at least 3 verified photos');
  for (const photo of review.evidence.photos_evidence) {
    assert.match(photo.url, /^https:\/\/res\.cloudinary\.com/);
    assert.equal(photo.verified, true);
  }
  assert.match(review.evidence.field_notes, /Kinh lá buông Satra/i);
  assert.match(review.evidence.field_notes, /VietKings/i);

  // 5. reviewer (Mandatory Pillar 3)
  assert.ok(review.reviewer, 'Must contain reviewer pillar');
  assert.equal(review.reviewer.name, 'Chăm Rốch Thi');
  assert.match(review.reviewer.role, /Nhà nghiên cứu/i);
  assert.match(review.reviewer.signature_hash, /^[0-9a-f]{64}$/);

  // 6. lifecycle & expiry (Mandatory Pillar 4)
  assert.ok(review.lifecycle, 'Must contain lifecycle pillar');
  assert.equal(review.lifecycle.verification_status, 'VERIFIED');
  assert.equal(review.lifecycle.freshness_cycle_days, 365);

  const verifiedTime = Date.parse(review.lifecycle.verified_at);
  const expiresTime = Date.parse(review.lifecycle.expires_at);
  assert.ok(!isNaN(verifiedTime), 'verified_at must be valid ISO 8601');
  assert.ok(!isNaN(expiresTime), 'expires_at must be valid ISO 8601');
  assert.ok(expiresTime > verifiedTime, 'expires_at must be after verified_at');

  // 7. field_level_provenance
  assert.ok(review.field_level_provenance, 'Must contain field_level_provenance');
  assert.equal(review.field_level_provenance.name_verified, true);
  assert.equal(review.field_level_provenance.coordinates_verified, true);
  assert.equal(review.field_level_provenance.commune_verified, true);
  assert.equal(review.field_level_provenance.category_verified, true);
  assert.equal(review.field_level_provenance.phone_verified, false);
  assert.equal(review.field_level_provenance.cultural_claims_verified, true);
});

test('POI_REVIEW_CHUA_XA_TON: Concordance and Review Queue alignment', () => {
  const queuePath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'POI_CONFLICT_REVIEW_QUEUE.json');
  assert.ok(fs.existsSync(queuePath), 'POI_CONFLICT_REVIEW_QUEUE.json must exist');

  const content = fs.readFileSync(queuePath, 'utf8');
  const tickets = JSON.parse(content);
  const ticket001 = tickets.find(t => t.ticket_id === 'CRQ-001');

  assert.ok(ticket001, 'CRQ-001 must exist in review queue');
  assert.equal(ticket001.ticket_status, 'RESOLVED');
  assert.equal(ticket001.canonical_slug_final, 'chua-xa-ton');
  assert.equal(ticket001.decision, 'STANDARDIZE_AND_MERGE');
});
