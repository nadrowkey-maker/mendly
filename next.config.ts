import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * En-têtes de sécurité.
 *
 * Vercel ne servait que Strict-Transport-Security. Il manquait notamment toute
 * protection contre le détournement de clic : l'application pouvait être
 * chargée dans une iframe sur un site tiers, qui superposait alors ses propres
 * éléments par-dessus les boutons réels.
 *
 * `frame-ancestors 'none'` est passé par CSP plutôt qu'en Content-Security-Policy
 * complète : une CSP intégrale casserait les scripts en ligne de Next, les
 * polices Google et le SDK Stripe, et se règle en observant les rapports de
 * violation — pas à l'aveugle. Cette directive-ci, en revanche, est sans risque
 * et couvre le risque réel.
 */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
  },
  trailingSlash: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
