import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.tgdd.vn' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {},
  async redirects() {
    return [
      {
        source: '/chat',
        destination: '/chatbot',
        permanent: true,
      },
    ];
  },
};

let exportedConfig = nextConfig;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWA = require("next-pwa");
  if (typeof withPWA === "function") {
    const pwa = withPWA({
      dest: "public",
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === "development",
    });
    exportedConfig = pwa(nextConfig);
  }
} catch {
  // next-pwa optional fallback
}

export default exportedConfig;

