import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

export const DEFAULT_MANIFEST_PATH = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');
export const DEFAULT_PLACES_DIR = path.join(REPO_ROOT, 'data', 'canonical', 'places');
export const DEFAULT_OUTPUT_PATH = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'places.canonical.json');

export function generateStaticFrontendPlaces(options = {}) {
  const manifestPath = options.manifestPath || DEFAULT_MANIFEST_PATH;
  const placesDir = options.placesDir || DEFAULT_PLACES_DIR;
  const outputPath = options.outputPath || DEFAULT_OUTPUT_PATH;

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Canonical manifest not found at: ${manifestPath}`);
  }

  const manifestBuffer = fs.readFileSync(manifestPath);
  const manifestSha256 = crypto.createHash('sha256').update(manifestBuffer).digest('hex');
  const manifest = JSON.parse(manifestBuffer.toString('utf8'));

  if (!Array.isArray(manifest.places)) {
    throw new Error('Invalid manifest format: "places" must be an array');
  }

  const verifiedPlacesList = [];

  for (const entry of manifest.places) {
    if (!entry.canonical_id) {
      throw new Error('Manifest entry missing canonical_id');
    }

    const fileName = entry.file_name || `${entry.canonical_id}.json`;
    const filePath = path.join(placesDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Referenced canonical place file not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const computedSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (entry.sha256 && computedSha256 !== entry.sha256) {
      throw new Error(`Checksum mismatch for ${entry.canonical_id}: expected ${entry.sha256}, got ${computedSha256}`);
    }

    const place = JSON.parse(fileBuffer.toString('utf8'));

    // Strict verified status enforcement: fail closed on unverified or mock data
    if (place.verification_status !== 'VERIFIED' || place.is_verified !== true) {
      throw new Error(`Unverified place detected: "${place.canonical_id}" has verification_status "${place.verification_status}" and is_verified ${place.is_verified}`);
    }

    verifiedPlacesList.push(place);
  }

  // Sort deterministically by canonical_id
  verifiedPlacesList.sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));

  const artifact = {
    source_manifest: {
      manifest_name: manifest.manifest_name,
      manifest_version: manifest.manifest_version,
      schema_version: manifest.schema_version,
      manifest_sha256: manifestSha256,
      overall_sha256: manifest.overall_sha256
    },
    generated_at: options.generated_at || manifest.generated_at || new Date().toISOString(),
    total_count: verifiedPlacesList.length,
    generator: "scripts/generate_static_frontend_places.mjs",
    places: verifiedPlacesList
  };

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2) + '\n', 'utf8');

  return artifact;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = generateStaticFrontendPlaces();
  console.log(`Generated static frontend places artifact with ${result.total_count} POI(s).`);
  console.log(`Manifest Version: ${result.source_manifest.manifest_version}`);
  console.log(`Schema Version: ${result.source_manifest.schema_version}`);
  console.log(`Output: ${DEFAULT_OUTPUT_PATH}`);
}
