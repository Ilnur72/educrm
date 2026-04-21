/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3001"] },
  },
  async rewrites() {
    return [
      { source: "/hisobotlar",         destination: "/dashboard/hisobotlar" },
      { source: "/hisobotlar/:path*",  destination: "/dashboard/hisobotlar/:path*" },
    ];
  },
};

export default nextConfig;
