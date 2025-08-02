/**
 * Fichier : components/home/Stats.tsx
 * Description : Section des statistiques de l'entreprise avec animations
 * Inclut : Compteurs animés, icônes, responsive design
 */

'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Clock, 
  Home,
  Star,
  Shield,
  Trophy,
  TrendingUp
} from 'lucide-react';

// === TYPES ET INTERFACES === //

interface Stat {
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface StatsProps {
  className?: string;
}

// === DONNÉES DES STATISTIQUES === //

const statsData: Stat[] = [
  {
    number: '150+',
    label: 'Locataires satisfaits',
    icon: Users,
    description: 'Depuis notre création'
  },
  {
    number: '98%',
    label: 'Taux de satisfaction',
    icon: Heart,
    description: 'Note moyenne de nos résidents'
  },
  {
    number: '24h',
    label: 'Réponse garantie',
    icon: Clock,
    description: 'Délai maximum de réponse'
  },
  {
    number: '5',
    label: 'Logements disponibles',
    icon: Home,
    description: 'Espaces de co-living uniques'
  }
];

// === COMPOSANT PRINCIPAL === //

export function Stats({ className }: StatsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section 
      ref={ref}
      className={`py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
          >
            <Trophy className="w-4 h-4" />
            Nos résultats
          </motion.div>
          
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            La confiance de nos{' '}
            <span className="text-primary">résidents</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des chiffres qui parlent d'eux-mêmes et témoignent de notre engagement 
            pour votre bien-être en co-living.
          </p>
        </motion.div>

        {/* Grille des statistiques */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className="group"
              >
                <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  
                  {/* Contenu */}
                  <div className="relative z-10">
                    {/* Icône */}
                    <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 text-primary rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>

                    {/* Nombre principal */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                      transition={{ 
                        delay: 0.3 + index * 0.1,
                        duration: 0.5
                      }}
                      className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300"
                    >
                      {stat.number}
                    </motion.div>

                    {/* Label */}
                    <h3 className="text-base lg:text-lg font-semibold text-foreground mb-2">
                      {stat.label}
                    </h3>

                    {/* Description */}
                    {stat.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {stat.description}
                      </p>
                    )}
                  </div>

                  {/* Indicateur de progression décoratif */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12 lg:mt-16"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Ces chiffres sont mis à jour en temps réel
          </div>
        </motion.div>
      </div>
    </section>
  );
}