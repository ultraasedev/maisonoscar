/**
 * Fichier : components/home/ProcessSteps.tsx
 * Description : Section des étapes du processus de réservation
 * Inclut : Étapes numérotées avec animations et icônes
 */

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Clock, 
  Heart, 
  ArrowRight, 
  Calendar,
  Check 
} from 'lucide-react';
import Link from 'next/link';

// === DONNÉES DES ÉTAPES === //

const processSteps = [
  {
    step: 1,
    title: 'Découvrez nos logements',
    description: 'Parcourez nos espaces et choisissez celui qui vous correspond.',
    icon: Home,
    color: 'blue'
  },
  {
    step: 2,
    title: 'Déposez votre candidature',
    description: 'Remplissez le formulaire en ligne avec vos documents.',
    icon: Users,
    color: 'green'
  },
  {
    step: 3,
    title: 'Validation sous 48h',
    description: 'Notre équipe étudie votre dossier rapidement.',
    icon: Clock,
    color: 'purple'
  },
  {
    step: 4,
    title: 'Emménagez sereinement',
    description: 'Signez votre contrat et installez-vous !',
    icon: Heart,
    color: 'red'
  }
];

// === ANIMATIONS CORRIGÉES === //

const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5
    }
  }
};

const slideInLeft = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.6
    }
  }
};

// VARIANT CORRIGÉ POUR LES LIGNES SVG
const drawLine = {
  hidden: { 
    pathLength: 0 
  },
  visible: { 
    pathLength: 1,
    transition: { 
      duration: 1.5
    }
  }
};

// === INTERFACE === //

interface ProcessStepsProps {
  className?: string;
}

// === COMPOSANT PRINCIPAL === //

export function ProcessSteps({ className }: ProcessStepsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section 
      ref={ref}
      className={`py-16 lg:py-24 bg-gray-50 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de section */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-100 text-green-800">
            🚀 Simple et rapide
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            En quelques étapes simples, trouvez votre nouveau chez-vous et 
            intégrez une communauté bienveillante.
          </p>
        </motion.div>

        {/* Grille des étapes */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="relative"
        >
          {/* Ligne de connexion pour desktop */}
          <div className="hidden lg:block absolute top-20 left-0 w-full">
            <svg 
              className="w-full h-2" 
              viewBox="0 0 1200 8" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M50 4 L1150 4"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                variants={drawLine}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="33%" stopColor="#10b981" />
                  <stop offset="66%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Grille des étapes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {processSteps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <motion.div
                  key={step.step}
                  variants={slideInLeft}
                  className="text-center group"
                >
                  <div className="relative mb-6">
                    {/* Cercle principal avec numéro */}
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-white
                      group-hover:scale-110 transition-transform duration-300 relative z-10
                      ${step.color === 'blue' ? 'bg-blue-600' : ''}
                      ${step.color === 'green' ? 'bg-green-600' : ''}
                      ${step.color === 'purple' ? 'bg-purple-600' : ''}
                      ${step.color === 'red' ? 'bg-red-600' : ''}
                    `}>
                      {step.step}
                    </div>
                    
                    {/* Icône en overlay */}
                    <div className={`
                      absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white
                      ${step.color === 'blue' ? 'bg-blue-500' : ''}
                      ${step.color === 'green' ? 'bg-green-500' : ''}
                      ${step.color === 'purple' ? 'bg-purple-500' : ''}
                      ${step.color === 'red' ? 'bg-red-500' : ''}
                    `}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Badge d'étape */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Badge className={`
                        text-xs
                        ${step.color === 'blue' ? 'bg-blue-600' : ''}
                        ${step.color === 'green' ? 'bg-green-600' : ''}
                        ${step.color === 'purple' ? 'bg-purple-600' : ''}
                        ${step.color === 'red' ? 'bg-red-600' : ''}
                      `}>
                        Étape {step.step}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Contenu textuel */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Indicateur de progression mobile */}
                  <div className="lg:hidden mt-4">
                    {index < processSteps.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Section CTA */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h3>
            
            <p className="text-gray-600 mb-8">
              Rejoignez dès maintenant notre communauté et découvrez 
              une nouvelle façon de vivre ensemble.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/reservation">
                  <Calendar className="w-5 h-5" />
                  Commencer ma candidature
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <Link href="/logements">
                  <Home className="w-5 h-5" />
                  Voir nos logements
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
        >
          {[
            { number: '2 min', label: 'Temps moyen de candidature' },
            { number: '48h', label: 'Délai de réponse maximum' },
            { number: '100%', label: 'Processus digitalisé' },
            { number: '24/7', label: 'Support disponible' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}