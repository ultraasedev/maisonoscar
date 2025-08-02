/**
 * Fichier : types/index.ts
 * Description : Définition de tous les types TypeScript pour l'application co-living
 * Inclut : Types pour logements, locataires, réservations, paiements, etc.
 */

// === TYPES DE BASE === //

/**
 * Type pour les identifiants uniques
 */
export type ID = string;

/**
 * Type pour les dates (ISO string ou Date)
 */
export type DateString = string | Date;

/**
 * Statut général pour les entités
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * Situation professionnelle du locataire
 */
export type ProfessionalSituation = 
  | 'student' 
  | 'employee' 
  | 'freelance' 
  | 'unemployed' 
  | 'retired' 
  | 'intern' 
  | 'other';

/**
 * Statut d'une réservation
 */
export type ReservationStatus = 
  | 'pending'           // En attente de traitement
  | 'under_review'      // Dossier en cours d'examen
  | 'approved'          // Dossier approuvé
  | 'contract_sent'     // Contrat envoyé
  | 'contract_signed'   // Contrat signé
  | 'deposit_pending'   // En attente de caution
  | 'confirmed'         // Réservation confirmée
  | 'active'            // Location active
  | 'rejected'          // Dossier rejeté
  | 'cancelled';        // Annulé

/**
 * Type de paiement
 */
export type PaymentType = 
  | 'rent'              // Loyer mensuel
  | 'deposit'           // Caution
  | 'contract_fees'     // Frais de rédaction
  | 'utilities'         // Charges
  | 'late_fee';         // Frais de retard

/**
 * Statut d'un paiement
 */
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial' | 'refunded';

/**
 * Type de notification
 */
export type NotificationType = 
  | 'new_reservation'
  | 'payment_received'
  | 'payment_overdue'
  | 'contract_signed'
  | 'tenant_checkout'
  | 'maintenance_request'
  | 'document_missing';

/**
 * Canal de notification
 */
export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';

// === TYPES POUR LES LOGEMENTS === //

/**
 * Type pour une pièce dans un logement
 */
export interface Room {
  id: ID;
  name: string;                           // Nom de la pièce (ex: "Chambre 1", "Salon")
  type: 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'other';
  size?: number;                          // Superficie en m²
  equipment: string[];                    // Liste des équipements
  price?: number;                         // Prix mensuel (pour les chambres)
  isAvailable: boolean;                   // Disponibilité
  currentTenant?: ID;                     // ID du locataire actuel
  photos: string[];                       // URLs des photos
  description?: string;                   // Description de la pièce
}

/**
 * Configuration des prix et frais d'un logement
 */
export interface PricingConfig {
  basePrice: number;                      // Prix de base par chambre
  deposit?: number;                       // Montant de la caution
  hasDeposit: boolean;                    // Si caution requise
  contractFees?: number;                  // Frais de rédaction de bail
  hasContractFees: boolean;               // Si frais de rédaction
  eligibleAPL: boolean;                   // Éligible aux APL
  utilities: {                           // Charges incluses
    electricity: boolean;
    water: boolean;
    internet: boolean;
    heating: boolean;
    insurance: boolean;
  };
}

/**
 * Type principal pour un logement
 */
export interface Housing {
  id: ID;
  name: string;                           // Nom du logement
  description: string;                    // Description complète
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  photos: string[];                       // Photos principales du logement
  virtual3DUrl?: string;                  // Lien vers la visite 3D
  rooms: Room[];                          // Liste des pièces
  pricing: PricingConfig;                 // Configuration des prix
  availableFrom: DateString;              // Date de disponibilité
  maxStayDuration?: number;               // Durée max de séjour (en mois)
  minStayDuration?: number;               // Durée min de séjour (en mois)
  rules: string[];                        // Règlement intérieur
  amenities: string[];                    // Commodités générales
  transport: {                           // Informations transport
    metro?: string[];
    bus?: string[];
    tramway?: string[];
    train?: string[];
  };
  status: Status;
  createdAt: DateString;
  updatedAt: DateString;
  ownerId: ID;                           // ID du propriétaire
}

// === TYPES POUR LES LOCATAIRES === //

/**
 * Type de revenus
 */
export interface IncomeRange {
  min: number;
  max: number;
  currency: string;
}

/**
 * Documents requis pour la candidature
 */
export interface RequiredDocuments {
  id: string;                             // CNI/Passeport
  proofOfAddress: string;                 // Justificatif de domicile
  taxReturn: string;                      // Avis d'imposition
  employmentContract?: string;            // Contrat de travail
  payslips?: string[];                    // Bulletins de salaire
  studentCard?: string;                   // Carte étudiant
  parentalGuarantee?: string;             // Garantie parentale si mineur
  parentDocuments?: {                     // Documents des parents si mineur
    parentId: string;
    parentTaxReturn: string;
    parentEmploymentContract?: string;
  };
}

/**
 * Informations sur un locataire/candidat
 */
