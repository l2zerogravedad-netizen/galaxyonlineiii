/** @type {import('next').NextConfig} */
const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.RAILWAY_SERVICE_GALAXYONLINEIII_URL ||
  'https://galaxyonlineiii-production.up.railway.app';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const destination = apiBase.startsWith('http')
      ? `${apiBase}/api/:path*`
      : `https://${apiBase}/api/:path*`;
    return [
      {
        source: '/api/:path*',
        destination,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
