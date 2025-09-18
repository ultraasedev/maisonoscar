'use client'

import React, { useRef } from 'react'
import { Copy, Plus, Type, List, Bold, Italic, Hash, AlignLeft, AlignCenter, Link } from 'lucide-react'
import { toast } from 'sonner'

interface ContractWYSIWYGEditorProps {
  value: string
  onChange: (value: string) => void
  showVariables?: boolean
}

const ContractWYSIWYGEditor: React.FC<ContractWYSIWYGEditorProps> = ({
  value,
  onChange,
  showVariables = true
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Variables disponibles organisées par catégorie
  const variableCategories = [
    {
      name: 'Bailleur',
      icon: '🏢',
      variables: [
        { key: '{{OWNER_NAME}}', desc: 'Nom du gérant' },
        { key: '{{OWNER_EMAIL}}', desc: 'Email professionnel' },
        { key: '{{OWNER_PHONE}}', desc: 'Téléphone du gérant' },
        { key: '{{OWNER_ADDRESS}}', desc: 'Adresse siège social' },
        { key: '{{SIRET_NUMBER}}', desc: 'Numéro SIRET' }
      ]
    },
    {
      name: 'Locataire',
      icon: '👤',
      variables: [
        { key: '{{TENANT_FIRSTNAME}}', desc: 'Prénom' },
        { key: '{{TENANT_LASTNAME}}', desc: 'Nom de famille' },
        { key: '{{TENANT_EMAIL}}', desc: 'Email personnel' },
        { key: '{{TENANT_PHONE}}', desc: 'Téléphone' },
        { key: '{{TENANT_BIRTHDATE}}', desc: 'Date de naissance' },
        { key: '{{TENANT_PROFESSION}}', desc: 'Profession' },
        { key: '{{TENANT_INCOME}}', desc: 'Revenus (€)' }
      ]
    },
    {
      name: 'Logement',
      icon: '🏠',
      variables: [
        { key: '{{PROPERTY_ADDRESS}}', desc: 'Adresse résidence' },
        { key: '{{ROOM_NAME}}', desc: 'Nom chambre' },
        { key: '{{ROOM_NUMBER}}', desc: 'Numéro chambre' },
        { key: '{{ROOM_SURFACE}}', desc: 'Surface (m²)' },
        { key: '{{TOTAL_SURFACE}}', desc: 'Surface totale (m²)' }
      ]
    },
    {
      name: 'Financier',
      icon: '💰',
      variables: [
        { key: '{{MONTHLY_RENT}}', desc: 'Loyer mensuel (€)' },
        { key: '{{BASE_RENT}}', desc: 'Loyer hors charges (€)' },
        { key: '{{CHARGES}}', desc: 'Charges (€)' },
        { key: '{{SECURITY_DEPOSIT}}', desc: 'Dépôt garantie (€)' }
      ]
    },
    {
      name: 'Dates',
      icon: '📅',
      variables: [
        { key: '{{START_DATE}}', desc: 'Date début' },
        { key: '{{END_DATE}}', desc: 'Date fin' },
        { key: '{{CONTRACT_DATE}}', desc: 'Date signature' },
        { key: '{{CITY}}', desc: 'Ville signature' }
      ]
    },
    {
      name: 'Contact',
      icon: '📞',
      variables: [
        { key: '{{CONTACT_EMAIL}}', desc: 'Email contact' },
        { key: '{{CONTACT_PHONE}}', desc: 'Tél. contact' },
        { key: '{{EMERGENCY_PHONE}}', desc: 'Tél. urgence' },
        { key: '{{WEBSITE_URL}}', desc: 'Site web' }
      ]
    }
  ]

  // Insérer une variable à la position du curseur
  const insertVariable = (variable: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentValue = textarea.value

      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end)
      onChange(newValue)

      // Remettre le focus et positionner le curseur après la variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
    toast.success(`Variable ${variable} insérée`)
  }

  // Fonctions de formatage pour markdown
  const wrapSelection = (prefix: string, suffix: string = '') => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textarea.value.substring(start, end)

      const replacement = prefix + selectedText + (suffix || prefix)
      const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)

      onChange(newValue)

      setTimeout(() => {
        textarea.focus()
        if (selectedText) {
          textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
        } else {
          textarea.setSelectionRange(start + prefix.length, start + prefix.length)
        }
      }, 0)
    }
  }

  // Fonctions de formatage rapide
  const quickFormats = [
    {
      name: 'Titre principal',
      icon: <Hash className="w-4 h-4" />,
      action: () => wrapSelection('# ', '')
    },
    {
      name: 'Sous-titre',
      icon: <Hash className="w-4 h-4" />,
      action: () => wrapSelection('## ', '')
    },
    {
      name: 'Gras',
      icon: <Bold className="w-4 h-4" />,
      action: () => wrapSelection('**')
    },
    {
      name: 'Italique',
      icon: <Italic className="w-4 h-4" />,
      action: () => wrapSelection('*')
    },
    {
      name: 'Centre',
      icon: <AlignCenter className="w-4 h-4" />,
      action: () => {
        if (textareaRef.current) {
          const textarea = textareaRef.current
          const start = textarea.selectionStart
          const currentValue = textarea.value

          // Trouver le début de la ligne
          let lineStart = start
          while (lineStart > 0 && currentValue[lineStart - 1] !== '\n') {
            lineStart--
          }

          const newValue = currentValue.substring(0, lineStart) + '<center>' + currentValue.substring(lineStart)
          onChange(newValue)
        }
      }
    }
  ]

  return (
    <div className="space-y-4">
      {showVariables && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">🎯 Variables rapides</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {variableCategories.map((category) => (
              <div key={category.name} className="space-y-1">
                <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span>{category.icon}</span>
                  {category.name}
                </p>
                <div className="space-y-1">
                  {category.variables.slice(0, 3).map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable.key)}
                      className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      title={variable.desc}
                    >
                      <span className="font-mono text-blue-600">{variable.key}</span>
                    </button>
                  ))}
                  {category.variables.length > 3 && (
                    <p className="text-xs text-gray-400">+{category.variables.length - 3} autres...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre d'outils rapide */}
      <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Formatage rapide :</span>
        {quickFormats.map((format, index) => (
          <button
            key={index}
            onClick={format.action}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title={format.name}
          >
            {format.icon}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={() => {
              insertVariable('[SIGNATURE:ADMIN_SIGNATURE]')
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            + Signature Maison Oscar
          </button>
          <button
            onClick={() => {
              insertVariable('[SIGNATURE:TENANT_SIGNATURE]')
            }}
            className="ml-2 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            + Signature Locataire
          </button>
        </div>
      </div>

      {/* Éditeur de texte amélioré */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={25}
          className="w-full px-4 py-3 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed"
          placeholder="Rédigez votre contrat ici...

Utilisez la syntaxe markdown :
- **texte** pour du gras
- *texte* pour de l'italique
- # Titre pour un titre principal
- ## Sous-titre pour un sous-titre
- <center>texte</center> pour centrer

Insérez des variables avec les boutons ci-dessus."
        />
      </div>

      {/* Signatures */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm font-medium text-amber-800 mb-2">✍️ Emplacements des signatures</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => insertVariable('[SIGNATURE:ADMIN_SIGNATURE]')}
            className="p-2 text-sm bg-white border border-amber-300 rounded hover:bg-amber-50 transition-colors"
          >
            [SIGNATURE:ADMIN_SIGNATURE]
          </button>
          <button
            onClick={() => insertVariable('[SIGNATURE:TENANT_SIGNATURE]')}
            className="p-2 text-sm bg-white border border-amber-300 rounded hover:bg-amber-50 transition-colors"
          >
            [SIGNATURE:TENANT_SIGNATURE]
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
        💡 <strong>Astuces :</strong>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>Utilisez les variables en cliquant dessus - elles seront remplacées par les vraies données</li>
          <li>Sélectionnez du texte puis cliquez sur une action de formatage</li>
          <li>Les signatures sont ajoutées automatiquement lors de la génération du PDF</li>
          <li>Ctrl+Z pour annuler, Ctrl+Y pour refaire</li>
        </ul>
      </div>
    </div>
  )
}

export default ContractWYSIWYGEditor