'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, FileText, Users, Building2, Globe,
  Save, RefreshCw, Plus, Edit2, Trash2, Eye,
  Facebook, Instagram, Linkedin, Twitter, Mail,
  Phone, MapPin, Clock, ChevronRight, AlertCircle,
  Loader2, Check, X, Upload, Image as ImageIcon,
  Home, Car, TreePine, Bed, Bath, Wifi, Camera,
  Shield, Zap, Utensils, Sofa, Tv, Gamepad2,
  Coffee, Waves, Sun, Moon, Star, Heart, Flame,
  Snowflake, Umbrella, Wind, Mountain, Flower,
  Key, Lock, Unlock, Compass, Thermometer,
  Music, Volume2, Headphones, Bookmark, Book,
  Laptop, Smartphone, Tablet, Watch, Printer,
  Monitor, Keyboard, Mouse, Speaker, Battery,
  Calculator, Calendar, Archive, Folder, File,
  Search, Filter, Download, Cloud, Disc,
  Cpu, HardDrive, Server, Database, Network,
  Share, Link, Copy, Scissors, Paperclip,
  Tag, Flag, Award, Trophy, Medal, Gift,
  ShoppingCart, CreditCard, DollarSign, Euro,
  Plane, Train, Ship, Bike, Bus, Truck
} from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/ui/ImageUpload'

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
  about: {
    badge?: string
    title?: string
    titleAccent?: string
    description?: string
    features?: Array<{ title: string; description: string }>
    cta?: string
  }
  problemSolution: {
    title?: string
    subtitle?: string
    problems?: Array<{ title: string; description: string }>
    solutions?: Array<{ title: string; description: string }>
  }
  house: {
    title?: string
    subtitle?: string
    description?: string
    features?: Array<{ icon: string; value: string; label: string }>
    amenities?: string[]
    images?: (string | { url: string; title?: string; description?: string })[]
  }
  rooms: {
    title?: string
    description?: string
    buttonText?: string
  }
  footer: {
    companyName?: string
    description?: string
    copyright?: string
    navigationLinks?: Array<{ label: string; href: string }>
    services?: string[]
  }
  commonSpaces?: any
}

interface Testimonial {
  id?: string
  name: string
  role: string
  content: string
  rating: number
  isActive: boolean
}

// Map des icônes disponibles pour les caractéristiques de maison
const houseIconMap = {
  // Logement de base
  home: Home,
  building: Building2,
  bed: Bed,
  bath: Bath,
  sofa: Sofa,

  // Services et équipements
  wifi: Wifi,
  tv: Tv,
  camera: Camera,
  zap: Zap,
  utensils: Utensils,
  coffee: Coffee,

  // Transport et localisation
  car: Car,
  bike: Bike,
  bus: Bus,
  train: Train,
  plane: Plane,
  mapPin: MapPin,

  // Sécurité et accès
  shield: Shield,
  key: Key,
  lock: Lock,
  unlock: Unlock,

  // Nature et environnement
  tree: TreePine,
  flower: Flower,
  sun: Sun,
  moon: Moon,
  star: Star,
  mountain: Mountain,
  waves: Waves,

  // Technologie
  laptop: Laptop,
  smartphone: Smartphone,
  tablet: Tablet,
  printer: Printer,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  speaker: Speaker,

  // Loisirs et divertissement
  gamepad: Gamepad2,
  music: Music,
  headphones: Headphones,
  book: Book,

  // Outils et objets
  thermometer: Thermometer,
  compass: Compass,
  calculator: Calculator,
  calendar: Calendar,
  archive: Archive,
  folder: Folder,

  // Commerciaux
  shoppingCart: ShoppingCart,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  euro: Euro,

  // Personnes et social
  users: Users,
  heart: Heart,
  gift: Gift,
  award: Award,
  trophy: Trophy,
  medal: Medal,

  // Autres
  flame: Flame,
  snowflake: Snowflake,
  umbrella: Umbrella,
  wind: Wind,
  flag: Flag,
  tag: Tag
}

