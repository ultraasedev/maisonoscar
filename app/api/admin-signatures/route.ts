import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const CreateSignatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  signatureData: z.string().startsWith('data:image/'),
  isDefault: z.boolean().optional(),
})

// GET - Récupérer les signatures admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const signatures = await prisma.adminSignature.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Manually fetch createdBy data for signatures that have createdById
    const enrichedSignatures = await Promise.all(
      signatures.map(async (signature) => {
        if (signature.createdById) {
          try {
            const createdBy = await prisma.user.findUnique({
              where: { id: signature.createdById },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            })
            return { ...signature, createdBy }
          } catch (error) {
            console.warn(`Could not fetch user ${signature.createdById}:`, error)
            return { ...signature, createdBy: null }
          }
        }
        return { ...signature, createdBy: null }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedSignatures
    })
  } catch (error) {
    console.error('Erreur GET /api/admin-signatures:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des signatures' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle signature admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateSignatureSchema.parse(body)

    // Si cette signature est marquée comme défaut, enlever le statut défaut des autres
    if (validatedData.isDefault) {
      await prisma.adminSignature.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const signature = await prisma.adminSignature.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        signatureData: validatedData.signatureData,
        isDefault: validatedData.isDefault || false,
        createdById: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: signature,
      message: 'Signature créée avec succès'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur POST /api/admin-signatures:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la signature' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une signature admin
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID manquant' },
        { status: 400 }
      )
    }

    // Vérifier que la signature existe
    const signature = await prisma.adminSignature.findUnique({
      where: { id }
    })

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Signature introuvable' },
        { status: 404 }
      )
    }

    // Supprimer la signature
    await prisma.adminSignature.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Signature supprimée avec succès'
    })
  } catch (error) {
    console.error('Erreur DELETE /api/admin-signatures:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la signature' },
      { status: 500 }
    )
  }
}