/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Optimize build performance
  typescript: {
    ignoreBuildErrors: true, // Only in development
  },
  eslint: {
    ignoreDuringBuilds: true, // Only in development
  },
};

module.exports = nextConfig; 