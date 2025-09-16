import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
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

    return NextResponse.json(
      { success: true, valid: true },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Erreur verify reset token:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du token' },
      { status: 500 }
    )
  }
}