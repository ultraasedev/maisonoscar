'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Copy, Type, Palette, Highlighter, Link, Image,
  Plus, Minus, Save, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  showVariables?: boolean
  height?: number
  placeholder?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  showVariables = true,
  height = 600,
  placeholder
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontSizePicker, setShowFontSizePicker] = useState(false)
  const [currentFontSize, setCurrentFontSize] = useState('12')

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
        { key: '{{ROOM_NAME}}', desc: 'Nom de la chambre' },
        { key: '{{ROOM_NUMBER}}', desc: 'Numéro de chambre' },
        { key: '{{ROOM_SURFACE}}', desc: 'Surface (m²)' },
        { key: '{{MONTHLY_RENT}}', desc: 'Loyer mensuel (€)' },
        { key: '{{SECURITY_DEPOSIT}}', desc: 'Dépôt de garantie (€)' }
      ]
    },
    {
      name: 'Dates & Durée',
      icon: '📅',
      variables: [
        { key: '{{START_DATE}}', desc: 'Date de début' },
        { key: '{{END_DATE}}', desc: 'Date de fin' },
        { key: '{{LEASE_DURATION}}', desc: 'Durée en mois' },
        { key: '{{SIGNATURE_DATE}}', desc: 'Date de signature' },
        { key: '{{CONTRACT_DATE}}', desc: 'Date du contrat' }
      ]
    },
    {
      name: 'Contact & Support',
      icon: '📞',
      variables: [
        { key: '{{CONTACT_EMAIL}}', desc: 'Email de contact' },
        { key: '{{CONTACT_PHONE}}', desc: 'Téléphone support' },
        { key: '{{EMERGENCY_PHONE}}', desc: 'Numéro urgence' },
        { key: '{{WEBSITE_URL}}', desc: 'Site web' },
        { key: '{{SUPPORT_HOURS}}', desc: 'Horaires support' }
      ]
    }
  ]

  const fontSizes = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48']
  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' }
  ]

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080',
    '#C0C0C0', '#FFFFFF', '#FF8000', '#8000FF', '#FF0080', '#0080FF', '#80FF00'
  ]

  // Template de contrat professionnel par défaut avec styles CSS intégrés
  const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">

<h1 style="font-size: 24px; font-weight: bold; text-align: center; text-transform: uppercase; margin: 30px 0; padding: 20px 0; border-bottom: 3px solid #000;">CONTRAT DE LOCATION MEUBLÉE</h1>

<h2 style="font-size: 16px; text-align: center; color: #666; margin: 15px 0;">En Colocation - Maison Oscar</h2>

<div style="margin: 40px 0;">
<h3 style="font-size: 18px; font-weight: bold; color: #000; margin: 25px 0 15px 0; padding-left: 15px; border-left: 4px solid #007acc;">PARTIES AU CONTRAT</h3>

<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
<h4 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #495057;">LE BAILLEUR</h4>
<p style="margin: 8px 0;"><strong>Société :</strong> {{OWNER_NAME}}</p>
<p style="margin: 8px 0;"><strong>Adresse :</strong> {{OWNER_ADDRESS}}</p>
<p style="margin: 8px 0;"><strong>Email :</strong> {{OWNER_EMAIL}}</p>
<p style="margin: 8px 0;"><strong>Téléphone :</strong> {{OWNER_PHONE}}</p>
<p style="margin: 8px 0;"><strong>SIRET :</strong> {{SIRET_NUMBER}}</p>
</div>

