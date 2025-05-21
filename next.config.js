/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.cloudinary.com; style-src 'self' 'unsafe-inline' https://*.cloudinary.com; img-src 'self' data: https: blob: https://*.cloudinary.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 