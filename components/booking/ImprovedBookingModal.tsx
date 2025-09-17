'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronRight, ChevronLeft, Calendar, User, Users, Home, Briefcase,
  FileText, Upload, Check, AlertCircle, Loader2, Clock, Shield,
  MessageSquare, Info, Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomName: string
  roomPrice: number
}

interface Roommate {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  profession: string
  professionalStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'BUSINESS_OWNER' | 'STUDENT' | 'ALTERNANT' | 'UNEMPLOYED' | 'OTHER'
  currentAddress: string
  currentCity: string
  currentZipCode: string
  // Documents spécifiques au colocataire
  documents: {
    identity?: File
    proofOfAddress?: File[]
    employmentContract?: File
    payslips?: File[]
    studentCard?: File
    alternanceContract?: File
    taxNotice?: File
  }
}

interface Guarantor {
  type: 'INDIVIDUAL' | 'VISALE' | 'COMPANY'
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  address?: string
  relationship?: string
  monthlyIncome?: number
  employerName?: string
  profession?: string
  // Assignation : 'ALL' pour tous, sinon index du colocataire (0 = demandeur principal)
  assignedTo: 'ALL' | number[]
  documents: {
    identity?: File
    proofOfIncome?: File[]
    taxNotice?: File
    visaleAttestation?: File
  }
}

interface FormData {
  // Durée
  desiredStartDate: string
  desiredDuration: number
  hasLivedInColiving: boolean

  // Informations personnelles
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  nationality: string
  maritalStatus: string

  // Colocataires (support multiple)
  hasRoommate: boolean
  roommates: Roommate[]

  // Situation logement
  currentHousingSituation: 'TENANT' | 'OWNER' | 'HOSTED'
  currentAddress: string
  currentCity: string
  currentZipCode: string

  // Si mineur
  isMinor: boolean
  legalGuardian1FirstName?: string
  legalGuardian1LastName?: string
  legalGuardian1Phone?: string
  legalGuardian1Email?: string
  legalGuardian1Address?: string

  legalGuardian2FirstName?: string
  legalGuardian2LastName?: string
  legalGuardian2Phone?: string
  legalGuardian2Email?: string
  legalGuardian2Address?: string

  // Situation professionnelle
  professionalStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'BUSINESS_OWNER' | 'STUDENT' | 'ALTERNANT' | 'UNEMPLOYED' | 'OTHER'
  employerName?: string
  employerAddress?: string
  position?: string
  monthlyIncome?: number
  contractType?: string
  contractStartDate?: string

  // Pour étudiants
  schoolName?: string
  studyLevel?: string
  studyField?: string

  // Garants (support multiple avec assignation)
  hasGuarantor: boolean
  guarantors: Guarantor[]

  // Commentaires
  additionalInfo?: string

  // Documents
  documents: {
    identity?: File
    identityGuardian1?: File
    identityGuardian2?: File
    proofOfAddress?: File[]
    proofOfAddressGuardian?: File[] // Pour mineurs
    employmentContract?: File
    payslips?: File[]
    payslipsGuardian?: File[] // Pour mineurs
    studentCard?: File
    alternanceContract?: File
    taxNotice?: File
    taxNoticeGuardian?: File // Pour mineurs
    guarantorIdentity?: File
    guarantorProofOfIncome?: File[]
    guarantorTaxNotice?: File
    visaleAttestation?: File // Pour Visale
  }
}

const steps = [
  { id: 'duration', title: 'Durée', icon: Calendar },
  { id: 'personal', title: 'Identité', icon: User },
  { id: 'roommate', title: 'Colocataire', icon: Users },
  { id: 'housing', title: 'Logement', icon: Home },
  { id: 'professional', title: 'Situation', icon: Briefcase },
  { id: 'guarantor', title: 'Garant', icon: Shield },
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'comments', title: 'Infos', icon: MessageSquare },
  { id: 'summary', title: 'Récap', icon: Check }
]

