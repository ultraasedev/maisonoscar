const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUsers() {
  try {
    const emailsToDelete = [
      'manager@maisonoscar.fr',
      'test@example.com',
      'admin@maisonoscar.fr'
    ]

    console.log('Suppression des utilisateurs:', emailsToDelete)

    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: emailsToDelete
        }
      }
    })

    console.log(`${result.count} utilisateurs supprimés avec succès`)
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUsers()