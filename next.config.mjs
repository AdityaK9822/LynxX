import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    // Serve images as WebP/AVIF automatically — 70–85% smaller than PNG
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 30 days on the CDN
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Device widths used for responsive srcsets
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        // SEP-0001 requires CORS on stellar.toml, and recommends text/plain
        // so browsers render it instead of downloading it.
        source: '/.well-known/stellar.toml',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        ],
      },
    ];
  },
};

export default nextConfig;
