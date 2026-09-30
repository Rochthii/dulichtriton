import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

export const TRI_TON_15_COMMUNES = [
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

export const COMMUNE_BARE_NAME_MAP = {
  'tri tôn': 'Thị trấn Tri Tôn',
  'thị trấn tri tôn': 'Thị trấn Tri Tôn',
  'ba chúc': 'Thị trấn Ba Chúc',
  'thị trấn ba chúc': 'Thị trấn Ba Chúc',
  'châu lăng': 'Xã Châu Lăng',
  'lương phi': 'Xã Lương Phi',
  'vĩnh phước': 'Xã Vĩnh Phước',
  'lương an trà': 'Xã Lương An Trà',
  'lạc quới': 'Xã Lạc Quới',
  'lê trì': 'Xã Lê Trì',
  'ô lâm': 'Xã Ô Lâm',
  'an tức': 'Xã An Tức',
  'cô tô': 'Xã Cô Tô',
  'tân tuyến': 'Xã Tân Tuyến',
  'tà đảnh': 'Xã Tà Đảnh',
  'vĩnh gia': 'Xã Vĩnh Gia',
  'núi tô': 'Xã Núi Tô'
};

export const COMMUNE_KNOWN_TYPOS_MAP = {
  'xã lương cương': 'Xã Lương Phi', // CRQ-086 / Row 120 Master CSV
  'lương cương': 'Xã Lương Phi',
  'xã tri tôn': 'Thị trấn Tri Tôn',
  'xã ba chúc': 'Thị trấn Ba Chúc',
  'thị trấn cô tô': 'Xã Cô Tô',
  'thị trấn núi tô': 'Xã Núi Tô',
  'thị trấn ô lâm': 'Xã Ô Lâm',
  'thị trấn an tức': 'Xã An Tức'
};

export function validateCommuneGlossary(commune, options = {}) {
  const errors = [];

  if (commune === undefined || commune === null || typeof commune !== 'string' || commune.trim().length === 0) {
    return {
      valid: false,
      commune: commune,
      canonical_commune: null,
      suggested_commune: null,
      error_code: 'INVALID_COMMUNE_TYPE',
      errors: ['commune must be a non-empty string']
    };
  }

  const trimmed = commune.trim();

  // 1. Exact match with canonical 15 communes
  if (TRI_TON_15_COMMUNES.includes(trimmed)) {
    return {
      valid: true,
      commune: trimmed,
      canonical_commune: trimmed,
      suggested_commune: null,
      error_code: null,
      errors: []
    };
  }

  // 2. Known typo / historical alias
  const lower = trimmed.toLowerCase();
  let suggested = null;
  let reason = '';

  if (COMMUNE_KNOWN_TYPOS_MAP[lower]) {
    suggested = COMMUNE_KNOWN_TYPOS_MAP[lower];
    reason = `Known typo/historical alias detected. Did you mean "${suggested}"?`;
  } else if (COMMUNE_BARE_NAME_MAP[lower]) {
    suggested = COMMUNE_BARE_NAME_MAP[lower];
    reason = `Short name detected without administrative prefix. Did you mean "${suggested}"?`;
  } else {
    // Try simple substring match against bare names
    for (const [bare, canonical] of Object.entries(COMMUNE_BARE_NAME_MAP)) {
      if (lower.includes(bare)) {
        suggested = canonical;
        reason = `Sub-phrase matched "${bare}". Did you mean "${suggested}"?`;
        break;
      }
    }
    if (!suggested) {
      reason = 'Commune is outside Tri Ton District or not recognized in glossary.';
    }
  }

  const errorMessage = `[INVALID_COMMUNE_GLOSSARY] Invalid commune: "${trimmed}". ${reason} Must strictly match one of the 15 Tri Ton communes (RULE 02)`;
  errors.push(errorMessage);

  return {
    valid: false,
    commune: trimmed,
    canonical_commune: null,
    suggested_commune: suggested,
    error_code: 'INVALID_COMMUNE_GLOSSARY',
    errors
  };
}

export const ALLOWED_VERIFICATION_STATUSES = [
  'UNVERIFIED',
  'IN_REVIEW',
  'VERIFIED',
  'REJECTED',
  'EXPIRED'
];

export const ALLOWED_CATEGORIES = [
  'culture',
  'nature',
  'food',
  'stay',
  'experience',
  'historical'
];

export const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;
export const CANONICAL_ID_REGEX = /^[a-z0-9-]+$/;
export const REVIEW_ID_REGEX = /^PVR-[A-Z0-9_-]+$/;

export const TRI_TON_BBOX = {
  MIN_LATITUDE: 10.30,
  MAX_LATITUDE: 10.55,
  MIN_LONGITUDE: 104.80,
  MAX_LONGITUDE: 105.15
};

export function validateGpsBoundary(coordinates, options = {}) {
  const errors = [];
  let errorCode = null;
  let isSwapped = false;

  let coords = coordinates;
  if (coordinates && typeof coordinates === 'object' && coordinates.coordinates) {
    coords = coordinates.coordinates;
  }

  if (!coords || typeof coords !== 'object' || Array.isArray(coords)) {
    return {
      valid: false,
      latitude: null,
      longitude: null,
      in_bounding_box: false,
      is_swapped: false,
      error_code: 'GPS_INVALID_TYPE',
      errors: ['coordinates must be an object with latitude and longitude']
    };
  }

  const { latitude, longitude } = coords;

  // Type & finiteness checks
  const isLatValid = typeof latitude === 'number' && !isNaN(latitude) && isFinite(latitude);
  const isLngValid = typeof longitude === 'number' && !isNaN(longitude) && isFinite(longitude);

  if (!isLatValid) {
    errors.push('coordinates.latitude must be a valid number');
    errorCode = 'GPS_INVALID_TYPE';
  }
  if (!isLngValid) {
    errors.push('coordinates.longitude must be a valid number');
    errorCode = 'GPS_INVALID_TYPE';
  }

  if (errors.length > 0) {
    return {
      valid: false,
      latitude,
      longitude,
      in_bounding_box: false,
      is_swapped: false,
      error_code: errorCode,
      errors
    };
  }

  // Check swapped coordinates (e.g., latitude in Vietnam longitude range [100, 115] and longitude in latitude range [0, 25])
  if (latitude >= 100.0 && longitude <= 25.0) {
    isSwapped = true;
    errorCode = 'GPS_SWAPPED_COORDINATES';
    errors.push(
      `[GPS_SWAPPED_COORDINATES] Inverted coordinates detected: latitude (${latitude}) and longitude (${longitude}) appear swapped. Tri Ton WGS84 expects lat in [${TRI_TON_BBOX.MIN_LATITUDE}, ${TRI_TON_BBOX.MAX_LATITUDE}] and lng in [${TRI_TON_BBOX.MIN_LONGITUDE}, ${TRI_TON_BBOX.MAX_LONGITUDE}]`
    );
    return {
      valid: false,
      latitude,
      longitude,
      in_bounding_box: false,
      is_swapped: true,
      error_code: errorCode,
      errors
    };
  }

  // Bounding box boundary checks
  let outOfBounds = false;
  if (latitude < TRI_TON_BBOX.MIN_LATITUDE || latitude > TRI_TON_BBOX.MAX_LATITUDE) {
    outOfBounds = true;
    errors.push(
      `[GPS_OUT_OF_BOUNDS] coordinates.latitude ${latitude} is outside Tri Ton bounding box [${TRI_TON_BBOX.MIN_LATITUDE}, ${TRI_TON_BBOX.MAX_LATITUDE}]`
    );
  }

  if (longitude < TRI_TON_BBOX.MIN_LONGITUDE || longitude > TRI_TON_BBOX.MAX_LONGITUDE) {
    outOfBounds = true;
    errors.push(
      `[GPS_OUT_OF_BOUNDS] coordinates.longitude ${longitude} is outside Tri Ton bounding box [${TRI_TON_BBOX.MIN_LONGITUDE}, ${TRI_TON_BBOX.MAX_LONGITUDE}]`
    );
  }

  if (outOfBounds) {
    errorCode = 'GPS_OUT_OF_BOUNDS';
  }

  return {
    valid: errors.length === 0,
    latitude,
    longitude,
    in_bounding_box: !outOfBounds,
    is_swapped: isSwapped,
    error_code: errorCode,
    errors
  };
}

export function resolveReviewFile(reviewId, repoRoot = REPO_ROOT) {
  if (!reviewId) return null;
  let reviewPath = path.join(repoRoot, 'docs', 'technical-spec', 'poi-reviews', `${reviewId}.json`);
  if (!fs.existsSync(reviewPath)) {
    const altPath = path.join(repoRoot, 'docs', 'technical-spec', 'poi-reviews', `${reviewId.replace(/-\d{4}$/, '')}.json`);
    if (fs.existsSync(altPath)) {
      reviewPath = altPath;
    }
  }
  return fs.existsSync(reviewPath) ? reviewPath : null;
}

export function validatePlaceRecord(place, options = { checkDiskReview: true, repoRoot: REPO_ROOT }) {
  const errors = [];

  if (!place || typeof place !== 'object' || Array.isArray(place)) {
    return { valid: false, errors: ['Place record must be a valid non-array JSON object'] };
  }

  // 1. Required core properties
  const requiredFields = ['canonical_id', 'name', 'commune', 'coordinates', 'category', 'verification_status', 'is_verified'];
  for (const field of requiredFields) {
    if (place[field] === undefined || place[field] === null || place[field] === '') {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  // 2. canonical_id
  if (place.canonical_id !== undefined) {
    if (typeof place.canonical_id !== 'string') {
      errors.push('canonical_id must be a string');
    } else if (!CANONICAL_ID_REGEX.test(place.canonical_id)) {
      errors.push(`Invalid canonical_id format: "${place.canonical_id}". Must match ${CANONICAL_ID_REGEX}`);
    }
  }

  // 3. name
  if (place.name !== undefined) {
    if (typeof place.name !== 'string' || place.name.trim().length < 2) {
      errors.push('name must be a non-empty string with at least 2 characters');
    }
  }

  // 4. commune (RULE 02)
  if (place.commune !== undefined) {
    const communeRes = validateCommuneGlossary(place.commune, options);
    if (!communeRes.valid) {
      errors.push(...communeRes.errors);
    }
  }

  // 5. coordinates (BBOX [10.30, 10.55], [104.80, 105.15])
  if (place.coordinates !== undefined) {
    const gpsRes = validateGpsBoundary(place.coordinates, options);
    if (!gpsRes.valid) {
      errors.push(...gpsRes.errors);
    }
  }

  // 6. category
  if (place.category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(place.category)) {
      errors.push(`Invalid category: "${place.category}". Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
    }
  }

  // 7. verification_status & is_verified coherence (INV-02)
  if (place.verification_status !== undefined) {
    if (!ALLOWED_VERIFICATION_STATUSES.includes(place.verification_status)) {
      errors.push(`Invalid verification_status: "${place.verification_status}". Allowed: ${ALLOWED_VERIFICATION_STATUSES.join(', ')}`);
    }
  }

  if (place.is_verified !== undefined && typeof place.is_verified !== 'boolean') {
    errors.push('is_verified must be a boolean');
  }

  if (place.verification_status === 'VERIFIED') {
    if (place.is_verified !== true) {
      errors.push('is_verified must be true when verification_status is VERIFIED (INV-02)');
    }

    // INV-01: review_id check
    if (!place.review_id) {
      errors.push('review_id is mandatory when verification_status is VERIFIED (INV-01)');
    } else if (!REVIEW_ID_REGEX.test(place.review_id)) {
      errors.push(`review_id "${place.review_id}" must match pattern ${REVIEW_ID_REGEX}`);
    } else if (options.checkDiskReview) {
      const reviewPath = resolveReviewFile(place.review_id, options.repoRoot);
      if (!reviewPath) {
        errors.push(`Referenced review file does not exist on disk for review_id: "${place.review_id}" (INV-01)`);
      } else {
        try {
          const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
          if (review.target_poi?.canonical_id !== place.canonical_id) {
            errors.push(`Review record canonical_id mismatch: review has "${review.target_poi?.canonical_id}", place has "${place.canonical_id}"`);
          }
        } catch {
          errors.push(`Referenced review file is corrupted on disk: ${reviewPath}`);
        }
      }
    }

    // INV-04: verified_at provenance and chronology
    if (!place.verified_at) {
      errors.push('verified_at is mandatory when verification_status is VERIFIED (INV-04)');
    } else if (!ISO_8601_REGEX.test(place.verified_at)) {
      errors.push(`verified_at "${place.verified_at}" is not a valid ISO 8601 timestamp with timezone`);
    } else {
      const verifiedTimestamp = Date.parse(place.verified_at);
      if (isNaN(verifiedTimestamp)) {
        errors.push(`verified_at "${place.verified_at}" cannot be parsed into a date`);
      } else if (place.expires_at) {
        const expiresTimestamp = Date.parse(place.expires_at);
        if (!isNaN(expiresTimestamp) && verifiedTimestamp >= expiresTimestamp) {
          errors.push(`Chronological violation: verified_at (${place.verified_at}) must be strictly before expires_at (${place.expires_at})`);
        }
      }
    }

    // INV-05: source_url security and format
    if (!place.source_url) {
      errors.push('source_url is mandatory when verification_status is VERIFIED (INV-05)');
    } else {
      try {
        const url = new URL(place.source_url);
        if (url.protocol !== 'https:') {
          errors.push(`source_url must use https:, received "${url.protocol}" (INV-05)`);
        }
        const hostname = url.hostname.toLowerCase();
        if (['localhost', '127.0.0.1', '169.254.169.254', '0.0.0.0', '::1'].includes(hostname)) {
          errors.push(`source_url hostname "${hostname}" is blocked (private/loopback/IMDS)`);
        }
      } catch {
        errors.push(`source_url "${place.source_url}" is not a valid parseable URI`);
      }
    }
  } else {
    // Non-verified status fail-closed rules
    if (place.is_verified === true) {
      errors.push(`is_verified cannot be true when verification_status is "${place.verification_status}" (INV-02)`);
    }
    if (place.verified_at) {
      errors.push(`Unverified status "${place.verification_status}" cannot possess verified_at (INV-04)`);
    }
    if (place.source_url && place.verification_status === 'UNVERIFIED') {
      errors.push(`Unverified status cannot possess verified source_url (INV-05)`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateCanonicalIdUniqueness(places, options = { checkAliases: true }) {
  const errors = [];
  const duplicates = [];

  if (!Array.isArray(places)) {
    return {
      valid: false,
      total_checked: 0,
      unique_count: 0,
      duplicates: [],
      errors: ['Input must be an array of places or canonical IDs']
    };
  }

  const idMap = new Map(); // canonical_id -> { count, indices, names }
  const aliasMap = new Map(); // normalized_alias -> { canonical_id, index, raw }

  places.forEach((item, index) => {
    let canonicalId = null;
    let name = '';
    let altNames = [];

    if (typeof item === 'string') {
      canonicalId = item.trim();
      name = item.trim();
    } else if (item && typeof item === 'object') {
      canonicalId = item.canonical_id || item.id || null;
      name = item.name || '';
      if (Array.isArray(item.alt_names)) {
        altNames = item.alt_names;
      } else if (Array.isArray(item.aliases)) {
        altNames = item.aliases;
      }
    }

    if (!canonicalId) {
      errors.push(`Record at index ${index} is missing a canonical_id`);
      return;
    }

    const normalizedId = canonicalId.trim();

    // Check duplicate canonical_id
    if (!idMap.has(normalizedId)) {
      idMap.set(normalizedId, {
        canonical_id: normalizedId,
        count: 1,
        indices: [index],
        records: [name || `Record #${index}`]
      });
    } else {
      const entry = idMap.get(normalizedId);
      entry.count += 1;
      entry.indices.push(index);
      entry.records.push(name || `Record #${index}`);
    }

    // Check aliases if enabled
    if (options.checkAliases && altNames.length > 0) {
      for (const rawAlias of altNames) {
        if (typeof rawAlias !== 'string') continue;
        const normalizedAlias = rawAlias.trim().toLowerCase();
        if (aliasMap.has(normalizedAlias)) {
          const prev = aliasMap.get(normalizedAlias);
          if (prev.canonical_id !== normalizedId) {
            const aliasMsg = `[DUPLICATE_CANONICAL_ID] Alias collision: Alias "${rawAlias}" in record "${normalizedId}" (index ${index}) collides with record "${prev.canonical_id}" (index ${prev.index})`;
            errors.push(aliasMsg);
            duplicates.push({
              canonical_id: normalizedId,
              colliding_alias: rawAlias,
              colliding_with: prev.canonical_id,
              error_code: 'DUPLICATE_CANONICAL_ID',
              message: aliasMsg
            });
          }
        } else {
          aliasMap.set(normalizedAlias, { canonical_id: normalizedId, index, raw: rawAlias });
        }
      }
    }
  });

  // Evaluate duplicates
  for (const [id, entry] of idMap.entries()) {
    if (entry.count > 1) {
      const msg = `[DUPLICATE_CANONICAL_ID] Duplicate canonical_id "${id}" detected across ${entry.count} records (indices: ${entry.indices.join(', ')}; records: ${entry.records.join('; ')})`;
      errors.push(msg);
      duplicates.push({
        canonical_id: id,
        count: entry.count,
        indices: entry.indices,
        error_code: 'DUPLICATE_CANONICAL_ID',
        message: msg
      });
    }
  }

  // Cross check: ensure no alias collides directly with an existing canonical_id of another record
  if (options.checkAliases) {
    for (const [id] of idMap.entries()) {
      const idLower = id.toLowerCase();
      if (aliasMap.has(idLower)) {
        const aliasEntry = aliasMap.get(idLower);
        if (aliasEntry.canonical_id !== id) {
          const crossMsg = `[DUPLICATE_CANONICAL_ID] Collision: Alias "${aliasEntry.raw}" of record "${aliasEntry.canonical_id}" collides with canonical_id "${id}"`;
          errors.push(crossMsg);
          duplicates.push({
            canonical_id: id,
            colliding_alias: aliasEntry.raw,
            colliding_record: aliasEntry.canonical_id,
            error_code: 'DUPLICATE_CANONICAL_ID',
            message: crossMsg
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    total_checked: places.length,
    unique_count: idMap.size,
    duplicates,
    errors
  };
}

export function validateCanonicalDataset(
  placesDir = path.join(REPO_ROOT, 'data', 'canonical', 'places'),
  manifestPath = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json'),
  options = { checkDiskReview: true, repoRoot: REPO_ROOT }
) {
  if (!fs.existsSync(placesDir)) {
    return { valid: false, count: 0, results: [], errors: [`Directory does not exist: ${placesDir}`] };
  }

  const files = fs.readdirSync(placesDir).filter(f => f.endsWith('.json'));
  const results = [];
  const parsedPlaces = [];
  let totalErrors = 0;

  for (const file of files) {
    const filePath = path.join(placesDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const place = JSON.parse(content);

      // Check file name strictly matches canonical_id
      const expectedFileName = `${place.canonical_id}.json`;
      const fileErrors = [];
      if (file !== expectedFileName) {
        fileErrors.push(`File name mismatch: file is "${file}", but canonical_id is "${place.canonical_id}" (expected "${expectedFileName}")`);
      }

      const res = validatePlaceRecord(place, options);
      const combinedErrors = [...fileErrors, ...res.errors];

      results.push({ file, canonical_id: place.canonical_id, valid: combinedErrors.length === 0, errors: combinedErrors });
      if (combinedErrors.length > 0) totalErrors += combinedErrors.length;

      parsedPlaces.push(place);
    } catch (e) {
      results.push({ file, valid: false, errors: [`JSON parse error: ${e.message}`] });
      totalErrors++;
    }
  }

  // 1. Uniqueness validation across all parsed places on disk
  const diskUniqueness = validateCanonicalIdUniqueness(parsedPlaces);
  if (!diskUniqueness.valid) {
    totalErrors += diskUniqueness.errors.length;
  }

  // 2. Manifest uniqueness & concordance validation if manifest file exists
  let manifestValidation = null;
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const manifestPlaces = Array.isArray(manifest.places) ? manifest.places : [];
      const manifestUniqueness = validateCanonicalIdUniqueness(manifestPlaces);

      const manifestErrors = [...manifestUniqueness.errors];

      // Concordance check: Disk IDs vs Manifest IDs
      const diskIds = new Set(parsedPlaces.map(p => p.canonical_id).filter(Boolean));
      const manifestIds = new Set(manifestPlaces.map(p => p.canonical_id).filter(Boolean));

      for (const diskId of diskIds) {
        if (!manifestIds.has(diskId)) {
          manifestErrors.push(`Concordance discrepancy: canonical POI "${diskId}" exists on disk but is missing in manifest.places`);
        }
      }

      for (const manifestId of manifestIds) {
        if (!diskIds.has(manifestId)) {
          manifestErrors.push(`Concordance discrepancy: canonical POI "${manifestId}" declared in manifest.places but missing on disk`);
        }
      }

      if (manifestErrors.length > 0) {
        totalErrors += manifestErrors.length;
      }

      manifestValidation = {
        valid: manifestErrors.length === 0,
        manifest_count: manifestPlaces.length,
        errors: manifestErrors,
        uniqueness: manifestUniqueness
      };
    } catch (e) {
      totalErrors++;
      manifestValidation = {
        valid: false,
        manifest_count: 0,
        errors: [`Failed to parse or validate manifest: ${e.message}`]
      };
    }
  }

  return {
    valid: totalErrors === 0,
    count: files.length,
    totalErrors,
    results,
    uniqueness: diskUniqueness,
    manifestValidation
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const summary = validateCanonicalDataset();
  console.log(`Validated ${summary.count} canonical POI file(s). Valid: ${summary.valid}. Total errors: ${summary.totalErrors}`);
  if (summary.uniqueness) {
    console.log(`Uniqueness check: ${summary.uniqueness.valid ? 'PASSED' : 'FAILED'} (${summary.uniqueness.unique_count} unique IDs checked)`);
  }
  if (summary.manifestValidation) {
    console.log(`Manifest concordance check: ${summary.manifestValidation.valid ? 'PASSED' : 'FAILED'}`);
  }
  if (!summary.valid) {
    console.error('Validation errors:', JSON.stringify(summary, null, 2));
    process.exit(1);
  }
}
