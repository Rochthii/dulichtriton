import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const validatorModulePath = path.join(REPO_ROOT, 'scripts', 'validate_canonical_dataset.mjs');

test('P03-017: Positive control - Production canonical places coordinates are strictly within Tri Ton BBOX', async () => {
  assert.ok(fs.existsSync(validatorModulePath), 'validate_canonical_dataset.mjs must exist');
  const { validateGpsBoundary, TRI_TON_BBOX } = await import(`file://${validatorModulePath}`);

  assert.equal(TRI_TON_BBOX.MIN_LATITUDE, 10.30);
  assert.equal(TRI_TON_BBOX.MAX_LATITUDE, 10.55);
  assert.equal(TRI_TON_BBOX.MIN_LONGITUDE, 104.80);
  assert.equal(TRI_TON_BBOX.MAX_LONGITUDE, 105.15);

  const placesDir = path.join(REPO_ROOT, 'data', 'canonical', 'places');
  assert.ok(fs.existsSync(placesDir), 'data/canonical/places directory must exist');

  const files = fs.readdirSync(placesDir).filter(f => f.endsWith('.json'));
  assert.ok(files.length >= 1, 'Canonical dataset must contain at least 1 verified POI');

  for (const file of files) {
    const place = JSON.parse(fs.readFileSync(path.join(placesDir, file), 'utf8'));
    assert.ok(place.coordinates, `Place ${file} must have coordinates`);

    const res = validateGpsBoundary(place.coordinates);
    assert.equal(res.valid, true, `Place ${file} coordinates must be valid: ${res.errors.join(', ')}`);
    assert.equal(res.in_bounding_box, true);
    assert.equal(res.is_swapped, false);
    assert.equal(res.error_code, null);
    assert.equal(res.errors.length, 0);

    // Explicit boundary assertions
    assert.ok(res.latitude >= TRI_TON_BBOX.MIN_LATITUDE, `${file} lat >= 10.30`);
    assert.ok(res.latitude <= TRI_TON_BBOX.MAX_LATITUDE, `${file} lat <= 10.55`);
    assert.ok(res.longitude >= TRI_TON_BBOX.MIN_LONGITUDE, `${file} lng >= 104.80`);
    assert.ok(res.longitude <= TRI_TON_BBOX.MAX_LONGITUDE, `${file} lng <= 105.15`);
  }
});

test('P03-017: Negative Fixture - Latitude exceeding upper bound (> 10.55) fails closed with GPS_OUT_OF_BOUNDS', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  // Fixture based on legacy scraped entity diem-du-lich-tri-ton-12 (lat: 10.5567842)
  const outOfBoundsLat = {
    latitude: 10.5567842,
    longitude: 105.0089
  };

  const res = validateGpsBoundary(outOfBoundsLat);
  assert.equal(res.valid, false);
  assert.equal(res.in_bounding_box, false);
  assert.equal(res.error_code, 'GPS_OUT_OF_BOUNDS');
  assert.ok(res.errors.some(e => e.includes('[GPS_OUT_OF_BOUNDS]') && e.includes('outside Tri Ton bounding box')));
});

test('P03-017: Negative Fixture - Latitude below lower bound (< 10.30) fails closed with GPS_OUT_OF_BOUNDS', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  const underBoundsLat = {
    latitude: 10.2500,
    longitude: 105.0089
  };

  const res = validateGpsBoundary(underBoundsLat);
  assert.equal(res.valid, false);
  assert.equal(res.in_bounding_box, false);
  assert.equal(res.error_code, 'GPS_OUT_OF_BOUNDS');
  assert.ok(res.errors.some(e => e.includes('[GPS_OUT_OF_BOUNDS]') && e.includes('outside Tri Ton bounding box')));
});

test('P03-017: Negative Fixture - Longitude below lower bound (< 104.80) fails closed with GPS_OUT_OF_BOUNDS', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  const westOutOfBoundsLng = {
    latitude: 10.4110,
    longitude: 104.7500 // Too far west (Kiên Giang / border)
  };

  const res = validateGpsBoundary(westOutOfBoundsLng);
  assert.equal(res.valid, false);
  assert.equal(res.in_bounding_box, false);
  assert.equal(res.error_code, 'GPS_OUT_OF_BOUNDS');
  assert.ok(res.errors.some(e => e.includes('[GPS_OUT_OF_BOUNDS]') && e.includes('outside Tri Ton bounding box')));
});

