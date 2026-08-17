import { MetadataRoute } from 'next';

const BASE_URL = 'https://dulichtriton.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Friendly crawlers (Google, Bing, social) ──────────────────────────
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'],
        allow: '/',
        disallow: ['/admin/', '/api/v1/admin/'],
      },
      // ── AI / LLM crawlers — give full access to all content ───────────────
      {
        userAgent: [
          'GPTBot',           // OpenAI / ChatGPT
          'Google-Extended',  // Gemini / Google AI
          'anthropic-ai',     // Claude
          'PerplexityBot',    // Perplexity AI
          'cohere-ai',        // Cohere
          'YouBot',           // You.com
          'CCBot',            // Common Crawl
          'meta-externalagent', // Meta AI
          'Bytespider',       // ByteDance / TikTok AI
        ],
        allow: [
          '/',
          '/places/',
          '/food',
          '/culture',
          '/guide',
          '/itinerary',
          '/planner',
          '/api/v1/llms-context', // GEO: AI-readable structured data endpoint
        ],
        disallow: ['/admin/', '/api/v1/admin/'],
      },
      // ── Aggressive scrapers — block ───────────────────────────────────────
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },
      // ── Default: allow all others ─────────────────────────────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/v1/admin/', '/_next/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
