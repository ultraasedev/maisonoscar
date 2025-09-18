import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  pdfData: z.string().optional(),
})

// GET - Récupérer un template spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const template = await prisma.contractTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Erreur GET /api/contract-templates/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du template' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateTemplateSchema.parse(body)

    // Si ce template est marqué comme défaut, enlever le statut défaut des autres
    if (validatedData.isDefault) {
      await prisma.contractTemplate.updateMany({
        where: {
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    const template = await prisma.contractTemplate.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template mis à jour avec succès'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur PUT /api/contract-templates/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier que le template existe
    const template = await prisma.contractTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template introuvable' },
        { status: 404 }
      )
    }

    // Ne pas supprimer le template par défaut s'il y en a d'autres
    if (template.isDefault) {
      const otherTemplates = await prisma.contractTemplate.count({
        where: { id: { not: id } }
      })

      if (otherTemplates > 0) {
        return NextResponse.json(
          { success: false, error: 'Impossible de supprimer le template par défaut' },
          { status: 400 }
        )
      }
    }

    await prisma.contractTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Template supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur DELETE /api/contract-templates/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    )
  }
}