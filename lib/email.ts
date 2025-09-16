// Fichier : lib/email.ts
// Description : Service d'envoi d'emails avec nodemailer

import nodemailer from 'nodemailer'
import {
  welcomeEmailTemplate,
  contactNotificationTemplate,
  latePaymentReminderTemplate,
  bookingConfirmationTemplate,
  passwordResetTemplate
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

// Configuration du transporteur SMTP (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Mot de passe d'application Gmail
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
    from: `"Maison Oscar" <${process.env.EMAIL_USER}>`,
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
    from: `"Maison Oscar Admin" <${process.env.EMAIL_USER}>`,
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
    from: `"Maison Oscar" <${process.env.EMAIL_USER}>`,
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
  adminEmail,
  contactData
}: {
  adminEmail: string
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
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nouveau contact</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: #000; padding: 30px; text-align: center;">
            <h1 style="color: #F5F3F0; margin: 0;">MAISON OSCAR</h1>
            <p style="color: #F5F3F0; margin: 10px 0 0;">Nouveau message reçu</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 20px;">📬 Nouveau contact</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #666;">Type:</strong>
                <span style="background: ${contactData.type === 'BOOKING' ? '#28a745' : '#17a2b8'}; color: white; padding: 3px 10px; border-radius: 4px; margin-left: 10px;">
                  ${contactData.type === 'BOOKING' ? 'Réservation' : contactData.type === 'INFORMATION' ? 'Information' : 'Support'}
                </span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #666;">De:</strong> ${contactData.firstName} ${contactData.lastName}
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #666;">Email:</strong> 
                <a href="mailto:${contactData.email}" style="color: #007bff;">${contactData.email}</a>
              </div>
              
              ${contactData.phone ? `
              <div style="margin-bottom: 10px;">
                <strong style="color: #666;">Téléphone:</strong> ${contactData.phone}
              </div>
              ` : ''}
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #666;">Objet:</strong> ${contactData.subject}
              </div>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="color: #333; margin: 0 0 10px;">Message:</h3>
              <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${contactData.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/admin/contacts" style="display: inline-block; background: #000; color: #F5F3F0; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Voir dans le dashboard
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Cet email est envoyé automatiquement depuis le formulaire de contact
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  return sendEmail(
    adminEmail,
    `🔔 Nouveau contact: ${contactData.subject}`,
    html
  )
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
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rappel de paiement</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: #ff6b6b; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚠️ Rappel de paiement</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333;">Bonjour ${tenantName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Nous vous rappelons que votre loyer pour la chambre <strong>${roomName}</strong> 
              était dû le <strong>${dueDate.toLocaleDateString('fr-FR')}</strong>.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin: 0 0 10px;">Détails du paiement:</h3>
              <div style="color: #856404;">
                <p><strong>Montant dû:</strong> ${amount}€</p>
                <p><strong>Retard:</strong> ${daysLate} jour${daysLate > 1 ? 's' : ''}</p>
                <p><strong>Date limite:</strong> ${dueDate.toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Merci de régulariser votre situation dans les plus brefs délais. 
              Si vous avez déjà effectué ce paiement, veuillez ignorer ce message.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              En cas de difficultés ou pour toute question, n'hésitez pas à nous contacter.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${process.env.EMAIL_USER}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Nous contacter
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Maison Oscar - Gestion locative
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
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
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de réservation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <!-- Header avec image -->
          <div style="position: relative; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                ✅
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px;">Réservation confirmée!</h1>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">Félicitations ${tenantName}! 🎉</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Votre réservation pour la <strong>${roomName}</strong> a été confirmée avec succès.
              Nous avons hâte de vous accueillir à la Maison Oscar!
            </p>
            
            <!-- Détails de la réservation -->
            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 15px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 20px; font-size: 18px;">📋 Détails de votre réservation</h3>
              
              <div style="background: white; padding: 20px; border-radius: 10px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #666;">N° de réservation:</td>
                    <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">#${bookingId.slice(-8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; border-top: 1px solid #f0f0f0;">Chambre:</td>
                    <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right; border-top: 1px solid #f0f0f0;">${roomName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; border-top: 1px solid #f0f0f0;">Date d'emménagement:</td>
                    <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right; border-top: 1px solid #f0f0f0;">${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; border-top: 1px solid #f0f0f0;">Loyer mensuel:</td>
                    <td style="padding: 10px 0; color: #28a745; font-weight: bold; font-size: 20px; text-align: right; border-top: 1px solid #f0f0f0;">${price}€</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Prochaines étapes -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 15px;">🚀 Prochaines étapes</h3>
              <ol style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complétez votre dossier avec les documents requis</li>
                <li>Signez le contrat de location électroniquement</li>
                <li>Effectuez le paiement du premier loyer et du dépôt de garantie</li>
                <li>Récupérez vos clés le jour de l'emménagement</li>
              </ol>
            </div>
            
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 0 10px;">
                Accéder à mon espace
              </a>
            </div>
            
            <!-- Contact -->
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
              <p style="color: #666; margin: 0 0 10px;">Des questions? Nous sommes là pour vous aider!</p>
              <p style="margin: 0;">
                📧 <a href="mailto:contact@maisonoscar.fr" style="color: #667eea; text-decoration: none;">contact@maisonoscar.fr</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                📱 06 12 34 56 78
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
              Merci de votre confiance! 💜
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 Maison Oscar - Colocation étudiante à Bruz
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
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