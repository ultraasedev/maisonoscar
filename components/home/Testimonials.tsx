/**
 * Fichier : components/home/Testimonials.tsx
 * Description : Section des témoignages clients avec carousel et notes
 * Inclut : Témoignages clients, système de notation, carrousel automatique
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Play,
  Users,
  ThumbsUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// === TYPES === //

interface Testimonial {
  id: string;
  name: string;
  age: number;
  occupation: string;
  avatar: string;
  housing: string;
  content: string;
  rating: number;
  duration: string;
  date: string;
  verified: boolean;
  highlights: string[];
}

// === DONNÉES MOCKÉES === //

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    age: 24,
    occupation: 'Étudiante en Master Marketing',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    housing: 'Villa des Cerisiers',
    content: 'Le co-living m\'a permis de m\'installer rapidement à Bruz pour mes études. L\'ambiance est vraiment conviviale et j\'ai rencontré des personnes formidables ! Le jardin est parfait pour étudier dehors aux beaux jours.',
    rating: 5,
    duration: '8 mois',
    date: 'Janvier 2024',
    verified: true,
    highlights: ['Ambiance conviviale', 'Installation rapide', 'Jardin agréable']
  },
  {
    id: '2',
    name: 'Thomas Martin',
    age: 28,
    occupation: 'Développeur Web',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    housing: 'Résidence du Parc',
    content: 'Parfait pour mon travail en remote ! Les espaces sont modernes et bien pensés. J\'ai pu me concentrer sur mon travail tout en créant des liens avec les autres résidents. Le WiFi est excellent et les espaces communs sont top.',
    rating: 5,
    duration: '1 an',
    date: 'Mars 2023',
    verified: true,
    highlights: ['Idéal télétravail', 'Espaces modernes', 'Excellent WiFi']
  },
  {
    id: '3',
    name: 'Julie Leroux',
    age: 22,
    occupation: 'Infirmière',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    housing: 'Maison Belleville',
    content: 'Après avoir déménagé pour mon travail, le co-living m\'a évité la solitude. C\'est rassurant de savoir qu\'il y a toujours quelqu\'un en cas de besoin. Le rapport qualité-prix est excellent et l\'équipe est très réactive.',
    rating: 5,
    duration: '6 mois',
    date: 'Septembre 2023',
    verified: true,
    highlights: ['Évite la solitude', 'Équipe réactive', 'Excellent rapport qualité-prix']
  },
  {
    id: '4',
    name: 'Lucas Petit',
    age: 26,
    occupation: 'Ingénieur',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    housing: 'Villa des Cerisiers',
    content: 'Une expérience incroyable ! J\'ai pu déménager en quelques jours seulement. Tout était déjà prêt, du mobilier aux contrats. Les colocataires sont géniaux et on organise souvent des soirées dans le jardin.',
    rating: 5,
    duration: '1 an 2 mois',
    date: 'Juin 2023',
    verified: true,
    highlights: ['Déménagement rapide', 'Tout inclus', 'Soirées conviviales']
  },
  {
    id: '5',
    name: 'Sophie Bernard',
    age: 25,
    occupation: 'Graphiste',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    housing: 'Résidence du Parc',
    content: 'Je recommande vivement ! La flexibilité des contrats m\'a permis de prolonger mon séjour sans stress. L\'emplacement en centre-ville est parfait, tout est accessible à pied. L\'équipe est aux petits soins.',
    rating: 5,
    duration: '10 mois',
    date: 'Avril 2023',
    verified: true,
    highlights: ['Contrats flexibles', 'Centre-ville', 'Équipe attentionnée']
  }
];

// === ANIMATIONS === //

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// === COMPOSANT TESTIMONIAL CARD === //

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  return (
    <Card className="bg-white border-2 border-gray-100 shadow-lg h-full">
      <CardContent className="p-8">
        
        {/* Quote icon */}
        <Quote className="w-8 h-8 text-blue-600 mb-6" />
        
        {/* Content */}
        <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 line-clamp-4">
          "{testimonial.content}"
        </blockquote>
        
        {/* Rating */}
        <div className="flex items-center mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < testimonial.rating 
                  ? "text-yellow-400 fill-current" 
                  : "text-gray-300"
              )}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-6">
          {testimonial.highlights.slice(0, 2).map((highlight, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {highlight}
            </Badge>
          ))}
        </div>
        
        {/* Author info */}
        <div className="flex items-center">
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold"
            >
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </div>
            {testimonial.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-semibold text-gray-900">
              {testimonial.name}, {testimonial.age} ans
            </div>
            <div className="text-sm text-gray-600">{testimonial.occupation}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {testimonial.housing}
              <span className="mx-2">•</span>
              <Calendar className="w-3 h-3 mr-1" />
              {testimonial.duration}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// === COMPOSANT PRINCIPAL === //

/**
 * Section des témoignages clients
 */
export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return (prevIndex + 1) % testimonials.length;
      } else {
        return prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
      }
    });
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Calculate visible testimonials for desktop
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Users className="w-4 h-4 mr-2" />
              Témoignages de nos résidents
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ils ont choisi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Maison Oscar
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez les expériences authentiques de nos résidents et pourquoi ils recommandent 
              le co-living Maison Oscar.
            </p>
          </motion.div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {[
            { number: '4.9/5', label: 'Note moyenne', icon: Star },
            { number: '98%', label: 'Recommandent', icon: ThumbsUp },
            { number: '150+', label: 'Avis clients', icon: Quote },
            { number: '95%', label: 'Séjours prolongés', icon: Calendar }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          
          {/* Desktop view - 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
            {getVisibleTestimonials().map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>

          {/* Mobile view - 1 column */}
          <div className="md:hidden relative h-96 mb-8">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0"
              >
                <TestimonialCard testimonial={testimonials[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(-1)}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300"
                  )}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(1)}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Auto-play indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Play className={cn("w-4 h-4", isAutoPlaying ? "text-blue-600" : "text-gray-400")} />
            <span>Défilement automatique</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Rejoignez notre communauté !
            </h3>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Comme eux, venez vivre une expérience unique dans nos logements de co-living à Bruz.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Découvrir nos logements
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}