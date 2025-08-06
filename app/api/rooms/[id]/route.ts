// Fichier : app/api/rooms/[id]/route.ts
// Description : API CRUD pour une chambre spécifique (Next.js 15)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === VALIDATION SCHEMAS === //

const UpdateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  number: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  surface: z.number().positive().optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
  isActive: z.boolean().optional(),
  hasPrivateBathroom: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasDesk: z.boolean().optional(),
  hasCloset: z.boolean().optional(),
  hasWindow: z.boolean().optional(),
  floor: z.number().int().min(0).optional(),
  orientation: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  virtualTour: z.string().url().optional(),
  isVirtualTourActive: z.boolean().optional(),
})

// === GET - Récupérer une chambre par ID === //

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 5
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Calculer des statistiques avec types
    interface BookingWithUser {
      status: string
      monthlyRent: number
      user?: {
        id: string
        firstName: string
        lastName: string
        email: string
        phone: string | null
      }
    }

    const stats = {
      totalBookings: room.bookings.length,
      activeBookings: room.bookings.filter((b: BookingWithUser) => b.status === 'ACTIVE').length,
      totalRevenue: room.bookings
        .filter((b: BookingWithUser) => b.status === 'ACTIVE')
        .reduce((sum: number, b: BookingWithUser) => sum + b.monthlyRent, 0),
      currentTenant: room.bookings.find((b: BookingWithUser) => b.status === 'ACTIVE')?.user || null
    }

    return NextResponse.json({
      success: true,
      data: {
        ...room,
        stats
      }
    })

  } catch (error) {
    console.error(`Erreur GET /api/rooms:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la chambre' },
      { status: 500 }
    )
  }
}

// === PUT - Mettre à jour une chambre === //

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validation des données
    const validatedData = UpdateRoomSchema.parse(body)

    // Vérifier que la chambre existe
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    })

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Si le numéro change, vérifier qu'il n'existe pas déjà
    if (validatedData.number && validatedData.number !== existingRoom.number) {
      const roomWithNumber = await prisma.room.findUnique({
        where: { number: validatedData.number }
      })

      if (roomWithNumber && roomWithNumber.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Une chambre avec ce numéro existe déjà' },
          { status: 400 }
        )
      }
    }

    // Vérifications business logic
    if (validatedData.status === 'UNAVAILABLE' || validatedData.isActive === false) {
      // Vérifier qu'il n'y a pas de réservations actives
      const activeBookings = await prisma.booking.findMany({
        where: {
          roomId: id,
          status: { in: ['ACTIVE', 'CONFIRMED'] }
        }
      })

      if (activeBookings.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de désactiver une chambre avec des réservations actives' 
          },
          { status: 400 }
        )
      }
    }

    // Mettre à jour la chambre
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: validatedData,
      include: {
        bookings: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRoom,
      message: 'Chambre mise à jour avec succès'
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

    console.error(`Erreur PUT /api/rooms:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la chambre' },
      { status: 500 }
    )
  }
}

// === DELETE - Supprimer une chambre === //

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier que la chambre existe
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['ACTIVE', 'CONFIRMED', 'PENDING'] }
          }
        }
      }
    })

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas de réservations actives
    if (existingRoom.bookings.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer une chambre avec des réservations actives' 
        },
        { status: 400 }
      )
    }

    // Supprimer la chambre (les réservations terminées restent pour l'historique)
    await prisma.room.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Chambre supprimée avec succès'
    })

  } catch (error) {
    console.error(`Erreur DELETE /api/rooms:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la chambre' },
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
      case 'toggle_availability':
        // Basculer entre AVAILABLE et UNAVAILABLE
        const room = await prisma.room.findUnique({ where: { id } })
        if (!room) {
          return NextResponse.json(
            { success: false, error: 'Chambre non trouvée' },
            { status: 404 }
          )
        }

        const newStatus = room.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
        
        const updatedRoom = await prisma.room.update({
          where: { id },
          data: { status: newStatus }
        })

        return NextResponse.json({
          success: true,
          data: updatedRoom,
          message: `Chambre ${newStatus === 'AVAILABLE' ? 'disponible' : 'indisponible'}`
        })

      case 'activate_3d_tour':
        // Activer/désactiver la visite 3D
        const roomFor3D = await prisma.room.findUnique({ where: { id } })
        if (!roomFor3D) {
          return NextResponse.json(
            { success: false, error: 'Chambre non trouvée' },
            { status: 404 }
          )
        }

        const updated3DRoom = await prisma.room.update({
          where: { id },
          data: { isVirtualTourActive: !roomFor3D.isVirtualTourActive }
        })

        return NextResponse.json({
          success: true,
          data: updated3DRoom,
          message: `Visite 3D ${updated3DRoom.isVirtualTourActive ? 'activée' : 'désactivée'}`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error(`Erreur PATCH /api/rooms:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'action sur la chambre' },
      { status: 500 }
    )
  }
}