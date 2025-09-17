'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReviewModal from '@/components/ReviewModal';

interface Testimonial {
  name: string;
  age: number;
  occupation: string;
  content: string;
  rating: number;
  avatar: string;
  room: string;
  highlight: string;
}

// Fallback testimonials
const fallbackTestimonials: Testimonial[] = [
  {
    name: 'Marie D.',
    age: 24,
    occupation: 'Développeuse',
    content: 'Le co-living m\'a permis de m\'installer rapidement à Bruz tout en rencontrant des personnes formidables. L\'ambiance est vraiment conviviale et les espaces sont parfaitement pensés !',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1da?q=80&w=100',
    room: 'Chambre Lumière',
    highlight: 'Installation rapide et communauté géniale'
  },
  {
    name: 'Thomas M.',
    age: 28,
    occupation: 'Marketing Manager',
    content: 'Parfait pour quelqu\'un qui vient d\'arriver dans la région. Les espaces sont modernes et bien pensés, et la communauté est accueillante. Je recommande vivement !',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100',
    room: 'Suite Master',
    highlight: 'Idéal pour les nouveaux arrivants'
  },
  {
    name: 'Julie L.',
    age: 22,
    occupation: 'Étudiante en master',
    content: 'Le rapport qualité-prix est excellent ! Je recommande vivement le co-living pour débuter sa vie étudiante ou professionnelle. Tout est inclus, c\'est parfait.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100',
    room: 'Studio Cosy',
    highlight: 'Rapport qualité-prix imbattable'
  }
];

const TestimonialCard = ({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isActive ? 1 : 0.7, 
        scale: isActive ? 1 : 0.95,
        y: isActive ? 0 : 10
      }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-3xl p-6 lg:p-8 shadow-lg border-2 transition-all duration-500 ${
        isActive ? 'border-black' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden bg-gray-200">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-black text-lg">
              {testimonial.name}
            </h4>
            <p className="text-gray-600 text-sm">
              {testimonial.occupation}, {testimonial.age} ans
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {testimonial.room}
            </p>
          </div>
        </div>
        <Quote className="w-8 h-8 text-gray-300 flex-shrink-0" />
      </div>

      <div className="mb-6">
        <div className="bg-[#F5F3F0] rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-black">
            "{testimonial.highlight}"
          </p>
        </div>
        <p className="text-gray-700 leading-relaxed text-base">
          {testimonial.content}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star 
              key={i} 
              className="w-5 h-5 text-yellow-400 fill-current" 
            />
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Il y a 2 semaines
        </div>
      </div>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les témoignages depuis l'API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/cms/testimonials');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          // Convertir les témoignages de la base vers le format du composant
          const formattedTestimonials = data.data
            .filter((t: any) => t.isActive)
            .map((t: any) => ({
              name: t.name,
              age: t.age || 25,
              occupation: t.role || t.occupation || 'Résident',
              content: t.content,
              rating: t.rating || 5,
              avatar: t.avatar || '',
              room: t.room || 'Chambre',
              highlight: t.highlight || t.content.substring(0, 50) + '...'
            }));

          setTestimonials(formattedTestimonials.length > 0 ? formattedTestimonials : fallbackTestimonials);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-play functionality - défilement par groupe de 3
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 3) return;

    const maxGroups = Math.ceil(testimonials.length / 3);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % maxGroups);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Navigation par groupes de 3
  const maxGroups = Math.ceil(testimonials.length / 3);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % maxGroups);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + maxGroups) % maxGroups);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Obtenir les témoignages pour le groupe actuel
  const getCurrentTestimonials = () => {
    const startIndex = currentIndex * 3;
    return testimonials.slice(startIndex, startIndex + 3);
  };

  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <section 
      ref={sectionRef}
      className="py-16 lg:py-24 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-[#F5F3F0] rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-black/5 rounded-full opacity-50 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            {loading ? 'Chargement...' : `4.9/5 sur ${testimonials.length} avis`}
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            Ils vivent
            <br />
            <span className="relative text-gray-600">
              chez nous
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-2 left-0 w-full h-1 bg-black rounded-full origin-left"
              />
            </span>
          </h2>
          
          <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Découvrez l'expérience authentique de nos résidents et pourquoi ils recommandent 
            le co-living Maison Oscar.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Chargement des témoignages...</p>
          </div>
        ) : (
          <>
            {/* Mobile Carousel */}
            <div className="lg:hidden">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TestimonialCard testimonial={testimonials[currentIndex] || fallbackTestimonials[0]} isActive={true} />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons - seulement si plus d'un témoignage */}
                {testimonials.length > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevTestimonial}
                      className="w-12 h-12 bg-black text-[#F5F3F0] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    {/* Dots - pour les groupes sur mobile aussi */}
                    <div className="flex space-x-2">
                      {Array.from({ length: maxGroups }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToTestimonial(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-black w-6' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextTestimonial}
                      className="w-12 h-12 bg-black text-[#F5F3F0] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Desktop Grid - affichage par groupes de 3 */}
            <div className="hidden lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-3 gap-8"
                >
                  {getCurrentTestimonials().map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                      <TestimonialCard testimonial={testimonial} isActive={true} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Desktop - seulement si plus de 3 témoignages */}
              {testimonials.length > 3 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevTestimonial}
                    className="w-12 h-12 bg-black text-[#F5F3F0] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Dots pour les groupes */}
                  <div className="flex space-x-2">
                    {Array.from({ length: maxGroups }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex ? 'bg-black' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextTestimonial}
                    className="w-12 h-12 bg-black text-[#F5F3F0] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12 lg:mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewModal(true)}
            className="bg-black text-[#F5F3F0] px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Publier un avis
          </motion.button>
        </motion.div>
      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
      />
    </section>
  );
};