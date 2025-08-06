// Fichier : lib/prisma.ts
// Description : Configuration Prisma Client pour MongoDB

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// === FONCTIONS UTILITAIRES === //

/**
 * Fonction pour fermer proprement la connexion Prisma
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

/**
 * Fonction pour tester la connexion MongoDB
 */
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Connexion MongoDB réussie')
    return true
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error)
    return false
  }
}

/**
 * Type pour les statistiques dashboard
 */
export interface DashboardStats {
  totalUsers: number
  totalRooms: number
  occupiedRooms: number
  totalBookings: number
  activeBookings: number
  pendingPayments: number
  latePayments: number
  newContacts: number
  monthlyRevenue: number
  occupancyRate: number
}

/**
 * Types pour les réponses API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Export par défaut
export default prisma