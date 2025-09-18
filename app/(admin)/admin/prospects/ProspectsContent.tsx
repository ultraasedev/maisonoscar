'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Eye, Check, X, Clock, AlertCircle,
  FileText,
  Euro, RefreshCw, Loader2,
  CheckCircle, XCircle, FileCheck, Edit2, Trash2, Send, Download
} from 'lucide-react'
import { toast } from 'sonner'
import DocumentViewer from '@/components/admin/DocumentViewer'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'

// Fonction pour traduire les noms de documents techniques en français
const getDocumentLabel = (key: string): string => {
  const labels: Record<string, string> = {
    'idCard': 'Pièce d\'identité',
    'currentAddressProof': 'Justificatif de domicile',
    'taxNoticeN1': 'Avis d\'imposition N-1',
    'taxNoticeN2': 'Avis d\'imposition N-2',
    'payslips': 'Fiches de paie',
    'workContract': 'Contrat de travail',
    'schoolCertificate': 'Certificat de scolarité',
    'apprenticeshipContract': 'Contrat d\'apprentissage',
    'accountingReport': 'Bilan comptable',
    'incomeProof': 'Justificatif de revenus',
    'visaleAttestation': 'Attestation Visale',
    'kbis': 'Extrait KBIS',
    'addressProof': 'Justificatif d\'adresse',
    'commitmentLetter': 'Lettre d\'engagement'
  }
  return labels[key] || key.replace(/([A-Z])/g, ' $1').trim()
}

interface BookingRequest {
  id: string
  roomId: string
  room: {
    id: string
    name: string
    number: number
    price: number
  }
  
  // Informations personnelles
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  nationality: string
  maritalStatus: string
  
  // Situation
  currentHousingSituation: string
  currentAddress: string
  currentCity: string
  currentZipCode: string
  
  // Professionnel
  professionalStatus: string
  employerName?: string
  schoolName?: string
  monthlyIncome?: number
  
  // Garant
  hasGuarantor: boolean
  guarantorType: string
  guarantorFirstName?: string
  guarantorLastName?: string
  
  // Durée
  desiredStartDate: string
  desiredDuration: number
  hasLivedInColiving: boolean
  
  // Documents
  documents: any
  
  // Statut
  status: string
  submittedAt?: string
  reviewedAt?: string
  reviewNotes?: string
  rejectionReason?: string
  
