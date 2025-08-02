/**
 * Fichier : components/home/ColivingPresentation.tsx
 * Description : Section de présentation du concept de co-living
 * Inclut : Avantages, bénéfices, comparaison avec logement traditionnel
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Home,
  Wifi,
  Shield,
  Euro,
  Calendar,
  Check,
  ArrowRight,
  Heart,
  Coffee,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// === DONNÉES === //

const colivingBenefits = [
  {
    icon: Users,
    title: 'Communauté bienveillante',
    description: 'Rencontrez des personnes partageant vos valeurs dans un environnement convivial.',
    features: ['Événements organisés', 'Espaces de rencontre', 'Réseau professionnel', 'Entraide quotidienne']
  },
  {
    icon: Home,
    title: 'Logements tout équipés',
    description: 'Emménagez avec vos valises ! Tout le mobilier et l\'équipement sont fournis.',
    features: ['Mobilier de qualité', 'Électroménager complet', 'Décoration soignée', 'Linge de maison']
  },
  {
    icon: Wifi,
    title: 'Services tout inclus',
    description: 'Internet, charges, ménage des parties communes... tout est pris en charge.',
    features: ['Internet haut débit', 'Charges incluses', 'Ménage commun', 'Maintenance 24/7']
  },
  {
    icon: Shield,
    title: 'Flexibilité maximale',
    description: 'Contrats flexibles adaptés à vos besoins, de quelques mois à plusieurs années.',
    features: ['Durées modulables', 'Préavis réduits', 'Possibilité de prolongation', 'Pas de frais cachés']
  },
  {
    icon: Euro,
    title: 'Économies importantes',
    description: 'Réduisez vos coûts en partageant les espaces et en bénéficiant d\'économies d\'échelle.',
    features: ['Prix tout inclus', 'Pas de frais d\'agence', 'Économies d\'énergie', 'Équipements partagés']
  },
  {
    icon: Calendar,
    title: 'Installation immédiate',
    description: 'Déménagez en 24-48h chrono ! Plus besoin d\'attendre des semaines.',
    features: ['Disponibilité rapide', 'Formalités simplifiées', 'Aide à l\'installation', 'Support dédié']
  }
];

const comparisonData = [
  {
    aspect: 'Coût mensuel total',
    traditional: '800-1200€ + charges variables',
    coliving: '450-650€ tout inclus ✓',
    advantage: true
  },
  {
    aspect: 'Temps d\'installation',
    traditional: '2-4 semaines minimum',
    coliving: '24-48h maximum ✓',
    advantage: true
  },
  {
    aspect: 'Ameublement',
    traditional: 'À votre charge (1000-3000€)',
    coliving: 'Tout inclus et de qualité ✓',
    advantage: true
  },
  {
    aspect: 'Charges & internet',
    traditional: 'Séparées et variables',
    coliving: 'Incluses dans le loyer ✓',
    advantage: true
  },
  {
    aspect: 'Flexibilité du bail',
    traditional: 'Engagement 1-3 ans',
    coliving: 'À partir d\'1 mois ✓',
    advantage: true
  },
  {
    aspect: 'Vie sociale',
    traditional: 'À construire seul(e)',
    coliving: 'Communauté immédiate ✓',
    advantage: true
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// === COMPOSANT PRINCIPAL === //

/**
 * Section de présentation du co-living
 */
export function ColivingPresentation() {
  const [selectedBenefit, setSelectedBenefit] = useState(0);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        
        {/* === INTRODUCTION === */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Heart className="w-4 h-4 mr-2" />
              Le co-living expliqué simplement
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir le{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                co-living
              </span>{' '}
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Le co-living révolutionne la façon de vivre en combinant l'indépendance 
              d'un logement privé avec les avantages d'une communauté bienveillante.
            </p>
          </motion.div>
        </motion.div>

        {/* === AVANTAGES PRINCIPAUX === */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {colivingBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group cursor-pointer"
                onClick={() => setSelectedBenefit(index)}
              >
                <Card className={cn(
                  "h-full transition-all duration-300 hover:shadow-lg border-2",
                  selectedBenefit === index 
                    ? "border-blue-500 shadow-lg bg-blue-50" 
                    : "border-gray-200 hover:border-blue-300"
                )}>
                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300",
                      selectedBenefit === index
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 scale-110"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100"
                    )}>
                      <Icon className={cn(
                        "w-8 h-8 transition-colors duration-300",
                        selectedBenefit === index ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                      )} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                    <ul className="space-y-2">
                      {benefit.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* === COMPARAISON === */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Co-living vs Logement traditionnel
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez pourquoi le co-living est souvent plus avantageux 
              qu'un logement traditionnel.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gradient-to-r from-gray-50 to-blue-50 py-6 font-bold text-center border-b border-gray-200">
                <div className="text-gray-900">Critères</div>
                <div className="text-gray-600">Logement traditionnel</div>
                <div className="text-blue-600">Co-living Maison Oscar</div>
              </div>
              
              {/* Comparisons */}
              {comparisonData.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={cn(
                    "grid grid-cols-3 py-6 px-6 text-center border-b border-gray-100 last:border-0",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  )}
                >
                  <div className="font-semibold text-gray-900 flex items-center justify-center">
                    {item.aspect}
                  </div>
                  <div className="text-gray-600 flex items-center justify-center text-sm">
                    {item.traditional}
                  </div>
                  <div className="font-semibold text-blue-600 flex items-center justify-center text-sm">
                    {item.coliving}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* === CTA === */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <Coffee className="w-12 h-12 mx-auto mb-6 text-blue-200" />
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt(e) à découvrir le co-living ?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez notre communauté et vivez une expérience unique dans nos logements modernes à Bruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                asChild
              >
                <Link href="/logements">
                  Voir nos logements
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold"
                asChild
              >
                <Link href="/co-living">
                  En savoir plus
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}