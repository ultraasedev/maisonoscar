const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupTestData() {
  try {
    console.log('🔧 Configuration des données de test...')

    // 1. Récupérer un utilisateur admin
    const adminUser = await prisma.user.findFirst()
    if (!adminUser) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }

    // 2. Créer un template par défaut
    console.log('📄 Création du template par défaut...')
    const defaultTemplate = await prisma.contractTemplate.create({
      data: {
        name: 'Contrat Standard Maison Oscar',
        description: 'Template par défaut pour tous les contrats',
        isDefault: true,
        createdBy: { connect: { id: adminUser.id } },
        pdfData: `CONTRAT DE LOCATION EN COLOCATION
=====================================

Entre les soussignés :

**LE BAILLEUR**
{{OWNER_NAME}}
Adresse : {{OWNER_ADDRESS}}
Email : {{OWNER_EMAIL}}
Téléphone : {{OWNER_PHONE}}

ET

**LE LOCATAIRE**
{{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Email : {{TENANT_EMAIL}}
Téléphone : {{TENANT_PHONE}}

IL A ÉTÉ CONVENU CE QUI SUIT :

## Article 1 : OBJET DU CONTRAT
Le bailleur loue au locataire la chambre suivante :
- Désignation : {{ROOM_NAME}} (Chambre n°{{ROOM_NUMBER}})
- Surface : {{ROOM_SURFACE}} m²
- Étage : {{ROOM_FLOOR}}
- Adresse : {{HOUSE_ADDRESS}}

## Article 2 : DURÉE DU BAIL
Le présent bail est consenti pour une durée de {{CONTRACT_DURATION}} mois.
Date de début : {{START_DATE}}
Date de fin : {{END_DATE}}

## Article 3 : LOYER ET CHARGES
Loyer mensuel : {{MONTHLY_RENT}}€ charges comprises
Détail :
- Loyer hors charges : {{BASE_RENT}}€
- Charges : {{CHARGES}}€ (eau, électricité, chauffage, internet)

Le loyer est payable mensuellement, d'avance, le {{PAYMENT_DAY}} de chaque mois.

## Article 4 : DÉPÔT DE GARANTIE
Un dépôt de garantie de {{SECURITY_DEPOSIT}}€ est versé à la signature du présent contrat.

## Article 5 : RÉSILIATION
Le préavis de résiliation est de **1 mois** pour le Locataire et **3 mois** pour le Bailleur.

Fait à {{CITY}}, le {{CONTRACT_DATE}}
En deux exemplaires originaux

**Le Bailleur**                    **Le Locataire**

[SIGNATURE:ADMIN_SIGNATURE]                [SIGNATURE:TENANT_SIGNATURE]`,
      }
    })

    // 3. Récupérer une chambre existante
    const room = await prisma.room.findFirst()

    if (!adminUser || !room) {
      console.log('❌ Pas d\'utilisateur ou de chambre disponible')
      return
    }

    // 4. Créer une réservation
    console.log('📋 Création d\'une réservation...')
    const booking = await prisma.booking.create({
      data: {
        userId: adminUser.id,
        roomId: room.id,
        startDate: new Date(),
        status: 'CONFIRMED',
        monthlyRent: room.price,
        securityDeposit: room.price,
        totalAmount: room.price * 2
      }
    })

    // 4. Créer un contrat
    console.log('📄 Création d\'un contrat...')
    const contract = await prisma.contract.create({
      data: {
        contractNumber: 'MO-2024-001',
        bookingId: booking.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
        monthlyRent: room.price,
        deposit: room.price,
        charges: 50,
        status: 'DRAFT',
        pdfUrl: 'data:application/pdf;base64,exemple-pdf-data'
      }
    })

    console.log('✅ Données de test créées avec succès!')
    console.log(`📄 Template: ${defaultTemplate.name} (défaut: ${defaultTemplate.isDefault})`)
    console.log(`📋 Contrat: ${contract.contractNumber}`)
    console.log(`👤 Locataire: ${adminUser.firstName} ${adminUser.lastName}`)
    console.log(`🏠 Chambre: ${room.name}`)
    console.log('')
    console.log('🌐 Accédez à http://localhost:3001/admin/contracts pour voir les contrats')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestData()