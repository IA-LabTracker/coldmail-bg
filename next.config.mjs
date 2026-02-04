/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
  },
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;
