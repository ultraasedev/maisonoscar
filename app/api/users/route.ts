// Fichier : app/api/users/route.ts
// Description : API CRUD pour les utilisateurs (types Prisma corrects)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === ENUMS PRISMA === //
const UserRoleEnum = ['ADMIN', 'MANAGER', 'RESIDENT', 'PROSPECT'] as const
const UserStatusEnum = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as const
type UserRole = typeof UserRoleEnum[number]
type UserStatus = typeof UserStatusEnum[number]

// === VALIDATION SCHEMAS === //

const CreateUserSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  firstName: z.string().min(2, "Prénom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  birthDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  role: z.enum(UserRoleEnum).default('PROSPECT'),
  status: z.enum(UserStatusEnum).default('PENDING'),
  profession: z.string().optional(),
  school: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
})

const UpdateUserSchema = CreateUserSchema.partial()

// === GET - Récupérer tous les utilisateurs === //

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres de filtrage
    const roleParam = searchParams.get('role')
    const statusParam = searchParams.get('status')
    const search = searchParams.get('search') // Recherche par nom/email
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Construction des filtres avec validation des enums
    const where: {
      role?: UserRole
      status?: UserStatus
      OR?: Array<{
        firstName?: { contains: string; mode: 'insensitive' }
        lastName?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
      }>
    } = {}
    
    // Validation du role avec l'enum Prisma
    if (roleParam && UserRoleEnum.includes(roleParam as UserRole)) {
      where.role = roleParam as UserRole
    }
    
    // Validation du status avec l'enum Prisma
    if (statusParam && UserStatusEnum.includes(statusParam as UserStatus)) {
      where.status = statusParam as UserStatus
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Requête avec pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [
          { role: 'asc' },
          { firstName: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
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
          profileImage: true,
          createdAt: true,
          updatedAt: true,
          bookings: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              monthlyRent: true,
              room: {
                select: {
                  id: true,
                  name: true,
                  number: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              bookings: true,
              payments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur GET /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// === POST - Créer un nouvel utilisateur === //

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = CreateUserSchema.parse(body)

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
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
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Utilisateur créé avec succès'
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

    console.error('Erreur POST /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// === PUT - Actions bulk sur les utilisateurs === //

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userIds, status, role } = body

    if (action === 'bulk_status' && userIds && Array.isArray(userIds)) {
      
      // Validation du status avec l'enum
      if (!UserStatusEnum.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide' },
          { status: 400 }
        )
      }

      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds }
        },
        data: { status: status as UserStatus }
      })

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} utilisateur(s) ${status.toLowerCase()}`
      })
    }

    if (action === 'bulk_role' && userIds && Array.isArray(userIds)) {
      
      // Validation du role avec l'enum
      if (!UserRoleEnum.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Rôle invalide' },
          { status: 400 }
        )
      }

      // Vérifier qu'on ne change pas le rôle du dernier admin
      if (role !== 'ADMIN') {
        const adminsToChange = await prisma.user.count({
          where: {
            id: { in: userIds },
            role: 'ADMIN'
          }
        })

        if (adminsToChange > 0) {
          const totalAdmins = await prisma.user.count({
            where: { role: 'ADMIN' }
          })

          if (totalAdmins - adminsToChange < 1) {
            return NextResponse.json(
              { success: false, error: 'Au moins un administrateur doit être conservé' },
              { status: 400 }
            )
          }
        }
      }

      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds }
        },
        data: { role: role as UserRole }
      })

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} utilisateur(s) mis à jour`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Action non supportée' },
      { status: 400 }
    )

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

    console.error('Erreur PUT /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// === DELETE - Suppression en lot === //

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('ids')?.split(',') || []

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun ID d\'utilisateur fourni' },
        { status: 400 }
      )
    }

    // Vérifier qu'aucun utilisateur n'a de réservations actives
    const activeBookings = await prisma.booking.findMany({
      where: {
        userId: { in: userIds },
        status: { in: ['ACTIVE', 'CONFIRMED'] }
      }
    })

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer des utilisateurs avec des réservations actives' 
        },
        { status: 400 }
      )
    }

    // Vérifier qu'on ne supprime pas le dernier admin
    const adminsToDelete = await prisma.user.count({
      where: {
        id: { in: userIds },
        role: 'ADMIN'
      }
    })

    if (adminsToDelete > 0) {
      const totalAdmins = await prisma.user.count({
        where: { role: 'ADMIN' }
      })

      if (totalAdmins - adminsToDelete < 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer le dernier administrateur' 
          },
          { status: 400 }
        )
      }
    }

    // Suppression en lot
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds }
      }
    })

    return NextResponse.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} utilisateur(s) supprimé(s)`
    })

  } catch (error) {
    console.error('Erreur DELETE /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}