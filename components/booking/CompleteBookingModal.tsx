'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronRight, ChevronLeft, Calendar, User, Users, Home, Briefcase, 
  FileText, Upload, Check, AlertCircle, Loader2, Shield,
  Info, Building, UserPlus, FileCheck, AlertTriangle, Clock,
  MapPin, Phone, Mail, FileUp
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
  nationality: string
  
  // Situation professionnelle
  professionalStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'STUDENT' | 'ALTERNANT' | 'UNEMPLOYED' | 'OTHER'
  employerName?: string
  monthlyIncomeNet?: number
  schoolName?: string
}

interface Guarantor {
  type: 'INDIVIDUAL' | 'VISALE' | 'COMPANY' | 'NONE'
  assignedTo: 'PRINCIPAL' | 'ROOMMATE_1' | 'ROOMMATE_2'
  
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
      idCard?: File
      currentAddressProof?: File
      taxNoticeN1?: File
      taxNoticeN2?: File
      payslips?: File[]
      workContract?: File
      schoolCertificate?: File
      apprenticeshipContract?: File
      accountingReport?: File
    }
    // Documents colocataires
    roommates: Array<{
      idCard?: File
      incomeProof?: File
      schoolCertificate?: File
    }>
    // Documents garants
    guarantors: Array<{
      idCard?: File
      payslips?: File[]
      taxNoticeN1?: File
      taxNoticeN2?: File
      addressProof?: File
      visaleAttestation?: File
      kbis?: File
      accountingReport?: File
      commitmentLetter?: File
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

// Composant pour un bouton d'upload stylé
const FileUploadButton = ({ 
  label, 
  onChange, 
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  hasFile = false 
}: {
  label: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accept?: string
  multiple?: boolean
  hasFile?: boolean
}) => {
  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="sr-only"
        id={`upload-${label.replace(/\s+/g, '-')}`}
      />
      <label
        htmlFor={`upload-${label.replace(/\s+/g, '-')}`}
        className={`
          flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed 
          cursor-pointer transition-all
          ${hasFile 
            ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' 
            : 'border-gray-300 bg-white text-gray-600 hover:border-black hover:bg-gray-50'
          }
        `}
      >
        {hasFile ? (
          <>
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Fichier ajouté</span>
          </>
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
    currentHousingSituation: 'TENANT',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    // Garants
    guarantors: [],
    // Documents
    documents: {
      principal: {},
      roommates: [],
      guarantors: []
    },
    acceptTerms: false
  })

  const nextStep = () => {
    if (currentStep < STEPS.length) {
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
          professionalStatus: 'STUDENT'
        }]
      })
    }
  }

  const removeRoommate = (index: number) => {
    setFormData({
      ...formData,
      roommates: formData.roommates.filter((_, i) => i !== index)
    })
  }

  const addGuarantor = () => {
    if (formData.guarantors.length < 2) {
      setFormData({
        ...formData,
        guarantors: [...formData.guarantors, {
          type: 'INDIVIDUAL',
          assignedTo: 'PRINCIPAL'
        }]
      })
    }
  }

  const removeGuarantor = (index: number) => {
    setFormData({
      ...formData,
      guarantors: formData.guarantors.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Votre demande de réservation a été envoyée avec succès !')
      onClose()
    } catch (error) {
      toast.error('Une erreur est survenue')
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
                onChange={(e) => setFormData({...formData, desiredStartDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
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
                
                <input
                  type="text"
                  placeholder="Adresse actuelle"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
                
                <div className="grid grid-cols-2 gap-3">
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
                    onChange={(e) => setFormData({...formData, currentZipCode: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl"
                  />
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      
                      <input
                        type="email"
                        placeholder="Email"
                        value={roommate.email}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].email = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                      />
                      
                      <input
                        type="tel"
                        placeholder="Téléphone"
                        value={roommate.phone}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].phone = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                      />
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
                  <>
                    <input
                      type="text"
                      placeholder="Nom de l'employeur"
                      value={formData.employerName}
                      onChange={(e) => setFormData({...formData, employerName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                    
                    <input
                      type="number"
                      placeholder="Revenus mensuels nets (€)"
                      value={formData.monthlyIncomeNet}
                      onChange={(e) => setFormData({...formData, monthlyIncomeNet: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                  </>
                )}

                {(formData.professionalStatus === 'STUDENT' || formData.professionalStatus === 'ALTERNANT') && (
                  <input
                    type="text"
                    placeholder="Établissement scolaire"
                    value={formData.schoolName}
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
                    <>
                      <input
                        type="text"
                        placeholder="Nom de l'employeur"
                        value={roommate.employerName}
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
                        value={roommate.monthlyIncomeNet}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].monthlyIncomeNet = Number(e.target.value)
                          setFormData({...formData, roommates: updated})
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      />
                    </>
                  )}

                  {(roommate.professionalStatus === 'STUDENT' || roommate.professionalStatus === 'ALTERNANT') && (
                    <input
                      type="text"
                      placeholder="Établissement scolaire"
                      value={roommate.schoolName}
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
                      </select>

                      {/* Champs selon le type */}
                      {guarantor.type === 'INDIVIDUAL' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Prénom"
                            value={guarantor.firstName}
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
                            value={guarantor.lastName}
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
                            value={guarantor.monthlyIncomeNet}
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
                            value={guarantor.relationship}
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
                            value={guarantor.companyName}
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
                            value={guarantor.siret}
                            onChange={(e) => {
                              const updated = [...formData.guarantors]
                              updated[index].siret = e.target.value
                              setFormData({...formData, guarantors: updated})
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="tel"
                              placeholder="Téléphone de contact"
                              value={guarantor.contactPhone}
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
                              value={guarantor.contactEmail}
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
                          value={guarantor.visaleNumber}
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
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, idCard: e.target.files?.[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.idCard}
                />
                
                <FileUploadButton
                  label="Justificatif domicile"
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, currentAddressProof: e.target.files?.[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.currentAddressProof}
                />
                
                <FileUploadButton
                  label="Avis imposition N-1"
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, taxNoticeN1: e.target.files?.[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.taxNoticeN1}
                />
                
                <FileUploadButton
                  label="Avis imposition N-2"
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: {
                      ...formData.documents,
                      principal: {...formData.documents.principal, taxNoticeN2: e.target.files?.[0]}
                    }
                  })}
                  hasFile={!!formData.documents.principal.taxNoticeN2}
                />

                {formData.professionalStatus === 'EMPLOYEE' && (
                  <>
                    <FileUploadButton
                      label="3 dernières fiches de paie"
                      multiple
                      onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          principal: {...formData.documents.principal, payslips: Array.from(e.target.files || [])}
                        }
                      })}
                      hasFile={!!formData.documents.principal.payslips?.length}
                    />
                    
                    <FileUploadButton
                      label="Contrat de travail"
                      onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          principal: {...formData.documents.principal, workContract: e.target.files?.[0]}
                        }
                      })}
                      hasFile={!!formData.documents.principal.workContract}
                    />
                  </>
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
                    onChange={(e) => {
                      const updatedDocs = [...formData.documents.roommates]
                      if (!updatedDocs[index]) updatedDocs[index] = {}
                      updatedDocs[index].idCard = e.target.files?.[0]
                      setFormData({
                        ...formData,
                        documents: {...formData.documents, roommates: updatedDocs}
                      })
                    }}
                    hasFile={!!formData.documents.roommates[index]?.idCard}
                  />
                  
                  <FileUploadButton
                    label="Justificatif de revenus"
                    onChange={(e) => {
                      const updatedDocs = [...formData.documents.roommates]
                      if (!updatedDocs[index]) updatedDocs[index] = {}
                      updatedDocs[index].incomeProof = e.target.files?.[0]
                      setFormData({
                        ...formData,
                        documents: {...formData.documents, roommates: updatedDocs}
                      })
                    }}
                    hasFile={!!formData.documents.roommates[index]?.incomeProof}
                  />
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
                           guarantor.assignedTo.replace('ROOMMATE_', 'colocataire ')}
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guarantor.type === 'INDIVIDUAL' && (
                    <>
                      <FileUploadButton
                        label="Pièce d'identité"
                        onChange={(e) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].idCard = e.target.files?.[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.idCard}
                      />
                      
                      <FileUploadButton
                        label="3 dernières fiches de paie"
                        multiple
                        onChange={(e) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].payslips = Array.from(e.target.files || [])
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.payslips?.length}
                      />
                      
                      <FileUploadButton
                        label="Avis imposition N-1"
                        onChange={(e) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].taxNoticeN1 = e.target.files?.[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.taxNoticeN1}
                      />
                      
                      <FileUploadButton
                        label="Avis imposition N-2"
                        onChange={(e) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].taxNoticeN2 = e.target.files?.[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.taxNoticeN2}
                      />
                    </>
                  )}

                  {guarantor.type === 'VISALE' && (
                    <FileUploadButton
                      label="Attestation Visale"
                      onChange={(e) => {
                        const updatedDocs = [...formData.documents.guarantors]
                        if (!updatedDocs[index]) updatedDocs[index] = {}
                        updatedDocs[index].visaleAttestation = e.target.files?.[0]
                        setFormData({
                          ...formData,
                          documents: {...formData.documents, guarantors: updatedDocs}
                        })
                      }}
                      hasFile={!!formData.documents.guarantors[index]?.visaleAttestation}
                    />
                  )}

                  {guarantor.type === 'COMPANY' && (
                    <>
                      <FileUploadButton
                        label="KBIS"
                        onChange={(e) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].kbis = e.target.files?.[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.kbis}
                      />
                      
                      <FileUploadButton
                        label="Bilan comptable"
                        onChange={(e) => {
                          const updatedDocs = [...formData.documents.guarantors]
                          if (!updatedDocs[index]) updatedDocs[index] = {}
                          updatedDocs[index].accountingReport = e.target.files?.[0]
                          setFormData({
                            ...formData,
                            documents: {...formData.documents, guarantors: updatedDocs}
                          })
                        }}
                        hasFile={!!formData.documents.guarantors[index]?.accountingReport}
                      />
                    </>
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
            
            <div className="bg-[#F5F3F0] rounded-xl p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Chambre demandée</h4>
                <p className="text-gray-900">{roomName} - {roomPrice}€/mois</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Date d'entrée</h4>
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
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Durée</h4>
                <p className="text-gray-900">{formData.desiredDuration} mois</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Locataire principal</h4>
                <p className="text-gray-900">{formData.firstName} {formData.lastName}</p>
                <p className="text-gray-700 text-sm">{formData.email}</p>
              </div>
              
              {formData.roommates.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Colocataires ({formData.roommates.length})</h4>
                  {formData.roommates.map((rm, idx) => (
                    <p key={idx} className="text-gray-900">
                      • {rm.firstName} {rm.lastName}
                    </p>
                  ))}
                </div>
              )}
              
              {formData.guarantors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Garants ({formData.guarantors.length})</h4>
                  {formData.guarantors.map((g, idx) => (
                    <div key={idx} className="text-gray-900">
                      <p>
                        • {g.type === 'INDIVIDUAL' ? `${g.firstName} ${g.lastName}` : 
                           g.type === 'COMPANY' ? g.companyName : 
                           'Visale'}
                      </p>
                      <p className="text-sm text-gray-600 ml-3">
                        Pour {g.assignedTo === 'PRINCIPAL' ? 'locataire principal' : 
                             g.assignedTo.replace('ROOMMATE_', 'colocataire ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
                  fournies sont exactes et complètes.
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
    </AnimatePresence>
  )
}