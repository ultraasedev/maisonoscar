// Fichier : components/sections/RoomsSection.tsx
// Description : Section chambres qui récupère les données depuis la DB

'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Wifi, Coffee, Car, Sparkles, Eye, Camera, Calendar, X, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import BookingModal from '@/components/booking/CompleteBookingModal';

interface Room {
  id: string;
  name: string;
  number: number;
  surface: number;
  price: number;
  description?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE';
  isActive: boolean;
  floor: number;
  orientation: string;
  hasPrivateBathroom: boolean;
  hasBalcony: boolean;
  hasDesk: boolean;
  hasCloset: boolean;
  hasWindow: boolean;
  hasTV: boolean;
  images: string[];
  virtualTour?: string;
  isVirtualTourActive: boolean;
  bedType: string;
  bedCount: number;
  kitchenType: string;
  kitchenEquipment: string[];
  sheetsProvided: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  createdAt: string;
  updatedAt: string;
  nextAvailableDate?: string;
}

const commonSpaces = [
  {
    icon: Coffee,
    title: 'Cuisine moderne',
    description: 'Équipée et spacieuse'
  },
  {
    icon: Wifi,
    title: 'Salon connecté',
    description: 'Fibre et Netflix inclus'
  },
  {
    icon: Car,
    title: 'Parking sécurisé',
    description: 'Places garanties'
  },
  {
    icon: Sparkles,
    title: 'Ménage inclus',
    description: 'Parties communes'
  }
];

