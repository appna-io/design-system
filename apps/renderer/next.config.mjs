import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentsSrc = path.resolve(__dirname, '../../packages/components/src');

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/design-system',
    images: { unoptimized: true },
  }),
  // Hide Next.js's floating dev-mode indicator (the red "N" with a status dot). Our renderer is
  // a docs / preview surface — we want the only floating UI to be our own chrome. The indicator
  // is dev-only anyway (production builds never include it).
  devIndicators: false,
  transpilePackages: [
    '@apx-ui/ds',
    '@apx-ui/engine',
    '@apx-ui/tokens',
    '@apx-ui/theme',
    '@apx-ui/components',
    '@apx-ui/icons',
  ],
  // The renderer dynamically imports example files from `packages/components/src` via
  // template-literal imports. Webpack pre-resolves the directory through the package's exports
  // field, which would otherwise refuse to expose `./src`. Aliasing the prefix sidesteps that.
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@apx-ui/components/src': componentsSrc,
    };
    return config;
  },
};

export default nextConfig;