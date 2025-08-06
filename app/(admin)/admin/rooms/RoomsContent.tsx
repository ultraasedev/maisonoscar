'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Home,
  Users,
  Euro,
  Calendar,
  MapPin,
  Wifi,
  Car,
  Bed,
  Bath,
  Square,
  AlertCircle
} from 'lucide-react'
import { useRooms, Room } from '@/hooks/useRooms'
import RoomModal from '@/components/admin/rooms/roommodal'
import { motion, AnimatePresence } from 'framer-motion'

// Composant StatusBadge
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    AVAILABLE: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
    OCCUPIED: { label: 'Occupée', color: 'bg-blue-100 text-blue-800' },
    MAINTENANCE: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    RESERVED: { label: 'Réservée', color: 'bg-purple-100 text-purple-800' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AVAILABLE

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  )
}

// Composant RoomCard
function RoomCard({ 
  room, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  room: Room
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
  onView: (room: Room) => void
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 rounded-t-xl overflow-hidden">
        {room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home className="h-12 w-12" />
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={room.status} />
        </div>

        {/* Actions dropdown */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={() => onView(room)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Voir les détails
                  </button>
                  <button
                    onClick={() => onEdit(room)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(room)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {room.name}
          </h3>
          <span className="text-xl font-bold text-gray-900">
            {room.price}€
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Chambre {room.number} • {room.surface}m² • Étage {room.floor}
        </p>

        {/* Équipements */}
        <div className="flex flex-wrap gap-2 mb-3">
          {room.hasPrivateBathroom && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              <Bath className="h-3 w-3" />
              SdB privée
            </span>
          )}
          {room.hasBalcony && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              <Square className="h-3 w-3" />
              Balcon
            </span>
          )}
          <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            <MapPin className="h-3 w-3" />
            {room.orientation}
          </span>
        </div>

        {/* Résident actuel */}
        {room.bookings && room.bookings.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {room.bookings[0].user.firstName} {room.bookings[0].user.lastName}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function RoomsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priceFilter, setPriceFilter] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const { data: roomsData, loading, error, refresh } = useRooms()

  // Filtrer les chambres
  const filteredRooms = roomsData?.data?.filter((room: Room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.number.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter
    
    const matchesPrice = priceFilter === 'ALL' || 
                        (priceFilter === 'LOW' && room.price < 600) ||
                        (priceFilter === 'MEDIUM' && room.price >= 600 && room.price < 700) ||
                        (priceFilter === 'HIGH' && room.price >= 700)

    return matchesSearch && matchesStatus && matchesPrice
  }) || []

  const handleAddRoom = () => {
    setSelectedRoom(null)
    setShowAddModal(true)
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowAddModal(true)
  }

  const handleViewRoom = (room: Room) => {
    // TODO: Ouvrir modal de détails
    console.log('Voir détails chambre:', room)
  }

  const handleDeleteRoom = (room: Room) => {
    // TODO: Confirmer et supprimer
    console.log('Supprimer chambre:', room)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-xl"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refresh()}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Chambres</h1>
          <p className="text-gray-600 mt-1">
            {filteredRooms.length} chambre{filteredRooms.length > 1 ? 's' : ''} 
            {roomsData?.data && roomsData.data.length !== filteredRooms.length && 
              ` sur ${roomsData.data.length}`
            }
          </p>
        </div>
        
        <button
          onClick={handleAddRoom}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Ajouter une chambre
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher une chambre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="OCCUPIED">Occupée</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Réservée</option>
          </select>

          {/* Filtre prix */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          >
            <option value="ALL">Tous les prix</option>
            <option value="LOW">Moins de 600€</option>
            <option value="MEDIUM">600€ - 700€</option>
            <option value="HIGH">Plus de 700€</option>
          </select>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Liste des chambres */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'ALL' || priceFilter !== 'ALL' 
              ? 'Aucune chambre trouvée' 
              : 'Aucune chambre créée'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'ALL' || priceFilter !== 'ALL'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre première chambre'
            }
          </p>
          {(!searchTerm && statusFilter === 'ALL' && priceFilter === 'ALL') && (
            <button
              onClick={handleAddRoom}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ajouter une chambre
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room: Room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
              onView={handleViewRoom}
            />
          ))}
        </div>
      )}

      {/* Modal d'ajout/modification */}
      <RoomModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        room={selectedRoom}
        onSuccess={() => {
          refresh() // Recharger la liste
          setShowAddModal(false)
          setSelectedRoom(null)
        }}
      />
    </div>
  )
}