import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour les paramètres du site
const SiteSettingsSchema = z.object({
  siteName: z.string().optional(),
  siteUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  ogImageUrl: z.string().url().optional(),
  facebookUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  adminEmail: z.string().email().optional(),
  notificationEmail: z.string().email().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  facebookPixelId: z.string().optional()
})

// GET - Récupérer les paramètres du site
export async function GET(request: NextRequest) {
  try {
    // Récupérer le premier (et unique) enregistrement de paramètres
    let settings = await prisma.siteSettings.findFirst()
    
    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Maison Oscar',
          siteUrl: 'https://maisonoscar.fr',
          metaTitle: 'Maison Oscar - Colocation étudiante à Bruz',
          metaDescription: 'Découvrez nos chambres en colocation à Bruz, proche de Rennes. Idéal pour étudiants et jeunes actifs.',
          metaKeywords: ['colocation', 'étudiant', 'Bruz', 'Rennes', 'chambre', 'logement'],
          contactEmail: 'contact@maisonoscar.fr',
          adminEmail: 'admin@maisonoscar.fr'
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    })
    
  } catch (error) {
    console.error('Erreur GET /api/cms/settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres du site
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SiteSettingsSchema.parse(body)
    
    // Récupérer l'ID du premier enregistrement
    const existing = await prisma.siteSettings.findFirst()
    
    let settings
    if (existing) {
      // Mettre à jour les paramètres existants
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: validatedData
      })
    } else {
      // Créer de nouveaux paramètres
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Maison Oscar',
          siteUrl: 'https://maisonoscar.fr',
          ...validatedData
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Paramètres mis à jour avec succès'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.issues
        },
        { status: 400 }
      )
    }
    
    console.error('Erreur PUT /api/cms/settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}