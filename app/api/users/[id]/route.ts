// Fichier : app/api/users/[id]/route.ts
// Description : API pour gérer un utilisateur spécifique

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === VALIDATION SCHEMAS === //

const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'MANAGER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  password: z.string().min(6).optional()
})

// === GET - Récupérer un utilisateur === //

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        birthDate: true,
        profession: true,
        school: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            contacts: true,
            payments: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Erreur GET /api/users/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}



// === PATCH - Mettre à jour un utilisateur === //

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validation des données
    const validatedData = UpdateUserSchema.parse(body)

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Vérifier l'unicité de l'email si modifié
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }

    // Retirer le mot de passe des données (géré séparément)
    const { password, ...updateData } = validatedData

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Utilisateur mis à jour avec succès'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH /api/users/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// === DELETE - Supprimer un utilisateur === //

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: true,
        payments: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Ne pas permettre la suppression si l'utilisateur a des données liées
    if (user.bookings.length > 0 || user.payments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer un utilisateur avec des réservations ou paiements' 
        },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}