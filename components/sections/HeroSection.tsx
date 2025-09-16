'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, Play } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export const HeroSection = () => {
  const [roomCount, setRoomCount] = useState(0);
  const [content, setContent] = useState({
    title: "Créateur de liens",
    subtitle: "en Bretagne",
    description: "",
    cta1: "Découvrir la maison",
    cta2: "Voir les chambres"
  });
  
  useEffect(() => {
    // Récupérer le nombre réel de chambres depuis la DB
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const rooms = data.data || [];
          setRoomCount(rooms.length);
        }
      })
      .catch(err => console.error('Erreur:', err));
    
    // Récupérer le contenu de la section
    fetch('/api/cms/sections')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.hero) {
          setContent(prev => ({
            ...prev,
            ...data.data.hero
          }));
        }
      })
      .catch(err => console.error('Erreur:', err));
  }, []);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section 
      ref={ref}
      id="accueil" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5F3F0]"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
      >
        {/* Logo Integration */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <div className="mx-auto w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-6">
            <div className="w-10 h-14 bg-[#F5F3F0] rounded-full rounded-b-none"></div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-[1.1]"
        >
          {content.title}
          <br />
          <span className="relative">
            {content.subtitle}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1.5 }}
              className="absolute bottom-2 left-0 h-1 bg-black rounded-full"
            />
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto font-light leading-relaxed"
        >
          {content.description || `Une maison moderne à Bruz avec ${roomCount || ''} chambres uniques.`}
          <br className="hidden sm:block" />
          Le co-living nouvelle génération pour créer des liens authentiques.
        </motion.p>
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
        >
          <Link 
            href="#maison" 
            className="group relative bg-black text-[#F5F3F0] px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-auto text-center overflow-hidden"
          >
            <span className="relative z-10">Découvrir la maison</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link 
            href="#contact" 
            className="group flex items-center justify-center gap-3 border-2 border-black text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-black hover:text-[#F5F3F0] transition-all duration-300 w-full sm:w-auto"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Visite virtuelle
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-black/10"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-black mb-2">{roomCount || '-'}</div>
            <div className="text-sm sm:text-base text-gray-600">Chambres {roomCount > 1 ? 'uniques' : 'unique'}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-black mb-2">180m²</div>
            <div className="text-sm sm:text-base text-gray-600">Espace à partager</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-black mb-2">15min</div>
            <div className="text-sm sm:text-base text-gray-600">De Rennes</div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-black/60"
        >
          <span className="text-sm font-medium">Découvrir</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};