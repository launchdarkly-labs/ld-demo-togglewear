/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
  // These three mirror ld-core-demo so ported components behave the same.
  reactStrictMode: false,
  output: 'standalone',
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

module.exports = nextConfig;
