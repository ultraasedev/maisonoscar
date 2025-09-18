'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronRight, ChevronLeft, Calendar, User, Users, Home, Briefcase,
  FileText, Upload, Check, AlertCircle, Loader2, Shield,
  Info, Building, UserPlus, FileCheck, AlertTriangle, Clock,
  MapPin, Phone, Mail, FileUp, Eye, Download
} from 'lucide-react'
import { toast } from 'sonner'
import GoogleAddressAutocomplete from '@/components/ui/GoogleAddressAutocomplete'

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
  nationality: string

  // Adresse
  sameAddressAsPrincipal?: boolean
  currentAddress?: string
  currentZipCode?: string
  currentCity?: string

  // Situation professionnelle
  professionalStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'STUDENT' | 'ALTERNANT' | 'UNEMPLOYED' | 'OTHER'
  employerName?: string
  monthlyIncomeNet?: number
  schoolName?: string
}

interface Guarantor {
  type: 'INDIVIDUAL' | 'VISALE' | 'COMPANY' | 'NONE'
  assignedTo: 'PRINCIPAL' | 'ROOMMATE_1' | 'ROOMMATE_2' | 'ALL'
  
  // Si personne physique
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  relationship?: string
  monthlyIncomeNet?: number
  employerName?: string
  
  // Si Visale
  visaleNumber?: string
  
  // Si entreprise
  companyName?: string
  siret?: string
  contactPhone?: string
  contactEmail?: string
}

interface FormData {
  // Étape 1: Projet
  desiredStartDate: string
  desiredDuration: string
  hasLivedInColiving: boolean
  
  // Étape 2: Identité locataire principal
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  nationality: string
  maritalStatus: string
  
  // Étape 3: Colocataires
  roommates: Roommate[]
  
  // Étape 4: Situation professionnelle (locataire principal)
  professionalStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'STUDENT' | 'ALTERNANT' | 'UNEMPLOYED' | 'OTHER'
  employerName?: string
  employerAddress?: string
  position?: string
  monthlyIncomeNet?: number
  contractType?: string
  contractStartDate?: string
  schoolName?: string
  studyLevel?: string
  studyField?: string
  
  // Situation logement actuel
  currentHousingSituation: 'TENANT' | 'OWNER' | 'HOSTED'
  currentAddress: string
  currentCity: string
  currentZipCode: string
  
  // Étape 5: Garants
  guarantors: Guarantor[]
  
  // Étape 6: Documents
  documents: {
    // Locataire principal
    principal: {
      idCard?: string
      currentAddressProof?: string
      taxNoticeN1?: string
      taxNoticeN2?: string
      payslips?: string[]
      workContract?: string
      schoolCertificate?: string
      apprenticeshipContract?: string
      accountingReport?: string
    }
    // Documents colocataires
    roommates: Array<{
      idCard?: string
      currentAddressProof?: string
      taxNoticeN1?: string
      taxNoticeN2?: string
      payslips?: string[]
      workContract?: string
      schoolCertificate?: string
      apprenticeshipContract?: string
      accountingReport?: string
    }>
    // Documents garants
    guarantors: Array<{
      idCard?: string
      payslips?: string[]
      taxNoticeN1?: string
      taxNoticeN2?: string
      addressProof?: string
      visaleAttestation?: string
      kbis?: string
      accountingReport?: string
      commitmentLetter?: string
    }>
  }
  
  acceptTerms: boolean
}

const STEPS = [
  { id: 1, title: 'Votre projet', icon: Calendar, mobileTitle: 'Projet' },
  { id: 2, title: 'Vos informations', icon: User, mobileTitle: 'Identité' },
  { id: 3, title: 'Colocataires', icon: Users, mobileTitle: 'Colocs' },
  { id: 4, title: 'Situation pro', icon: Briefcase, mobileTitle: 'Emploi' },
  { id: 5, title: 'Garants', icon: Shield, mobileTitle: 'Garants' },
  { id: 6, title: 'Justificatifs', icon: FileText, mobileTitle: 'Docs' },
  { id: 7, title: 'Récapitulatif', icon: FileCheck, mobileTitle: 'Recap' }
]

// Fonction pour uploader un fichier avec métadonnées pour le nommage
const uploadFile = async (
  file: File,
  metadata?: {
    personName?: string
    documentType?: string
    roomName?: string
  }
): Promise<string | null> => {
  try {
    const formData = new FormData()

    // Créer un nom personnalisé si des métadonnées sont fournies
    if (metadata) {
      const { personName, documentType, roomName } = metadata
      const fileExtension = file.name.split('.').pop()
      const cleanPersonName = personName?.toLowerCase().replace(/\s+/g, '-') || 'locataire'
      const cleanDocType = documentType?.toLowerCase().replace(/\s+/g, '-') || 'document'
      const cleanRoomName = roomName?.toLowerCase().replace(/\s+/g, '-') || 'chambre'

      const customName = `${cleanDocType}-${cleanPersonName}-${cleanRoomName}.${fileExtension}`

      // Créer un nouveau fichier avec le nom personnalisé
      const renamedFile = new File([file], customName, { type: file.type })
      formData.append('file', renamedFile)
    } else {
      formData.append('file', file)
    }

    formData.append('type', 'documents')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    if (result.success) {
      return result.data.url
    } else {
      toast.error(`Erreur upload ${file.name}: ${result.error}`)
      return null
    }
  } catch (error) {
    console.error('Erreur upload:', error)
    toast.error(`Erreur lors de l'upload de ${file.name}`)
    return null
  }
}

