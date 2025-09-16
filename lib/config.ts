// Configuration pour mode Dev/Production

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Mode pour afficher ou non les données de test
export const SHOW_MOCK_DATA = process.env.NEXT_PUBLIC_SHOW_MOCK_DATA === 'true' || isDevelopment;

export const config = {
  isDev: isDevelopment,
  isProd: isProduction,
  showMockData: SHOW_MOCK_DATA,
  siteUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  
  // Configuration par défaut du site
  defaults: {
    siteName: 'Maison Oscar',
    roomCount: 9,
    surface: 180,
    distanceToRennes: 15
  },
  
  // Contacts par défaut (peuvent être écrasés via l'admin)
  contacts: {
    phone: '+33 6 12 34 56 78',
    email: 'contact@maisonoscar.fr',
    whatsapp: '+33612345678', // Format sans espaces pour WhatsApp
    address: 'Bruz, Ille-et-Vilaine',
  }
};