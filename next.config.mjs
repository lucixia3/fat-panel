/** @type {import('next').NextConfig} */
const nextConfig = {
  // API proxy rewrite: all /api/* calls go to the FastAPI backend
  async rewrites() {
    const apiBase = process.env.API_BASE_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
  webpack(config) {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
