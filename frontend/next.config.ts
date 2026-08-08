import type { NextConfig } from "next";
// @ts-expect-error next-pwa lacks typescript definitions
import withPWA from "next-pwa";

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

export default pwa(nextConfig);
