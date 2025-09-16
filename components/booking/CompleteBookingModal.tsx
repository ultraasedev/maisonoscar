'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronRight, ChevronLeft, Calendar, User, Users, Home, Briefcase, 
  FileText, Upload, Check, AlertCircle, Loader2, Shield,
  Info, Building, UserPlus, FileCheck, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomName: string
  roomPrice: number
  roomStatus?: 'AVAILABLE' | 'OCCUPIED'
  availableDate?: Date
}

interface Roommate {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  documents: {
    idCard?: File
    incomeProof?: File
  }
}

interface Guarantor {
  type: 'INDIVIDUAL' | 'VISALE' | 'COMPANY' | 'NONE'
  assignedTo: 'APPLICANT' | 'ROOMMATE_1' | 'ROOMMATE_2' // À qui est assigné le garant
  
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
  
  // Documents selon le type
  documents: {
    // Si personne physique
    idCard?: File
    payslips?: File[] // 3 dernières
    taxNoticeN1?: File // Avis N-1 définitif
    taxNoticeN2?: File // Avis N-2 définitif
    addressProof?: File
    
    // Si Visale
    visaleAttestation?: File
    
    // Si entreprise
    kbis?: File
    accountingReport?: File
    commitmentLetter?: File
  }
}

interface FormData {
  // Étape 1: Informations personnelles
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  nationality: string
  maritalStatus: string
  desiredDuration: string
  hasLivedInColiving: boolean
  
  // Étape 2: Colocataires
  roommates: Roommate[]
  
  // Étape 3: Situation de logement
  currentHousingSituation: 'TENANT' | 'OWNER' | 'HOSTED'
  currentAddress: string
  currentCity: string
  currentZipCode: string
  
  // Étape 4: Situation professionnelle
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
  
  // Étape 5: Garants
  guarantors: Guarantor[]
  
  // Étape 6: Documents
  documents: {
    // Documents obligatoires pour tous
    idCard?: File
    currentAddressProof?: File
    taxNoticeN1?: File // Avis N-1 définitif
    taxNoticeN2?: File // Avis N-2 définitif
    
    // Documents selon situation pro
    payslips?: File[] // 3 dernières si salarié
    workContract?: File // Si salarié
    schoolCertificate?: File // Si étudiant
    apprenticeshipContract?: File // Si alternant
    accountingReport?: File // Si auto-entrepreneur
    unemploymentCertificate?: File // Si sans emploi
  }
  
  // Étape 8: Confirmation
  acceptTerms: boolean
}

