// Fichier : app/api/bookings/route.ts
// Description : API CRUD pour les réservations (types Prisma corrects)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { 
  BookingWithRelations, 
  BookingStats, 
  BookingWithStats,
  PaymentSummary 
} from '@/types/api'

// === ENUMS PRISMA === //
const BookingStatusEnum = ['PENDING', 'CONFIRMED', 'ACTIVE', 'ENDED', 'CANCELLED'] as const
type BookingStatus = typeof BookingStatusEnum[number]

// === VALIDATION SCHEMAS === //

const CreateBookingSchema = z.object({
  userId: z.string().min(1, "ID utilisateur requis"),
  roomId: z.string().min(1, "ID chambre requis"),
  startDate: z.string().datetime().transform(val => new Date(val)),
  endDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  monthlyRent: z.number().positive("Le loyer doit être positif"),
  securityDeposit: z.number().min(0, "La caution ne peut être négative").default(0),
  notes: z.string().optional(),
})

const UpdateBookingSchema = z.object({
  startDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  status: z.enum(BookingStatusEnum).optional(),
  monthlyRent: z.number().positive().optional(),
  securityDeposit: z.number().min(0).optional(),
  contractSigned: z.boolean().optional(),
  inventorySigned: z.boolean().optional(),
  keysGiven: z.boolean().optional(),
  notes: z.string().optional(),
})

