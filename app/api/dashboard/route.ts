// Fichier : app/api/dashboard/route.ts
// Description : API pour les statistiques du dashboard (TypeScript strict)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { 
  RoomWithBookings, 
  RoomRevenue, 
  GroupByResult,
  PaymentWithDetails,
  UpcomingPayment,
  ContactSummary,
  NewContact
} from '@/types/api'

// === GET - Récupérer les statistiques du dashboard === //

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // Période en jours

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // === STATISTIQUES GÉNÉRALES === //

    const [
      totalUsers,
      totalRooms,
      totalBookings,
      totalContacts,
      activeBookings,
      occupiedRooms,
      availableRooms,
      pendingPayments,
      latePayments,
      recentBookings,
      recentPayments,
      recentContacts
    ] = await Promise.all([
      // Comptes totaux
      prisma.user.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.contact.count(),

      // Statuts actifs
      prisma.booking.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.room.count({
        where: { status: 'OCCUPIED' }
      }),
      prisma.room.count({
        where: { status: 'AVAILABLE' }
      }),

      // Paiements
      prisma.payment.count({
        where: { status: 'PENDING' }
      }),
      prisma.payment.count({
        where: { status: 'LATE' }
      }),

      // Données récentes
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.count({
        where: {
          createdAt: { gte: startDate },
          status: 'PAID'
        }
      }),
      prisma.contact.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ])

    // === REVENUS === //

    const revenueData = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paymentType: 'RENT',
        paidDate: { gte: startDate }
      },
      _sum: { amount: true }
    })

    const monthlyRevenue = revenueData._sum.amount || 0

    // Revenus par mois (12 derniers mois)
    const monthlyRevenueData = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const revenue = await prisma.payment.aggregate({
          where: {
            status: 'PAID',
            paymentType: 'RENT',
            paidDate: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: { amount: true }
        })

        return {
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          revenue: revenue._sum.amount || 0
        }
      })
    )

    // === TAUX D'OCCUPATION === //

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    // === RÉPARTITION PAR STATUT === //

    const [usersByRole, roomsByStatus, bookingsByStatus, contactsByType] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.room.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.contact.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ]) as [GroupByResult[], GroupByResult[], GroupByResult[], GroupByResult[]]

    // === DONNÉES DÉTAILLÉES === //

    // Top 5 des chambres par revenus
    const topRooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: { status: 'ACTIVE' },
          include: {
            payments: {
              where: {
                status: 'PAID',
                paymentType: 'RENT',
                paidDate: { gte: startDate }
              }
            }
          }
        }
      },
      take: 5
    }) as RoomWithBookings[]

    const topRoomsWithRevenue: RoomRevenue[] = topRooms
      .map((room: RoomWithBookings) => ({
        id: room.id,
        name: room.name,
        number: room.number,
        revenue: room.bookings.reduce(
          (sum: number, booking: { payments: Array<{ amount: number }> }) =>
            sum + booking.payments.reduce((paySum: number, payment: { amount: number }) => paySum + payment.amount, 0),
          0
        )
      }))
      .sort((a: RoomRevenue, b: RoomRevenue) => b.revenue - a.revenue)

    // Prochains paiements (7 prochains jours)
    const upcomingDate = new Date()
    upcomingDate.setDate(upcomingDate.getDate() + 7)

    const upcomingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: new Date(),
          lte: upcomingDate
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        booking: {
          include: {
            room: {
              select: {
                name: true,
                number: true
              }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    }) as PaymentWithDetails[]

    // Nouveaux contacts (non traités)
    const newContacts = await prisma.contact.findMany({
      where: { status: 'NEW' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subject: true,
        type: true,
        createdAt: true
      }
    }) as ContactSummary[]

    // === CONSTRUCTION DE LA RÉPONSE === //

    const upcomingPaymentsFormatted: UpcomingPayment[] = upcomingPayments.map((payment: PaymentWithDetails) => ({
      id: payment.id,
      amount: payment.amount,
      dueDate: payment.dueDate,
      tenant: `${payment.user.firstName} ${payment.user.lastName}`,
      room: `${payment.booking.room.name} (${payment.booking.room.number})`,
      isOverdue: payment.dueDate < new Date()
    }))

    const newContactsFormatted: NewContact[] = newContacts.map((contact: ContactSummary) => ({
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      subject: contact.subject,
      type: contact.type,
      createdAt: contact.createdAt
    }))

    const dashboardData = {
      // Statistiques principales
      overview: {
        totalUsers,
        totalRooms,
        totalBookings,
        totalContacts,
        activeBookings,
        occupiedRooms,
        availableRooms,
        pendingPayments,
        latePayments,
        occupancyRate,
        monthlyRevenue
      },

      // Tendances récentes
      trends: {
        period: daysAgo,
        recentBookings,
        recentPayments,
        recentContacts,
        monthlyRevenueData: monthlyRevenueData.reverse() // Plus ancien au plus récent
      },

      // Répartitions
      distribution: {
        usersByRole: usersByRole.map((item: GroupByResult) => ({
          role: item.role || 'unknown',
          count: item._count.role || 0
        })),
        roomsByStatus: roomsByStatus.map((item: GroupByResult) => ({
          status: item.status || 'unknown',
          count: item._count.status || 0
        })),
        bookingsByStatus: bookingsByStatus.map((item: GroupByResult) => ({
          status: item.status || 'unknown',
          count: item._count.status || 0
        })),
        contactsByType: contactsByType.map((item: GroupByResult) => ({
          type: item.type || 'unknown',
          count: item._count.type || 0
        }))
      },

      // Données détaillées
      details: {
        topRooms: topRoomsWithRevenue,
        upcomingPayments: upcomingPaymentsFormatted,
        newContacts: newContactsFormatted
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Erreur GET /api/dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}