  reviewer?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: Edit2 },
  SUBMITTED: { label: 'Soumis', color: 'bg-blue-100 text-blue-700', icon: Send },
  IN_REVIEW: { label: 'En cours', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  INCOMPLETE: { label: 'Incomplet', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  APPROVED: { label: 'Dossier validé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  INSPECTION_SCHEDULED: { label: 'État des lieux programmé', color: 'bg-teal-100 text-teal-700', icon: Eye },
  READY_FOR_CONTRACT: { label: 'Prêt pour contrat', color: 'bg-emerald-100 text-emerald-700', icon: FileText },
  CONTRACT_SENT: { label: 'Contrat envoyé', color: 'bg-purple-100 text-purple-700', icon: Send },
  CONTRACT_SIGNED: { label: 'Contrat signé', color: 'bg-indigo-100 text-indigo-700', icon: FileCheck },
  REJECTED: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: XCircle },
  DEPOSIT_PENDING: { label: 'Attente caution', color: 'bg-yellow-100 text-yellow-700', icon: Euro },
  COMPLETED: { label: 'Finalisé', color: 'bg-green-100 text-green-700', icon: Check }
}

const professionalStatusLabels = {
  EMPLOYEE: 'Salarié(e)',
  SELF_EMPLOYED: 'Auto-entrepreneur',
  BUSINESS_OWNER: 'Chef d\'entreprise',
  STUDENT: 'Étudiant(e)',
  ALTERNANT: 'Alternant(e)',
  UNEMPLOYED: 'Sans emploi',
  OTHER: 'Autre'
}

export default function ProspectsContent() {
  const [prospects, setProspects] = useState<BookingRequest[]>([])
  const [filteredProspects, setFilteredProspects] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProspect, setSelectedProspect] = useState<BookingRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [documentsToView, setDocumentsToView] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prospectToDelete, setProspectToDelete] = useState<BookingRequest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'incomplete' | 'schedule_inspection' | 'ready_for_contract' | 'send_contract' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchProspects()
  }, [])

  useEffect(() => {
    filterProspects()
  }, [prospects, searchQuery, statusFilter])

  const fetchProspects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/booking-requests')
      const data = await response.json()
      
      if (data.success) {
        setProspects(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des dossiers')
    } finally {
      setLoading(false)
    }
  }

  const filterProspects = () => {
    let filtered = [...prospects]
    
    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.room.name.toLowerCase().includes(query)
      )
    }
    
    setFilteredProspects(filtered)
  }

  const handleDelete = (prospect: BookingRequest) => {
    setProspectToDelete(prospect)
    setShowDeleteModal(true)
  }

  const downloadDocument = (documentUrl: string, fileName: string, documentType: string) => {
    try {
      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement('a')
      link.href = documentUrl
      link.download = `${fileName}_${documentType}_${Date.now()}.${getFileExtension(documentUrl)}`
      link.target = '_blank'

      // Ajouter le lien au DOM, cliquer et le supprimer
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Document "${documentType}" téléchargé`)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement du document')
    }
  }

  const getFileExtension = (url: string) => {
    // Extraire l'extension du fichier depuis l'URL ou data URL
    if (url.startsWith('data:')) {
      // Pour les data URLs, extraire le type MIME
      const mimeMatch = url.match(/data:([^;]+)/)
      if (mimeMatch) {
        const mimeType = mimeMatch[1]
        if (mimeType.includes('pdf')) return 'pdf'
        if (mimeType.includes('image')) return 'jpg'
        if (mimeType.includes('text')) return 'txt'
      }
      return 'file'
    } else {
      // Pour les URLs normales, extraire l'extension
      const extension = url.split('.').pop()
      return extension || 'file'
    }
  }

  const confirmDelete = async () => {
    if (!prospectToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/booking-requests/${prospectToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Demande supprimée avec succès')
      fetchProspects()
      setShowDeleteModal(false)
      setProspectToDelete(null)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleStatusUpdate = async (prospectId: string, newStatus: string, notes?: string, reason?: string) => {
    try {
      const response = await fetch(`/api/booking-requests/${prospectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: notes,
          rejectionReason: reason
        })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }
      
      toast.success('Statut mis à jour avec succès')
      fetchProspects()
      setShowActionModal(false)
      setSelectedProspect(null)
      
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }


  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const stats = {
    total: prospects.length,
    submitted: prospects.filter(p => p.status === 'SUBMITTED').length,
    inReview: prospects.filter(p => p.status === 'IN_REVIEW').length,
    approved: prospects.filter(p => p.status === 'APPROVED').length,
    rejected: prospects.filter(p => p.status === 'REJECTED').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProspects.length} dossier{filteredProspects.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={fetchProspects}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="ALL">Tous les statuts</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <div className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-sm font-bold">{stats.total}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-600">Soumis</p>
              <p className="text-sm font-bold text-blue-700">{stats.submitted}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-600">En cours</p>
              <p className="text-sm font-bold text-yellow-700">{stats.inReview}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-green-100 rounded-lg">
              <p className="text-xs text-green-600">Approuvés</p>
              <p className="text-sm font-bold text-green-700">{stats.approved}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-red-100 rounded-lg">
              <p className="text-xs text-red-600">Refusés</p>
              <p className="text-sm font-bold text-red-700">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredProspects.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun dossier trouvé
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Essayez de modifier vos filtres.'
                : 'Les nouveaux dossiers apparaîtront ici.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chambre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Situation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Soumis le
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProspects.map((prospect) => {
                    const status = statusConfig[prospect.status as keyof typeof statusConfig] || statusConfig.DRAFT
                    const StatusIcon = status.icon
                    const age = getAge(prospect.birthDate)
                    const isMinor = age < 18
                    
                    return (
                      <motion.tr
                        key={prospect.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {prospect.firstName} {prospect.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prospect.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prospect.phone}
                              </div>
                              {isMinor && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                  Mineur ({age} ans)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {prospect.room.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prospect.room.price}€/mois
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(prospect.desiredStartDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prospect.desiredDuration} mois
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {professionalStatusLabels[prospect.professionalStatus as keyof typeof professionalStatusLabels]}
                          </div>
                          {prospect.hasGuarantor && (
                            <div className="text-sm text-gray-500">
                              Garant: {prospect.guarantorType === 'INDIVIDUAL' ? 'Personne' : prospect.guarantorType}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prospect.submittedAt 
                            ? new Date(prospect.submittedAt).toLocaleDateString('fr-FR')
                            : 'Non soumis'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedProspect(prospect)
                                setShowDetailsModal(true)
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {prospect.status === 'SUBMITTED' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProspect(prospect)
                                    setActionType('approve')
                                    setShowActionModal(true)
                                  }}
                                  className="p-1 hover:bg-green-100 rounded transition-colors text-green-600"
                                  title="Valider le dossier"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProspect(prospect)
                                    setActionType('reject')
                                    setShowActionModal(true)
                                  }}
                                  className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                                  title="Refuser le dossier"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {prospect.status === 'APPROVED' && (
                              <button
                                onClick={() => {
                                  setSelectedProspect(prospect)
                                  setActionType('schedule_inspection')
                                  setShowActionModal(true)
                                }}
                                className="p-1 hover:bg-teal-100 rounded transition-colors text-teal-600"
                                title="Programmer état des lieux"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            {prospect.status === 'INSPECTION_SCHEDULED' && (
                              <button
                                onClick={() => {
                                  setSelectedProspect(prospect)
                                  setActionType('ready_for_contract')
                                  setShowActionModal(true)
                                }}
                                className="p-1 hover:bg-emerald-100 rounded transition-colors text-emerald-600"
                                title="Marquer comme prêt pour contrat"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}

                            {prospect.status === 'READY_FOR_CONTRACT' && (
                              <button
                                onClick={() => {
                                  setSelectedProspect(prospect)
                                  setActionType('send_contract')
                                  setShowActionModal(true)
                                }}
                                className="p-1 hover:bg-purple-100 rounded transition-colors text-purple-600"
                                title="Envoyer le contrat"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            {(prospect.status === 'REJECTED' || prospect.status === 'DRAFT') && (
                              <button
                                onClick={() => handleDelete(prospect)}
                                className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                                title="Supprimer la demande"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      <AnimatePresence>
        {showDetailsModal && selectedProspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                    Dossier de {selectedProspect.firstName} {selectedProspect.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Soumis le {selectedProspect.submittedAt ? new Date(selectedProspect.submittedAt).toLocaleDateString('fr-FR') : 'Non soumis'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Statut actuel */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Statut actuel</h3>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${statusConfig[selectedProspect.status as keyof typeof statusConfig].color}`}>
                        {React.createElement(statusConfig[selectedProspect.status as keyof typeof statusConfig].icon, { className: 'w-4 h-4' })}
                        {statusConfig[selectedProspect.status as keyof typeof statusConfig].label}
                      </span>
                      {selectedProspect.reviewer && (
                        <p className="text-sm text-gray-600">
                          Examiné par {selectedProspect.reviewer.firstName} {selectedProspect.reviewer.lastName}
                        </p>
                      )}
                    </div>
                    {selectedProspect.reviewNotes && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Notes :</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedProspect.reviewNotes}</p>
                      </div>
                    )}
                    {selectedProspect.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-700">Raison du refus :</p>
                        <p className="text-sm text-red-600 mt-1">{selectedProspect.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Chambre demandée */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Chambre demandée</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Chambre</p>
                        <p className="text-sm font-medium">{selectedProspect.room.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Loyer mensuel</p>
                        <p className="text-sm font-medium">{selectedProspect.room.price}€</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de début souhaitée</p>
                        <p className="text-sm font-medium">{new Date(selectedProspect.desiredStartDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Durée</p>
                        <p className="text-sm font-medium">{selectedProspect.desiredDuration} mois</p>
                      </div>
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="text-sm font-medium">{selectedProspect.firstName} {selectedProspect.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de naissance</p>
                        <p className="text-sm font-medium">
                          {new Date(selectedProspect.birthDate).toLocaleDateString('fr-FR')} ({getAge(selectedProspect.birthDate)} ans)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium">{selectedProspect.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="text-sm font-medium">{selectedProspect.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nationalité</p>
                        <p className="text-sm font-medium">{selectedProspect.nationality}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Situation maritale</p>
                        <p className="text-sm font-medium">{selectedProspect.maritalStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Situation professionnelle */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Situation professionnelle</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className="text-sm font-medium">
                          {professionalStatusLabels[selectedProspect.professionalStatus as keyof typeof professionalStatusLabels]}
                        </p>
                      </div>
                      {selectedProspect.employerName && (
                        <div>
                          <p className="text-sm text-gray-500">Employeur</p>
                          <p className="text-sm font-medium">{selectedProspect.employerName}</p>
                        </div>
                      )}
                      {selectedProspect.schoolName && (
                        <div>
                          <p className="text-sm text-gray-500">Établissement</p>
                          <p className="text-sm font-medium">{selectedProspect.schoolName}</p>
                        </div>
                      )}
                      {selectedProspect.monthlyIncome && (
                        <div>
                          <p className="text-sm text-gray-500">Revenus mensuels</p>
                          <p className="text-sm font-medium">{selectedProspect.monthlyIncome}€</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Garant */}
                  {selectedProspect.hasGuarantor && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Garant</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="text-sm font-medium">{selectedProspect.guarantorType}</p>
                        </div>
                        {selectedProspect.guarantorFirstName && (
                          <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="text-sm font-medium">
                              {selectedProspect.guarantorFirstName} {selectedProspect.guarantorLastName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Documents fournis</h3>
                      {selectedProspect.documents && Object.keys(selectedProspect.documents.principal || selectedProspect.documents).some(key => selectedProspect.documents.principal ? selectedProspect.documents.principal[key] : selectedProspect.documents[key]) && (
                        <button
                          onClick={() => {
                            setDocumentsToView(selectedProspect.documents)
                            setShowDocumentViewer(true)
                          }}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Visualiser
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {/* Documents du locataire principal */}
                      {selectedProspect.documents && (
                        selectedProspect.documents.principal ?
                          Object.keys(selectedProspect.documents.principal).length > 0 :
                          Object.keys(selectedProspect.documents).length > 0
                      ) && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Documents du locataire principal</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(selectedProspect.documents.principal || selectedProspect.documents).map(([key, value]) =>
                              value && key !== 'roommates' && key !== 'guarantors' ? (
                                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs font-medium text-gray-700">
                                      {getDocumentLabel(key)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setDocumentsToView({principal: selectedProspect.documents.principal || selectedProspect.documents})
                                        setShowDocumentViewer(true)
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="Voir le document"
                                    >
                                      <Eye className="w-3 h-3 text-green-600" />
                                    </button>
                                    <button
                                      onClick={() => downloadDocument(
                                        value as string,
                                        `${selectedProspect.firstName}_${selectedProspect.lastName}`,
                                        getDocumentLabel(key)
                                      )}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="Télécharger le document"
                                    >
                                      <Download className="w-3 h-3 text-blue-600" />
                                    </button>
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  </div>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      )}

                      {/* Documents des colocataires */}
                      {selectedProspect.documents?.roommates && selectedProspect.documents.roommates.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Colocataires</h4>
                          {selectedProspect.documents.roommates.map((roommate: any, index: number) => (
                            Object.keys(roommate || {}).length > 0 && (
                              <div key={index} className="mb-2">
                                <p className="text-xs text-gray-600 mb-1">Colocataire {index + 1}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {Object.entries(roommate || {}).map(([key, value]) =>
                                    value ? (
                                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-3 h-3 text-gray-500" />
                                          <span className="text-xs font-medium text-gray-700">
                                            {getDocumentLabel(key)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              setDocumentsToView({roommates: [roommate]})
                                              setShowDocumentViewer(true)
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title="Voir le document"
                                          >
                                            <Eye className="w-3 h-3 text-green-600" />
                                          </button>
                                          <button
                                            onClick={() => downloadDocument(
                                              value as string,
                                              `Colocataire_${index + 1}`,
                                              getDocumentLabel(key)
                                            )}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title="Télécharger le document"
                                          >
                                            <Download className="w-3 h-3 text-blue-600" />
                                          </button>
                                          <CheckCircle className="w-3 h-3 text-green-500" />
                                        </div>
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Documents des garants */}
                      {selectedProspect.documents?.guarantors && selectedProspect.documents.guarantors.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Garants</h4>
                          {selectedProspect.documents.guarantors.map((guarantor: any, index: number) => (
                            Object.keys(guarantor || {}).length > 0 && (
                              <div key={index} className="mb-2">
                                <p className="text-xs text-gray-600 mb-1">Garant {index + 1}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {Object.entries(guarantor || {}).map(([key, value]) =>
                                    value ? (
                                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-3 h-3 text-gray-500" />
                                          <span className="text-xs font-medium text-gray-700">
                                            {getDocumentLabel(key)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              setDocumentsToView({guarantors: [guarantor]})
                                              setShowDocumentViewer(true)
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title="Voir le document"
                                          >
                                            <Eye className="w-3 h-3 text-green-600" />
                                          </button>
                                          <button
                                            onClick={() => downloadDocument(
                                              value as string,
                                              `Garant_${index + 1}`,
                                              getDocumentLabel(key)
                                            )}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title="Télécharger le document"
                                          >
                                            <Download className="w-3 h-3 text-blue-600" />
                                          </button>
                                          <CheckCircle className="w-3 h-3 text-green-500" />
                                        </div>
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Fermer
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {selectedProspect.status === 'SUBMITTED' && (
                    <>
                      <button
                        onClick={() => {
                          setActionType('incomplete')
                          setShowActionModal(true)
                        }}
                        className="px-4 py-2 text-sm sm:text-base text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        Marquer incomplet
                      </button>
                      <button
                        onClick={() => {
                          setActionType('reject')
                          setShowActionModal(true)
                        }}
                        className="px-4 py-2 text-sm sm:text-base text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() => {
                          setActionType('approve')
                          setShowActionModal(true)
                        }}
                        className="px-4 py-2 text-sm sm:text-base text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Action */}
      <AnimatePresence>
        {showActionModal && selectedProspect && actionType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowActionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' && 'Approuver le dossier'}
                {actionType === 'reject' && 'Refuser le dossier'}
                {actionType === 'incomplete' && 'Marquer comme incomplet'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const notes = formData.get('notes') as string
                const reason = formData.get('reason') as string
                
                let newStatus = 'IN_REVIEW'
                if (actionType === 'approve') newStatus = 'APPROVED'
                if (actionType === 'reject') newStatus = 'REJECTED'
                if (actionType === 'incomplete') newStatus = 'INCOMPLETE'
                
                handleStatusUpdate(selectedProspect.id, newStatus, notes, reason)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes internes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Notes pour l'équipe..."
                    />
                  </div>
                  
                  {actionType === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raison du refus *
                      </label>
                      <textarea
                        name="reason"
                        rows={3}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Cette raison sera communiquée au candidat..."
                      />
                    </div>
                  )}
                  
                  {actionType === 'approve' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        Un email sera envoyé au candidat avec le contrat de location.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700'
                        : actionType === 'reject'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Viewer */}
      {selectedProspect && (
        <DocumentViewer
          documents={documentsToView}
          isOpen={showDocumentViewer}
          onClose={() => setShowDocumentViewer(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setProspectToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Supprimer la demande"
        description="Êtes-vous sûr de vouloir supprimer cette demande de réservation ?"
        itemName={prospectToDelete ? `${prospectToDelete.firstName} ${prospectToDelete.lastName}` : ''}
        isLoading={isDeleting}
      />
    </div>
  )
}