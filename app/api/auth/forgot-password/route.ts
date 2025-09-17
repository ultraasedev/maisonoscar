import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { passwordResetTemplate } from '@/lib/email-templates'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe avec son auth
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true }
    })

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user || !user.auth) {
      return NextResponse.json(
        { success: true, message: 'Si un compte existe, vous recevrez un email' },
        { status: 200 }
      )
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token dans l'auth de l'utilisateur
    await prisma.auth.update({
      where: { userId: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Créer le lien de réinitialisation
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Envoyer l'email avec le template moderne
    const emailHtml = passwordResetTemplate({
      firstName: user.firstName || 'Utilisateur',
      resetLink
    })

    await sendEmail(
      email,
      'Réinitialisation de votre mot de passe',
      emailHtml
    )

    return NextResponse.json(
      { success: true, message: 'Email envoyé avec succès' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Erreur forgot password:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}