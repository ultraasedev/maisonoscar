import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendContactNotification, sendEmail } from '@/lib/email'
import { contactResponseTemplate } from '@/lib/email-templates'
import { rateLimitConfigs } from '@/lib/rate-limit'

// Schema de validation pour le message de contact
const ContactMessageSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Sujet requis"),
  message: z.string().min(10, "Message trop court"),
  type: z.enum([
    'QUESTION', 
    'VISIT_REQUEST', 
    'BOOKING_REQUEST', 
    'COMPLAINT',
    'VISIT',
    'INFORMATION',
    'MAINTENANCE',
    'BOOKING',
    'OTHER'
  ]).optional()
})

// GET - Récupérer les messages de contact
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const email = searchParams.get('email')
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Construire les filtres
    const where: any = {}
    if (status) where.status = status
    if (email) where.email = email
    if (isRead !== null) where.isRead = isRead === 'true'
    
    // Récupérer les messages avec pagination
    const [messages, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contact.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Erreur GET /api/contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau message de contact
export async function POST(request: NextRequest) {
  try {
    // Appliquer le rate limiting
    const rateLimitResult = await rateLimitConfigs.contact(request);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining)
          }
        }
      );
    }
    
    const body = await request.json()
    const validatedData = ContactMessageSchema.parse(body)
    
    // Récupérer l'IP et le user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Créer le message
    const message = await prisma.contact.create({
      data: {
        ...validatedData,
        type: validatedData.type || 'QUESTION',
        status: 'NEW'
      }
    })
    
    // Envoyer un email de notification à tous les admins de la plateforme
    try {
      await sendContactNotification({
        contactData: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          subject: validatedData.subject,
          message: validatedData.message,
          type: validatedData.type || 'QUESTION'
        }
      })
    } catch (emailError) {
      console.error('Erreur envoi email admin:', emailError)
      // Ne pas faire échouer la création du message si l'email échoue
    }
    
    return NextResponse.json({
      success: true,
      data: message,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.issues
        },
        { status: 400 }
      )
    }
    
    console.error('Erreur POST /api/contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour un message (marquer comme lu, répondre, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du message requis' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Mettre à jour le message
    const message = await prisma.contact.update({
      where: { id },
      data: {
        status: body.status || 'RESPONDED',
        adminResponse: body.response,
        respondedAt: body.response ? new Date() : undefined,
        respondedBy: body.respondedBy
      }
    })
    
    // Si une réponse est fournie, envoyer un email à l'utilisateur
    if (body.response && body.response.trim().length > 0) {
      try {
        const user = await prisma.contact.findUnique({
          where: { id },
          select: { email: true, firstName: true, lastName: true, subject: true }
        })

        if (user) {
          const html = contactResponseTemplate({
            firstName: user.firstName,
            lastName: user.lastName,
            subject: user.subject,
            response: body.response
          })

          await sendEmail(
            user.email,
            `Re: ${user.subject} - Réponse de Maison Oscar`,
            html
          )
        }
      } catch (emailError) {
        console.error('Erreur envoi email réponse:', emailError)
        // Ne pas faire échouer la mise à jour si l'email échoue
      }
    }
    
    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message mis à jour avec succès'
    })
    
  } catch (error) {
    console.error('Erreur PATCH /api/contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du message' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du message requis' },
        { status: 400 }
      )
    }
    
    await prisma.contact.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Message supprimé avec succès'
    })
    
  } catch (error) {
    console.error('Erreur DELETE /api/contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du message' },
      { status: 500 }
    )
  }
}