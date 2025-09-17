'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, Eye, Edit2, X, Save, Download } from 'lucide-react'
import { toast } from 'sonner'
import { generateContractPDF } from '@/lib/pdf-generator'

interface Contract {
  id: string
  name: string
  content: string
  variables: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const defaultContract = `CONTRAT DE LOCATION EN COLIVING

Entre les soussignés :

**Maison Oscar**, représentée par {{ADMIN_NAME}}, en qualité de gestionnaire,
Adresse : {{HOUSE_ADDRESS}}
Ci-après dénommé "le Bailleur"

Et

**{{TENANT_NAME}}**, né(e) le {{TENANT_BIRTHDATE}} à {{TENANT_BIRTHPLACE}}
Demeurant : {{TENANT_ADDRESS}}
Téléphone : {{TENANT_PHONE}}
Email : {{TENANT_EMAIL}}
Ci-après dénommé "le Locataire"

**IL A ÉTÉ CONVENU CE QUI SUIT :**

## Article 1 : OBJET DU CONTRAT
Le Bailleur loue au Locataire la chambre **{{ROOM_NAME}}** (numéro {{ROOM_NUMBER}}) située au {{ROOM_FLOOR}} étage, d'une superficie de {{ROOM_SURFACE}} m².

## Article 2 : DURÉE
Le présent bail est consenti pour une durée de **{{CONTRACT_DURATION}} mois**, à compter du {{START_DATE}}.

## Article 3 : LOYER ET CHARGES
Le loyer mensuel est fixé à **{{MONTHLY_RENT}}€** charges comprises.
Le paiement s'effectue le {{PAYMENT_DAY}} de chaque mois.

## Article 4 : DÉPÔT DE GARANTIE
Un dépôt de garantie de **{{SECURITY_DEPOSIT}}€** est versé à la signature du présent contrat.

## Article 5 : ESPACES COMMUNS
Le Locataire a accès aux espaces communs suivants :
- Cuisine équipée
- Salon
- Salle de bain partagée
- Jardin
- Parking (selon disponibilité)

## Article 6 : RÈGLEMENT INTÉRIEUR
Le Locataire s'engage à respecter le règlement intérieur de la colocation, notamment :
- Respect du calme après 22h
- Entretien régulier de sa chambre et participation au ménage des espaces communs
- Respect des autres colocataires
- Interdiction de fumer dans les espaces intérieurs

## Article 7 : ÉTAT DES LIEUX
Un état des lieux contradictoire sera établi à l'entrée et à la sortie du Locataire.

## Article 8 : RÉSILIATION
Le préavis de résiliation est de **1 mois** pour le Locataire et **3 mois** pour le Bailleur.

Fait à {{CITY}}, le {{CONTRACT_DATE}}
En deux exemplaires originaux

**Le Bailleur**                    **Le Locataire**
{{ADMIN_SIGNATURE}}                {{TENANT_SIGNATURE}}
`

function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [contractContent, setContractContent] = useState('')
  const [contractName, setContractName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = () => {
    // Charger les contrats depuis localStorage (en production, ce serait depuis l'API)
    const savedContracts = localStorage.getItem('contracts')
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts))
    } else {
      // Créer le contrat par défaut
      const defaultContractObj: Contract = {
        id: '1',
        name: 'Contrat Standard Coliving',
        content: defaultContract,
        variables: extractVariables(defaultContract),
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setContracts([defaultContractObj])
      localStorage.setItem('contracts', JSON.stringify([defaultContractObj]))
    }
  }

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([A-Z_]+)\}\}/g
    const variables = new Set<string>()
    let match
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1])
    }
    return Array.from(variables)
  }

  const saveContract = () => {
    if (!contractName.trim()) {
      toast.error('Veuillez donner un nom au contrat')
      return
    }

    const newContract: Contract = {
      id: editingContract?.id || Date.now().toString(),
      name: contractName,
      content: contractContent,
      variables: extractVariables(contractContent),
      isDefault: editingContract?.isDefault || false,
      createdAt: editingContract?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedContracts
    if (editingContract) {
      updatedContracts = contracts.map(c => 
        c.id === editingContract.id ? newContract : c
      )
    } else {
      updatedContracts = [...contracts, newContract]
    }

    setContracts(updatedContracts)
    localStorage.setItem('contracts', JSON.stringify(updatedContracts))
    
    toast.success(editingContract ? 'Contrat modifié' : 'Contrat créé')
    setShowEditor(false)
    setEditingContract(null)
    setContractContent('')
    setContractName('')
  }

  const deleteContract = (id: string) => {
    const contract = contracts.find(c => c.id === id)
    if (contract?.isDefault) {
      toast.error('Impossible de supprimer le contrat par défaut')
      return
    }

    const updatedContracts = contracts.filter(c => c.id !== id)
    setContracts(updatedContracts)
    localStorage.setItem('contracts', JSON.stringify(updatedContracts))
    toast.success('Contrat supprimé')
  }

  const previewContract = (contract: Contract) => {
    setSelectedContract(contract)
    setShowPreview(true)
  }

  const generatePDF = (contract: Contract) => {
    const sampleData = {
      ADMIN_NAME: 'Admin Maison Oscar',
      HOUSE_ADDRESS: '35170 Bruz, France',
      TENANT_NAME: 'Jean Dupont',
      TENANT_BIRTHDATE: '01/01/1995',
      TENANT_BIRTHPLACE: 'Paris',
      TENANT_ADDRESS: '123 Rue de la République, 35000 Rennes',
      TENANT_PHONE: '06 12 34 56 78',
      TENANT_EMAIL: 'jean.dupont@example.com',
      ROOM_NAME: 'Chambre 1',
      ROOM_NUMBER: '1',
      ROOM_FLOOR: '1er',
      ROOM_SURFACE: '15',
      CONTRACT_DURATION: '6',
      START_DATE: new Date().toLocaleDateString('fr-FR'),
      MONTHLY_RENT: '450',
      PAYMENT_DAY: '5',
      SECURITY_DEPOSIT: '450',
      CITY: 'Bruz',
      CONTRACT_DATE: new Date().toLocaleDateString('fr-FR'),
      ADMIN_SIGNATURE: 'Signature Admin',
      TENANT_SIGNATURE: 'Signature Locataire'
    }
    
    try {
      generateContractPDF(contract.content, sampleData, `${contract.name.replace(/\s+/g, '_')}.pdf`)
      toast.success('PDF généré avec succès')
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF')
    }
  }

  const filteredContracts = contracts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes contrats</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gérez vos modèles de contrats de location
              </p>
            </div>
            <button
              onClick={() => {
                setEditingContract(null)
                setContractContent(defaultContract)
                setContractName('')
                setShowEditor(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau contrat
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un contrat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{contract.name}</h3>
                    {contract.isDefault && (
                      <span className="text-xs text-gray-500">Par défaut</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {contract.variables.length} variables
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Modifié le {new Date(contract.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => previewContract(contract)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Aperçu
                </button>
                <button
                  onClick={() => {
                    setEditingContract(contract)
                    setContractContent(contract.content)
                    setContractName(contract.name)
                    setShowEditor(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingContract ? 'Modifier le contrat' : 'Nouveau contrat'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Utilisez {`{{VARIABLE}}`} pour les champs dynamiques
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditor(false)
                  setEditingContract(null)
                  setContractContent('')
                  setContractName('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du contrat
                  </label>
                  <input
                    type="text"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Ex: Contrat Étudiant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu du contrat
                  </label>
                  <textarea
                    value={contractContent}
                    onChange={(e) => setContractContent(e.target.value)}
                    className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="Rédigez votre contrat..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Variables détectées :
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extractVariables(contractContent).map((variable) => (
                      <span
                        key={variable}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditor(false)
                  setEditingContract(null)
                  setContractContent('')
                  setContractName('')
                }}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveContract}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Aperçu : {selectedContract.name}
              </h2>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setSelectedContract(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans">
                  {selectedContract.content}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPreview(false)
                  setSelectedContract(null)
                }}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => generatePDF(selectedContract)}
                  className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContractsPage