import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si le token existe et est valide
    const auth = await prisma.auth.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!auth) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.auth.update({
      where: { id: auth.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        mustChangePassword: false
      }
    })

    return NextResponse.json(
      { success: true, message: 'Mot de passe réinitialisé avec succès' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Erreur reset password:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}