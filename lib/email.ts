// Fichier : lib/email.ts
// Description : Service d'envoi d'emails avec nodemailer

import nodemailer from 'nodemailer'
import {
  welcomeEmailTemplate,
  contactNotificationTemplate,
  latePaymentReminderTemplate,
  bookingConfirmationTemplate,
  passwordResetTemplate,
  contactResponseTemplate
} from './email-templates'

// Vérification de la configuration
const checkEmailConfig = () => {
  const hasUser = !!process.env.EMAIL_USER
  const hasPassword = !!process.env.EMAIL_APP_PASSWORD
  
  if (!hasUser || !hasPassword) {
    console.error('🚨 Configuration email manquante!')
    console.error('Variables requises:')
    if (!hasUser) console.error('  - EMAIL_USER (manquant)')
    if (!hasPassword) console.error('  - EMAIL_APP_PASSWORD (manquant)')
    console.error('\nPour Gmail:')
    console.error('1. Activez la validation en 2 étapes')
    console.error('2. Créez un mot de passe d\'application')
    console.error('3. Ajoutez les variables dans .env')
    return false
  }
  
  console.log('✅ Configuration email détectée:', {
    user: process.env.EMAIL_USER,
    hasPassword: true
  })
  return true
}

// Configuration du transporteur SMTP (Hostinger)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

