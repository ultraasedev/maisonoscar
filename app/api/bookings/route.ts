import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les réservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          room: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    // Récupérer les réservations avec les relations
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        room: {
          select: {
            name: true,
            price: true
          }
        },
        contract: {
          select: {
            id: true,
            signedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: bookings
    })

  } catch (error) {
    console.error('Erreur GET /api/bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une réservation
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de réservation requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, paymentStatus } = body

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        room: {
          select: {
            name: true,
            price: true
          }
        },
        contract: {
          select: {
            id: true,
            signedAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Réservation mise à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur PUT /api/bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la réservation' },
      { status: 500 }
    )
  }
}