const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestContract() {
  try {
    console.log('🔍 Vérification des utilisateurs et chambres...')

    // Chercher un utilisateur
    let user = await prisma.user.findFirst({
      where: { role: 'RESIDENT' }
    })

    if (!user) {
      console.log('📋 Création d\'un utilisateur de test...')
      user = await prisma.user.create({
        data: {
          email: 'test.tenant@example.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          phone: '06 12 34 56 78',
          role: 'RESIDENT',
          hashedPassword: 'test123' // Mot de passe temporaire
        }
      })
    }

    // Chercher une chambre
    let room = await prisma.room.findFirst({
      where: { isActive: true }
    })

    if (!room) {
      console.log('🏠 Création d\'une chambre de test...')
      room = await prisma.room.create({
        data: {
          name: 'Chambre Test',
          number: 1,
          floor: 1,
          surface: 15,
          price: 650,
          isActive: true,
          hasPrivateBathroom: false,
          hasBalcony: false,
          description: 'Chambre de test pour les contrats',
          images: [],
          amenities: []
        }
      })
    }

    // Créer une réservation
    console.log('📋 Création d\'une réservation de test...')
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: room.id,
        startDate: new Date(),
        status: 'CONFIRMED',
        monthlyRent: room.price,
        securityDeposit: room.price,
        totalAmount: room.price * 2
      }
    })

    // Créer un contrat
    console.log('📄 Création d\'un contrat de test...')
    const contract = await prisma.contract.create({
      data: {
        contractNumber: 'TEST-001',
        bookingId: booking.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
        monthlyRent: room.price,
        deposit: room.price,
        charges: 50,
        status: 'DRAFT',
        pdfUrl: 'data:application/pdf;base64,test-pdf-data'
      }
    })

    console.log('✅ Contrat de test créé avec succès!')
    console.log(`📄 ID: ${contract.id}`)
    console.log(`👤 Locataire: ${user.firstName} ${user.lastName}`)
    console.log(`🏠 Chambre: ${room.name}`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestContract()