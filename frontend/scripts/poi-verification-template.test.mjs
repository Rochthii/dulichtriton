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

/**
 * Pure validator function adhering to POI_VERIFICATION_REVIEW_TEMPLATE specifications.
 */
function validatePoiVerificationRecord(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'] };
  }

  // 1. review_id
  if (!record.review_id || !/^PVR-[A-Z0-9_-]+$/.test(record.review_id)) {
    errors.push('Invalid or missing review_id (must match ^PVR-[A-Z0-9_-]+$)');
  }

  // 2. target_poi
  if (!record.target_poi) {
    errors.push('Missing target_poi');
  } else {
    const { canonical_id, canonical_name, commune, coordinates, category } = record.target_poi;
    if (!canonical_id || !/^[a-z0-9-]+$/.test(canonical_id)) {
      errors.push('Invalid canonical_id (must be lowercase alphanumeric slug with hyphens)');
    }
    if (!canonical_name || canonical_name.length < 2) {
      errors.push('Missing or invalid canonical_name');
    }
    if (!commune || !TRI_TON_15_COMMUNES.includes(commune)) {
      errors.push(`Invalid commune: "${commune}". Must strictly match 15 Tri Ton communes.`);
    }
    if (!coordinates || typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
      errors.push('Missing or invalid coordinates object');
    } else {
      if (coordinates.latitude < 10.30 || coordinates.latitude > 10.55) {
        errors.push(`Latitude ${coordinates.latitude} is outside Tri Ton BBOX [10.30, 10.55]`);
      }
      if (coordinates.longitude < 104.80 || coordinates.longitude > 105.15) {
        errors.push(`Longitude ${coordinates.longitude} is outside Tri Ton BBOX [104.80, 105.15]`);
      }
    }
    if (!category || !['culture', 'nature', 'food', 'stay', 'experience', 'historical'].includes(category)) {
      errors.push(`Invalid category: "${category}"`);
    }
  }

  // 3. source (Mandatory Pillar 1)
  if (!record.source) {
    errors.push('Missing mandatory pillar: source');
  } else {
    const { type, title, issuing_authority, source_url } = record.source;
    if (!type || !['GOVERNMENT_DECISION', 'FIELD_SURVEY', 'OFFICIAL_PORTAL', 'SATELLITE_GEO', 'HERITAGE_REGISTRY'].includes(type)) {
      errors.push(`Invalid source type: "${type}"`);
    }
    if (!title || title.length < 5) errors.push('Missing or too short source title');
    if (!issuing_authority || issuing_authority.length < 3) errors.push('Missing or too short issuing_authority');
    if (!source_url || !/^https?:\/\//i.test(source_url)) errors.push('Invalid or missing source_url');
  }

  // 4. evidence (Mandatory Pillar 2)
  if (!record.evidence) {
    errors.push('Missing mandatory pillar: evidence');
  } else {
    const { reference_number, legal_classification, gps_audit_status, field_notes } = record.evidence;
    if (!reference_number) errors.push('Missing evidence reference_number');
    if (!legal_classification) errors.push('Missing evidence legal_classification');
    if (!gps_audit_status || !['AUDITED_IN_BOUNDS', 'CROSS_BORDER_CONFIRMED'].includes(gps_audit_status)) {
      errors.push(`Invalid gps_audit_status: "${gps_audit_status}"`);
    }
    if (!field_notes || field_notes.length < 10) errors.push('Missing or too short field_notes');
  }

  // 5. reviewer (Mandatory Pillar 3)
  if (!record.reviewer) {
    errors.push('Missing mandatory pillar: reviewer');
  } else {
    const { name, role, organization, signature_hash } = record.reviewer;
    if (!name || name.length < 2) errors.push('Missing reviewer name');
    if (!role || role.length < 3) errors.push('Missing reviewer role');
    if (!organization || organization.length < 3) errors.push('Missing reviewer organization');
    if (!signature_hash || !/^[0-9a-f]{64}$/.test(signature_hash)) {
      errors.push('Invalid reviewer signature_hash (must be 64-char SHA-256 hex string)');
    }
  }

  // 6. lifecycle & expiry (Mandatory Pillar 4)
  if (!record.lifecycle) {
    errors.push('Missing mandatory pillar: lifecycle (expiry)');
  } else {
    const { verification_status, verified_at, expires_at, freshness_cycle_days } = record.lifecycle;
    if (!verification_status || !['UNVERIFIED', 'IN_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'].includes(verification_status)) {
      errors.push(`Invalid verification_status: "${verification_status}"`);
    }
    const verifiedTimestamp = Date.parse(verified_at);
    if (isNaN(verifiedTimestamp)) errors.push('Invalid verified_at date-time format');

    const expiresTimestamp = Date.parse(expires_at);
    if (isNaN(expiresTimestamp)) errors.push('Invalid expires_at date-time format');

    if (!isNaN(verifiedTimestamp) && !isNaN(expiresTimestamp) && expiresTimestamp <= verifiedTimestamp) {
      errors.push('expires_at must be strictly after verified_at');
    }

    if (typeof freshness_cycle_days !== 'number' || freshness_cycle_days < 30 || freshness_cycle_days > 730) {
      errors.push('freshness_cycle_days must be between 30 and 730 days');
    }
  }

  // 7. field_level_provenance
  if (!record.field_level_provenance) {
    errors.push('Missing field_level_provenance');
  } else {
    const requiredFlags = ['name_verified', 'coordinates_verified', 'commune_verified', 'category_verified'];
    for (const flag of requiredFlags) {
      if (typeof record.field_level_provenance[flag] !== 'boolean') {
        errors.push(`Missing or non-boolean field_level_provenance flag: ${flag}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

test('POI_VERIFICATION_REVIEW_TEMPLATE: JSON Schema specification and invariants', () => {
  const schemaPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'POI_VERIFICATION_REVIEW_TEMPLATE.json');
  assert.ok(fs.existsSync(schemaPath), 'POI_VERIFICATION_REVIEW_TEMPLATE.json must exist');

  const content = fs.readFileSync(schemaPath, 'utf8');
  const schema = JSON.parse(content);

  assert.equal(schema.title, 'TritonPoiVerificationReviewTemplate');
  assert.ok(schema.required.includes('source'), 'Schema must require source');
  assert.ok(schema.required.includes('evidence'), 'Schema must require evidence');
  assert.ok(schema.required.includes('reviewer'), 'Schema must require reviewer');
  assert.ok(schema.required.includes('lifecycle'), 'Schema must require lifecycle (expiry)');

  const communeEnum = schema.properties.target_poi.properties.commune.enum;
  assert.equal(communeEnum.length, 15, 'Commune enum must contain exactly 15 communes per RULE 02');
  for (const c of TRI_TON_15_COMMUNES) {
    assert.ok(communeEnum.includes(c), `Commune enum must include ${c}`);
  }

  assert.equal(schema.properties.target_poi.properties.coordinates.properties.latitude.minimum, 10.30);
  assert.equal(schema.properties.target_poi.properties.coordinates.properties.latitude.maximum, 10.55);
  assert.equal(schema.properties.target_poi.properties.coordinates.properties.longitude.minimum, 104.80);
  assert.equal(schema.properties.target_poi.properties.coordinates.properties.longitude.maximum, 105.15);
});

test('POI_VERIFICATION_REVIEW_TEMPLATE: Markdown documentation contains full specification', () => {
  const mdPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'POI_VERIFICATION_REVIEW_TEMPLATE.md');
  assert.ok(fs.existsSync(mdPath), 'POI_VERIFICATION_REVIEW_TEMPLATE.md must exist');

  const content = fs.readFileSync(mdPath, 'utf8');
  assert.match(content, /POI-VERIFY-TEMPLATE-V1/);
  assert.match(content, /Chăm Rốch Thi/);
  assert.match(content, /`source`/);
  assert.match(content, /`evidence`/);
  assert.match(content, /`reviewer`/);
  assert.match(content, /`expiry`/);
  assert.match(content, /PVR-CHUA-XA-TON-2026/);
});

test('POI_VERIFICATION_REVIEW_TEMPLATE: Positive validation for Ground-Truth POI (Chùa Xà Tón)', () => {
  const validInstance = {
    review_id: 'PVR-CHUA-XA-TON-2026',
    target_poi: {
      canonical_id: 'chua-xa-ton',
      canonical_name: 'Chùa Xà Tón (Wat Xvayton)',
      commune: 'Thị trấn Tri Tôn',
      coordinates: {
        latitude: 10.4287,
        longitude: 104.9965
      },
      category: 'culture',
      cross_border_flag: 'NONE'
    },
    source: {
      type: 'GOVERNMENT_DECISION',
      title: 'Quyết định xếp hạng Di tích Kiến trúc Nghệ thuật cấp Quốc gia',
      issuing_authority: 'Bộ Văn hóa Thông tin (nay là Bộ VHTT&DL)',
      source_url: 'https://triton.angiang.gov.vn'
    },
    evidence: {
      reference_number: 'Quyết định số 224/QĐ-BVHTT ngày 12/12/1986',
      legal_classification: 'NATIONAL_HERITAGE',
      gps_audit_status: 'AUDITED_IN_BOUNDS',
      photos_evidence: [
        {
          url: 'https://images.dulichtriton.vn/places/chua-xa-ton-chanh-dien.jpg',
          caption: 'Chánh điện cổ kính Chùa Xà Tón',
          verified: true
        }
      ],
      field_notes: 'Ngôi chùa Khmer cổ nhất tỉnh An Giang (>300 năm tuổi), lưu giữ nhiều bộ Kinh lá buông Satra nhất Việt Nam.'
    },
    reviewer: {
      name: 'Chăm Rốch Thi',
      role: 'Nhà nghiên cứu Văn hóa & Kỹ sư Bản địa Tri Tôn',
      organization: 'Ban Quản trị Tri Thức Du Lịch Tri Tôn',
      signature_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0'
    },
    lifecycle: {
      verification_status: 'VERIFIED',
      verified_at: '2026-09-28T21:40:00+07:00',
      expires_at: '2027-09-28T21:40:00+07:00',
      freshness_cycle_days: 365
    },
    field_level_provenance: {
      name_verified: true,
      coordinates_verified: true,
      commune_verified: true,
      category_verified: true,
      phone_verified: false,
      cultural_claims_verified: true
    }
  };

  const result = validatePoiVerificationRecord(validInstance);
  assert.equal(result.valid, true, `Positive instance should be valid, but had errors: ${result.errors.join(', ')}`);
});

test('POI_VERIFICATION_REVIEW_TEMPLATE: Negative controls (Fail-closed on missing pillars or invalid data)', () => {
  const baseValid = {
    review_id: 'PVR-CHUA-XA-TON-2026',
    target_poi: {
      canonical_id: 'chua-xa-ton',
      canonical_name: 'Chùa Xà Tón',
      commune: 'Thị trấn Tri Tôn',
      coordinates: { latitude: 10.4287, longitude: 104.9965 },
      category: 'culture'
    },
    source: {
      type: 'GOVERNMENT_DECISION',
      title: 'Quyết định 224/QĐ-BVHTT',
      issuing_authority: 'Bộ Văn hóa Thông tin',
      source_url: 'https://triton.angiang.gov.vn'
    },
    evidence: {
      reference_number: 'QĐ 224',
      legal_classification: 'NATIONAL_HERITAGE',
      gps_audit_status: 'AUDITED_IN_BOUNDS',
      field_notes: 'Di tích quốc gia có thật 100%'
    },
    reviewer: {
      name: 'Chăm Rốch Thi',
      role: 'Kỹ sư bản địa',
      organization: 'BQT Du Lịch Tri Tôn',
      signature_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0'
    },
    lifecycle: {
      verification_status: 'VERIFIED',
      verified_at: '2026-09-28T21:40:00+07:00',
      expires_at: '2027-09-28T21:40:00+07:00',
      freshness_cycle_days: 365
    },
    field_level_provenance: {
      name_verified: true,
      coordinates_verified: true,
      commune_verified: true,
      category_verified: true
    }
  };

  // Case 1: Missing source
  const noSource = { ...baseValid, source: undefined };
  assert.equal(validatePoiVerificationRecord(noSource).valid, false);

  // Case 2: Missing evidence
  const noEvidence = { ...baseValid, evidence: undefined };
  assert.equal(validatePoiVerificationRecord(noEvidence).valid, false);

  // Case 3: Missing reviewer
  const noReviewer = { ...baseValid, reviewer: undefined };
  assert.equal(validatePoiVerificationRecord(noReviewer).valid, false);

  // Case 4: Missing expiry / lifecycle
  const noLifecycle = { ...baseValid, lifecycle: undefined };
  assert.equal(validatePoiVerificationRecord(noLifecycle).valid, false);

  // Case 5: Invalid commune outside 15 communes glossary
  const badCommune = {
    ...baseValid,
    target_poi: { ...baseValid.target_poi, commune: 'Xã Lương Cương' }
  };
  const badCommuneResult = validatePoiVerificationRecord(badCommune);
  assert.equal(badCommuneResult.valid, false);
  assert.match(badCommuneResult.errors.join(' '), /Invalid commune/);

  // Case 6: Coordinates outside Tri Ton BBOX (e.g. Latitude 10.60 > 10.55)
  const outOfBounds = {
    ...baseValid,
    target_poi: { ...baseValid.target_poi, coordinates: { latitude: 10.60, longitude: 105.00 } }
  };
  const outOfBoundsResult = validatePoiVerificationRecord(outOfBounds);
  assert.equal(outOfBoundsResult.valid, false);
  assert.match(outOfBoundsResult.errors.join(' '), /outside Tri Ton BBOX/);

  // Case 7: expires_at before or equal to verified_at
  const expiredAtCreation = {
    ...baseValid,
    lifecycle: {
      ...baseValid.lifecycle,
      verified_at: '2026-09-28T21:40:00+07:00',
      expires_at: '2026-09-20T00:00:00+07:00'
    }
  };
  const expiredResult = validatePoiVerificationRecord(expiredAtCreation);
  assert.equal(expiredResult.valid, false);
  assert.match(expiredResult.errors.join(' '), /expires_at must be strictly after verified_at/);
});
