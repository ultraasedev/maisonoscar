// Fichier : app/api/users/route.ts
// Description : API CRUD pour la gestion des utilisateurs du dashboard

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail, generateTempPassword } from '@/lib/email'

// === VALIDATION SCHEMAS === //

const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'MANAGER']).default('MANAGER'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).default('ACTIVE'),
  password: z.string().optional(), // OPTIONNEL - on génère automatiquement
  sendEmail: z.boolean().optional().default(true) // Option pour envoyer l'email de bienvenue
})

// === GET - Récupérer tous les utilisateurs === //

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres de filtrage
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Construction des filtres
    const where: any = {
      role: { in: ['ADMIN', 'MANAGER'] } // Seulement les utilisateurs admin/manager
    }
    
    if (role && ['ADMIN', 'MANAGER'].includes(role)) {
      where.role = role
    }

    if (status && ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'].includes(status)) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Requête avec pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookings: true,
              contacts: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])



    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur GET /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// === POST - Créer un nouvel utilisateur === //

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 POST /api/users - Données reçues:', {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      sendEmail: body.sendEmail
    })
    
    // Validation des données
    const validatedData = CreateUserSchema.parse(body)

    // Vérifier que l'email n'existe pas
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      console.log('❌ Utilisateur existant trouvé avec l\'email:', validatedData.email)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un utilisateur avec cet email existe déjà',
          details: { email: validatedData.email }
        },
        { status: 400 }
      )
    }

    // Générer un mot de passe temporaire si non fourni
    let tempPassword = validatedData.password
    const isGeneratedPassword = !tempPassword
    
    if (!tempPassword) {
      tempPassword = generateTempPassword()
      console.log('🔑 Mot de passe temporaire généré pour:', validatedData.email)
    } else {
      console.log('🔑 Utilisation du mot de passe fourni pour:', validatedData.email)
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(tempPassword, 10)
    console.log('✅ Mot de passe hashé avec succès')

    // Créer l'utilisateur et son authentification
    const { password, sendEmail, ...userData } = validatedData
    
    // Créer l'utilisateur d'abord
    console.log('📝 Création de l\'utilisateur:', validatedData.email)
    const user = await prisma.user.create({
      data: userData
    })
    console.log('✅ Utilisateur créé avec ID:', user.id)
    
    // Créer l'enregistrement d'authentification
    try {
      console.log('🔐 Création de l\'authentification pour l\'utilisateur:', user.id)
      await prisma.auth.create({
        data: {
          userId: user.id,
          hashedPassword,
          mustChangePassword: isGeneratedPassword // Force le changement si mot de passe généré
        }
      })
      console.log('✅ Authentification créée avec succès')
    } catch (authError) {
      console.error('❌ Erreur lors de la création de l\'auth:', authError)
      // Si la création de l'auth échoue, supprimer l'utilisateur
      console.log('🗑️ Suppression de l\'utilisateur suite à l\'échec de création auth')
      await prisma.user.delete({ where: { id: user.id } })
      throw authError
    }

    // Envoyer l'email de bienvenue si demandé
    let emailSent = false
    let emailError = null
    
    if (validatedData.sendEmail !== false) {
      try {
        console.log('📧 Tentative d\'envoi d\'email à:', user.email)
        console.log('📧 Configuration email:', {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD,
          emailUser: process.env.EMAIL_USER || 'NON CONFIGURÉ'
        })
        
        const emailResult = await sendWelcomeEmail({
          to: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tempPassword: tempPassword
        })
        
        if (emailResult.success) {
          emailSent = true
          console.log('✅ Email envoyé avec succès à:', user.email)
        } else {
          emailError = emailResult.error
          console.error('❌ Échec de l\'envoi d\'email:', emailResult.error)
        }
      } catch (error) {
        emailError = error
        console.error('❌ Erreur lors de l\'envoi d\'email:', error)
      }
    } else {
      console.log('📧 Envoi d\'email désactivé par l\'utilisateur')
    }

    // Construire le message de retour en fonction du résultat
    let message = 'Utilisateur créé avec succès'
    
    if (validatedData.sendEmail !== false) {
      if (emailSent) {
        message += '. Email de bienvenue envoyé avec le mot de passe temporaire.'
      } else {
        message += '. ⚠️ L\'email n\'a pas pu être envoyé. Mot de passe temporaire: ' + tempPassword
      }
    }
    
    console.log('🎉 Création terminée:', {
      userId: user.id,
      email: user.email,
      emailSent,
      emailError: emailError ? String(emailError) : null
    })

    return NextResponse.json({
      success: true,
      data: user,
      message,
      emailSent,
      tempPassword: !emailSent && isGeneratedPassword ? tempPassword : undefined,
      emailError: emailError ? String(emailError) : undefined
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreur de validation Zod:', error.issues)
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

    console.error('❌ Erreur POST /api/users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'utilisateur',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// === PUT - Actions bulk === //

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userIds, status } = body

    if (action === 'bulk_status' && userIds && Array.isArray(userIds)) {
      
      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide' },
          { status: 400 }
        )
      }

      const result = await prisma.user.updateMany({
        where: { 
          id: { in: userIds },
          role: { in: ['ADMIN', 'MANAGER'] }
        },
        data: { status }
      })

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} utilisateur(s) mis à jour`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Action non supportée' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur PUT /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// === DELETE - Suppression === //

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('ids')?.split(',') || []

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun ID d\'utilisateur fourni' },
        { status: 400 }
      )
    }

    // Ne pas permettre la suppression d'utilisateurs avec des données liées importantes
    const usersWithData = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        OR: [
          { bookings: { some: {} } },
          { payments: { some: {} } }
        ]
      }
    })

    if (usersWithData.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer des utilisateurs avec des réservations ou paiements' 
        },
        { status: 400 }
      )
    }

    const result = await prisma.user.deleteMany({
      where: { 
        id: { in: userIds },
        role: { in: ['ADMIN', 'MANAGER'] }
      }
    })

    return NextResponse.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} utilisateur(s) supprimé(s)`
    })

  } catch (error) {
    console.error('Erreur DELETE /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}