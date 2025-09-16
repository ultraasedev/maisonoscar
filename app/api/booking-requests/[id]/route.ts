// API pour gérer une demande de réservation spécifique

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schéma de validation pour la mise à jour du statut
const UpdateStatusSchema = z.object({
  status: z.enum(['IN_REVIEW', 'INCOMPLETE', 'APPROVED', 'REJECTED', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'DEPOSIT_PENDING', 'COMPLETED']),
  reviewNotes: z.string().optional(),
  rejectionReason: z.string().optional()
})

// GET - Récupérer une demande spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        room: true,
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    if (!bookingRequest) {
      return NextResponse.json(
        { success: false, error: 'Demande introuvable' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: bookingRequest
    })
    
  } catch (error) {
    console.error('Erreur GET /api/booking-requests/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la demande' },
      { status: 500 }
    )
  }
}



// PUT - Mettre à jour une demande
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = UpdateStatusSchema.parse(body)
    
    // Récupérer la demande actuelle
    const currentRequest = await prisma.bookingRequest.findUnique({
      where: { id },
      include: { room: true }
    })
    
    if (!currentRequest) {
      return NextResponse.json(
        { success: false, error: 'Demande introuvable' },
        { status: 404 }
      )
    }
    
    // Mettre à jour la demande
    const updatedRequest = await prisma.bookingRequest.update({
      where: { id },
      data: {
        ...validatedData,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
      include: {
        room: true,
        reviewer: true
      }
    })
    
    // Envoyer des emails selon le nouveau statut
    if (validatedData.status === 'APPROVED') {
      // TODO: Envoyer email d'approbation avec contrat
    } else if (validatedData.status === 'REJECTED') {
      // TODO: Envoyer email de refus
    } else if (validatedData.status === 'INCOMPLETE') {
      // TODO: Envoyer email pour demander des documents manquants
    }
    
    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: 'Demande mise à jour avec succès'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erreur PUT /api/booking-requests/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la demande' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour partiellement une demande  
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    const updatedRequest = await prisma.bookingRequest.update({
      where: { id },
      data: body,
      include: {
        room: true,
        reviewer: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: 'Demande mise à jour avec succès'
    })
    
  } catch (error) {
    console.error('Erreur PATCH /api/booking-requests/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la demande' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une demande
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    await prisma.bookingRequest.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Demande supprimée avec succès'
    })
    
  } catch (error) {
    console.error('Erreur DELETE /api/booking-requests/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la demande' },
      { status: 500 }
    )
  }
}