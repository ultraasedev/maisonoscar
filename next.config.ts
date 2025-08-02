/**
 * Fichier : next.config.ts
 * Description : Configuration Next.js 15 optimisée pour Maison Oscar Co-living
 * Déploiement : VPS Hostinger + GitLab CI/CD
 * URL : maisonoscar.fr
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // === CONFIGURATION DE BASE === //
  
  /**
   * Active TypeScript strict mode
   */
  typescript: {
    ignoreBuildErrors: false, // Strict en production
  },

  /**
   * Configuration ESLint
   */
  eslint: {
    dirs: ['app', 'components', 'lib', 'types'],
    ignoreDuringBuilds: false, // Strict en production
  },

  // === OPTIMISATIONS DE PERFORMANCE === //
  
  /**
   * Configuration expérimentale pour Next.js 15
   */
  experimental: {
    // Optimisation du CSS
    optimizeCss: true,
    
    // Optimisation des fonts
    optimizeServerReact: true,
    
    // Server Actions (stable dans Next.js 15)
    serverActions: {
      allowedOrigins: ['maisonoscar.fr', 'www.maisonoscar.fr', 'localhost:3000'],
    },
  },

  /**
   * Configuration Turbopack (stable dans Next.js 15)
   */
  turbopack: {
    // Configurations Turbopack
  },

  // === OPTIMISATION DES IMAGES === //
  
  images: {
    // Formats optimisés pour les navigateurs modernes
    formats: ['image/webp', 'image/avif'],
    
    // Tailles d'écran supportées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Domaines autorisés pour les images externes
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
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maisonoscar.fr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.maisonoscar.fr',
        pathname: '/**',
      },
      // Pour le développement local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    
    // Cache des images (1 an)
    minimumCacheTTL: 31536000,
  },

  // === OPTIMISATIONS DE BUILD === //
  
  /**
   * Optimisation des bundles
   */
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimisations pour la production
    if (!dev) {
      // Optimisation du code splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
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
        },
      };
    }

    // Support des fichiers SVG comme composants React
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimisation pour MongoDB
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Packages externes pour les server components
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push(
        'mongodb',
        '@mongodb-js/zstd',
        'sharp',
        'nodemailer'
      );
    }

    return config;
  },

  /**
   * Active la compression
   */
  compress: true,

  /**
   * Supprime le header X-Powered-By pour la sécurité
   */
  poweredByHeader: false,

  /**
   * Output standalone pour VPS
   */
  output: 'standalone',

  // === REDIRECTIONS === //
  
  async redirects() {
    return [
      // Redirections SEO
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/maisons',
        destination: '/logements',
        permanent: true,
      },
      {
        source: '/booking',
        destination: '/reservation',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
      },
      // Redirection www vers non-www
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'www.maisonoscar.fr',
          },
        ],
        destination: 'https://maisonoscar.fr/$1',
        permanent: true,
      },
    ];
  },

  // === REWRITES === //
  
  async rewrites() {
    return [
      // API routes admin
      {
        source: '/admin/api/:path*',
        destination: '/api/admin/:path*',
      },
      // Sitemap dynamique
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      // Robots.txt dynamique
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      // Manifest PWA
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
    ];
  },

  // === HEADERS DE SÉCURITÉ === //
  
  async headers() {
    return [
      {
        // Headers de sécurité pour toutes les routes
        source: '/(.*)',
        headers: [
          // Protection XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Protection MIME
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Protection Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://maisonoscar.fr",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://vitals.vercel-insights.com https://vercel.live",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=(self)',
              'interest-cohort=()',
            ].join(', '),
          },
          // Strict Transport Security (pour HTTPS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Cache pour les assets statiques
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache pour les fichiers statiques
        source: '/:file(favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|manifest.json)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache pour les images
        source: '/:path*\\.(jpg|jpeg|png|webp|avif|gif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000',
          },
        ],
      },
      {
        // Headers pour les API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://maisonoscar.fr',
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

  // === VARIABLES D'ENVIRONNEMENT === //
  
  env: {
    // Variables publiques pour le client
    SITE_URL: process.env.SITE_URL || 'https://maisonoscar.fr',
    CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'contact@maisonoscar.fr',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@maisonoscar.fr',
  },

  // Variables d'environnement publiques
  publicRuntimeConfig: {
    siteUrl: process.env.SITE_URL || 'https://maisonoscar.fr',
    contactEmail: process.env.CONTACT_EMAIL || 'contact@maisonoscar.fr',
  },

  // === OPTIMISATIONS ADDITIONNELLES === //
  
  /**
   * Optimisation des polyfills
   */
  compiler: {
    // Supprime les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  /**
   * Configuration des pages d'erreur personnalisées
   */
  async generateBuildId() {
    // ID de build personnalisé pour le cache
    return `maison-oscar-${new Date().getTime()}`;
  },

  // === TRAILING SLASH === //
  
  /**
   * Pas de trailing slash pour les URLs
   */
  trailingSlash: false,
};

// === PLUGINS ET EXTENSIONS === //

/**
 * Plugin d'analyse des bundles (optionnel)
 */
let configWithPlugins = nextConfig;

// Analyse des bundles en développement si activée
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
    openAnalyzer: false,
  });
  configWithPlugins = withBundleAnalyzer(nextConfig);
}

// Export de la configuration
export default configWithPlugins;