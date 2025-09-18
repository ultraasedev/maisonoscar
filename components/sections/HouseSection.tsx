'use client';

import { motion, useInView } from 'framer-motion';
import { Home, Trees, Car, Train, Camera, Play, Bike } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const defaultContent = {
  title: 'Notre maison à Bruz',
  subtitle: undefined as string | undefined,
  description: 'Une maison moderne de 180m² entièrement rénovée, située dans un quartier calme à 15 minutes de Rennes en transport.',
  features: [
    {
      title: '180m²',
      description: 'Surface habitable généreuse'
    },
    {
      title: 'Jardin',
      description: 'Espace extérieur privatif'
    },
    {
      title: 'Parking',
      description: 'Places dédiées incluses'
    },
    {
      title: 'Transport',
      description: 'Métro B ligne directe'
    }
  ],
  address: '123 rue de la République, 35170 Bruz',
  virtualTourUrl: 'https://my.matterport.com/show/?m=example', // URL par défaut
  isVirtualTourActive: true,
  cmsFeatures: undefined as any[] | undefined,
  amenities: undefined as string[] | undefined
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const hoverLift = {
  hover: { 
    y: -8, 
    transition: { duration: 0.3 } 
  }
};

const houseFeatures = [
  {
    icon: Home,
    title: '180m²',
    description: 'Surface habitable généreuse',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Trees,
    title: 'Jardin',
    description: 'Espace extérieur privatif',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Car,
    title: 'Parking',
    description: 'Places dédiées incluses',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Train,
    title: 'Transport',
    description: 'Métro B ligne directe',
    color: 'bg-orange-100 text-orange-600'
  }
];

// Removed bike amenity as requested

// Images par défaut en cas d'échec de chargement
const defaultGalleryImages = [
  {
    src: '/images/house/salon-principal.jpg',
    alt: 'Salon principal Maison Oscar Bruz',
    className: 'lg:col-span-2 lg:row-span-2'
  },
  {
    src: '/images/house/cuisine-moderne.jpg',
    alt: 'Cuisine moderne équipée',
    className: ''
  },
  {
    src: '/images/house/chambre-cosy.jpg',
    alt: 'Chambre cosy',
    className: ''
  },
  {
    src: '/images/house/jardin-terrasse.jpg',
    alt: 'Jardin et terrasse',
    className: 'md:col-span-2'
  },
  {
    src: '/images/house/salle-de-bain.jpg',
    alt: 'Salle de bain moderne',
    className: ''
  },
  {
    src: '/images/house/espace-travail.jpg',
    alt: 'Espace de travail',
    className: ''
  }
];

const GalleryModal = ({
  isOpen,
  onClose,
  images
}: {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ src: string; alt: string; className?: string }>;
}) => {
  const [currentImage, setCurrentImage] = useState(0);

  // Navigation clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImage((prev) => (prev + 1) % images.length);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

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
        className="max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={images[currentImage].src}
            alt={images[currentImage].alt}
            className="w-full h-auto rounded-2xl max-h-[80vh] object-contain"
          />

          {/* Navigation */}
          <button
            onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors text-black font-bold text-lg"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors text-black font-bold text-lg"
          >
            →
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors text-black text-xl"
          >
            ✕
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImage ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          
          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 rounded-b-2xl">
            <p className="text-white text-lg font-medium text-center">
              {images[currentImage].alt}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const HouseSection = () => {
  const sectionRef = useRef(null);
  const [showGallery, setShowGallery] = useState(false);
  const [content, setContent] = useState(defaultContent);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState(defaultGalleryImages);
  const [virtualTourConfig, setVirtualTourConfig] = useState({
    url: '',
    isActive: true
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Charger le contenu CMS
        const response = await fetch('/api/cms/sections');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.house) {
            const houseData = data.data.house;
            setContent({
              ...defaultContent,
              title: houseData.title || defaultContent.title,
              description: houseData.description || defaultContent.description,
              // Map CMS features to component format if they exist
              ...(houseData.subtitle && { subtitle: houseData.subtitle }),
              ...(houseData.features && { cmsFeatures: houseData.features }),
              ...(houseData.amenities && { amenities: houseData.amenities })
            });
          }
        }

        // Charger les images de la maison depuis le CMS
        const houseImagesResponse = await fetch('/api/cms/house-images');
        if (houseImagesResponse.ok) {
          const houseImagesData = await houseImagesResponse.json();
          if (houseImagesData.success && houseImagesData.data?.length > 0) {
            // Convertir le format CMS vers le format galerie avec des classes responsives
            const cmsImages = houseImagesData.data.map((img: any, index: number) => ({
              src: img.url,
              alt: img.title || img.description || `Image ${index + 1} de la maison`,
              className: index === 0 ? 'lg:col-span-2 lg:row-span-2' :
                         index === 3 ? 'md:col-span-2' : ''
            }));
            setGalleryImages(cmsImages);
          }
        }
        
        // Charger la config visite virtuelle depuis les rooms
        const roomsResponse = await fetch('/api/rooms?limit=1');
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          if (roomsData.success && roomsData.data?.[0]) {
            setVirtualTourConfig({
              url: roomsData.data[0].virtualTour || '',
              isActive: roomsData.data[0].isVirtualTourActive || false
            });
          }
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      }
    };

    loadContent();
  }, []);

  return (
    <>
      <motion.section 
        ref={sectionRef}
        id="maison"
        className="py-20 bg-white"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.title}
              {content.subtitle && (
                <span className="block text-3xl md:text-4xl text-gray-600 font-normal mt-2">
                  {content.subtitle}
                </span>
              )}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.description}
            </p>
          </motion.div>

          {/* Galerie avec indication claire */}
          <motion.div 
            variants={fadeInUp}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Découvrir la maison</h3>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGallery(true)}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Voir toutes les photos
                </motion.button>
                
                {virtualTourConfig.isActive && virtualTourConfig.url && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(virtualTourConfig.url, '_blank')}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Visite virtuelle 360°
                  </motion.button>
                )}
              </div>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {galleryImages.map((image, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  whileHover="hover"
                  className={`${image.className} cursor-pointer relative group`}
                  onClick={() => {
                    setGalleryStartIndex(index);
                    setShowGallery(true);
                  }}
                >
                  <motion.div variants={hoverLift} className="h-full relative">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className={`w-full object-cover rounded-2xl shadow-lg ${
                        index === 0 ? 'h-full min-h-[400px]' : 'h-48'
                      }`}
                    />
                    {/* Overlay au hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-2xl flex items-center justify-center">
                      <Camera className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Caractéristiques */}
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          >
            {houseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  whileHover="hover"
                  className="cursor-pointer"
                >
                  <motion.div 
                    variants={hoverLift}
                    className="text-center p-6 bg-gray-50 rounded-2xl h-full hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
          

        </div>
      </motion.section>

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        images={galleryImages}
      />
    </>
  );
};