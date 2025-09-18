'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Euro,
  Users,
  Calendar,
  FileText,
  Download,
  Star,
  Trash2,
  RefreshCw,
  Filter,
  X,
  Clock,
  Settings,
  Loader2,
  AlertTriangle,
  Edit,
  Save,
  Copy,
  Send,
  FileSignature
} from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import ConfirmDeleteModal from '../../../../components/ui/ConfirmDeleteModal'

// Import dynamique de l'éditeur WYSIWYG
const RichTextEditor = dynamic(
  () => import('../../../../components/RichTextEditor'),
  { ssr: false }
)

interface Contract {
  id: string
  contractNumber: string
  booking: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
    room: {
      name: string
      number: number
      price: number
    }
  }
  monthlyRent: number
  deposit: number
  charges: number
  startDate: string
  endDate: string
  status: string
  pdfUrl?: string
  createdAt: string
  signatures: any[]
}

interface ContractTemplate {
  id: string
  name: string
  description?: string
  pdfData: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Configuration des statuts
const statusConfig = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock },
  PENDING: { label: 'En attente signature', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  SENT: { label: 'Envoyé aux locataires', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send },
  SIGNED: { label: 'Signé', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  ACTIVE: { label: 'Bail actif', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  EXPIRED: { label: 'Expiré', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  TERMINATED: { label: 'Résilié', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle }
}

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'contracts'>('templates')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Template editing
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [templateContent, setTemplateContent] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'template' | 'contract', id: string, name: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (activeTab === 'contracts') {
      loadContracts()
    } else {
      loadTemplates()
    }
  }, [activeTab])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contracts')
      const data = await response.json()

      if (data.success) {
        setContracts(data.data || [])
      } else {
        toast.error('Erreur lors du chargement des contrats')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les contrats')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contract-templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.data || [])
      } else {
        toast.error('Erreur lors du chargement des templates')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les templates')
    } finally {
      setLoading(false)
    }
  }

  const deleteContract = async (id: string, contractNumber: string) => {
    setItemToDelete({ type: 'contract', id, name: contractNumber })
    setShowDeleteModal(true)
  }

  const deleteTemplate = async (id: string, name: string) => {
    setItemToDelete({ type: 'template', id, name })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const endpoint = itemToDelete.type === 'template'
        ? `/api/contract-templates/${itemToDelete.id}`
        : `/api/contracts/${itemToDelete.id}`

      const response = await fetch(endpoint, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        toast.success(`${itemToDelete.type === 'template' ? 'Template' : 'Contrat'} supprimé avec succès`)
        if (itemToDelete.type === 'template') {
          loadTemplates()
        } else {
          loadContracts()
        }
        setShowDeleteModal(false)
        setItemToDelete(null)
      } else {
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const setTemplateAsDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/contract-templates/${id}/set-default`, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        toast.success('Template défini comme modèle par défaut')
        loadTemplates()
      } else {
        toast.error(data.error || 'Erreur')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la définition')
    }
  }

  const downloadTemplate = async (template: ContractTemplate) => {
    try {
      console.log('⬇️ [DEBUG] Download template PDF:', template.name)

      // Récupérer la signature admin par défaut
      const signaturesResponse = await fetch('/api/admin-signatures')
      let defaultSignature = null
      if (signaturesResponse.ok) {
        const signaturesData = await signaturesResponse.json()
        if (signaturesData.success) {
          defaultSignature = signaturesData.data.find((sig: any) => sig.isDefault)
        }
      }

      // Import dynamique de jsPDF et de la fonction existante
      const { generateContractPDF } = await import('@/lib/pdf-generator')

      // Préparer les données pour le générateur PDF professionnel
      const mockContractData: { [key: string]: string } = {
        TENANT_FIRSTNAME: '{{TENANT_FIRSTNAME}}',
        TENANT_LASTNAME: '{{TENANT_LASTNAME}}',
        TENANT_EMAIL: '{{TENANT_EMAIL}}',
        TENANT_PHONE: '{{TENANT_PHONE}}',
        TENANT_BIRTHDATE: '{{TENANT_BIRTHDATE}}',
        TENANT_PROFESSION: '{{TENANT_PROFESSION}}',
        TENANT_INCOME: '{{TENANT_INCOME}}',
        OWNER_NAME: '{{OWNER_NAME}}',
        OWNER_EMAIL: '{{OWNER_EMAIL}}',
        OWNER_PHONE: '{{OWNER_PHONE}}',
        OWNER_ADDRESS: '{{OWNER_ADDRESS}}',
        SIRET_NUMBER: '{{SIRET_NUMBER}}',
        PROPERTY_ADDRESS: '{{PROPERTY_ADDRESS}}',
        ROOM_NAME: '{{ROOM_NAME}}',
        ROOM_NUMBER: '{{ROOM_NUMBER}}',
        ROOM_SURFACE: '{{ROOM_SURFACE}}',
        MONTHLY_RENT: '{{MONTHLY_RENT}}',
        SECURITY_DEPOSIT: '{{SECURITY_DEPOSIT}}',
        START_DATE: '{{START_DATE}}',
        END_DATE: '{{END_DATE}}',
        LEASE_DURATION: '{{LEASE_DURATION}}',
        SIGNATURE_DATE: '{{SIGNATURE_DATE}}',
        CONTRACT_DATE: '{{CONTRACT_DATE}}',
        CONTACT_EMAIL: '{{CONTACT_EMAIL}}',
        CONTACT_PHONE: '{{CONTACT_PHONE}}',
        EMERGENCY_PHONE: '{{EMERGENCY_PHONE}}',
        WEBSITE_URL: '{{WEBSITE_URL}}',
        SUPPORT_HOURS: '{{SUPPORT_HOURS}}'
      }

      // Ajouter la signature admin si disponible
      if (defaultSignature) {
        mockContractData['ADMIN_SIGNATURE'] = defaultSignature.signatureData
      }

      // Nettoyer le contenu template des caractères spéciaux et balises HTML
      const cleanedTemplateData = template.pdfData
        // Supprimer toutes les balises HTML
        .replace(/<[^>]*>/g, '')
        // Nettoyer les entités HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        // Supprimer les caractères Unicode problématiques
        .replace(/[\u2018\u2019]/g, "'") // Smart quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
        .replace(/[\u2013\u2014]/g, '-') // En dash, em dash
        .replace(/[\u2026]/g, '...') // Ellipsis
        .replace(/[\u00A0]/g, ' ') // Non-breaking space
        // Nettoyer les caractères de contrôle et spéciaux
        .replace(/[^\x20-\x7E\n\r\t\u00C0-\u017F]/g, '') // Garder seulement ASCII + caractères latins étendus
        // Nettoyer les espaces multiples
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim()

      // Préparer le contenu template avec note explicative en en-tête (sans caractères spéciaux)
      const templateContent = `
========================================
MODELE DE CONTRAT - ${template.name.toUpperCase()}
========================================

PREVISUALISATION DU TEMPLATE
=============================

IMPORTANT: Ce document est un modele de contrat.
Les variables {{VARIABLE}} seront automatiquement remplacees
par les vraies donnees lors de la generation du contrat final.

${defaultSignature ? 'Signature administrateur incluse' : 'Aucune signature admin par defaut definie'}

================================================================

${cleanedTemplateData}

${defaultSignature ? `

================================================================
SIGNATURE ADMINISTRATIVE PAR DEFAUT
================================================================

Pour le bailleur - ${defaultSignature.name}

[SIGNATURE:ADMIN_SIGNATURE]

Signature electronique validee
` : ''}
`

      // Générer le nom de fichier professionnel
      const filename = `template_${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`

      // Utiliser le générateur PDF professionnel existant
      generateContractPDF(templateContent, mockContractData, filename)

      toast.success('Template PDF téléchargé avec succès')

    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error)
      toast.error('Erreur lors de la génération du PDF')
    }
  }

  const previewTemplate = async (template: ContractTemplate) => {
    try {
      console.log('🔍 [DEBUG] Preview template:', template.name)

      // Récupérer la signature admin par défaut
      const signaturesResponse = await fetch('/api/admin-signatures')
      let defaultSignature = null
      if (signaturesResponse.ok) {
        const signaturesData = await signaturesResponse.json()
        if (signaturesData.success) {
          defaultSignature = signaturesData.data.find((sig: any) => sig.isDefault)
        }
      }

      // Nettoyer le contenu template exactement comme pour le PDF
      const cleanedTemplateData = template.pdfData
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u2026]/g, '...')
        .replace(/[\u00A0]/g, ' ')
        .replace(/[^\x20-\x7E\n\r\t\u00C0-\u017F]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim()

      // Générer le même contenu que le PDF
      const pdfContent = `
========================================
MODELE DE CONTRAT - ${template.name.toUpperCase()}
========================================

PREVISUALISATION DU TEMPLATE
=============================

IMPORTANT: Ce document est un modele de contrat.
Les variables {{VARIABLE}} seront automatiquement remplacees
par les vraies donnees lors de la generation du contrat final.

${defaultSignature ? 'Signature administrateur incluse' : 'Aucune signature admin par defaut definie'}

================================================================

${cleanedTemplateData}

${defaultSignature ? `

================================================================
SIGNATURE ADMINISTRATIVE PAR DEFAUT
================================================================

Pour le bailleur - ${defaultSignature.name}

[SIGNATURE:ADMIN_SIGNATURE]

Signature electronique validee
` : ''}
`

      // Créer une nouvelle fenêtre avec le contenu du template
      const previewWindow = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes,resizable=yes')

      if (previewWindow) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Previsualisation PDF - ${template.name}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .pdf-content { box-shadow: none; }
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            color: #333;
            font-size: 11pt;
            line-height: 1.6;
        }

        .pdf-container {
            max-width: 794px; /* A4 width in pixels at 96 DPI */
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            min-height: 1123px; /* A4 height */
        }

        .pdf-content {
            padding: 20px;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
        }

        .pdf-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }

        .pdf-title {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 10px 0;
        }

        .pdf-subtitle {
            font-size: 12pt;
            color: #666;
            margin: 0;
        }

        .content-section {
            margin: 20px 0;
            white-space: pre-wrap;
            font-family: Helvetica, Arial, sans-serif;
        }

        .variable-highlight {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 1px 3px;
            border-radius: 2px;
            font-family: monospace;
            font-size: 10pt;
            color: #856404;
        }

        .signature-area {
            margin-top: 40px;
            padding: 20px;
            border: 1px solid #ccc;
            background: #f9f9f9;
        }

        .signature-image {
            max-width: 200px;
            max-height: 60px;
            border: 1px solid #000;
            margin: 10px 0;
        }

        .actions-bar {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
        }

        .btn {
            display: inline-block;
            padding: 8px 16px;
            margin: 0 5px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
            border: none;
            font-size: 12px;
        }

        .btn-primary {
            background: #007bff;
            color: white;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .preview-note {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 10px;
            margin-bottom: 20px;
            font-size: 10pt;
            color: #1565c0;
        }
    </style>
</head>
<body>
    <div class="actions-bar no-print">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer</button>
        <button class="btn btn-secondary" onclick="window.close()">✕ Fermer</button>
    </div>

    <div class="pdf-container">
        <div class="pdf-content">
            <div class="preview-note">
                <strong>📋 Aperçu PDF identique</strong> - Cette prévisualisation montre exactement ce qui sera généré dans le PDF téléchargé.
            </div>

            <div class="pdf-header">
                <div class="pdf-title">CONTRAT DE LOCATION EN COLOCATION</div>
                <div class="pdf-subtitle">Template: ${template.name}</div>
            </div>

            <div class="content-section">${pdfContent
              .replace(/\{\{([^}]+)\}\}/g, '<span class="variable-highlight">{{$1}}</span>')
              .replace(/\[SIGNATURE:ADMIN_SIGNATURE\]/g, defaultSignature ? `<div class="signature-area"><strong>Signature: ${defaultSignature.name}</strong><br><img src="${defaultSignature.signatureData}" alt="Signature" class="signature-image"><br><small>Signature électronique validée</small></div>` : '<div class="signature-area"><strong>Espace pour signature manuscrite</strong><br>_______________________</div>')
            }</div>
        </div>
    </div>
</body>
</html>`

        previewWindow.document.write(htmlContent)
        previewWindow.document.close()
        previewWindow.focus()
      } else {
        toast.error('Impossible d\'ouvrir la fenêtre de prévisualisation. Vérifiez que les popups ne sont pas bloqués.')
      }
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error)
      toast.error('Erreur lors de la prévisualisation')
    }
  }

  const regeneratePDF = async (id: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}/regenerate-pdf`, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        toast.success('PDF regénéré avec signature admin')
        loadContracts()
      } else {
        toast.error(data.error || 'Erreur')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la regénération')
    }
  }

  const downloadPDF = (contract: Contract) => {
    console.log('⬇️ [DEBUG] Download PDF:', contract.contractNumber, 'PDF URL:', contract.pdfUrl)

    if (!contract.pdfUrl) {
      toast.error('Aucun PDF disponible pour le téléchargement')
      console.log('❌ [DEBUG] No PDF URL found for download')
      return
    }

    try {
      // Si c'est une data URL, convertir en blob pour le téléchargement
      if (contract.pdfUrl.startsWith('data:')) {
        // Vérifier le format de la data URL
        const parts = contract.pdfUrl.split(',')
        if (parts.length !== 2) {
          toast.error('Format de PDF invalide')
          return
        }

        const base64Data = parts[1]

        // Vérifier que les données base64 sont valides
        if (!base64Data || base64Data.length === 0) {
          toast.error('Données PDF corrompues')
          return
        }

        try {
          // Nettoyer la chaîne base64 (supprimer espaces, nouvelles lignes, etc.)
          const cleanBase64 = base64Data.replace(/\s/g, '')

          // Vérifier que c'est bien du base64 valide
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
            console.error('Format base64 invalide:', cleanBase64.substring(0, 100) + '...')
            toast.error('Format de PDF invalide (base64 corrompu)')
            return
          }

          const byteArray = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0))
          const blob = new Blob([byteArray], { type: 'application/pdf' })

          // Créer l'URL pour le téléchargement
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `contrat-${contract.contractNumber}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Nettoyer l'URL
          URL.revokeObjectURL(url)
          toast.success('Téléchargement du PDF démarré')
        } catch (decodeError) {
          console.error('Erreur décodage base64:', decodeError)
          console.error('Données problématiques:', base64Data.substring(0, 200) + '...')
          toast.error('Erreur de décodage du PDF - format corrompu')
        }
      } else {
        // Si c'est une URL normale, télécharger directement
        const link = document.createElement('a')
        link.href = contract.pdfUrl
        link.download = `contrat-${contract.contractNumber}.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Téléchargement du PDF démarré')
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const previewContract = (contract: Contract) => {
    console.log('🔍 [DEBUG] Preview contract:', contract.contractNumber, 'PDF URL:', contract.pdfUrl)

    if (!contract.pdfUrl) {
      toast.error('Aucun PDF disponible pour la prévisualisation')
      console.log('❌ [DEBUG] No PDF URL found for contract')
      return
    }

    try {
      // Si c'est une data URL, créer un blob URL pour l'affichage
      if (contract.pdfUrl.startsWith('data:')) {
        // Vérifier le format de la data URL
        const parts = contract.pdfUrl.split(',')
        if (parts.length !== 2) {
          toast.error('Format de PDF invalide')
          return
        }

        const base64Data = parts[1]

        // Vérifier que les données base64 sont valides
        if (!base64Data || base64Data.length === 0) {
          toast.error('Données PDF corrompues')
          return
        }

        try {
          // Nettoyer la chaîne base64 (supprimer espaces, nouvelles lignes, etc.)
          const cleanBase64 = base64Data.replace(/\s/g, '')

          // Vérifier que c'est bien du base64 valide
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
            console.error('Format base64 invalide:', cleanBase64.substring(0, 100) + '...')
            toast.error('Format de PDF invalide (base64 corrompu)')
            return
          }

          const byteArray = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0))
          const blob = new Blob([byteArray], { type: 'application/pdf' })

          // Créer l'URL pour l'affichage
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank')

          // Nettoyer l'URL après un délai
          setTimeout(() => URL.revokeObjectURL(url), 10000)
          toast.success('Ouverture du contrat dans un nouvel onglet')
        } catch (decodeError) {
          console.error('Erreur décodage base64:', decodeError)
          console.error('Données problématiques:', base64Data.substring(0, 200) + '...')
          toast.error('Erreur de décodage du PDF - format corrompu')
        }
      } else {
        // Si c'est une URL normale, ouvrir directement
        window.open(contract.pdfUrl, '_blank')
        toast.success('Ouverture du contrat dans un nouvel onglet')
      }
    } catch (error) {
      console.error('Erreur prévisualisation:', error)
      toast.error('Erreur lors de la prévisualisation')
    }
  }

  const openTemplateEditor = (template?: ContractTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateName(template.name)
      setTemplateDescription(template.description || '')
      setTemplateContent(template.pdfData)
    } else {
      setEditingTemplate(null)
      setTemplateName('')
      setTemplateDescription('')
      setTemplateContent(`CONTRAT DE COLIVING - LOCATION EN RÉSIDENCE PARTAGÉE
=========================================================

MAISON OSCAR - SOLUTION D'HÉBERGEMENT NOUVELLE GÉNÉRATION

Entre les soussignés :

**LE BAILLEUR - MAISON OSCAR**
Société : Maison Oscar SAS
Représentée par : {{OWNER_NAME}}, en qualité de gérant
Adresse du siège social : {{OWNER_ADDRESS}}
Email professionnel : {{OWNER_EMAIL}}
Téléphone : {{OWNER_PHONE}}
SIRET : {{SIRET_NUMBER}}
Activité : Gestion de résidences en coliving et services associés

**LE COLIVEUR (LOCATAIRE)**
Prénom et Nom : {{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Date de naissance : {{TENANT_BIRTHDATE}}
Lieu de naissance : {{TENANT_BIRTHPLACE}}
Nationalité : {{TENANT_NATIONALITY}}
Situation familiale : {{TENANT_MARITAL_STATUS}}
Adresse personnelle : {{TENANT_ADDRESS}}
Email personnel : {{TENANT_EMAIL}}
Téléphone mobile : {{TENANT_PHONE}}
Activité professionnelle : {{TENANT_PROFESSION}}
Revenus nets mensuels : {{TENANT_INCOME}}€
Pièce d'identité n° : {{IDENTITY_NUMBER}}

**AUTRES COLIVEURS PRÉSENTS**
Les coliveurs suivants occupent également la résidence :
• {{ROOMMATE_1_NAME}} - {{ROOMMATE_1_EMAIL}} - {{ROOMMATE_1_PHONE}}
• {{ROOMMATE_2_NAME}} - {{ROOMMATE_2_EMAIL}} - {{ROOMMATE_2_PHONE}}
• {{ROOMMATE_3_NAME}} - {{ROOMMATE_3_EMAIL}} - {{ROOMMATE_3_PHONE}}
• {{ROOMMATE_4_NAME}} - {{ROOMMATE_4_EMAIL}} - {{ROOMMATE_4_PHONE}}
• {{ROOMMATE_5_NAME}} - {{ROOMMATE_5_EMAIL}} - {{ROOMMATE_5_PHONE}}

====================
PRÉAMBULE - PHILOSOPHIE DU COLIVING
====================

Le coliving est un nouveau mode de vie qui favorise le partage d'espaces, d'expériences et de valeurs entre coliveurs.
Ce contrat encadre une location de courte à moyenne durée dans une résidence entièrement aménagée et gérée par Maison Oscar.

====================
CLAUSES CONTRACTUELLES
====================

## Article 1 : OBJET ET DESCRIPTION DE LA PRESTATION

**1.1 ESPACE PRIVATIF LOUÉ**
Le bailleur met à disposition du coliveur :
- Chambre privée : {{ROOM_NAME}} (n°{{ROOM_NUMBER}})
- Surface privative : {{ROOM_SURFACE}} m²
- Étage : {{ROOM_FLOOR}}
- Équipements : lit, bureau, armoire, éclairage, chauffage individuel
- Accès privatif : serrure individuelle avec badge d'accès

**1.2 RÉSIDENCE ET ESPACES COMMUNS**
Adresse de la résidence : {{PROPERTY_ADDRESS}}
Surface totale : {{TOTAL_SURFACE}} m² répartis sur {{TOTAL_ROOMS}} chambres
Espaces partagés mis à disposition :
• Cuisine entièrement équipée (électroménager, vaisselle, ustensiles)
• Salon/espace détente avec mobilier de qualité
• {{BATHROOM_COUNT}} salle(s) de bain partagée(s)
• {{WC_COUNT}} WC séparé(s)
• Espace extérieur : {{BALCONY_INFO}}
• Services annexes : {{PARKING_INFO}}
• Buanderie avec lave-linge et sèche-linge

**1.3 SERVICES INCLUS MAISON OSCAR**
- Ménage hebdomadaire des espaces communs
- Maintenance et réparations
- Fourniture des produits d'entretien de base
- Accès 24h/24 via application mobile
- Assistance et conciergerie
- Organisation d'événements communautaires
- Wifi haut débit dans toute la résidence

## Article 2 : DURÉE ET RENOUVELLEMENT

**2.1 DURÉE INITIALE**
Bail de {{CONTRACT_DURATION}} mois
Début de la location : {{START_DATE}} à 14h00
Fin de location : {{END_DATE}} à 11h00

**2.2 RENOUVELLEMENT**
Renouvellement tacite par périodes de {{RENEWAL_PERIOD}} mois
Possibilité de négocier une durée différente selon disponibilités

**2.3 FLEXIBILITÉ COLIVING**
Option de départ anticipé avec préavis réduit de {{NOTICE_PERIOD}} mois
Possibilité de changement de chambre au sein du réseau Maison Oscar

## Article 3 : CONDITIONS FINANCIÈRES

**3.1 LOYER MENSUEL TOUT INCLUS**
**Montant total : {{MONTHLY_RENT}}€ TTC par mois**

Répartition détaillée :
• Loyer de base (chambre privée) : {{BASE_RENT}}€
• Charges locatives forfaitaires : {{CHARGES}}€
  - Eau, électricité, chauffage
  - Internet fibre très haut débit
  - Assurance habitation de la résidence
• Services Maison Oscar : {{SERVICE_FEES}}€
  - Ménage espaces communs
  - Maintenance et réparations
  - Conciergerie et assistance
  - Accès application mobile

**3.2 MODALITÉS DE PAIEMENT**
• Échéance : le {{PAYMENT_DAY}} de chaque mois
• Mode de paiement : {{PAYMENT_METHOD}}
• Prélèvement automatique recommandé
• Aucun frais de dossier Maison Oscar

**3.3 DÉPÔT DE GARANTIE**
Montant : {{SECURITY_DEPOSIT}}€ (équivalent à 1 mois de loyer)
Restitution sous 2 mois après état des lieux de sortie
Déduction possible : dégâts, frais de nettoyage, objets manquants

## Article 4 : ÉTAT DES LIEUX ET INVENTAIRE

**4.1 ENTRÉE DANS LES LIEUX**
État des lieux contradictoire le {{INVENTORY_DATE}}
Inventaire détaillé du mobilier et équipements
Remise des clés et badges d'accès
Formation aux équipements et application mobile

**4.2 SORTIE DES LIEUX**
État des lieux de sortie en présence du coliveur
Vérification de l'inventaire et de l'état général
Restitution de tous les accès (clés, badges, télécommandes)

## Article 5 : OBLIGATIONS DU COLIVEUR

**5.1 USAGE ET OCCUPATION**
• Occuper personnellement et paisiblement la chambre
• Utiliser les lieux en bon père de famille
• Respecter la vocation résidentielle des lieux
• Ne pas transformer ou modifier les équipements

**5.2 VIE EN COMMUNAUTÉ**
• Respecter les autres coliveurs et le voisinage
• Maintenir la propreté des espaces communs après usage
• Participer à l'ambiance conviviale de la résidence
• Respecter les horaires de tranquillité (22h-8h)
• Signaler immédiatement tout problème technique

**5.3 ASSURANCE PERSONNELLE**
Souscrire une assurance responsabilité civile personnelle
Fournir l'attestation avant l'entrée dans les lieux

## Article 6 : RÈGLEMENT INTÉRIEUR COLIVING

**6.1 ESPACES COMMUNS**
• Nettoyage immédiat après utilisation de la cuisine
• Respect du planning de ménage collectif
• Interdiction de stocker des affaires personnelles
• Usage modéré des équipements (musique, télé)

**6.2 INVITÉS ET VISITEURS**
• Invités autorisés jusqu'à 22h en semaine, 24h le weekend
• Maximum 2 invités simultanés par coliveur
• Responsabilité du coliveur pour ses invités
• Interdiction d'hébergement de courte durée type Airbnb

**6.3 OBJETS PERSONNELS**
• Étiquetage obligatoire dans réfrigérateur et placards
• Évacuation des objets abandonnés après 7 jours
• Interdiction de monopoliser les espaces communs

**6.4 SÉCURITÉ ET ACCÈS**
• Fermeture systématique de la résidence
• Interdiction de reproduction des clés/badges
• Code d'accès strictement personnel
• Déclaration immédiate de perte/vol d'accès

## Article 7 : SERVICES MAISON OSCAR

**7.1 MAINTENANCE TECHNIQUE**
• Intervention rapide en cas de panne (24-48h)
• Maintenance préventive des équipements
• Remplacement du matériel défaillant
• Hotline technique disponible

**7.2 SERVICES DE CONCIERGERIE**
• Réception de colis et courrier
• Assistance administrative
• Recommandations locales (médecins, commerces)
• Organisation d'événements résidents

**7.3 APPLICATION MOBILE**
• Gestion des accès et codes
• Communication entre coliveurs
• Signalement d'incidents
• Réservation d'espaces ou services

## Article 8 : RÉSILIATION

**8.1 PAR LE COLIVEUR**
• Préavis de {{NOTICE_PERIOD}} mois par lettre recommandée
• Possibilité de préavis réduit (1 mois) sous conditions
• Départ anticipé avec accord Maison Oscar

**8.2 PAR LE BAILLEUR**
• Préavis de 3 mois pour motif légitime et sérieux
• Résiliation immédiate en cas de manquement grave
• Non-respect du règlement intérieur

**8.3 REMISE EN ÉTAT**
• Évacuation complète de la chambre
• Nettoyage selon standards Maison Oscar
• Restitution en parfait état de fonctionnement

## Article 9 : RESPONSABILITÉS ET ASSURANCES

**9.1 RESPONSABILITÉ DU COLIVEUR**
• Dégâts causés dans sa chambre ou espaces communs
• Vols ou dégradations par ses invités
• Troubles de voisinage ou nuisances

**9.2 ASSURANCE HABITATION**
• Assurance de la résidence souscrite par Maison Oscar
• Assurance responsabilité civile obligatoire pour le coliveur
• Assurance des biens personnels recommandée

## Article 10 : CLAUSE RÉSOLUTOIRE

En cas de :
• Non-paiement du loyer après mise en demeure
• Non-respect grave du règlement intérieur
• Troubles persistants à la vie communautaire
• Usage non conforme des lieux

Le présent contrat sera résilié de plein droit après mise en demeure restée sans effet pendant 8 jours.

## Article 11 : MÉDIATION ET LITIGES

**11.1 MÉDIATION AMIABLE**
En cas de différend, les parties s'engagent à rechercher une solution amiable.
Médiation possible via les services de l'ADIL ou tout médiateur agréé.

**11.2 JURIDICTION COMPÉTENTE**
À défaut d'accord amiable, compétence du Tribunal Judiciaire de {{TRIBUNAL_CITY}}.

## Article 12 : SIGNATURES

Fait à {{CITY}}, le {{CONTRACT_DATE}}
En deux exemplaires originaux, chaque partie reconnaissant avoir reçu le sien.

**POUR MAISON OSCAR**                    **LE COLIVEUR**
Le Gérant

[SIGNATURE:ADMIN_SIGNATURE]             [SIGNATURE:TENANT_SIGNATURE]

{{OWNER_NAME}}                          {{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Gérant de Maison Oscar SAS              Coliveur

"Je reconnais avoir pris connaissance du règlement intérieur et l'accepter dans son intégralité"

ANNEXES :
- Règlement intérieur détaillé
- État des lieux d'entrée
- Inventaire du mobilier et équipements
- Guide du coliveur Maison Oscar`)
    }
    setShowTemplateEditor(true)
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Veuillez donner un nom au template')
      return
    }

    try {
      const url = editingTemplate ? `/api/contract-templates/${editingTemplate.id}` : '/api/contract-templates'
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          pdfData: templateContent
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingTemplate ? 'Template modifié' : 'Template créé')
        setShowTemplateEditor(false)
        loadTemplates()
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  // Filtrage des contrats
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.booking.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.booking.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.booking.room.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const contractsStats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    pending: contracts.filter(c => c.status === 'PENDING' || c.status === 'SENT').length,
    signed: contracts.filter(c => c.status === 'SIGNED').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Gestion des Contrats
                    </h1>
                    <p className="text-sm text-gray-600 truncate">
                      {loading ? 'Chargement...' :
                        activeTab === 'templates'
                          ? `${templates.length} template${templates.length > 1 ? 's' : ''} • ${templates.filter(t => t.isDefault).length} par défaut`
                          : `${contractsStats.total} contrat${contractsStats.total > 1 ? 's' : ''} • ${contractsStats.active} actif${contractsStats.active > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 lg:hidden"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                </button>

                <button
                  onClick={activeTab === 'contracts' ? loadContracts : loadTemplates}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>

                {activeTab === 'templates' && (
                  <button
                    onClick={() => openTemplateEditor()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nouveau template</span>
                    <span className="sm:hidden">Nouveau</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'templates'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4" />
                    Contrats Types
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contracts'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contrats Signés
                    {contractsStats.total > 0 && (
                      <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {contractsStats.total}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>

            {/* Stats pour les contrats signés */}
            {activeTab === 'contracts' && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                  </div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{contractsStats.total}</div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Actifs</span>
                  </div>
                  <div className="mt-1 text-xl font-semibold text-emerald-900">{contractsStats.active}</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium text-yellow-600 uppercase tracking-wide">En attente</span>
                  </div>
                  <div className="mt-1 text-xl font-semibold text-yellow-900">{contractsStats.pending}</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Signés</span>
                  </div>
                  <div className="mt-1 text-xl font-semibold text-green-900">{contractsStats.signed}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={`py-4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'templates' ? "Rechercher un template..." : "Rechercher par numéro, nom ou chambre..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {activeTab === 'contracts' && (
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  >
                    <option value="all">Tous les statuts</option>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <option key={status} value={status}>{config.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement...</span>
            </div>
          </div>
        ) : activeTab === 'templates' ? (
          // Templates View
          filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSignature className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {templates.length === 0 ? 'Aucun template de contrat' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-600 mb-6">
                {templates.length === 0
                  ? 'Créez votre premier template de contrat qui sera envoyé aux futurs locataires'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
              {templates.length === 0 && (
                <button
                  onClick={() => openTemplateEditor()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  Créer un template
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileSignature className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {template.name}
                            </h3>
                            {template.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                                <Star className="w-3 h-3" />
                                Défaut
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTemplateEditor(template)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>

                      <button
                        onClick={() => previewTemplate(template)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Prévisualiser le template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => downloadTemplate(template)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        title="Télécharger le template"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {!template.isDefault && (
                        <button
                          onClick={() => setTemplateAsDefault(template.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Définir comme défaut"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteTemplate(template.id, template.name)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          // Contracts View
          filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {contracts.length === 0 ? 'Aucun contrat signé' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-600">
                {contracts.length === 0
                  ? 'Les contrats signés par les locataires apparaîtront ici'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContracts.map((contract, index) => {
                const statusInfo = statusConfig[contract.status as keyof typeof statusConfig] || statusConfig.DRAFT
                const StatusIcon = statusInfo.icon

                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  #{contract.contractNumber}
                                </h3>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusInfo.label}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-600 truncate">
                                    {contract.booking.user.firstName} {contract.booking.user.lastName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-600 truncate">
                                    {contract.booking.room.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Euro className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-600">
                                    {contract.monthlyRent}€/mois
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-600">
                                    {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>

                              {/* Signatures info */}
                              {contract.signatures.length > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-600">
                                    {contract.signatures.length} signature{contract.signatures.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => previewContract(contract)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Prévisualiser le contrat"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Voir</span>
                          </button>

                          {contract.pdfUrl && (
                            <button
                              onClick={() => downloadPDF(contract)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Télécharger le PDF"
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                          )}

                          <button
                            onClick={() => regeneratePDF(contract.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            title="Regénérer PDF avec signature admin"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Regénérer</span>
                          </button>

                          <button
                            onClick={() => deleteContract(contract.id, contract.contractNumber)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer le contrat"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden lg:inline">Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTemplate ? 'Modifier le template' : 'Nouveau template de contrat'}
              </h3>
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ex: Contrat Étudiant, Contrat Professionnel..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Description courte du template..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu du contrat
                </label>
                <RichTextEditor
                  value={templateContent}
                  onChange={setTemplateContent}
                  showVariables={true}
                  height={600}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={`Supprimer ce ${itemToDelete?.type === 'template' ? 'template' : 'contrat'}`}
        description={`Êtes-vous sûr de vouloir supprimer définitivement ce ${itemToDelete?.type === 'template' ? 'template de contrat' : 'contrat'} ? Toutes les données associées seront perdues.`}
        itemName={itemToDelete?.name}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  )
}