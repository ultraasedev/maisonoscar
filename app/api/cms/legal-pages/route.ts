import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour les pages légales
const LegalPageSchema = z.object({
  pageType: z.enum(['mentions-legales', 'cgv', 'cgu', 'politique-confidentialite']),
  title: z.string().min(1, "Titre requis"),
  content: z.string().min(1, "Contenu requis"),
  isActive: z.boolean().optional()
})

// GET - Récupérer les pages légales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    if (pageType) {
      // Récupérer une page spécifique
      const page = await prisma.legalPage.findUnique({
        where: { pageType }
      })
      
      if (!page) {
        // Créer une page par défaut si elle n'existe pas
        const defaultTitles: Record<string, string> = {
          'mentions-legales': 'Mentions légales',
          'cgv': 'Conditions générales de vente',
          'cgu': 'Conditions générales d\'utilisation',
          'politique-confidentialite': 'Politique de confidentialité'
        }
        
        const newPage = await prisma.legalPage.create({
          data: {
            pageType,
            title: defaultTitles[pageType] || 'Page légale',
            content: '<p>Contenu à définir</p>',
            isActive: true
          }
        })
        
        return NextResponse.json({
          success: true,
          data: newPage
        })
      }
      
      return NextResponse.json({
        success: true,
        data: page
      })
    }
    
    // Récupérer toutes les pages
    const pages = await prisma.legalPage.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { pageType: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      data: pages
    })
    
  } catch (error) {
    console.error('Erreur GET /api/cms/legal-pages:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des pages' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une page légale
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    
    if (!pageType) {
      return NextResponse.json(
        { success: false, error: 'Type de page requis' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Vérifier si la page existe
    const existing = await prisma.legalPage.findUnique({
      where: { pageType }
    })
    
    let page
    if (existing) {
      // Mettre à jour la page existante
      page = await prisma.legalPage.update({
        where: { pageType },
        data: {
          title: body.title,
          content: body.content,
          isActive: body.isActive,
          lastEditedBy: body.lastEditedBy
        }
      })
    } else {
      // Créer une nouvelle page
      const validatedData = LegalPageSchema.parse({ ...body, pageType })
      page = await prisma.legalPage.create({
        data: validatedData
      })
    }
    
    return NextResponse.json({
      success: true,
      data: page,
      message: 'Page mise à jour avec succès'
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
    
    console.error('Erreur PUT /api/cms/legal-pages:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la page' },
      { status: 500 }
    )
  }
}