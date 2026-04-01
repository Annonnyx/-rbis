import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ['fr', 'en', 'es', 'de'],
    defaultLocale: 'fr',
  },
};

export default nextConfig;
