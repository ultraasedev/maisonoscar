import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour les témoignages
const TestimonialSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  role: z.string().min(1, "Rôle requis"),
  content: z.string().min(1, "Contenu requis"),
  rating: z.number().min(1).max(5).default(5),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0)
})

// GET - Récupérer les témoignages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    const testimonials = await prisma.testimonial.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    // Si aucun témoignage en DB, retourner des données mock
    if (testimonials.length === 0) {
      const mockTestimonials = [
        {
          id: '1',
          name: 'Marie L.',
          role: 'Étudiante en médecine',
          content: 'La Maison Oscar a transformé ma vie étudiante ! L\'ambiance est chaleureuse, les espaces communs sont parfaits pour étudier ou se détendre, et j\'ai rencontré des amis pour la vie.',
          rating: 5,
          imageUrl: 'https://i.pravatar.cc/150?img=1',
          isActive: true,
          order: 1,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Thomas B.',
          role: 'Étudiant en ingénierie',
          content: 'Un rapport qualité-prix imbattable ! Tout est inclus, la maison est moderne et bien entretenue. Le propriétaire est toujours disponible. Je recommande vivement !',
          rating: 5,
          imageUrl: 'https://i.pravatar.cc/150?img=3',
          isActive: true,
          order: 2,
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Sophie M.',
          role: 'Étudiante en commerce',
          content: 'Vivre à la Maison Oscar, c\'est plus qu\'une colocation, c\'est une vraie communauté. Les événements organisés créent une ambiance unique. C\'est le meilleur choix que j\'ai fait !',
          rating: 5,
          imageUrl: 'https://i.pravatar.cc/150?img=5',
          isActive: true,
          order: 3,
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date()
        }
      ]
      
      return NextResponse.json({
        success: true,
        data: activeOnly ? mockTestimonials.filter(t => t.isActive) : mockTestimonials
      })
    }
    
    return NextResponse.json({
      success: true,
      data: testimonials
    })
    
  } catch (error) {
    console.error('Erreur GET /api/cms/testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau témoignage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = TestimonialSchema.parse(body)
    
    const testimonial = await prisma.testimonial.create({
      data: validatedData
    })
    
    return NextResponse.json({
      success: true,
      data: testimonial,
      message: 'Témoignage créé avec succès'
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
    
    console.error('Erreur POST /api/cms/testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du témoignage' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un témoignage
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        content: body.content,
        rating: body.rating,
        imageUrl: body.imageUrl,
        isActive: body.isActive,
        order: body.order
      }
    })
    
    return NextResponse.json({
      success: true,
      data: testimonial,
      message: 'Témoignage mis à jour avec succès'
    })
    
  } catch (error) {
    console.error('Erreur PUT /api/cms/testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du témoignage' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un témoignage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }
    
    await prisma.testimonial.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    })
    
  } catch (error) {
    console.error('Erreur DELETE /api/cms/testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du témoignage' },
      { status: 500 }
    )
  }
}