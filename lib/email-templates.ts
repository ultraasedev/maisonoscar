// Fichier : lib/email-templates.ts
// Description : Templates d'email unifiés avec design moderne et responsive

// Template de base pour tous les emails
export const baseEmailTemplate = (content: {
  preheader?: string
  headerBgColor?: string
  headerIcon?: string
  headerTitle: string
  headerSubtitle?: string
  bodyContent: string
  footerContent?: string
}) => {
  const {
    preheader = '',
    headerBgColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerIcon = '🏡',
    headerTitle,
    headerSubtitle = '',
    bodyContent,
    footerContent = ''
  } = content

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${headerTitle}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .content { padding: 20px !important; }
          .header { padding: 30px 20px !important; }
          .button { width: 100% !important; text-align: center !important; }
          .button a { display: block !important; padding: 15px !important; }
          h1 { font-size: 24px !important; }
          h2 { font-size: 20px !important; }
          h3 { font-size: 18px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f0f2f5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      
      <!-- Preheader Text -->
      ${preheader ? `
      <div style="display: none; font-size: 1px; color: #f0f2f5; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader}
      </div>
      ` : ''}
      
      <!-- Email Wrapper -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f0f2f5; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <!-- Email Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); margin: 20px auto;">
              
              <!-- Header -->
              <tr>
                <td style="background: ${headerBgColor}; padding: 40px 30px;" class="header">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <!-- Icon Circle -->
                        <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: inline-block; line-height: 80px; font-size: 40px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                          ${headerIcon}
                        </div>
                        <!-- Title -->
                        <h1 style="color: white; margin: 0 0 10px; font-size: 28px; font-weight: 700; text-align: center;">
                          ${headerTitle}
                        </h1>
                        ${headerSubtitle ? `
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px; text-align: center;">
                          ${headerSubtitle}
                        </p>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;" class="content">
                  ${bodyContent}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f8f9fa; padding: 30px; border-top: 1px solid #e5e7eb;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        ${footerContent || `
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
                          Besoin d'aide? Contactez-nous
                        </p>
                        <p style="margin: 0 0 15px;">
                          <a href="mailto:contact@maisonoscar.fr" style="color: #667eea; text-decoration: none; font-weight: 500;">
                            contact@maisonoscar.fr
                          </a>
                          <span style="color: #9ca3af; margin: 0 10px;">|</span>
                          <a href="tel:0612345678" style="color: #667eea; text-decoration: none; font-weight: 500;">
                            06 12 34 56 78
                          </a>
                        </p>
                        `}
                        <!-- Social Links -->
                        <div style="margin: 20px 0;">
                          <a href="#" style="display: inline-block; margin: 0 5px;">
                            <img src="https://img.icons8.com/ios-filled/30/9ca3af/facebook-new.png" alt="Facebook" style="width: 24px; height: 24px;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 5px;">
                            <img src="https://img.icons8.com/ios-filled/30/9ca3af/instagram-new.png" alt="Instagram" style="width: 24px; height: 24px;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 5px;">
                            <img src="https://img.icons8.com/ios-filled/30/9ca3af/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                          </a>
                        </div>
                        <!-- Copyright -->
                        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
                          © ${new Date().getFullYear()} ${process.env.SITE_NAME || 'Maison Oscar'}
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0;">
                          Tous droits réservés
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
            <!-- End Email Container -->
            
          </td>
        </tr>
      </table>
      <!-- End Email Wrapper -->
      
    </body>
    </html>
  `
}

// Components réutilisables
export const emailComponents = {
  // Bouton CTA principal
  primaryButton: (text: string, url: string) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
      <tr>
        <td class="button">
          <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,
  
  // Bouton secondaire
  secondaryButton: (text: string, url: string) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 20px auto;">
      <tr>
        <td class="button">
          <a href="${url}" style="display: inline-block; background: white; color: #667eea; padding: 12px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; border: 2px solid #667eea;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,
  
  // Card d'information
  infoCard: (title: string, content: string, bgColor = '#f8f9fa') => `
    <div style="background: ${bgColor}; border-radius: 12px; padding: 24px; margin: 20px 0;">
      <h3 style="color: #111827; margin: 0 0 12px; font-size: 18px; font-weight: 600;">
        ${title}
      </h3>
      <div style="color: #4b5563; line-height: 1.6;">
        ${content}
      </div>
    </div>
  `,
  
  // Alert box
  alertBox: (message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info') => {
    const styles = {
      info: { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af', icon: 'ℹ️' },
      warning: { bg: '#fef3c7', border: '#f59e0b', color: '#92400e', icon: '⚠️' },
      success: { bg: '#f0fdf4', border: '#22c55e', color: '#166534', icon: '✅' },
      error: { bg: '#fef2f2', border: '#ef4444', color: '#991b1b', icon: '❌' }
    }
    
    const style = styles[type]
    return `
      <div style="background: ${style.bg}; border-left: 4px solid ${style.border}; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="display: flex; align-items: start;">
          <span style="font-size: 20px; margin-right: 12px;">${style.icon}</span>
          <p style="color: ${style.color}; margin: 0; line-height: 1.5;">
            ${message}
          </p>
        </div>
      </div>
    `
  },
  
  // Liste avec icônes
  iconList: (items: Array<{ icon: string; text: string }>) => `
    <ul style="list-style: none; padding: 0; margin: 20px 0;">
      ${items.map(item => `
        <li style="display: flex; align-items: center; margin: 12px 0;">
          <span style="font-size: 20px; margin-right: 12px;">${item.icon}</span>
          <span style="color: #4b5563; line-height: 1.5;">${item.text}</span>
        </li>
      `).join('')}
    </ul>
  `,
  
  // Tableau de données
  dataTable: (rows: Array<{ label: string; value: string; highlight?: boolean }>) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      ${rows.map(row => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${row.label}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: ${row.highlight ? '600' : '500'}; color: ${row.highlight ? '#667eea' : '#111827'}; font-size: ${row.highlight ? '16px' : '14px'};">
            ${row.value}
          </td>
        </tr>
      `).join('')}
    </table>
  `,
  
  // Progress steps
  progressSteps: (steps: Array<{ title: string; completed: boolean }>) => `
    <div style="margin: 30px 0;">
      ${steps.map((step, index) => `
        <div style="display: flex; align-items: center; margin: 16px 0;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${step.completed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
            ${step.completed ? '✓' : index + 1}
          </div>
          <div style="margin-left: 16px;">
            <p style="margin: 0; color: ${step.completed ? '#111827' : '#9ca3af'}; font-weight: ${step.completed ? '500' : '400'};">
              ${step.title}
            </p>
          </div>
        </div>
      `).join('')}
    </div>
  `,
  
  // Divider
  divider: () => `
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  `
}

// Template pour email de bienvenue
export const welcomeEmailTemplate = (data: {
  firstName: string
  lastName: string
  tempPassword: string
}) => {
  const bodyContent = `
    <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">
      Bienvenue ${data.firstName} ! 👋
    </h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
      Votre compte administrateur a été créé avec succès. Vous pouvez maintenant accéder au dashboard de Maison Oscar pour gérer les réservations, les paiements et bien plus encore.
    </p>
    
    ${emailComponents.infoCard(
      '🔐 Vos identifiants de connexion',
      `
        <p style="margin: 8px 0;"><strong>Email:</strong> Utilisez l'adresse email de ce message</p>
        <p style="margin: 8px 0;"><strong>Mot de passe temporaire:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.tempPassword}</code></p>
      `
    )}
    
    ${emailComponents.alertBox(
      'Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.',
      'warning'
    )}
    
    ${emailComponents.primaryButton('Accéder au dashboard', `${process.env.NEXTAUTH_URL}/admin/login`)}
    
    ${emailComponents.progressSteps([
      { title: 'Compte créé', completed: true },
      { title: 'Se connecter avec le mot de passe temporaire', completed: false },
      { title: 'Choisir un nouveau mot de passe sécurisé', completed: false },
      { title: 'Commencer à utiliser le dashboard', completed: false }
    ])}
  `
  
  return baseEmailTemplate({
    preheader: 'Votre compte administrateur Maison Oscar est prêt',
    headerIcon: '🎉',
    headerTitle: 'Bienvenue dans l\'équipe !',
    headerSubtitle: 'Votre accès au dashboard Maison Oscar',
    bodyContent
  })
}

// Template pour notification de contact
export const contactNotificationTemplate = (data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  type: string
}) => {
  const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
    BOOKING: { label: 'Réservation', color: '#22c55e', icon: '🏠' },
    INFORMATION: { label: 'Information', color: '#3b82f6', icon: 'ℹ️' },
    MAINTENANCE: { label: 'Maintenance', color: '#f59e0b', icon: '🔧' },
    COMPLAINT: { label: 'Réclamation', color: '#ef4444', icon: '⚠️' },
    VISIT: { label: 'Visite', color: '#8b5cf6', icon: '👁️' },
    OTHER: { label: 'Autre', color: '#6b7280', icon: '📬' }
  }
  
  const typeInfo = typeLabels[data.type] || typeLabels.OTHER
  
  const bodyContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="background: ${typeInfo.color}; color: white; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
        ${typeInfo.icon} ${typeInfo.label}
      </span>
    </div>
    
    <h2 style="color: #111827; margin: 0 0 20px; font-size: 22px;">
      Nouveau message de ${data.firstName} ${data.lastName}
    </h2>
    
    ${emailComponents.dataTable([
      { label: 'De', value: `${data.firstName} ${data.lastName}` },
      { label: 'Email', value: data.email },
      ...(data.phone ? [{ label: 'Téléphone', value: data.phone }] : []),
      { label: 'Objet', value: data.subject, highlight: true }
    ])}
    
    ${emailComponents.infoCard(
      '💬 Message',
      `<p style="margin: 0; white-space: pre-wrap;">${data.message}</p>`,
      'white'
    )}
    
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      ${emailComponents.primaryButton('Voir dans le dashboard', `${process.env.NEXTAUTH_URL}/admin/contacts`)}
      ${emailComponents.secondaryButton(`Répondre à ${data.firstName}`, `mailto:${data.email}`)}
    </div>
  `
  
  return baseEmailTemplate({
    preheader: `Nouveau message de ${data.firstName} ${data.lastName} - ${data.subject}`,
    headerIcon: '📨',
    headerTitle: 'Nouveau contact reçu',
    headerSubtitle: 'Un visiteur a envoyé un message via le formulaire',
    bodyContent
  })
}

// Template pour rappel de paiement
export const latePaymentReminderTemplate = (data: {
  tenantName: string
  amount: number
  dueDate: Date
  roomName: string
  daysLate: number
}) => {
  const bodyContent = `
    <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">
      Bonjour ${data.tenantName},
    </h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
      Nous vous rappelons que votre loyer n'a pas encore été réglé. Pour maintenir votre réservation active, merci de procéder au paiement dans les plus brefs délais.
    </p>
    
    ${emailComponents.alertBox(
      `Votre paiement est en retard de ${data.daysLate} jour${data.daysLate > 1 ? 's' : ''}`,
      'warning'
    )}
    
    ${emailComponents.dataTable([
      { label: 'Chambre', value: data.roomName },
      { label: 'Montant dû', value: `${data.amount}€`, highlight: true },
      { label: 'Date d\'échéance', value: data.dueDate.toLocaleDateString('fr-FR') },
      { label: 'Retard', value: `${data.daysLate} jour${data.daysLate > 1 ? 's' : ''}` }
    ])}
    
    ${emailComponents.primaryButton('Effectuer le paiement', `${process.env.NEXTAUTH_URL}/dashboard/payments`)}
    
    ${emailComponents.infoCard(
      '💡 Besoin d\'aide ?',
      `
        <p style="margin: 0 0 10px;">Si vous rencontrez des difficultés pour effectuer votre paiement, n'hésitez pas à nous contacter :</p>
        <p style="margin: 0;">• Par email : contact@maisonoscar.fr</p>
        <p style="margin: 0;">• Par téléphone : 06 12 34 56 78</p>
      `
    )}
  `
  
  return baseEmailTemplate({
    preheader: `Rappel: Loyer en retard de ${data.daysLate} jour${data.daysLate > 1 ? 's' : ''}`,
    headerBgColor: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    headerIcon: '⏰',
    headerTitle: 'Rappel de paiement',
    headerSubtitle: `${data.daysLate} jour${data.daysLate > 1 ? 's' : ''} de retard`,
    bodyContent
  })
}

// Template pour confirmation de réservation
export const bookingConfirmationTemplate = (data: {
  tenantName: string
  roomName: string
  startDate: Date
  price: number
  bookingId: string
}) => {
  const bodyContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600;">
        ✅ Réservation confirmée
      </div>
    </div>
    
    <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">
      Félicitations ${data.tenantName} ! 🎉
    </h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
      Votre réservation a été confirmée avec succès. Nous sommes ravis de vous accueillir prochainement à la Maison Oscar !
    </p>
    
    ${emailComponents.dataTable([
      { label: 'N° de réservation', value: `#${data.bookingId.slice(-8).toUpperCase()}` },
      { label: 'Chambre', value: data.roomName },
      { label: 'Date d\'arrivée', value: data.startDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) },
      { label: 'Loyer mensuel', value: `${data.price}€`, highlight: true }
    ])}
    
    ${emailComponents.progressSteps([
      { title: 'Réservation confirmée', completed: true },
      { title: 'Compléter votre dossier', completed: false },
      { title: 'Signer le contrat électroniquement', completed: false },
      { title: 'Effectuer le premier paiement', completed: false },
      { title: 'Récupérer vos clés', completed: false }
    ])}
    
    ${emailComponents.primaryButton('Accéder à mon espace', `${process.env.NEXTAUTH_URL}/dashboard`)}
    
    ${emailComponents.iconList([
      { icon: '📋', text: 'Préparez vos documents (pièce d\'identité, justificatifs...)' },
      { icon: '✍️', text: 'Le contrat sera disponible pour signature électronique' },
      { icon: '💳', text: 'Le premier loyer et le dépôt de garantie seront à régler' },
      { icon: '🔑', text: 'Les clés vous seront remises le jour de votre arrivée' }
    ])}
  `
  
  return baseEmailTemplate({
    preheader: `Réservation confirmée pour ${data.roomName}`,
    headerIcon: '🏡',
    headerTitle: 'Bienvenue à la Maison Oscar !',
    headerSubtitle: 'Votre réservation est confirmée',
    bodyContent
  })
}

// Template pour demande de réservation
export const bookingRequestEmail = (data: {
  firstName: string
  lastName: string
  roomName: string
  startDate: string
  duration: number
}) => {
  const siteName = process.env.SITE_NAME || 'Maison Oscar'
  const bodyContent = `
    <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">
      Bonjour ${data.firstName} ${data.lastName} ! 👋
    </h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
      Nous avons bien reçu votre demande de réservation pour la chambre <strong>${data.roomName}</strong> 
      à partir du <strong>${data.startDate}</strong> pour une durée de <strong>${data.duration} mois</strong>.
    </p>
    
    ${emailComponents.alertBox(
      'Votre demande est en cours d\'examen par notre équipe.',
      'info'
    )}
    
    ${emailComponents.progressSteps([
      { title: 'Demande reçue', completed: true },
      { title: 'Examen du dossier', completed: false },
      { title: 'Décision', completed: false }
    ])}
    
    <h3 style="color: #111827; margin: 30px 0 15px; font-size: 18px;">
      Prochaines étapes :
    </h3>
    
    ${emailComponents.iconList([
      { icon: '📋', text: 'Notre équipe va examiner votre dossier sous 48h' },
      { icon: '📧', text: 'Vous recevrez un email avec notre décision' },
      { icon: '✍️', text: 'Si votre dossier est accepté, vous pourrez signer le contrat électroniquement' },
      { icon: '🔑', text: 'Une fois le contrat signé, nous conviendrons d\'une date pour la remise des clés' }
    ])}
    
    ${emailComponents.infoCard(
      '💡 Besoin de compléter votre dossier ?',
      'Si nous avons besoin de documents supplémentaires, nous vous contacterons directement par email.'
    )}
  `
  
  return baseEmailTemplate({
    preheader: `Demande de réservation reçue pour ${data.roomName}`,
    headerBgColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    headerIcon: '📩',
    headerTitle: 'Demande de réservation reçue',
    headerSubtitle: `${siteName}`,
    bodyContent
  })
}

// Template pour réinitialisation de mot de passe
export const passwordResetTemplate = (data: {
  firstName: string
  resetLink: string
}) => {
  const siteName = process.env.SITE_NAME || 'Maison Oscar'
  const bodyContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: #ef4444; color: white; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600;">
        ⏰ Action requise - Expire dans 1 heure
      </div>
    </div>
    
    <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">
      Bonjour ${data.firstName} ! 👋
    </h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
      Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ${siteName}. 
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
      <tr>
        <td class="button">
          <a href="${data.resetLink}" style="display: inline-block; background: #000000; color: #F5F3F0; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
            🔐 Créer mon nouveau mot de passe
          </a>
        </td>
      </tr>
    </table>
    
    ${emailComponents.infoCard(
      '⏱️ Durée de validité',
      'Pour des raisons de sécurité, ce lien expirera dans <strong>1 heure</strong>. Passé ce délai, vous devrez faire une nouvelle demande.',
      '#fef3c7'
    )}
    
    <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 12px;">
      <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
        🔒 Conseils de sécurité
      </h3>
      <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>Utilisez au moins 8 caractères</li>
        <li>Mélangez majuscules, minuscules et chiffres</li>
        <li>Évitez les informations personnelles</li>
        <li>Ne partagez jamais votre mot de passe</li>
      </ul>
    </div>
    
    ${emailComponents.divider()}
    
    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
        Vous n'avez pas demandé cette réinitialisation ?
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        Ignorez simplement cet email. Votre mot de passe restera inchangé et personne<br>
        ne pourra accéder à votre compte.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding: 15px; background: #fee2e2; border-radius: 12px; border: 1px solid #fecaca;">
      <p style="color: #991b1b; font-size: 13px; margin: 0;">
        <strong>⚠️ Important :</strong> Si vous recevez régulièrement ces emails sans les avoir demandés, 
        contactez-nous immédiatement à contact@maisonoscar.fr
      </p>
    </div>
  `
  
  return baseEmailTemplate({
    preheader: 'Réinitialisez votre mot de passe - Expire dans 1 heure',
    headerBgColor: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
    headerIcon: '🔐',
    headerTitle: 'Réinitialisation de mot de passe',
    headerSubtitle: siteName,
    bodyContent
  })
}