// Fichier : scripts/reset-password-flag.ts
// Description : Script pour réinitialiser le flag mustChangePassword

import { prisma } from '../lib/prisma'

async function resetPasswordFlag(email: string) {
  try {
    console.log('🔧 Réinitialisation du flag mustChangePassword pour:', email)

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true }
    })

    if (!user) {
      console.error('❌ Utilisateur non trouvé')
      return
    }

    if (!user.auth) {
      console.error('❌ Pas d\'authentification trouvée pour cet utilisateur')
      return
    }

    // Réinitialiser le flag
    await prisma.auth.update({
      where: { userId: user.id },
      data: {
        mustChangePassword: false,
        lastLogin: new Date()
      }
    })

    console.log('✅ Flag réinitialisé avec succès!')
    console.log('   - Utilisateur:', user.firstName, user.lastName)
    console.log('   - Email:', user.email)
    console.log('   - Rôle:', user.role)
    console.log('   - mustChangePassword: false')
    console.log('\n📌 Vous pouvez maintenant vous connecter sans être redirigé vers la page de changement de mot de passe')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Récupérer l'email depuis les arguments ou utiliser l'admin par défaut
const email = process.argv[2] || 'admin@maisonoscar.fr'
resetPasswordFlag(email)