<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
<h4 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #495057;">LE LOCATAIRE</h4>
<p style="margin: 8px 0;"><strong>Nom :</strong> {{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}</p>
<p style="margin: 8px 0;"><strong>Email :</strong> {{TENANT_EMAIL}}</p>
<p style="margin: 8px 0;"><strong>Téléphone :</strong> {{TENANT_PHONE}}</p>
<p style="margin: 8px 0;"><strong>Date de naissance :</strong> {{TENANT_BIRTHDATE}}</p>
<p style="margin: 8px 0;"><strong>Profession :</strong> {{TENANT_PROFESSION}}</p>
</div>
</div>

<div style="margin: 40px 0;">
<h3 style="font-size: 18px; font-weight: bold; color: #000; margin: 25px 0 15px 0; padding-left: 15px; border-left: 4px solid #28a745;">DÉSIGNATION DU LOGEMENT</h3>

<div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee5eb;">
<p style="margin: 8px 0;"><strong>Adresse :</strong> {{PROPERTY_ADDRESS}}</p>
<p style="margin: 8px 0;"><strong>Chambre :</strong> {{ROOM_NAME}} ({{ROOM_NUMBER}})</p>
<p style="margin: 8px 0;"><strong>Surface :</strong> {{ROOM_SURFACE}} m²</p>
<p style="margin: 8px 0; font-style: italic; color: #666;">Le logement est loué meublé et équipé selon l'inventaire joint au présent contrat.</p>
</div>
</div>

<div style="margin: 40px 0;">
<h3 style="font-size: 18px; font-weight: bold; color: #000; margin: 25px 0 15px 0; padding-left: 15px; border-left: 4px solid #ffc107;">CONDITIONS FINANCIÈRES</h3>

<div style="background-color: #f0f9e8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
<p style="margin: 8px 0;"><strong>Période :</strong> Du {{START_DATE}} au {{END_DATE}}</p>
<p style="margin: 8px 0;"><strong>Durée :</strong> {{LEASE_DURATION}} mois</p>
<p style="margin: 8px 0;"><strong>Loyer mensuel :</strong> {{MONTHLY_RENT}} €</p>
<p style="margin: 8px 0;"><strong>Dépôt de garantie :</strong> {{SECURITY_DEPOSIT}} €</p>
<p style="margin: 8px 0; font-style: italic; color: #666; font-size: 14px;">Charges incluses</p>
</div>
</div>

<div style="margin: 40px 0;">
<h3 style="font-size: 18px; font-weight: bold; color: #000; margin: 25px 0 15px 0; padding-left: 15px; border-left: 4px solid #dc3545;">CONDITIONS GÉNÉRALES</h3>

<h4 style="font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #495057;">Article 1 - Objet du contrat</h4>
<p style="margin: 15px 0; text-align: justify;">Le présent contrat a pour objet la location d'une chambre meublée dans le cadre d'une colocation au sein d'un logement partagé.</p>

<h4 style="font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #495057;">Article 2 - État des lieux</h4>
<p style="margin: 15px 0; text-align: justify;">Un état des lieux contradictoire sera établi lors de la remise des clés et devra être signé par les deux parties.</p>

<h4 style="font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #495057;">Article 3 - Obligations du locataire</h4>
<ul style="margin: 15px 0 15px 30px; padding: 0;">
<li style="margin: 8px 0;">Respecter le règlement intérieur de la colocation</li>
<li style="margin: 8px 0;">Maintenir les lieux en bon état d'entretien</li>
<li style="margin: 8px 0;">Respecter le voisinage et les colocataires</li>
<li style="margin: 8px 0;">S'acquitter du loyer au plus tard le 5 de chaque mois</li>
</ul>
</div>

<div style="margin: 40px 0;">
<h3 style="font-size: 18px; font-weight: bold; color: #000; margin: 25px 0 15px 0; padding-left: 15px; border-left: 4px solid #6f42c1;">CONTACT ET SUPPORT</h3>

<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
<p style="margin: 8px 0;"><strong>Service client :</strong> {{CONTACT_EMAIL}}</p>
<p style="margin: 8px 0;"><strong>Téléphone support :</strong> {{CONTACT_PHONE}}</p>
<p style="margin: 8px 0;"><strong>Urgences :</strong> {{EMERGENCY_PHONE}}</p>
<p style="margin: 8px 0;"><strong>Site web :</strong> {{WEBSITE_URL}}</p>
</div>
</div>

<div style="margin: 60px 0 0 0; padding: 30px 0 0 0; border-top: 2px solid #000; text-align: center;">
<p style="margin: 0 0 40px 0; font-size: 18px; font-weight: bold;">SIGNATURES</p>

<div style="display: flex; justify-content: space-around; margin: 30px 0;">
<div style="text-align: center; width: 45%;">
<p style="margin: 0 0 50px 0; font-weight: bold; font-size: 16px;">LE BAILLEUR</p>
<div style="border-bottom: 2px solid #000; width: 200px; margin: 0 auto;"></div>
<p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Signature et cachet</p>
</div>

<div style="text-align: center; width: 45%;">
<p style="margin: 0 0 50px 0; font-weight: bold; font-size: 16px;">LE LOCATAIRE</p>
<div style="border-bottom: 2px solid #000; width: 200px; margin: 0 auto;"></div>
<p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Signature précédée de "Lu et approuvé"</p>
</div>
</div>

<p style="margin: 30px 0 0 0; font-size: 14px; color: #666; text-align: center;">
<strong>Fait à Bruz, le {{CONTRACT_DATE}}</strong><br>
En deux exemplaires originaux
</p>
</div>

</div>`

  // Force complete visual rendering of HTML content
  const forceVisualDisplay = useCallback(() => {
    if (editorRef.current) {
      const editor = editorRef.current

      // Force browser to interpret and display HTML as visual content
      const content = editor.innerHTML

      // Temporarily clear and reset to force re-rendering
      editor.innerHTML = ''

      // Use setTimeout to ensure DOM is cleared before re-adding content
      setTimeout(() => {
        editor.innerHTML = content

        // Apply comprehensive inline styles to force visual rendering
        const applyVisualStyles = (element: HTMLElement) => {
          element.querySelectorAll('*').forEach((el: Element) => {
            const htmlEl = el as HTMLElement
            const tag = htmlEl.tagName.toLowerCase()

            // Force display: block for block elements
            if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'].includes(tag)) {
              htmlEl.style.display = 'block'
            }

            // Apply specific styling per element type
            switch (tag) {
              case 'h1':
                Object.assign(htmlEl.style, {
                  fontSize: '28px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  margin: '30px 0',
                  paddingBottom: '20px',
                  borderBottom: '3px solid #000',
                  letterSpacing: '2px',
                  display: 'block',
                  width: '100%'
                })
                break
              case 'h2':
                Object.assign(htmlEl.style, {
                  fontSize: '20px',
                  fontWeight: 'normal',
                  color: '#666',
                  textAlign: 'center',
                  margin: '20px 0',
                  display: 'block'
                })
                break
              case 'h3':
                Object.assign(htmlEl.style, {
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#000',
                  margin: '25px 0 15px 0',
                  paddingLeft: '15px',
                  borderLeft: '4px solid #007acc',
                  display: 'block'
                })
                break
              case 'h4':
                Object.assign(htmlEl.style, {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '20px 0 10px 0',
                  color: '#495057',
                  display: 'block'
                })
                break
              case 'p':
                Object.assign(htmlEl.style, {
                  margin: '8px 0',
                  textAlign: 'justify',
                  lineHeight: '1.6',
                  fontSize: '14px',
                  display: 'block'
                })
                break
              case 'strong':
                Object.assign(htmlEl.style, {
                  fontWeight: 'bold',
                  display: 'inline'
                })
                break
              case 'em':
                Object.assign(htmlEl.style, {
                  fontStyle: 'italic',
                  display: 'inline'
                })
                break
              case 'ul':
                Object.assign(htmlEl.style, {
                  marginLeft: '30px',
                  marginBottom: '15px',
                  paddingLeft: '0',
                  display: 'block'
                })
                break
              case 'ol':
                Object.assign(htmlEl.style, {
                  marginLeft: '30px',
                  marginBottom: '15px',
                  paddingLeft: '0',
                  display: 'block'
                })
                break
              case 'li':
                Object.assign(htmlEl.style, {
                  marginBottom: '8px',
                  display: 'list-item',
                  listStylePosition: 'outside'
                })
                break
              case 'div':
                // Handle special div styling based on inline styles
                const currentStyle = htmlEl.getAttribute('style') || ''
                if (currentStyle.includes('background-color')) {
                  Object.assign(htmlEl.style, {
                    padding: '20px',
                    borderRadius: '8px',
                    margin: '20px 0',
                    border: '1px solid #e9ecef',
                    display: 'block'
                  })
                }
                if (currentStyle.includes('text-align: center')) {
                  htmlEl.style.textAlign = 'center'
                }
                if (currentStyle.includes('border-bottom')) {
                  Object.assign(htmlEl.style, {
                    paddingBottom: '10px',
                    marginBottom: '20px'
                  })
                }
                break
            }

            // Force font family and basic styling
            if (!htmlEl.style.fontFamily) {
              htmlEl.style.fontFamily = 'Arial, sans-serif'
            }
          })
        }

        applyVisualStyles(editor)

        // Force a repaint
        editor.style.visibility = 'hidden'
        editor.offsetHeight // Trigger reflow
        editor.style.visibility = 'visible'
      }, 10)
    }
  }, [])

  // Initialisation et synchronisation du contenu
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current

      // Si pas de contenu, utiliser le template par défaut
      if (!value || value.trim() === '' || value === '<p><br></p>') {
        const defaultContent = placeholder || defaultTemplate
        editor.innerHTML = defaultContent
        onChange(defaultContent)
        setTimeout(() => forceVisualDisplay(), 100)
      } else {
        // Mettre à jour seulement si le contenu est différent
        if (editor.innerHTML !== value) {
          editor.innerHTML = value
          setTimeout(() => forceVisualDisplay(), 50)
        }
      }
    }
  }, [value, placeholder, defaultTemplate, onChange, forceVisualDisplay])

  const handleEditorChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
      // Reapply visual formatting after each change
      setTimeout(() => forceVisualDisplay(), 10)
    }
  }, [onChange, forceVisualDisplay])

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleEditorChange()
    // Force reapply styles after command
    setTimeout(() => forceVisualDisplay(), 20)
  }, [handleEditorChange, forceVisualDisplay])

  const insertVariable = useCallback((variable: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(variable))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    handleEditorChange()
    setTimeout(() => forceVisualDisplay(), 15)
    toast.success(`Variable ${variable} insérée`)
  }, [handleEditorChange, forceVisualDisplay])

  const applyHeading = useCallback((level: string) => {
    execCommand('formatBlock', level)
  }, [execCommand])

  const applyFontSize = useCallback((size: string) => {
    // Pour une meilleure compatibilité, on utilise une approche style
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (!range.collapsed) {
        const span = document.createElement('span')
        span.style.fontSize = `${size}pt`
        try {
          range.surroundContents(span)
        } catch {
          // Fallback si surroundContents échoue
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
        }
        handleEditorChange()
        setTimeout(() => forceVisualDisplay(), 25)
      }
    }
    setCurrentFontSize(size)
    setShowFontSizePicker(false)
  }, [handleEditorChange, forceVisualDisplay])

  const applyColor = useCallback((color: string, isBackground = false) => {
    if (isBackground) {
      execCommand('hiliteColor', color)
    } else {
      execCommand('foreColor', color)
    }
    setShowColorPicker(false)
  }, [execCommand])

  const applyFontFamily = useCallback((fontFamily: string) => {
    execCommand('fontName', fontFamily)
  }, [execCommand])

  return (
    <div className="space-y-6 rich-text-editor">
      {/* CSS pour l'affichage correct du HTML dans l'éditeur */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor [contenteditable] {
            font-family: Arial, sans-serif !important;
            line-height: 1.6 !important;
          }
          .rich-text-editor [contenteditable] h1 {
            font-size: 28pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            letter-spacing: 2px !important;
            margin: 20px 0 !important;
            text-align: center !important;
            border-bottom: 3px solid #000 !important;
            padding-bottom: 20px !important;
          }
          .rich-text-editor [contenteditable] h2 {
            font-size: 16pt !important;
            font-weight: normal !important;
            color: #666 !important;
            margin: 10px 0 !important;
            text-align: center !important;
          }
          .rich-text-editor [contenteditable] h3 {
            font-size: 14pt !important;
            font-weight: bold !important;
            color: #000 !important;
            border-left: 4px solid #000 !important;
            padding-left: 15px !important;
            margin: 15px 0 !important;
          }
          .rich-text-editor [contenteditable] h4 {
            font-size: 12pt !important;
            font-weight: bold !important;
            margin: 15px 0 10px 0 !important;
          }
          .rich-text-editor [contenteditable] p {
            margin: 8px 0 !important;
            text-align: justify !important;
          }
          .rich-text-editor [contenteditable] strong {
            font-weight: bold !important;
          }
          .rich-text-editor [contenteditable] em {
            font-style: italic !important;
          }
          .rich-text-editor [contenteditable] ul {
            margin-left: 20px !important;
            margin-bottom: 15px !important;
          }
          .rich-text-editor [contenteditable] li {
            margin-bottom: 8px !important;
          }
          .rich-text-editor [contenteditable] div[style*="background-color"] {
            padding: 15px !important;
            border-radius: 8px !important;
            margin: 10px 0 !important;
          }
          .rich-text-editor [contenteditable] div[style*="border-left"] {
            border-left-width: 4px !important;
            border-left-style: solid !important;
            padding-left: 15px !important;
          }
          .rich-text-editor [contenteditable] div[style*="text-align: center"] {
            text-align: center !important;
          }
          .rich-text-editor [contenteditable] div[style*="display: grid"] {
            display: grid !important;
            gap: 15px !important;
          }
          .rich-text-editor [contenteditable] div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
          .rich-text-editor [contenteditable] a {
            color: #007acc !important;
            text-decoration: none !important;
          }
          .rich-text-editor [contenteditable] a:hover {
            text-decoration: underline !important;
          }
        `
      }} />

      {/* Variables Panel */}
      {showVariables && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Variables disponibles</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {variableCategories.map((category) => (
              <div key={category.name} className="bg-white p-3 rounded-lg border">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
                </h4>
                <div className="space-y-1">
                  {category.variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable.key)}
                      className="w-full text-left p-2 text-xs hover:bg-gray-100 rounded transition-colors border border-gray-200 group"
                      title={`Cliquer pour insérer: ${variable.desc}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-600 text-xs">
                          {variable.key}
                        </span>
                        <Copy className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                      </div>
                      <span className="text-gray-500 text-xs">{variable.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border rounded-lg bg-white">
        <div className="flex flex-wrap items-center gap-1 p-3 border-b">
          {/* Headings */}
          <div className="flex items-center gap-1 mr-4">
            <select
              onChange={(e) => applyHeading(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
              defaultValue=""
            >
              <option value="">Format</option>
              <option value="h1">Titre 1</option>
              <option value="h2">Titre 2</option>
              <option value="h3">Titre 3</option>
              <option value="p">Paragraphe</option>
            </select>
          </div>

          {/* Font Family */}
          <div className="flex items-center gap-1 mr-4">
            <select
              onChange={(e) => applyFontFamily(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="">Police</option>
              {fontFamilies.map((font) => (
                <option key={font.name} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="relative mr-4">
            <button
              onClick={() => setShowFontSizePicker(!showFontSizePicker)}
              className="px-2 py-1 border rounded text-sm flex items-center gap-1"
            >
              <Type className="w-4 h-4" />
              {currentFontSize}pt
            </button>
            {showFontSizePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10 p-2 grid grid-cols-4 gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => applyFontSize(size)}
                    className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  >
                    {size}pt
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formatting */}
          <div className="flex items-center gap-1 mr-4">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Gras"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Italique"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Souligné"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Colors */}
          <div className="relative mr-4">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-100 rounded flex items-center gap-1"
              title="Couleurs"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10 p-3">
                <div className="mb-2 text-xs font-medium">Couleur du texte</div>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => applyColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mb-2 text-xs font-medium">Surlignage</div>
                <div className="grid grid-cols-7 gap-1">
                  {colors.slice(4, 11).map((color) => (
                    <button
                      key={`bg-${color}`}
                      onClick={() => applyColor(color, true)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`Surligner en ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 mr-4">
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Aligner à gauche"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Centrer"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Aligner à droite"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyFull')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Justifier"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Liste à puces"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Liste numérotée"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorChange}
          className="p-6 focus:outline-none"
          style={{
            minHeight: `${height}px`,
            maxHeight: `${height * 1.5}px`,
            overflow: 'auto',
            backgroundColor: '#ffffff',
            border: 'none',
            fontSize: '12pt',
            lineHeight: '1.6',
            fontFamily: 'Arial, sans-serif',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          }}
          suppressContentEditableWarning
        />
      </div>

      {/* Aide rapide */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">💡 Aide rapide</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Titre:</strong> Menu "Format" → Titre 1, 2 ou 3</p>
          <p>• <strong>Taille:</strong> Cliquez sur le bouton de taille pour choisir</p>
          <p>• <strong>Police:</strong> Menu déroulant "Police"</p>
          <p>• <strong>Couleurs:</strong> Bouton palette pour texte et surlignage</p>
          <p>• <strong>Variables:</strong> Cliquez sur une variable ci-dessus pour l'insérer</p>
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor