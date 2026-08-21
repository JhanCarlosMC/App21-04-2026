/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2_678_400,
  },
  // Add trailing slash handling for cleaner URLs
  trailingSlash: false,
  // Desactivar completamente los indicadores de desarrollo de Next.js
  devIndicators: false,
  // Permitir acceso desde la red local para HMR
  allowedDevOrigins: ['192.168.80.22'],
}

module.exports = nextConfig
