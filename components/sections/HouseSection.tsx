'use client';

import { motion, useInView } from 'framer-motion';
import { Home, Trees, Car, Train, Wifi, MapPin, Calendar, Camera } from 'lucide-react';
import { useRef, useState } from 'react';

const houseFeatures = [
  {
    icon: Home,
    title: '180m²',
    description: 'Surface habitable généreuse',
    detail: 'Espace de vie optimisé avec 9 chambres et de nombreux espaces communs'
  },
  {
    icon: Trees,
    title: 'Jardin privatif',
    description: 'Espace extérieur de 150m²',
    detail: 'Terrasse, barbecue et espace détente pour profiter des beaux jours'
  },
  {
    icon: Car,
    title: 'Parking sécurisé',
    description: '6 places incluses',
    detail: 'Stationnement gratuit et sécurisé pour tous les résidents'
  },
  {
    icon: Train,
    title: 'Transport',
    description: 'Métro B à 5 min à pied',
    detail: 'Accès direct au centre de Rennes en 15 minutes'
  }
];

const amenities = [
  {
    icon: Wifi,
    title: 'Fibre optique',
    description: '1 Gb/s inclus'
  },
  {
    icon: Home,
    title: 'Cuisine moderne',
    description: 'Entièrement équipée'
  },
  {
    icon: Trees,
    title: 'Espaces verts',
    description: 'Jardin et terrasses'
  },
  {
    icon: Car,
    title: 'Vélos disponibles',
    description: 'Service gratuit'
  }
];

const GalleryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000',
      title: 'Façade de la maison',
      description: 'Architecture moderne dans un quartier calme'
    },
    {
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
      title: 'Salon principal',
      description: 'Espace de détente partagé avec TV grand écran'
    },
    {
      url: 'https://images.unsplash.com/photo-1556909264-f2d94d4cd0ae?q=80&w=800',
      title: 'Cuisine équipée',
      description: 'Espace de vie central pour cuisiner ensemble'
    },
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800',
      title: 'Jardin privatif',
      description: 'Espace extérieur avec terrasse et barbecue'
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={images[currentImage].url}
            alt={images[currentImage].title}
            className="w-full h-auto rounded-2xl"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
            <h3 className="text-white text-xl font-bold mb-2">
              {images[currentImage].title}
            </h3>
            <p className="text-gray-300 text-sm">
              {images[currentImage].description}
            </p>
          </div>
          
          {/* Navigation */}
          <button
            onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            →
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            ✕
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImage ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const HouseSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <>
      <section 
        ref={sectionRef}
        id="maison"
        className="py-16 lg:py-24 bg-white"
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
              className="inline-flex items-center gap-2 bg-[#F5F3F0] px-4 py-2 rounded-full text-sm font-medium text-black mb-6"
            >
              <MapPin className="w-4 h-4" />
              Bruz, Bretagne
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Notre maison
              <br />
              <span className="relative text-gray-600">
                à Bruz
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute bottom-2 left-0 w-full h-1 bg-black rounded-full origin-left"
                />
              </span>
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Une maison moderne de 180m² entièrement rénovée, située dans un quartier calme 
              à 15 minutes de Rennes en transport en commun.
            </p>
          </motion.div>

          {/* Main Image + Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mb-16"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] lg:aspect-[21/9]">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000)' }}
              >
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <motion.button
                    onClick={() => setGalleryOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 text-black px-6 py-3 rounded-xl font-semibold hover:bg-white transition-colors flex items-center gap-2 mx-auto mb-4"
                  >
                    <Camera className="w-5 h-5" />
                    Voir toutes les photos
                  </motion.button>
                  <p className="text-white/80 text-sm">
                    Découvrez tous nos espaces en images
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {houseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-[#F5F3F0] rounded-3xl p-6 lg:p-8 text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-[#F5F3F0]" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {feature.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {feature.detail}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Amenities Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-black rounded-3xl p-8 lg:p-12 text-[#F5F3F0]"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Équipements inclus
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Tous les services pour votre confort quotidien, 
                sans frais supplémentaires.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group"
                  >
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#F5F3F0] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                      <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-black" />
                    </div>
                    <h4 className="font-bold text-[#F5F3F0] mb-2 text-sm lg:text-base">
                      {amenity.title}
                    </h4>
                    <p className="text-gray-300 text-xs lg:text-sm">
                      {amenity.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black text-[#F5F3F0] px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Visiter la maison
              </motion.button>
              
              <motion.button
                onClick={() => setGalleryOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-black text-black px-6 py-4 rounded-xl font-semibold hover:bg-black hover:text-[#F5F3F0] transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Galerie photos
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#F5F3F0] text-black px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-200 sm:col-span-2 lg:col-span-1"
              >
                <Camera className="w-5 h-5" />
                Visite 3D
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Modal */}
      {galleryOpen && (
        <GalleryModal 
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
};