// Composant pour un bouton d'upload stylé avec état de chargement intégré
const FileUploadButton = ({
  label,
  onUpload,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  hasFile = false,
  fileUrl = '',
  uploadingStates,
  setUploadingStates,
  onPreview,
  metadata,
  uploadKey
}: {
  label: string
  onUpload: (urls: string[]) => void
  accept?: string
  multiple?: boolean
  hasFile?: boolean
  fileUrl?: string
  uploadingStates: Record<string, boolean>
  setUploadingStates: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onPreview?: (url: string) => void
  metadata?: {
    personName?: string
    documentType?: string
    roomName?: string
  }
  uploadKey?: string
}) => {
  const defaultUploadKey = `upload-${label.replace(/\s+/g, '-')}`
  const finalUploadKey = uploadKey || defaultUploadKey
  const isUploading = uploadingStates[finalUploadKey] || false

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Marquer comme en cours d'upload
    setUploadingStates(prev => ({ ...prev, [finalUploadKey]: true }))

    try {
      const uploadPromises = files.map(file => uploadFile(file, metadata))
      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter(url => url !== null) as string[]

      if (validUrls.length > 0) {
        onUpload(validUrls)
      }
    } finally {
      // Arrêter l'état de chargement
      setUploadingStates(prev => ({ ...prev, [finalUploadKey]: false }))
    }

    // Reset input value to allow re-uploading same file
    e.target.value = ''
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="sr-only"
        id={finalUploadKey}
        disabled={isUploading}
      />
      <label
        htmlFor={finalUploadKey}
        className={`
          flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed
          cursor-pointer transition-all
          ${isUploading
            ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-not-allowed opacity-75'
            : hasFile
            ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
            : 'border-gray-300 bg-white text-gray-600 hover:border-black hover:bg-gray-50'
          }
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Upload...</span>
          </>
        ) : hasFile ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Fichier ajouté</span>
            </div>
            {fileUrl && onPreview && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onPreview(fileUrl)
                  }}
                  className="p-1 hover:bg-green-200 rounded transition-colors"
                  title="Prévisualiser le document"
                  type="button"
                >
                  <Eye className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const link = document.createElement('a')
                    link.href = fileUrl
                    link.download = `${label}_${Date.now()}`
                    link.click()
                  }}
                  className="p-1 hover:bg-green-200 rounded transition-colors"
                  title="Télécharger le document"
                  type="button"
                >
                  <Download className="w-4 h-4 text-green-600" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <FileUp className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </>
        )}
      </label>
    </div>
  )
}

export default function CompleteBookingModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  roomPrice
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({})
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [formData, setFormData] = useState<FormData>({
    // Projet
    desiredStartDate: '',
    desiredDuration: '12',
    hasLivedInColiving: false,
    // Identité
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    nationality: 'Française',
    maritalStatus: 'Célibataire',
    // Colocataires
    roommates: [],
    // Situation pro
    professionalStatus: 'EMPLOYEE',
    employerName: '',
    employerAddress: '',
    position: '',
    monthlyIncomeNet: undefined,
    contractType: '',
    contractStartDate: '',
    schoolName: '',
    studyLevel: '',
    studyField: '',
    currentHousingSituation: 'TENANT',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    // Garants
    guarantors: [],
    // Documents
    documents: {
      principal: {
        idCard: '',
        currentAddressProof: '',
        taxNoticeN1: '',
        taxNoticeN2: '',
        payslips: [],
        workContract: '',
        schoolCertificate: '',
        apprenticeshipContract: '',
        accountingReport: ''
      },
      roommates: [],
      guarantors: []
    },
    acceptTerms: false
  })

  const openPreview = (url: string) => {
    setPreviewUrl(url)
    setShowDocumentPreview(true)
  }

  // Validation en temps réel
  const validateField = (fieldName: string, value: string, index?: number) => {
    const key = index !== undefined ? `${fieldName}-${index}` : fieldName
    let error = ''

    switch (fieldName) {
      case 'email':
        if (value && !validateEmail(value)) {
          error = 'Format d\'email invalide'
        }
        break
      case 'phone':
        if (value && !validatePhone(value)) {
          error = 'Numéro de téléphone invalide (7-15 chiffres)'
        }
        break
      case 'currentZipCode':
        if (value && !validatePostalCode(value)) {
          error = 'Code postal invalide (2-15 caractères)'
        }
        break
      case 'desiredStartDate':
        if (value && !validateMoveInDate(value)) {
          error = 'Date doit être entre aujourd\'hui et dans 5 ans'
        }
        break
      // Validation pour les colocataires
      case 'roommate-email':
        if (value && !validateEmail(value)) {
          error = 'Format d\'email invalide'
        }
        break
      case 'roommate-phone':
        if (value && !validatePhone(value)) {
          error = 'Numéro invalide'
        }
        break
      case 'roommate-zipcode':
        if (value && !validatePostalCode(value)) {
          error = 'Code postal invalide'
        }
        break
    }

    setFieldErrors(prev => ({
      ...prev,
      [key]: error
    }))

    return error === ''
  }

  // Fonctions de validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    // Validation internationale plus permissive
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
    // Accepte + suivi de 7 à 15 chiffres, ou numéros locaux de 7 à 15 chiffres
    const internationalRegex = /^(\+?\d{7,15})$/
    return internationalRegex.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 15
  }

  const validatePostalCode = (postal: string): boolean => {
    // Validation très permissive pour codes postaux internationaux
    // Accepte: lettres, chiffres, espaces, tirets (2-15 caractères)
    const cleaned = postal.trim()
    if (cleaned.length < 2 || cleaned.length > 15) return false
    const internationalPostal = /^[A-Za-z0-9\s\-]{2,15}$/
    return internationalPostal.test(cleaned)
  }

  const validateMoveInDate = (dateStr: string): boolean => {
    const date = new Date(dateStr)
    const now = new Date()
    const fiveYearsFromNow = new Date()
    fiveYearsFromNow.setFullYear(now.getFullYear() + 5)

    // Date doit être >= aujourd'hui et <= dans 5 ans
    return date >= now && date <= fiveYearsFromNow
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Projet
        if (!formData.desiredStartDate) {
          toast.error('La date d\'emménagement souhaitée est obligatoire')
          return false
        }
        if (!validateMoveInDate(formData.desiredStartDate)) {
          toast.error('La date d\'emménagement doit être entre aujourd\'hui et dans 5 ans maximum')
          return false
        }
        if (!formData.desiredDuration) {
          toast.error('La durée de location souhaitée est obligatoire')
          return false
        }
        return true

      case 2: // Identité
        if (!formData.firstName) {
          toast.error('Le prénom est obligatoire')
          return false
        }
        if (!formData.lastName) {
          toast.error('Le nom est obligatoire')
          return false
        }
        if (!formData.email) {
          toast.error('L\'email est obligatoire')
          return false
        }
        if (!validateEmail(formData.email)) {
          toast.error('Format d\'email invalide')
          return false
        }
        if (!formData.phone) {
          toast.error('Le téléphone est obligatoire')
          return false
        }
        if (!validatePhone(formData.phone)) {
          toast.error('Format de téléphone invalide (ex: 0123456789 ou +33123456789)')
          return false
        }
        if (!formData.birthDate) {
          toast.error('La date de naissance est obligatoire')
          return false
        }
        if (!formData.birthPlace) {
          toast.error('Le lieu de naissance est obligatoire')
          return false
        }
        if (!formData.nationality) {
          toast.error('La nationalité est obligatoire')
          return false
        }
        if (!formData.currentAddress) {
          toast.error('L\'adresse actuelle est obligatoire')
          return false
        }
        if (!formData.currentZipCode) {
          toast.error('Le code postal est obligatoire')
          return false
        }
        if (!validatePostalCode(formData.currentZipCode)) {
          toast.error('Format de code postal invalide')
          return false
        }
        if (!formData.currentCity) {
          toast.error('La ville est obligatoire')
          return false
        }
        return true

      case 3: // Colocataires - Si ajoutés, tous les champs deviennent obligatoires
        return formData.roommates.every((roommate, index) => {
          if (!roommate.firstName) {
            toast.error(`Le prénom du colocataire ${index + 1} est obligatoire`)
            return false
          }
          if (!roommate.lastName) {
            toast.error(`Le nom du colocataire ${index + 1} est obligatoire`)
            return false
          }
          if (!roommate.email) {
            toast.error(`L'email du colocataire ${index + 1} est obligatoire`)
            return false
          }
          if (!validateEmail(roommate.email)) {
            toast.error(`Format d'email invalide pour le colocataire ${index + 1}`)
            return false
          }
          if (!roommate.phone) {
            toast.error(`Le téléphone du colocataire ${index + 1} est obligatoire`)
            return false
          }
          if (!validatePhone(roommate.phone)) {
            toast.error(`Format de téléphone invalide pour le colocataire ${index + 1}`)
            return false
          }
          if (!roommate.birthDate) {
            toast.error(`La date de naissance du colocataire ${index + 1} est obligatoire`)
            return false
          }
          if (!roommate.birthPlace) {
            toast.error(`Le lieu de naissance du colocataire ${index + 1} est obligatoire`)
            return false
          }

          // Validation de l'adresse si pas la même que le principal
          if (!roommate.sameAddressAsPrincipal) {
            if (!roommate.currentAddress) {
              toast.error(`L'adresse du colocataire ${index + 1} est obligatoire`)
              return false
            }
            if (!roommate.currentZipCode) {
              toast.error(`Le code postal du colocataire ${index + 1} est obligatoire`)
              return false
            }
            if (!validatePostalCode(roommate.currentZipCode)) {
              toast.error(`Format de code postal invalide pour le colocataire ${index + 1}`)
              return false
            }
            if (!roommate.currentCity) {
              toast.error(`La ville du colocataire ${index + 1} est obligatoire`)
              return false
            }
          }

          return true
        })

      case 4: // Situation pro
        if (formData.professionalStatus === 'EMPLOYEE' || formData.professionalStatus === 'ALTERNANT') {
          if (!formData.employerName) {
            toast.error('Le nom de l\'employeur est obligatoire')
            return false
          }
          if (!formData.monthlyIncomeNet) {
            toast.error('Les revenus mensuels nets sont obligatoires')
            return false
          }
        }
        if (formData.professionalStatus === 'STUDENT' || formData.professionalStatus === 'ALTERNANT') {
          if (!formData.schoolName) {
            toast.error('Le nom de l\'établissement scolaire est obligatoire')
            return false
          }
        }

        // Validation des colocataires selon leur statut professionnel
        return formData.roommates.every((roommate, index) => {
          if (roommate.professionalStatus === 'EMPLOYEE' || roommate.professionalStatus === 'ALTERNANT') {
            if (!roommate.employerName) {
              toast.error(`Le nom de l'employeur du colocataire ${index + 1} est obligatoire`)
              return false
            }
            if (!roommate.monthlyIncomeNet) {
              toast.error(`Les revenus du colocataire ${index + 1} sont obligatoires`)
              return false
            }
          }
          if (roommate.professionalStatus === 'STUDENT' || roommate.professionalStatus === 'ALTERNANT') {
            if (!roommate.schoolName) {
              toast.error(`L'établissement scolaire du colocataire ${index + 1} est obligatoire`)
              return false
            }
          }
          return true
        })

      case 5: // Garants - Si ajoutés, doivent être complets
        return formData.guarantors.every((g, index) => {
          if (g.type === 'INDIVIDUAL') {
            if (!g.firstName) {
              toast.error(`Le prénom du garant ${index + 1} est obligatoire`)
              return false
            }
            if (!g.lastName) {
              toast.error(`Le nom du garant ${index + 1} est obligatoire`)
              return false
            }
            if (!g.relationship) {
              toast.error(`Le lien de parenté du garant ${index + 1} est obligatoire`)
              return false
            }
            if (g.email && !validateEmail(g.email)) {
              toast.error(`Format d'email invalide pour le garant ${index + 1}`)
              return false
            }
            if (g.phone && !validatePhone(g.phone)) {
              toast.error(`Format de téléphone invalide pour le garant ${index + 1}`)
              return false
            }
          }
          if (g.type === 'COMPANY') {
            if (!g.companyName) {
              toast.error(`Le nom de l'entreprise garante ${index + 1} est obligatoire`)
              return false
            }
            if (!g.siret) {
              toast.error(`Le SIRET de l'entreprise garante ${index + 1} est obligatoire`)
              return false
            }
            if (!g.contactPhone) {
              toast.error(`Le téléphone de contact de l'entreprise garante ${index + 1} est obligatoire`)
              return false
            }
            if (!validatePhone(g.contactPhone)) {
              toast.error(`Format de téléphone invalide pour l'entreprise garante ${index + 1}`)
              return false
            }
            if (!g.contactEmail) {
              toast.error(`L'email de contact de l'entreprise garante ${index + 1} est obligatoire`)
              return false
            }
            if (!validateEmail(g.contactEmail)) {
              toast.error(`Format d'email invalide pour l'entreprise garante ${index + 1}`)
              return false
            }
          }
          if (g.type === 'VISALE') {
            return true // Visale est toujours valide
          }
          return true
        })

      case 6: // Documents - validation des documents requis
        return true // Documents optionnels pour l'instant

      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      if (!validateStep(currentStep)) {
        // Définir les messages d'erreur spécifiques par étape
        const errorMessages = {
          1: 'Veuillez remplir tous les champs obligatoires du projet',
          2: 'Veuillez remplir toutes vos informations personnelles',
          4: 'Veuillez compléter votre situation professionnelle',
          5: 'Veuillez compléter les informations de tous les garants',
          6: 'Veuillez fournir tous les documents obligatoires pour continuer'
        }
        toast.error(errorMessages[currentStep as keyof typeof errorMessages] || 'Veuillez compléter cette étape')
        return
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addRoommate = () => {
    if (formData.roommates.length < 2) {
      setFormData({
        ...formData,
        roommates: [...formData.roommates, {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          birthDate: '',
          birthPlace: '',
          nationality: 'Française',
          sameAddressAsPrincipal: false,
          currentAddress: '',
          currentZipCode: '',
          currentCity: '',
          professionalStatus: 'STUDENT'
        }],
        documents: {
          ...formData.documents,
          roommates: [...formData.documents.roommates, {}]
        }
      })
    }
  }

  const removeRoommate = (index: number) => {
    setFormData({
      ...formData,
      roommates: formData.roommates.filter((_, i) => i !== index),
      documents: {
        ...formData.documents,
        roommates: formData.documents.roommates.filter((_, i) => i !== index)
      }
    })
  }

  const addGuarantor = () => {
    if (formData.guarantors.length < 2) {
      setFormData({
        ...formData,
        guarantors: [...formData.guarantors, {
          type: 'INDIVIDUAL',
          assignedTo: 'PRINCIPAL'
        }],
        documents: {
          ...formData.documents,
          guarantors: [...formData.documents.guarantors, {}]
        }
      })
    }
  }

  const removeGuarantor = (index: number) => {
    setFormData({
      ...formData,
      guarantors: formData.guarantors.filter((_, i) => i !== index),
      documents: {
        ...formData.documents,
        guarantors: formData.documents.guarantors.filter((_, i) => i !== index)
      }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Préparer les données pour l'API
      const requestData = {
        roomId,
        desiredStartDate: formData.desiredStartDate,
        desiredDuration: parseInt(formData.desiredDuration),
        hasLivedInColiving: formData.hasLivedInColiving,

        // Informations personnelles
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace,
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus,

        // Situation actuelle
        currentHousingSituation: formData.currentHousingSituation,
        currentAddress: formData.currentAddress,
        currentCity: formData.currentCity,
        currentZipCode: formData.currentZipCode,

        // Situation professionnelle
        professionalStatus: formData.professionalStatus,
        employerName: formData.employerName,
        employerAddress: formData.employerAddress,
        position: formData.position,
        monthlyIncome: formData.monthlyIncomeNet,
        contractType: formData.contractType,
        contractStartDate: formData.contractStartDate,
        schoolName: formData.schoolName,
        studyLevel: formData.studyLevel,
        studyField: formData.studyField,

        // Champs requis par l'API
        isMinor: false, // On assume que ce n'est pas un mineur pour l'instant
        hasGuarantor: formData.guarantors.length > 0,
        guarantorType: formData.guarantors.length > 0 ? formData.guarantors[0].type : 'NONE',
        status: 'SUBMITTED',

        // Colocataires - mapper vers le format attendu par l'API
        roommates: formData.roommates.map(rm => ({
          firstName: rm.firstName,
          lastName: rm.lastName,
          email: rm.email,
          phone: rm.phone,
          birthDate: rm.birthDate,
          birthPlace: rm.birthPlace || '',
          profession: rm.employerName || rm.schoolName || 'Non renseigné',
          professionalStatus: rm.professionalStatus,
          currentAddress: formData.currentAddress, // On utilise l'adresse du locataire principal
          currentCity: formData.currentCity,
          currentZipCode: formData.currentZipCode
        })),

        // Garants - mapper vers le format attendu par l'API (uniquement les garants complets)
        guarantors: formData.guarantors.filter(g => {
          // Filtrer seulement les garants qui ont des données valides
          if (g.type === 'INDIVIDUAL') {
            return g.firstName && g.lastName && g.relationship
          }
          if (g.type === 'COMPANY') {
            return g.companyName && g.siret
          }
          if (g.type === 'VISALE') {
            return true // Visale peut être sans numéro de dossier
          }
          return false
        }).map(g => ({
          firstName: g.firstName || '',
          lastName: g.lastName || '',
          email: g.contactEmail || g.email || 'no-email@example.com',
          phone: g.contactPhone || g.phone || '',
          address: g.address || '',
          relationship: g.relationship || '',
          monthlyIncome: g.monthlyIncomeNet,
          profession: g.employerName || '',
          employerName: g.employerName || '',
          assignedTo: g.assignedTo
        })),

        // Documents
        documents: formData.documents
      }

      console.log('Données envoyées à l\'API:', JSON.stringify(requestData, null, 2))

      const response = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        toast.success('Votre demande de réservation a été envoyée avec succès !')
        onClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Une erreur est survenue lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      toast.error('Une erreur est survenue lors de l\'envoi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch(currentStep) {
      // ÉTAPE 1: PROJET
      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Votre projet de location</h3>
              <p className="text-gray-600 text-sm">Dites-nous quand vous souhaitez emménager</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'entrée souhaitée *
              </label>
              <input
                type="date"
                value={formData.desiredStartDate}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({...formData, desiredStartDate: value})
                  validateField('desiredStartDate', value)
                }}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent ${
                  fieldErrors.desiredStartDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.desiredStartDate && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.desiredStartDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de location souhaitée *
              </label>
              <select
                value={formData.desiredDuration}
                onChange={(e) => setFormData({...formData, desiredDuration: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="3">3 mois</option>
                <option value="6">6 mois</option>
                <option value="9">9 mois</option>
                <option value="12">12 mois (1 an)</option>
                <option value="18">18 mois</option>
                <option value="24">24 mois (2 ans)</option>
                <option value="36">Plus de 2 ans</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Avez-vous déjà vécu en colocation/coliving ? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <input
                    type="radio"
                    name="hasLivedInColiving"
                    checked={formData.hasLivedInColiving === true}
                    onChange={() => setFormData({...formData, hasLivedInColiving: true})}
                    className="sr-only peer"
                  />
                  <div className="px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer text-center peer-checked:border-black peer-checked:bg-black peer-checked:text-white transition-all">
                    Oui
                  </div>
                </label>
                <label>
                  <input
                    type="radio"
                    name="hasLivedInColiving"
                    checked={formData.hasLivedInColiving === false}
                    onChange={() => setFormData({...formData, hasLivedInColiving: false})}
                    className="sr-only peer"
                  />
                  <div className="px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer text-center peer-checked:border-black peer-checked:bg-black peer-checked:text-white transition-all">
                    Non
                  </div>
                </label>
              </div>
            </div>
          </div>
        )
        
      // ÉTAPE 2: IDENTITÉ LOCATAIRE PRINCIPAL
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Vos informations personnelles</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({...formData, email: value})
                    validateField('email', value)
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black ${
                    fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({...formData, phone: value})
                    validateField('phone', value)
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black ${
                    fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="+33123456789 ou 0123456789"
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de naissance *
                </label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  placeholder="Ville, Pays"
                  required
                />
              </div>
            </div>

            {/* Situation logement actuel */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Logement actuel</h4>
              <div className="space-y-3">
                <select
                  value={formData.currentHousingSituation}
                  onChange={(e) => setFormData({...formData, currentHousingSituation: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                >
                  <option value="TENANT">Locataire</option>
                  <option value="OWNER">Propriétaire</option>
                  <option value="HOSTED">Hébergé</option>
                </select>
                
                <GoogleAddressAutocomplete
                  value={formData.currentAddress}
                  onChange={(value) => setFormData({...formData, currentAddress: value})}
                  onAddressSelect={(address) => {
                    setFormData({
                      ...formData,
                      currentAddress: address.fullAddress,
                      currentCity: address.city,
                      currentZipCode: address.postalCode
                    })
                  }}
                  placeholder="Tapez votre adresse actuelle..."
                />

                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    placeholder="Ville"
                    value={formData.currentCity}
                    onChange={(e) => setFormData({...formData, currentCity: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    value={formData.currentZipCode}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({...formData, currentZipCode: value})
                      validateField('currentZipCode', value)
                    }}
                    className={`px-4 py-3 border rounded-xl ${
                      fieldErrors.currentZipCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.currentZipCode && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.currentZipCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
        
      // ÉTAPE 3: COLOCATAIRES
      case 3:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Colocataires</h3>
              {formData.roommates.length < 2 && (
                <button
                  onClick={addRoommate}
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              )}
            </div>

            {formData.roommates.length === 0 ? (
              <div className="text-center py-8 bg-[#F5F3F0] rounded-xl">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun colocataire</p>
                <p className="text-sm text-gray-500 mt-1">Vous pouvez ajouter jusqu'à 2 colocataires</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.roommates.map((roommate, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Colocataire {index + 1}</h4>
                      <button
                        onClick={() => removeRoommate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={roommate.firstName}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].firstName = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Nom"
                        value={roommate.lastName}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].lastName = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                      />
                      
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={roommate.email}
                          onChange={(e) => {
                            const value = e.target.value
                            const updated = [...formData.roommates]
                            updated[index].email = value
                            setFormData({...formData, roommates: updated})
                            validateField('roommate-email', value, index)
                          }}
                          className={`px-4 py-2 border rounded-xl text-sm w-full ${
                            fieldErrors[`roommate-email-${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors[`roommate-email-${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{fieldErrors[`roommate-email-${index}`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <input
                          type="tel"
                          placeholder="Téléphone"
                          value={roommate.phone}
                          onChange={(e) => {
                            const value = e.target.value
                            const updated = [...formData.roommates]
                            updated[index].phone = value
                            setFormData({...formData, roommates: updated})
                            validateField('roommate-phone', value, index)
                          }}
                          className={`px-4 py-2 border rounded-xl text-sm w-full ${
                            fieldErrors[`roommate-phone-${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors[`roommate-phone-${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{fieldErrors[`roommate-phone-${index}`]}</p>
                        )}
                      </div>

                      <input
                        type="date"
                        placeholder="Date de naissance"
                        value={roommate.birthDate}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].birthDate = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                      />

                      <input
                        type="text"
                        placeholder="Lieu de naissance"
                        value={roommate.birthPlace}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].birthPlace = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                      />
                    </div>

                    {/* Adresse du colocataire */}
                    <div className="col-span-full border-t pt-3 mt-3">
                      <h5 className="font-medium text-gray-900 mb-3">Adresse actuelle</h5>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={roommate.sameAddressAsPrincipal || false}
                            onChange={(e) => {
                              const updated = [...formData.roommates]
                              if (e.target.checked) {
                                updated[index].sameAddressAsPrincipal = true
                                updated[index].currentAddress = formData.currentAddress
                                updated[index].currentZipCode = formData.currentZipCode
                                updated[index].currentCity = formData.currentCity
                              } else {
                                updated[index].sameAddressAsPrincipal = false
                                updated[index].currentAddress = ''
                                updated[index].currentZipCode = ''
                                updated[index].currentCity = ''
                              }
                              setFormData({...formData, roommates: updated})
                            }}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm text-gray-700">
                            Même adresse que le locataire principal
                          </span>
                        </label>

                        {!roommate.sameAddressAsPrincipal && (
                          <div key={`roommate-address-${index}`}>
                            <GoogleAddressAutocomplete
                              value={roommate.currentAddress || ''}
                              onChange={(value) => {
                                const updated = [...formData.roommates]
                                updated[index].currentAddress = value
                                setFormData({...formData, roommates: updated})
                              }}
                              onAddressSelect={(address) => {
                                const updated = [...formData.roommates]
                                updated[index].currentAddress = address.fullAddress
                                updated[index].currentCity = address.city
                                updated[index].currentZipCode = address.postalCode
                                setFormData({...formData, roommates: updated})
                              }}
                              placeholder="Adresse du colocataire..."
                              className="text-sm"
                            />

                            <div className="grid grid-cols-1 gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="Ville"
                                value={roommate.currentCity || ''}
                                onChange={(e) => {
                                  const updated = [...formData.roommates]
                                  updated[index].currentCity = e.target.value
                                  setFormData({...formData, roommates: updated})
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <div>
                                <input
                                  type="text"
                                  placeholder="Code postal"
                                  value={roommate.currentZipCode || ''}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    const updated = [...formData.roommates]
                                    updated[index].currentZipCode = value
                                    setFormData({...formData, roommates: updated})
                                    validateField('roommate-zipcode', value, index)
                                  }}
                                  className={`px-3 py-2 border rounded-lg text-sm w-full ${
                                    fieldErrors[`roommate-zipcode-${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                  }`}
                                />
                                {fieldErrors[`roommate-zipcode-${index}`] && (
                                  <p className="text-red-500 text-xs mt-1">{fieldErrors[`roommate-zipcode-${index}`]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
        
      // ÉTAPE 4: SITUATION PROFESSIONNELLE
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold">Situation professionnelle</h3>
            
            {/* Locataire principal */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3">Locataire principal</h4>
              
              <div className="space-y-3">
                <select
                  value={formData.professionalStatus}
                  onChange={(e) => setFormData({...formData, professionalStatus: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                >
                  <option value="EMPLOYEE">Salarié(e)</option>
                  <option value="SELF_EMPLOYED">Auto-entrepreneur</option>
                  <option value="STUDENT">Étudiant(e)</option>
                  <option value="ALTERNANT">Alternant(e)</option>
                  <option value="UNEMPLOYED">Sans emploi</option>
                  <option value="OTHER">Autre</option>
                </select>

                {(formData.professionalStatus === 'EMPLOYEE' || formData.professionalStatus === 'ALTERNANT') && (
                  <div key="principal-employment">
                    <input
                      type="text"
                      placeholder="Nom de l'employeur"
                      value={formData.employerName || ''}
                      onChange={(e) => setFormData({...formData, employerName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                    
                    <input
                      type="number"
                      placeholder="Revenus mensuels nets (€)"
                      value={formData.monthlyIncomeNet || ''}
                      onChange={(e) => setFormData({...formData, monthlyIncomeNet: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                  </div>
                )}

                {(formData.professionalStatus === 'STUDENT' || formData.professionalStatus === 'ALTERNANT') && (
                  <input
                    type="text"
                    placeholder="Établissement scolaire"
                    value={formData.schoolName || ''}
                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                )}
              </div>
            </div>

            {/* Colocataires */}
            {formData.roommates.map((roommate, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold mb-3">
                  Colocataire {index + 1}: {roommate.firstName || 'Sans nom'}
                </h4>
                
                <div className="space-y-3">
                  <select
                    value={roommate.professionalStatus}
                    onChange={(e) => {
                      const updated = [...formData.roommates]
                      updated[index].professionalStatus = e.target.value as any
                      setFormData({...formData, roommates: updated})
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="EMPLOYEE">Salarié(e)</option>
                    <option value="SELF_EMPLOYED">Auto-entrepreneur</option>
                    <option value="STUDENT">Étudiant(e)</option>
                    <option value="ALTERNANT">Alternant(e)</option>
                    <option value="UNEMPLOYED">Sans emploi</option>
                    <option value="OTHER">Autre</option>
                  </select>

                  {(roommate.professionalStatus === 'EMPLOYEE' || roommate.professionalStatus === 'ALTERNANT') && (
                    <div key={`roommate-employment-${index}`}>
                      <input
                        type="text"
                        placeholder="Nom de l'employeur"
                        value={roommate.employerName || ''}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].employerName = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      />
                      
                      <input
                        type="number"
                        placeholder="Revenus mensuels nets (€)"
                        value={roommate.monthlyIncomeNet || ''}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].monthlyIncomeNet = Number(e.target.value)
                          setFormData({...formData, roommates: updated})
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      />
                    </div>
                  )}

                  {(roommate.professionalStatus === 'STUDENT' || roommate.professionalStatus === 'ALTERNANT') && (
                    <input
                      type="text"
                      placeholder="Établissement scolaire"
                      value={roommate.schoolName || ''}
                      onChange={(e) => {
                        const updated = [...formData.roommates]
                        updated[index].schoolName = e.target.value
                        setFormData({...formData, roommates: updated})
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
        
      // ÉTAPE 5: GARANTS
      case 5:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Garants</h3>
              {formData.guarantors.length < 2 && (
                <button
                  onClick={addGuarantor}
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              )}
            </div>

            {formData.guarantors.length === 0 ? (
              <div className="text-center py-8 bg-[#F5F3F0] rounded-xl">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun garant ajouté</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.guarantors.map((guarantor, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Garant {index + 1}</h4>
                      <button
                        onClick={() => removeGuarantor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Type de garant */}
                      <select
                        value={guarantor.type}
                        onChange={(e) => {
                          const updated = [...formData.guarantors]
                          updated[index].type = e.target.value as any
                          setFormData({...formData, guarantors: updated})
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      >
                        <option value="INDIVIDUAL">Personne physique</option>
                        <option value="VISALE">Visale</option>
                        <option value="COMPANY">Entreprise</option>
                      </select>

                      {/* Pour qui ? */}
                      <select
                        value={guarantor.assignedTo}
                        onChange={(e) => {
                          const updated = [...formData.guarantors]
                          updated[index].assignedTo = e.target.value as any
                          setFormData({...formData, guarantors: updated})
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      >
                        <option value="PRINCIPAL">Locataire principal</option>
                        {formData.roommates.map((rm, idx) => (
                          <option key={idx} value={`ROOMMATE_${idx + 1}`}>
                            Colocataire {idx + 1}: {rm.firstName || 'Sans nom'}
                          </option>
                        ))}
                        <option value="ALL">Tous les locataires</option>
                      </select>

                      {/* Champs selon le type */}
                      {guarantor.type === 'INDIVIDUAL' && (
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Prénom"
                            value={guarantor.firstName || ''}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].firstName = e.target.value
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                          />
                          
                          <input
                            type="text"
                            placeholder="Nom"
                            value={guarantor.lastName || ''}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].lastName = e.target.value
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                          />
                          
                          <input
                            type="number"
                            placeholder="Revenus nets mensuels (€)"
                            value={guarantor.monthlyIncomeNet || ''}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].monthlyIncomeNet = Number(e.target.value)
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                          />

                          <input
                            type="text"
                            placeholder="Lien de parenté"
                            value={guarantor.relationship || ''}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].relationship = e.target.value
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                          />
                        </div>
                      )}

                      {guarantor.type === 'COMPANY' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Nom de l'entreprise"
                            value={guarantor.companyName || ''}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].companyName = e.target.value
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                          />
                          
                          <input
                            type="text"
                            placeholder="SIRET"
                            value={guarantor.siret || ''}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].siret = e.target.value
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                          />
                          
                          <div className="grid grid-cols-1 gap-3">
                            <input
                              type="tel"
                              placeholder="Téléphone de contact"
                              value={guarantor.contactPhone || ''}
                              onChange={(e) => {
                                const updated = [...formData.guarantors]
                                updated[index].contactPhone = e.target.value
                                setFormData({...formData, guarantors: updated})
                              }}
                              className="px-4 py-3 border border-gray-300 rounded-xl"
                            />

                            <input
                              type="email"
                              placeholder="Email de contact"
                              value={guarantor.contactEmail || ''}
                              onChange={(e) => {
                                const updated = [...formData.guarantors]
                                updated[index].contactEmail = e.target.value
                                setFormData({...formData, guarantors: updated})
                              }}
                              className="px-4 py-3 border border-gray-300 rounded-xl"
                            />
                          </div>
                        </div>
                      )}

                      {guarantor.type === 'VISALE' && (
                        <input
                          type="text"
                          placeholder="Numéro de dossier Visale"
                          value={guarantor.visaleNumber || ''}
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].visaleNumber = e.target.value
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
        
      // ÉTAPE 6: JUSTIFICATIFS
      case 6:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold">Justificatifs à fournir</h3>
            
            {/* Documents locataire principal */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Locataire principal
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FileUploadButton
                  label="Pièce d'identité"
                  onUpload={(urls) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, idCard: urls[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.idCard}
                  fileUrl={formData.documents.principal.idCard}
                  onPreview={openPreview}
                  uploadingStates={uploadingStates}
                  setUploadingStates={setUploadingStates}
                  uploadKey="principal-idcard"
                  metadata={{
                    personName: `${formData.firstName} ${formData.lastName}`,
                    documentType: "cni",
                    roomName: roomName
                  }}
                />
                
                <FileUploadButton
                  label="Justificatif domicile"
                  onUpload={(urls) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, currentAddressProof: urls[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.currentAddressProof}
                  fileUrl={formData.documents.principal.currentAddressProof}
                  onPreview={openPreview}
                  uploadingStates={uploadingStates}
                  setUploadingStates={setUploadingStates}
                  uploadKey="principal-address"
                  metadata={{
                    personName: `${formData.firstName} ${formData.lastName}`,
                    documentType: "justificatif-domicile",
                    roomName: roomName
                  }}
                />
                
                <FileUploadButton
                  label="Avis imposition N-1"
                  onUpload={(urls) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, taxNoticeN1: urls[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.taxNoticeN1}
                  fileUrl={formData.documents.principal.taxNoticeN1}
                  onPreview={openPreview}
                  uploadingStates={uploadingStates}
                  setUploadingStates={setUploadingStates}
                  uploadKey="principal-tax-n1"
                  metadata={{
                    personName: `${formData.firstName} ${formData.lastName}`,
                    documentType: "avis-imposition-n1",
                    roomName: roomName
                  }}
                />
                
                <FileUploadButton
                  label="Avis imposition N-2"
                  onUpload={(urls) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, taxNoticeN2: urls[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.taxNoticeN2}
                  fileUrl={formData.documents.principal.taxNoticeN2}
                  onPreview={openPreview}
                  uploadingStates={uploadingStates}
                  setUploadingStates={setUploadingStates}
                  uploadKey="principal-tax-n2"
                  metadata={{
                    personName: `${formData.firstName} ${formData.lastName}`,
                    documentType: "avis-imposition-n2",
                    roomName: roomName
                  }}
                />

                {formData.professionalStatus === 'EMPLOYEE' && (
                  <div key="employee-docs">
                    <FileUploadButton
                      label="3 dernières fiches de paie"
                      multiple
                      onUpload={(urls) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          principal: {...formData.documents.principal, payslips: urls}
                        }
                      })}
                      hasFile={!!formData.documents.principal.payslips?.length}
                      fileUrl={formData.documents.principal.payslips?.[0] || ''}
                      onPreview={openPreview}
                      uploadingStates={uploadingStates}
                      setUploadingStates={setUploadingStates}
                      uploadKey="principal-payslips"
                      metadata={{
                        personName: `${formData.firstName} ${formData.lastName}`,
                        documentType: "fiches-paie",
                        roomName: roomName
                      }}
                    />
                    
                    <FileUploadButton
                      label="Contrat de travail"
                      onUpload={(urls) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          principal: {...formData.documents.principal, workContract: urls[0]}
                        }
                      })}
                      hasFile={!!formData.documents.principal.workContract}
                      fileUrl={formData.documents.principal.workContract}
                      onPreview={openPreview}
                      uploadingStates={uploadingStates}
                      setUploadingStates={setUploadingStates}
                      uploadKey="principal-contract"
                      metadata={{
                        personName: `${formData.firstName} ${formData.lastName}`,
                        documentType: "contrat-travail",
                        roomName: roomName
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Documents colocataires */}
            {formData.roommates.map((roommate, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Colocataire {index + 1}: {roommate.firstName || 'Sans nom'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FileUploadButton
                    label="Pièce d'identité"
                    onUpload={(urls) => {
                      const updatedDocs = [...formData.documents.roommates]
                      if (!updatedDocs[index]) updatedDocs[index] = {}
                      updatedDocs[index].idCard = urls[0]
                      setFormData({
                        ...formData,
                        documents: {...formData.documents, roommates: updatedDocs}
                      })
                    }}
                    hasFile={!!formData.documents.roommates[index]?.idCard}
                    fileUrl={formData.documents.roommates[index]?.idCard}
                    onPreview={openPreview}
                    uploadingStates={uploadingStates}
                    setUploadingStates={setUploadingStates}
                    uploadKey={`roommate-${index}-idcard`}
                    metadata={{
                      personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                      documentType: "cni",
                      roomName: roomName
                    }}
                  />

                  <FileUploadButton
                    label="Justificatif domicile"
                    onUpload={(urls) => {
                      const updatedDocs = [...formData.documents.roommates]
                      if (!updatedDocs[index]) updatedDocs[index] = {}
                      updatedDocs[index].currentAddressProof = urls[0]
                      setFormData({
                        ...formData,
                        documents: {...formData.documents, roommates: updatedDocs}
                      })
                    }}
                    hasFile={!!formData.documents.roommates[index]?.currentAddressProof}
                    fileUrl={formData.documents.roommates[index]?.currentAddressProof}
                    onPreview={openPreview}
                    uploadingStates={uploadingStates}
                    setUploadingStates={setUploadingStates}
                    uploadKey={`roommate-${index}-address`}
                    metadata={{
                      personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                      documentType: "justificatif-domicile",
                      roomName: roomName
                    }}
                  />

                  <FileUploadButton
                    label="Avis imposition N-1"
                    onUpload={(urls) => {
                      const updatedDocs = [...formData.documents.roommates]
                      if (!updatedDocs[index]) updatedDocs[index] = {}
                      updatedDocs[index].taxNoticeN1 = urls[0]
                      setFormData({
                        ...formData,
                        documents: {...formData.documents, roommates: updatedDocs}
                      })
                    }}
                    hasFile={!!formData.documents.roommates[index]?.taxNoticeN1}
                    fileUrl={formData.documents.roommates[index]?.taxNoticeN1}
                    onPreview={openPreview}
                    uploadingStates={uploadingStates}
                    setUploadingStates={setUploadingStates}
                    uploadKey={`roommate-${index}-tax-n1`}
                    metadata={{
                      personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                      documentType: "avis-imposition-n1",
                      roomName: roomName
                    }}
                  />

                  <FileUploadButton
                    label="Avis imposition N-2"
                    onUpload={(urls) => {
                      const updatedDocs = [...formData.documents.roommates]
                      if (!updatedDocs[index]) updatedDocs[index] = {}
                      updatedDocs[index].taxNoticeN2 = urls[0]
                      setFormData({
                        ...formData,
                        documents: {...formData.documents, roommates: updatedDocs}
                      })
                    }}
                    hasFile={!!formData.documents.roommates[index]?.taxNoticeN2}
                    fileUrl={formData.documents.roommates[index]?.taxNoticeN2}
                    onPreview={openPreview}
                    uploadingStates={uploadingStates}
                    setUploadingStates={setUploadingStates}
                    uploadKey={`roommate-${index}-tax-n2`}
                    metadata={{
                      personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                      documentType: "avis-imposition-n2",
                      roomName: roomName
                    }}
                  />

                  {roommate.professionalStatus === 'EMPLOYEE' && (
                    <div key={`roommate-employee-docs-${index}`}>
                      <FileUploadButton
                        label="3 dernières fiches de paie"
                        multiple
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.roommates]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].payslips = urls
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, roommates: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.roommates[index]?.payslips?.length}
                        fileUrl={formData.documents.roommates[index]?.payslips?.[0] || ''}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`roommate-${index}-payslips`}
                        metadata={{
                          personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                          documentType: "fiches-paie",
                          roomName: roomName
                        }}
                      />

                      <FileUploadButton
                        label="Contrat de travail"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.roommates]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].workContract = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, roommates: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.roommates[index]?.workContract}
                        fileUrl={formData.documents.roommates[index]?.workContract}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`roommate-${index}-contract`}
                        metadata={{
                          personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                          documentType: "contrat-travail",
                          roomName: roomName
                        }}
                      />
                    </div>
                  )}

                  {roommate.professionalStatus === 'STUDENT' && (
                    <div key={`roommate-student-docs-${index}`}>
                      <FileUploadButton
                        label="Certificat de scolarité"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.roommates]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].schoolCertificate = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, roommates: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.roommates[index]?.schoolCertificate}
                        fileUrl={formData.documents.roommates[index]?.schoolCertificate}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`roommate-${index}-school`}
                        metadata={{
                          personName: `${roommate.firstName || 'colocataire'} ${roommate.lastName || index + 1}`,
                          documentType: "certificat-scolarite",
                          roomName: roomName
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Documents garants */}
            {formData.guarantors.map((guarantor, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Garant {index + 1} ({guarantor.type === 'INDIVIDUAL' ? 'Personne' : guarantor.type})
                  <span className="text-sm font-normal text-gray-600">
                    - Pour {guarantor.assignedTo === 'PRINCIPAL' ? 'locataire principal' :
                           guarantor.assignedTo === 'ALL' ? 'tous les locataires' :
                           guarantor.assignedTo.replace('ROOMMATE_', 'colocataire ')}
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guarantor.type === 'INDIVIDUAL' && (
                    <div key={`individual-${index}`}>
                      <FileUploadButton
                        label="Pièce d'identité"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].idCard = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.idCard}
                        fileUrl={formData.documents.guarantors[index]?.idCard}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`guarantor-${index}-idcard`}
                        metadata={{
                          personName: `${guarantor.firstName || 'garant'} ${guarantor.lastName || index + 1}`,
                          documentType: "cni",
                          roomName: roomName
                        }}
                      />
                      
                      <FileUploadButton
                        label="3 dernières fiches de paie"
                        multiple
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].payslips = urls
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.payslips?.length}
                        fileUrl={formData.documents.guarantors[index]?.payslips?.[0]}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`guarantor-${index}-payslips`}
                        metadata={{
                          personName: `${guarantor.firstName || 'garant'} ${guarantor.lastName || index + 1}`,
                          documentType: "fiches-paie",
                          roomName: roomName
                        }}
                      />
                      
                      <FileUploadButton
                        label="Avis imposition N-1"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].taxNoticeN1 = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.taxNoticeN1}
                        fileUrl={formData.documents.guarantors[index]?.taxNoticeN1}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`guarantor-${index}-tax-n1`}
                        metadata={{
                          personName: `${guarantor.firstName || 'garant'} ${guarantor.lastName || index + 1}`,
                          documentType: "avis-imposition-n1",
                          roomName: roomName
                        }}
                      />
                      
                      <FileUploadButton
                        label="Avis imposition N-2"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].taxNoticeN2 = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.taxNoticeN2}
                        fileUrl={formData.documents.guarantors[index]?.taxNoticeN2}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`guarantor-${index}-tax-n2`}
                        metadata={{
                          personName: `${guarantor.firstName || 'garant'} ${guarantor.lastName || index + 1}`,
                          documentType: "avis-imposition-n2",
                          roomName: roomName
                        }}
                      />
                    </div>
                  )}

                  {guarantor.type === 'VISALE' && (
                    <FileUploadButton
                      label="Attestation Visale"
                      onUpload={(urls) => {
                        const updatedDocs = [...formData.documents.guarantors]
                        if (!updatedDocs[index]) updatedDocs[index] = {}
                        updatedDocs[index].visaleAttestation = urls[0]
                        setFormData({
                          ...formData,
                          documents: {...formData.documents, guarantors: updatedDocs}
                        })
                      }}
                      hasFile={!!formData.documents.guarantors[index]?.visaleAttestation}
                      fileUrl={formData.documents.guarantors[index]?.visaleAttestation}
                      onPreview={openPreview}
                      uploadingStates={uploadingStates}
                      setUploadingStates={setUploadingStates}
                      uploadKey={`guarantor-${index}-visale`}
                      metadata={{
                        personName: guarantor.visaleNumber || 'visale',
                        documentType: "attestation-visale",
                        roomName: roomName
                      }}
                    />
                  )}

                  {guarantor.type === 'COMPANY' && (
                    <div key={`company-${index}`}>
                      <FileUploadButton
                        label="KBIS"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].kbis = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.kbis}
                        fileUrl={formData.documents.guarantors[index]?.kbis}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`guarantor-${index}-kbis`}
                        metadata={{
                          personName: guarantor.companyName || 'entreprise',
                          documentType: "kbis",
                          roomName: roomName
                        }}
                      />
                      
                      <FileUploadButton
                        label="Bilan comptable"
                        onUpload={(urls) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].accountingReport = urls[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.accountingReport}
                        fileUrl={formData.documents.guarantors[index]?.accountingReport}
                        onPreview={openPreview}
                        uploadingStates={uploadingStates}
                        setUploadingStates={setUploadingStates}
                        uploadKey={`guarantor-${index}-accounting`}
                        metadata={{
                          personName: guarantor.companyName || 'entreprise',
                          documentType: "bilan-comptable",
                          roomName: roomName
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
        
      // ÉTAPE 7: RÉCAPITULATIF
      case 7:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Récapitulatif de votre demande</h3>

            {/* Informations générales */}
            <div className="bg-[#F5F3F0] rounded-xl p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Chambre demandée</h4>
                <p className="text-gray-900">{roomName} - {roomPrice}€/mois</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Date d'entrée souhaitée</h4>
                <p className="text-gray-900">
                  {formData.desiredStartDate ?
                    new Date(formData.desiredStartDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Non définie'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Durée de location</h4>
                <p className="text-gray-900">{formData.desiredDuration} mois</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Expérience en colocation</h4>
                <p className="text-gray-900">{formData.hasLivedInColiving ? 'Oui' : 'Non'}</p>
              </div>
            </div>

            {/* Locataire principal */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-5 h-5" />
                Locataire principal
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nom :</span>
                  <p className="text-gray-900 font-medium">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email :</span>
                  <p className="text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Téléphone :</span>
                  <p className="text-gray-900">{formData.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date de naissance :</span>
                  <p className="text-gray-900">
                    {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Lieu de naissance :</span>
                  <p className="text-gray-900">{formData.birthPlace || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Nationalité :</span>
                  <p className="text-gray-900">{formData.nationality}</p>
                </div>
              </div>

              {/* Situation professionnelle */}
              <div className="border-t pt-3">
                <h5 className="font-medium text-gray-900 mb-2">Situation professionnelle</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Statut :</span>
                    <p className="text-gray-900">
                      {formData.professionalStatus === 'EMPLOYEE' ? 'Salarié(e)' :
                       formData.professionalStatus === 'SELF_EMPLOYED' ? 'Auto-entrepreneur' :
                       formData.professionalStatus === 'STUDENT' ? 'Étudiant(e)' :
                       formData.professionalStatus === 'ALTERNANT' ? 'Alternant(e)' :
                       formData.professionalStatus === 'UNEMPLOYED' ? 'Sans emploi' : 'Autre'}
                    </p>
                  </div>
                  {formData.employerName && (
                    <div>
                      <span className="text-gray-600">Employeur :</span>
                      <p className="text-gray-900">{formData.employerName}</p>
                    </div>
                  )}
                  {formData.monthlyIncomeNet && (
                    <div>
                      <span className="text-gray-600">Revenus nets :</span>
                      <p className="text-gray-900">{formData.monthlyIncomeNet}€/mois</p>
                    </div>
                  )}
                  {formData.schoolName && (
                    <div>
                      <span className="text-gray-600">Établissement :</span>
                      <p className="text-gray-900">{formData.schoolName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Logement actuel */}
              <div className="border-t pt-3">
                <h5 className="font-medium text-gray-900 mb-2">Logement actuel</h5>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600">Situation :</span>
                    <span className="text-gray-900 ml-1">
                      {formData.currentHousingSituation === 'TENANT' ? 'Locataire' :
                       formData.currentHousingSituation === 'OWNER' ? 'Propriétaire' : 'Hébergé'}
                    </span>
                  </div>
                  {formData.currentAddress && (
                    <div>
                      <span className="text-gray-600">Adresse :</span>
                      <span className="text-gray-900 ml-1">
                        {formData.currentAddress}, {formData.currentCity} {formData.currentZipCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colocataires */}
            {formData.roommates.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Colocataires ({formData.roommates.length})
                </h4>

                <div className="space-y-3">
                  {formData.roommates.map((rm, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-2">Colocataire {idx + 1}</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Nom :</span>
                          <p className="text-gray-900">{rm.firstName} {rm.lastName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email :</span>
                          <p className="text-gray-900">{rm.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Téléphone :</span>
                          <p className="text-gray-900">{rm.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Statut :</span>
                          <p className="text-gray-900">
                            {rm.professionalStatus === 'EMPLOYEE' ? 'Salarié(e)' :
                             rm.professionalStatus === 'SELF_EMPLOYED' ? 'Auto-entrepreneur' :
                             rm.professionalStatus === 'STUDENT' ? 'Étudiant(e)' :
                             rm.professionalStatus === 'ALTERNANT' ? 'Alternant(e)' :
                             rm.professionalStatus === 'UNEMPLOYED' ? 'Sans emploi' : 'Autre'}
                          </p>
                        </div>
                        {rm.employerName && (
                          <div>
                            <span className="text-gray-600">Employeur :</span>
                            <p className="text-gray-900">{rm.employerName}</p>
                          </div>
                        )}
                        {rm.monthlyIncomeNet && (
                          <div>
                            <span className="text-gray-600">Revenus :</span>
                            <p className="text-gray-900">{rm.monthlyIncomeNet}€/mois</p>
                          </div>
                        )}
                        {rm.schoolName && (
                          <div>
                            <span className="text-gray-600">École :</span>
                            <p className="text-gray-900">{rm.schoolName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Garants */}
            {formData.guarantors.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Garants ({formData.guarantors.length})
                </h4>

                <div className="space-y-3">
                  {formData.guarantors.map((g, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Garant {idx + 1} - {g.type === 'INDIVIDUAL' ? 'Personne physique' :
                                            g.type === 'COMPANY' ? 'Entreprise' : 'Visale'}
                      </h5>

                      <div className="text-sm mb-2">
                        <span className="text-gray-600">Pour :</span>
                        <span className="text-gray-900 ml-1">
                          {g.assignedTo === 'PRINCIPAL' ? 'Locataire principal' :
                           g.assignedTo.replace('ROOMMATE_', 'Colocataire ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {g.type === 'INDIVIDUAL' && (
                          <>
                            <div>
                              <span className="text-gray-600">Nom :</span>
                              <p className="text-gray-900">{g.firstName} {g.lastName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Relation :</span>
                              <p className="text-gray-900">{g.relationship || 'Non précisée'}</p>
                            </div>
                            {g.monthlyIncomeNet && (
                              <div>
                                <span className="text-gray-600">Revenus :</span>
                                <p className="text-gray-900">{g.monthlyIncomeNet}€/mois</p>
                              </div>
                            )}
                            {g.employerName && (
                              <div>
                                <span className="text-gray-600">Employeur :</span>
                                <p className="text-gray-900">{g.employerName}</p>
                              </div>
                            )}
                          </>
                        )}

                        {g.type === 'COMPANY' && (
                          <>
                            <div>
                              <span className="text-gray-600">Entreprise :</span>
                              <p className="text-gray-900">{g.companyName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">SIRET :</span>
                              <p className="text-gray-900">{g.siret}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Contact :</span>
                              <p className="text-gray-900">{g.contactPhone}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Email :</span>
                              <p className="text-gray-900">{g.contactEmail}</p>
                            </div>
                          </>
                        )}

                        {g.type === 'VISALE' && (
                          <div>
                            <span className="text-gray-600">Numéro Visale :</span>
                            <p className="text-gray-900">{g.visaleNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents fournis */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents fournis
              </h4>

              {/* Documents locataire principal */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Locataire principal</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {formData.documents.principal.idCard ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={formData.documents.principal.idCard ? 'text-green-700' : 'text-gray-500'}>
                      Pièce d'identité
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {formData.documents.principal.currentAddressProof ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={formData.documents.principal.currentAddressProof ? 'text-green-700' : 'text-gray-500'}>
                      Justificatif domicile
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {formData.documents.principal.taxNoticeN1 ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={formData.documents.principal.taxNoticeN1 ? 'text-green-700' : 'text-gray-500'}>
                      Avis imposition N-1
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {formData.documents.principal.taxNoticeN2 ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={formData.documents.principal.taxNoticeN2 ? 'text-green-700' : 'text-gray-500'}>
                      Avis imposition N-2
                    </span>
                  </div>

                  {formData.professionalStatus === 'EMPLOYEE' && (
                    <div key="employee-docs-recap">
                      <div className="flex items-center gap-2">
                        {formData.documents.principal.payslips?.length ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span className={formData.documents.principal.payslips?.length ? 'text-green-700' : 'text-gray-500'}>
                          Fiches de paie ({formData.documents.principal.payslips?.length || 0})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {formData.documents.principal.workContract ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span className={formData.documents.principal.workContract ? 'text-green-700' : 'text-gray-500'}>
                          Contrat de travail
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents colocataires */}
              {formData.roommates.map((rm, idx) => (
                <div key={idx} className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Colocataire {idx + 1}: {rm.firstName}</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {formData.documents.roommates[idx]?.idCard ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className={formData.documents.roommates[idx]?.idCard ? 'text-green-700' : 'text-gray-500'}>
                        Pièce d'identité
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {formData.documents.roommates[idx]?.payslips?.length ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className={formData.documents.roommates[idx]?.payslips?.length ? 'text-green-700' : 'text-gray-500'}>
                        Justificatif revenus
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Documents garants */}
              {formData.guarantors.map((g, idx) => (
                <div key={idx} className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Garant {idx + 1}: {g.type === 'INDIVIDUAL' ? `${g.firstName} ${g.lastName}` :
                                      g.type === 'COMPANY' ? g.companyName : 'Visale'}
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {g.type === 'INDIVIDUAL' && (
                      <div key={`individual-recap-${idx}`}>
                        <div className="flex items-center gap-2">
                          {formData.documents.guarantors[idx]?.idCard ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={formData.documents.guarantors[idx]?.idCard ? 'text-green-700' : 'text-gray-500'}>
                            Pièce d'identité
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {formData.documents.guarantors[idx]?.payslips?.length ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={formData.documents.guarantors[idx]?.payslips?.length ? 'text-green-700' : 'text-gray-500'}>
                            Fiches de paie ({formData.documents.guarantors[idx]?.payslips?.length || 0})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {formData.documents.guarantors[idx]?.taxNoticeN1 ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={formData.documents.guarantors[idx]?.taxNoticeN1 ? 'text-green-700' : 'text-gray-500'}>
                            Avis imposition N-1
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {formData.documents.guarantors[idx]?.taxNoticeN2 ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={formData.documents.guarantors[idx]?.taxNoticeN2 ? 'text-green-700' : 'text-gray-500'}>
                            Avis imposition N-2
                          </span>
                        </div>
                      </div>
                    )}

                    {g.type === 'VISALE' && (
                      <div className="flex items-center gap-2">
                        {formData.documents.guarantors[idx]?.visaleAttestation ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span className={formData.documents.guarantors[idx]?.visaleAttestation ? 'text-green-700' : 'text-gray-500'}>
                          Attestation Visale
                        </span>
                      </div>
                    )}

                    {g.type === 'COMPANY' && (
                      <div key={`company-recap-${idx}`}>
                        <div className="flex items-center gap-2">
                          {formData.documents.guarantors[idx]?.kbis ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={formData.documents.guarantors[idx]?.kbis ? 'text-green-700' : 'text-gray-500'}>
                            KBIS
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {formData.documents.guarantors[idx]?.accountingReport ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={formData.documents.guarantors[idx]?.accountingReport ? 'text-green-700' : 'text-gray-500'}>
                            Bilan comptable
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Statistiques globales */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Documents fournis :</span>
                  <span className="font-medium text-gray-900">
                    {Object.values(formData.documents.principal).filter(Boolean).length +
                     formData.documents.roommates.reduce((acc, rm) => acc + Object.values(rm || {}).filter(Boolean).length, 0) +
                     formData.documents.guarantors.reduce((acc, g) => acc + Object.values(g || {}).filter(Boolean).length, 0)} documents
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                  className="mt-1 w-5 h-5 text-black rounded border-gray-300 focus:ring-black"
                />
                <span className="text-sm text-gray-700">
                  J'accepte les conditions générales et je certifie que toutes les informations
                  fournies sont exactes et complètes. Je confirme également que tous les documents
                  fournis sont authentiques et à jour.
                </span>
              </label>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-black text-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Demande de réservation</h2>
                  <p className="text-[#F5F3F0] text-sm mt-1">{roomName} - {roomPrice}€/mois</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress steps - Mobile horizontal scroll */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all ${
                      currentStep === step.id
                        ? 'bg-white text-black'
                        : currentStep > step.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.mobileTitle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="border-t p-4 sm:p-6 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Précédent</span>
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm"
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.acceptTerms || isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                      formData.acceptTerms && !isSubmitting
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Envoyer</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Document Preview Modal */}
      {showDocumentPreview && previewUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowDocumentPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Prévisualisation du document
              </h3>
              <button
                onClick={() => setShowDocumentPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {previewUrl.includes('.pdf') ? (
                <embed
                  src={previewUrl}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className="border rounded"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div></div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = previewUrl
                    link.download = `document_${Date.now()}`
                    link.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={() => setShowDocumentPreview(false)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}