// Template pour l'email de bienvenue avec mot de passe
export const sendWelcomeEmail = async ({
  to,
  firstName,
  lastName,
  tempPassword
}: {
  to: string
  firstName: string
  lastName: string
  tempPassword: string
}) => {
  const mailOptions = {
    from: `"Maison Oscar" <${process.env.SMTP_FROM_EMAIL || 'contact@maisonoscar.fr'}>`,
    to,
    subject: '🏡 Bienvenue dans l\'équipe Maison Oscar',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Maison Oscar</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          
          <!-- Wrapper -->
          <div style="width: 100%; background: linear-gradient(135deg, #F5F3F0 0%, #e8e6e3 100%); padding: 40px 0;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
              
              <!-- Header avec pattern géométrique -->
              <div style="background: #000000; padding: 0; position: relative; height: 180px;">
                <!-- Pattern SVG en background -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1;">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="2" fill="#F5F3F0"/>
                        <circle cx="0" cy="0" r="2" fill="#F5F3F0"/>
                        <circle cx="40" cy="0" r="2" fill="#F5F3F0"/>
                        <circle cx="0" cy="40" r="2" fill="#F5F3F0"/>
                        <circle cx="40" cy="40" r="2" fill="#F5F3F0"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pattern)"/>
                  </svg>
                </div>
                
                <!-- Logo et titre -->
                <div style="position: relative; text-align: center; padding: 50px 20px;">
                  <!-- Logo avec table pour compatibilité email -->
                  <table width="60" height="60" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 15px;">
                    <tr>
                      <td style="background: #F5F3F0; border-radius: 20px; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                        <table width="30" height="35" border="0" cellpadding="0" cellspacing="0" align="center">
                          <tr>
                            <td style="background: #000000; border-radius: 15px 15px 0 0; width: 30px; height: 35px;"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <h1 style="color: #F5F3F0; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px;">MAISON OSCAR</h1>
                  <p style="color: #F5F3F0; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px; opacity: 0.8;">ESPACE ADMINISTRATION</p>
                </div>
              </div>
              
              <!-- Body Content -->
              <div style="padding: 40px 35px;">
                
                <!-- Message de bienvenue -->
                <div style="text-align: center; margin-bottom: 35px;">
                  <h2 style="color: #000; margin: 0 0 10px 0; font-size: 24px; font-weight: 400;">
                    Bonjour ${firstName} ${lastName} 👋
                  </h2>
                  <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">
                    Bienvenue dans l'équipe de gestion Maison Oscar !
                  </p>
                </div>
                
                <!-- Card avec les identifiants -->
                <div style="background: linear-gradient(135deg, #F5F3F0 0%, #faf9f7 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 1px solid rgba(0,0,0,0.05);">
                  <div style="text-align: center; margin-bottom: 25px;">
                    <!-- Icône bouclier simplifiée avec table -->
                    <table width="48" height="48" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td style="background: #000; border-radius: 12px; width: 48px; height: 48px; text-align: center; vertical-align: middle; color: #F5F3F0; font-size: 24px;">
                          🔐
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <h3 style="margin: 0 0 20px 0; color: #000; font-size: 18px; text-align: center; font-weight: 500;">
                    Vos identifiants sécurisés
                  </h3>
                  
                  <!-- Email -->
                  <div style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                    <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                      Adresse email
                    </p>
                    <p style="margin: 0; color: #000; font-size: 16px; font-weight: 500;">
                      ${to}
                    </p>
                  </div>
                  
                  <!-- Mot de passe -->
                  <div style="background: white; border-radius: 12px; padding: 15px;">
                    <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                      Mot de passe temporaire
                    </p>
                    <div style="background: #000; color: #F5F3F0; padding: 10px 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 16px; letter-spacing: 2px; text-align: center; margin-top: 8px;">
                      ${tempPassword}
                    </div>
                  </div>
                </div>
                
                <!-- Alerte importante -->
                <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-radius: 12px; padding: 20px; margin: 30px 0; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #fdcb6e;"></div>
                  <div style="display: flex; align-items: flex-start; margin-left: 10px;">
                    <span style="font-size: 20px; margin-right: 12px;">⚡</span>
                    <div>
                      <p style="margin: 0; color: #5f3a1a; font-weight: 600; font-size: 14px; margin-bottom: 5px;">
                        Action requise
                      </p>
                      <p style="margin: 0; color: #7d4e24; font-size: 14px; line-height: 1.5;">
                        Pour votre sécurité, vous devrez créer un nouveau mot de passe lors de votre première connexion.
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/admin/login" style="display: inline-block; text-decoration: none;">
                    <div style="background: #000; color: #F5F3F0; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s;">
                      Accéder au dashboard →
                    </div>
                  </a>
                </div>
                
                <!-- Instructions -->
                <div style="background: #fafafa; border-radius: 12px; padding: 20px; margin-top: 30px;">
                  <h4 style="margin: 0 0 15px 0; color: #000; font-size: 14px; font-weight: 600;">
                    📚 Premiers pas
                  </h4>
                  <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                    <li>Connectez-vous avec vos identifiants</li>
                    <li>Créez votre mot de passe personnel</li>
                    <li>Explorez le dashboard et ses fonctionnalités</li>
                    <li>N'hésitez pas à demander de l'aide si besoin</li>
                  </ol>
                </div>
                
              </div>
              
              <!-- Footer -->
              <div style="background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                <div style="margin-bottom: 15px;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2024 Maison Oscar - Coliving moderne à Bruz
                  </p>
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #bbb; font-size: 11px; margin: 0; line-height: 1.6;">
                    Cet email contient des informations confidentielles. Si vous n'êtes pas le destinataire,<br>
                    merci de supprimer ce message et de nous en informer.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Vérifier la configuration avant d'envoyer
  if (!checkEmailConfig()) {
    console.error('❌ Impossible d\'envoyer l\'email: configuration manquante')
    return { 
      success: false, 
      error: 'Configuration email manquante. Vérifiez EMAIL_USER et EMAIL_APP_PASSWORD dans .env' 
    }
  }

  try {
    console.log('📤 Tentative d\'envoi d\'email de bienvenue...')
    console.log('  To:', to)
    console.log('  From:', process.env.EMAIL_USER)
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email de bienvenue envoyé avec succès!')
    console.log('  Message ID:', info.messageId)
    console.log('  Response:', info.response)
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:')
    console.error('  Type:', error instanceof Error ? error.name : 'Unknown')
    console.error('  Message:', error instanceof Error ? error.message : error)
    
    // Messages d'erreur plus explicites selon le type d'erreur
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        console.error('  → Vérifiez EMAIL_USER et EMAIL_APP_PASSWORD')
        console.error('  → Pour Gmail, utilisez un mot de passe d\'application, pas votre mot de passe habituel')
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('  → Impossible de se connecter au serveur SMTP')
      } else if (error.message.includes('self signed certificate')) {
        console.error('  → Problème de certificat SSL')
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// Template pour l'email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async ({
  to,
  firstName,
  resetToken
}: {
  to: string
  firstName: string
  resetToken: string
}) => {
  const resetLink = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: `"Maison Oscar" <${process.env.SMTP_FROM_EMAIL || 'contact@maisonoscar.fr'}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation du mot de passe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #F5F3F0; margin: 0; font-size: 28px;">MAISON OSCAR</h1>
              <p style="color: #F5F3F0; margin: 10px 0 0 0; font-size: 14px;">Réinitialisation du mot de passe</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${firstName},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="display: inline-block; background-color: #000000; color: #F5F3F0; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px;">
                Ce lien expirera dans 1 heure pour des raisons de sécurité.
              </p>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Maison Oscar - Tous droits réservés
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Vérifier la configuration avant d'envoyer
  if (!checkEmailConfig()) {
    console.error('❌ Impossible d\'envoyer l\'email: configuration manquante')
    return { 
      success: false, 
      error: 'Configuration email manquante' 
    }
  }

  try {
    console.log('📤 Tentative d\'envoi d\'email de réinitialisation...')
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email de réinitialisation envoyé:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur envoi email de réinitialisation:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// Fonction générique pour envoyer un email
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  // Vérifier la configuration
  if (!checkEmailConfig()) {
    console.error('❌ Impossible d\'envoyer l\'email: configuration manquante')
    return { 
      success: false, 
      error: 'Configuration email manquante' 
    }
  }

  const mailOptions = {
    from: `"Maison Oscar" <${process.env.SMTP_FROM_EMAIL || 'contact@maisonoscar.fr'}>`,
    to,
    subject,
    html
  }

  try {
    console.log('📤 Envoi d\'email...')
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email envoyé:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}



// Fonction pour envoyer un email aux admins
export const sendAdminEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  return sendEmail(to, subject, html)
}

// Email de notification pour nouveau contact avec template moderne
export const sendContactNotification = async ({
  contactData
}: {
  contactData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    subject: string
    message: string
    type: string
  }
}) => {
  // Récupérer tous les utilisateurs admins et managers de la plateforme
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER']
        },
        status: 'ACTIVE'
      },
      select: {
        email: true
      }
    })

    const html = contactNotificationTemplate(contactData)

    // Envoyer l'email à tous les admins
    const emailPromises = adminUsers.map((admin: { email: string }) =>
      sendEmail(
        admin.email,
        `🔔 Nouveau contact: ${contactData.subject}`,
        html
      )
    )

    await Promise.all(emailPromises)

  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Email de rappel pour paiement en retard
export const sendLatePaymentReminder = async ({
  tenantEmail,
  tenantName,
  amount,
  dueDate,
  roomName,
  daysLate
}: {
  tenantEmail: string
  tenantName: string
  amount: number
  dueDate: Date
  roomName: string
  daysLate: number
}) => {
  const html = latePaymentReminderTemplate({
    tenantName,
    amount,
    dueDate,
    roomName,
    daysLate
  })

  return sendEmail(
    tenantEmail,
    `⚠️ Rappel: Loyer en retard - ${roomName}`,
    html
  )
}

// Email stylisé pour confirmation de réservation
export const sendStyledBookingConfirmation = async ({
  tenantEmail,
  tenantName,
  roomName,
  startDate,
  price,
  bookingId
}: {
  tenantEmail: string
  tenantName: string
  roomName: string
  startDate: Date
  price: number
  bookingId: string
}) => {
  const html = bookingConfirmationTemplate({
    tenantName,
    roomName,
    startDate,
    price,
    bookingId
  })
  
  return sendEmail(
    tenantEmail,
    `✅ Confirmation de votre réservation - ${roomName}`,
    html
  )
}

// Fonction pour générer un mot de passe temporaire sécurisé
export const generateTempPassword = () => {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  // S'assurer qu'il y a au moins une majuscule, une minuscule, un chiffre et un caractère spécial
  if (!/[A-Z]/.test(password)) password = 'A' + password.slice(1)
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + 'a'
  if (!/[0-9]/.test(password)) password = password.slice(0, -2) + '1' + password.slice(-1)
  if (!/[!@#$%]/.test(password)) password = password.slice(0, -3) + '!' + password.slice(-2)
  
  return password
}