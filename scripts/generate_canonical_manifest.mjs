import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const CANONICAL_PLACES_DIR = path.join(REPO_ROOT, 'data', 'canonical', 'places');
const MANIFEST_PATH = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');

export function generateManifest(options = {}) {
  const files = fs.readdirSync(CANONICAL_PLACES_DIR).filter(f => f.endsWith('.json'));
  const verifiedPlaces = [];

  for (const file of files.sort()) {
    const filePath = path.join(CANONICAL_PLACES_DIR, file);
    const contentBuffer = fs.readFileSync(filePath);
    const sha256 = crypto.createHash('sha256').update(contentBuffer).digest('hex');
    const place = JSON.parse(contentBuffer.toString('utf8'));

    if (place.verification_status === 'VERIFIED' && place.is_verified === true) {
      verifiedPlaces.push({
        canonical_id: place.canonical_id,
        name: place.name,
        commune: place.commune,
        category: place.category,
        verification_status: place.verification_status,
        review_id: place.review_id,
        verified_at: place.verified_at,
        source_url: place.source_url,
        file_name: file,
        sha256: sha256,
        size_bytes: contentBuffer.length
      });
    }
  }

  // Calculate deterministic overall dataset hash
  const overallHashInput = verifiedPlaces
    .map(p => `${p.canonical_id}:${p.sha256}`)
    .join('\n');
  const overall_sha256 = crypto.createHash('sha256').update(overallHashInput).digest('hex');

  const manifest = {
    manifest_name: "Tri Ton Tourism Official Canonical Dataset Manifest",
    manifest_version: "1.0.0",
    schema_version: "CANONICAL-POI-SCHEMA-V1",
    generated_at: options.generated_at || "2026-09-28T22:20:00+07:00",
    authority: "Hội đồng Quản trị Dữ liệu Du Lịch Tri Tôn",
    lead_auditor: "Chăm Rốch Thi",
    dataset_scope: {
      geographic_boundary: "Tri Ton District, An Giang Province",
      commune_count: 15,
      bounding_box: {
        latitude: [10.30, 10.55],
        longitude: [104.80, 105.15]
      }
    },
    total_verified_count: verifiedPlaces.length,
    overall_sha256: overall_sha256,
    places: verifiedPlaces
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = generateManifest();
  console.log(`Generated manifest with ${result.total_verified_count} verified POI(s).`);
  console.log(`Overall SHA-256: ${result.overall_sha256}`);
}
