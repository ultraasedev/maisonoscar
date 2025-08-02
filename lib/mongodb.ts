/**
 * Fichier : lib/mongodb.ts
 * Description : Configuration et connexion à MongoDB Atlas
 * Inclut : Connexion, modèles, utilitaires
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// === CONFIGURATION === //

/**
 * URL de connexion MongoDB Atlas
 * Format : mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
 */
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'maison-oscar-coliving';

if (!MONGODB_URI) {
  throw new Error('Variable d\'environnement MONGODB_URI manquante');
}

// === INTERFACES === //

/**
 * Interface pour la connexion MongoDB
 */
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

/**
 * Cache global pour la connexion (important pour Vercel/serverless)
 */
interface GlobalMongo {
  conn: MongoConnection | null;
  promise: Promise<MongoConnection> | null;
}

// Déclaration du cache global
declare global {
  var __mongo: GlobalMongo | undefined;
}

// === GESTION DE LA CONNEXION === //

/**
 * Cache de connexion global pour éviter les reconnexions multiples
 */
let cached: GlobalMongo = global.__mongo ?? {
  conn: null,
  promise: null,
};

if (!global.__mongo) {
  global.__mongo = cached;
}

/**
 * Connexion à MongoDB Atlas avec gestion du cache
 * 
 * @returns Promise<MongoConnection> Connexion MongoDB avec client et db
 */
