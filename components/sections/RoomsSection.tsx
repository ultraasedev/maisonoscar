'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Wifi, Coffee, Car, Sparkles, Eye, Camera, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface Room {
  id: string;
  name: string;
  size: number;
  price: number;
  features: string[];
  available: boolean;
  isHighlight?: boolean;
  fullEquipment: string[];
  images: string[];
  description: string;
}

const rooms: Room[] = [
  {
    id: '1',
    name: 'Studio Cosy',
    size: 12,
    price: 520,
    features: ['Lit double', 'Bureau intégré', 'Rangements'],
    fullEquipment: ['Lit double 140x200 avec matelas premium', 'Bureau ergonomique avec chaise', 'Armoire 3 portes', 'Étagères murales', 'Miroir plein pied', 'Lampe de chevet', 'Rideaux occultants', 'Chauffage individuel'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500'
    ],
    description: 'Studio parfaitement optimisé pour les étudiants et jeunes actifs. Espace de vie compact mais fonctionnel.',
    available: true
  },
  {
    id: '2',
    name: 'Chambre Lumière',
    size: 15,
    price: 570,
    features: ['Vue jardin', 'Balcon privatif', 'Dressing'],
    fullEquipment: ['Lit double 140x200', 'Dressing walk-in', 'Bureau avec rangements', 'Balcon 4m²', 'Stores électriques', 'Prises USB intégrées', 'Éclairage LED', 'Plantes vertes incluses'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500'
    ],
    description: 'Chambre baignée de lumière naturelle avec accès direct au jardin via le balcon privatif.',
    available: true
  },
  {
    id: '3',
    name: 'Espace Zen',
    size: 14,
    price: 550,
    features: ['Ambiance calme', 'Coin lecture', 'Velux'],
    fullEquipment: ['Lit double 160x200', 'Coin lecture avec fauteuil', 'Velux électrique', 'Bureau d\'angle', 'Bibliothèque intégrée', 'Tapis berbère', 'Diffuseur d\'huiles essentielles', 'Plaid en laine'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500'
    ],
    description: 'Refuge paisible sous les toits, idéal pour la méditation et le travail concentré.',
    available: false
  },
  {
    id: '4',
    name: 'Chambre Panorama',
    size: 17,
    price: 630,
    features: ['Vue dégagée', 'Bureau XXL', 'Baie vitrée'],
    fullEquipment: ['Lit double 160x200', 'Bureau 180cm avec écran externe', 'Baie vitrée 3m', 'Fauteuil ergonomique', 'Rangements sur mesure', 'Mini-frigo', 'Machine à café', 'Tableau blanc'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500'
    ],
    description: 'Espace de travail premium avec vue panoramique, parfait pour les télétravailleurs.',
    available: true,
    isHighlight: true
  },
  {
    id: '5',
    name: 'Suite Master',
    size: 19,
    price: 680,
    features: ['Salle d\'eau privée', 'Dressing walk-in', 'Terrasse'],
    fullEquipment: ['Lit king size 180x200', 'Salle d\'eau avec douche italienne', 'Dressing 6m²', 'Terrasse privée 8m²', 'TV 55 pouces', 'Enceinte connectée', 'Climatisation', 'Mobilier design'],
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=500',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500'
    ],
    description: 'Suite parentale haut de gamme avec tous les équipements pour un confort optimal.',
    available: true,
    isHighlight: true
  },
  {
    id: '6',
    name: 'Chambre Design',
    size: 13,
    price: 540,
    features: ['Mobilier sur mesure', 'Coin détente', 'Éclairage LED'],
    fullEquipment: ['Lit double 140x200', 'Mobilier sur mesure', 'Éclairage LED RGB', 'Coin détente avec pouf', 'Miroir connecté', 'Prises sans fil', 'Déco moderne', 'Plantes dépolluantes'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500'
    ],
    description: 'Chambre au design contemporain avec mobilier créé spécialement pour l\'espace.',
    available: true
  },
  {
    id: '7',
    name: 'Espace Nature',
    size: 16,
    price: 590,
    features: ['Vue sur jardin', 'Plantes intégrées', 'Mezzanine'],
    fullEquipment: ['Lit double 160x200', 'Mezzanine bureau', 'Jardin vertical', 'Vue directe jardin', 'Matériaux naturels', 'Purificateur d\'air', 'Éclairage naturel', 'Coin yoga'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500'
    ],
    description: 'Connexion directe avec la nature grâce aux nombreuses plantes et la vue sur le jardin.',
    available: false
  },
  {
    id: '8',
    name: 'Chambre Minimaliste',
    size: 11,
    price: 500,
    features: ['Design épuré', 'Rangements cachés', 'Éclairage naturel'],
    fullEquipment: ['Lit double 140x200', 'Rangements invisibles', 'Bureau escamotable', 'Éclairage zénithal', 'Matériaux naturels', 'Déco minimaliste', 'Organiseurs intégrés', 'Miroir sans cadre'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500'
    ],
    description: 'L\'essentiel dans un espace optimisé. Parfait pour ceux qui aiment la simplicité.',
    available: true
  },
  {
    id: '9',
    name: 'Loft Urbain',
    size: 20,
    price: 720,
    features: ['Plafond haut', 'Espace salon', 'Cuisine privée'],
    fullEquipment: ['Lit queen size 160x200', 'Salon avec canapé', 'Cuisine équipée privée', 'Plafond 4m', 'Poutres apparentes', 'Espace de réception', 'TV grand écran', 'Sound system'],
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=500',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500'
    ],
    description: 'Véritable appartement dans la maison avec cuisine privée et espace de réception.',
    available: true,
    isHighlight: true
  }
];

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

