const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupContracts() {
  try {
    console.log('🗑️ Suppression des contrats par défaut...')

    // Supprimer tous les contrats
    const deletedContracts = await prisma.contract.deleteMany({})
    console.log(`✅ ${deletedContracts.count} contrats supprimés`)

    // Supprimer toutes les signatures de contrats
    const deletedSignatures = await prisma.contractSignature.deleteMany({})
    console.log(`✅ ${deletedSignatures.count} signatures supprimées`)

    console.log('🎉 Nettoyage terminé!')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupContracts()