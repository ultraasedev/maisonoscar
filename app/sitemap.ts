import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || 'https://maisonoscar.fr';
  
  // Pages statiques principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/#chambres`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];
  
  // Récupérer les chambres actives depuis la base de données
  try {
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });
    
    // Ajouter les pages de chambres si on décide d'avoir des pages individuelles
    // const roomPages = rooms.map(room => ({
    //   url: `${baseUrl}/chambres/${room.id}`,
    //   lastModified: room.updatedAt,
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.7,
    // }));
    
    // Pour l'instant, on n'ajoute pas les pages de chambres individuelles
    // car elles n'existent pas encore dans l'app
    // return [...staticPages, ...roomPages];
    
    return staticPages;
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    // En cas d'erreur, retourner au moins les pages statiques
    return staticPages;
  }
}