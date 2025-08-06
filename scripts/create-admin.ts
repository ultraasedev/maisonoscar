// Fichier : scripts/create-admin.ts
// Script pour créer un utilisateur administrateur

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Création de l\'utilisateur administrateur...')

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Un administrateur existe déjà:', existingAdmin.email)
      return
    }

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@maisonoscar.fr',
        firstName: 'Admin',
        lastName: 'Maison Oscar',
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '0123456789'
      }
    })

    console.log('✅ Administrateur créé avec succès!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Mot de passe temporaire: admin123')
    console.log('')
    console.log('⚠️  Pour la sécurité, changez ce mot de passe dès que possible')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createAdmin()
}

export { createAdmin }