export interface Tenant {
  id: ID;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: DateString;
    isMinor: boolean;
    currentAddress: string;
    nationality: string;
  };
  legalGuardian?: {                       // Si mineur
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
  };
  professionalInfo: {
    situation: ProfessionalSituation;
    company?: string;
    position?: string;
    incomeRange: IncomeRange;
    hasGuarantor: boolean;
    guarantorInfo?: {
      name: string;
      email: string;
      phone: string;
      relationship: string;
    };
  };
  socialAid: {                           // Aides sociales
    hasCAF: boolean;
    hasAPL: boolean;
    otherAids: string[];
  };
  documents: RequiredDocuments;
  preferences: {
    roomType?: string;
    budget: IncomeRange;
    moveInDate: DateString;
    stayDuration: '< 3 months' | '< 6 months' | '6-12 months' | '> 1 year';
    hasRoommates: boolean;                // Vient avec des amis
    roommateInfo?: Tenant[];              // Infos des colocataires
  };
  status: 'prospect' | 'tenant' | 'former_tenant' | 'rejected';
  createdAt: DateString;
  updatedAt: DateString;
}

// === TYPES POUR LES RÉSERVATIONS === //

/**
 * Informations de réservation
 */
export interface Reservation {
  id: ID;
  tenantId: ID;                          // ID du locataire principal
  housingId: ID;                         // ID du logement
  roomId?: ID;                           // ID de la chambre (si spécifiée)
  moveInDate: DateString;                // Date d'emménagement souhaitée
  moveOutDate?: DateString;              // Date de sortie prévue
  duration: string;                      // Durée souhaitée
  totalPrice: number;                    // Prix total calculé
  deposit?: number;                      // Montant de la caution
  contractFees?: number;                 // Frais de contrat
  status: ReservationStatus;
  
  // Gestion des documents manquants
  missingDocuments: string[];            // Liste des docs manquants
  
  // Suivi des relances
  reminders: {
    type: 'status' | 'signature' | 'payment';
    sentAt: DateString;
    count: number;
  }[];
  
  // Informations de contrat
  contract?: {
    generatedAt: DateString;
    sentAt?: DateString;
    signedAt?: DateString;
    contractUrl: string;
  };
  
  // Informations de paiement
  payment?: {
    firstRentPaid: boolean;
    depositPaid: boolean;
    contractFeesPaid: boolean;
    paymentMethod: 'bank_transfer' | 'card' | 'cash';
  };
  
  notes: string;                         // Notes administratives
  createdAt: DateString;
  updatedAt: DateString;
  processedBy?: ID;                      // ID de l'admin qui traite
}

// === TYPES POUR LES PAIEMENTS === //

/**
 * Informations de paiement
 */
export interface Payment {
  id: ID;
  tenantId: ID;
  housingId: ID;
  reservationId?: ID;
  type: PaymentType;
  amount: number;
  dueDate: DateString;
  paidDate?: DateString;
  status: PaymentStatus;
  method?: 'bank_transfer' | 'card' | 'cash' | 'check';
  reference?: string;                    // Référence de transaction
  
  // Gestion des relances
  reminders: {
    sentAt: DateString;
    type: 'reminder' | 'late_notice' | 'final_notice';
  }[];
  
  // Informations de reçu
  receipt?: {
    generated: boolean;
    sentAt?: DateString;
    receiptUrl?: string;
  };
  
  notes?: string;
  createdAt: DateString;
  updatedAt: DateString;
  processedBy?: ID;
}

// === TYPES POUR L'ADMINISTRATION === //

/**
 * Utilisateur administrateur
 */
export interface AdminUser {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'manager';
  permissions: string[];
  isActive: boolean;
  lastLogin?: DateString;
  createdAt: DateString;
}

/**
 * Statistiques du dashboard
 */
export interface DashboardStats {
  totalHousings: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingReservations: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageStayDuration: number;
  
  // Graphiques
  monthlyStats: {
    month: string;
    reservations: number;
    revenue: number;
    occupancy: number;
  }[];
  
  // Répartition par durée de séjour
  stayDurationBreakdown: {
    duration: string;
    count: number;
    percentage: number;
  }[];
}

// === TYPES POUR LES NOTIFICATIONS === //

/**
 * Notification système
 */
export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: ID;
  recipientType: 'admin' | 'tenant';
  channels: NotificationChannel[];
  data?: Record<string, any>;            // Données supplémentaires
  sentAt?: DateString;
  readAt?: DateString;
  isRead: boolean;
  createdAt: DateString;
}

// === TYPES POUR LES FORMULAIRES === //

/**
 * Données du formulaire de réservation
 */
export interface ReservationFormData {
  // Informations personnelles
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    currentAddress: string;
  };
  
  // Tuteur légal si mineur
  legalGuardian?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
  };
  
  // Situation professionnelle
  professionalInfo: {
    situation: ProfessionalSituation;
    company?: string;
    incomeRange: {
      min: number;
      max: number;
    };
  };
  
  // Préférences de logement
  preferences: {
    housingId: string;
    roomId?: string;
    moveInDate: string;
    stayDuration: string;
    hasRoommates: boolean;
  };
  
  // Fichiers uploadés
  documents: {
    [key: string]: File | string;
  };
  
  // Colocataires
  roommates?: Partial<ReservationFormData>[];
}

// === TYPES POUR LES API === //

/**
 * Réponse API standard
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Pagination pour les listes
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Réponse avec pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Filtres pour la recherche de logements
 */
export interface HousingFilters {
  city?: string;
  priceMin?: number;
  priceMax?: number;
  availableFrom?: string;
  roomType?: string;
  amenities?: string[];
  stayDuration?: string;
}