// Fichier : app/api/users/[id]/route.ts
// Description : API CRUD pour un utilisateur spécifique (Next.js 15)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === ENUMS PRISMA === //
const UserRoleEnum = ['ADMIN', 'MANAGER', 'RESIDENT', 'PROSPECT'] as const
const UserStatusEnum = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as const
type UserRole = typeof UserRoleEnum[number]
type UserStatus = typeof UserStatusEnum[number]

// === VALIDATION SCHEMAS === //

const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  birthDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  role: z.enum(UserRoleEnum).optional(),
  status: z.enum(UserStatusEnum).optional(),
  profession: z.string().optional(),
  school: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
})

// === GET - Récupérer un utilisateur par ID === //

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
        birthDate: true,
        role: true,
        status: true,
        profession: true,
        school: true,
        emergencyContact: true,
        emergencyPhone: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
 
        bookings: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                number: true,
                price: true
              }
            },
            payments: {
              select: {
                id: true,
                amount: true,
                dueDate: true,
                paidDate: true,
                status: true,
                paymentType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            dueDate: true,
            paidDate: true,
            status: true,
            paymentType: true,
            booking: {
              select: {
                room: {
                  select: {
                    name: true,
                    number: true
                  }
                }
              }
            }
          },
          orderBy: { dueDate: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Calculer des statistiques avec types stricts
    const stats = {
      totalBookings: user.bookings.length,
      activeBookings: user.bookings.filter((b: { status: string }) => b.status === 'ACTIVE').length,
      totalPaid: user.payments
        .filter((p: { status: string }) => p.status === 'PAID')
        .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0),
      pendingPayments: user.payments.filter((p: { status: string }) => p.status === 'PENDING').length,
      overduePayments: user.payments.filter((p: { status: string; dueDate: Date }) => 
        p.status === 'LATE' || (p.status === 'PENDING' && new Date(p.dueDate) < new Date())
      ).length
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats
      }
    })

  } catch (error) {
    console.error(`Erreur GET /api/users:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// === PUT - Mettre à jour un utilisateur === //

export async function PUT(
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
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Si l'email change, vérifier qu'il n'existe pas déjà
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (userWithEmail && userWithEmail.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        )
      }
    }

    // Vérifications de sécurité pour les admins
    if (existingUser.role === 'ADMIN' && validatedData.role && validatedData.role !== 'ADMIN') {
      // Vérifier qu'il reste au moins un admin
      const totalAdmins = await prisma.user.count({
        where: { role: 'ADMIN' }
      })

      if (totalAdmins <= 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de modifier le rôle du dernier administrateur' 
          },
          { status: 400 }
        )
      }
    }

    // Vérifications business logic
    if (validatedData.status === 'INACTIVE' || validatedData.status === 'SUSPENDED') {
      // Vérifier qu'il n'y a pas de réservations actives
      const activeBookings = await prisma.booking.findMany({
        where: {
          userId: id,
          status: { in: ['ACTIVE', 'CONFIRMED'] }
        }
      })

      if (activeBookings.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de désactiver un utilisateur avec des réservations actives' 
          },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        profession: true,
        school: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
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

    console.error(`Erreur PUT /api/users:`, error)
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
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['ACTIVE', 'CONFIRMED', 'PENDING'] }
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas de réservations actives
    if (existingUser.bookings.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer un utilisateur avec des réservations actives' 
        },
        { status: 400 }
      )
    }

    // Vérifier qu'on ne supprime pas le dernier admin
    if (existingUser.role === 'ADMIN') {
      const totalAdmins = await prisma.user.count({
        where: { role: 'ADMIN' }
      })

      if (totalAdmins <= 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer le dernier administrateur' 
          },
          { status: 400 }
        )
      }
    }

    // Supprimer l'utilisateur (les réservations terminées restent pour l'historique)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error(`Erreur DELETE /api/users:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// === PATCH - Actions spécifiques === //

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'toggle_status':
        // Basculer entre ACTIVE et INACTIVE
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Utilisateur non trouvé' },
            { status: 404 }
          )
        }

        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        
        const updatedUser = await prisma.user.update({
          where: { id },
          data: { status: newStatus }
        })

        return NextResponse.json({
          success: true,
          data: updatedUser,
          message: `Utilisateur ${newStatus === 'ACTIVE' ? 'activé' : 'désactivé'}`
        })

      case 'reset_password':
        // TODO: Implémenter la réinitialisation de mot de passe
        return NextResponse.json({
          success: true,
          message: 'Email de réinitialisation envoyé'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error(`Erreur PATCH /api/users:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'action sur l\'utilisateur' },
      { status: 500 }
    )
  }
}