'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, Check, X, Upload, FileSignature,
  Stamp, Settings, Eye, Download, Star
} from 'lucide-react'
import { toast } from 'sonner'
import { SignaturePad } from '@/components/signature/SignaturePad'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'

interface AdminSignature {
  id: string
  name: string
  description?: string
  signatureData: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function AdminSignatureManager() {
  const [signatures, setSignatures] = useState<AdminSignature[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [signatureToDelete, setSignatureToDelete] = useState<AdminSignature | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingSignature, setEditingSignature] = useState<AdminSignature | null>(null)
  const [newSignature, setNewSignature] = useState({
    name: '',
    description: '',
    signatureData: '',
    isDefault: false
  })

  useEffect(() => {
    fetchSignatures()
  }, [])

  const fetchSignatures = async () => {
    try {
      const response = await fetch('/api/admin-signatures')
      const data = await response.json()

      if (data.success) {
        setSignatures(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des signatures')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSignature = async () => {
    if (!newSignature.name || !newSignature.signatureData) {
      toast.error('Nom et signature requis')
      return
    }

    try {
      const response = await fetch('/api/admin-signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSignature)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Signature créée avec succès')
        setSignatures([data.data, ...signatures])
        setShowCreateModal(false)
        setNewSignature({
          name: '',
          description: '',
          signatureData: '',
          isDefault: false
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création')
    }
  }

  const handleDeleteSignature = (signature: AdminSignature) => {
    setSignatureToDelete(signature)
    setShowDeleteModal(true)
  }

  const confirmDeleteSignature = async () => {
    if (!signatureToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin-signatures?id=${signatureToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast.success('Signature supprimée avec succès')
        setSignatures(signatures.filter(s => s.id !== signatureToDelete.id))
        setShowDeleteModal(false)
        setSignatureToDelete(null)
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch('/api/admin-signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'setDefault'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Signature par défaut mise à jour')
        fetchSignatures()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setNewSignature(prev => ({
        ...prev,
        signatureData: result
      }))
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSignature className="w-6 h-6" />
            Signatures & Tampons Admin
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez vos signatures et tampons pour la signature automatique des contrats
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle signature
        </button>
      </div>

      {/* Liste des signatures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signatures.map((signature) => (
          <motion.div
            key={signature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            {/* Header de la carte */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{signature.name}</h3>
                  {signature.isDefault && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                {signature.description && (
                  <p className="text-sm text-gray-600 mt-1">{signature.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Créée le {new Date(signature.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!signature.isDefault && (
                  <button
                    onClick={() => handleSetDefault(signature.id)}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                    title="Définir par défaut"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteSignature(signature)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aperçu de la signature */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <img
                src={signature.signatureData}
                alt={signature.name}
                className="max-w-full h-20 object-contain mx-auto"
              />
            </div>

            {/* Informations */}
            <div className="text-xs text-gray-500">
              <p>Créée par: {signature.createdBy ? `${signature.createdBy.firstName} ${signature.createdBy.lastName}` : 'Utilisateur inconnu'}</p>
            </div>
          </motion.div>
        ))}

        {/* Carte d'ajout si aucune signature */}
        {signatures.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune signature
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre première signature ou tampon pour automatiser la signature des contrats
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Créer une signature
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de création */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Nouvelle signature
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informations */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la signature *
                      </label>
                      <input
                        type="text"
                        value={newSignature.name}
                        onChange={(e) => setNewSignature(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="Ex: Signature Directeur"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (optionnel)
                      </label>
                      <input
                        type="text"
                        value={newSignature.description}
                        onChange={(e) => setNewSignature(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Ex: Signature officielle pour les contrats"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newSignature.isDefault}
                        onChange={(e) => setNewSignature(prev => ({
                          ...prev,
                          isDefault: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">
                        Utiliser comme signature par défaut
                      </span>
                    </label>
                  </div>

                  {/* Création de la signature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Créer la signature *
                    </label>

                    <div className="space-y-4">
                      {/* Signature pad */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Option 1: Dessiner la signature</p>
                        <div className="border border-gray-300 rounded-lg p-4">
                          {newSignature.signatureData ? (
                            <div className="space-y-3">
                              <img
                                src={newSignature.signatureData}
                                alt="Signature preview"
                                className="w-full h-32 object-contain border border-gray-200 rounded bg-white"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowSignaturePad(true)}
                                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                >
                                  Redessiner
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewSignature(prev => ({ ...prev, signatureData: '' }))}
                                  className="text-sm text-red-600 hover:text-red-700"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowSignaturePad(true)}
                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <div className="text-center">
                                <FileSignature className="w-6 h-6 mx-auto mb-2" />
                                <span>Cliquer pour dessiner la signature</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upload d'image */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Option 2: Importer une image</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImage}
                            className="hidden"
                            id="signature-upload"
                          />
                          <label
                            htmlFor="signature-upload"
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            Choisir une image
                          </label>
                          <span className="text-xs text-gray-500">
                            PNG, JPG (max 2MB)
                          </span>
                        </div>
                      </div>

                      {/* Aperçu */}
                      {newSignature.signatureData && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                          <img
                            src={newSignature.signatureData}
                            alt="Aperçu signature"
                            className="max-w-full h-20 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateSignature}
                      disabled={!newSignature.name || !newSignature.signatureData}
                      className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Créer la signature
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Pad Modal */}
      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSign={(signatureDataUrl) => {
          setNewSignature(prev => ({
            ...prev,
            signatureData: signatureDataUrl
          }))
          setShowSignaturePad(false)
        }}
        signerName="Administrateur"
        documentTitle="Signature administrateur"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSignatureToDelete(null)
        }}
        onConfirm={confirmDeleteSignature}
        title="Supprimer la signature"
        description="Êtes-vous sûr de vouloir supprimer cette signature ?"
        itemName={signatureToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  )
}