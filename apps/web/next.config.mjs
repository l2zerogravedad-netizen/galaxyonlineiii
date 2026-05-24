/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://galaxyonlineiii-production.up.railway.app/api/:path*',
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
