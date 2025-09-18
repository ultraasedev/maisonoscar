import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jsPDF from 'jspdf'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const contractId = id

    // Récupérer le contrat avec toutes les données
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        signatures: {
          orderBy: { signedAt: 'asc' }
        },
        booking: {
          include: {
            room: true,
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

    // Récupérer la signature admin par défaut
    const adminSignature = await prisma.adminSignature.findFirst({
      where: { isDefault: true }
    })

    if (!adminSignature) {
      return NextResponse.json(
        { success: false, error: 'Aucune signature admin configurée' },
        { status: 400 }
      )
    }

    // Générer le PDF
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CONTRAT DE LOCATION EN COLOCATION', pageWidth / 2, 30, { align: 'center' })

    // Numéro de contrat
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Contrat N° ${contract.contractNumber}`, pageWidth / 2, 45, { align: 'center' })

    let yPosition = 70

    // Parties au contrat
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ENTRE LES SOUSSIGNÉS :', margin, yPosition)
    yPosition += 20

    // Le Bailleur
    pdf.setFontSize(12)
    pdf.text('LE BAILLEUR :', margin, yPosition)
    yPosition += 10
    pdf.setFont('helvetica', 'normal')
    pdf.text('Maison Oscar', margin + 10, yPosition)
    yPosition += 8
    pdf.text('Email : contact@maisonoscar.fr', margin + 10, yPosition)
    yPosition += 20

    // Le(s) Locataire(s)
    pdf.setFont('helvetica', 'bold')
    pdf.text('LE(S) LOCATAIRE(S) :', margin, yPosition)
    yPosition += 10

    // Locataire principal
    const booking = contract.booking
    const user = booking.user

    pdf.setFont('helvetica', 'normal')
    pdf.text(`• ${user.firstName} ${user.lastName}`, margin + 10, yPosition)
    yPosition += 8
    pdf.text(`  Email : ${user.email}`, margin + 10, yPosition)
    yPosition += 8
    if (user.phone) {
      pdf.text(`  Téléphone : ${user.phone}`, margin + 10, yPosition)
      yPosition += 8
    }
    yPosition += 2

    // Note: Les colocataires sont gérés via les signatures maintenant

    yPosition += 10

    // Détails du contrat
    pdf.setFont('helvetica', 'bold')
    pdf.text('OBJET DU CONTRAT :', margin, yPosition)
    yPosition += 15

    pdf.setFont('helvetica', 'normal')
    pdf.text(`Chambre : ${booking.room.name}`, margin + 10, yPosition)
    yPosition += 8
    pdf.text(`Numéro : ${booking.room.number}`, margin + 10, yPosition)
    yPosition += 8
    pdf.text(`Loyer mensuel : ${contract.monthlyRent}€`, margin + 10, yPosition)
    yPosition += 8
    pdf.text(`Charges : ${contract.charges}€`, margin + 10, yPosition)
    yPosition += 8
    pdf.text(`Dépôt de garantie : ${contract.deposit}€`, margin + 10, yPosition)
    yPosition += 8
    pdf.text(`Période : du ${new Date(contract.startDate).toLocaleDateString('fr-FR')} au ${new Date(contract.endDate).toLocaleDateString('fr-FR')}`, margin + 10, yPosition)
    yPosition += 30

    // Section signatures
    pdf.setFont('helvetica', 'bold')
    pdf.text('SIGNATURES :', margin, yPosition)
    yPosition += 20

    // Zone signatures tenant/roommates vs bailleur
    const leftX = margin
    const rightX = pageWidth / 2 + 10
    const signatureHeight = 80

    // Locataires (gauche)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Le(s) Locataire(s) :', leftX, yPosition)

    let currentY = yPosition + 15
    contract.signatures.forEach((signature) => {
      if (signature.signerRole === 'TENANT' || signature.signerRole === 'ROOMMATE') {
        // Ajouter la signature
        if (signature.signatureData) {
          try {
            pdf.addImage(signature.signatureData, 'PNG', leftX, currentY, 80, 30)
          } catch (error) {
            console.error('Erreur ajout signature:', error)
          }
        }

        currentY += 35
        pdf.text(signature.signerName, leftX, currentY)
        pdf.text(`${signature.signerRole === 'TENANT' ? 'Locataire principal' : 'Colocataire'}`, leftX, currentY + 8)
        pdf.text(`Signé le ${new Date(signature.signedAt).toLocaleDateString('fr-FR')}`, leftX, currentY + 16)
        currentY += 30
      }
    })

    // Bailleur (droite)
    pdf.text('Le Bailleur :', rightX, yPosition)

    // Signature admin
    if (adminSignature.signatureData) {
      try {
        pdf.addImage(adminSignature.signatureData, 'PNG', rightX, yPosition + 15, 80, 30)
      } catch (error) {
        console.error('Erreur ajout signature admin:', error)
      }
    }

    pdf.text('Maison Oscar', rightX, yPosition + 50)
    pdf.text('Directeur', rightX, yPosition + 58)
    pdf.text(`Signé le ${new Date().toLocaleDateString('fr-FR')}`, rightX, yPosition + 66)

    // Footer
    const footerY = pageHeight - 30
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Document généré automatiquement - Maison Oscar', pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, footerY + 8, { align: 'center' })

    // Générer le buffer PDF
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Sauvegarder le PDF (en base64 pour simplicité, à adapter selon vos besoins)
    const pdfBase64 = pdfBuffer.toString('base64')
    const fileName = generateSignedContractFilename(contract)

    // Mettre à jour le contrat avec le PDF final
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        pdfUrl: `data:application/pdf;base64,${pdfBase64}`,
        status: 'ACTIVE' // Le contrat devient actif
      }
    })

    return NextResponse.json({
      success: true,
      message: 'PDF final généré avec succès',
      fileName: fileName,
      pdfData: `data:application/pdf;base64,${pdfBase64}`
    })

  } catch (error) {
    console.error('Erreur génération PDF final:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}

function generateSignedContractFilename(contract: any): string {
  const booking = contract.booking
  const user = booking.user

  // Nom du locataire principal
  let names = [
    `${user.firstName}-${user.lastName}`.toLowerCase()
      .replace(/[^a-z0-9\-]/g, '')
  ]

  // Ajouter les noms des colocataires depuis les signatures
  contract.signatures.forEach((sig: any) => {
    if (sig.signerRole === 'ROOMMATE') {
      const [firstName, ...lastNameParts] = sig.signerName.split(' ')
      const lastName = lastNameParts.join(' ')
      names.push(
        `${firstName}-${lastName}`.toLowerCase()
          .replace(/[^a-z0-9\-]/g, '')
      )
    }
  })

  // Calculer la durée
  const startDate = new Date(contract.startDate)
  const endDate = new Date(contract.endDate)
  const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))

  // Nom de la chambre
  const roomName = booking.room?.name?.toLowerCase().replace(/[^a-z0-9\-]/g, '') || 'chambre'

  return `contrat-${names.join('-')}-${months}mois-${roomName}.pdf`
}