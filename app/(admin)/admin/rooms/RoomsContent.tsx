'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Euro,
  Users,
  Calendar,
  Home,
  Filter,
  X,
  MapPin,
  Bed,
  Bath,
  Square,
  Settings,
  ImageIcon,
  Wifi,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  Clock,
  Key,
  Loader2
} from 'lucide-react'
import { useRooms, useRoomMutations } from '@/hooks/useRooms'
import { Room } from '@/hooks/useRooms'
import toast from 'react-hot-toast'
import RoomModal from '@/components/admin/rooms/roommodal'

// Types pour les statuts des chambres
type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE'

// Configuration des statuts
const statusConfig: Record<RoomStatus, {
  label: string
  color: string
  icon: typeof CheckCircle
  dot: string
}> = {
  AVAILABLE: { 
    label: 'Disponible', 
    color: 'bg-green-100 text-green-700 border-green-200', 
    icon: CheckCircle,
    dot: 'bg-green-500'
  },
  OCCUPIED: { 
    label: 'Occupée', 
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    icon: Users,
    dot: 'bg-blue-500'
  },
  MAINTENANCE: { 
    label: 'Maintenance', 
    color: 'bg-orange-100 text-orange-700 border-orange-200', 
    icon: Wrench,
    dot: 'bg-orange-500'
  },
  UNAVAILABLE: { 
    label: 'Indisponible', 
    color: 'bg-red-100 text-red-700 border-red-200', 
    icon: Lock,
    dot: 'bg-red-500'
  }
}

// Composant Image avec gestion d'erreur
function RoomImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setImageError(false)
    setLoading(true)
  }, [src])

  if (!src || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Home className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true)
          setLoading(false)
        }}
      />
    </div>
  )
}

