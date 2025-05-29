/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you need to proxy API requests during development to avoid CORS issues
  // (though CORS should be handled by the backend)
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*', // Proxy to Backend
  //     },
  //   ]
  // },
};

module.exports = nextConfig;