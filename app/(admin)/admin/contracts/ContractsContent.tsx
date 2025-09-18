'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Trash2, Star, RefreshCw, Eye, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}

interface Room {
  id: string
  name: string
  number: number
  price: number
  surface: number
  floor: number
}

interface Booking {
  id: string
  user: User
  room: Room
}

interface Contract {
  id: string
  contractNumber: string
  booking: Booking
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  charges: number
  status: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  signatures: any[]
}

const ContractsContent: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les contrats
  const fetchContracts = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Appel API /api/contracts...')

      const response = await fetch('/api/contracts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Statut réponse:', response.status)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('Données reçues:', data)

      if (data.success) {
        setContracts(data.data || [])
        console.log(`${data.data.length} contrats chargés`)
      } else {
        throw new Error(data.error || 'Erreur inconnue')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      toast.error('Impossible de charger les contrats')
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un contrat
  const deleteContract = async (contractId: string, contractNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le contrat ${contractNumber} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Contrat supprimé avec succès')
        fetchContracts() // Recharger la liste
      } else {
        throw new Error(data.error || 'Erreur de suppression')
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Définir comme contrat par défaut
  const setAsDefault = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/set-default`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Contrat défini comme modèle par défaut')
        fetchContracts()
      } else {
        throw new Error(data.error || 'Erreur')
      }
    } catch (err) {
      console.error('Erreur:', err)
      toast.error('Erreur lors de la définition comme défaut')
    }
  }

  // Regénérer le PDF
  const regeneratePDF = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/regenerate-pdf`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('PDF regénéré avec succès')
        fetchContracts()
      } else {
        throw new Error(data.error || 'Erreur')
      }
    } catch (err) {
      console.error('Erreur:', err)
      toast.error('Erreur lors de la regénération')
    }
  }

  // Hook d'effet pour charger les contrats au montage
  useEffect(() => {
    console.log('Composant monté, chargement des contrats...')
    fetchContracts()
  }, [])

  // Logs de debug
  console.log('Render - contracts:', contracts.length, 'loading:', loading, 'error:', error)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8" />
                Gestion des Contrats
              </h1>
              <p className="text-gray-600 mt-2">
                {contracts.length} contrat{contracts.length !== 1 ? 's' : ''} trouvé{contracts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchContracts}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                Nouveau Contrat
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Chargement des contrats...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-600 mb-4">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold">Erreur de chargement</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={fetchContracts}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun contrat trouvé
              </h3>
              <p className="text-gray-600">
                Créez votre premier contrat depuis une réservation confirmée
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Contrat #{contract.contractNumber}
                          </h3>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {contract.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 block">Locataire:</span>
                            <span className="font-medium text-gray-900">
                              {contract.booking.user.firstName} {contract.booking.user.lastName}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-500 block">Chambre:</span>
                            <span className="font-medium text-gray-900">
                              {contract.booking.room.name}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-500 block">Loyer:</span>
                            <span className="font-medium text-gray-900">
                              {contract.monthlyRent}€/mois
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-500 block">Dépôt:</span>
                            <span className="font-medium text-gray-900">
                              {contract.deposit}€
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => regeneratePDF(contract.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Regénérer PDF"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>

                      {contract.pdfUrl && (
                        <button
                          onClick={() => window.open(contract.pdfUrl, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        onClick={() => setAsDefault(contract.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Définir comme modèle par défaut"
                      >
                        <Star className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => deleteContract(contract.id, contract.contractNumber)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer le contrat"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContractsContent