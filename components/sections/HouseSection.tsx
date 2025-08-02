'use client';

import { motion } from 'framer-motion';
import { Home, Trees, Car, Train } from 'lucide-react';
import Image from 'next/image';

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

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000',
    alt: 'Façade Maison Oscar Bruz',
    className: 'lg:col-span-2 lg:row-span-2'
  },
  {
    src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=500',
    alt: 'Salon moderne',
    className: ''
  },
  {
    src: 'https://images.unsplash.com/photo-1556909264-f2d94d4cd0ae?q=80&w=500',
    alt: 'Cuisine équipée',
    className: ''
  },
  {
    src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800',
    alt: 'Jardin privatif',
    className: 'md:col-span-2'
  }
];

export const HouseSection = () => {
  return (
    <motion.section 
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
            Notre maison à Bruz
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une maison moderne de 180m² entièrement rénovée, située dans un quartier calme 
            à 15 minutes de Rennes en transport.
          </p>
        </motion.div>

        {/* Galerie */}
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {galleryImages.map((image, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              whileHover="hover"
              className={`${image.className} cursor-pointer`}
            >
              <motion.div variants={hoverLift} className="h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={400}
                  className={`w-full object-cover rounded-2xl shadow-lg ${
                    index === 0 ? 'h-full min-h-[400px]' : 'h-48'
                  }`}
                  priority={index === 0}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Caractéristiques */}
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
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
                  className="text-center p-6 bg-gray-50 rounded-2xl h-full"
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
  );
};