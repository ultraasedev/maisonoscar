'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  Home,
  Euro,
  Square,
  MapPin,
  Bath,
  Bed,
  Wifi,
  Car,
  AlertCircle,
  Camera,
  ChefHat,
  Tv,
  Sun,
  Moon,
  Cloud,
  Coffee,
  Utensils,
  Shirt,
  PawPrint,
  Cigarette,
  Users,
  Sofa
} from 'lucide-react'
import { useRoomMutations, Room, CreateRoomData, UpdateRoomData } from '@/hooks/useRooms'

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  room?: Room | null
  onSuccess: () => void
}

const statusOptions = [
  { value: 'AVAILABLE', label: 'Disponible', color: 'bg-green-100 text-green-800' },
  { value: 'OCCUPIED', label: 'Occupée', color: 'bg-blue-100 text-blue-800' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  { value: 'RESERVED', label: 'Réservée', color: 'bg-purple-100 text-purple-800' }
]

const orientationOptions = [
  'Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest'
]

const bedTypeOptions = [
  { value: 'SINGLE', label: '1 lit simple (90x200)', icon: Bed },
  { value: 'DOUBLE', label: '1 lit double (140x200)', icon: Bed },
  { value: 'QUEEN', label: '1 lit queen (160x200)', icon: Bed },
  { value: 'KING', label: '1 lit king (180x200)', icon: Bed },
  { value: 'BUNK', label: 'Lits superposés', icon: Users }
]

const kitchenTypeOptions = [
  { value: 'SHARED', label: 'Cuisine partagée', icon: Users },
  { value: 'KITCHENETTE', label: 'Kitchenette', icon: Coffee },
  { value: 'PRIVATE', label: 'Cuisine privée', icon: ChefHat }
]

const exposureOptions = [
  { value: 'SUNNY', label: 'Ensoleillée', icon: Sun },
  { value: 'SHADED', label: 'Ombragée', icon: Cloud },
  { value: 'MIXED', label: 'Mi-ombre', icon: Moon }
]

const cookingPlateOptions = [
  { value: 'GAS', label: 'Gaz' },
  { value: 'INDUCTION', label: 'Induction' },
  { value: 'ELECTRIC', label: 'Électrique' }
]

export default function RoomModal({ isOpen, onClose, room, onSuccess }: RoomModalProps) {
  const { createRoom, updateRoom, loading, error, clearError } = useRoomMutations()
  const isEditing = !!room

  // État du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState<CreateRoomData>({
    name: '',
    number: 1,
    price: 500,
    surface: 12,
    description: '',
    hasPrivateBathroom: false,
    hasBalcony: false,
    hasDesk: true,
    hasCloset: true,
    hasWindow: true,
    floor: 0,
    orientation: 'Sud',
    images: [],
    virtualTour: '',
    isVirtualTourActive: false,
    bedType: 'DOUBLE',
    bedCount: 1,
    kitchenType: 'SHARED',
    kitchenEquipment: [],
    hasMicrowave: false,
    hasOven: false,
    hasCookingPlates: false,
    cookingPlateType: 'INDUCTION',
    sheetsProvided: true,
    hasTV: false,
    petsAllowed: false,
    smokingAllowed: false,
    exposure: 'SUNNY'
  })

  const [statusData, setStatusData] = useState({
    status: 'AVAILABLE' as Room['status'],
    isActive: true
  })

  const [newImageUrl, setNewImageUrl] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [activeTab, setActiveTab] = useState('basic')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Initialiser le formulaire si on édite
  useEffect(() => {
    if (room && isOpen) {
      setFormData({
        name: room.name,
        number: room.number,
        price: room.price,
        surface: room.surface,
        description: room.description || '',
        hasPrivateBathroom: room.hasPrivateBathroom,
        hasBalcony: room.hasBalcony,
        hasDesk: room.hasDesk,
        hasCloset: room.hasCloset,
        hasWindow: room.hasWindow,
        floor: room.floor,
        orientation: room.orientation,
        images: room.images,
        virtualTour: room.virtualTour || '',
        isVirtualTourActive: room.isVirtualTourActive,
        bedType: room.bedType || 'DOUBLE',
        bedCount: room.bedCount || 1,
        kitchenType: room.kitchenType || 'SHARED',
        kitchenEquipment: room.kitchenEquipment || [],
        hasMicrowave: room.hasMicrowave || false,
        hasOven: room.hasOven || false,
        hasCookingPlates: room.hasCookingPlates || false,
        cookingPlateType: room.cookingPlateType || 'INDUCTION',
        sheetsProvided: room.sheetsProvided !== false,
        hasTV: room.hasTV || false,
        petsAllowed: room.petsAllowed || false,
        smokingAllowed: room.smokingAllowed || false,
        exposure: room.exposure || 'SUNNY'
      })
      setStatusData({
        status: room.status,
        isActive: true
      })
      setImageUrls(room.images.length > 0 ? room.images : [''])
    } else if (!isOpen) {
      // Reset form
      setFormData({
        name: '',
        number: 1,
        price: 500,
        surface: 12,
        description: '',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 0,
        orientation: 'Sud',
        images: [],
        virtualTour: '',
        isVirtualTourActive: false,
        bedType: 'DOUBLE',
        bedCount: 1,
        kitchenType: 'SHARED',
        kitchenEquipment: [],
        hasMicrowave: false,
        hasOven: false,
        hasCookingPlates: false,
        cookingPlateType: 'INDUCTION',
        sheetsProvided: true,
        hasTV: false,
        petsAllowed: false,
        smokingAllowed: false,
        exposure: 'SUNNY'
      })
      setStatusData({ status: 'AVAILABLE', isActive: true })
      setImageUrls([''])
      setActiveTab('basic')
      setValidationErrors({})
      clearError()
    }
  }, [room, isOpen, clearError])

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Le nom est requis'
    if (formData.number < 1) errors.number = 'Le numéro doit être positif'
    if (formData.price < 1) errors.price = 'Le prix doit être positif'
    if (formData.surface < 1) errors.surface = 'La surface doit être positive'
    if (formData.description.length < 10) errors.description = 'La description doit faire au moins 10 caractères'
    if (formData.bedCount < 1) errors.bedCount = 'Il doit y avoir au moins 1 lit'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Gestion des changements
  const handleInputChange = (field: keyof CreateRoomData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleStatusChange = (field: keyof typeof statusData, value: any) => {
    setStatusData(prev => ({ ...prev, [field]: value }))
  }

  // Gestion des images multiples
  const addImageField = () => {
    setImageUrls(prev => [...prev, ''])
  }

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = url
    setImageUrls(newUrls)
    
    // Mettre à jour formData avec les URLs valides
    const validUrls = newUrls.filter(url => url.trim() !== '')
    setFormData(prev => ({ ...prev, images: validUrls }))
  }

  const removeImageField = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls.length === 0 ? [''] : newUrls)
    
    const validUrls = newUrls.filter(url => url.trim() !== '')
    setFormData(prev => ({ ...prev, images: validUrls }))
  }

  // Équipements cuisine
  const toggleKitchenEquipment = (equipment: string) => {
    const current = formData.kitchenEquipment
    const updated = current.includes(equipment)
      ? current.filter(item => item !== equipment)
      : [...current, equipment]
    handleInputChange('kitchenEquipment', updated)
  }

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (isEditing && room) {
        const updateData: UpdateRoomData = {
          ...formData,
          ...statusData
        }
        await updateRoom(room.id, updateData)
      } else {
        await createRoom(formData)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      // Error handled by hook
    }
  }

  const tabs = [
    { id: 'basic', label: 'Informations de base', icon: Home },
    { id: 'bed', label: 'Couchage', icon: Bed },
    { id: 'kitchen', label: 'Cuisine', icon: ChefHat },
    { id: 'amenities', label: 'Équipements', icon: Wifi },
    { id: 'images', label: 'Images', icon: Camera },
    { id: 'rules', label: 'Règlement', icon: Users }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar avec tabs */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-lg">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isEditing ? 'Modifier' : 'Nouvelle'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isEditing ? `Chambre ${room?.number}` : 'Chambre'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all mb-2 ${
                        activeTab === tab.id
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Close button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Error Display */}
              {error && (
                <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="p-6">
                  {/* Tab Content */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Informations de base</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom de la chambre *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black ${
                              validationErrors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Ex: Studio Cosy Premium"
                          />
                          {validationErrors.name && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.number}
                            onChange={(e) => handleInputChange('number', parseInt(e.target.value) || 0)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black ${
                              validationErrors.number ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prix (€/mois) *
                          </label>
                          <div className="relative">
                            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={formData.price}
                              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Surface (m²) *
                          </label>
                          <div className="relative">
                            <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              min="1"
                              value={formData.surface}
                              onChange={(e) => handleInputChange('surface', parseFloat(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Étage
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.floor}
                            onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orientation
                          </label>
                          <select
                            value={formData.orientation}
                            onChange={(e) => handleInputChange('orientation', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          >
                            {orientationOptions.map(orientation => (
                              <option key={orientation} value={orientation}>
                                {orientation}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exposition
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {exposureOptions.map((option) => {
                              const Icon = option.icon
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleInputChange('exposure', option.value)}
                                  className={`flex items-center gap-2 p-3 border rounded-lg text-sm font-medium transition-all ${
                                    formData.exposure === option.value
                                      ? 'bg-black text-white border-black'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span>{option.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {isEditing && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Statut
                            </label>
                            <select
                              value={statusData.status}
                              onChange={(e) => handleStatusChange('status', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={4}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black ${
                            validationErrors.description ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Décrivez cette chambre en détail : ambiance, points forts, particularités..."
                        />
                        {validationErrors.description && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'bed' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Configuration couchage</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Type de lit *
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {bedTypeOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleInputChange('bedType', option.value)}
                                className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-all ${
                                  formData.bedType === option.value
                                    ? 'bg-black text-white border-black'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{option.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de lits
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={formData.bedCount}
                          onChange={(e) => handleInputChange('bedCount', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shirt className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Draps fournis</p>
                            <p className="text-sm text-gray-600">Linge de lit inclus dans le prix</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.sheetsProvided}
                            onChange={(e) => handleInputChange('sheetsProvided', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === 'kitchen' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Configuration cuisine</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Type de cuisine *
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {kitchenTypeOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleInputChange('kitchenType', option.value)}
                                className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-all ${
                                  formData.kitchenType === option.value
                                    ? 'bg-black text-white border-black'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{option.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {(formData.kitchenType === 'PRIVATE' || formData.kitchenType === 'KITCHENETTE') && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Coffee className="h-5 w-5 text-gray-600" />
                                <span className="font-medium">Micro-ondes</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.hasMicrowave}
                                onChange={(e) => handleInputChange('hasMicrowave', e.target.checked)}
                                className="w-4 h-4 rounded focus:ring-black"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Square className="h-5 w-5 text-gray-600" />
                                <span className="font-medium">Four</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.hasOven}
                                onChange={(e) => handleInputChange('hasOven', e.target.checked)}
                                className="w-4 h-4 rounded focus:ring-black"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Utensils className="h-5 w-5 text-gray-600" />
                                <span className="font-medium">Plaques</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.hasCookingPlates}
                                onChange={(e) => handleInputChange('hasCookingPlates', e.target.checked)}
                                className="w-4 h-4 rounded focus:ring-black"
                              />
                            </div>
                          </div>

                          {formData.hasCookingPlates && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de plaques
                              </label>
                              <select
                                value={formData.cookingPlateType}
                                onChange={(e) => handleInputChange('cookingPlateType', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                              >
                                {cookingPlateOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Équipements cuisine additionnels
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {['Réfrigérateur', 'Lave-vaisselle', 'Machine à café', 'Bouilloire', 'Grille-pain', 'Évier', 'Plan de travail', 'Rangements'].map((equipment) => (
                                <button
                                  key={equipment}
                                  type="button"
                                  onClick={() => toggleKitchenEquipment(equipment)}
                                  className={`p-3 text-sm border rounded-lg transition-all ${
                                    formData.kitchenEquipment.includes(equipment)
                                      ? 'bg-black text-white border-black'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {equipment}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Équipements et aménagements</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bath className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Salle de bain privée</p>
                              <p className="text-sm text-gray-600">Douche, WC et lavabo privatifs</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.hasPrivateBathroom}
                            onChange={(e) => handleInputChange('hasPrivateBathroom', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Square className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Balcon/Terrasse</p>
                              <p className="text-sm text-gray-600">Espace extérieur privé</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.hasBalcony}
                            onChange={(e) => handleInputChange('hasBalcony', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Sofa className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Bureau de travail</p>
                              <p className="text-sm text-gray-600">Espace de travail dédié</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.hasDesk}
                            onChange={(e) => handleInputChange('hasDesk', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Dressing/Armoire</p>
                              <p className="text-sm text-gray-600">Rangement pour vêtements</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.hasCloset}
                            onChange={(e) => handleInputChange('hasCloset', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Sun className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Fenêtre</p>
                              <p className="text-sm text-gray-600">Éclairage naturel</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.hasWindow}
                            onChange={(e) => handleInputChange('hasWindow', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Tv className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Télévision</p>
                              <p className="text-sm text-gray-600">TV dans la chambre</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.hasTV}
                            onChange={(e) => handleInputChange('hasTV', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visite virtuelle (optionnel)
                        </label>
                        <input
                          type="url"
                          value={formData.virtualTour}
                          onChange={(e) => handleInputChange('virtualTour', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="https://..."
                        />
                        
                        {formData.virtualTour && (
                          <label className="flex items-center mt-3 p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={formData.isVirtualTourActive}
                              onChange={(e) => handleInputChange('isVirtualTourActive', e.target.checked)}
                              className="mr-3 rounded focus:ring-black"
                            />
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="text-sm">Afficher la visite virtuelle sur le site</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'images' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Images de la chambre</h3>
                      
                      <div className="space-y-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-1">
                              <input
                                type="url"
                                value={url}
                                onChange={(e) => updateImageUrl(index, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                placeholder={`URL de l'image ${index + 1}`}
                              />
                            </div>
                            {url && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            {imageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageField(index)}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={addImageField}
                          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full justify-center"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter une image
                        </button>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Conseils pour de bonnes photos</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Prenez des photos avec une bonne luminosité naturelle</li>
                          <li>• Montrez différents angles de la chambre</li>
                          <li>• Incluez une photo de l'ensemble et des détails importants</li>
                          <li>• Utilisez des URLs d'images hébergées (Imgur, Google Photos, etc.)</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'rules' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Règlement de la chambre</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <PawPrint className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Animaux acceptés</p>
                              <p className="text-sm text-gray-600">Chats, chiens autorisés</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.petsAllowed}
                              onChange={(e) => handleInputChange('petsAllowed', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Cigarette className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Fumeur autorisé</p>
                              <p className="text-sm text-gray-600">Possibilité de fumer dans la chambre</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.smokingAllowed}
                              onChange={(e) => handleInputChange('smokingAllowed', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">⚠️ Règles importantes</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Les espaces communs doivent être respectés par tous</li>
                          <li>• Les invités doivent être déclarés à l'avance</li>
                          <li>• Le ménage des parties communes est inclus</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions fixées en bas */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {loading ? 'Enregistrement...' : (isEditing ? 'Modifier la chambre' : 'Créer la chambre')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}