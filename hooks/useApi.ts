// Fichier : hooks/useApi.ts
// Description : Hooks pour les appels API

'use client'

import { useState, useEffect, useCallback } from 'react'


// === TYPES === //

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface UseApiResult<T> {
  data: ApiResponse<T> | null
  loading: boolean
  error: string | null
  refresh: () => void
}

// === HOOK GÉNÉRIQUE === //

/**
 * Hook générique pour les appels API
 */
function useApi<T = any>(url: string, dependencies: any[] = []): UseApiResult<T> {
  const [data, setData] = useState<ApiResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!url) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Force fresh data
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<T> = await response.json()
      
      // ✅ CORRECTION : Accepter les données même si success n'est pas défini
      // L'API dashboard retourne directement les données sans wrapper success
      if (result.success === false) {
        throw new Error(result.error || 'Erreur API inconnue')
      }

      // Si pas de propriété success, considérer comme réussi si on a des données
      if (result.success === undefined && result) {
        setData({ success: true, data: result } as ApiResponse<T>)
      } else {
        setData(result)
      }
      setError(null)
    } catch (err) {
      console.error('Erreur API:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh }
}

// === HOOKS SPÉCIALISÉS === //

/**
 * Hook pour les statistiques du dashboard
 */
export function useDashboard(period: string = '30') {
  return useApi(`/api/dashboard?period=${period}`, [period])
}

/**
 * Hook pour les chambres
 */
export function useRooms() {
  return useApi('/api/rooms')
}

/**
 * Hook pour les utilisateurs
 */
export function useUsers() {
  return useApi('/api/users')
}

/**
 * Hook pour les réservations
 */
export function useBookings() {
  return useApi('/api/bookings')
}

/**
 * Hook pour les paiements
 */
export function usePayments() {
  return useApi('/api/payments')
}

/**
 * Hook pour les contacts
 */
export function useContacts() {
  return useApi('/api/contacts')
}

// === HOOKS AVEC POST/PUT/DELETE === //

/**
 * Hook pour les mutations API (POST, PUT, DELETE)
 */
export function useMutation<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (
    url: string,
    options: {
      method: 'POST' | 'PUT' | 'DELETE'
      body?: any
      headers?: Record<string, string>
    }
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<T> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur API inconnue')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}

// === EXPORT DEFAULT === //

export default useApi