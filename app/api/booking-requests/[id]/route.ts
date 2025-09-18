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
  rejectionReason: z.string().optional().nullable()
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
    console.log('Received body:', body)

    let validatedData
    try {
      validatedData = UpdateStatusSchema.parse(body)
    } catch (error) {
      console.error('Validation error:', error)
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error },
        { status: 400 }
      )
    }
    
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
      // Envoyer seulement un email de félicitations (pas de génération automatique de contrat)
      try {
        // Importer sendEmail
        const { sendEmail } = await import('@/lib/email')

        // Envoyer l'email au candidat
        await sendEmail(
          currentRequest.email,
          'Félicitations ! Votre dossier a été approuvé',
          `
          <h2>🎉 Félicitations ${currentRequest.firstName} !</h2>
          <p>Votre dossier de candidature pour la chambre <strong>${currentRequest.room.name}</strong> a été approuvé !</p>

          <p>Notre équipe va maintenant préparer votre contrat de location et vous le transmettre prochainement.</p>

          <p><strong>Prochaines étapes :</strong></p>
          <ol>
            <li>Réception de votre contrat par email</li>
            <li>Signature de votre contrat en ligne</li>
            <li>Versement du dépôt de garantie</li>
            <li>Planification de votre arrivée</li>
          </ol>

          <p>Bienvenue chez Maison Oscar ! 🏡</p>
          `
        )
      } catch (error) {
        console.error('Erreur envoi email:', error)
      }
    } else if (validatedData.status === 'REJECTED') {
      // Envoyer email de refus
      const { sendEmail } = await import('@/lib/email')
      await sendEmail(
        currentRequest.email,
        'Mise à jour de votre candidature - Maison Oscar',
        `
        <h2>Mise à jour de votre candidature</h2>
        <p>Bonjour ${currentRequest.firstName},</p>
        <p>Nous vous remercions pour votre candidature pour la chambre <strong>${currentRequest.room.name}</strong>.</p>
        <p>Malheureusement, nous ne pouvons pas donner suite à votre demande à ce moment.</p>
        ${validatedData.rejectionReason ? `<p><strong>Motif :</strong> ${validatedData.rejectionReason}</p>` : ''}
        <p>N'hésitez pas à postuler pour d'autres chambres disponibles.</p>
        <p>Cordialement,<br>L'équipe Maison Oscar</p>
        `
      )
    } else if (validatedData.status === 'INCOMPLETE') {
      // Envoyer email pour demander des documents manquants
      const { sendEmail } = await import('@/lib/email')
      await sendEmail(
        currentRequest.email,
        'Documents manquants - Maison Oscar',
        `
        <h2>Documents manquants pour votre candidature</h2>
        <p>Bonjour ${currentRequest.firstName},</p>
        <p>Votre candidature pour la chambre <strong>${currentRequest.room.name}</strong> est en cours de traitement.</p>
        <p>Cependant, nous avons besoin de documents complémentaires pour finaliser l'étude de votre dossier.</p>
        ${validatedData.reviewNotes ? `<p><strong>Documents requis :</strong><br>${validatedData.reviewNotes}</p>` : ''}
        <p>Merci de nous transmettre ces éléments dans les meilleurs délais.</p>
        <p>Cordialement,<br>L'équipe Maison Oscar</p>
        `
      )
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