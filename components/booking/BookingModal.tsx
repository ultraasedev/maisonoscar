'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronRight, ChevronLeft, Calendar, User, Home, Briefcase, 
  FileText, Upload, Check, AlertCircle, Loader2, Clock, Users,
  Phone, Mail, MapPin, Building, GraduationCap, Euro, Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomName: string
  roomPrice: number
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
  professionalStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'STUDENT' | 'ALTERNANT' | 'UNEMPLOYED' | 'OTHER'
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
  
  // Documents
  documents: {
    identity?: File
    identityGuardian1?: File
    identityGuardian2?: File
    proofOfAddress?: File[]
    employmentContract?: File
    payslips?: File[]
    studentCard?: File
    alternanceContract?: File
    taxNotice?: File
    guarantorIdentity?: File
    guarantorProofOfIncome?: File[]
    guarantorTaxNotice?: File
    visaleAttestation?: File
  }
}

const steps = [
  { id: 'duration', title: 'Durée', icon: Calendar },
  { id: 'personal', title: 'Identité', icon: User },
  { id: 'housing', title: 'Logement', icon: Home },
  { id: 'professional', title: 'Situation', icon: Briefcase },
  { id: 'guarantor', title: 'Garant', icon: Shield },
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'summary', title: 'Récapitulatif', icon: Check }
]

export default function BookingModal({ isOpen, onClose, roomId, roomName, roomPrice }: BookingModalProps) {
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
    currentHousingSituation: 'TENANT',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    isMinor: false,
    professionalStatus: 'EMPLOYEE',
    hasGuarantor: false,
    guarantorType: 'NONE',
    documents: {}
  })

  // Vérifier si l'utilisateur est mineur
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const isMinor = age < 18
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début souhaitée *
              </label>
              <input
                type="date"
                value={formData.desiredStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredStartDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée souhaitée (en mois) *
              </label>
              <select
                value={formData.desiredDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredDuration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Chambre : {roomName}
                  </p>
                  <p className="text-sm text-blue-700">
                    Loyer mensuel : {roomPrice}€ charges comprises
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de naissance *
                </label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationalité *
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situation maritale *
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Pacsé(e)">Pacsé(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
              </div>
            </div>
            
            {formData.isMinor && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Responsable légal 1 *
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.legalGuardian1FirstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalGuardian1FirstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.legalGuardian1LastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalGuardian1LastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
        
      case 'housing':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situation actuelle *
              </label>
              <select
                value={formData.currentHousingSituation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentHousingSituation: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="TENANT">Locataire</option>
                <option value="OWNER">Propriétaire</option>
                <option value="HOSTED">Hébergé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse actuelle *
              </label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Numéro et nom de rue"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={formData.currentZipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentZipCode: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  maxLength={5}
                />
              </div>
            </div>
          </div>
        )
        
      case 'professional':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situation professionnelle *
              </label>
              <select
                value={formData.professionalStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalStatus: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'employeur *
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, employerName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste occupé
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenus mensuels nets
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="€"
                  />
                </div>
              </>
            )}
            
            {(formData.professionalStatus === 'STUDENT' || formData.professionalStatus === 'ALTERNANT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Établissement *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'études
                  </label>
                  <input
                    type="text"
                    value={formData.studyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, studyLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Ex: Licence 3, Master 1..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domaine d'études
                  </label>
                  <input
                    type="text"
                    value={formData.studyField}
                    onChange={(e) => setFormData(prev => ({ ...prev, studyField: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        )
        
      case 'guarantor':
        return (
          <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de garant *
                  </label>
                  <select
                    value={formData.guarantorType}
                    onChange={(e) => setFormData(prev => ({ ...prev, guarantorType: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="INDIVIDUAL">Personne physique</option>
                    <option value="VISALE">Visale</option>
                    <option value="COMPANY">Entreprise</option>
                  </select>
                </div>
                
                {formData.guarantorType === 'INDIVIDUAL' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom du garant *
                        </label>
                        <input
                          type="text"
                          value={formData.guarantorFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guarantorFirstName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du garant *
                        </label>
                        <input
                          type="text"
                          value={formData.guarantorLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guarantorLastName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien avec le garant
                      </label>
                      <input
                        type="text"
                        value={formData.guarantorRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantorRelationship: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Ex: Parent, Ami..."
                      />
                    </div>
                  </>
                )}
                
                {formData.guarantorType === 'VISALE' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Garantie Visale
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Vous devrez fournir votre attestation Visale lors de l'étape suivante.
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
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Documents requis
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Préparez vos documents au format PDF ou image (max 5MB par fichier)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificatifs de domicile (3 derniers mois) *
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              {formData.professionalStatus === 'EMPLOYEE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
              
              {formData.professionalStatus === 'STUDENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )
        
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Récapitulatif de votre dossier
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Vérifiez vos informations avant de soumettre
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Chambre demandée</h3>
                <p className="text-sm text-gray-600">{roomName} - {roomPrice}€/mois</p>
                <p className="text-sm text-gray-600">À partir du {new Date(formData.desiredStartDate).toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-gray-600">Durée : {formData.desiredDuration} mois</p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Identité</h3>
                <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-gray-600">{formData.email}</p>
                <p className="text-sm text-gray-600">{formData.phone}</p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Situation professionnelle</h3>
                <p className="text-sm text-gray-600">
                  {formData.professionalStatus === 'EMPLOYEE' && 'Salarié(e)'}
                  {formData.professionalStatus === 'STUDENT' && 'Étudiant(e)'}
                  {formData.professionalStatus === 'ALTERNANT' && 'Alternant(e)'}
                  {formData.professionalStatus === 'SELF_EMPLOYED' && 'Auto-entrepreneur'}
                  {formData.professionalStatus === 'UNEMPLOYED' && 'Sans emploi'}
                </p>
                {formData.employerName && <p className="text-sm text-gray-600">{formData.employerName}</p>}
                {formData.schoolName && <p className="text-sm text-gray-600">{formData.schoolName}</p>}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Garant</h3>
                <p className="text-sm text-gray-600">
                  {!formData.hasGuarantor && 'Pas de garant'}
                  {formData.guarantorType === 'INDIVIDUAL' && `${formData.guarantorFirstName} ${formData.guarantorLastName}`}
                  {formData.guarantorType === 'VISALE' && 'Garantie Visale'}
                  {formData.guarantorType === 'COMPANY' && 'Garantie entreprise'}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                En soumettant ce dossier, vous certifiez que toutes les informations fournies sont exactes et complètes.
                L'équipe Maison Oscar examinera votre dossier et vous contactera sous 3-4 jours ouvrés.
              </p>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Demande de réservation
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Étape {currentStep + 1} sur {steps.length}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Steps */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 overflow-x-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      index === currentStep
                        ? 'bg-black text-white'
                        : index < currentStep
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderStepContent()}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Soumettre le dossier
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