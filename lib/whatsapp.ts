// Service de notifications WhatsApp (gratuit avec Twilio Sandbox)
// Pour utiliser en production : https://www.twilio.com/whatsapp/sandbox

interface WhatsAppMessage {
  to: string
  body: string
}

// Configuration Twilio (sandbox gratuit)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886' // Numéro sandbox Twilio

export const sendWhatsAppNotification = async ({ to, body }: WhatsAppMessage) => {
  // Vérifier si la configuration existe
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('⚠️ WhatsApp non configuré - Variables Twilio manquantes')
    console.log('Pour activer les notifications WhatsApp gratuites :')
    console.log('1. Créez un compte Twilio gratuit : https://www.twilio.com/try-twilio')
    console.log('2. Activez le sandbox WhatsApp : https://www.twilio.com/whatsapp/sandbox')
    console.log('3. Ajoutez dans .env :')
    console.log('   TWILIO_ACCOUNT_SID=your_account_sid')
    console.log('   TWILIO_AUTH_TOKEN=your_auth_token')
    console.log('   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886 (numéro sandbox)')
    return { success: false, error: 'WhatsApp non configuré' }
  }

  try {
    // Formater le numéro de téléphone (doit commencer par whatsapp:+)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    
    // Utiliser l'API Twilio pour envoyer le message
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM,
          To: formattedTo,
          Body: body
        })
      }
    )

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ WhatsApp envoyé:', data.sid)
      return { success: true, messageId: data.sid }
    } else {
      console.error('❌ Erreur WhatsApp:', data)
      return { success: false, error: data.message || 'Erreur envoi WhatsApp' }
    }
  } catch (error) {
    console.error('❌ Erreur WhatsApp:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

// Notifications pour les événements importants
export const notifyNewBookingRequest = async (adminPhone: string, bookingData: {
  firstName: string
  lastName: string
  roomName: string
  startDate: string
}) => {
  const message = `🏡 *Nouvelle demande de réservation*

👤 ${bookingData.firstName} ${bookingData.lastName}
🛏️ Chambre: ${bookingData.roomName}
📅 Date début: ${bookingData.startDate}

Connectez-vous au dashboard pour examiner le dossier.`

  return sendWhatsAppNotification({
    to: adminPhone,
    body: message
  })
}

export const notifyContractSigned = async (adminPhone: string, data: {
  tenantName: string
  roomName: string
}) => {
  const message = `✅ *Contrat signé*

👤 ${data.tenantName}
🛏️ Chambre: ${data.roomName}

Le contrat a été signé électroniquement.`

  return sendWhatsAppNotification({
    to: adminPhone,
    body: message
  })
}

export const notifyIncompleteFileCompleted = async (adminPhone: string, data: {
  tenantName: string
  roomName: string
}) => {
  const message = `📋 *Dossier complété*

👤 ${data.tenantName}
🛏️ Chambre: ${data.roomName}

Le dossier incomplet a été complété. Vérifiez les nouveaux documents.`

  return sendWhatsAppNotification({
    to: adminPhone,
    body: message
  })
}

// Instructions pour configurer le sandbox WhatsApp
export const getWhatsAppSetupInstructions = () => {
  return `
📱 Configuration WhatsApp Gratuite (Sandbox Twilio)

1. Créez un compte Twilio gratuit :
   https://www.twilio.com/try-twilio

2. Activez le sandbox WhatsApp :
   https://www.twilio.com/whatsapp/sandbox

3. Suivez les instructions pour joindre le sandbox :
   - Envoyez le code affiché au numéro WhatsApp indiqué
   - Ex: "join kitchen-example" au +1 415 523 8886

4. Récupérez vos identifiants dans la console Twilio :
   - Account SID
   - Auth Token

5. Ajoutez dans votre fichier .env :
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

6. Pour recevoir les notifications, les admins doivent :
   - Joindre le sandbox en envoyant le code
   - Renseigner leur numéro WhatsApp dans leur profil

Limitations du mode gratuit :
- Maximum 100 messages/jour
- Les destinataires doivent rejoindre le sandbox
- Messages valides 24h après la dernière interaction

Pour la production, passez à un compte WhatsApp Business API.
`
}