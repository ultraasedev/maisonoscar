import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateContractPDF } from '@/lib/pdf-generator'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const contractId = id

    // Récupérer le contrat avec toutes les données
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
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

    console.log('🔍 [API] Recherche signature admin par défaut...')

    // Récupérer la signature admin par défaut
    const adminSignature = await prisma.adminSignature.findFirst({
      where: { isDefault: true },
      select: { signatureData: true, name: true }
    })

    console.log('📝 [API] Signature trouvée:', adminSignature ? `${adminSignature.name} (${adminSignature.signatureData?.substring(0,30)}...)` : 'Aucune')

    const defaultAdminSignature = adminSignature?.signatureData || ''

    // Préparer les données du contrat
    const contractData = {
      OWNER_NAME: "Aurélien Lê et Julien Lê",
      OWNER_ADDRESS: "123 Rue de la Paix, 75001 Paris",
      OWNER_EMAIL: "contact@maisonoscar.fr",
      OWNER_PHONE: "06 12 34 56 78",
      TENANT_FIRSTNAME: contract.booking.user.firstName,
      TENANT_LASTNAME: contract.booking.user.lastName,
      TENANT_EMAIL: contract.booking.user.email,
      TENANT_PHONE: contract.booking.user.phone || "Non renseigné",
      TENANT_BIRTHDATE: "01/01/1990",
      TENANT_BIRTHPLACE: "Paris",
      TENANT_ADDRESS: "Adresse actuelle du locataire",
      ROOM_NAME: contract.booking.room.name,
      ROOM_NUMBER: contract.booking.room.number.toString(),
      ROOM_SURFACE: contract.booking.room.surface.toString(),
      ROOM_FLOOR: contract.booking.room.floor.toString(),
      HOUSE_ADDRESS: "123 Rue de la Maison Oscar, 75001 Paris",
      CONTRACT_DURATION: "12",
      START_DATE: new Date(contract.startDate).toLocaleDateString('fr-FR'),
      END_DATE: new Date(contract.endDate).toLocaleDateString('fr-FR'),
      MONTHLY_RENT: contract.monthlyRent.toString(),
      BASE_RENT: (contract.monthlyRent - contract.charges).toString(),
      CHARGES: contract.charges.toString(),
      PAYMENT_DAY: "1er",
      SECURITY_DEPOSIT: contract.deposit.toString(),
      CITY: "Paris",
      SIGNATURE_DATE: new Date().toLocaleDateString('fr-FR'),
      CONTRACT_DATE: new Date().toLocaleDateString('fr-FR'),
      ADMIN_SIGNATURE: defaultAdminSignature,
      TENANT_SIGNATURE: "" // Vide pour le moment
    }

    // Template de contrat standard
    const defaultContract = `CONTRAT DE LOCATION EN COLOCATION
=====================================

Entre les soussignés :

**LE BAILLEUR**
${contractData.OWNER_NAME}
Adresse : ${contractData.OWNER_ADDRESS}
Email : ${contractData.OWNER_EMAIL}
Téléphone : ${contractData.OWNER_PHONE}

ET

**LE LOCATAIRE**
${contractData.TENANT_FIRSTNAME} ${contractData.TENANT_LASTNAME}
Email : ${contractData.TENANT_EMAIL}
Téléphone : ${contractData.TENANT_PHONE}

IL A ÉTÉ CONVENU CE QUI SUIT :

## Article 1 : OBJET DU CONTRAT
Le bailleur loue au locataire la chambre suivante :
- Désignation : ${contractData.ROOM_NAME} (Chambre n°${contractData.ROOM_NUMBER})
- Surface : ${contractData.ROOM_SURFACE} m²
- Étage : ${contractData.ROOM_FLOOR}
- Adresse : ${contractData.HOUSE_ADDRESS}

## Article 2 : DURÉE DU BAIL
Le présent bail est consenti pour une durée de ${contractData.CONTRACT_DURATION} mois.
Date de début : ${contractData.START_DATE}
Date de fin : ${contractData.END_DATE}

## Article 3 : LOYER ET CHARGES
Loyer mensuel : ${contractData.MONTHLY_RENT}€ charges comprises
Détail :
- Loyer hors charges : ${contractData.BASE_RENT}€
- Charges : ${contractData.CHARGES}€ (eau, électricité, chauffage, internet)

Le loyer est payable mensuellement, d'avance, le ${contractData.PAYMENT_DAY} de chaque mois.

## Article 4 : DÉPÔT DE GARANTIE
Un dépôt de garantie de ${contractData.SECURITY_DEPOSIT}€ est versé à la signature du présent contrat.
Il sera restitué dans un délai maximum de 2 mois après la remise des clés, déduction faite des éventuelles réparations.

## Article 5 : ESPACES COMMUNS
Le locataire a accès aux espaces communs suivants :
- Cuisine équipée
- Salon
- Salle de bain
- Jardin
- Parking

## Article 6 : OBLIGATIONS DU LOCATAIRE
Le locataire s'engage à :
- Payer le loyer aux termes convenus
- User paisiblement des locaux
- Respecter le règlement intérieur
- Maintenir les lieux en bon état
- Souscrire une assurance habitation

## Article 7 : OBLIGATIONS DU BAILLEUR
Le bailleur s'engage à :
- Délivrer un logement décent
- Assurer la jouissance paisible du logement
- Entretenir les locaux
- Effectuer les réparations nécessaires

## Article 8 : RÉSILIATION
Le préavis de résiliation est de **1 mois** pour le Locataire et **3 mois** pour le Bailleur.

Fait à ${contractData.CITY}, le ${contractData.CONTRACT_DATE}
En deux exemplaires originaux

**Le Bailleur**                    **Le Locataire**

[SIGNATURE:ADMIN_SIGNATURE]                [SIGNATURE:TENANT_SIGNATURE]
`

    // Générer le PDF avec les signatures
    const pdfBase64 = generateContractPDF(
      defaultContract,
      contractData,
      `contrat_regen_${contract.booking.user.firstName}_${contract.booking.user.lastName}.pdf`
    )

    // Mettre à jour le contrat avec le nouveau PDF
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        pdfUrl: pdfBase64
      }
    })

    return NextResponse.json({
      success: true,
      message: 'PDF regénéré avec signature admin',
      pdfUrl: pdfBase64
    })

  } catch (error) {
    console.error('Erreur regénération PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la regénération du PDF' },
      { status: 500 }
    )
  }
}