import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://maisonoscar.fr';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/static/',
        '*.json',
        '/*?*',  // Paramètres de requête
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}