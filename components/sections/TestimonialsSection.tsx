'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
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

interface Testimonial {
  name: string;
  age: number;
  occupation: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Marie D.',
    age: 24,
    occupation: 'Développeuse',
    content: 'Le co-living m\'a permis de m\'installer rapidement à Bruz tout en rencontrant des personnes formidables. L\'ambiance est vraiment conviviale !',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1da?q=80&w=100'
  },
  {
    name: 'Thomas M.',
    age: 28,
    occupation: 'Marketing Manager',
    content: 'Parfait pour quelqu\'un qui vient d\'arriver dans la région. Les espaces sont modernes et bien pensés, et la communauté est accueillante.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100'
  },
  {
    name: 'Julie L.',
    age: 22,
    occupation: 'Étudiante en master',
    content: 'Le rapport qualité-prix est excellent ! Je recommande vivement le co-living pour débuter sa vie étudiante ou professionnelle.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100'
  }
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover="hover"
      className="cursor-pointer"
    >
      <motion.div 
        variants={hoverLift}
        className="bg-gray-50 rounded-2xl p-8 h-full"
      >
        <div className="flex items-center mb-4">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <h4 className="font-semibold text-gray-900">
              {testimonial.name}
            </h4>
            <p className="text-sm text-gray-600">
              {testimonial.occupation}, {testimonial.age} ans
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          "{testimonial.content}"
        </p>
        
        <div className="flex">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star 
              key={i} 
              className="w-4 h-4 text-yellow-400 fill-current" 
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
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
            Ils vivent chez nous
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez l'expérience de nos résidents et pourquoi ils recommandent 
            le co-living Maison Oscar.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index} 
              testimonial={testimonial} 
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};