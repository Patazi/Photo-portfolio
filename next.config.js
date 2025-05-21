/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@next/font'],
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const cspValue = isDevelopment
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.cloudinary.com; style-src 'self' 'unsafe-inline' https://*.cloudinary.com; img-src 'self' data: https: blob: https://*.cloudinary.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests;"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.cloudinary.com; style-src 'self' 'unsafe-inline' https://*.cloudinary.com; img-src 'self' data: https: blob: https://*.cloudinary.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests;";

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 