// Composant Card moderne
function RoomCard({ room, onView, onEdit, onToggleStatus }: {
  room: Room
  onView: () => void
  onEdit: () => void
  onToggleStatus: (status: RoomStatus) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const statusInfo = statusConfig[room.status]
  const StatusIcon = statusInfo.icon
  const currentTenant = room.bookings?.find(b => b.status === 'ACTIVE')?.user
  const totalBeds = room.bedCount || 1

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-56">
        <RoomImage
          src={room.images?.[0]}
          alt={room.name}
          className="w-full h-full"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color} backdrop-blur-sm bg-white/90`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </div>
        </div>

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[180px] py-1 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onView()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </button>
                  
                  <button
                    onClick={() => {
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  {room.status !== 'MAINTENANCE' && (
                    <button
                      onClick={() => {
                        onToggleStatus('MAINTENANCE')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      Maintenance
                    </button>
                  )}
                  
                  {room.status === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        onToggleStatus('UNAVAILABLE')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Bloquer
                    </button>
                  )}
                  
                  {(room.status === 'MAINTENANCE' || room.status === 'UNAVAILABLE') && (
                    <button
                      onClick={() => {
                        onToggleStatus('AVAILABLE')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Unlock className="w-4 h-4" />
                      Rendre disponible
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Images count */}
        {room.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
            <ImageIcon className="w-3 h-3 inline mr-1" />
            {room.images.length}
          </div>
        )}

        {/* Inactive badge */}
        {room.isActive === false && (
          <div className="absolute bottom-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Désactivée
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{room.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Chambre #{room.number} • Étage {room.floor}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{room.price}€</p>
            <p className="text-xs text-gray-500">par mois</p>
          </div>
        </div>

        {/* Current Tenant */}
        {currentTenant && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 truncate">
                {currentTenant.firstName} {currentTenant.lastName}
              </p>
              <p className="text-xs text-blue-600 truncate">{currentTenant.email}</p>
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Square className="w-4 h-4 mx-auto mb-1 text-gray-600" />
            <p className="text-xs font-medium text-gray-900">{room.surface}m²</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Bed className="w-4 h-4 mx-auto mb-1 text-gray-600" />
            <p className="text-xs font-medium text-gray-900">{totalBeds} lit{totalBeds > 1 ? 's' : ''}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Euro className="w-4 h-4 mx-auto mb-1 text-gray-600" />
            <p className="text-xs font-medium text-gray-900">{room.price}€</p>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {room.hasPrivateBathroom && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              <Bath className="w-3 h-3" />
              SDB privée
            </span>
          )}
          {room.hasBalcony && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              Balcon
            </span>
          )}
          {room.hasTV && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              TV
            </span>
          )}
          {room.hasDesk && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              Bureau
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Détails
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Composant Room Details Modal
function RoomDetailsModal({ room, isOpen, onClose }: { room: Room | null; isOpen: boolean; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  if (!room || !isOpen) return null

  const statusInfo = statusConfig[room.status]
  const StatusIcon = statusInfo.icon
  const currentTenant = room.bookings?.find(b => b.status === 'ACTIVE')?.user
  const totalBeds = room.bedCount || 1

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
            className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{room.name}</h2>
                <p className="text-sm text-gray-500">Chambre #{room.number} • Étage {room.floor}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Images */}
              {room.images.length > 0 && (
                <div className="relative h-64 sm:h-80 bg-gray-100">
                  <RoomImage
                    src={room.images[currentImageIndex]}
                    alt={`${room.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full"
                  />
                  
                  {room.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % room.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                        {room.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-4 sm:p-6 space-y-6">
                {/* Status and Price */}
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${statusInfo.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusInfo.label}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{room.price}€</p>
                    <p className="text-sm text-gray-500">par mois</p>
                  </div>
                </div>

                {/* Current Tenant */}
                {currentTenant && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-medium text-blue-900 mb-2">Locataire actuel</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">
                          {currentTenant.firstName} {currentTenant.lastName}
                        </p>
                        <p className="text-sm text-blue-600">{currentTenant.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Surface</p>
                    <p className="text-lg font-semibold">{room.surface}m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Orientation</p>
                    <p className="text-lg font-semibold">{room.orientation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type de lit</p>
                    <p className="text-lg font-semibold">{room.bedType || 'DOUBLE'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre de lits</p>
                    <p className="text-lg font-semibold">{totalBeds}</p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Équipements</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'hasPrivateBathroom', label: 'Salle de bain privée', icon: Bath },
                      { key: 'hasBalcony', label: 'Balcon', icon: Home },
                      { key: 'hasDesk', label: 'Bureau', icon: Settings },
                      { key: 'hasCloset', label: 'Placard', icon: Home },
                      { key: 'hasWindow', label: 'Fenêtre', icon: Home },
                      { key: 'hasTV', label: 'Télévision', icon: Settings }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          room[key as keyof Room] ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className={
                          room[key as keyof Room] ? 'text-gray-900' : 'text-gray-400'
                        }>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {room.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{room.description}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant principal RoomsContent
export default function RoomsContent() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  // Utilisation des hooks pour récupérer les données
  const { data: roomsData, loading, error, refresh } = useRooms({
    status: filterStatus === 'ALL' ? undefined : filterStatus
  })
  
  const { updateRoom, toggleRoomStatus } = useRoomMutations()

  const rooms: Room[] = roomsData?.data || []

  // Filtrage des chambres
  const filteredRooms = rooms.filter((room: Room) => {
    const matchesSearch = !searchQuery || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.number.toString().includes(searchQuery)
    
    return matchesSearch
  })

  // Stats
  const stats = {
    total: rooms.length,
    available: rooms.filter((r: Room) => r.status === 'AVAILABLE').length,
    occupied: rooms.filter((r: Room) => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter((r: Room) => r.status === 'MAINTENANCE').length,
    revenue: rooms.filter((r: Room) => r.status === 'OCCUPIED').reduce((sum: number, r: Room) => sum + r.price, 0)
  }

  const handleToggleStatus = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await toggleRoomStatus(roomId, newStatus)
      toast.success('Statut modifié avec succès')
      refresh()
    } catch (error) {
      toast.error('Erreur lors de la modification du statut')
    }
  }

  const handleCreateRoom = async () => {
    // Le RoomModal gère maintenant l'appel API directement
    await refresh()
    setShowCreateModal(false)
    toast.success('Chambre créée avec succès')
  }

  const handleEditRoom = async () => {
    // Le RoomModal gère maintenant l'appel API directement
    await refresh()
    setShowEditModal(false)
    setSelectedRoom(null)
    toast.success('Chambre modifiée avec succès')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          {/* Title + Actions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chambres</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredRooms.length} résultat{filteredRooms.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle</span>
              </button>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <Filter className="w-4 h-4" />
              {filterStatus !== 'ALL' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Stats horizontaux sur mobile */}
        <div className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-sm font-bold">{stats.total}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-green-100 rounded-lg">
              <p className="text-xs text-green-600">Disponibles</p>
              <p className="text-sm font-bold text-green-700">{stats.available}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-600">Occupées</p>
              <p className="text-sm font-bold text-blue-700">{stats.occupied}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-orange-100 rounded-lg">
              <p className="text-xs text-orange-600">Maintenance</p>
              <p className="text-sm font-bold text-orange-700">{stats.maintenance}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-600">Revenus/mois</p>
              <p className="text-sm font-bold text-purple-700">{stats.revenue}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => refresh()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </motion.div>
        ) : filteredRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune chambre trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'ALL' 
                ? 'Essayez de modifier vos filtres.'
                : 'Commencez par créer votre première chambre.'
              }
            </p>
            {!(searchQuery || filterStatus !== 'ALL') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer une chambre
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room: Room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onView={() => {
                    setSelectedRoom(room)
                    setShowDetailsModal(true)
                  }}
                  onEdit={() => {
                    setSelectedRoom(room)
                    setShowEditModal(true)
                  }}
                  onToggleStatus={(status) => handleToggleStatus(room.id, status)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Filter Modal Mobile */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtres</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFilterStatus('ALL')}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === 'ALL'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Tous
                    </button>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === key
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium"
              >
                Appliquer les filtres
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Details Modal */}
      <RoomDetailsModal
        room={selectedRoom}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedRoom(null)
        }}
      />

      {/* Create/Edit Modal */}
      <RoomModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false)
          setShowEditModal(false)
          setSelectedRoom(null)
        }}
        room={showEditModal ? selectedRoom : null}
        onSubmit={showEditModal ? handleEditRoom : handleCreateRoom}
      />
    </div>
  )
}