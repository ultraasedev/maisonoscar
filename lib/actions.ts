// Fichier : lib/actions.ts
// Description : Server Actions pour Next.js 15

'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// === SCHEMAS DE VALIDATION === //

const ContactFormSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Sujet trop court'),
  message: z.string().min(10, 'Message trop court'),
  type: z.enum(['GENERAL', 'BOOKING', 'VISIT', 'COMPLAINT', 'MAINTENANCE', 'INFORMATION']).default('GENERAL')
})

const BookingFormSchema = z.object({
  userId: z.string().min(1, 'Utilisateur requis'),
  roomId: z.string().min(1, 'Chambre requise'),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  monthlyRent: z.number().positive('Loyer invalide'),
  securityDeposit: z.number().min(0, 'Caution invalide').default(0),
  notes: z.string().optional()
})

const UserFormSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  phone: z.string().optional(),
  birthDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  profession: z.string().optional(),
  school: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bio: z.string().optional()
})

// === TYPES DE RETOUR === //

type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// === ACTIONS CONTACT === //

export async function submitContactForm(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extraction et validation des données
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      type: (formData.get('type') as string) || 'GENERAL'
    }

    const validatedData = ContactFormSchema.parse(rawData)

    // Créer le contact
    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        status: 'NEW'
      }
    })

    // TODO: Envoyer une notification email à l'admin
    // await sendNotificationEmail(contact)

    revalidatePath('/admin/contacts')

    return {
      success: true,
      data: contact,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons rapidement !'
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        data: error.issues
      }
    }

    console.error('Erreur submitContactForm:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'envoi de votre message.'
    }
  }
}

// === ACTIONS RÉSERVATION === //

export async function createBooking(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      userId: formData.get('userId') as string,
      roomId: formData.get('roomId') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined,
      monthlyRent: parseFloat(formData.get('monthlyRent') as string),
      securityDeposit: parseFloat(formData.get('securityDeposit') as string || '0'),
      notes: formData.get('notes') as string || undefined
    }

    const validatedData = BookingFormSchema.parse(rawData)

    // Vérifier la disponibilité de la chambre
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
      include: {
        bookings: {
          where: {
            status: { in: ['ACTIVE', 'CONFIRMED'] },
            OR: [
              {
                startDate: { lte: validatedData.endDate || new Date('2030-12-31') },
                endDate: { gte: validatedData.startDate }
              },
              {
                status: 'ACTIVE',
                endDate: null
              }
            ]
          }
        }
      }
    })

    if (!room) {
      return {
        success: false,
        error: 'Chambre non trouvée'
      }
    }

    if (room.status !== 'AVAILABLE') {
      return {
        success: false,
        error: 'Cette chambre n\'est pas disponible'
      }
    }

    if (room.bookings.length > 0) {
      return {
        success: false,
        error: 'Cette chambre est déjà réservée pour cette période'
      }
    }

    // Calculer le montant total
    const monthsDuration = validatedData.endDate 
      ? Math.ceil((validatedData.endDate.getTime() - validatedData.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 1

    const totalAmount = (validatedData.monthlyRent * monthsDuration) + validatedData.securityDeposit

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        totalAmount,
        status: 'PENDING'
      },
      include: {
        user: true,
        room: true
      }
    })

    // Créer le paiement de caution si nécessaire
    if (validatedData.securityDeposit > 0) {
      await prisma.payment.create({
        data: {
          userId: validatedData.userId,
          bookingId: booking.id,
          amount: validatedData.securityDeposit,
          dueDate: validatedData.startDate,
          paymentType: 'SECURITY_DEPOSIT',
          status: 'PENDING'
        }
      })
    }

    revalidatePath('/admin/bookings')
    revalidatePath('/admin/dashboard')

    return {
      success: true,
      data: booking,
      message: 'Réservation créée avec succès'
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        data: error.issues
      }
    }

    console.error('Erreur createBooking:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la réservation'
    }
  }
}

// === ACTIONS UTILISATEUR === //

