// Fichier : scripts/create-default-admin.ts
// Description : Script pour créer un utilisateur admin par défaut

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createDefaultAdmin() {
  try {
    console.log('🔧 Création de l\'utilisateur admin par défaut...')

    const email = 'admin@maisonoscar.fr'
    const password = 'Admin123!'
    
    // Vérifier si l'admin existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { auth: true }
    })

    if (existingUser) {
      console.log('⚠️  L\'utilisateur admin existe déjà')
      
      // Si pas d'auth, en créer une
      if (!existingUser.auth) {
        const hashedPassword = await bcrypt.hash(password, 10)
        
        await prisma.auth.create({
          data: {
            userId: existingUser.id,
            hashedPassword,
            mustChangePassword: false // Admin par défaut n'a pas besoin de changer
          }
        })
        
        console.log('✅ Auth créée pour l\'admin existant')
        console.log('📧 Email:', email)
        console.log('🔑 Mot de passe:', password)
      } else {
        console.log('ℹ️  L\'authentification existe déjà')
      }
      
      return
    }

    // Créer l'utilisateur et son auth dans une transaction
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.$transaction(async (tx: any) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email,
          firstName: 'Admin',
          lastName: 'Maison Oscar',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      })
      
      // Créer l'auth
      const auth = await tx.auth.create({
        data: {
          userId: user.id,
          hashedPassword,
          mustChangePassword: false // Admin par défaut n'a pas besoin de changer
        }
      })
      
      return { user, auth }
    })

    console.log('✅ Utilisateur admin créé avec succès!')
    console.log('📧 Email:', email)
    console.log('🔑 Mot de passe:', password)
    console.log('🏠 URL de connexion: http://localhost:3000/admin/login')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createDefaultAdmin()