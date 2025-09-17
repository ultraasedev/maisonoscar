'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Plus, Edit2, Download, Send, Search, 
  Calendar, User, Euro, Eye, Check, Clock, X,
  FileSignature, AlertCircle, Copy, Trash2, Save,
  Code, Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { SignaturePad } from '@/components/signature/SignaturePad'

interface ContractTemplate {
  id: string
  name: string
  description?: string
  content: string
  variables: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface Contract {
  id: string
  contractNumber: string
  booking: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
      phone?: string
    }
    room: {
      name: string
      number: number
      price: number
      surface: number
      floor: number
    }
  }
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  charges: number
  status: 'DRAFT' | 'PENDING' | 'SIGNED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  pdfUrl?: string
  signedAt?: string
  signatures: Array<{
    id: string
    signerName: string
    signerEmail: string
    signerRole: 'TENANT' | 'GUARANTOR' | 'LANDLORD'
    signedAt: string
  }>
  createdAt: string
  updatedAt: string
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  SIGNED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-red-100 text-red-700',
  TERMINATED: 'bg-orange-100 text-orange-700'
}

const statusLabels = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  SIGNED: 'Signé',
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  TERMINATED: 'Résilié'
}

const defaultTemplateContent = `CONTRAT DE LOCATION EN COLOCATION
=====================================

Entre les soussignés :

**LE BAILLEUR**
{{OWNER_NAME}}
Adresse : {{OWNER_ADDRESS}}
Email : {{OWNER_EMAIL}}
Téléphone : {{OWNER_PHONE}}

ET

**LE LOCATAIRE**
{{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Né(e) le {{TENANT_BIRTHDATE}} à {{TENANT_BIRTHPLACE}}
Adresse actuelle : {{TENANT_ADDRESS}}
Email : {{TENANT_EMAIL}}
Téléphone : {{TENANT_PHONE}}

IL A ÉTÉ CONVENU CE QUI SUIT :

## ARTICLE 1 - OBJET DU CONTRAT
Le bailleur loue au locataire la chambre suivante :
- Désignation : {{ROOM_NAME}} (Chambre n°{{ROOM_NUMBER}})
- Surface : {{ROOM_SURFACE}} m²
- Étage : {{ROOM_FLOOR}}
- Adresse : {{HOUSE_ADDRESS}}

## ARTICLE 2 - DURÉE DU BAIL
Le présent bail est consenti pour une durée de {{CONTRACT_DURATION}} mois.
Date de début : {{START_DATE}}
Date de fin : {{END_DATE}}

## ARTICLE 3 - LOYER ET CHARGES
Loyer mensuel : {{MONTHLY_RENT}} € charges comprises
Détail :
- Loyer hors charges : {{BASE_RENT}} €
- Charges : {{CHARGES}} € (eau, électricité, chauffage, internet)

Le loyer est payable mensuellement, d'avance, le {{PAYMENT_DAY}} de chaque mois.

## ARTICLE 4 - DÉPÔT DE GARANTIE
Un dépôt de garantie de {{SECURITY_DEPOSIT}} € est versé à la signature du présent contrat.
Il sera restitué dans un délai maximum de 2 mois après la remise des clés, déduction faite des éventuelles réparations.

## ARTICLE 5 - ESPACES COMMUNS
Le locataire a accès aux espaces communs suivants :
- Cuisine équipée
- Salon
- Salle de bain
- Jardin
- Parking

## ARTICLE 6 - OBLIGATIONS DU LOCATAIRE
Le locataire s'engage à :
- Payer le loyer aux termes convenus
- User paisiblement des locaux
- Respecter le règlement intérieur
- Maintenir les lieux en bon état
- Souscrire une assurance habitation

## ARTICLE 7 - OBLIGATIONS DU BAILLEUR
Le bailleur s'engage à :
- Délivrer un logement décent
- Assurer la jouissance paisible du logement
- Entretenir les locaux
- Effectuer les réparations nécessaires

## ARTICLE 8 - RÉSILIATION
Le préavis est de :
- 1 mois pour le locataire
- 3 mois pour le bailleur

Fait à {{CITY}}, le {{SIGNATURE_DATE}}

**Signatures :**

Le Bailleur                    Le Locataire
(signature)                     (signature)
`

