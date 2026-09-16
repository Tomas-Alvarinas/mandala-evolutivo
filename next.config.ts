import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chromium binaries and Playwright must stay outside the Next.js server bundle.
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium", "pdf-lib"],
  // NFT traces playwright-core JS but misses browsers.json, which coreBundle.js
  // loads at runtime. Both PDF routes share this helper.
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/playwright-core/**"],
  },
};

export default nextConfig;
