import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    dirs: ['app', 'components', 'lib', 'types'],
    ignoreDuringBuilds: false,
  },

  experimental: {
    optimizeCss: false,
    optimizeServerReact: true,
    // ✅ FIX: Simplifier les Server Actions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 31536000,
  },

  // ✅ FIX: Configuration webpack minimale et sécurisée
  webpack: (config, { dev, isServer }) => {
    // Éviter les modifications complexes en développement
    if (dev) {
      // Fallbacks simples pour le développement
      if (!isServer) {
        config.resolve = config.resolve || {};
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          path: false,
          os: false,
        };
      }
      return config;
    }

    // Optimisations uniquement en production
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
      };

      // Optimisations split chunks seulement en production
      if (config.optimization) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        };
      }
    }

    return config;
  },

  compress: true,
  poweredByHeader: false,
  trailingSlash: false,

  // ✅ FIX: Headers simplifiés pour éviter les conflits
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  env: {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'contact@maisonoscar.fr',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@maisonoscar.fr',
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;