const RoomModal = ({ room, isOpen, onClose, onReserve }: { room: Room | null; isOpen: boolean; onClose: () => void; onReserve: (room: Room) => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!room) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  // Image par défaut si pas d'images
  const getImageUrl = (index: number) => {
    if (!room.images || room.images.length === 0) {
      return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500';
    }
    return room.images[index] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500';
  };

  const imageCount = room.images?.length || 1;

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
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative">
              <div className="relative h-64 sm:h-80">
                <img
                  src={getImageUrl(currentImageIndex)}
                  alt={room.name}
                  className="w-full h-full object-cover rounded-t-3xl"
                />
                <div className="absolute inset-0 bg-black/20 rounded-t-3xl"></div>
                
                {/* Image Navigation */}
                {imageCount > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {Array.from({ length: imageCount }).map((_, index) => (
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

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Room Status */}
              <div className="absolute top-4 left-4">
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  room.status === 'AVAILABLE' 
                    ? 'bg-green-500 text-white' 
                    : room.status === 'OCCUPIED'
                    ? 'bg-orange-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {room.status === 'AVAILABLE' ? 'Disponible immédiatement' : 
                   room.status === 'OCCUPIED' ? 
                   (room.nextAvailableDate ? 
                    `Disponible le ${new Date(room.nextAvailableDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : 
                    'Occupée') :
                   'Indisponible'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-black mb-2">
                    {room.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {room.description || 'Chambre confortable et lumineuse'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{room.surface}m²</span>
                    <span>•</span>
                    <span>Étage {room.floor}</span>
                    <span>•</span>
                    <span>{room.orientation}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-black">
                    {room.price}€
                  </div>
                  <div className="text-sm text-gray-500">
                    par mois
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black mb-4">
                  Équipements inclus
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.hasPrivateBathroom ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.hasPrivateBathroom ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Salle de bain privée
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.hasBalcony ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.hasBalcony ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Balcon
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.hasDesk ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.hasDesk ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Bureau
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.hasCloset ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.hasCloset ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Placard
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.hasWindow ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.hasWindow ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Fenêtre
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.hasTV ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.hasTV ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Télévision
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${room.sheetsProvided ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${room.sheetsProvided ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      Draps fournis
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">
                      {room.bedCount} {room.bedType === 'DOUBLE' ? 'lit double' : room.bedType === 'SINGLE' ? 'lit simple' : 'lit(s)'}
                    </span>
                  </div>
                </div>
              </div>

            {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.status === 'AVAILABLE' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-black text-[#F5F3F0] px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    onClick={() => onReserve(room)}
                  >
                    <Calendar className="w-5 h-5" />
                    Réserver maintenant
                  </motion.button>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-500 px-6 py-4 rounded-xl font-semibold cursor-not-allowed">
                    <Calendar className="w-5 h-5" />
                    {room.status === 'OCCUPIED' ? 
                      (room.nextAvailableDate ? 
                        `Disponible le ${new Date(room.nextAvailableDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : 
                        'Occupée') : 
                      'Non disponible'}
                  </div>
                )}
                
                {room.isVirtualTourActive && room.virtualTour && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 border-2 border-black text-black px-6 py-4 rounded-xl font-semibold hover:bg-black hover:text-[#F5F3F0] transition-colors"
                    onClick={() => window.open(room.virtualTour, '_blank')}
                  >
                    <Camera className="w-5 h-5" />
                    Visite 3D
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RoomCard = ({ room, index, onViewDetails, onReserve }: { room: Room; index: number; onViewDetails: (room: Room) => void; onReserve: (room: Room) => void }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // Image par défaut si pas d'images
  const getImageUrl = () => {
    if (!room.images || room.images.length === 0) {
      return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500';
    }
    return room.images[0];
  };

  // Obtenir les features principales
  const getFeatures = () => {
    const features = [];
    if (room.hasPrivateBathroom) features.push('Salle de bain privée');
    if (room.hasBalcony) features.push('Balcon');
    if (room.hasDesk) features.push('Bureau');
    if (features.length === 0) {
      features.push(`${room.surface}m²`);
      features.push(`Étage ${room.floor}`);
      features.push(room.orientation);
    }
    return features.slice(0, 3);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl border-gray-200 hover:border-gray-300`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500';
          }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
        
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            room.status === 'AVAILABLE' 
              ? 'bg-green-500 text-white' 
              : room.status === 'OCCUPIED'
              ? 'bg-orange-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {room.status === 'AVAILABLE' ? 'Disponible' : 
             room.status === 'OCCUPIED' ? 'Occupée' :
             'Indisponible'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-black mb-1 group-hover:text-gray-700 transition-colors">
              {room.name}
            </h3>
            <p className="text-gray-600 text-sm">{room.surface}m²</p>
            {room.status === 'OCCUPIED' && room.nextAvailableDate && (
              <p className="text-orange-600 text-xs mt-1">
                Disponible le {new Date(room.nextAvailableDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-black">
              {room.price}€
            </div>
            <div className="text-xs text-gray-500">
              charges incluses
            </div>
          </div>
        </div>

        <ul className="space-y-2 mb-6">
          {getFeatures().map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewDetails(room)}
            className="flex items-center justify-center gap-2 bg-[#F5F3F0] text-black px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            Détails
          </motion.button>
          
          {room.status === 'AVAILABLE' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onReserve(room)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors text-sm bg-black text-[#F5F3F0] hover:bg-gray-800"
            >
              <Calendar className="w-4 h-4" />
              Réserver
            </motion.button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-500 cursor-not-allowed">
              <Calendar className="w-4 h-4" />
              {room.status === 'OCCUPIED' ? 'Occupée' : 'Indisponible'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const RoomsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les chambres depuis la DB
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/rooms');
      const data = await response.json();
      
      if (data.success) {
        // Afficher toutes les chambres actives (disponibles ET occupées)
        const activeRooms = data.data.filter((room: Room) => room.isActive);
        setRooms(activeRooms);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des chambres:', err);
      setError('Impossible de charger les chambres');
    } finally {
      setLoading(false);
    }
  };

  const availableRooms = rooms.filter(room => room.status === 'AVAILABLE').length;
  const totalRooms = rooms.length;

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <>
      <section 
        ref={sectionRef}
        id="chambres"
        className="py-16 lg:py-24 bg-[#F5F3F0]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 lg:mb-16"
          >
            {totalRooms > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-600 mb-6"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {availableRooms} chambre{availableRooms > 1 ? 's' : ''} disponible{availableRooms > 1 ? 's' : ''} sur {totalRooms}
              </motion.div>
            )}
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Nos chambres
              <br />
              <span className="relative text-gray-600">
                uniques
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute bottom-2 left-0 w-full h-1 bg-black rounded-full origin-left"
                />
              </span>
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Chaque chambre a été pensée pour créer votre cocon personnel 
              tout en favorisant les rencontres dans nos espaces communs.
            </p>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-600">Chargement des chambres...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchRooms}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Aucune chambre disponible pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {rooms.map((room, index) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    index={index} 
                    onViewDetails={handleViewDetails}
                    onReserve={(room) => {
                      setBookingRoom(room);
                      setIsBookingModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Common Spaces */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold text-black mb-4">
                Espaces communs inclus
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Profitez de nos espaces partagés conçus pour faciliter les rencontres 
                et créer une véritable communauté.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {commonSpaces.map((space, index) => {
                const Icon = space.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-[#F5F3F0] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:text-[#F5F3F0] transition-all duration-300">
                      <Icon className="w-8 h-8 text-black group-hover:text-[#F5F3F0] transition-colors" />
                    </div>
                    <h4 className="font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                      {space.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {space.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Room Details Modal */}
      <RoomModal 
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={closeModal}
        onReserve={(room) => {
          setBookingRoom(room);
          setIsBookingModalOpen(true);
          setIsModalOpen(false);
        }}
      />
      
      {/* Booking Modal */}
      {bookingRoom && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setBookingRoom(null);
          }}
          roomId={bookingRoom.id}
          roomName={bookingRoom.name}
          roomPrice={bookingRoom.price}
        />
      )}
    </>
  );
};