import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';
import canonicalPlacesData from '@/data/places.canonical.json';

const BASE_URL = SITE_URL;

export interface CanonicalPlaceItem {
  canonical_id: string;
  name?: string;
  verified_at?: string;
  verification_status?: string;
  is_verified?: boolean;
}

export interface CanonicalPlacesArtifact {
  source_manifest: {
    manifest_name: string;
    manifest_version: string;
    schema_version: string;
    manifest_sha256?: string;
    overall_sha256?: string;
  };
  total_count: number;
  places: CanonicalPlaceItem[];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Static routes (core pages)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/places`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/food`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/stay`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/culture`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/map`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/planner`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/itinerary`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/guide`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/chatbot`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/partner`,       lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/emergency`,     lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // 2. Dynamic routes: Generated strictly from verified canonical places
  const artifact = canonicalPlacesData as unknown as CanonicalPlacesArtifact;
  const verifiedPlaces = Array.isArray(artifact?.places) ? artifact.places : [];

  const seen = new Set<string>();
  const poiRoutes: MetadataRoute.Sitemap = [];

  for (const place of verifiedPlaces) {
    const canonicalId = (place.canonical_id || '').trim();
    if (!canonicalId || seen.has(canonicalId)) continue;
    seen.add(canonicalId);

    // Fail closed: enforce verified status if present in artifact
    if (place.verification_status && place.verification_status !== 'VERIFIED') {
      continue;
    }

    const lastModifiedDate = place.verified_at ? new Date(place.verified_at) : now;

    poiRoutes.push({
      url: `${BASE_URL}/places/${canonicalId}`,
      lastModified: Number.isNaN(lastModifiedDate.getTime()) ? now : lastModifiedDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  }

  return [...staticRoutes, ...poiRoutes];
}