export async function createUser(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string || undefined,
      birthDate: formData.get('birthDate') as string || undefined,
      profession: formData.get('profession') as string || undefined,
      school: formData.get('school') as string || undefined,
      emergencyContact: formData.get('emergencyContact') as string || undefined,
      emergencyPhone: formData.get('emergencyPhone') as string || undefined,
      bio: formData.get('bio') as string || undefined
    }

    const validatedData = UserFormSchema.parse(rawData)

    // Vérifier que l'email n'existe pas
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      }
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        role: 'PROSPECT',
        status: 'PENDING'
      }
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: user,
      message: 'Utilisateur créé avec succès'
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        data: error.issues
      }
    }

    console.error('Erreur createUser:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur'
    }
  }
}

// === ACTIONS PAIEMENT === //

export async function markPaymentAsPaid(
  paymentId: string
): Promise<ActionResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return {
        success: false,
        error: 'Paiement non trouvé'
      }
    }

    if (payment.status === 'PAID') {
      return {
        success: false,
        error: 'Ce paiement est déjà marqué comme payé'
      }
    }

    // Marquer comme payé
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        isLate: false,
        lateDays: 0
      }
    })

    revalidatePath('/admin/payments')
    revalidatePath('/admin/dashboard')

    return {
      success: true,
      data: updatedPayment,
      message: 'Paiement marqué comme payé'
    }

  } catch (error) {
    console.error('Erreur markPaymentAsPaid:', error)
    return {
      success: false,
      error: 'Erreur lors de la mise à jour du paiement'
    }
  }
}

export async function sendPaymentReminder(
  paymentId: string
): Promise<ActionResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        booking: {
          include: {
            room: true
          }
        }
      }
    })

    if (!payment) {
      return {
        success: false,
        error: 'Paiement non trouvé'
      }
    }

    // TODO: Envoyer l'email de relance
    // await sendReminderEmail(payment)

    // Marquer la relance comme envoyée
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        reminderSent: true,
        reminderDate: new Date()
      }
    })

    revalidatePath('/admin/payments')

    return {
      success: true,
      message: 'Relance envoyée avec succès'
    }

  } catch (error) {
    console.error('Erreur sendPaymentReminder:', error)
    return {
      success: false,
      error: 'Erreur lors de l\'envoi de la relance'
    }
  }
}

// === ACTIONS ADMINISTRATIVES === //

export async function updateRoomStatus(
  roomId: string,
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE'
): Promise<ActionResult> {
  try {
    // Vérifier si la chambre a des réservations actives
    if (status === 'UNAVAILABLE' || status === 'MAINTENANCE') {
      const activeBookings = await prisma.booking.count({
        where: {
          roomId,
          status: { in: ['ACTIVE', 'CONFIRMED'] }
        }
      })

      if (activeBookings > 0) {
        return {
          success: false,
          error: 'Impossible de changer le statut d\'une chambre avec des réservations actives'
        }
      }
    }

    const room = await prisma.room.update({
      where: { id: roomId },
      data: { status }
    })

    revalidatePath('/admin/rooms')
    revalidatePath('/admin/dashboard')

    const statusLabels = {
      AVAILABLE: 'disponible',
      OCCUPIED: 'occupée',
      MAINTENANCE: 'en maintenance',
      UNAVAILABLE: 'indisponible'
    }

    return {
      success: true,
      data: room,
      message: `Chambre marquée comme ${statusLabels[status]}`
    }

  } catch (error) {
    console.error('Erreur updateRoomStatus:', error)
    return {
      success: false,
      error: 'Erreur lors de la mise à jour du statut'
    }
  }
}

export async function respondToContact(
  contactId: string,
  response: string
): Promise<ActionResult> {
  try {
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'RESPONDED',
        adminResponse: response,
        respondedAt: new Date(),
        respondedBy: 'admin@maisonoscar.fr' // TODO: Récupérer l'utilisateur connecté
      }
    })

    // TODO: Envoyer l'email de réponse
    // await sendResponseEmail(contact)

    revalidatePath('/admin/contacts')

    return {
      success: true,
      data: contact,
      message: 'Réponse envoyée avec succès'
    }

  } catch (error) {
    console.error('Erreur respondToContact:', error)
    return {
      success: false,
      error: 'Erreur lors de l\'envoi de la réponse'
    }
  }
}

// === ACTIONS DE REDIRECTION === //

export async function redirectToBooking(roomId: string) {
  redirect(`/reservation?room=${roomId}`)
}

export async function redirectToContact(type: string = 'GENERAL') {
  redirect(`/contact?type=${type}`)
}