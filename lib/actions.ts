// Fichier : lib/actions.ts
// Description : Server Actions pour les formulaires (Next.js 15) - CORRIGÉ

'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ContactType, ContactStatus } from '@prisma/client'  // ✅ Import des types Prisma

// === VALIDATION SCHEMAS === //

const ContactFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  type: z.nativeEnum(ContactType).default(ContactType.OTHER),  // ✅ CORRIGÉ : Utilise ContactType.OTHER
})

// === TYPES === //

export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  type: 'QUESTION' | 'VISIT_REQUEST' | 'BOOKING_REQUEST' | 'COMPLAINT' | 'VISIT' | 'INFORMATION' | 'MAINTENANCE' | 'BOOKING' | 'OTHER'  // ✅ CORRIGÉ : OTHER au lieu de GENERAL
}

export interface ActionResult {
  success: boolean
  message?: string
  error?: string
  data?: any
}

// === SERVER ACTIONS === //

/**
 * Action pour envoyer un message de contact
 */
export async function submitContactForm(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Conversion des FormData en objet
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      type: (formData.get('type') as string) || 'OTHER',  // ✅ CORRIGÉ : OTHER par défaut
    }

    console.log('📝 Données du formulaire contact:', rawData)

    // Validation des données
    const validatedData = ContactFormSchema.parse(rawData)

    console.log('✅ Données validées:', validatedData)

    // Créer le contact
    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        status: ContactStatus.NEW  // ✅ Utilise l'enum Prisma
      }
    })

    console.log('🎉 Contact créé avec succès:', contact.id)

    return {
      success: true,
      message: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
      data: { contactId: contact.id }
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du contact:', error)

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => issue.message).join(', ')
      return {
        success: false,
        error: `Données invalides: ${errorMessages}`
      }
    }

    // Erreur de base de données ou autre
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
    }
  }
}

/**
 * Action pour envoyer une demande de visite
 */
export async function submitVisitRequest(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: "Demande de visite",
      message: formData.get('message') as string,
      type: ContactType.VISIT_REQUEST,  // ✅ Utilise l'enum Prisma
    }

    const validatedData = ContactFormSchema.parse(rawData)

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        status: ContactStatus.NEW
      }
    })

    return {
      success: true,
      message: 'Votre demande de visite a été envoyée ! Nous vous contacterons rapidement pour organiser la visite.',
      data: { contactId: contact.id }
    }

  } catch (error) {
    console.error('❌ Erreur demande de visite:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Veuillez vérifier les informations saisies.'
      }
    }

    return {
      success: false,
      error: 'Erreur lors de l\'envoi de votre demande. Veuillez réessayer.'
    }
  }
}

/**
 * Action pour envoyer une demande de réservation
 */
export async function submitBookingRequest(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: `Demande de réservation - ${formData.get('roomName') || 'Chambre'}`,
      message: formData.get('message') as string,
      type: ContactType.BOOKING_REQUEST,  // ✅ Utilise l'enum Prisma
    }

    const validatedData = ContactFormSchema.parse(rawData)

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        status: ContactStatus.NEW
      }
    })

    return {
      success: true,
      message: 'Votre demande de réservation a été envoyée ! Nous traiterons votre dossier rapidement.',
      data: { contactId: contact.id }
    }

  } catch (error) {
    console.error('❌ Erreur demande de réservation:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Veuillez vérifier les informations saisies.'
      }
    }

    return {
      success: false,
      error: 'Erreur lors de l\'envoi de votre demande. Veuillez réessayer.'
    }
  }
}

/**
 * Action pour rediriger vers WhatsApp
 */
export async function redirectToWhatsApp(message: string = '') {
  const phoneNumber = '+33612345678'  // Remplacez par votre numéro
  const encodedMessage = encodeURIComponent(
    message || 'Bonjour, je souhaite obtenir des informations sur Maison Oscar.'
  )
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  
  redirect(whatsappUrl)
}

/**
 * Action pour valider et formater les données de contact
 */
export async function validateContactData(data: ContactFormData): Promise<ActionResult> {
  try {
    const validatedData = ContactFormSchema.parse(data)
    
    return {
      success: true,
      message: 'Données validées avec succès',
      data: validatedData
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      )
      
      return {
        success: false,
        error: 'Erreurs de validation',
        data: errorMessages
      }
    }
    
    return {
      success: false,
      error: 'Erreur de validation inconnue'
    }
  }
}