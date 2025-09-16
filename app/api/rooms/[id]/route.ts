// Fichier : app/api/rooms/[id]/route.ts
// Description : API CRUD pour une chambre spécifique - CORRIGÉE COMPATIBLE SCHEMA PRISMA

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// === VALIDATION SCHEMA === //

const UpdateRoomSchema = z.object({
  // Champs de base
  name: z.string().min(1).optional(),
  number: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  surface: z.number().positive().optional(),
  description: z.string().optional(),
  
  // Statut et activation
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
  isActive: z.boolean().optional(),
  
  // Localisation
  floor: z.number().int().min(0).optional(),
  orientation: z.string().optional(),
  exposure: z.enum(['SUNNY', 'SHADED', 'MIXED']).optional(),
  
  // Équipements de base
  hasPrivateBathroom: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasDesk: z.boolean().optional(),
  hasCloset: z.boolean().optional(),
  hasWindow: z.boolean().optional(),
  hasTV: z.boolean().optional(),
  
  // Couchage - UTILISER LES CHAMPS PRISMA EXISTANTS
  bedType: z.enum(['SINGLE', 'DOUBLE', 'BUNK', 'QUEEN', 'KING']).optional(),
  bedCount: z.number().int().min(1).optional(),
  sheetsProvided: z.boolean().optional(),
  
  // Support des configurations multiples (pour le frontend)
  bedConfigurations: z.array(z.object({
    type: z.enum(['SINGLE', 'DOUBLE', 'BUNK', 'QUEEN', 'KING']),
    count: z.number().int().min(1).max(4)
  })).optional(),
  
  // Cuisine
  kitchenType: z.enum(['SHARED', 'PRIVATE', 'KITCHENETTE']).optional(),
  kitchenEquipment: z.array(z.string()).optional(),
  hasMicrowave: z.boolean().optional(),
  hasOven: z.boolean().optional(),
  hasCookingPlates: z.boolean().optional(),
  cookingPlateType: z.enum(['GAS', 'INDUCTION', 'ELECTRIC']).optional(),
  
  // Règlement
  petsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  
  // Images
  images: z.array(z.string()).optional(),
  virtualTour: z.string().optional(),
  isVirtualTourActive: z.boolean().optional(),
  
  // Frontend only fields (ignorés par l'API)
  imageFiles: z.array(z.any()).optional(),
  paymentConfig: z.object({
    rentDueDay: z.number().int().min(1).max(31),
    securityDepositType: z.enum(['ONE_MONTH', 'TWO_MONTHS', 'CUSTOM']),
    securityDepositAmount: z.number().optional()
  }).optional()
})

// === FONCTIONS UTILITAIRES === //

function processBedConfigurations(bedConfigs?: any[]) {
  if (!bedConfigs || bedConfigs.length === 0) {
    return {}
  }

  // Premier lit comme type principal (compatibilité schema Prisma)
  const primaryBed = bedConfigs[0]
  const totalBeds = bedConfigs.reduce((sum, bed) => sum + bed.count, 0)

  return {
    bedType: primaryBed.type,
    bedCount: totalBeds
  }
}

function processRoomForFrontend(room: any) {
  return {
    ...room,
    // Ajouter bedConfigurations pour le frontend
    bedConfigurations: [{ type: room.bedType, count: room.bedCount }],
    // Ajouter paymentConfig par défaut
    paymentConfig: {
      rentDueDay: 1,
      securityDepositType: 'ONE_MONTH'
    }
  }
}

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

    // Calculer des statistiques
    const stats = {
      totalBookings: room.bookings.length,
      activeBookings: room.bookings.filter((b: any) => b.status === 'ACTIVE').length,
      totalRevenue: room.bookings
        .filter((b: any) => b.status === 'ACTIVE')
        .reduce((sum: number, b: any) => sum + (b.monthlyRent || 0), 0),
      currentTenant: room.bookings.find((b: any) => b.status === 'ACTIVE')?.user || null
    }

    const processedRoom = processRoomForFrontend(room)

    return NextResponse.json({
      success: true,
      data: {
        ...processedRoom,
        stats
      }
    })

  } catch (error) {
    console.error(`Erreur GET /api/rooms/[id]:`, error)
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

    console.log('📥 Données reçues pour modification:', body)

    // Validation des données
    const validatedData = UpdateRoomSchema.parse(body)

    console.log('✅ Données validées:', validatedData)

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

    // Traitement des configurations de lits
    const bedData = processBedConfigurations(validatedData.bedConfigurations)

    // Préparation des données pour la mise à jour (EXCLURE les champs frontend)
    const { bedConfigurations, imageFiles, paymentConfig, ...updateData } = validatedData

    const dataToUpdate = {
      ...updateData,
      ...bedData
    }

    console.log('💾 Données pour mise à jour Prisma:', dataToUpdate)

    // Mettre à jour la chambre
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: dataToUpdate,
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

    const processedRoom = processRoomForFrontend(updatedRoom)

    console.log('🎉 Chambre modifiée avec succès:', updatedRoom.id)

    return NextResponse.json({
      success: true,
      data: processedRoom,
      message: 'Chambre mise à jour avec succès'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreur de validation Zod:', error.issues)
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

    console.error(`❌ Erreur PUT /api/rooms/[id]:`, error)
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

    // Supprimer la chambre
    await prisma.room.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Chambre supprimée avec succès'
    })

  } catch (error) {
    console.error(`Erreur DELETE /api/rooms/[id]:`, error)
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

        const processedRoom = processRoomForFrontend(updatedRoom)

        return NextResponse.json({
          success: true,
          data: processedRoom,
          message: `Chambre ${newStatus === 'AVAILABLE' ? 'disponible' : 'indisponible'}`
        })

      case 'activate_3d_tour':
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

        const processed3DRoom = processRoomForFrontend(updated3DRoom)

        return NextResponse.json({
          success: true,
          data: processed3DRoom,
          message: `Visite 3D ${updated3DRoom.isVirtualTourActive ? 'activée' : 'désactivée'}`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error(`Erreur PATCH /api/rooms/[id]:`, error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'action sur la chambre' },
      { status: 500 }
    )
  }
}