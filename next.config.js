/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' removed — SSR mode enables API routes on Netlify
  // @netlify/plugin-nextjs handles server-side rendering automatically
  trailingSlash: true,
  reactStrictMode: true,
  eslint: {
    // ESLint runs separately in CI; skip during Netlify production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are caught locally; skip during Netlify production build
    ignoreBuildErrors: true,
  },
  // swcMinify removed — default in Next.js 15+
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },  // Google profile photos
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    unoptimized: process.env.NEXT_PUBLIC_IMAGES_UNOPTIMIZED === 'true',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY || '',
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'true',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