export default function ImprovedBookingModal({ isOpen, onClose, roomId, roomName, roomPrice }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fonction helper pour créer un colocataire vide
  const createEmptyRoommate = (): Roommate => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    profession: '',
    professionalStatus: 'EMPLOYEE',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    documents: {}
  })

  // Fonction helper pour créer un garant vide
  const createEmptyGuarantor = (): Guarantor => ({
    type: 'INDIVIDUAL',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    relationship: '',
    monthlyIncome: undefined,
    employerName: '',
    profession: '',
    assignedTo: 'ALL',
    documents: {}
  })

  const [formData, setFormData] = useState<FormData>({
    desiredStartDate: '',
    desiredDuration: 6,
    hasLivedInColiving: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    nationality: 'Française',
    maritalStatus: 'Célibataire',
    hasRoommate: false,
    roommates: [],
    currentHousingSituation: 'TENANT',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    isMinor: false,
    legalGuardian1FirstName: '',
    legalGuardian1LastName: '',
    legalGuardian1Phone: '',
    legalGuardian1Email: '',
    legalGuardian1Address: '',
    legalGuardian2FirstName: '',
    legalGuardian2LastName: '',
    legalGuardian2Phone: '',
    legalGuardian2Email: '',
    legalGuardian2Address: '',
    professionalStatus: 'EMPLOYEE',
    employerName: '',
    employerAddress: '',
    position: '',
    monthlyIncome: undefined,
    contractType: '',
    contractStartDate: '',
    schoolName: '',
    studyLevel: '',
    studyField: '',
    hasGuarantor: false,
    guarantors: [],
    additionalInfo: '',
    documents: {}
  })

  // Vérifier si l'utilisateur est mineur
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const isMinor = age < 18 || (age === 18 && monthDiff < 0)
      setFormData(prev => ({ ...prev, isMinor }))
    }
  }, [formData.birthDate])

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const validateCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'duration':
        if (!formData.desiredStartDate || formData.desiredDuration < 1) {
          toast.error('Veuillez remplir tous les champs obligatoires')
          return false
        }
        break
      case 'personal':
        if (!formData.firstName || !formData.lastName || !formData.email ||
            !formData.phone || !formData.birthDate || !formData.birthPlace) {
          toast.error('Veuillez remplir tous les champs obligatoires')
          return false
        }
        if (formData.isMinor && (!formData.legalGuardian1FirstName || !formData.legalGuardian1LastName)) {
          toast.error('Les informations du responsable légal sont requises pour les mineurs')
          return false
        }
        break
      case 'roommate':
        if (formData.hasRoommate) {
          if (formData.roommates.length === 0) {
            toast.error('Veuillez ajouter au moins un colocataire')
            return false
          }
          for (let i = 0; i < formData.roommates.length; i++) {
            const roommate = formData.roommates[i]
            if (!roommate.firstName || !roommate.lastName || !roommate.email ||
                !roommate.phone || !roommate.birthDate || !roommate.birthPlace ||
                !roommate.currentAddress || !roommate.currentCity || !roommate.currentZipCode) {
              toast.error(`Veuillez remplir tous les champs obligatoires du colocataire ${i + 1}`)
              return false
            }
          }
        }
        break
      case 'housing':
        if (!formData.currentAddress || !formData.currentCity || !formData.currentZipCode) {
          toast.error('Veuillez remplir tous les champs obligatoires')
          return false
        }
        break
      case 'professional':
        if (formData.professionalStatus === 'EMPLOYEE' && !formData.employerName) {
          toast.error('Veuillez indiquer votre employeur')
          return false
        }
        if ((formData.professionalStatus === 'STUDENT' || formData.professionalStatus === 'ALTERNANT') && !formData.schoolName) {
          toast.error('Veuillez indiquer votre établissement')
          return false
        }
        break
      case 'guarantor':
        if (formData.hasGuarantor) {
          if (formData.guarantors.length === 0) {
            toast.error('Veuillez ajouter au moins un garant')
            return false
          }
          for (let i = 0; i < formData.guarantors.length; i++) {
            const guarantor = formData.guarantors[i]
            if (guarantor.type === 'INDIVIDUAL') {
              if (!guarantor.firstName || !guarantor.lastName || !guarantor.relationship) {
                toast.error(`Veuillez remplir les informations obligatoires du garant ${i + 1}`)
                return false
              }
            }
          }
        }
        break
      case 'documents':
        // Validation des documents obligatoires
        const requiredDocs = ['identity']

        // Documents selon le statut professionnel
        if (formData.professionalStatus === 'EMPLOYEE') {
          requiredDocs.push('employmentContract', 'payslips')
        } else if (formData.professionalStatus === 'STUDENT') {
          requiredDocs.push('studentCard')
        } else if (formData.professionalStatus === 'ALTERNANT') {
          requiredDocs.push('alternanceContract')
        }

        // Documents pour mineurs
        if (formData.isMinor) {
          requiredDocs.push('identityGuardian1', 'proofOfAddressGuardian', 'taxNoticeGuardian')
        } else {
          requiredDocs.push('proofOfAddress', 'taxNotice')
        }

        // Documents garant
        if (formData.hasGuarantor) {
          for (const guarantor of formData.guarantors) {
            if (guarantor.type === 'INDIVIDUAL') {
              if (!guarantor.documents.identity) {
                toast.error('Pièce d\'identité du garant requise')
                return false
              }
            } else if (guarantor.type === 'VISALE') {
              if (!guarantor.documents.visaleAttestation) {
                toast.error('Attestation Visale requise')
                return false
              }
            }
          }
        }

        // Vérifier documents principaux
        for (const docKey of requiredDocs) {
          if (!formData.documents[docKey as keyof typeof formData.documents]) {
            const docNames: { [key: string]: string } = {
              identity: 'Pièce d\'identité',
              employmentContract: 'Contrat de travail',
              payslips: 'Bulletins de salaire',
              studentCard: 'Carte étudiante',
              alternanceContract: 'Contrat d\'alternance',
              proofOfAddress: 'Justificatifs de domicile',
              taxNotice: 'Avis d\'imposition',
              identityGuardian1: 'Pièce d\'identité du responsable légal',
              proofOfAddressGuardian: 'Justificatifs de domicile du parent',
              taxNoticeGuardian: 'Avis d\'imposition du parent'
            }
            toast.error(`Document obligatoire manquant : ${docNames[docKey] || docKey}`)
            return false
          }
        }

        // Vérifier documents des colocataires
        for (let i = 0; i < formData.roommates.length; i++) {
          const roommate = formData.roommates[i]
          if (!roommate.documents.identity) {
            toast.error(`Pièce d'identité requise pour le colocataire ${i + 1}`)
            return false
          }

          // Documents selon statut professionnel du colocataire
          if (roommate.professionalStatus === 'EMPLOYEE' && !roommate.documents.employmentContract) {
            toast.error(`Contrat de travail requis pour le colocataire ${i + 1}`)
            return false
          }
          if (roommate.professionalStatus === 'STUDENT' && !roommate.documents.studentCard) {
            toast.error(`Carte étudiante requise pour le colocataire ${i + 1}`)
            return false
          }
        }
        break
    }
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Upload des documents d'abord
      const uploadedDocs: any = {}

      // Documents principaux
      for (const [key, value] of Object.entries(formData.documents)) {
        if (value) {
          if (Array.isArray(value)) {
            uploadedDocs[key] = []
            for (const file of value) {
              const formData = new FormData()
              formData.append('file', file)
              formData.append('type', 'documents')

              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })

              if (response.ok) {
                const data = await response.json()
                uploadedDocs[key].push(data.data.url)
              }
            }
          } else {
            const formDataUpload = new FormData()
            formDataUpload.append('file', value)
            formDataUpload.append('type', 'documents')

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formDataUpload
            })

            if (response.ok) {
              const data = await response.json()
              uploadedDocs[key] = data.data.url
            }
          }
        }
      }

      // Upload documents des colocataires
      const uploadedRoommates = await Promise.all(
        formData.roommates.map(async (roommate) => {
          const roommateDocuments: any = {}

          for (const [key, value] of Object.entries(roommate.documents)) {
            if (value) {
              if (Array.isArray(value)) {
                roommateDocuments[key] = []
                for (const file of value) {
                  const formDataUpload = new FormData()
                  formDataUpload.append('file', file)
                  formDataUpload.append('type', 'documents')

                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload
                  })

                  if (response.ok) {
                    const data = await response.json()
                    roommateDocuments[key].push(data.data.url)
                  }
                }
              } else {
                const formDataUpload = new FormData()
                formDataUpload.append('file', value)
                formDataUpload.append('type', 'documents')

                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formDataUpload
                })

                if (response.ok) {
                  const data = await response.json()
                  roommateDocuments[key] = data.data.url
                }
              }
            }
          }

          return {
            ...roommate,
            documents: roommateDocuments
          }
        })
      )

      // Upload documents des garants
      const uploadedGuarantors = await Promise.all(
        formData.guarantors.map(async (guarantor) => {
          const guarantorDocuments: any = {}

          for (const [key, value] of Object.entries(guarantor.documents)) {
            if (value) {
              if (Array.isArray(value)) {
                guarantorDocuments[key] = []
                for (const file of value) {
                  const formDataUpload = new FormData()
                  formDataUpload.append('file', file)
                  formDataUpload.append('type', 'documents')

                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload
                  })

                  if (response.ok) {
                    const data = await response.json()
                    guarantorDocuments[key].push(data.data.url)
                  }
                }
              } else {
                const formDataUpload = new FormData()
                formDataUpload.append('file', value)
                formDataUpload.append('type', 'documents')

                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formDataUpload
                })

                if (response.ok) {
                  const data = await response.json()
                  guarantorDocuments[key] = data.data.url
                }
              }
            }
          }

          return {
            ...guarantor,
            documents: guarantorDocuments
          }
        })
      )

      // Préparer les données pour l'API
      const submissionData = {
        ...formData,
        roomId,
        documents: uploadedDocs,
        roommates: uploadedRoommates.map(rm => ({
          firstName: rm.firstName,
          lastName: rm.lastName,
          email: rm.email,
          phone: rm.phone,
          birthDate: rm.birthDate,
          birthPlace: rm.birthPlace,
          professionalStatus: rm.professionalStatus,
          profession: rm.profession,
          currentAddress: rm.currentAddress,
          currentCity: rm.currentCity,
          currentZipCode: rm.currentZipCode,
          documents: rm.documents
        })),
        guarantors: uploadedGuarantors,
        status: 'SUBMITTED'
      }

      // Soumettre le dossier
      const response = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission')
      }

      toast.success('Votre dossier a été soumis avec succès !')
      onClose()

    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue lors de la soumission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'duration':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début souhaitée *
              </label>
              <input
                type="date"
                value={formData.desiredStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredStartDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée souhaitée (en mois) *
              </label>
              <select
                value={formData.desiredDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {[3, 6, 9, 12, 18, 24].map(months => (
                  <option key={months} value={months}>{months} mois</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avez-vous déjà vécu en coliving ?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.hasLivedInColiving}
                    onChange={() => setFormData(prev => ({ ...prev, hasLivedInColiving: true }))}
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.hasLivedInColiving}
                    onChange={() => setFormData(prev => ({ ...prev, hasLivedInColiving: false }))}
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-900">
                    {roomName}
                  </p>
                  <p className="text-xs text-blue-700">
                    {roomPrice}€/mois charges comprises
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Lieu de naissance *
                </label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {formData.isMinor && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Responsable légal 1 *
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.legalGuardian1FirstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, legalGuardian1FirstName: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.legalGuardian1LastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, legalGuardian1LastName: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.legalGuardian1Email}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalGuardian1Email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.legalGuardian1Phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalGuardian1Phone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'roommate':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avez-vous des colocataires ?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasRoommate: true,
                    roommates: prev.roommates.length === 0 ? [createEmptyRoommate()] : prev.roommates
                  }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    formData.hasRoommate
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasRoommate: false,
                    roommates: []
                  }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !formData.hasRoommate
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>

            {formData.hasRoommate && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-700">
                        Chaque colocataire devra fournir ses propres documents selon sa situation professionnelle
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.roommates.map((roommate, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Colocataire {index + 1}
                        </h4>
                        {formData.roommates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              roommates: prev.roommates.filter((_, i) => i !== index)
                            }))}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Informations de base */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Prénom *
                            </label>
                            <input
                              type="text"
                              value={roommate.firstName}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, firstName: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nom *
                            </label>
                            <input
                              type="text"
                              value={roommate.lastName}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, lastName: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={roommate.email}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, email: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Téléphone *
                            </label>
                            <input
                              type="tel"
                              value={roommate.phone}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, phone: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="06 12 34 56 78"
                            />
                          </div>
                        </div>

                        {/* Naissance et lieu */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Date de naissance *
                            </label>
                            <input
                              type="date"
                              value={roommate.birthDate}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, birthDate: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Lieu de naissance *
                            </label>
                            <input
                              type="text"
                              value={roommate.birthPlace}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, birthPlace: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Paris, France"
                            />
                          </div>
                        </div>

                        {/* Adresse actuelle */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Adresse actuelle *
                          </label>
                          <input
                            type="text"
                            value={roommate.currentAddress}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              roommates: prev.roommates.map((r, i) =>
                                i === index ? { ...r, currentAddress: e.target.value } : r
                              )
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="12 rue de la Paix"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Ville *
                            </label>
                            <input
                              type="text"
                              value={roommate.currentCity}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, currentCity: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Paris"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Code postal *
                            </label>
                            <input
                              type="text"
                              value={roommate.currentZipCode}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, currentZipCode: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="75001"
                              maxLength={5}
                            />
                          </div>
                        </div>

                        {/* Situation professionnelle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Situation professionnelle *
                            </label>
                            <select
                              value={roommate.professionalStatus}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, professionalStatus: e.target.value as any } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                              <option value="EMPLOYEE">Salarié(e)</option>
                              <option value="SELF_EMPLOYED">Auto-entrepreneur</option>
                              <option value="STUDENT">Étudiant(e)</option>
                              <option value="ALTERNANT">Alternant(e)</option>
                              <option value="UNEMPLOYED">Sans emploi</option>
                              <option value="OTHER">Autre</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Profession/École
                            </label>
                            <input
                              type="text"
                              value={roommate.profession}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                roommates: prev.roommates.map((r, i) =>
                                  i === index ? { ...r, profession: e.target.value } : r
                                )
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Entreprise ou École"
                            />
                          </div>
                        </div>

                        {/* Documents du colocataire */}
                        <div className="border-t pt-3 mt-3">
                          <h5 className="text-xs font-semibold text-gray-800 mb-2">
                            Documents requis pour ce colocataire
                          </h5>
                          <div className="space-y-2">
                            {/* CNI */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Pièce d'identité *
                              </label>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setFormData(prev => ({
                                      ...prev,
                                      roommates: prev.roommates.map((r, i) =>
                                        i === index ? {
                                          ...r,
                                          documents: { ...r.documents, identity: file }
                                        } : r
                                      )
                                    }))
                                  }
                                }}
                                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                              />
                              {roommate.documents.identity && (
                                <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {roommate.documents.identity.name}</p>
                              )}
                            </div>

                            {/* Documents selon statut professionnel */}
                            {roommate.professionalStatus === 'EMPLOYEE' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Contrat de travail *
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setFormData(prev => ({
                                        ...prev,
                                        roommates: prev.roommates.map((r, i) =>
                                          i === index ? {
                                            ...r,
                                            documents: { ...r.documents, employmentContract: file }
                                          } : r
                                        )
                                      }))
                                    }
                                  }}
                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                                />
                                {roommate.documents.employmentContract && (
                                  <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {roommate.documents.employmentContract.name}</p>
                                )}
                              </div>
                            )}

                            {roommate.professionalStatus === 'STUDENT' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Carte étudiante *
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setFormData(prev => ({
                                        ...prev,
                                        roommates: prev.roommates.map((r, i) =>
                                          i === index ? {
                                            ...r,
                                            documents: { ...r.documents, studentCard: file }
                                          } : r
                                        )
                                      }))
                                    }
                                  }}
                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                                />
                                {roommate.documents.studentCard && (
                                  <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {roommate.documents.studentCard.name}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Bouton ajouter colocataire */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      roommates: [...prev.roommates, createEmptyRoommate()]
                    }))}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Ajouter un colocataire
                  </button>
                </div>
              </>
            )}
          </div>
        )

      case 'housing':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situation actuelle de logement *
              </label>
              <select
                value={formData.currentHousingSituation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentHousingSituation: e.target.value as any }))}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="TENANT">Locataire</option>
                <option value="OWNER">Propriétaire</option>
                <option value="HOSTED">Hébergé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse actuelle *
              </label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="12 rue de la Paix"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCity: e.target.value }))}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={formData.currentZipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentZipCode: e.target.value }))}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="75001"
                  maxLength={5}
                />
              </div>
            </div>
          </div>
        )

      case 'professional':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situation professionnelle *
              </label>
              <select
                value={formData.professionalStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalStatus: e.target.value as any }))}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="EMPLOYEE">Salarié(e)</option>
                <option value="SELF_EMPLOYED">Auto-entrepreneur</option>
                <option value="STUDENT">Étudiant(e)</option>
                <option value="ALTERNANT">Alternant(e)</option>
                <option value="UNEMPLOYED">Sans emploi</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            {(formData.professionalStatus === 'EMPLOYEE' || formData.professionalStatus === 'SELF_EMPLOYED') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'employeur *
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, employerName: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poste occupé
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Développeur, Commercial, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenus mensuels nets
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyIncome || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de contrat
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="INTERIM">Intérim</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
              </>
            )}

            {(formData.professionalStatus === 'STUDENT' || formData.professionalStatus === 'ALTERNANT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Établissement scolaire *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Université, École, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau d'études
                  </label>
                  <input
                    type="text"
                    value={formData.studyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, studyLevel: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Licence, Master, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domaine d'études
                  </label>
                  <input
                    type="text"
                    value={formData.studyField}
                    onChange={(e) => setFormData(prev => ({ ...prev, studyField: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Informatique, Commerce, etc."
                  />
                </div>
              </>
            )}
          </div>
        )

      case 'guarantor':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avez-vous un ou plusieurs garants ?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasGuarantor: true,
                    guarantors: prev.guarantors.length === 0 ? [createEmptyGuarantor()] : prev.guarantors
                  }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    formData.hasGuarantor
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasGuarantor: false,
                    guarantors: []
                  }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !formData.hasGuarantor
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>

            {formData.hasGuarantor && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-700">
                        Vous pouvez avoir un garant pour chaque locataire ou un garant commun pour tous
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.guarantors.map((guarantor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Garant {index + 1}
                        </h4>
                        {formData.guarantors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              guarantors: prev.guarantors.filter((_, i) => i !== index)
                            }))}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Type de garant */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Type de garant *
                          </label>
                          <select
                            value={guarantor.type}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              guarantors: prev.guarantors.map((g, i) =>
                                i === index ? { ...g, type: e.target.value as any } : g
                              )
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            <option value="INDIVIDUAL">Personne physique</option>
                            <option value="VISALE">Visale</option>
                            <option value="COMPANY">Entreprise</option>
                          </select>
                        </div>

                        {/* Assignation */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ce garant est pour *
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={guarantor.assignedTo === 'ALL'}
                                onChange={() => setFormData(prev => ({
                                  ...prev,
                                  guarantors: prev.guarantors.map((g, i) =>
                                    i === index ? { ...g, assignedTo: 'ALL' } : g
                                  )
                                }))}
                                className="mr-2"
                              />
                              <span className="text-sm">Tous les locataires</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={Array.isArray(guarantor.assignedTo)}
                                onChange={() => setFormData(prev => ({
                                  ...prev,
                                  guarantors: prev.guarantors.map((g, i) =>
                                    i === index ? { ...g, assignedTo: [0] } : g
                                  )
                                }))}
                                className="mr-2"
                              />
                              <span className="text-sm">Locataires spécifiques</span>
                            </label>
                          </div>

                          {Array.isArray(guarantor.assignedTo) && (
                            <div className="mt-2 space-y-1">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={guarantor.assignedTo.includes(0)}
                                  onChange={(e) => {
                                    const newAssignedTo = e.target.checked
                                      ? [...(guarantor.assignedTo as number[]), 0]
                                      : (guarantor.assignedTo as number[]).filter(id => id !== 0)
                                    setFormData(prev => ({
                                      ...prev,
                                      guarantors: prev.guarantors.map((g, i) =>
                                        i === index ? { ...g, assignedTo: newAssignedTo } : g
                                      )
                                    }))
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-xs">Demandeur principal ({formData.firstName} {formData.lastName})</span>
                              </label>
                              {formData.roommates.map((roommate, rmIndex) => (
                                <label key={rmIndex} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={guarantor.assignedTo.includes(rmIndex + 1)}
                                    onChange={(e) => {
                                      const newAssignedTo = e.target.checked
                                        ? [...(guarantor.assignedTo as number[]), rmIndex + 1]
                                        : (guarantor.assignedTo as number[]).filter(id => id !== rmIndex + 1)
                                      setFormData(prev => ({
                                        ...prev,
                                        guarantors: prev.guarantors.map((g, i) =>
                                          i === index ? { ...g, assignedTo: newAssignedTo } : g
                                        )
                                      }))
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-xs">Colocataire {rmIndex + 1} ({roommate.firstName} {roommate.lastName})</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {guarantor.type === 'INDIVIDUAL' && (
                          <>
                            {/* Informations personnelles du garant */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Prénom *
                                </label>
                                <input
                                  type="text"
                                  value={guarantor.firstName}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    guarantors: prev.guarantors.map((g, i) =>
                                      i === index ? { ...g, firstName: e.target.value } : g
                                    )
                                  }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nom *
                                </label>
                                <input
                                  type="text"
                                  value={guarantor.lastName}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    guarantors: prev.guarantors.map((g, i) =>
                                      i === index ? { ...g, lastName: e.target.value } : g
                                    )
                                  }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Lien avec les locataires *
                              </label>
                              <select
                                value={guarantor.relationship}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  guarantors: prev.guarantors.map((g, i) =>
                                    i === index ? { ...g, relationship: e.target.value } : g
                                  )
                                }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              >
                                <option value="">Sélectionner</option>
                                <option value="Parent">Parent</option>
                                <option value="Famille">Famille</option>
                                <option value="Ami">Ami(e)</option>
                                <option value="Autre">Autre</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={guarantor.email}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    guarantors: prev.guarantors.map((g, i) =>
                                      i === index ? { ...g, email: e.target.value } : g
                                    )
                                  }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Téléphone
                                </label>
                                <input
                                  type="tel"
                                  value={guarantor.phone}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    guarantors: prev.guarantors.map((g, i) =>
                                      i === index ? { ...g, phone: e.target.value } : g
                                    )
                                  }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                            </div>

                            {/* Documents du garant */}
                            <div className="border-t pt-3 mt-3">
                              <h5 className="text-xs font-semibold text-gray-800 mb-2">
                                Documents du garant
                              </h5>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Pièce d'identité *
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setFormData(prev => ({
                                          ...prev,
                                          guarantors: prev.guarantors.map((g, i) =>
                                            i === index ? {
                                              ...g,
                                              documents: { ...g.documents, identity: file }
                                            } : g
                                          )
                                        }))
                                      }
                                    }}
                                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                                  />
                                  {guarantor.documents.identity && (
                                    <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {guarantor.documents.identity.name}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {guarantor.type === 'VISALE' && (
                          <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-blue-900">
                                    Garantie Visale
                                  </p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    Veuillez fournir votre attestation Visale
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Attestation Visale *
                              </label>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setFormData(prev => ({
                                      ...prev,
                                      guarantors: prev.guarantors.map((g, i) =>
                                        i === index ? {
                                          ...g,
                                          documents: { ...g.documents, visaleAttestation: file }
                                        } : g
                                      )
                                    }))
                                  }
                                }}
                                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                              />
                              {guarantor.documents.visaleAttestation && (
                                <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {guarantor.documents.visaleAttestation.name}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Bouton ajouter garant */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      guarantors: [...prev.guarantors, createEmptyGuarantor()]
                    }))}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Ajouter un garant
                  </button>
                </div>
              </>
            )}
          </div>
        )

      case 'documents':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-yellow-900">
                    Documents requis
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Format PDF ou image, max 5MB par fichier. Tous les documents sont obligatoires.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Documents de base */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pièce d'identité *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        documents: { ...prev.documents, identity: file }
                      }))
                    }
                  }}
                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                />
                {formData.documents.identity && (
                  <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.identity.name}</p>
                )}
              </div>

              {/* Justificatifs de domicile */}
              {!formData.isMinor && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Justificatifs de domicile (3 derniers) *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setFormData(prev => ({
                        ...prev,
                        documents: { ...prev.documents, proofOfAddress: files }
                      }))
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                  />
                  {formData.documents.proofOfAddress && formData.documents.proofOfAddress.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.documents.proofOfAddress.length} fichier(s) sélectionné(s)</p>
                  )}
                </div>
              )}

              {/* Avis d'imposition */}
              {!formData.isMinor && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Avis d'imposition *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, taxNotice: file }
                        }))
                      }
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                  />
                  {formData.documents.taxNotice && (
                    <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.taxNotice.name}</p>
                  )}
                </div>
              )}

              {/* Documents pour mineurs */}
              {formData.isMinor && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      CNI du parent/tuteur 1 *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({
                            ...prev,
                            documents: { ...prev.documents, identityGuardian1: file }
                          }))
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                    />
                    {formData.documents.identityGuardian1 && (
                      <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.identityGuardian1.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Justificatifs domicile parent (3 derniers) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, proofOfAddressGuardian: files }
                        }))
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                    />
                    {formData.documents.proofOfAddressGuardian && formData.documents.proofOfAddressGuardian.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ {formData.documents.proofOfAddressGuardian.length} fichier(s) sélectionné(s)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Avis d'imposition parent *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({
                            ...prev,
                            documents: { ...prev.documents, taxNoticeGuardian: file }
                          }))
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                    />
                    {formData.documents.taxNoticeGuardian && (
                      <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.taxNoticeGuardian.name}</p>
                    )}
                  </div>
                </>
              )}

              {/* Documents professionnels */}
              {formData.professionalStatus === 'EMPLOYEE' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contrat de travail *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({
                            ...prev,
                            documents: { ...prev.documents, employmentContract: file }
                          }))
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                    />
                    {formData.documents.employmentContract && (
                      <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.employmentContract.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bulletins de salaire (3 derniers) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, payslips: files }
                        }))
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                    />
                    {formData.documents.payslips && formData.documents.payslips.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ {formData.documents.payslips.length} fichier(s) sélectionné(s)</p>
                    )}
                  </div>
                </>
              )}

              {formData.professionalStatus === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Carte étudiante ou certificat de scolarité *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, studentCard: file }
                        }))
                      }
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                  />
                  {formData.documents.studentCard && (
                    <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.studentCard.name}</p>
                  )}
                </div>
              )}

              {formData.professionalStatus === 'ALTERNANT' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contrat d'alternance CERFA *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, alternanceContract: file }
                        }))
                      }
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                  />
                  {formData.documents.alternanceContract && (
                    <p className="text-xs text-green-600 mt-1">✓ Fichier sélectionné: {formData.documents.alternanceContract.name}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'comments':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informations complémentaires
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Avez-vous des informations supplémentaires à nous communiquer ? (Allergies, animaux, besoins spécifiques, etc.)
              </p>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Vos commentaires ici..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-700">
                    Ces informations nous aident à mieux comprendre vos besoins et à faciliter votre intégration dans la colocation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'summary':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-900">
                    Récapitulatif de votre demande
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Vérifiez les informations avant de soumettre
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de la chambre */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Chambre sélectionnée</h3>
              <p className="text-sm text-gray-700">{roomName}</p>
              <p className="text-sm text-gray-600">{roomPrice}€/mois</p>
            </div>

            {/* Durée */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Durée du séjour</h3>
              <p className="text-sm text-gray-700">
                Début: {formData.desiredStartDate ? new Date(formData.desiredStartDate).toLocaleDateString('fr-FR') : 'Non défini'}
              </p>
              <p className="text-sm text-gray-600">
                Durée: {formData.desiredDuration} mois
              </p>
            </div>

            {/* Informations personnelles */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Vos informations</h3>
              <p className="text-sm text-gray-700">
                {formData.firstName} {formData.lastName}
              </p>
              <p className="text-sm text-gray-600">{formData.email}</p>
              <p className="text-sm text-gray-600">{formData.phone}</p>
              {formData.isMinor && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Mineur - Responsables légaux requis
                </p>
              )}
            </div>

            {/* Colocataires */}
            {formData.hasRoommate && formData.roommates.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Colocataires</h3>
                {formData.roommates.map((roommate, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <p className="text-sm text-gray-700">
                      {index + 1}. {roommate.firstName} {roommate.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{roommate.email} • {roommate.phone}</p>
                    <p className="text-xs text-gray-600">
                      {roommate.professionalStatus === 'EMPLOYEE' && 'Salarié(e)'}
                      {roommate.professionalStatus === 'STUDENT' && 'Étudiant(e)'}
                      {roommate.professionalStatus === 'ALTERNANT' && 'Alternant(e)'}
                      {roommate.professionalStatus === 'UNEMPLOYED' && 'Sans emploi'}
                      {roommate.professionalStatus === 'OTHER' && 'Autre'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Situation professionnelle */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Situation</h3>
              <p className="text-sm text-gray-700">
                {formData.professionalStatus === 'EMPLOYEE' && 'Salarié(e)'}
                {formData.professionalStatus === 'SELF_EMPLOYED' && 'Auto-entrepreneur'}
                {formData.professionalStatus === 'STUDENT' && 'Étudiant(e)'}
                {formData.professionalStatus === 'ALTERNANT' && 'Alternant(e)'}
                {formData.professionalStatus === 'UNEMPLOYED' && 'Sans emploi'}
                {formData.professionalStatus === 'OTHER' && 'Autre'}
              </p>
              {formData.employerName && (
                <p className="text-sm text-gray-600">{formData.employerName}</p>
              )}
              {formData.schoolName && (
                <p className="text-sm text-gray-600">{formData.schoolName}</p>
              )}
            </div>

            {/* Garants */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Garants</h3>
              {!formData.hasGuarantor ? (
                <p className="text-sm text-gray-700">Pas de garant</p>
              ) : (
                <div className="space-y-2">
                  {formData.guarantors.map((guarantor, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3">
                      <p className="text-sm text-gray-700">
                        {guarantor.type === 'INDIVIDUAL' && `${guarantor.firstName} ${guarantor.lastName}`}
                        {guarantor.type === 'VISALE' && 'Garantie Visale'}
                        {guarantor.type === 'COMPANY' && 'Entreprise'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {guarantor.assignedTo === 'ALL'
                          ? 'Pour tous les locataires'
                          : `Pour locataires spécifiques (${(guarantor.assignedTo as number[]).length} personne(s))`
                        }
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Documents</h3>

              {/* Documents principaux */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Demandeur principal:</p>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(formData.documents).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-600">
                        {key === 'identity' && 'Pièce d\'identité'}
                        {key === 'proofOfAddress' && 'Justificatifs de domicile'}
                        {key === 'taxNotice' && 'Avis d\'imposition'}
                        {key === 'employmentContract' && 'Contrat de travail'}
                        {key === 'payslips' && 'Bulletins de salaire'}
                        {key === 'studentCard' && 'Carte étudiante'}
                        {key === 'alternanceContract' && 'Contrat d\'alternance'}
                        {key === 'identityGuardian1' && 'CNI parent/tuteur'}
                        {key === 'proofOfAddressGuardian' && 'Justificatifs parent'}
                        {key === 'taxNoticeGuardian' && 'Avis imposition parent'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents colocataires */}
              {formData.roommates.map((roommate, index) => (
                <div key={index} className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Colocataire {index + 1} ({roommate.firstName}):</p>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(roommate.documents).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-600">
                          {key === 'identity' && 'Pièce d\'identité'}
                          {key === 'employmentContract' && 'Contrat de travail'}
                          {key === 'studentCard' && 'Carte étudiante'}
                          {key === 'alternanceContract' && 'Contrat d\'alternance'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Documents garants */}
              {formData.guarantors.map((guarantor, index) => (
                <div key={index} className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Garant {index + 1} ({guarantor.type === 'INDIVIDUAL' ? guarantor.firstName : guarantor.type}):
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(guarantor.documents).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-600">
                          {key === 'identity' && 'Pièce d\'identité'}
                          {key === 'visaleAttestation' && 'Attestation Visale'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-yellow-900">
                    Engagement
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    En soumettant ce dossier, vous certifiez que toutes les informations fournies sont exactes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header - Mobile optimized */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Demande de réservation
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Étape {currentStep + 1} sur {steps.length}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps - Horizontal scroll on mobile */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                      index === currentStep
                        ? 'bg-black text-white'
                        : index < currentStep
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {renderStepContent()}
            </div>

            {/* Footer - Mobile optimized */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Soumettre</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}