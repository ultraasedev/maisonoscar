import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  X, 
  Upload, 
  Plus, 
  Minus, 
  Euro,
  Calendar,
  Settings,
  Bed,
  ChefHat,
  Home,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Check,
  AlertCircle,
  Info,
  Camera,
  Save,
  Loader2
} from 'lucide-react'

// Types simplifiés pour la démo
type BedType = 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING' | 'BUNK'
type KitchenType = 'SHARED' | 'PRIVATE' | 'KITCHENETTE'
type CookingPlateType = 'GAS' | 'INDUCTION' | 'ELECTRIC'
type Exposure = 'SUNNY' | 'SHADED' | 'MIXED'
type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE'

interface BedConfiguration {
  id: string
  type: BedType
  count: number
}

interface RoomFormData {
  name: string
  number: number
  price: number
  surface: number
  description: string
  status: RoomStatus
  isActive: boolean
  floor: number
  orientation: string
  exposure: Exposure
  hasPrivateBathroom: boolean
  hasBalcony: boolean
  hasDesk: boolean
  hasCloset: boolean
  hasWindow: boolean
  hasTV: boolean
  bedConfigurations: BedConfiguration[]
  sheetsProvided: boolean
  kitchenType: KitchenType
  kitchenEquipment: string[]
  hasMicrowave: boolean
  hasOven: boolean
  hasCookingPlates: boolean
  cookingPlateType: CookingPlateType
  images: string[]
  imageFiles: File[]
  virtualTour: string
  isVirtualTourActive: boolean
  petsAllowed: boolean
  smokingAllowed: boolean
  paymentConfig: {
    rentDueDay: number
    securityDepositType: 'ONE_MONTH' | 'TWO_MONTHS' | 'CUSTOM'
    securityDepositAmount?: number
  }
}

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  room?: any
  onSubmit?: (data: any) => Promise<void>  // Optionnel pour permettre un refresh parent
}

