// API pour gérer les demandes de réservation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

// Schéma de validation pour la création d'une demande
const CreateBookingRequestSchema = z.object({
  roomId: z.string(),
  desiredStartDate: z.string().transform(str => new Date(str)),
  desiredDuration: z.number().int().min(1),
  hasLivedInColiving: z.boolean(),
  
  // Informations personnelles
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  birthDate: z.string().transform(str => new Date(str)),
  birthPlace: z.string().min(1),
  nationality: z.string().min(1),
  maritalStatus: z.string().min(1),
  
  // Situation logement
  currentHousingSituation: z.enum(['TENANT', 'OWNER', 'HOSTED']),
  currentAddress: z.string().min(1),
  currentCity: z.string().min(1),
  currentZipCode: z.string().min(1),
  
  // Si mineur
  isMinor: z.boolean(),
  legalGuardian1FirstName: z.string().optional(),
  legalGuardian1LastName: z.string().optional(),
  legalGuardian1Phone: z.string().optional(),
  legalGuardian1Email: z.string().optional(),
  legalGuardian1Address: z.string().optional(),
  
  legalGuardian2FirstName: z.string().optional(),
  legalGuardian2LastName: z.string().optional(),
  legalGuardian2Phone: z.string().optional(),
  legalGuardian2Email: z.string().optional(),
  legalGuardian2Address: z.string().optional(),
  
  // Situation professionnelle
  professionalStatus: z.enum(['EMPLOYEE', 'SELF_EMPLOYED', 'STUDENT', 'ALTERNANT', 'UNEMPLOYED', 'OTHER']),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  position: z.string().optional(),
  monthlyIncome: z.number().optional(),
  contractType: z.string().optional(),
  contractStartDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  
  // Pour étudiants
  schoolName: z.string().optional(),
  studyLevel: z.string().optional(),
  studyField: z.string().optional(),
  
  // Garant
  hasGuarantor: z.boolean(),
  guarantorType: z.enum(['INDIVIDUAL', 'VISALE', 'COMPANY', 'NONE']),
  guarantorFirstName: z.string().optional(),
  guarantorLastName: z.string().optional(),
  guarantorPhone: z.string().optional(),
  guarantorEmail: z.string().optional(),
  guarantorAddress: z.string().optional(),
  guarantorRelationship: z.string().optional(),
  guarantorMonthlyIncome: z.number().optional(),
  guarantorEmployerName: z.string().optional(),
  guarantorProfession: z.string().optional(),
  
  // Colocataires
  roommates: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    birthDate: z.string()
  })).optional(),
  
  // Documents et statut
  documents: z.any().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED']).optional()
})

// GET - Récupérer les demandes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const email = searchParams.get('email')
    
    const where: any = {}
    if (status) where.status = status
    if (email) where.email = email
    
    const bookingRequests = await prisma.bookingRequest.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: bookingRequests
    })
    
  } catch (error) {
    console.error('Erreur GET /api/booking-requests:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle demande
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    const validatedData = CreateBookingRequestSchema.parse(body)
    
    // Vérifier que la chambre existe et est disponible
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId }
    })
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Chambre introuvable' },
        { status: 404 }
      )
    }
    
    if (room.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: 'Cette chambre n\'est pas disponible' },
        { status: 400 }
      )
    }
    
    // Extraire les colocataires du body
    const { roommates, ...bookingData } = validatedData
    
    // Créer la demande avec les colocataires
    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        ...bookingData,
        submittedAt: bookingData.status === 'SUBMITTED' ? new Date() : undefined,
        ...(roommates && roommates.length > 0 ? {
          roommates: {
            create: roommates.map(rm => ({
              firstName: rm.firstName,
              lastName: rm.lastName,
              email: rm.email,
              phone: rm.phone,
              birthDate: new Date(rm.birthDate)
            }))
          }
        } : {})
      },
      include: {
        room: true
      }
    })
    
    // Si la demande est soumise, envoyer les emails
    if (validatedData.status === 'SUBMITTED') {
      // Importer les templates
      const { bookingRequestEmail } = await import('@/lib/email-templates')
      
      // Email au candidat avec template stylisé
      const candidateHtml = bookingRequestEmail({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        roomName: room.name,
        startDate: new Date(validatedData.desiredStartDate).toLocaleDateString('fr-FR'),
        duration: validatedData.desiredDuration
      })
      
      await sendEmail(
        validatedData.email,
        'Confirmation de votre demande - Maison Oscar',
        candidateHtml
      )
      
      // Email aux admins
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      })
      
      // Importer le service WhatsApp
      const { notifyNewBookingRequest } = await import('@/lib/whatsapp')
      
      for (const admin of admins) {
        // Email
        await sendEmail(
          admin.email,
          'Nouvelle demande de réservation - Maison Oscar',
          `
          <h2>Nouvelle demande de réservation</h2>
          <p>Une nouvelle demande vient d'être soumise.</p>
          <br>
          <p><strong>Candidat :</strong> ${validatedData.firstName} ${validatedData.lastName}</p>
          <p><strong>Email :</strong> ${validatedData.email}</p>
          <p><strong>Téléphone :</strong> ${validatedData.phone}</p>
          <p><strong>Chambre demandée :</strong> ${room.name}</p>
          <p><strong>Date de début :</strong> ${new Date(validatedData.desiredStartDate).toLocaleDateString('fr-FR')}</p>
          <p><strong>Durée :</strong> ${validatedData.desiredDuration} mois</p>
          <br>
          <p><a href="${process.env.NEXTAUTH_URL}/admin/prospects" style="background: black; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir le dossier</a></p>
          `
        )
        
        // WhatsApp si le numéro est configuré
        if (admin.phone) {
          await notifyNewBookingRequest(admin.phone, {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            roomName: room.name,
            startDate: new Date(validatedData.desiredStartDate).toLocaleDateString('fr-FR')
          })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: bookingRequest,
      message: 'Demande créée avec succès'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erreur POST /api/booking-requests:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    )
  }
}