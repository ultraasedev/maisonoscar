import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // en millisecondes
  maxRequests: number;
}

// Stockage en mémoire (pour une solution simple sans Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Nettoyer les entrées expirées toutes les minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest) => {
    // Récupérer l'IP du client
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                req.headers.get('x-real-ip') || 
                'unknown';
    
    // Créer une clé unique basée sur l'IP et le chemin
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    const now = Date.now();
    const record = rateLimitStore.get(key);
    
    if (!record) {
      // Première requête
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.interval
      });
      return { success: true, remaining: config.maxRequests - 1 };
    }
    
    if (record.resetTime < now) {
      // La fenêtre de temps est expirée, réinitialiser
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.interval
      });
      return { success: true, remaining: config.maxRequests - 1 };
    }
    
    if (record.count >= config.maxRequests) {
      // Limite atteinte
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return { 
        success: false, 
        remaining: 0,
        retryAfter
      };
    }
    
    // Incrémenter le compteur
    record.count++;
    rateLimitStore.set(key, record);
    
    return { 
      success: true, 
      remaining: config.maxRequests - record.count 
    };
  };
}

// Configurations prédéfinies
export const rateLimitConfigs = {
  // API Contact : 5 requêtes par 15 minutes
  contact: rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  }),
  
  // API Booking : 3 requêtes par heure
  booking: rateLimit({
    interval: 60 * 60 * 1000, // 1 heure
    maxRequests: 3
  }),
  
  // API Auth (login, forgot password) : 5 tentatives par 15 minutes
  auth: rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  }),
  
  // API générale : 100 requêtes par minute
  general: rateLimit({
    interval: 60 * 1000, // 1 minute
    maxRequests: 100
  })
};