// Image Upload Component amélioré
const ImageUploadSection = ({ 
  images, 
  imageFiles, 
  onAddUrl, 
  onAddFiles, 
  onRemove,
  previewUrls 
}: {
  images: string[]
  imageFiles: File[]
  onAddUrl: (url: string) => void
  onAddFiles: (files: FileList) => void
  onRemove: (index: number, isFile: boolean) => void
  previewUrls: string[]
}) => {
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      onAddFiles(e.dataTransfer.files)
    }
  }

  const totalImages = images.length + imageFiles.length

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">
          Glissez-déposez des images ici ou
        </p>
        <div className="flex gap-3 justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && onAddFiles(e.target.files)}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Upload className="w-4 h-4" />
              Parcourir
            </span>
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            URL
          </button>
        </div>
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && urlInput.trim()) {
                    onAddUrl(urlInput.trim())
                    setUrlInput('')
                    setShowUrlInput(false)
                  }
                }}
                placeholder="https://exemple.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) {
                    onAddUrl(urlInput.trim())
                    setUrlInput('')
                    setShowUrlInput(false)
                  }
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Images Grid */}
      {totalImages > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {totalImages} image{totalImages > 1 ? 's' : ''} ajoutée{totalImages > 1 ? 's' : ''}
            </p>
            <span className="text-xs text-gray-500">
              Glissez pour réorganiser
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {/* Images URLs */}
            {images.map((url, index) => (
              <motion.div
                key={`url-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA5MEwxMDAgNzBMMTQwIDExMEwxNTAgMTAwTDE2MCAxMTBWMTMwSDgwVjkwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSI3MCIgY3k9IjcwIiByPSIxMCIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4='
                  }}
                />
                
                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onRemove(index, false)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Badges */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                    Principale
                  </div>
                )}
              </motion.div>
            ))}

            {/* Image Files */}
            {previewUrls.map((url, index) => (
              <motion.div
                key={`file-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={url}
                  alt={`Fichier ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onRemove(index, true)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {images.length === 0 && index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                    Principale
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Composant principal amélioré
export default function ImprovedRoomModal({ isOpen, onClose, room, onSubmit }: RoomModalProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  
  // État initial du formulaire avec description par défaut
  const getInitialFormData = (): RoomFormData => ({
    name: '',
    number: 1,
    price: 500,
    surface: 12,
    description: 'Chambre confortable et lumineuse, idéale pour étudiants ou jeunes actifs.', // Description par défaut
    status: 'AVAILABLE',
    isActive: true,
    floor: 0,
    orientation: 'Sud',
    exposure: 'SUNNY',
    hasPrivateBathroom: false,
    hasBalcony: false,
    hasDesk: true,
    hasCloset: true,
    hasWindow: true,
    hasTV: false,
    bedConfigurations: [
      { id: '1', type: 'DOUBLE', count: 1 }
    ],
    sheetsProvided: true,
    kitchenType: 'SHARED',
    kitchenEquipment: [],
    hasMicrowave: false,
    hasOven: false,
    hasCookingPlates: false,
    cookingPlateType: 'INDUCTION',
    images: [],
    imageFiles: [],
    virtualTour: '',
    isVirtualTourActive: false,
    petsAllowed: false,
    smokingAllowed: false,
    paymentConfig: {
      rentDueDay: 1,
      securityDepositType: 'ONE_MONTH'
    }
  })
  
  const [formData, setFormData] = useState<RoomFormData>(getInitialFormData())

  const tabs = [
    { id: 'base', label: 'Infos', icon: Home },
    { id: 'beds', label: 'Lits', icon: Bed },
    { id: 'kitchen', label: 'Cuisine', icon: ChefHat },
    { id: 'equipment', label: 'Équipements', icon: Settings },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'payment', label: 'Paiement', icon: Euro }
  ]

  // Constantes pour les labels
  const bedTypeLabels: Record<BedType, string> = {
    SINGLE: 'Lit simple (90x190)',
    DOUBLE: 'Lit double (140x200)',
    QUEEN: 'Lit queen (160x200)',
    KING: 'Lit king (180x200)',
    BUNK: 'Lit superposé'
  }

  const kitchenTypeLabels: Record<KitchenType, string> = {
    SHARED: 'Cuisine partagée',
    PRIVATE: 'Cuisine privée',
    KITCHENETTE: 'Kitchenette'
  }

  const kitchenEquipmentOptions = [
    'Réfrigérateur', 'Congélateur', 'Lave-vaisselle', 'Four', 'Micro-ondes',
    'Grille-pain', 'Bouilloire', 'Cafetière', 'Robot culinaire', 'Ustensiles complets'
  ]

  // Initialiser les données si on modifie une chambre
  useEffect(() => {
    if (room && isOpen) {
      const bedConfigs = room.bedConfigurations?.length > 0 
        ? room.bedConfigurations.map((bed: any, index: number) => ({
            ...bed,
            id: bed.id || `bed-${index}`
          }))
        : room.bedType 
          ? [{ id: '1', type: room.bedType, count: room.bedCount || 1 }]
          : [{ id: '1', type: 'DOUBLE', count: 1 }]

      setFormData({
        ...getInitialFormData(),
        ...room,
        description: room.description || 'Chambre confortable et lumineuse, idéale pour étudiants ou jeunes actifs.',
        bedConfigurations: bedConfigs,
        images: room.images || [],
        imageFiles: [],
        paymentConfig: room.paymentConfig || {
          rentDueDay: 1,
          securityDepositType: 'ONE_MONTH'
        }
      })
      
      setValidationErrors({})
      setSuccessMessage('')
      setActiveTab(0)
    } else if (!room && isOpen) {
      setFormData(getInitialFormData())
      setValidationErrors({})
      setSuccessMessage('')
      setActiveTab(0)
    }
  }, [room, isOpen])

  // Gestion des images améliorée
  const handleImageUrlAdd = (url: string) => {
    // Ne pas valider l'URL comme une URL HTTP valide, juste vérifier qu'elle n'est pas vide
    if (url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }))
      setSuccessMessage('Image ajoutée')
      setTimeout(() => setSuccessMessage(''), 2000)
    } else {
      setValidationErrors(prev => ({
        ...prev,
        images: 'URL invalide'
      }))
      setTimeout(() => {
        setValidationErrors(prev => {
          const { images, ...rest } = prev
          return rest
        })
      }, 3000)
    }
  }

  const handleImageFileAdd = (files: FileList) => {
    const newFiles = Array.from(files)
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024
      return isValidType && isValidSize
    })

    if (validFiles.length > 0) {
      const newUrls = validFiles.map(file => URL.createObjectURL(file))
      
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...validFiles]
      }))
      setPreviewUrls(prev => [...prev, ...newUrls])
      
      setSuccessMessage(`${validFiles.length} image(s) ajoutée(s)`)
      setTimeout(() => setSuccessMessage(''), 2000)
    }
  }

  const removeImage = (index: number, isFile: boolean) => {
    if (isFile) {
      setFormData(prev => ({
        ...prev,
        imageFiles: prev.imageFiles.filter((_, i) => i !== index)
      }))
      setPreviewUrls(prev => {
        if (prev[index]) {
          URL.revokeObjectURL(prev[index])
        }
        return prev.filter((_, i) => i !== index)
      })
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  }

  // Gestion des lits
  const addBedConfiguration = () => {
    const newId = Date.now().toString()
    setFormData(prev => ({
      ...prev,
      bedConfigurations: [
        ...prev.bedConfigurations,
        { id: newId, type: 'SINGLE', count: 1 }
      ]
    }))
  }

  const removeBedConfiguration = (id: string) => {
    if (formData.bedConfigurations.length > 1) {
      setFormData(prev => ({
        ...prev,
        bedConfigurations: prev.bedConfigurations.filter(bed => bed.id !== id)
      }))
    }
  }

  const updateBedConfiguration = (id: string, field: keyof BedConfiguration, value: any) => {
    setFormData(prev => ({
      ...prev,
      bedConfigurations: prev.bedConfigurations.map(bed =>
        bed.id === id ? { ...bed, [field]: value } : bed
      )
    }))
  }

  // Validation améliorée
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) errors.name = 'Le nom est requis'
    if (formData.number < 1) errors.number = 'Le numéro doit être positif'
    if (formData.price < 100) errors.price = 'Le prix minimum est 100€'
    if (formData.surface < 5) errors.surface = 'La surface minimum est 5m²'
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères'
    }
    if (formData.bedConfigurations.length === 0) errors.beds = 'Au moins un lit est requis'
    
    if (formData.paymentConfig.securityDepositType === 'CUSTOM' && 
        (!formData.paymentConfig.securityDepositAmount || formData.paymentConfig.securityDepositAmount < 0)) {
      errors.payment = 'Le montant de la caution personnalisée est invalide'
    }

    setValidationErrors(errors)
    
    // Aller au premier onglet avec erreur
    if (Object.keys(errors).length > 0) {
      if (errors.name || errors.number || errors.price || errors.surface || errors.description) {
        setActiveTab(0)
      } else if (errors.beds) {
        setActiveTab(1)
      } else if (errors.payment) {
        setActiveTab(5)
      }
    }
    
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Préparer toutes les données nécessaires pour l'API
      const dataToSend = {
        // Informations de base (obligatoires)
        name: formData.name,
        number: formData.number,
        price: formData.price,
        surface: formData.surface,
        description: formData.description || `Chambre ${formData.name} - ${formData.surface}m²`,
        
        // Équipements de base
        hasPrivateBathroom: formData.hasPrivateBathroom,
        hasBalcony: formData.hasBalcony,
        hasDesk: formData.hasDesk ?? true,
        hasCloset: formData.hasCloset ?? true,
        hasWindow: formData.hasWindow ?? true,
        
        // Localisation
        floor: formData.floor,
        orientation: formData.orientation || 'Sud',
        exposure: formData.exposure || 'SUNNY',
        
        // Images et visite virtuelle
        images: formData.images || [],
        virtualTour: formData.virtualTour || undefined,
        isVirtualTourActive: formData.isVirtualTourActive || false,
        
        // Configuration couchage (extraction depuis bedConfigurations)
        bedType: formData.bedConfigurations[0]?.type || 'DOUBLE',
        bedCount: formData.bedConfigurations.reduce((sum, bed) => sum + bed.count, 0) || 1,
        sheetsProvided: formData.sheetsProvided ?? true,
        
        // Configuration cuisine
        kitchenType: formData.kitchenType || 'SHARED',
        kitchenEquipment: formData.kitchenEquipment || [],
        hasMicrowave: formData.hasMicrowave || false,
        hasOven: formData.hasOven || false,
        hasCookingPlates: formData.hasCookingPlates || false,
        cookingPlateType: formData.cookingPlateType || 'INDUCTION',
        
        // Équipements additionnels
        hasTV: formData.hasTV || false,
        
        // Règlement
        petsAllowed: formData.petsAllowed || false,
        smokingAllowed: formData.smokingAllowed || false
      }

      // Si c'est une mise à jour, ajouter le statut et isActive
      if (room?.id) {
        Object.assign(dataToSend, {
          status: formData.status,
          isActive: formData.isActive
        })
      }

      console.log('📤 Envoi des données:', dataToSend)

      const response = await fetch(
        room?.id ? `/api/rooms/${room.id}` : '/api/rooms',
        {
          method: room?.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data)
        if (data.details) {
          const errorMessages = data.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.error || `Erreur ${response.status}`)
      }

      // Toast de succès
      toast.success(room?.id ? 'Chambre modifiée avec succès' : 'Chambre créée avec succès')
      
      // Appeler onSubmit avec les données créées/modifiées pour la mise à jour du parent
      if (onSubmit) {
        await onSubmit(data.data)
      }
      
      setShowSuccessAnimation(true)
      setTimeout(() => {
        onClose()
        setShowSuccessAnimation(false)
      }, 1500)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      setValidationErrors({ submit: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalBeds = formData.bedConfigurations.reduce((sum, bed) => sum + bed.count, 0)

  const getSecurityDepositAmount = () => {
    switch (formData.paymentConfig.securityDepositType) {
      case 'ONE_MONTH': return formData.price
      case 'TWO_MONTHS': return formData.price * 2
      case 'CUSTOM': return formData.paymentConfig.securityDepositAmount || 0
      default: return formData.price
    }
  }

  // Nettoyage des URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl h-[95vh] sm:h-[90vh] max-h-[95vh] sm:max-h-[90vh] flex flex-col relative overflow-hidden"
          >
            {/* Success Animation Overlay */}
            <AnimatePresence>
              {showSuccessAnimation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur z-50 flex items-center justify-center rounded-t-3xl sm:rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {room ? `Modifier ${room.name}` : 'Nouvelle chambre'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {room ? 'Modifiez les informations de la chambre' : 'Créez une nouvelle chambre'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages d'état améliorés - Fixed */}
            <AnimatePresence>
              {(Object.keys(validationErrors).length > 0 || successMessage) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 sm:px-6 py-3 space-y-2 bg-gray-50 flex-shrink-0"
                >
                  {Object.entries(validationErrors).map(([key, error]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  ))}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
                    >
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{successMessage}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation tabs améliorée - Fixed */}
            <div className="border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon
                  const hasError = (index === 0 && (validationErrors.name || validationErrors.number || validationErrors.price || validationErrors.surface || validationErrors.description)) ||
                                   (index === 1 && validationErrors.beds) ||
                                   (index === 5 && validationErrors.payment)
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(index)}
                      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors min-w-fit whitespace-nowrap ${
                        activeTab === index
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {hasError && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form Content - Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                
                {/* Onglet Base */}
                {activeTab === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la chambre *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                          validationErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Studio Cosy"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro *
                        </label>
                        <input
                          type="number"
                          value={formData.number}
                          onChange={(e) => setFormData(prev => ({ ...prev, number: parseInt(e.target.value) || 0 }))}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                            validationErrors.number ? 'border-red-300' : 'border-gray-300'
                          }`}
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Étage
                        </label>
                        <select
                          value={formData.floor}
                          onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        >
                          <option value="0">Rez-de-chaussée</option>
                          <option value="1">1er étage</option>
                          <option value="2">2ème étage</option>
                          <option value="3">3ème étage</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prix (€/mois) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                              validationErrors.price ? 'border-red-300' : 'border-gray-300'
                            }`}
                            min="100"
                            step="10"
                            required
                          />
                          <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Surface (m²) *
                        </label>
                        <input
                          type="number"
                          value={formData.surface}
                          onChange={(e) => setFormData(prev => ({ ...prev, surface: parseFloat(e.target.value) || 0 }))}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                            validationErrors.surface ? 'border-red-300' : 'border-gray-300'
                          }`}
                          min="5"
                          step="0.5"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                          validationErrors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        rows={4}
                        placeholder="Décrivez les points forts de cette chambre..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length} caractères (minimum 10)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statut
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as RoomStatus }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        >
                          <option value="AVAILABLE">Disponible</option>
                          <option value="OCCUPIED">Occupée</option>
                          <option value="MAINTENANCE">En maintenance</option>
                          <option value="UNAVAILABLE">Indisponible</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Orientation
                        </label>
                        <select
                          value={formData.orientation}
                          onChange={(e) => setFormData(prev => ({ ...prev, orientation: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        >
                          <option value="Nord">Nord</option>
                          <option value="Sud">Sud</option>
                          <option value="Est">Est</option>
                          <option value="Ouest">Ouest</option>
                          <option value="Nord-Est">Nord-Est</option>
                          <option value="Nord-Ouest">Nord-Ouest</option>
                          <option value="Sud-Est">Sud-Est</option>
                          <option value="Sud-Ouest">Sud-Ouest</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">
                          Chambre active
                        </span>
                        <span className="text-xs text-gray-600">
                          La chambre sera visible et réservable sur le site
                        </span>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* Onglet Couchage */}
                {activeTab === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Configuration couchage
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {totalBeds} lit{totalBeds > 1 ? 's' : ''} au total
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addBedConfiguration}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition-colors"
                        disabled={formData.bedConfigurations.length >= 4}
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un lit
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.bedConfigurations.map((bed, index) => (
                        <motion.div 
                          key={bed.id} 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de lit
                              </label>
                              <select
                                value={bed.type}
                                onChange={(e) => updateBedConfiguration(bed.id, 'type', e.target.value as BedType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                              >
                                {Object.entries(bedTypeLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>

                            <div className="w-32">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantité
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateBedConfiguration(bed.id, 'count', Math.max(1, bed.count - 1))}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  disabled={bed.count <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  value={bed.count}
                                  onChange={(e) => updateBedConfiguration(bed.id, 'count', parseInt(e.target.value) || 1)}
                                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                                  min="1"
                                  max="4"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateBedConfiguration(bed.id, 'count', Math.min(4, bed.count + 1))}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  disabled={bed.count >= 4}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {formData.bedConfigurations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBedConfiguration(bed.id)}
                                className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {validationErrors.beds && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.beds}
                        </p>
                      </div>
                    )}

                    <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sheetsProvided}
                        onChange={(e) => setFormData(prev => ({ ...prev, sheetsProvided: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-blue-900 block">
                          Draps et linge de lit fournis
                        </span>
                        <span className="text-xs text-blue-700">
                          Inclus dans la location
                        </span>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* Onglet Cuisine */}
                {activeTab === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Configuration cuisine</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type de cuisine
                          </label>
                          <select
                            value={formData.kitchenType}
                            onChange={(e) => setFormData(prev => ({ ...prev, kitchenType: e.target.value as KitchenType }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            <option value="SHARED">Cuisine partagée</option>
                            <option value="PRIVATE">Cuisine privée</option>
                            <option value="KITCHENETTE">Kitchenette</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Équipements de cuisine
                          </label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.hasMicrowave}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasMicrowave: e.target.checked }))}
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-sm">Micro-ondes</span>
                            </label>
                            
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.hasOven}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasOven: e.target.checked }))}
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-sm">Four</span>
                            </label>
                            
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.hasCookingPlates}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasCookingPlates: e.target.checked }))}
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-sm">Plaques de cuisson</span>
                            </label>
                          </div>
                        </div>

                        {formData.hasCookingPlates && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Type de plaques
                            </label>
                            <select
                              value={formData.cookingPlateType}
                              onChange={(e) => setFormData(prev => ({ ...prev, cookingPlateType: e.target.value as CookingPlateType }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                              <option value="INDUCTION">Induction</option>
                              <option value="ELECTRIC">Électrique</option>
                              <option value="GAS">Gaz</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onglet Équipements */}
                {activeTab === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Équipements de la chambre</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasPrivateBathroom}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasPrivateBathroom: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Salle de bain privée</span>
                            <span className="text-xs text-gray-500">Douche et WC privatifs</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasBalcony}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasBalcony: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Balcon</span>
                            <span className="text-xs text-gray-500">Espace extérieur privatif</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasDesk}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasDesk: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Bureau</span>
                            <span className="text-xs text-gray-500">Espace de travail</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasCloset}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasCloset: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Armoire</span>
                            <span className="text-xs text-gray-500">Rangement vêtements</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasWindow}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasWindow: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Fenêtre</span>
                            <span className="text-xs text-gray-500">Lumière naturelle</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasTV}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasTV: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Télévision</span>
                            <span className="text-xs text-gray-500">Smart TV connectée</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Règlement</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.petsAllowed}
                            onChange={(e) => setFormData(prev => ({ ...prev, petsAllowed: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Animaux acceptés</span>
                            <span className="text-xs text-gray-500">Chats et petits chiens</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.smokingAllowed}
                            onChange={(e) => setFormData(prev => ({ ...prev, smokingAllowed: e.target.checked }))}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium block">Fumeurs acceptés</span>
                            <span className="text-xs text-gray-500">Dans la chambre uniquement</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onglet Images */}
                {activeTab === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Photos de la chambre</h3>
                      
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-2">
                            Glissez-déposez vos images ici ou cliquez pour parcourir
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG ou WebP • Max 5MB par image
                          </p>
                          <button
                            type="button"
                            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                          >
                            Choisir des images
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ou ajoutez une URL d'image
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            <button
                              type="button"
                              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>

                        {/* Aperçu des images */}
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={image} 
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lien visite virtuelle 360° (optionnel)
                        </label>
                        <input
                          type="url"
                          value={formData.virtualTour}
                          onChange={(e) => setFormData(prev => ({ ...prev, virtualTour: e.target.value }))}
                          placeholder="https://matterport.com/..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onglet Paiement */}
                {activeTab === 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Configuration des paiements</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jour de prélèvement du loyer
                          </label>
                          <select
                            value={formData.paymentConfig.rentDueDay}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              paymentConfig: { 
                                ...prev.paymentConfig, 
                                rentDueDay: parseInt(e.target.value) 
                              }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            <option value="1">Le 1er de chaque mois</option>
                            <option value="5">Le 5 de chaque mois</option>
                            <option value="10">Le 10 de chaque mois</option>
                            <option value="15">Le 15 de chaque mois</option>
                            <option value="20">Le 20 de chaque mois</option>
                            <option value="25">Le 25 de chaque mois</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dépôt de garantie
                          </label>
                          <select
                            value={formData.paymentConfig.securityDepositType}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              paymentConfig: { 
                                ...prev.paymentConfig, 
                                securityDepositType: e.target.value as 'ONE_MONTH' | 'TWO_MONTHS' | 'CUSTOM'
                              }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            <option value="ONE_MONTH">1 mois de loyer</option>
                            <option value="TWO_MONTHS">2 mois de loyer</option>
                            <option value="CUSTOM">Montant personnalisé</option>
                          </select>
                        </div>

                        {formData.paymentConfig.securityDepositType === 'CUSTOM' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Montant du dépôt de garantie (€)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={formData.paymentConfig.securityDepositAmount || ''}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  paymentConfig: { 
                                    ...prev.paymentConfig, 
                                    securityDepositAmount: parseFloat(e.target.value) || 0
                                  }
                                }))}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                min="0"
                                step="10"
                              />
                              <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-xl">
                          <h4 className="font-medium text-blue-900 mb-2">Mode de paiement</h4>
                          <div className="flex items-center gap-2 text-blue-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-sm">Virement bancaire automatique</span>
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            Les locataires effectuent un virement permanent à la date choisie
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="font-medium text-gray-700 mb-3">Récapitulatif</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loyer mensuel :</span>
                              <span className="font-medium">{formData.price}€</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dépôt de garantie :</span>
                              <span className="font-medium">
                                {formData.paymentConfig.securityDepositType === 'ONE_MONTH' && `${formData.price}€`}
                                {formData.paymentConfig.securityDepositType === 'TWO_MONTHS' && `${formData.price * 2}€`}
                                {formData.paymentConfig.securityDepositType === 'CUSTOM' && `${formData.paymentConfig.securityDepositAmount || 0}€`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date de prélèvement :</span>
                              <span className="font-medium">Le {formData.paymentConfig.rentDueDay} du mois</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer avec navigation et actions - Fixed */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4 flex-shrink-0">
                {/* Indicateurs de progression */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2">
                    {tabs.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === activeTab 
                            ? 'w-8 bg-black' 
                            : index < activeTab 
                              ? 'w-6 bg-gray-400' 
                              : 'w-6 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Boutons de navigation et d'action */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                    disabled={activeTab === 0}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      activeTab === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Précédent</span>
                  </button>

                  <div className="flex gap-3 flex-1 justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                      disabled={isSubmitting}
                    >
                      Annuler
                    </button>
                    
                    {activeTab < tabs.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(Math.min(tabs.length - 1, activeTab + 1))}
                        className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                      >
                        <span>Suivant</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[140px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{room ? 'Modifier' : 'Créer'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}