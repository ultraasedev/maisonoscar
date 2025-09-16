import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour le contenu CMS
const ContentSectionSchema = z.object({
  key: z.string().min(1, "La clé est requise"),
  name: z.string().min(1, "Le nom est requis"),
  content: z.any(), // Structure flexible selon la section
  isActive: z.boolean().optional()
})

// GET - Récupérer toutes les sections ou une section spécifique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    if (key) {
      // Récupérer une section spécifique
      const section = await prisma.contentSection.findUnique({
        where: { key }
      })
      
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section non trouvée' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: section
      })
    }
    
    // Récupérer toutes les sections
    const sections = await prisma.contentSection.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { key: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      data: sections
    })
    
  } catch (error) {
    console.error('Erreur GET /api/cms/content:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du contenu' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ContentSectionSchema.parse(body)
    
    // Vérifier si la clé existe déjà
    const existing = await prisma.contentSection.findUnique({
      where: { key: validatedData.key }
    })
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Une section avec cette clé existe déjà' },
        { status: 400 }
      )
    }
    
    const section = await prisma.contentSection.create({
      data: {
        ...validatedData,
        content: JSON.stringify(validatedData.content)
      }
    })
    
    return NextResponse.json({
      success: true,
      data: section,
      message: 'Section créée avec succès'
    }, { status: 201 })
    
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
    
    console.error('Erreur POST /api/cms/content:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la section' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une section
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Clé de section requise' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const section = await prisma.contentSection.update({
      where: { key },
      data: {
        name: body.name,
        content: JSON.stringify(body.content),
        isActive: body.isActive,
        lastEditedBy: body.lastEditedBy
      }
    })
    
    return NextResponse.json({
      success: true,
      data: section,
      message: 'Section mise à jour avec succès'
    })
    
  } catch (error) {
    console.error('Erreur PUT /api/cms/content:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la section' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Clé de section requise' },
        { status: 400 }
      )
    }
    
    await prisma.contentSection.delete({
      where: { key }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Section supprimée avec succès'
    })
    
  } catch (error) {
    console.error('Erreur DELETE /api/cms/content:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la section' },
      { status: 500 }
    )
  }
}