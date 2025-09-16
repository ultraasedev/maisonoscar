// Fichier : app/api/rooms/route.ts
// Description : API CRUD pour les chambres - SCHEMA COMPLET CORRIGÉ

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === ENUMS PRISMA === //
const RoomStatusEnum = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE'] as const
type RoomStatus = typeof RoomStatusEnum[number]

// === VALIDATION SCHEMAS COMPLETS === //

const CreateRoomSchema = z.object({
  // Champs de base
  name: z.string().min(1, "Le nom est requis"),
  number: z.number().int().positive("Le numéro doit être positif"),
  price: z.number().positive("Le prix doit être positif"),
  surface: z.number().positive("La surface doit être positive"),
  description: z.string().min(10, "Description trop courte"),
  
  // Équipements de base
  hasPrivateBathroom: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasDesk: z.boolean().default(true),
  hasCloset: z.boolean().default(true),
  hasWindow: z.boolean().default(true),
  
  // Localisation
  floor: z.number().int().min(0).default(0),
  orientation: z.string().default('Sud'),
  exposure: z.enum(['SUNNY', 'SHADED', 'MIXED']).default('SUNNY'),
  
  // Images et visite virtuelle
  images: z.array(z.string()).default([]), // ✅ CORRIGÉ: Pas forcément des URLs valides
  virtualTour: z.string().optional(),
  isVirtualTourActive: z.boolean().default(false),
  
  // ✅ AJOUTÉ: Nouveaux champs couchage
  bedType: z.enum(['SINGLE', 'DOUBLE', 'BUNK', 'QUEEN', 'KING']).default('DOUBLE'),
  bedCount: z.number().int().min(1).default(1),
  sheetsProvided: z.boolean().default(true),
  
  // ✅ AJOUTÉ: Nouveaux champs cuisine
  kitchenType: z.enum(['SHARED', 'PRIVATE', 'KITCHENETTE']).default('SHARED'),
  kitchenEquipment: z.array(z.string()).default([]),
  hasMicrowave: z.boolean().default(false),
  hasOven: z.boolean().default(false),
  hasCookingPlates: z.boolean().default(false),
  cookingPlateType: z.enum(['GAS', 'INDUCTION', 'ELECTRIC']).default('INDUCTION'),
  
  // ✅ AJOUTÉ: Nouveaux équipements
  hasTV: z.boolean().default(false),
  
  // ✅ AJOUTÉ: Règlement
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false)
})

const UpdateRoomSchema = CreateRoomSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
  isActive: z.boolean().optional()
})

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
    const limit = parseInt(searchParams.get('limit') || '50') // ✅ Plus de résultats par défaut
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

    // Si aucune chambre en DB, retourner des données mock
    if (rooms.length === 0 && !statusParam && !minPrice && !maxPrice) {
      const mockRooms = [
        {
          id: '1',
          name: 'Chambre Océan',
          number: 1,
          price: 520,
          surface: 12,
          description: 'Belle chambre lumineuse avec vue sur le jardin',
          status: 'AVAILABLE' as RoomStatus,
          floor: 0,
          orientation: 'Sud',
          exposure: 'SUNNY',
          hasPrivateBathroom: false,
          hasBalcony: false,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: false,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
          virtualTour: '',
          isVirtualTourActive: false,
          isActive: true,
          bedType: 'DOUBLE',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'SHARED',
          kitchenEquipment: ['micro-ondes', 'plaques', 'four'],
          hasMicrowave: true,
          hasOven: true,
          hasCookingPlates: true,
          cookingPlateType: 'INDUCTION',
          petsAllowed: false,
          smokingAllowed: false,
          bookings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Chambre Forêt',
          number: 2,
          price: 550,
          surface: 14,
          description: 'Chambre spacieuse avec balcon privatif',
          status: 'AVAILABLE' as RoomStatus,
          floor: 1,
          orientation: 'Ouest',
          exposure: 'SUNNY',
          hasPrivateBathroom: false,
          hasBalcony: true,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: true,
          images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
          virtualTour: '',
          isVirtualTourActive: false,
          isActive: true,
          bedType: 'DOUBLE',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'SHARED',
          kitchenEquipment: ['micro-ondes', 'plaques', 'four'],
          hasMicrowave: true,
          hasOven: true,
          hasCookingPlates: true,
          cookingPlateType: 'INDUCTION',
          petsAllowed: false,
          smokingAllowed: false,
          bookings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Chambre Soleil',
          number: 3,
          price: 680,
          surface: 18,
          description: 'Grande chambre avec salle de bain privative',
          status: 'AVAILABLE' as RoomStatus,
          floor: 1,
          orientation: 'Sud',
          exposure: 'SUNNY',
          hasPrivateBathroom: true,
          hasBalcony: false,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: true,
          images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457'],
          virtualTour: '',
          isVirtualTourActive: false,
          isActive: true,
          bedType: 'QUEEN',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'PRIVATE',
          kitchenEquipment: ['micro-ondes', 'plaques', 'four', 'lave-vaisselle'],
          hasMicrowave: true,
          hasOven: true,
          hasCookingPlates: true,
          cookingPlateType: 'INDUCTION',
          petsAllowed: false,
          smokingAllowed: false,
          bookings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      return NextResponse.json({
        success: true,
        data: mockRooms,
        pagination: {
          page: 1,
          limit,
          total: mockRooms.length,
          totalPages: 1
        }
      })
    }

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
    
    console.log('📝 Données reçues pour création chambre:', body) // ✅ Debug
    
    // Validation des données
    const validatedData = CreateRoomSchema.parse(body)
    
    console.log('✅ Données validées:', validatedData) // ✅ Debug

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

    // ✅ CORRIGÉ: Créer la chambre avec tous les nouveaux champs
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

    console.log('🎉 Chambre créée avec succès:', room.id) // ✅ Debug

    return NextResponse.json({
      success: true,
      data: room,
      message: 'Chambre créée avec succès'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreur de validation Zod:', error.issues) // ✅ Debug détaillé
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.issues
        },
        { status: 400 }
      )
    }

    console.error('❌ Erreur POST /api/rooms:', error)
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