// === GET - Récupérer toutes les réservations === //

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres de filtrage
    const statusParam = searchParams.get('status')
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Construction des filtres avec validation du status
    const where: {
      status?: BookingStatus
      userId?: string
      roomId?: string
      startDate?: { gte?: Date; lte?: Date }
      endDate?: { gte?: Date; lte?: Date }
    } = {}
    
    // Validation du status avec l'enum Prisma
    if (statusParam && BookingStatusEnum.includes(statusParam as BookingStatus)) {
      where.status = statusParam as BookingStatus
    }
    
    if (userId) where.userId = userId
    if (roomId) where.roomId = roomId
    if (startDate) where.startDate = { gte: new Date(startDate) }
    if (endDate) where.endDate = { lte: new Date(endDate) }

    // Requête avec pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profession: true,
              school: true
            }
          },
          room: {
            select: {
              id: true,
              name: true,
              number: true,
              price: true,
              surface: true,
              status: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              dueDate: true,
              paidDate: true,
              status: true,
              paymentType: true,
              isLate: true
            },
            orderBy: { dueDate: 'asc' }
          },
          _count: {
            select: {
              payments: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ])

    // ✅ CORRECTION : Calculer des statistiques pour chaque réservation avec types explicites
    const bookingsWithStats: BookingWithStats[] = bookings.map((booking: BookingWithRelations) => {
      const totalPaid = booking.payments
        .filter((p: PaymentSummary) => p.status === 'PAID')
        .reduce((sum: number, p: PaymentSummary) => sum + p.amount, 0)
      
      const totalDue = booking.payments
        .filter((p: PaymentSummary) => p.status !== 'CANCELLED')
        .reduce((sum: number, p: PaymentSummary) => sum + p.amount, 0)

      const overdue = booking.payments
        .filter((p: PaymentSummary) => 
          p.status === 'LATE' || (p.status === 'PENDING' && new Date(p.dueDate) < new Date())
        ).length

      const stats: BookingStats = {
        totalPaid,
        totalDue,
        balance: totalDue - totalPaid,
        overduePayments: overdue,
        completionRate: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0
      }

      return {
        ...booking,
        stats
      } as BookingWithStats
    })

    return NextResponse.json({
      success: true,
      data: bookingsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur GET /api/bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

// === POST - Créer une nouvelle réservation === //

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = CreateBookingSchema.parse(body)

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que la chambre existe et est disponible
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
      include: {
        bookings: {
          where: {
            status: { in: ['ACTIVE', 'CONFIRMED'] },
            OR: [
              // Réservations qui se chevauchent
              {
                startDate: { lte: validatedData.endDate || new Date('2030-12-31') },
                endDate: { gte: validatedData.startDate }
              },
              // Réservations actives sans date de fin
              {
                status: 'ACTIVE',
                endDate: null
              }
            ]
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    if (room.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: 'Chambre non disponible' },
        { status: 400 }
      )
    }

    if (room.bookings.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Chambre déjà réservée pour cette période' },
        { status: 400 }
      )
    }

    // Calculer le montant total
    const monthsDuration = validatedData.endDate 
      ? Math.ceil((validatedData.endDate.getTime() - validatedData.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 1

    const totalAmount = (validatedData.monthlyRent * monthsDuration) + validatedData.securityDeposit

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        totalAmount,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            number: true
          }
        }
      }
    })

    // Créer les paiements associés si nécessaire
    if (validatedData.securityDeposit > 0) {
      await prisma.payment.create({
        data: {
          userId: validatedData.userId,
          bookingId: booking.id,
          amount: validatedData.securityDeposit,
          dueDate: validatedData.startDate,
          paymentType: 'SECURITY_DEPOSIT',
          status: 'PENDING'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Réservation créée avec succès'
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

    console.error('Erreur POST /api/bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la réservation' },
      { status: 500 }
    )
  }
}

// === PUT - Actions bulk sur les réservations === //

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, bookingIds, status } = body

    if (action === 'bulk_status' && bookingIds && Array.isArray(bookingIds)) {
      
      // Validation du status avec l'enum
      if (!BookingStatusEnum.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide' },
          { status: 400 }
        )
      }

      // Mise à jour du statut en lot
      const result = await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds }
        },
        data: { status: status as BookingStatus }
      })

      // Si on active des réservations, mettre à jour le statut des chambres
      if (status === 'ACTIVE') {
        const bookings = await prisma.booking.findMany({
          where: { id: { in: bookingIds } },
          select: { roomId: true }
        })

        // ✅ CORRECTION : Type explicite pour les bookings
        const roomIds = bookings.map((booking: { roomId: string }) => booking.roomId)
        
        await prisma.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: 'OCCUPIED' }
        })
      }

      // Si on annule/termine des réservations, libérer les chambres si nécessaire
      if (status === 'CANCELLED' || status === 'ENDED') {
        const bookings = await prisma.booking.findMany({
          where: { id: { in: bookingIds } },
          select: { roomId: true }
        })

        // ✅ CORRECTION : Type explicite pour les bookings
        const roomIds = bookings.map((booking: { roomId: string }) => booking.roomId)
        
        // Vérifier qu'il n'y a pas d'autres réservations actives
        for (const roomId of roomIds) {
          const activeBookings = await prisma.booking.count({
            where: {
              roomId,
              status: { in: ['ACTIVE', 'CONFIRMED'] },
              id: { notIn: bookingIds }
            }
          })

          if (activeBookings === 0) {
            await prisma.room.update({
              where: { id: roomId },
              data: { status: 'AVAILABLE' }
            })
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} réservation(s) mise(s) à jour`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Action non supportée' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur PUT /api/bookings:', error)
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
    const bookingIds = searchParams.get('ids')?.split(',') || []

    if (bookingIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun ID de réservation fourni' },
        { status: 400 }
      )
    }

    // Vérifier qu'on ne supprime que des réservations annulées ou terminées
    const bookingsToDelete = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        status: { notIn: ['CANCELLED', 'ENDED'] }
      }
    })

    if (bookingsToDelete.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer des réservations actives ou confirmées' 
        },
        { status: 400 }
      )
    }

    // Supprimer d'abord les paiements associés
    await prisma.payment.deleteMany({
      where: {
        bookingId: { in: bookingIds }
      }
    })

    // Puis supprimer les réservations
    const result = await prisma.booking.deleteMany({
      where: {
        id: { in: bookingIds }
      }
    })

    return NextResponse.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} réservation(s) supprimée(s)`
    })

  } catch (error) {
    console.error('Erreur DELETE /api/bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}