test('P03-017: Negative Fixture - Longitude exceeding upper bound (> 105.15) fails closed with GPS_OUT_OF_BOUNDS', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  const eastOutOfBoundsLng = {
    latitude: 10.4110,
    longitude: 105.2200 // Too far east (Châu Thành / Long Xuyên)
  };

  const res = validateGpsBoundary(eastOutOfBoundsLng);
  assert.equal(res.valid, false);
  assert.equal(res.in_bounding_box, false);
  assert.equal(res.error_code, 'GPS_OUT_OF_BOUNDS');
  assert.ok(res.errors.some(e => e.includes('[GPS_OUT_OF_BOUNDS]') && e.includes('outside Tri Ton bounding box')));
});

test('P03-017: Negative Fixture - Swapped/inverted coordinates fail closed with GPS_SWAPPED_COORDINATES', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  // Inverted: longitude put in latitude, and latitude put in longitude
  const invertedCoords = {
    latitude: 105.0089,
    longitude: 10.4110
  };

  const res = validateGpsBoundary(invertedCoords);
  assert.equal(res.valid, false);
  assert.equal(res.in_bounding_box, false);
  assert.equal(res.is_swapped, true);
  assert.equal(res.error_code, 'GPS_SWAPPED_COORDINATES');
  assert.ok(res.errors.some(e => e.includes('[GPS_SWAPPED_COORDINATES]') && e.includes('Inverted coordinates detected')));
});

test('P03-017: Negative Fixture - Non-numeric or invalid coordinate types fail closed with GPS_INVALID_TYPE', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  // 1. Missing coordinates object or null
  const nullRes = validateGpsBoundary(null);
  assert.equal(nullRes.valid, false);
  assert.equal(nullRes.error_code, 'GPS_INVALID_TYPE');

  // 2. String latitude
  const strLatRes = validateGpsBoundary({ latitude: '10.4110', longitude: 105.0089 });
  assert.equal(strLatRes.valid, false);
  assert.equal(strLatRes.error_code, 'GPS_INVALID_TYPE');
  assert.ok(strLatRes.errors.some(e => e.includes('coordinates.latitude must be a valid number')));

  // 3. String longitude
  const strLngRes = validateGpsBoundary({ latitude: 10.4110, longitude: '105.0089' });
  assert.equal(strLngRes.valid, false);
  assert.equal(strLngRes.error_code, 'GPS_INVALID_TYPE');
  assert.ok(strLngRes.errors.some(e => e.includes('coordinates.longitude must be a valid number')));

  // 4. NaN latitude
  const nanRes = validateGpsBoundary({ latitude: NaN, longitude: 105.0089 });
  assert.equal(nanRes.valid, false);
  assert.equal(nanRes.error_code, 'GPS_INVALID_TYPE');

  // 5. Infinity longitude
  const infRes = validateGpsBoundary({ latitude: 10.4110, longitude: Infinity });
  assert.equal(infRes.valid, false);
  assert.equal(infRes.error_code, 'GPS_INVALID_TYPE');
});

test('P03-017: Negative Fixture - External Vietnamese cities outside Tri Ton BBOX strictly rejected', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  const externalCities = [
    { name: 'Hà Nội (Hoàn Kiếm)', latitude: 21.0285, longitude: 105.8542 },
    { name: 'TP. Hồ Chí Minh (Bến Thành)', latitude: 10.7725, longitude: 106.6980 },
    { name: 'Đà Nẵng (Hải Châu)', latitude: 16.0544, longitude: 108.2022 },
    { name: 'TP. Long Xuyên (An Giang)', latitude: 10.3759, longitude: 105.4358 },
    { name: 'TP. Cần Thơ (Ninh Kiều)', latitude: 10.0342, longitude: 105.7882 }
  ];

  for (const city of externalCities) {
    const res = validateGpsBoundary({ latitude: city.latitude, longitude: city.longitude });
    assert.equal(res.valid, false, `${city.name} must be rejected outside Tri Ton BBOX`);
    assert.equal(res.in_bounding_box, false);
    assert.equal(res.error_code, 'GPS_OUT_OF_BOUNDS');
  }
});

test('P03-017: Boundary verification - Border attraction (Hồ Đá Latina) conforms to BBOX', async () => {
  const { validateGpsBoundary } = await import(`file://${validatorModulePath}`);

  // Hồ Đá Latina: resolved in P03-005 ticket CRQ-035 at [10.482, 105.002]
  const hoDaLatinaCoords = {
    latitude: 10.4820,
    longitude: 105.0020
  };

  const res = validateGpsBoundary(hoDaLatinaCoords);
  assert.equal(res.valid, true, 'Hồ Đá Latina coordinates must be valid within Tri Ton BBOX');
  assert.equal(res.in_bounding_box, true);
  assert.equal(res.errors.length, 0);
});
