'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronRight, ChevronLeft, Calendar, User, Users, Home, Briefcase, 
  FileText, Upload, Check, AlertCircle, Loader2, Clock, Shield,
  MessageSquare, Info
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
  profession: string
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
  
  // Colocataire
  hasRoommate: boolean
  roommate?: Roommate
  
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
  
  // Garant
  hasGuarantor: boolean
  guarantorType: 'INDIVIDUAL' | 'VISALE' | 'COMPANY' | 'NONE'
  guarantorFirstName?: string
  guarantorLastName?: string
  guarantorPhone?: string
  guarantorEmail?: string
  guarantorAddress?: string
  guarantorRelationship?: string
  guarantorMonthlyIncome?: number
  guarantorEmployerName?: string
  guarantorProfession?: string
  
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
    roommate: undefined,
    currentHousingSituation: 'TENANT',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    isMinor: false,
    professionalStatus: 'EMPLOYEE',
    hasGuarantor: false,
    guarantorType: 'NONE',
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
          if (!formData.roommate?.firstName || !formData.roommate?.lastName || 
              !formData.roommate?.email || !formData.roommate?.phone) {
            toast.error('Veuillez remplir tous les champs obligatoires du colocataire')
            return false
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
        if (formData.hasGuarantor && formData.guarantorType === 'INDIVIDUAL') {
          if (!formData.guarantorFirstName || !formData.guarantorLastName) {
            toast.error('Veuillez remplir les informations du garant')
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
            const formData = new FormData()
            formData.append('file', value)
            formData.append('type', 'documents')
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            
            if (response.ok) {
              const data = await response.json()
              uploadedDocs[key] = data.data.url
            }
          }
        }
      }
      
      // Soumettre le dossier
      const response = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          roomId,
          documents: uploadedDocs,
          status: 'SUBMITTED'
        })
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
                Avez-vous un colocataire ?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hasRoommate: true }))}
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
                  onClick={() => setFormData(prev => ({ ...prev, hasRoommate: false, roommate: undefined }))}
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
                        Le colocataire devra également fournir ses documents
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.roommate?.firstName || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          roommate: {
                            ...prev.roommate,
                            firstName: e.target.value,
                            lastName: prev.roommate?.lastName || '',
                            email: prev.roommate?.email || '',
                            phone: prev.roommate?.phone || '',
                            birthDate: prev.roommate?.birthDate || '',
                            profession: prev.roommate?.profession || ''
                          }
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
                        value={formData.roommate?.lastName || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          roommate: {
                            firstName: prev.roommate?.firstName || '',
                            lastName: e.target.value,
                            email: prev.roommate?.email || '',
                            phone: prev.roommate?.phone || '',
                            birthDate: prev.roommate?.birthDate || '',
                            profession: prev.roommate?.profession || ''
                          }
                        }))}
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
                      value={formData.roommate?.email || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        roommate: {
                          firstName: prev.roommate?.firstName || '',
                          lastName: prev.roommate?.lastName || '',
                          email: e.target.value,
                          phone: prev.roommate?.phone || '',
                          birthDate: prev.roommate?.birthDate || '',
                          profession: prev.roommate?.profession || ''
                        }
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
                      value={formData.roommate?.phone || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        roommate: {
                          firstName: prev.roommate?.firstName || '',
                          lastName: prev.roommate?.lastName || '',
                          email: prev.roommate?.email || '',
                          phone: e.target.value,
                          birthDate: prev.roommate?.birthDate || '',
                          profession: prev.roommate?.profession || ''
                        }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date de naissance *
                      </label>
                      <input
                        type="date"
                        value={formData.roommate?.birthDate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          roommate: {
                            firstName: prev.roommate?.firstName || '',
                            lastName: prev.roommate?.lastName || '',
                            email: prev.roommate?.email || '',
                            phone: prev.roommate?.phone || '',
                            birthDate: e.target.value,
                            profession: prev.roommate?.profession || ''
                          }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Profession
                      </label>
                      <input
                        type="text"
                        value={formData.roommate?.profession || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          roommate: {
                            firstName: prev.roommate?.firstName || '',
                            lastName: prev.roommate?.lastName || '',
                            email: prev.roommate?.email || '',
                            phone: prev.roommate?.phone || '',
                            birthDate: prev.roommate?.birthDate || '',
                            profession: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Étudiant, Salarié, etc."
                      />
                    </div>
                  </div>
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
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) }))}
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
                Avez-vous un garant ?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.hasGuarantor}
                    onChange={() => setFormData(prev => ({ ...prev, hasGuarantor: true }))}
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.hasGuarantor}
                    onChange={() => setFormData(prev => ({ ...prev, hasGuarantor: false, guarantorType: 'NONE' }))}
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>
            
            {formData.hasGuarantor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de garant *
                  </label>
                  <select
                    value={formData.guarantorType}
                    onChange={(e) => setFormData(prev => ({ ...prev, guarantorType: e.target.value as any }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="INDIVIDUAL">Personne physique</option>
                    <option value="VISALE">Visale</option>
                    <option value="COMPANY">Entreprise</option>
                  </select>
                </div>
                
                {formData.guarantorType === 'INDIVIDUAL' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom du garant *
                        </label>
                        <input
                          type="text"
                          value={formData.guarantorFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guarantorFirstName: e.target.value }))}
                          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du garant *
                        </label>
                        <input
                          type="text"
                          value={formData.guarantorLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guarantorLastName: e.target.value }))}
                          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lien avec le garant *
                      </label>
                      <select
                        value={formData.guarantorRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorRelationship: e.target.value }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Parent">Parent</option>
                        <option value="Famille">Famille</option>
                        <option value="Ami">Ami(e)</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email du garant
                      </label>
                      <input
                        type="email"
                        value={formData.guarantorEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorEmail: e.target.value }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone du garant
                      </label>
                      <input
                        type="tel"
                        value={formData.guarantorPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorPhone: e.target.value }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revenus mensuels du garant
                      </label>
                      <input
                        type="number"
                        value={formData.guarantorMonthlyIncome}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorMonthlyIncome: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="3000"
                      />
                    </div>
                  </>
                )}
                
                {formData.guarantorType === 'VISALE' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Garantie Visale
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Vous devrez fournir votre attestation Visale dans l'étape Documents.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) }))}
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
                Avez-vous un garant ?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.hasGuarantor}
                    onChange={() => setFormData(prev => ({ ...prev, hasGuarantor: true }))}
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.hasGuarantor}
                    onChange={() => setFormData(prev => ({ ...prev, hasGuarantor: false, guarantorType: 'NONE' }))}
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>
            
            {formData.hasGuarantor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de garant *
                  </label>
                  <select
                    value={formData.guarantorType}
                    onChange={(e) => setFormData(prev => ({ ...prev, guarantorType: e.target.value as any }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="INDIVIDUAL">Personne physique</option>
                    <option value="VISALE">Visale</option>
                    <option value="COMPANY">Entreprise</option>
                  </select>
                </div>
                
                {formData.guarantorType === 'INDIVIDUAL' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom du garant *
                        </label>
                        <input
                          type="text"
                          value={formData.guarantorFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guarantorFirstName: e.target.value }))}
                          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du garant *
                        </label>
                        <input
                          type="text"
                          value={formData.guarantorLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guarantorLastName: e.target.value }))}
                          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lien avec le garant *
                      </label>
                      <select
                        value={formData.guarantorRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorRelationship: e.target.value }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Parent">Parent</option>
                        <option value="Famille">Famille</option>
                        <option value="Ami">Ami(e)</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email du garant
                      </label>
                      <input
                        type="email"
                        value={formData.guarantorEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorEmail: e.target.value }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone du garant
                      </label>
                      <input
                        type="tel"
                        value={formData.guarantorPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorPhone: e.target.value }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revenus mensuels du garant
                      </label>
                      <input
                        type="number"
                        value={formData.guarantorMonthlyIncome}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorMonthlyIncome: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="3000"
                      />
                    </div>
                  </>
                )}
                
                {formData.guarantorType === 'VISALE' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Garantie Visale
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Vous devrez fournir votre attestation Visale dans l'étape Documents.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    Format PDF ou image, max 5MB par fichier
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
              </div>
              
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
                  </div>
                </>
              )}
              
              {/* Attestation Visale */}
              {formData.guarantorType === 'VISALE' && (
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
                          documents: { ...prev.documents, visaleAttestation: file }
                        }))
                      }
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
                  />
                </div>
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
            
            {/* Garant */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Garant</h3>
              <p className="text-sm text-gray-700">
                {!formData.hasGuarantor && 'Pas de garant'}
                {formData.guarantorType === 'INDIVIDUAL' && `${formData.guarantorFirstName} ${formData.guarantorLastName}`}
                {formData.guarantorType === 'VISALE' && 'Garantie Visale'}
                {formData.guarantorType === 'COMPANY' && 'Entreprise'}
              </p>
            </div>
            
            {/* Documents */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Documents</h3>
              <p className="text-sm text-gray-600">
                {Object.keys(formData.documents).length} document(s) prêt(s) à être envoyé(s)
              </p>
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