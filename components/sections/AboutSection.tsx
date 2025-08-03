'use client';

import { motion, useInView } from 'framer-motion';
import { Home, Users, Heart, Sparkles } from 'lucide-react';
import { useRef } from 'react';

const features = [
  {
    icon: Home,
    title: 'Un nouveau mode de vie',
    description: 'Alliant intimité de votre chambre privée et richesse des espaces partagés pour créer des liens authentiques.',
    delay: 0.1
  },
  {
    icon: Users,
    title: 'Une communauté bienveillante',
    description: 'Sélection soigneuse des colocataires pour garantir une harmonie et des valeurs partagées.',
    delay: 0.2
  },
  {
    icon: Heart,
    title: 'L\'humain au centre',
    description: 'Car derrière chaque porte se cache une personnalité unique qui enrichit notre communauté.',
    delay: 0.3
  },
  {
    icon: Sparkles,
    title: 'Tout inclus, tout simplifié',
    description: 'Charges, internet, ménage... concentrez-vous sur l\'essentiel : vivre et créer des liens.',
    delay: 0.4
  }
];

export const AboutSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="py-16 lg:py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#F5F3F0] px-6 py-3 rounded-full text-sm font-medium text-black mb-8"
          >
            <div className="w-2 h-2 bg-black rounded-full"></div>
            Maison Oscar
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            Créateur de liens,
            <br />
            <span className="relative text-gray-600">
              par nature
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-2 left-0 w-full h-1 bg-black rounded-full origin-left"
              />
            </span>
          </h2>
          
          <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Nous révolutionnons la façon de vivre ensemble en créant des espaces modernes 
            où se mélangent intimité personnelle et convivialité partagée.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Features */}
          <div className="space-y-8 lg:space-y-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  className="flex items-start space-x-6 group cursor-pointer"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-14 h-14 lg:w-16 lg:h-16 bg-[#F5F3F0] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-[#F5F3F0] transition-all duration-300"
                  >
                    <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-black group-hover:text-[#F5F3F0] transition-colors" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-black mb-3 group-hover:text-gray-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Visual Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main visual placeholder */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#F5F3F0] to-gray-100 aspect-[4/5]">
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <div className="w-10 h-14 bg-[#F5F3F0] rounded-full rounded-b-none"></div>
                  </div>
                  <p className="text-black font-medium">
                    Espace salon moderne
                    <br />
                    de Maison Oscar
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-6 -right-6 bg-black text-[#F5F3F0] rounded-2xl p-6 shadow-xl"
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">9</div>
                <div className="text-sm opacity-80">Chambres</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -top-6 -left-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-black">6 disponibles</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16 lg:mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-black text-[#F5F3F0] px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Découvrir notre maison
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};