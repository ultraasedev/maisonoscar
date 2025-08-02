'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const comparisonData = [
  {
    aspect: 'Coût mensuel',
    traditional: '800-1200€ + charges',
    coliving: '520-680€ tout inclus',
    advantage: 'coliving'
  },
  {
    aspect: 'Mobilier',
    traditional: 'À votre charge',
    coliving: 'Inclus et moderne',
    advantage: 'coliving'
  },
  {
    aspect: 'Internet',
    traditional: '30-50€/mois',
    coliving: 'Fibre incluse',
    advantage: 'coliving'
  },
  {
    aspect: 'Ménage',
    traditional: 'À votre charge',
    coliving: 'Parties communes incluses',
    advantage: 'coliving'
  },
  {
    aspect: 'Communauté',
    traditional: 'Isolement possible',
    coliving: 'Active et bienveillante',
    advantage: 'coliving'
  },
  {
    aspect: 'Flexibilité',
    traditional: 'Bail rigide 12 mois',
    coliving: 'Contrats flexibles',
    advantage: 'coliving'
  }
];

export const ProblemSolutionSection = () => {
  return (
    <motion.section 
      id="coliving"
      className="py-20 bg-gray-100"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Le problème qu'on résout
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fini les appartements impersonnels, les charges cachées et l'isolement. 
            Le co-living, c'est la solution moderne pour bien vivre ensemble.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg overflow-x-auto">
          <div className="min-w-[600px]">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Aspect
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">
                    Logement traditionnel
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-blue-600">
                    Co-living Maison Oscar
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <motion.tr 
                    key={index}
                    variants={fadeInUp}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {item.aspect}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {item.traditional}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-green-600 font-semibold">
                          {item.coliving}
                        </span>
                        {item.advantage === 'coliving' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};