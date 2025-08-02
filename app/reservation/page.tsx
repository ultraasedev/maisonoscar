'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Phone,
  Mail,
  FileText,
  Home,
  Shield,
  Clock
} from 'lucide-react';

// Types
interface ReservationForm {
  // Étape 1 - Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  
  // Étape 2 - Sélection logement et dates
  propertyId: string;
  roomType: string;
  startDate: string;
  endDate: string;
  duration: number;
  
  // Étape 3 - Informations complémentaires
  hasGuarantee: boolean;
  guaranteeType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  
  // Étape 4 - Confirmation
  acceptTerms: boolean;
  marketingConsent: boolean;
}

const ReservationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ReservationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: '',
    propertyId: '',
    roomType: '',
    startDate: '',
    endDate: '',
    duration: 1,
    hasGuarantee: false,
    guaranteeType: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    acceptTerms: false,
    marketingConsent: false
  });

  const steps = [
    { number: 1, title: 'Vos informations', icon: User },
    { number: 2, title: 'Logement & Dates', icon: Calendar },
    { number: 3, title: 'Informations complémentaires', icon: FileText },
    { number: 4, title: 'Confirmation', icon: CheckCircle }
  ];

  const updateFormData = (field: keyof ReservationForm | string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ReservationForm] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && 
                 formData.phone && formData.dateOfBirth && formData.occupation);
      case 2:
        return !!(formData.propertyId && formData.roomType && formData.startDate && formData.duration);
      case 3:
        return !!(formData.guaranteeType && formData.emergencyContact.name && 
                 formData.emergencyContact.phone && formData.emergencyContact.relation);
      case 4:
        return formData.acceptTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitReservation = async () => {
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    
    try {
      // Simulation d'une soumission (remplacer par vraie API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Intégrer avec votre API de réservation
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('🎉 Réservation envoyée avec succès ! Nous vous contacterons sous 24h.');
        // Rediriger vers une page de confirmation
        window.location.href = '/confirmation';
      } else {
        throw new Error('Erreur lors de la soumission');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la réservation. Veuillez réessayer ou nous contacter directement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation de chambre
          </h1>
          <p className="text-gray-600">
            Quelques étapes simples pour rejoindre notre communauté
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4 md:space-x-8">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isValid = validateStep(step.number);
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                      isCompleted ? 'bg-green-600 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs md:text-sm font-medium text-center max-w-20 ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          
          {/* Étape 1: Informations personnelles */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Vos informations personnelles
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="Votre nom"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="06 12 34 56 78"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => updateFormData('occupation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="Étudiant, Salarié, Freelance..."
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Étape 2: Logement et dates */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Choix du logement et dates
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logement souhaité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertyId}
                    onChange={(e) => updateFormData('propertyId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Sélectionner un logement</option>
                    <option value="villa-cerisiers">Villa des Cerisiers - Bruz Centre</option>
                    <option value="loft-republique">Loft République - Proche Rennes</option>
                    <option value="maison-belleville">Maison Belleville - Quartier étudiant</option>
                    <option value="residence-moderne">Résidence Moderne - Transport direct</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de chambre <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => updateFormData('roomType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="standard">Chambre Standard - 450€/mois</option>
                    <option value="premium">Chambre Premium - 550€/mois</option>
                    <option value="deluxe">Suite Deluxe - 650€/mois</option>
                    <option value="studio">Studio privé - 750€/mois</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'arrivée souhaitée <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée minimum <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    required
                  >
                    <option value={1}>1 mois (frais d'installation: 150€)</option>
                    <option value={3}>3 mois (frais d'installation: 100€)</option>
                    <option value={6}>6 mois (frais d'installation: 50€)</option>
                    <option value={12}>12 mois (pas de frais d'installation)</option>
                  </select>
                </div>
              </div>

              {/* Informations sur le logement sélectionné */}
              {formData.propertyId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Informations sur le logement</h4>
                  <p className="text-blue-800 text-sm">
                    {formData.propertyId === 'villa-cerisiers' && '4 chambres, 2 salles de bain, jardin, proche transports'}
                    {formData.propertyId === 'loft-republique' && '6 chambres, 3 salles de bain, terrasse, centre-ville'}
                    {formData.propertyId === 'maison-belleville' && '5 chambres, 2 salles de bain, garage vélos, université'}
                    {formData.propertyId === 'residence-moderne' && '8 chambres, 4 salles de bain, salle sport, métro'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Étape 3: Informations complémentaires */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Informations complémentaires
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Garantie locative <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="guarantee"
                        value="personal"
                        checked={formData.guaranteeType === 'personal'}
                        onChange={() => {
                          updateFormData('hasGuarantee', true);
                          updateFormData('guaranteeType', 'personal');
                        }}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-medium">Garant personnel</span>
                        <p className="text-sm text-gray-600">Famille ou proche ayant des revenus suffisants</p>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="guarantee"
                        value="insurance"
                        checked={formData.guaranteeType === 'insurance'}
                        onChange={() => {
                          updateFormData('hasGuarantee', true);
                          updateFormData('guaranteeType', 'insurance');
                        }}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-medium">Assurance loyer impayé</span>
                        <p className="text-sm text-gray-600">Nous vous aiderons à souscrire (environ 3.5% du loyer)</p>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="guarantee"
                        value="deposit"
                        checked={formData.guaranteeType === 'deposit'}
                        onChange={() => {
                          updateFormData('hasGuarantee', true);
                          updateFormData('guaranteeType', 'deposit');
                        }}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-medium">Dépôt de garantie majoré</span>
                        <p className="text-sm text-gray-600">3 mois de loyer au lieu d'1 mois</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact d'urgence</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => updateFormData('emergencyContact.name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="Nom et prénom"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => updateFormData('emergencyContact.phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="06 12 34 56 78"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.emergencyContact.relation}
                        onChange={(e) => updateFormData('emergencyContact.relation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Sélectionner</option>
                        <option value="parent">Parent</option>
                        <option value="conjoint">Conjoint(e)</option>
                        <option value="famille">Famille</option>
                        <option value="ami">Ami(e)</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Étape 4: Confirmation */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Confirmation de votre demande
                </h2>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Récapitulatif de votre réservation</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Nom :</strong> {formData.firstName} {formData.lastName}</div>
                  <div><strong>Email :</strong> {formData.email}</div>
                  <div><strong>Téléphone :</strong> {formData.phone}</div>
                  <div><strong>Profession :</strong> {formData.occupation}</div>
                  <div><strong>Logement :</strong> {formData.propertyId}</div>
                  <div><strong>Type de chambre :</strong> {formData.roomType}</div>
                  <div><strong>Date d'arrivée :</strong> {formData.startDate}</div>
                  <div><strong>Durée :</strong> {formData.duration} mois</div>
                  <div><strong>Garantie :</strong> {formData.guaranteeType}</div>
                  <div><strong>Contact d'urgence :</strong> {formData.emergencyContact.name}</div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    J'accepte les <a href="/conditions" className="text-blue-600 hover:underline font-medium">conditions générales</a> et la <a href="/confidentialite" className="text-blue-600 hover:underline font-medium">politique de confidentialité</a> <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    Je souhaite recevoir les actualités et offres spéciales de Maison Oscar
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Nous étudierons votre dossier sous 24h ouvrées</li>
                      <li>• Nous vous contacterons pour organiser une visite</li>
                      <li>• Signature du contrat et remise des clés</li>
                      <li>• Intégration dans la communauté Maison Oscar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  !validateStep(currentStep)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitReservation}
                disabled={!formData.acceptTerms || isLoading}
                className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all ${
                  !formData.acceptTerms || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Envoyer ma demande</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;