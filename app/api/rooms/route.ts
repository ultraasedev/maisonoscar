
// Fichier : app/api/rooms/route.ts
// Description : API CRUD pour les chambres (types Prisma corrects)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === ENUMS PRISMA === //
const RoomStatusEnum = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE'] as const
type RoomStatus = typeof RoomStatusEnum[number]

// === VALIDATION SCHEMAS === //

const CreateRoomSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  number: z.number().int().positive("Le numéro doit être positif"),
  price: z.number().positive("Le prix doit être positif"),
  surface: z.number().positive("La surface doit être positive"),
  description: z.string().min(10, "Description trop courte"),
  hasPrivateBathroom: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasDesk: z.boolean().default(true),
  hasCloset: z.boolean().default(true),
  hasWindow: z.boolean().default(true),
  floor: z.number().int().min(0).default(0),
  orientation: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  virtualTour: z.string().url().optional(),
  isVirtualTourActive: z.boolean().default(false),
})

const UpdateRoomSchema = CreateRoomSchema.partial()

// === GET - Récupérer toutes les chambres === //

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres de filtrage
    const statusParam = searchParams.get('status')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const hasBalcony = searchParams.get('hasBalcony')
    const floor = searchParams.get('floor')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Construction des filtres avec validation du status
    const where: {
      status?: RoomStatus
      price?: { gte?: number; lte?: number }
      hasBalcony?: boolean
      floor?: number
    } = {}
    
    // Validation du status avec l'enum Prisma
    if (statusParam && RoomStatusEnum.includes(statusParam as RoomStatus)) {
      where.status = statusParam as RoomStatus
    }
    
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }
    if (hasBalcony === 'true') where.hasBalcony = true
    if (floor) where.floor = parseInt(floor)

    // Requête avec pagination
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: { number: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.room.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur GET /api/rooms:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des chambres' },
      { status: 500 }
    )
  }
}

// === POST - Créer une nouvelle chambre === //

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = CreateRoomSchema.parse(body)

    // Vérifier que le numéro de chambre n'existe pas déjà
    const existingRoom = await prisma.room.findUnique({
      where: { number: validatedData.number }
    })

    if (existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Une chambre avec ce numéro existe déjà' },
        { status: 400 }
      )
    }

    // Créer la chambre
    const room = await prisma.room.create({
      data: {
        ...validatedData,
        status: 'AVAILABLE', // Statut par défaut
        isActive: true
      },
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
      data: room,
      message: 'Chambre créée avec succès'
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

    console.error('Erreur POST /api/rooms:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la chambre' },
      { status: 500 }
    )
  }
}

// === PUT - Actions bulk sur les chambres === //

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, roomIds, status } = body

    if (action === 'bulk_status' && roomIds && Array.isArray(roomIds)) {
      
      // Validation du status avec l'enum
      if (!RoomStatusEnum.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide' },
          { status: 400 }
        )
      }

      // Vérifier les contraintes business avant mise à jour
      if (status === 'UNAVAILABLE' || status === 'MAINTENANCE') {
        const activeBookings = await prisma.booking.findMany({
          where: {
            roomId: { in: roomIds },
            status: { in: ['ACTIVE', 'CONFIRMED'] }
          }
        })

        if (activeBookings.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Impossible de changer le statut de chambres avec des réservations actives' 
            },
            { status: 400 }
          )
        }
      }

      // Mise à jour du statut en lot
      const result = await prisma.room.updateMany({
        where: {
          id: { in: roomIds }
        },
        data: { status: status as RoomStatus }
      })

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} chambre(s) mise(s) à jour`
      })
    }

    if (action === 'bulk_activate' && roomIds && Array.isArray(roomIds)) {
      const { isActive } = body

      const result = await prisma.room.updateMany({
        where: {
          id: { in: roomIds }
        },
        data: { isActive: Boolean(isActive) }
      })

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} chambre(s) ${isActive ? 'activée(s)' : 'désactivée(s)'}`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Action non supportée' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur PUT /api/rooms:', error)
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
    const roomIds = searchParams.get('ids')?.split(',') || []

    if (roomIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun ID de chambre fourni' },
        { status: 400 }
      )
    }

    // Vérifier qu'aucune chambre n'a de réservation active
    const activeBookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
        status: { in: ['ACTIVE', 'CONFIRMED'] }
      }
    })

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer des chambres avec des réservations actives' 
        },
        { status: 400 }
      )
    }

    // Suppression en lot
    const result = await prisma.room.deleteMany({
      where: {
        id: { in: roomIds }
      }
    })

    return NextResponse.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} chambre(s) supprimée(s)`
    })

  } catch (error) {
    console.error('Erreur DELETE /api/rooms:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}