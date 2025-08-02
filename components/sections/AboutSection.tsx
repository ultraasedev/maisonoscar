'use client';

import { motion } from 'framer-motion';
import { Home, Users, Heart } from 'lucide-react';
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

const features = [
  {
    icon: Home,
    title: 'Un nouveau mode de vie',
    description: 'Alliant intimité de votre chambre privée et richesse des espaces partagés pour créer des liens authentiques.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Users,
    title: 'Une communauté bienveillante',
    description: 'Sélection bienveillante des colocataires pour garantir une harmonie et des valeurs partagées.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Heart,
    title: 'L\'humain au centre',
    description: 'Car derrière chaque porte se cache une personnalité unique qui enrichit notre communauté.',
    color: 'bg-purple-100 text-purple-600'
  }
];

export const AboutSection = () => {
  return (
    <motion.section 
      className="py-20 bg-white"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Maison Oscar, c'est quoi ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous révolutionnons la façon de vivre ensemble en créant des espaces modernes 
            où se mélangent intimité personnelle et convivialité partagée.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Features */}
          <motion.div variants={staggerContainer} className="space-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="flex items-start space-x-4"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Image */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800"
                alt="Salon moderne Maison Oscar"
                width={800}
                height={400}
                className="w-full h-96 object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">9</div>
                <div className="text-sm">Chambres</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};