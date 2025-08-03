'use client';

import { motion, useInView } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const comparisonData = [
  {
    aspect: 'Coût mensuel',
    traditional: '800-1200€',
    traditionalSub: '+ charges variables',
    coliving: '520-680€',
    colivingSub: 'tout inclus',
    savings: 'Jusqu\'à 40% d\'économies'
  },
  {
    aspect: 'Mobilier',
    traditional: 'À acheter',
    traditionalSub: '2000-5000€',
    coliving: 'Inclus',
    colivingSub: 'design moderne',
    savings: '3000€ économisés'
  },
  {
    aspect: 'Internet',
    traditional: '30-50€/mois',
    traditionalSub: 'à souscrire',
    coliving: 'Inclus',
    colivingSub: 'fibre haut débit',
    savings: '40€/mois économisés'
  },
  {
    aspect: 'Ménage',
    traditional: 'Votre temps',
    traditionalSub: 'ou femme de ménage',
    coliving: 'Inclus',
    colivingSub: 'parties communes',
    savings: '5h/semaine libérées'
  },
  {
    aspect: 'Communauté',
    traditional: 'Isolement',
    traditionalSub: 'effort personnel',
    coliving: 'Active',
    colivingSub: 'événements organisés',
    savings: 'Liens créés naturellement'
  },
  {
    aspect: 'Flexibilité',
    traditional: 'Bail 12 mois',
    traditionalSub: 'difficile à rompre',
    coliving: 'Modulable',
    colivingSub: '1 mois minimum',
    savings: 'Liberté totale'
  }
];

const ComparisonCard = ({ item, index }: { item: typeof comparisonData[0]; index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <h3 className="font-bold text-black text-lg mb-4 text-center">
        {item.aspect}
      </h3>
      
      <div className="space-y-4">
        {/* Traditional */}
        <div className="bg-red-50 rounded-xl p-4 relative">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-semibold text-red-800 mb-1">
                {item.traditional}
              </div>
              <div className="text-sm text-red-600">
                {item.traditionalSub}
              </div>
            </div>
            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Coliving */}
        <div className="bg-green-50 rounded-xl p-4 relative">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-semibold text-green-800 mb-1">
                {item.coliving}
              </div>
              <div className="text-sm text-green-600">
                {item.colivingSub}
              </div>
            </div>
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          </div>
        </div>

        {/* Savings */}
        <div className="bg-black rounded-xl p-3">
          <div className="text-center text-[#F5F3F0] text-sm font-medium">
            💡 {item.savings}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProblemSolutionSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      id="coliving"
      className="py-16 lg:py-24 bg-[#F5F3F0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-600 mb-6"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Le problème à résoudre
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            Logement traditionnel
            <br />
            <span className="relative text-gray-600">
              vs co-living
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-2 left-0 w-full h-1 bg-black rounded-full origin-left"
              />
            </span>
          </h2>
          
          <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Fini les appartements impersonnels, les charges cachées et l'isolement. 
            Le co-living, c'est la solution moderne pour bien vivre ensemble.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {comparisonData.map((item, index) => (
            <ComparisonCard key={index} item={item} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12 lg:mt-16"
        >
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl lg:text-2xl font-bold text-black mb-4">
              Prêt à faire le changement ?
            </h3>
            <p className="text-gray-600 mb-6">
              Découvrez comment le co-living peut transformer votre quotidien.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-[#F5F3F0] px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Voir nos chambres
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};