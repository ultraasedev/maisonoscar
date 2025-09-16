// Fichier : hooks/useRooms.ts
// Hook personnalisé pour la gestion des chambres - HARMONISÉ AVEC SCHEMA PRISMA

'use client'

import { useState, useCallback } from 'react'
import useApi, { useMutation } from '@/hooks/useApi'
import { RoomStatus } from '@prisma/client'

// Types pour les chambres - HARMONISÉ avec le schema Prisma
export interface Room {
  id: string
  name: string
  number: number
  price: number
  surface: number
  floor: number
  status: RoomStatus // Utilise directement l'enum Prisma: AVAILABLE | OCCUPIED | MAINTENANCE | UNAVAILABLE
  description?: string
  amenities: string[]
  images: string[]
  orientation: string
  hasBalcony: boolean
  hasPrivateBathroom: boolean
  hasDesk: boolean
  hasCloset: boolean
  hasWindow: boolean
  virtualTour?: string
  isVirtualTourActive: boolean
  isActive: boolean
  // Nouveaux champs
  bedType: 'SINGLE' | 'DOUBLE' | 'BUNK' | 'QUEEN' | 'KING'
  bedCount: number
  kitchenType: 'SHARED' | 'PRIVATE' | 'KITCHENETTE'
  kitchenEquipment: string[]
  hasMicrowave: boolean
  hasOven: boolean
  hasCookingPlates: boolean
  cookingPlateType: 'GAS' | 'INDUCTION' | 'ELECTRIC'
  sheetsProvided: boolean
  hasTV: boolean
  petsAllowed: boolean
  smokingAllowed: boolean
  exposure: 'SUNNY' | 'SHADED' | 'MIXED'
  createdAt: string
  updatedAt: string
  bookings?: Array<{
    id: string
    status: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }>
}

export interface CreateRoomData {
  name: string
  number: number
  price: number
  surface: number
  description: string
  hasPrivateBathroom: boolean
  hasBalcony: boolean
  hasDesk: boolean
  hasCloset: boolean
  hasWindow: boolean
  floor: number
  orientation?: string
  images: string[]
  virtualTour?: string
  isVirtualTourActive: boolean
  // Nouveaux champs
  bedType: 'SINGLE' | 'DOUBLE' | 'BUNK' | 'QUEEN' | 'KING'
  bedCount: number
  kitchenType: 'SHARED' | 'PRIVATE' | 'KITCHENETTE'
  kitchenEquipment: string[]
  hasMicrowave: boolean
  hasOven: boolean
  hasCookingPlates: boolean
  cookingPlateType: 'GAS' | 'INDUCTION' | 'ELECTRIC'
  sheetsProvided: boolean
  hasTV: boolean
  petsAllowed: boolean
  smokingAllowed: boolean
  exposure: 'SUNNY' | 'SHADED' | 'MIXED'
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  status?: RoomStatus
  isActive?: boolean
}

// Hook principal pour les chambres
export function useRooms(filters?: {
  status?: string
  minPrice?: number
  maxPrice?: number
  hasBalcony?: boolean
  floor?: number
}) {
  // Construction de l'URL avec filtres
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    
    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status)
    }
    if (filters?.minPrice) {
      params.append('minPrice', filters.minPrice.toString())
    }
    if (filters?.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString())
    }
    if (filters?.hasBalcony !== undefined) {
      params.append('hasBalcony', filters.hasBalcony.toString())
    }
    if (filters?.floor !== undefined) {
      params.append('floor', filters.floor.toString())
    }

    return `/api/rooms${params.toString() ? `?${params.toString()}` : ''}`
  }, [filters])

  return useApi<Room[]>(buildUrl())
}

// Hook pour une chambre spécifique
export function useRoom(roomId: string) {
  return useApi<Room>(`/api/rooms/${roomId}`)
}

// Hook pour les mutations (créer, modifier, supprimer)
export function useRoomMutations() {
  const createMutation = useMutation<CreateRoomData>()
  const updateMutation = useMutation<UpdateRoomData>()
  const deleteMutation = useMutation<{ ids: string[] }>()
  const bulkUpdateMutation = useMutation<{
    action: string
    roomIds: string[]
    status?: string
  }>()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // clearError stable avec useCallback
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Créer une chambre
  const createRoom = useCallback(async (data: CreateRoomData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await createMutation.mutate('/api/rooms', {
        method: 'POST',
        body: data
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [createMutation])

  // Modifier une chambre
  const updateRoom = useCallback(async (roomId: string, data: UpdateRoomData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await updateMutation.mutate(`/api/rooms/${roomId}`, {
        method: 'PUT',
        body: data
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [updateMutation])

  // Supprimer des chambres
  const deleteRooms = useCallback(async (roomIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await deleteMutation.mutate(`/api/rooms?ids=${roomIds.join(',')}`, {
        method: 'DELETE'
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteMutation])

  // Actions en lot (changer le statut, activer/désactiver)
  const bulkUpdateRooms = useCallback(async (
    action: 'bulk_status' | 'bulk_active',
    roomIds: string[],
    options: { status?: string; isActive?: boolean } = {}
  ) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await bulkUpdateMutation.mutate('/api/rooms', {
        method: 'PUT',
        body: {
          action,
          roomIds,
          ...options
        }
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [bulkUpdateMutation])

  // Actions rapides - Utilise maintenant RoomStatus de Prisma
  const toggleRoomStatus = useCallback(async (roomId: string, newStatus: RoomStatus) => {
    return updateRoom(roomId, { status: newStatus })
  }, [updateRoom])

  const toggleRoomActive = useCallback(async (roomId: string, isActive: boolean) => {
    return updateRoom(roomId, { isActive })
  }, [updateRoom])

  return {
    // Fonctions de mutation
    createRoom,
    updateRoom,
    deleteRooms,
    bulkUpdateRooms,
    
    // Actions rapides
    toggleRoomStatus,
    toggleRoomActive,
    
    // États
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading || bulkUpdateMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error || bulkUpdateMutation.error,
    
    // Reset des erreurs
    clearError
  }
}

// Hook pour les statistiques des chambres
export function useRoomStats() {
  return useApi('/api/rooms/stats')
}