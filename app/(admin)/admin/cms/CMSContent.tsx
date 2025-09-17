'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, FileText, Users, Building2, Globe, 
  Save, RefreshCw, Plus, Edit2, Trash2, Eye,
  Facebook, Instagram, Linkedin, Twitter, Mail,
  Phone, MapPin, Clock, ChevronRight, AlertCircle,
  Loader2, Check, X, Upload, Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'

interface TabItem {
  id: string
  title: string
  icon: any
}

interface ContentSections {
  hero: {
    title?: string
    subtitle?: string
    buttonText?: string
    secondaryButtonText?: string
  }
  problemSolution: {
    title?: string
    problemTitle?: string
    problemDescription?: string
    problemPoints?: string[]
    solutionTitle?: string
    solutionDescription?: string
    solutionPoints?: string[]
  }
  house: {
    title?: string
    description?: string
    features?: Array<{ title: string; description: string }>
    address?: string
    images?: string[]
  }
  rooms: {
    title?: string
    description?: string
    buttonText?: string
  }
  footer: {
    description?: string
    copyright?: string
    quickLinks?: Array<{ label: string; href: string }>
  }
  commonSpaces?: any
}

const tabs: TabItem[] = [
  { id: 'general', title: 'Général', icon: Settings },
  { id: 'content', title: 'Contenu', icon: FileText },
  { id: 'legal', title: 'Juridique', icon: Building2 },
  { id: 'mentions', title: 'Mentions légales', icon: FileText },
  { id: 'social', title: 'Réseaux', icon: Globe },
  { id: 'testimonials', title: 'Témoignages', icon: Users }
]