// Composant sélecteur d'icône amélioré
const IconSelector = ({ selectedIcon, onIconSelect }: { selectedIcon: string, onIconSelect: (icon: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const SelectedIconComponent = houseIconMap[selectedIcon as keyof typeof houseIconMap] || Home

  // Filtrer les icônes selon le terme de recherche
  const filteredIcons = Object.entries(houseIconMap).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Grouper les icônes par catégorie
  const iconCategories = {
    'Logement': ['home', 'building', 'bed', 'bath', 'sofa'],
    'Services': ['wifi', 'tv', 'camera', 'zap', 'utensils', 'coffee'],
    'Transport': ['car', 'bike', 'bus', 'train', 'plane', 'mapPin'],
    'Sécurité': ['shield', 'key', 'lock', 'unlock'],
    'Nature': ['tree', 'flower', 'sun', 'moon', 'star', 'mountain', 'waves'],
    'Technologie': ['laptop', 'smartphone', 'tablet', 'printer', 'monitor', 'keyboard', 'mouse', 'speaker'],
    'Loisirs': ['gamepad', 'music', 'headphones', 'book'],
    'Outils': ['thermometer', 'compass', 'calculator', 'calendar', 'archive', 'folder'],
    'Commercial': ['shoppingCart', 'creditCard', 'dollarSign', 'euro'],
    'Social': ['users', 'heart', 'gift', 'award', 'trophy', 'medal'],
    'Autres': ['flame', 'snowflake', 'umbrella', 'wind', 'flag', 'tag']
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors min-w-[120px]"
      >
        <SelectedIconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate flex-1">{selectedIcon}</span>
        <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-96 max-h-80 overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Rechercher une icône..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Grille d'icônes */}
          <div className="max-h-60 overflow-y-auto p-3">
            {searchTerm ? (
              // Vue filtrée
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map(([key, IconComponent]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onIconSelect(key)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`p-2 rounded hover:bg-gray-100 flex flex-col items-center gap-1 text-xs transition-colors ${
                      selectedIcon === key ? 'bg-black text-white hover:bg-gray-800' : ''
                    }`}
                    title={key}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="truncate w-full text-center">{key}</span>
                  </button>
                ))}
              </div>
            ) : (
              // Vue par catégories
              <div className="space-y-4">
                {Object.entries(iconCategories).map(([category, iconKeys]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">{category}</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {iconKeys.map((key) => {
                        const IconComponent = houseIconMap[key as keyof typeof houseIconMap]
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              onIconSelect(key)
                              setIsOpen(false)
                            }}
                            className={`p-2 rounded hover:bg-gray-100 flex flex-col items-center gap-1 text-xs transition-colors ${
                              selectedIcon === key ? 'bg-black text-white hover:bg-gray-800' : ''
                            }`}
                            title={key}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="truncate w-full text-center">{key}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton fermer */}
          <div className="p-2 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setSearchTerm('')
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
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
    rcsNumber: string;
    vatNumber: string;
    legalAddress: string;
    legalCity: string;
    legalZipCode: string;
  }>({
    legalType: 'INDIVIDUAL',
    owners: [],
    companyName: '',
    tradeName: '',
    siret: '',
    capital: 0,
    legalForm: '',
    rcsNumber: '',
    vatNumber: '',
    legalAddress: '',
    legalCity: '',
    legalZipCode: ''
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
    about: {},
    problemSolution: {},
    house: {},
    rooms: {},
    footer: {},
    commonSpaces: {}
  })
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [editingContent, setEditingContent] = useState<any>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showContentModal, setShowContentModal] = useState(false)
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)
  
  // Générer le contenu par défaut des mentions légales
  const getDefaultMentionsContent = (settings: any) => {
    const contacts = {
      email: settings?.contactEmail || 'contact@maisonoscar.fr',
      phone: settings?.contactPhone || '06 XX XX XX XX',
      address: settings?.contactAddress || 'Bruz, France'
    }

    return `<h2>1. Informations légales</h2>
<p>
  <strong>Dénomination sociale :</strong> Maison Oscar<br />
  <strong>Forme juridique :</strong> SAS<br />
  <strong>Siège social :</strong> ${contacts.address}<br />
  <strong>SIRET :</strong> En cours d'immatriculation<br />
  <strong>RCS :</strong> Rennes<br />
</p>

<h2>2. Contact</h2>
<p>
  <strong>Téléphone :</strong> ${contacts.phone}<br />
  <strong>Email :</strong> ${contacts.email}<br />
  <strong>Adresse :</strong> ${contacts.address}
</p>

<h2>3. Directeur de publication</h2>
<p>
  <strong>Responsable :</strong> Direction Maison Oscar<br />
  <strong>Contact :</strong> ${contacts.email}
</p>

<h2>4. Hébergement du site</h2>
<p>
  <strong>Hébergeur :</strong> Vercel Inc.<br />
  <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
  <strong>Site web :</strong> https://vercel.com
</p>

<h2>5. Propriété intellectuelle</h2>
<p>
  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
  Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
</p>
<p>
  La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
</p>

<h2>6. Protection des données personnelles (RGPD)</h2>
<p>
  Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée,
  vous disposez des droits suivants sur vos données personnelles :
</p>
<ul>
  <li>Droit d'accès aux données</li>
  <li>Droit de rectification</li>
  <li>Droit à l'effacement (droit à l'oubli)</li>
  <li>Droit à la limitation du traitement</li>
  <li>Droit à la portabilité des données</li>
  <li>Droit d'opposition</li>
</ul>
<p>
  Pour exercer ces droits, vous pouvez nous contacter :
  <br />Par email : ${contacts.email}
  <br />Par courrier : Maison Oscar - ${contacts.address}
</p>

<h2>7. Cookies</h2>
<p>
  Ce site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte stockés sur votre appareil.
</p>
<p>
  <strong>Types de cookies utilisés :</strong>
</p>
<ul>
  <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
  <li><strong>Cookies analytiques :</strong> Pour comprendre comment les visiteurs utilisent le site (Google Analytics)</li>
  <li><strong>Cookies de session :</strong> Pour maintenir votre connexion</li>
</ul>
<p>
  Vous pouvez paramétrer votre navigateur pour refuser les cookies ou être alerté lorsqu'un cookie est envoyé.
</p>

<h2>8. Responsabilité</h2>
<p>
  Maison Oscar s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
  Cependant, Maison Oscar ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
</p>
<p>
  En conséquence, Maison Oscar décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site.
</p>

<h2>9. Liens hypertextes</h2>
<p>
  Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres ressources présentes sur le réseau Internet
  ne sauraient engager la responsabilité de Maison Oscar.
</p>

<h2>10. Droit applicable et juridiction compétente</h2>
<p>
  Les présentes mentions légales sont régies par le droit français.
  En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
</p>

<div class="mt-8 p-4 bg-gray-50 rounded-lg">
  <p class="text-sm text-gray-600">
    <em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</em>
  </p>
</div>`
  }

  // Charger les données au montage
  useEffect(() => {
    loadAllData()
  }, [])
  
  const loadAllData = async () => {
    setLoading(true)
    try {
      // Charger les paramètres du site d'abord
      let loadedSettings = null
      const settingsRes = await fetch('/api/cms/settings')
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        if (settingsData.success) {
          loadedSettings = settingsData.data
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
          // Normaliser les données pour éviter les valeurs null
          const normalizedData = {
            legalType: legalData.data.legalType || 'INDIVIDUAL',
            owners: (legalData.data.owners || []).map((owner: any) => ({
              firstName: owner.firstName || '',
              lastName: owner.lastName || '',
              email: owner.email || '',
              phone: owner.phone || '',
              address: owner.address || ''
            })),
            companyName: legalData.data.companyName || '',
            tradeName: legalData.data.tradeName || '',
            siret: legalData.data.siret || '',
            capital: legalData.data.capital || 0,
            legalForm: legalData.data.legalForm || '',
            rcsNumber: legalData.data.rcsNumber || '',
            vatNumber: legalData.data.vatNumber || '',
            legalAddress: legalData.data.legalAddress || '',
            legalCity: legalData.data.legalCity || '',
            legalZipCode: legalData.data.legalZipCode || ''
          }
          setLegalConfig(normalizedData)
        }
      }

      // Charger les mentions légales après avoir chargé les settings
      const mentionsRes = await fetch('/api/cms/legal-pages?pageType=mentions-legales')
      if (mentionsRes.ok) {
        const mentionsData = await mentionsRes.json()
        if (mentionsData.success && mentionsData.data) {
          setMentionsLegales(mentionsData.data)
        } else {
          // Si pas de données, utiliser le contenu par défaut du site public avec les settings chargés
          setMentionsLegales(prev => ({
            ...prev,
            content: getDefaultMentionsContent(loadedSettings)
          }))
        }
      }
      
      // Charger les sections de contenu
      const sectionsRes = await fetch('/api/cms/sections')
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        if (sectionsData.success) {
          setContentSections(prev => ({
            ...sectionsData.data,
            house: {
              ...sectionsData.data.house
            }
          }))
        }
      }

      // Charger les images existantes de la maison
      const houseImagesRes = await fetch('/api/cms/house-images')
      if (houseImagesRes.ok) {
        const houseImagesData = await houseImagesRes.json()
        if (houseImagesData.success && houseImagesData.data.length > 0) {
          setContentSections(prev => ({
            ...prev,
            house: {
              ...prev.house,
              images: houseImagesData.data
            }
          }))
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
                            phone: '',
                            address: ''
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
                    Contenu des mentions légales
                  </label>

                  {/* Barre d'outils de formatage */}
                  <div className="mb-2 p-2 bg-gray-50 border border-gray-300 rounded-t-lg flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const selectedText = textarea.value.substring(start, end) || 'Titre principal'
                        const newText = `<h1>${selectedText}</h1>`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 4, start + 4 + selectedText.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                      title="Titre H1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const selectedText = textarea.value.substring(start, end) || 'Sous-titre'
                        const newText = `<h2>${selectedText}</h2>`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 4, start + 4 + selectedText.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                      title="Titre H2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const selectedText = textarea.value.substring(start, end) || 'Sous-sous-titre'
                        const newText = `<h3>${selectedText}</h3>`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 4, start + 4 + selectedText.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                      title="Titre H3"
                    >
                      H3
                    </button>
                    <div className="border-l border-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const selectedText = textarea.value.substring(start, end) || 'texte en gras'
                        const newText = `<strong>${selectedText}</strong>`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 8, start + 8 + selectedText.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
                      title="Gras"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const selectedText = textarea.value.substring(start, end) || 'texte en italique'
                        const newText = `<em>${selectedText}</em>`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 4, start + 4 + selectedText.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 italic"
                      title="Italique"
                    >
                      I
                    </button>
                    <div className="border-l border-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const newText = `<p>Nouveau paragraphe</p>\n`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(start)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 3, start + 3 + 'Nouveau paragraphe'.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                      title="Paragraphe"
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('mentions-content') as HTMLTextAreaElement
                        const start = textarea.selectionStart
                        const newText = `<ul>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n</ul>\n`
                        const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(start)
                        setMentionsLegales(prev => ({ ...prev, content: newContent }))
                        setTimeout(() => {
                          textarea.focus()
                          textarea.setSelectionRange(start + 10, start + 10 + 'Élément 1'.length)
                        }, 0)
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                      title="Liste à puces"
                    >
                      UL
                    </button>
                  </div>

                  <textarea
                    id="mentions-content"
                    value={mentionsLegales.content}
                    onChange={(e) => setMentionsLegales(prev => ({ ...prev, content: e.target.value }))}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="Contenu des mentions légales..."
                  />

                  <div className="mt-2 text-xs text-gray-500">
                    💡 Sélectionnez du texte et cliquez sur les boutons pour le formater, ou utilisez directement du HTML
                  </div>
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

            {/* Section À propos */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Section À propos</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={contentSections.about?.badge || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      about: { ...prev.about, badge: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Maison Oscar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre principal
                  </label>
                  <input
                    type="text"
                    value={contentSections.about?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      about: { ...prev.about, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Créateur de liens,"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre accentué
                  </label>
                  <input
                    type="text"
                    value={contentSections.about?.titleAccent || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      about: { ...prev.about, titleAccent: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="par nature"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={contentSections.about?.description || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      about: { ...prev.about, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Nous révolutionnons la façon de vivre ensemble..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caractéristiques (format: Titre|Description, une par ligne)
                  </label>
                  <textarea
                    value={contentSections.about?.features?.map(f => `${f.title}|${f.description}`).join('\n') || ''}
                    onChange={(e) => {
                      const features = e.target.value.split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                          const [title, description] = line.split('|')
                          return { title: title?.trim() || '', description: description?.trim() || '' }
                        })
                      setContentSections((prev: ContentSections) => ({
                        ...prev,
                        about: { ...prev.about, features }
                      }))
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Un nouveau mode de vie|Alliant intimité de votre chambre privée et richesse des espaces partagés&#10;Une communauté bienveillante|Sélection soigneuse des colocataires"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du bouton d'action
                  </label>
                  <input
                    type="text"
                    value={contentSections.about?.cta || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      about: { ...prev.about, cta: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Découvrir notre maison"
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
                    Titre principal
                  </label>
                  <input
                    type="text"
                    value={contentSections.problemSolution?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Le co-living réinventé"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={contentSections.problemSolution?.subtitle || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      problemSolution: { ...prev.problemSolution, subtitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="pour créer des liens"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problèmes (format: Titre|Description, un par ligne)
                  </label>
                  <textarea
                    value={contentSections.problemSolution?.problems?.map(p => `${p.title}|${p.description}`).join('\n') || ''}
                    onChange={(e) => {
                      const problems = e.target.value.split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                          const [title, description] = line.split('|')
                          return { title: title?.trim() || '', description: description?.trim() || '' }
                        })
                      setContentSections((prev: ContentSections) => ({
                        ...prev,
                        problemSolution: { ...prev.problemSolution, problems }
                      }))
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Solitude en location|Vivre seul peut être isolant et coûteux&#10;Espaces impersonnels|Les logements classiques manquent d'âme&#10;Charges élevées|Les frais s'accumulent rapidement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solutions (format: Titre|Description, une par ligne)
                  </label>
                  <textarea
                    value={contentSections.problemSolution?.solutions?.map(s => `${s.title}|${s.description}`).join('\n') || ''}
                    onChange={(e) => {
                      const solutions = e.target.value.split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                          const [title, description] = line.split('|')
                          return { title: title?.trim() || '', description: description?.trim() || '' }
                        })
                      setContentSections((prev: ContentSections) => ({
                        ...prev,
                        problemSolution: { ...prev.problemSolution, solutions }
                      }))
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Communauté bienveillante|Partagez des moments authentiques&#10;Maison de caractère|Un lieu chaleureux et accueillant&#10;Tout inclus|Une formule simple et transparente"
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
                    Titre principal
                  </label>
                  <input
                    type="text"
                    value={contentSections.house?.title || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { ...prev.house, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Notre maison"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={contentSections.house?.subtitle || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: { ...prev.house, subtitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="votre nouveau chez-vous"
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
                    placeholder="Une maison de caractère avec jardin, située à Bruz, à seulement 15 minutes de Rennes."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Caractéristiques de la maison
                  </label>

                  {/* Liste des caractéristiques existantes */}
                  <div className="space-y-3 mb-4">
                    {(contentSections.house?.features || []).map((feature: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <IconSelector
                          selectedIcon={feature.icon || 'home'}
                          onIconSelect={(icon) => {
                            const newFeatures = [...(contentSections.house?.features || [])]
                            newFeatures[index] = { ...newFeatures[index], icon }
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              house: { ...prev.house, features: newFeatures }
                            }))
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Valeur (ex: 180m²)"
                          value={feature.value || ''}
                          onChange={(e) => {
                            const newFeatures = [...(contentSections.house?.features || [])]
                            newFeatures[index] = { ...newFeatures[index], value: e.target.value }
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              house: { ...prev.house, features: newFeatures }
                            }))
                          }}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Label (ex: Surface habitable)"
                          value={feature.label || ''}
                          onChange={(e) => {
                            const newFeatures = [...(contentSections.house?.features || [])]
                            newFeatures[index] = { ...newFeatures[index], label: e.target.value }
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              house: { ...prev.house, features: newFeatures }
                            }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = (contentSections.house?.features || []).filter((_, i) => i !== index)
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              house: { ...prev.house, features: newFeatures }
                            }))
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Bouton pour ajouter une nouvelle caractéristique */}
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = [...(contentSections.house?.features || []), { icon: 'home', value: '', label: '' }]
                      setContentSections((prev: ContentSections) => ({
                        ...prev,
                        house: { ...prev.house, features: newFeatures }
                      }))
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une caractéristique
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Équipements (un par ligne)
                  </label>
                  <textarea
                    value={contentSections.house?.amenities?.join('\n') || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      house: {
                        ...prev.house,
                        amenities: e.target.value.split('\n').filter(item => item.trim())
                      }
                    }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Cuisine équipée moderne&#10;Grand salon lumineux&#10;Jardin aménagé&#10;Parking sécurisé&#10;Buanderie&#10;Espace coworking"
                  />
                </div>

                <ImageUpload
                  images={contentSections.house?.images || []}
                  onImagesChange={(images) => setContentSections((prev: ContentSections) => ({
                    ...prev,
                    house: { ...prev.house, images }
                  }))}
                  type="house"
                  maxImages={6}
                  label="Images de la maison (6 max pour le carrousel)"
                  showMetadata={true}
                />
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
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={contentSections.footer?.companyName || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      footer: { ...prev.footer, companyName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="MAISON OSCAR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={contentSections.footer?.description || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      footer: { ...prev.footer, description: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Créateur de liens en Bretagne. Le co-living nouvelle génération avec une communauté bienveillante."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copyright
                  </label>
                  <input
                    type="text"
                    value={contentSections.footer?.copyright || ''}
                    onChange={(e) => setContentSections((prev: ContentSections) => ({
                      ...prev,
                      footer: { ...prev.footer, copyright: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="© 2024 Maison Oscar. Tous droits réservés. Créateur de liens en Bretagne."
                  />
                </div>

                {/* Navigation Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Liens de navigation
                  </label>
                  <div className="space-y-2">
                    {(contentSections.footer?.navigationLinks || []).map((link: any, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label"
                          value={link.label || ''}
                          onChange={(e) => {
                            const newLinks = [...(contentSections.footer?.navigationLinks || [])]
                            newLinks[index] = { ...newLinks[index], label: e.target.value }
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              footer: { ...prev.footer, navigationLinks: newLinks }
                            }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={link.href || ''}
                          onChange={(e) => {
                            const newLinks = [...(contentSections.footer?.navigationLinks || [])]
                            newLinks[index] = { ...newLinks[index], href: e.target.value }
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              footer: { ...prev.footer, navigationLinks: newLinks }
                            }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = (contentSections.footer?.navigationLinks || []).filter((_, i) => i !== index)
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              footer: { ...prev.footer, navigationLinks: newLinks }
                            }))
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = [...(contentSections.footer?.navigationLinks || []), { label: '', href: '' }]
                        setContentSections((prev: ContentSections) => ({
                          ...prev,
                          footer: { ...prev.footer, navigationLinks: newLinks }
                        }))
                      }}
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un lien
                    </button>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Services
                  </label>
                  <div className="space-y-2">
                    {(contentSections.footer?.services || []).map((service: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Service"
                          value={service || ''}
                          onChange={(e) => {
                            const newServices = [...(contentSections.footer?.services || [])]
                            newServices[index] = e.target.value
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              footer: { ...prev.footer, services: newServices }
                            }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newServices = (contentSections.footer?.services || []).filter((_, i) => i !== index)
                            setContentSections((prev: ContentSections) => ({
                              ...prev,
                              footer: { ...prev.footer, services: newServices }
                            }))
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newServices = [...(contentSections.footer?.services || []), '']
                        setContentSections((prev: ContentSections) => ({
                          ...prev,
                          footer: { ...prev.footer, services: newServices }
                        }))
                      }}
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un service
                    </button>
                  </div>
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
                  setEditingTestimonial(null)
                  setShowTestimonialModal(true)
                }}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
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
                          onChange={(e) => setEditingTestimonial(prev => prev ? ({
                            ...prev,
                            name: e.target.value
                          }) : null)}
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
                          onChange={(e) => setEditingTestimonial(prev => prev ? ({
                            ...prev,
                            role: e.target.value
                          }) : null)}
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
                          onChange={(e) => setEditingTestimonial(prev => prev ? ({
                            ...prev,
                            content: e.target.value
                          }) : null)}
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
                              onClick={() => setEditingTestimonial(prev => prev ? ({
                                ...prev,
                                rating
                              }) : null)}
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
                          onChange={(e) => setEditingTestimonial(prev => prev ? ({
                            ...prev,
                            isActive: e.target.checked
                          }) : null)}
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