const RoomModal = ({ room, isOpen, onClose }: { room: Room | null; isOpen: boolean; onClose: () => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!room) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

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
                <div 
                  className="w-full h-full bg-cover bg-center rounded-t-3xl"
                  style={{ backgroundImage: `url(${room.images[currentImageIndex]})` }}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-t-3xl"></div>
                </div>
                
                {/* Image Navigation */}
                {room.images.length > 1 && (
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
                  room.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {room.available ? 'Disponible' : 'Occupée'}
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
                    {room.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{room.size}m²</span>
                    <span>•</span>
                    <span>Meublée</span>
                    <span>•</span>
                    <span>Charges incluses</span>
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

              {/* Full Equipment */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black mb-4">
                  Équipements inclus
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {room.fullEquipment.map((equipment, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{equipment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 bg-black text-[#F5F3F0] px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                  disabled={!room.available}
                >
                  <Calendar className="w-5 h-5" />
                  {room.available ? 'Réserver' : 'Non disponible'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 border-2 border-black text-black px-6 py-4 rounded-xl font-semibold hover:bg-black hover:text-[#F5F3F0] transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Visite 3D
                </motion.button>
                
                
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RoomCard = ({ room, index, onViewDetails }: { room: Room; index: number; onViewDetails: (room: Room) => void }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl ${
        room.isHighlight 
          ? 'border-black ring-2 ring-black/5' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {room.isHighlight && (
        <div className="absolute -top-3 left-6 bg-black text-[#F5F3F0] px-4 py-1 rounded-full text-sm font-medium z-10">
          Premium
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${room.images[0]})` }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
        </div>
        
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            room.available 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {room.available ? 'Disponible' : 'Occupée'}
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
            <p className="text-gray-600 text-sm">{room.size}m²</p>
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
          {room.features.map((feature, idx) => (
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
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
              room.available
                ? 'bg-black text-[#F5F3F0] hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!room.available}
          >
            <Calendar className="w-4 h-4" />
            {room.available ? 'Réserver' : 'Occupée'}
          </motion.button>
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

  const availableRooms = rooms.filter(room => room.available).length;

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
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-600 mb-6"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {availableRooms} chambres disponibles sur 9
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Nos 9 chambres
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

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {rooms.map((room, index) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                index={index} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

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
      />
    </>
  );
};