const STEPS = [
  { id: 1, title: 'Informations personnelles', icon: User },
  { id: 2, title: 'Colocataires', icon: Users },
  { id: 3, title: 'Logement actuel', icon: Home },
  { id: 4, title: 'Situation professionnelle', icon: Briefcase },
  { id: 5, title: 'Garants', icon: Shield },
  { id: 6, title: 'Documents', icon: FileText },
  { id: 7, title: 'Récapitulatif', icon: FileCheck },
  { id: 8, title: 'Confirmation', icon: Check }
]

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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    nationality: 'Française',
    maritalStatus: 'Célibataire',
    desiredDuration: '12',
    hasLivedInColiving: false,
    roommates: [],
    currentHousingSituation: 'TENANT',
    currentAddress: '',
    currentCity: '',
    currentZipCode: '',
    professionalStatus: 'EMPLOYEE',
    guarantors: [],
    documents: {},
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
          documents: {}
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
          assignedTo: 'APPLICANT',
          documents: {}
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
    if (!formData.acceptTerms) {
      toast.error('Veuillez accepter les conditions générales')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simuler l'envoi
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
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Colocataires</h3>
              {formData.roommates.length < 2 && (
                <button
                  onClick={addRoommate}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Ajouter un colocataire
                </button>
              )}
            </div>

            {formData.roommates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun colocataire pour le moment</p>
                <p className="text-sm text-gray-500 mt-1">Vous pouvez ajouter jusqu'à 2 colocataires</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.roommates.map((roommate, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Colocataire {index + 1}</h4>
                      <button
                        onClick={() => removeRoommate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={roommate.firstName}
                        onChange={(e) => {
                          const updated = [...formData.roommates]
                          updated[index].firstName = e.target.value
                          setFormData({...formData, roommates: updated})
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
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
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
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
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
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
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* Documents du colocataire */}
                    <div className="mt-4 p-4 bg-[#F5F3F0] rounded-lg">
                      <h5 className="font-medium text-sm mb-3">Documents du colocataire</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Pièce d'identité
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const updated = [...formData.roommates]
                              updated[index].documents.idCard = e.target.files?.[0]
                              setFormData({...formData, roommates: updated})
                            }}
                            className="w-full text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Justificatif de revenus
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const updated = [...formData.roommates]
                              updated[index].documents.incomeProof = e.target.files?.[0]
                              setFormData({...formData, roommates: updated})
                            }}
                            className="w-full text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situation actuelle *
              </label>
              <select
                value={formData.currentHousingSituation}
                onChange={(e) => setFormData({...formData, currentHousingSituation: e.target.value as any})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
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
                onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => setFormData({...formData, currentCity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={formData.currentZipCode}
                  onChange={(e) => setFormData({...formData, currentZipCode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut professionnel *
              </label>
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
            </div>

            {(formData.professionalStatus === 'EMPLOYEE' || formData.professionalStatus === 'ALTERNANT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'employeur *
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => setFormData({...formData, employerName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenus mensuels nets *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyIncomeNet}
                    onChange={(e) => setFormData({...formData, monthlyIncomeNet: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                    placeholder="En euros"
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
                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                  />
                </div>
              </>
            )}
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Garants</h3>
              {formData.guarantors.length < 2 && (
                <button
                  onClick={addGuarantor}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
                >
                  <Shield className="w-4 h-4" />
                  Ajouter un garant
                </button>
              )}
            </div>

            {formData.guarantors.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun garant ajouté</p>
                <p className="text-sm text-gray-500 mt-1">Vous pouvez ajouter jusqu'à 2 garants</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.guarantors.map((guarantor, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Garant {index + 1}</h4>
                      <button
                        onClick={() => removeGuarantor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Type de garant */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de garant
                        </label>
                        <select
                          value={guarantor.type}
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].type = e.target.value as any
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                        >
                          <option value="INDIVIDUAL">Personne physique</option>
                          <option value="VISALE">Visale</option>
                          <option value="COMPANY">Entreprise</option>
                        </select>
                      </div>

                      {/* Assignation du garant */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Garant pour qui ?
                        </label>
                        <select
                          value={guarantor.assignedTo}
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].assignedTo = e.target.value as any
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                        >
                          <option value="APPLICANT">Demandeur principal</option>
                          {formData.roommates.map((rm, idx) => (
                            <option key={idx} value={`ROOMMATE_${idx + 1}`}>
                              Colocataire {idx + 1}: {rm.firstName || 'Sans nom'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Champs selon le type */}
                      {guarantor.type === 'INDIVIDUAL' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Prénom"
                              value={guarantor.firstName}
                              onChange={(e) => {
                                const updated = [...formData.guarantors]
                                updated[index].firstName = e.target.value
                                setFormData({...formData, guarantors: updated})
                              }}
                              className="px-4 py-3 border border-gray-300 rounded-xl"
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
                              className="px-4 py-3 border border-gray-300 rounded-xl"
                            />
                            
                            <input
                              type="number"
                              placeholder="Revenus mensuels nets (€)"
                              value={guarantor.monthlyIncomeNet}
                              onChange={(e) => {
                                const updated = [...formData.guarantors]
                                updated[index].monthlyIncomeNet = Number(e.target.value)
                                setFormData({...formData, guarantors: updated})
                              }}
                              className="px-4 py-3 border border-gray-300 rounded-xl"
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
                              className="px-4 py-3 border border-gray-300 rounded-xl"
                            />
                          </div>
                        </>
                      )}

                      {guarantor.type === 'COMPANY' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Nom de l'entreprise"
                              value={guarantor.companyName}
                              onChange={(e) => {
                                const updated = [...formData.guarantors]
                                updated[index].companyName = e.target.value
                                setFormData({...formData, guarantors: updated})
                              }}
                              className="px-4 py-3 border border-gray-300 rounded-xl"
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
                              className="px-4 py-3 border border-gray-300 rounded-xl"
                            />
                            
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
                        </>
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
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Documents requis selon votre situation</p>
                  <p>Les documents demandés varient selon votre profil et celui de vos garants.</p>
                </div>
              </div>
            </div>

            {/* Documents du demandeur principal */}
            <div>
              <h4 className="font-semibold mb-4">Vos documents</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pièce d'identité *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData, 
                        documents: {...formData.documents, idCard: e.target.files?.[0]}
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Justificatif de domicile actuel *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData, 
                        documents: {...formData.documents, currentAddressProof: e.target.files?.[0]}
                      })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avis d'imposition N-1 définitif *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData, 
                        documents: {...formData.documents, taxNoticeN1: e.target.files?.[0]}
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avis d'imposition N-2 définitif *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData, 
                        documents: {...formData.documents, taxNoticeN2: e.target.files?.[0]}
                      })}
                      className="w-full"
                    />
                  </div>
                </div>

                {formData.professionalStatus === 'EMPLOYEE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        3 dernières fiches de paie *
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={(e) => setFormData({
                          ...formData, 
                          documents: {...formData.documents, payslips: Array.from(e.target.files || [])}
                        })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contrat de travail *
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFormData({
                          ...formData, 
                          documents: {...formData.documents, workContract: e.target.files?.[0]}
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents des garants */}
            {formData.guarantors.map((guarantor, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">
                  Documents du Garant {index + 1}
                  {guarantor.assignedTo === 'APPLICANT' && ' (pour demandeur principal)'}
                  {guarantor.assignedTo.startsWith('ROOMMATE') && ` (pour colocataire ${guarantor.assignedTo.split('_')[1]})`}
                </h4>
                
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  {guarantor.type === 'INDIVIDUAL' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pièce d'identité *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].documents.idCard = e.target.files?.[0]
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          3 dernières fiches de paie *
                        </label>
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].documents.payslips = Array.from(e.target.files || [])
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avis d'imposition N-1 définitif *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].documents.taxNoticeN1 = e.target.files?.[0]
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avis d'imposition N-2 définitif *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].documents.taxNoticeN2 = e.target.files?.[0]
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {guarantor.type === 'VISALE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attestation Visale *
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const updated = [...formData.guarantors]
                          updated[index].documents.visaleAttestation = e.target.files?.[0]
                          setFormData({...formData, guarantors: updated})
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  {guarantor.type === 'COMPANY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          KBIS *
                        </label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].documents.kbis = e.target.files?.[0]
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bilan comptable *
                        </label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const updated = [...formData.guarantors]
                            updated[index].documents.accountingReport = e.target.files?.[0]
                            setFormData({...formData, guarantors: updated})
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
        
      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-[#F5F3F0] rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Récapitulatif de votre demande</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Chambre demandée</h4>
                  <p className="text-gray-900">{roomName} - {roomPrice}€/mois</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Demandeur principal</h4>
                  <p className="text-gray-900">{formData.firstName} {formData.lastName}</p>
                  <p className="text-gray-700 text-sm">{formData.email}</p>
                </div>
                
                {formData.roommates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Colocataires</h4>
                    {formData.roommates.map((rm, idx) => (
                      <p key={idx} className="text-gray-900">
                        {rm.firstName} {rm.lastName}
                      </p>
                    ))}
                  </div>
                )}
                
                {formData.guarantors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Garants</h4>
                    {formData.guarantors.map((g, idx) => (
                      <div key={idx} className="text-gray-900">
                        <p>
                          Garant {idx + 1}: {g.type === 'INDIVIDUAL' ? `${g.firstName} ${g.lastName}` : 
                                             g.type === 'COMPANY' ? g.companyName : 
                                             'Visale'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Pour: {g.assignedTo === 'APPLICANT' ? 'Demandeur principal' : 
                                g.assignedTo.startsWith('ROOMMATE') ? `Colocataire ${g.assignedTo.split('_')[1]}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Vérifiez vos informations</p>
                  <p>Assurez-vous que toutes les informations sont correctes avant de soumettre votre demande.</p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Prêt à envoyer votre demande !</h3>
              <p className="text-gray-600">
                En soumettant ce formulaire, vous confirmez l'exactitude des informations fournies.
              </p>
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
                  J'accepte les conditions générales d'utilisation et je certifie que toutes les informations 
                  fournies sont exactes et complètes. Je comprends que toute fausse déclaration peut entraîner 
                  le rejet de ma demande.
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
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-black text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-2">Demande de réservation</h2>
              <p className="text-[#F5F3F0]">{roomName} - {roomPrice}€/mois</p>
              
              {/* Progress steps */}
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                      currentStep === step.id
                        ? 'bg-white text-black'
                        : currentStep > step.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Précédent
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.acceptTerms || isSubmitting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                      formData.acceptTerms && !isSubmitting
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Envoyer la demande
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