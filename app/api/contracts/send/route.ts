import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { contractId } = await request.json()

    // Récupérer le contrat avec les informations de booking
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        booking: {
          include: {
            user: true,
            room: true
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

    const booking = contract.booking
    if (!booking.user) {
      return NextResponse.json(
        { success: false, error: 'Demande de réservation non trouvée' },
        { status: 404 }
      )
    }

    // Générer des tokens de signature pour chaque signataire
    const signers = []

    // Locataire principal
    const principalToken = jwt.sign(
      {
        contractId: contract.id,
        signerEmail: booking.user.email,
        signerName: `${booking.user.firstName} ${booking.user.lastName}`,
        signerRole: 'TENANT',
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 jours
      },
      process.env.JWT_SECRET!
    )

    signers.push({
      email: booking.user.email,
      name: `${booking.user.firstName} ${booking.user.lastName}`,
      role: 'TENANT',
      token: principalToken
    })

    // TODO: Gestion des colocataires
    // Pour l'instant, seul le locataire principal reçoit l'email
    // Les roommates peuvent être ajoutés manuellement via l'interface admin

    // Envoyer l'email à chaque signataire
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    for (const signer of signers) {
      const signUrl = `${baseUrl}/sign-contract/${signer.token}`

      const emailContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2>Signature de contrat - Maison Oscar</h2>

          <p>Bonjour ${signer.name},</p>

          <p>Votre contrat de location pour la chambre <strong>${booking.room.name}</strong> est prêt à être signé.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Détails du contrat :</h3>
            <ul>
              <li><strong>Chambre :</strong> ${booking.room.name}</li>
              <li><strong>Loyer mensuel :</strong> ${contract.monthlyRent}€</li>
              <li><strong>Charges :</strong> ${contract.charges}€</li>
              <li><strong>Dépôt de garantie :</strong> ${contract.deposit}€</li>
              <li><strong>Début du contrat :</strong> ${new Date(contract.startDate).toLocaleDateString('fr-FR')}</li>
              <li><strong>Fin du contrat :</strong> ${new Date(contract.endDate).toLocaleDateString('fr-FR')}</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${signUrl}"
               style="background: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Signer le contrat
            </a>
          </div>

          <p><small>Ce lien est valable 30 jours. Si vous rencontrez des difficultés, contactez-nous à ${process.env.CONTACT_EMAIL}</small></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Maison Oscar - Coliving Premium<br>
            Email envoyé automatiquement, ne pas répondre
          </p>
        </div>
      `

      await sendEmail(
        signer.email,
        `Signature de contrat - ${booking.room.name}`,
        emailContent
      )
    }

    // Marquer le contrat comme envoyé
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'SENT' }
    })

    return NextResponse.json({
      success: true,
      message: `Contrat envoyé à ${signers.length} signataire(s)`,
      signers: signers.map(s => ({ email: s.email, name: s.name, role: s.role }))
    })

  } catch (error) {
    console.error('Erreur envoi contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du contrat' },
      { status: 500 }
    )
  }
}