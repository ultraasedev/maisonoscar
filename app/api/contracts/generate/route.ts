import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateContractPDF } from '@/lib/pdf-generator'
import { z } from 'zod'

const GenerateContractSchema = z.object({
  bookingRequestId: z.string(),
  contractTemplateId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingRequestId, contractTemplateId } = GenerateContractSchema.parse(body)
    
    // Récupérer la demande de réservation
    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id: bookingRequestId },
      include: {
        room: true
      }
    }) as any
    
    if (!bookingRequest) {
      return NextResponse.json(
        { success: false, error: 'Demande de réservation introuvable' },
        { status: 404 }
      )
    }
    
    // Récupérer la configuration juridique (placeholder pour l'instant)
    const legalConfig = null as any
    
    // Préparer les données pour le contrat
    const contractData: any = {
      // Informations du bailleur
      ADMIN_NAME: legalConfig?.legalType === 'COMPANY' ? 
        legalConfig.companyName : 
        'Maison Oscar',
      HOUSE_ADDRESS: '35170 Bruz, France',
      
      // Informations du locataire
      TENANT_NAME: `${bookingRequest.firstName} ${bookingRequest.lastName}`,
      TENANT_BIRTHDATE: new Date(bookingRequest.birthDate).toLocaleDateString('fr-FR'),
      TENANT_BIRTHPLACE: bookingRequest.birthPlace,
      TENANT_ADDRESS: `${bookingRequest.currentAddress}, ${bookingRequest.currentZipCode} ${bookingRequest.currentCity}`,
      TENANT_PHONE: bookingRequest.phone,
      TENANT_EMAIL: bookingRequest.email,
      
      // Informations de la chambre
      ROOM_NAME: bookingRequest.room.name,
      ROOM_NUMBER: bookingRequest.room.number.toString(),
      ROOM_FLOOR: bookingRequest.room.floor === 0 ? 'rez-de-chaussée' : `${bookingRequest.room.floor}er`,
      ROOM_SURFACE: bookingRequest.room.surface.toString(),
      
      // Informations du contrat
      CONTRACT_DURATION: bookingRequest.desiredDuration.toString(),
      START_DATE: new Date(bookingRequest.desiredStartDate).toLocaleDateString('fr-FR'),
      MONTHLY_RENT: bookingRequest.room.price.toString(),
      PAYMENT_DAY: '5',
      SECURITY_DEPOSIT: bookingRequest.room.price.toString(),
      
      // Lieu et date
      CITY: 'Bruz',
      CONTRACT_DATE: new Date().toLocaleDateString('fr-FR'),
      ADMIN_SIGNATURE: '',
      TENANT_SIGNATURE: ''
    }
    
    // Si colocataires, les ajouter
    if (bookingRequest.roommates && bookingRequest.roommates.length > 0) {
      contractData.ROOMMATES = bookingRequest.roommates.map((rm: any) => 
        `${rm.firstName} ${rm.lastName}`
      ).join(', ')
    }
    
    // Récupérer le modèle de contrat par défaut
    const defaultContract = `CONTRAT DE LOCATION EN COLIVING

Entre les soussignés :

**${contractData.ADMIN_NAME}**, gestionnaire,
Adresse : ${contractData.HOUSE_ADDRESS}
Ci-après dénommé "le Bailleur"

Et

**${contractData.TENANT_NAME}**, né(e) le ${contractData.TENANT_BIRTHDATE} à ${contractData.TENANT_BIRTHPLACE}
Demeurant : ${contractData.TENANT_ADDRESS}
Téléphone : ${contractData.TENANT_PHONE}
Email : ${contractData.TENANT_EMAIL}
Ci-après dénommé "le Locataire"

${contractData.ROOMMATES ? `
**Colocataires :**
${contractData.ROOMMATES}
` : ''}

**IL A ÉTÉ CONVENU CE QUI SUIT :**

## Article 1 : OBJET DU CONTRAT
Le Bailleur loue au Locataire la chambre **${contractData.ROOM_NAME}** (numéro ${contractData.ROOM_NUMBER}) située au ${contractData.ROOM_FLOOR} étage, d'une superficie de ${contractData.ROOM_SURFACE} m².

## Article 2 : DURÉE
Le présent bail est consenti pour une durée de **${contractData.CONTRACT_DURATION} mois**, à compter du ${contractData.START_DATE}.

## Article 3 : LOYER ET CHARGES
Le loyer mensuel est fixé à **${contractData.MONTHLY_RENT}€** charges comprises.
Le paiement s'effectue le ${contractData.PAYMENT_DAY} de chaque mois.

## Article 4 : DÉPÔT DE GARANTIE
Un dépôt de garantie de **${contractData.SECURITY_DEPOSIT}€** est versé à la signature du présent contrat.

## Article 5 : ESPACES COMMUNS
Le Locataire a accès aux espaces communs suivants :
- Cuisine équipée
- Salon
- Salle de bain partagée
- Jardin
- Parking (selon disponibilité)

## Article 6 : RÈGLEMENT INTÉRIEUR
Le Locataire s'engage à respecter le règlement intérieur de la colocation.

## Article 7 : ÉTAT DES LIEUX
Un état des lieux contradictoire sera établi à l'entrée et à la sortie du Locataire.

## Article 8 : RÉSILIATION
Le préavis de résiliation est de **1 mois** pour le Locataire et **3 mois** pour le Bailleur.

Fait à ${contractData.CITY}, le ${contractData.CONTRACT_DATE}
En deux exemplaires originaux

**Le Bailleur**                    **Le Locataire**
`
    
    // Générer le PDF (retourne base64)
    const pdfBase64 = generateContractPDF(defaultContract, contractData, `contrat_${bookingRequest.firstName}_${bookingRequest.lastName}.pdf`)
    
    // Mettre à jour la demande avec l'URL du contrat
    await prisma.bookingRequest.update({
      where: { id: bookingRequestId },
      data: {
        contractUrl: pdfBase64,
        contractSentAt: new Date(),
        status: 'CONTRACT_SENT'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        pdfBase64,
        filename: `contrat_${bookingRequest.firstName}_${bookingRequest.lastName}.pdf`
      }
    })
    
  } catch (error) {
    console.error('Erreur génération contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du contrat' },
      { status: 500 }
    )
  }
}