export async function connectToDatabase(): Promise<MongoConnection> {
  // Si on a déjà une connexion en cache, on la retourne
  if (cached.conn) {
    return cached.conn;
  }

  // Si une promesse de connexion est en cours, on l'attend
  if (!cached.promise) {
    const opts: MongoClientOptions = {
      // Options de configuration pour la production
      maxPoolSize: 10, // Maintient jusqu'à 10 connexions socket
      serverSelectionTimeoutMS: 5000, // Garde un délai d'attente de 5 secondes pour la sélection du serveur
      socketTimeoutMS: 45000, // Ferme les sockets après 45 secondes d'inactivité
      family: 4, // Utilise IPv4, ignore IPv6
      retryWrites: true,
      w: 1, // Équivalent à 'majority' pour la plupart des cas
    };

    // Création de la promesse de connexion
    cached.promise = MongoClient.connect(MONGODB_URI!, opts).then((client) => {
      console.log('✅ Connexion MongoDB Atlas établie');
      
      const db = client.db(MONGODB_DB);
      
      return {
        client,
        db,
      };
    }).catch((error) => {
      console.error('❌ Erreur de connexion MongoDB Atlas:', error);
      // Reset la promesse en cas d'erreur pour permettre un retry
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Obtient la base de données MongoDB
 * 
 * @returns Promise<Db> Base de données MongoDB
 */
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Ferme la connexion MongoDB (principalement pour les tests)
 */
export async function closeConnection(): Promise<void> {
  if (cached.conn) {
    await cached.conn.client.close();
    cached.conn = null;
    cached.promise = null;
  }
}

// === UTILITAIRES DE COLLECTION === //

/**
 * Noms des collections MongoDB
 */
export const COLLECTIONS = {
  USERS: 'users',
  HOUSINGS: 'housings',
  RESERVATIONS: 'reservations',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  ADMIN_USERS: 'admin_users',
  FILES: 'files',
  LOGS: 'logs',
} as const;

/**
 * Obtient une collection spécifique
 * 
 * @param collectionName Nom de la collection
 * @returns Collection MongoDB
 */
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

// === HELPERS SPÉCIFIQUES === //

/**
 * Helper pour les logements
 */
export const HousingService = {
  /**
   * Obtient tous les logements actifs
   */
  async getActiveHousings() {
    const collection = await getCollection(COLLECTIONS.HOUSINGS);
    return collection.find({ status: 'active' }).toArray();
  },

  /**
   * Obtient un logement par ID
   */
  async getHousingById(id: string) {
    const collection = await getCollection(COLLECTIONS.HOUSINGS);
    return collection.findOne({ id });
  },

  /**
   * Crée un nouveau logement
   */
  async createHousing(housingData: any) {
    const collection = await getCollection(COLLECTIONS.HOUSINGS);
    const result = await collection.insertOne({
      ...housingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  /**
   * Met à jour un logement
   */
  async updateHousing(id: string, updateData: any) {
    const collection = await getCollection(COLLECTIONS.HOUSINGS);
    return collection.updateOne(
      { id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );
  },
};

/**
 * Helper pour les réservations
 */
export const ReservationService = {
  /**
   * Crée une nouvelle réservation
   */
  async createReservation(reservationData: any) {
    const collection = await getCollection(COLLECTIONS.RESERVATIONS);
    const result = await collection.insertOne({
      ...reservationData,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  /**
   * Obtient les réservations d'un utilisateur
   */
  async getUserReservations(tenantId: string) {
    const collection = await getCollection(COLLECTIONS.RESERVATIONS);
    return collection.find({ tenantId }).sort({ createdAt: -1 }).toArray();
  },

  /**
   * Met à jour le statut d'une réservation
   */
  async updateReservationStatus(id: string, status: string, processedBy?: string) {
    const collection = await getCollection(COLLECTIONS.RESERVATIONS);
    return collection.updateOne(
      { id },
      { 
        $set: { 
          status, 
          processedBy,
          updatedAt: new Date() 
        } 
      }
    );
  },
};

/**
 * Helper pour les paiements
 */
export const PaymentService = {
  /**
   * Crée un nouveau paiement
   */
  async createPayment(paymentData: any) {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    const result = await collection.insertOne({
      ...paymentData,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  /**
   * Obtient les paiements d'un utilisateur
   */
  async getUserPayments(tenantId: string) {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    return collection.find({ tenantId }).sort({ dueDate: -1 }).toArray();
  },

  /**
   * Marque un paiement comme payé
   */
  async markPaymentAsPaid(id: string, method: string, reference?: string) {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    return collection.updateOne(
      { id },
      { 
        $set: { 
          status: 'paid',
          method,
          reference,
          paidDate: new Date(),
          updatedAt: new Date() 
        } 
      }
    );
  },
};

/**
 * Helper pour les notifications
 */
export const NotificationService = {
  /**
   * Crée une nouvelle notification
   */
  async createNotification(notificationData: any) {
    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);
    const result = await collection.insertOne({
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      isRead: false,
      createdAt: new Date(),
    });
    return result;
  },

  /**
   * Obtient les notifications d'un utilisateur
   */
  async getUserNotifications(recipientId: string, limit = 20) {
    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);
    return collection
      .find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: string) {
    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);
    return collection.updateOne(
      { id },
      { 
        $set: { 
          isRead: true,
          readAt: new Date() 
        } 
      }
    );
  },
};

// === GESTION DES INDEX === //

/**
 * Crée les index nécessaires pour optimiser les performances
 */
export async function createIndexes() {
  const db = await getDatabase();

  try {
    // Index pour les logements
    await db.collection(COLLECTIONS.HOUSINGS).createIndex({ status: 1 });
    await db.collection(COLLECTIONS.HOUSINGS).createIndex({ 'address.city': 1 });
    await db.collection(COLLECTIONS.HOUSINGS).createIndex({ availableFrom: 1 });

    // Index pour les réservations
    await db.collection(COLLECTIONS.RESERVATIONS).createIndex({ tenantId: 1 });
    await db.collection(COLLECTIONS.RESERVATIONS).createIndex({ status: 1 });
    await db.collection(COLLECTIONS.RESERVATIONS).createIndex({ housingId: 1 });
    await db.collection(COLLECTIONS.RESERVATIONS).createIndex({ createdAt: -1 });

    // Index pour les paiements
    await db.collection(COLLECTIONS.PAYMENTS).createIndex({ tenantId: 1 });
    await db.collection(COLLECTIONS.PAYMENTS).createIndex({ status: 1 });
    await db.collection(COLLECTIONS.PAYMENTS).createIndex({ dueDate: 1 });

    // Index pour les notifications
    await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex({ recipientId: 1 });
    await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex({ isRead: 1 });
    await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex({ createdAt: -1 });

    console.log('✅ Index MongoDB créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
  }
}

// === MIDDLEWARE DE VALIDATION === //

/**
 * Valide les données avant insertion en base
 */
export const validateDocument = {
  /**
   * Valide les données d'un logement
   */
  housing: (data: any) => {
    const required = ['name', 'description', 'address', 'pricing'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Champs requis manquants: ${missing.join(', ')}`);
    }
    
    return true;
  },

  /**
   * Valide les données d'une réservation
   */
  reservation: (data: any) => {
    const required = ['tenantId', 'housingId', 'moveInDate'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Champs requis manquants: ${missing.join(', ')}`);
    }
    
    return true;
  },
};

// === EXPORTS === //

// Export par défaut avec toutes les fonctionnalités
export default {
  connect: connectToDatabase,
  database: getDatabase,
  collection: getCollection,
  close: closeConnection,
  services: {
    housing: HousingService,
    reservation: ReservationService,
    payment: PaymentService,
    notification: NotificationService,
  },
  utils: {
    createIndexes,
    validate: validateDocument,
  },
  collections: COLLECTIONS,
};