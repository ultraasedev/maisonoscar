import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { token, signatureData, signerName, signerEmail, signerRole } = await request.json()
    const { id } = await context.params
    const contractId = id

    // Vérifier le token JWT
    let tokenData
    try {
      tokenData = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token de signature invalide ou expiré' },
        { status: 401 }
      )
    }

    // Vérifier que le token correspond au contrat
    if (tokenData.contractId !== contractId) {
      return NextResponse.json(
        { success: false, error: 'Token non valide pour ce contrat' },
        { status: 403 }
      )
    }

    // Vérifier que le contrat existe
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        signatures: true,
        booking: {
          include: {
            user: true
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contrat non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si ce signataire a déjà signé
    const existingSignature = contract.signatures.find(
      sig => sig.signerEmail === signerEmail
    )

    if (existingSignature) {
      return NextResponse.json(
        { success: false, error: 'Ce contrat a déjà été signé par cette personne' },
        { status: 400 }
      )
    }

    // Récupérer les métadonnées de la requête
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] :
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Enregistrer la signature
    await prisma.contractSignature.create({
      data: {
        contractId: contractId,
        signerName: signerName,
        signerEmail: signerEmail,
        signerRole: signerRole as any,
        signatureData: signatureData,
        signedAt: new Date(),
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // Vérifier si tous les signataires ont signé
    const updatedContract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        signatures: true,
        booking: {
          include: {
            user: true
          }
        }
      }
    })

    if (!updatedContract) {
      throw new Error('Contrat non trouvé après signature')
    }

    // Calculer le nombre de signataires requis
    const booking = updatedContract.booking
    let requiredSignatures = 1 // Locataire principal

    // Note: Les roommates sont gérés par les signatures maintenant
    // Le nombre de signatures requis doit être calculé depuis les signatures elles-mêmes
    const expectedRoommates = updatedContract.signatures.filter(s => s.signerRole === 'ROOMMATE').length
    requiredSignatures += expectedRoommates

    // Si tous ont signé, générer automatiquement le PDF final avec signature admin
    if (updatedContract.signatures.length >= requiredSignatures) {
      try {
        // Générer automatiquement le PDF final avec signature admin
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const pdfResponse = await fetch(`${baseUrl}/api/contracts/${contractId}/generate-final-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (pdfResponse.ok) {
          console.log(`PDF final généré automatiquement pour le contrat ${contractId}`)
        } else {
          console.error('Erreur génération PDF final:', await pdfResponse.text())
        }
      } catch (error) {
        console.error('Erreur appel génération PDF:', error)
        // Marquer quand même le contrat comme signé même si PDF échoue
        await prisma.contract.update({
          where: { id: contractId },
          data: { status: 'SIGNED' }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Signature enregistrée avec succès',
      allSigned: updatedContract.signatures.length >= requiredSignatures
    })

  } catch (error) {
    console.error('Erreur signature contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement de la signature' },
      { status: 500 }
    )
  }
}

function generateSignedContractFilename(contract: any): string {
  const booking = contract.booking
  const bookingRequest = booking.bookingRequest

  // Nom du locataire principal
  let names = [
    `${bookingRequest.firstName}-${bookingRequest.lastName}`.toLowerCase()
      .replace(/[^a-z0-9\-]/g, '')
  ]

  // Ajouter les colocataires
  if (bookingRequest.roommates && bookingRequest.roommates.length > 0) {
    bookingRequest.roommates.forEach((roommate: any) => {
      names.push(
        `${roommate.firstName}-${roommate.lastName}`.toLowerCase()
          .replace(/[^a-z0-9\-]/g, '')
      )
    })
  }

  // Calculer la durée
  const startDate = new Date(contract.startDate)
  const endDate = new Date(contract.endDate)
  const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))

  // Nom de la chambre
  const roomName = booking.room?.name?.toLowerCase().replace(/[^a-z0-9\-]/g, '') || 'chambre'

  return `contrat-${names.join('-')}-${months}mois-${roomName}.pdf`
}