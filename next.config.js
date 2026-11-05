/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

// Who the browser may talk to and load from. The store is its own origin
// for pages, scripts, styles, fonts and images; the only other parties are
// LaunchDarkly (flags, events, observability, session replay, the developer
// toolbar's API) and unpkg, where the toolbar package fetches its bundle.
//
// 'unsafe-inline' for styles because components set style attributes, the
// code examples are syntax-highlighted inline, and the toolbar injects its
// own. For scripts too, with regret: Next inlines Turbopack's chunk list into
// every page, with contents that differ per page and per build, so no hash
// can name it, and most pages are prerendered at build time, so no nonce
// can either. What the policy still does for scripts is name the only two
// hosts they may load from and refuse eval. next dev needs 'unsafe-eval' for
// its source maps and gets it only there. Building with webpack instead
// (next build --webpack) emits no inline script, and would allow dropping
// 'unsafe-inline' here; it is a bundler change, so it is not done lightly.
//
// blob: workers are session replay's. frame-ancestors 'self' keeps the store
// out of other sites' iframes, where a shopper's clicks could be hijacked.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://unpkg.com${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.launchdarkly.com https://unpkg.com",
  "worker-src 'self' blob:",
  "frame-src https://*.launchdarkly.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Two years, and the store's own subdomains, which it has none of. The
  // ingress sends one too; this one covers a store run anywhere else.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The CSP's frame-ancestors is the modern form; this is for anything old.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig = {
  // These three mirror ld-core-demo so ported components behave the same.
  reactStrictMode: false,
  output: 'standalone',
  productionBrowserSourceMaps: true,
  // Left as a real package in node_modules rather than bundled, because
  // LangChain imports it by name at runtime (see lib/aiServer.ts) and a
  // bundled copy is not somewhere that import can find.
  serverExternalPackages: ['@langchain/aws'],
  // Next's own badge, shown by next dev only, has no free corner: it sat on
  // top of LaunchDarkly's developer toolbar bottom-left, the swag assistant
  // has bottom-right, and top-right covers Under the hood's close button.
  // Build errors still open Next's overlay without it.
  devIndicators: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
