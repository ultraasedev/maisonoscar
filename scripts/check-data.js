const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('🔍 Vérification des données...')

    const contracts = await prisma.contract.findMany({
      include: {
        booking: {
          include: {
            user: true,
            room: true
          }
        }
      }
    })

    console.log(`📄 Contrats trouvés: ${contracts.length}`)
    contracts.forEach(contract => {
      console.log(`- ${contract.contractNumber}: ${contract.booking.user.firstName} ${contract.booking.user.lastName} (${contract.booking.room.name})`)
    })

    const users = await prisma.user.findMany()
    console.log(`👤 Utilisateurs: ${users.length}`)

    const rooms = await prisma.room.findMany()
    console.log(`🏠 Chambres: ${rooms.length}`)

    const bookings = await prisma.booking.findMany()
    console.log(`📋 Réservations: ${bookings.length}`)

    const templates = await prisma.contractTemplate.findMany()
    console.log(`📄 Templates: ${templates.length}`)
    templates.forEach(template => {
      console.log(`- ${template.name} (défaut: ${template.isDefault})`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()