export default function CMSContent() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // États pour les différentes sections
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    metaTitle: '',
    metaDescription: '',
    contactEmail: '',
    adminEmail: '',
    logoUrl: '',
    faviconUrl: ''
  })
  
  const [legalConfig, setLegalConfig] = useState<{
    legalType: string;
    owners: any[];
    companyName: string;
    tradeName: string;
    siret: string;
    capital: number;
    legalForm: string;
  }>({
    legalType: 'INDIVIDUAL',
    owners: [],
    companyName: '',
    tradeName: '',
    siret: '',
    capital: 0,
    legalForm: ''
  })
  
  const [socialLinks, setSocialLinks] = useState({
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: ''
  })
  
  const [mentionsLegales, setMentionsLegales] = useState<{
    id?: string;
    title: string;
    content: string;
    slug: string;
  }>({
    title: 'Mentions légales',
    content: '',
    slug: 'mentions-legales'
  })
  
  const [contentSections, setContentSections] = useState<ContentSections>({
    hero: {},
    problemSolution: {},
    house: {},
    rooms: {},
    footer: {},
    commonSpaces: {}
  })
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [editingContent, setEditingContent] = useState<any>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null)
  const [showContentModal, setShowContentModal] = useState(false)
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)
  
  // Charger les données au montage
  useEffect(() => {
    loadAllData()
  }, [])
  
  const loadAllData = async () => {
    setLoading(true)
    try {
      // Charger les paramètres du site
      const settingsRes = await fetch('/api/cms/settings')
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        if (settingsData.success) {
          setSiteSettings(settingsData.data)
          setSocialLinks({
            facebookUrl: settingsData.data.facebookUrl || '',
            instagramUrl: settingsData.data.instagramUrl || '',
            linkedinUrl: settingsData.data.linkedinUrl || '',
            twitterUrl: settingsData.data.twitterUrl || ''
          })
        }
      }
      
      // Charger la configuration juridique
      const legalRes = await fetch('/api/cms/legal-config')
      if (legalRes.ok) {
        const legalData = await legalRes.json()
        if (legalData.success) {
          setLegalConfig(legalData.data)
        }
      }
      
      // Charger les mentions légales
      const mentionsRes = await fetch('/api/cms/legal-pages?pageType=mentions-legales')
      if (mentionsRes.ok) {
        const mentionsData = await mentionsRes.json()
        if (mentionsData.success && mentionsData.data) {
          setMentionsLegales(mentionsData.data)
        }
      }
      
      // Charger les sections de contenu
      const sectionsRes = await fetch('/api/cms/sections')
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        if (sectionsData.success) {
          setContentSections(sectionsData.data)
        }
      }
      
      // Charger les témoignages
      const testimonialsRes = await fetch('/api/cms/testimonials')
      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json()
        if (testimonialsData.success) {
          setTestimonials(testimonialsData.data)
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...siteSettings,
          ...socialLinks
        })
      })
      
      if (response.ok) {
        toast.success('Paramètres généraux sauvegardés')
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveLegal = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/cms/legal-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legalConfig)
      })
      
      if (response.ok) {
        toast.success('Configuration juridique sauvegardée')
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveContent = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentSections)
      })
      
      if (response.ok) {
        toast.success('Contenu sauvegardé avec succès')
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMentions = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/cms/legal-pages?pageType=mentions-legales`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mentionsLegales.title,
          content: mentionsLegales.content,
          isActive: true
        })
      })
      
      if (response.ok) {
        toast.success('Mentions légales sauvegardées')
        const data = await response.json()
        if (data.data) {
          setMentionsLegales(data.data)
        }
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveTestimonial = async () => {
    setSaving(true)
    try {
      const method = editingTestimonial?.id ? 'PUT' : 'POST'
      const url = editingTestimonial?.id 
        ? `/api/cms/testimonials/${editingTestimonial.id}`
        : '/api/cms/testimonials'
        
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTestimonial)
      })
      
      if (response.ok) {
        toast.success(editingTestimonial?.id ? 'Témoignage modifié' : 'Témoignage ajouté')
        setShowTestimonialModal(false)
        setEditingTestimonial(null)
        
        // Recharger les témoignages
        const testimonialsRes = await fetch('/api/cms/testimonials')
        const testimonialsData = await testimonialsRes.json()
        if (testimonialsData.success) {
          setTestimonials(testimonialsData.data)
        }
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }
  
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return
    
    try {
      const response = await fetch(`/api/cms/testimonials/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Témoignage supprimé')
        setTestimonials(prev => prev.filter(t => t.id !== id))
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre SEO
                  </label>
                  <input
                    type="text"
                    value={siteSettings.metaTitle}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description SEO
                  </label>
                  <textarea
                    value={siteSettings.metaDescription}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email admin
                    </label>
                    <input
                      type="email"
                      value={siteSettings.adminEmail}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Logo et favicon */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Logo et favicon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    {siteSettings.logoUrl ? (
                      <img src={siteSettings.logoUrl} alt="Logo" className="mx-auto h-20" />
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Cliquer pour uploader</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    {siteSettings.faviconUrl ? (
                      <img src={siteSettings.faviconUrl} alt="Favicon" className="mx-auto h-12" />
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Cliquer pour uploader</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder
              </button>
            </div>
          </div>
        )
        
      case 'legal':
        return (
          <div className="space-y-6">
            {/* Type de structure */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Structure juridique</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de structure
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLegalConfig(prev => ({ ...prev, legalType: 'INDIVIDUAL' }))}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        legalConfig.legalType === 'INDIVIDUAL'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Nom propre
                    </button>
                    <button
                      onClick={() => setLegalConfig(prev => ({ ...prev, legalType: 'COMPANY' }))}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        legalConfig.legalType === 'COMPANY'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Entreprise
                    </button>
                  </div>
                </div>
                
                {legalConfig.legalType === 'COMPANY' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'entreprise *
                      </label>
                      <input
                        type="text"
                        value={legalConfig.companyName}
                        onChange={(e) => setLegalConfig(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forme juridique
                        </label>
                        <select
                          value={legalConfig.legalForm}
                          onChange={(e) => setLegalConfig(prev => ({ ...prev, legalForm: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="">Sélectionner</option>
                          <option value="SARL">SARL</option>
                          <option value="SAS">SAS</option>
                          <option value="SCI">SCI</option>
                          <option value="EURL">EURL</option>
                          <option value="SASU">SASU</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capital social (€)
                        </label>
                        <input
                          type="number"
                          value={legalConfig.capital}
                          onChange={(e) => setLegalConfig(prev => ({ ...prev, capital: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SIRET *
                      </label>
                      <input
                        type="text"
                        value={legalConfig.siret}
                        onChange={(e) => setLegalConfig(prev => ({ ...prev, siret: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="123 456 789 00012"
                      />
                    </div>
                  </>
                )}
                
                {legalConfig.legalType === 'INDIVIDUAL' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Propriétaires
                      </label>
                      <button
                        onClick={() => {
                          const newOwner = {
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: ''
                          }
                          setLegalConfig(prev => ({
                            ...prev,
                            owners: [...(prev.owners || []), newOwner]
                          }))
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        Ajouter
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(legalConfig.owners || []).map((owner: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={owner.firstName}
                              onChange={(e) => {
                                const newOwners = [...(legalConfig.owners || [])]
                                newOwners[index] = { ...newOwners[index], firstName: e.target.value }
                                setLegalConfig(prev => ({ ...prev, owners: newOwners }))
                              }}
                              placeholder="Prénom"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="text"
                              value={owner.lastName}
                              onChange={(e) => {
                                const newOwners = [...(legalConfig.owners || [])]
                                newOwners[index] = { ...newOwners[index], lastName: e.target.value }
                                setLegalConfig(prev => ({ ...prev, owners: newOwners }))
                              }}
                              placeholder="Nom"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="email"
                              value={owner.email || ''}
                              onChange={(e) => {
                                const newOwners = [...(legalConfig.owners || [])]
                                newOwners[index] = { ...newOwners[index], email: e.target.value }
                                setLegalConfig(prev => ({ ...prev, owners: newOwners }))
                              }}
                              placeholder="Email (optionnel)"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="tel"
                              value={owner.phone || ''}
                              onChange={(e) => {
                                const newOwners = [...(legalConfig.owners || [])]
                                newOwners[index] = { ...newOwners[index], phone: e.target.value }
                                setLegalConfig(prev => ({ ...prev, owners: newOwners }))
                              }}
                              placeholder="Téléphone (optionnel)"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => {
                                const newOwners = legalConfig.owners?.filter((_, i) => i !== index) || []
                                setLegalConfig(prev => ({ ...prev, owners: newOwners }))
                              }}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveLegal}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder
              </button>
            </div>
          </div>
        )
        
      case 'mentions':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Éditer les mentions légales</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la page
                  </label>
                  <input
                    type="text"
                    value={mentionsLegales.title}
                    onChange={(e) => setMentionsLegales(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Mentions légales"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu HTML
                  </label>
                  <div className="mb-2 text-xs text-gray-500">
                    Vous pouvez utiliser du HTML pour formater le contenu (h2, p, strong, ul, li, etc.)
                  </div>
                  <textarea
                    value={mentionsLegales.content}
                    onChange={(e) => setMentionsLegales(prev => ({ ...prev, content: e.target.value }))}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="<h2>1. Informations légales</h2>..."
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Astuce :</strong> Les variables suivantes seront automatiquement remplacées :
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Les contacts (email, téléphone, adresse) depuis les paramètres</li>
                    <li>• La date de dernière mise à jour</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveMentions}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder les mentions légales
              </button>
            </div>
          </div>
        )
        
      case 'content':
        return (
          <div className="space-y-6">
            {/* Section Hero */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Section Hero</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre principal
                  </label>
                  <input
                    type="text"
                    value={contentSections.hero?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Bienvenue à la Maison Oscar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-titre
                  </label>
                  <textarea
                    value={contentSections.hero?.subtitle || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="La colocation étudiante nouvelle génération à Bruz"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du bouton principal
                  </label>
                  <input
                    type="text"
                    value={contentSections.hero?.buttonText || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      hero: { ...prev.hero, buttonText: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Découvrir les chambres"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du bouton secondaire
                  </label>
                  <input
                    type="text"
                    value={contentSections.hero?.secondaryButtonText || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      hero: { ...prev.hero, secondaryButtonText: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="En savoir plus"
                  />
                </div>
              </div>
            </div>
            
            {/* Section Problème/Solution */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Section Problème/Solution</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la section
                  </label>
                  <input
                    type="text"
                    value={contentSections.problemSolution?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="La colocation réinventée"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du problème
                  </label>
                  <input
                    type="text"
                    value={contentSections.problemSolution?.problemTitle || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, problemTitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Logement étudiant : le parcours du combattant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description du problème
                  </label>
                  <textarea
                    value={contentSections.problemSolution?.problemDescription || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, problemDescription: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Trouver un logement étudiant est souvent compliqué..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points du problème (un par ligne)
                  </label>
                  <textarea
                    value={contentSections.problemSolution?.problemPoints?.join('\n') || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { 
                        ...prev.problemSolution, 
                        problemPoints: e.target.value.split('\n').filter(p => p.trim())
                      }
                    }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Prix élevés&#10;Logements vétustes&#10;Propriétaires peu disponibles&#10;Démarches complexes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la solution
                  </label>
                  <input
                    type="text"
                    value={contentSections.problemSolution?.solutionTitle || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, solutionTitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="La Maison Oscar : votre nouveau chez-vous"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description de la solution
                  </label>
                  <textarea
                    value={contentSections.problemSolution?.solutionDescription || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, solutionDescription: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Une maison pensée pour les étudiants..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points de la solution (un par ligne)
                  </label>
                  <textarea
                    value={contentSections.problemSolution?.solutionPoints?.join('\n') || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { 
                        ...prev.problemSolution, 
                        solutionPoints: e.target.value.split('\n').filter(p => p.trim())
                      }
                    }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Chambres tout équipées&#10;Prix tout inclus transparent&#10;Propriétaire disponible et réactif&#10;Communauté bienveillante"
                  />
                </div>
              </div>
            </div>
            
            {/* Section Maison */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Section Maison</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la section
                  </label>
                  <input
                    type="text"
                    value={contentSections.house?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { ...prev.house, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Une maison d'exception"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={contentSections.house?.description || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { ...prev.house, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Maison moderne de 400m² sur 3 étages..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caractéristiques (format: Titre|Description, une par ligne)
                  </label>
                  <textarea
                    value={contentSections.house?.features?.map(f => `${f.title}|${f.description}`).join('\n') || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { 
                        ...prev.house, 
                        features: e.target.value.split('\n').filter(l => l.trim()).map(line => {
                          const [title, description] = line.split('|')
                          return { title: title?.trim() || '', description: description?.trim() || '' }
                        })
                      }
                    }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="400m² habitables|Espaces optimisés pour le confort&#10;3 étages|Organisation pratique et fonctionnelle&#10;Jardin privatif|Espace extérieur pour se détendre&#10;Parking|Places réservées pour les colocataires"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={contentSections.house?.address || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { ...prev.house, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="123 rue de la République, 35170 Bruz"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images de la maison (URLs, une par ligne)
                  </label>
                  <textarea
                    value={contentSections.house?.images?.join('\n') || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { 
                        ...prev.house, 
                        images: e.target.value.split('\n').filter(url => url.trim())
                      }
                    }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="/images/house-exterior.jpg&#10;/images/kitchen.jpg&#10;/images/living-room.jpg"
                  />
                </div>
              </div>
            </div>
            
            {/* Section Chambres */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Section Chambres</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la section
                  </label>
                  <input
                    type="text"
                    value={contentSections.rooms?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      rooms: { ...prev.rooms, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Nos chambres disponibles"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={contentSections.rooms?.description || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      rooms: { ...prev.rooms, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Découvrez nos chambres meublées et équipées, conçues pour votre confort et votre réussite académique."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={contentSections.rooms?.buttonText || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      rooms: { ...prev.rooms, buttonText: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Voir les détails"
                  />
                </div>
              </div>
            </div>
            
            {/* Section Footer */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Footer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description du site
                  </label>
                  <textarea
                    value={contentSections.footer?.description || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      footer: { ...prev.footer, description: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="La Maison Oscar propose des logements étudiants de qualité à Bruz..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte de copyright
                  </label>
                  <input
                    type="text"
                    value={contentSections.footer?.copyright || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      footer: { ...prev.footer, copyright: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="© 2025 Maison Oscar. Tous droits réservés."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liens rapides (format: Label|URL, un par ligne)
                  </label>
                  <textarea
                    value={contentSections.footer?.quickLinks?.map(l => `${l.label}|${l.href}`).join('\n') || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        quickLinks: e.target.value.split('\n').filter(l => l.trim()).map(line => {
                          const [label, href] = line.split('|')
                          return { label: label?.trim() || '', href: href?.trim() || '' }
                        })
                      }
                    }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="Mentions légales|/mentions-legales&#10;Contact|#contact&#10;Chambres|#chambres&#10;À propos|#about"
                  />
                </div>
              </div>
            </div>
            
            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveContent}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder le contenu
              </button>
            </div>
          </div>
        )
        
      case 'social':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Réseaux sociaux</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Facebook className="w-4 h-4 inline mr-2" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={socialLinks.facebookUrl}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://facebook.com/maisonoscar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={socialLinks.instagramUrl}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://instagram.com/maisonoscar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Linkedin className="w-4 h-4 inline mr-2" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={socialLinks.linkedinUrl}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://linkedin.com/company/maisonoscar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Twitter className="w-4 h-4 inline mr-2" />
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    value={socialLinks.twitterUrl}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, twitterUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://twitter.com/maisonoscar"
                  />
                </div>
              </div>
            </div>
            
            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder
              </button>
            </div>
          </div>
        )
        
      case 'testimonials':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Témoignages</h3>
                <p className="text-sm text-gray-600">Gérez les témoignages affichés sur le site</p>
              </div>
              <button
                onClick={() => {
                  setEditingTestimonial({
                    name: '',
                    role: '',
                    content: '',
                    rating: 5,
                    isActive: true
                  })
                  setShowTestimonialModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un témoignage
              </button>
            </div>

            {/* Liste des témoignages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {testimonial.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      testimonial.isActive 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {testimonial.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTestimonial(testimonial)
                          setShowTestimonialModal(true)
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {testimonials.length === 0 && (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun témoignage pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">
                  Ajoutez des témoignages pour les afficher sur votre site
                </p>
              </div>
            )}
            
            {/* Modal d'édition */}
            {showTestimonialModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl max-w-lg w-full p-6"
                >
                  <h3 className="text-xl font-bold mb-4">
                    {editingTestimonial?.id ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
                  </h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSaveTestimonial()
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={editingTestimonial?.name || ''}
                          onChange={(e) => setEditingTestimonial(prev => ({
                            ...prev,
                            name: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rôle / Formation
                        </label>
                        <input
                          type="text"
                          value={editingTestimonial?.role || ''}
                          onChange={(e) => setEditingTestimonial(prev => ({
                            ...prev,
                            role: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Étudiant en informatique"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Témoignage
                        </label>
                        <textarea
                          value={editingTestimonial?.content || ''}
                          onChange={(e) => setEditingTestimonial(prev => ({
                            ...prev,
                            content: e.target.value
                          }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Note
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setEditingTestimonial(prev => ({
                                ...prev,
                                rating
                              }))}
                              className={`text-2xl ${
                                rating <= (editingTestimonial?.rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={editingTestimonial?.isActive ?? true}
                          onChange={(e) => setEditingTestimonial(prev => ({
                            ...prev,
                            isActive: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                          Témoignage actif (affiché sur le site)
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTestimonialModal(false)
                          setEditingTestimonial(null)
                        }}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          editingTestimonial?.id ? 'Mettre à jour' : 'Ajouter'
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        )
        
      default:
        return <div>Section en cours de développement</div>
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestion du contenu</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gérez le contenu et les paramètres du site
          </p>
        </div>
        
        {/* Tabs - Horizontal scroll on mobile */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}