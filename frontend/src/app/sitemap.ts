import { MetadataRoute } from 'next';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const masterPois = require('@/data/triton_pois_full.json') as any[];

const BASE_URL = 'https://dulichtriton.com';

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

  // 2. Dynamic routes: 149 verified POI detail pages
  const seen = new Set<string>();
  const poiRoutes: MetadataRoute.Sitemap = [];

  for (const p of masterPois) {
    const slug = (p.slug || p.id || '').trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    poiRoutes.push({
      url: `${BASE_URL}/places/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: p.rating >= 4.7 ? 0.95 : p.rating >= 4.5 ? 0.85 : 0.75,
    });
  }

  return [...staticRoutes, ...poiRoutes];
}
