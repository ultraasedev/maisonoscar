import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour les témoignages
const TestimonialUpdateSchema = z.object({
  name: z.string().min(1, "Nom requis").optional(),
  role: z.string().min(1, "Rôle requis").optional(),
  content: z.string().min(1, "Contenu requis").optional(),
  rating: z.number().min(1).max(5).optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
})

// PUT - Mettre à jour un témoignage
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = TestimonialUpdateSchema.parse(body)

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: 'Témoignage mis à jour avec succès'
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

    console.error('Erreur PUT /api/cms/testimonials/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du témoignage' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un témoignage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.testimonial.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE /api/cms/testimonials/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du témoignage' },
      { status: 500 }
    )
  }
}