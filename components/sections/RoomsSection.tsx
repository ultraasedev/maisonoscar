'use client';

import { motion, useInView } from 'framer-motion';
import { Check, Wifi, Coffee, Car, Sparkles } from 'lucide-react';
import { useRef } from 'react';

interface Room {
  id: string;
  name: string;
  size: number;
  price: number;
  features: string[];
  available: boolean;
  isHighlight?: boolean;
}

const rooms: Room[] = [
  {
    id: '1',
    name: 'Studio Cosy',
    size: 12,
    price: 520,
    features: ['Lit double', 'Bureau intégré', 'Rangements'],
    available: true
  },
  {
    id: '2',
    name: 'Chambre Lumière',
    size: 15,
    price: 570,
    features: ['Vue jardin', 'Balcon privatif', 'Dressing'],
    available: true
  },
  {
    id: '3',
    name: 'Espace Zen',
    size: 14,
    price: 550,
    features: ['Ambiance calme', 'Coin lecture', 'Velux'],
    available: false
  },
  {
    id: '4',
    name: 'Chambre Panorama',
    size: 17,
    price: 630,
    features: ['Vue dégagée', 'Bureau XXL', 'Baie vitrée'],
    available: true,
    isHighlight: true
  },
  {
    id: '5',
    name: 'Suite Master',
    size: 19,
    price: 680,
    features: ['Salle d\'eau privée', 'Dressing walk-in', 'Terrasse'],
    available: true,
    isHighlight: true
  },
  {
    id: '6',
    name: 'Chambre Design',
    size: 13,
    price: 540,
    features: ['Mobilier sur mesure', 'Coin détente', 'Éclairage LED'],
    available: true
  },
  {
    id: '7',
    name: 'Espace Nature',
    size: 16,
    price: 590,
    features: ['Vue sur jardin', 'Plantes intégrées', 'Mezzanine'],
    available: false
  },
  {
    id: '8',
    name: 'Chambre Minimaliste',
    size: 11,
    price: 500,
    features: ['Design épuré', 'Rangements cachés', 'Éclairage naturel'],
    available: true
  },
  {
    id: '9',
    name: 'Loft Urbain',
    size: 20,
    price: 720,
    features: ['Plafond haut', 'Espace salon', 'Cuisine privée'],
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

const RoomCard = ({ room, index }: { room: Room; index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 hover:shadow-xl ${
        room.isHighlight 
          ? 'border-black ring-2 ring-black/5' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {room.isHighlight && (
        <div className="absolute -top-3 left-6 bg-black text-[#F5F3F0] px-4 py-1 rounded-full text-sm font-medium">
          Premium
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-black mb-1 group-hover:text-gray-700 transition-colors">
            {room.name}
          </h3>
          <p className="text-gray-600 text-sm">{room.size}m²</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          room.available 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {room.available ? 'Disponible' : 'Occupée'}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-black mb-1">
          {room.price}€
        </div>
        <div className="text-sm text-gray-500">
          charges incluses
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {room.features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-sm text-gray-700">
            <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
          room.available
            ? 'bg-black text-[#F5F3F0] hover:bg-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!room.available}
      >
        {room.available ? 'Réserver une visite' : 'Non disponible'}
      </motion.button>
    </motion.div>
  );
};

export const RoomsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const availableRooms = rooms.filter(room => room.available).length;

  return (
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
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-600 mb-6"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {availableRooms} chambres disponibles
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
            Nos 9 chambres
            <br />
            <span className="text-gray-600">uniques</span>
          </h2>
          
          <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Chaque chambre a été pensée pour créer votre cocon personnel 
            tout en favorisant les rencontres dans nos espaces communs.
          </p>
        </motion.div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {rooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
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
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-[#F5F3F0] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="font-bold text-black mb-2">
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
  );
};