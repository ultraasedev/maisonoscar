// Fichier : app/api/auth/change-password/route.ts
// Description : API pour changer le mot de passe

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/(?=.*[a-z])/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/(?=.*[A-Z])/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/(?=.*\d)/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/(?=.*[@$!%*?&])/, "Le mot de passe doit contenir au moins un caractère spécial")
})

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Valider les données
    const validatedData = ChangePasswordSchema.parse(body)

    // Récupérer l'utilisateur et son auth
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { auth: true }
    })

    if (!user || !user.auth) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.auth.hashedPassword
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CURRENT_PASSWORD' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Mettre à jour le mot de passe et retirer l'obligation de changement
    await prisma.auth.update({
      where: { userId: user.id },
      data: {
        hashedPassword,
        mustChangePassword: false,
        lastLogin: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Erreur changement mot de passe:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    )
  }
}