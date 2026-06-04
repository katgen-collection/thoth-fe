import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The frontend talks to the api-gateway only; no rewrites needed in prod.
  // For local dev you can optionally proxy /api -> gateway by setting
  // NEXT_PUBLIC_API_BASE_URL and letting the typed client call it directly.
  eslint: {
    // Keep `next build` from failing the whole scaffold on lint nits;
    // run `npm run lint` explicitly in CI.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