export default function ContractsContent() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'templates'>('contracts')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  
  // Template form
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    content: defaultTemplateContent,
    isDefault: false
  })

  useEffect(() => {
    if (activeTab === 'contracts') {
      fetchContracts()
    } else {
      fetchTemplates()
    }
  }, [activeTab])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contracts')
      const data = await response.json()
      
      if (data.success) {
        setContracts(data.data || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des contrats')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contracts/templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async () => {
    try {
      const url = isEditingTemplate && selectedTemplate 
        ? `/api/contracts/templates/${selectedTemplate.id}`
        : '/api/contracts/templates'
      
      const method = isEditingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(isEditingTemplate ? 'Template modifié' : 'Template créé')
        setIsTemplateModalOpen(false)
        setIsEditingTemplate(false)
        setSelectedTemplate(null)
        setTemplateForm({
          name: '',
          description: '',
          content: defaultTemplateContent,
          isDefault: false
        })
        fetchTemplates()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return
    
    try {
      const response = await fetch(`/api/contracts/templates/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Template supprimé')
        fetchTemplates()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const generateContractFromTemplate = async (bookingId: string, templateId: string) => {
    try {
      const response = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, templateId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Contrat généré avec succès')
        setActiveTab('contracts')
        fetchContracts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la génération du contrat')
    }
  }

  const sendContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/send`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Contrat envoyé au locataire')
        fetchContracts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du contrat')
    }
  }

  const handleSign = async (signatureDataUrl: string) => {
    if (!selectedContract) return
    
    try {
      const response = await fetch('/api/contracts/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          signatureDataUrl,
          signerName: 'Admin',
          signerEmail: 'admin@maisonoscar.fr',
          signerRole: 'LANDLORD'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Contrat signé avec succès')
        setIsSignatureModalOpen(false)
        fetchContracts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la signature')
    }
  }

  const extractVariables = (content: string) => {
    const regex = /{{(\w+)}}/g
    const variables = new Set<string>()
    let match
    
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1])
    }
    
    return Array.from(variables)
  }

  const openEditTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template)
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      content: template.content,
      isDefault: template.isDefault
    })
    setIsEditingTemplate(true)
    setIsTemplateModalOpen(true)
  }

  const openNewTemplate = () => {
    setSelectedTemplate(null)
    setTemplateForm({
      name: '',
      description: '',
      content: defaultTemplateContent,
      isDefault: false
    })
    setIsEditingTemplate(false)
    setIsTemplateModalOpen(true)
  }

  const filteredContracts = contracts.filter(contract => 
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.booking.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.booking.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.booking.room.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Gestion des Contrats
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'contracts' 
                  ? `${contracts.length} contrat${contracts.length > 1 ? 's' : ''}`
                  : `${templates.length} template${templates.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
            
            {activeTab === 'templates' && (
              <button 
                onClick={openNewTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                Nouveau template
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'contracts'
                  ? 'text-black border-black'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Contrats
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'templates'
                  ? 'text-black border-black'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Templates
            </button>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'contracts' 
                  ? "Rechercher par nom, numéro ou chambre..."
                  : "Rechercher un template..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              Chargement...
            </div>
          </div>
        ) : activeTab === 'contracts' ? (
          // Contracts List
          filteredContracts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun contrat trouvé
              </h3>
              <p className="text-gray-600">
                Créez un nouveau contrat depuis une réservation confirmée
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredContracts.map((contract) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Contrat #{contract.contractNumber}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
                              {statusLabels[contract.status]}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Locataire:</span>
                              <p className="font-medium">
                                {contract.booking.user.firstName} {contract.booking.user.lastName}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Chambre:</span>
                              <p className="font-medium">{contract.booking.room.name}</p>
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Période:</span>
                              <p className="font-medium">
                                {new Date(contract.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - 
                                {new Date(contract.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Loyer:</span>
                              <p className="font-medium">{contract.monthlyRent}€/mois</p>
                            </div>
                          </div>

                          {/* Signatures */}
                          {contract.signatures.length > 0 && (
                            <div className="mt-4 flex items-center gap-4 text-sm">
                              <span className="text-gray-500">Signatures:</span>
                              {contract.signatures.map((sig) => (
                                <div key={sig.id} className="flex items-center gap-1">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-700">
                                    {sig.signerRole === 'TENANT' ? 'Locataire' : 
                                     sig.signerRole === 'GUARANTOR' ? 'Garant' : 'Bailleur'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {contract.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => sendContract(contract.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Envoyer au locataire"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedContract(contract)
                              setIsSignatureModalOpen(true)
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Signer"
                          >
                            <FileSignature className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {contract.pdfUrl && (
                        <button
                          onClick={() => window.open(contract.pdfUrl, '_blank')}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Télécharger PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          // Templates List
          filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun template trouvé
              </h3>
              <button 
                onClick={openNewTemplate}
                className="mt-4 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
              >
                Créer un template
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Code className="w-6 h-6 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {template.name}
                            </h3>
                            {template.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Par défaut
                              </span>
                            )}
                          </div>
                          
                          {template.description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {template.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {template.variables.slice(0, 5).map(variable => (
                              <span 
                                key={variable}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                              >
                                {`{{${variable}}}`}
                              </span>
                            ))}
                            {template.variables.length > 5 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{template.variables.length - 5} autres
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          const newTemplate = { ...template, id: '', name: `${template.name} (Copie)` }
                          openEditTemplate(newTemplate as ContractTemplate)
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Dupliquer"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      
                      {!template.isDefault && (
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {isEditingTemplate ? 'Modifier le template' : 'Nouveau template'}
                </h2>
                <button
                  onClick={() => {
                    setIsTemplateModalOpen(false)
                    setIsEditingTemplate(false)
                    setSelectedTemplate(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Ex: Contrat de location standard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Description du template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu du template *
                  </label>
                  <div className="mb-2 text-xs text-gray-500">
                    Utilisez des variables entre doubles accolades: {`{{VARIABLE_NAME}}`}
                  </div>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    rows={20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateForm.isDefault}
                      onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Définir comme template par défaut
                    </span>
                  </label>
                </div>

                {/* Variables détectées */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Variables détectées ({extractVariables(templateForm.content).length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extractVariables(templateForm.content).map(variable => (
                      <span 
                        key={variable}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsTemplateModalOpen(false)
                    setIsEditingTemplate(false)
                    setSelectedTemplate(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditingTemplate ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {isSignatureModalOpen && selectedContract && (
        <SignaturePad
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSign={handleSign}
          signerName="Administrateur"
          documentTitle={`Contrat #${selectedContract.contractNumber}`}
        />
      )}
    </div>
  )
}