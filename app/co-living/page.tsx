/**
 * Fichier : app/co-living/page.tsx
 * Description : Page explicative du concept de co-living
 * Inclut : Définition, avantages, fonctionnement, témoignages
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Users,
  Home,
  Heart,
  Wifi,
  Coffee,
  Car,
  Shield,
  Euro,
  Calendar,
  Star,
  Quote,
  CheckCircle,
  ArrowRight,
  Play,
  ChevronRight,
  UserCheck,
  Building,
  Handshake,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// === DONNÉES === //

const colivingBenefits = [
  {
    icon: Users,
    title: 'Communauté bienveillante',
    description: 'Rencontrez des personnes partageant vos valeurs dans un environnement convivial et respectueux.',
    details: [
      'Événements et activités organisés',
      'Espaces communs pour échanger',
      'Réseau professionnel et amical',
      'Solidarité entre colocataires'
    ]
  },
  {
    icon: Home,
    title: 'Confort et praticité',
    description: 'Logements entièrement meublés et équipés, prêts à vivre dès votre arrivée.',
    details: [
      'Mobilier de qualité inclus',
      'Électroménager complet',
      'Linge de maison fourni',
      'Décoration soignée'
    ]
  },
  {
    icon: Euro,
    title: 'Économies importantes',
    description: 'Réduisez vos coûts de logement en partageant les espaces et les charges.',
    details: [
      'Charges incluses dans le loyer',
      'Pas de frais d\'agence',
      'Équipements partagés',
      'Économies d\'énergie'
    ]
  },
  {
    icon: Calendar,
    title: 'Flexibilité maximale',
    description: 'Contrats adaptés à vos besoins, de quelques mois à plusieurs années.',
    details: [
      'Durées de séjour modulables',
      'Préavis réduits',
      'Possibilité de prolongation',
      'Adaptation aux changements'
    ]
  },
  {
    icon: Shield,
    title: 'Sécurité et tranquillité',
    description: 'Dossiers vérifiés, assurances incluses et support permanent.',
    details: [
      'Sélection rigoureuse des colocataires',
      'Assurance habitation incluse',
      'Support 7j/7',
      'Règlement clair et respecté'
    ]
  },
  {
    icon: Wifi,
    title: 'Services tout inclus',
    description: 'Internet, ménage, maintenance... tout est pris en charge pour vous.',
    details: [
      'Connexion haut débit',
      'Ménage hebdomadaire des parties communes',
      'Maintenance et dépannage',
      'Assurance et assistance 24h/24'
    ]
  }
];

const testimonials = [
  {
    name: 'Marie Dubois',
    age: 24,
    occupation: 'Développeuse web',
    housing: 'Villa des Cerisiers',
    content: 'Le co-living m\'a permis de m\'installer rapidement à Bruz tout en rencontrant des personnes formidables. L\'ambiance est vraiment conviviale !',
    rating: 5,
    avatar: '/images/testimonial-marie.jpg'
  },
  {
    name: 'Thomas Martin',
    age: 28,
    occupation: 'Marketing Manager',
    housing: 'Loft République',
    content: 'Parfait pour quelqu\'un qui vient d\'arriver dans la région. Les espaces sont modernes et bien pensés, et la communauté est accueillante.',
    rating: 5,
    avatar: '/images/testimonial-thomas.jpg'
  },
  {
    name: 'Julie Leroux',
    age: 22,
    occupation: 'Étudiante en master',
    housing: 'Maison Belleville',
    content: 'Le rapport qualité-prix est excellent ! Je recommande vivement le co-living pour débuter sa vie étudiante ou professionnelle.',
    rating: 5,
    avatar: '/images/testimonial-julie.jpg'
  }
];

const comparisonData = [
  {
    aspect: 'Coût mensuel',
    traditional: '800-1200€ + charges',
    coliving: '450-750€ tout inclus',
    advantage: 'coliving'
  },
  {
    aspect: 'Mobilier',
    traditional: 'À votre charge',
    coliving: 'Inclus et de qualité',
    advantage: 'coliving'
  },
  {
    aspect: 'Charges',
    traditional: 'Séparées et variables',
    coliving: 'Incluses dans le loyer',
    advantage: 'coliving'
  },
  {
    aspect: 'Internet',
    traditional: 'À souscrire séparément',
    coliving: 'Haut débit inclus',
    advantage: 'coliving'
  },
  {
    aspect: 'Ménage',
    traditional: 'À votre charge',
    coliving: 'Parties communes incluses',
    advantage: 'coliving'
  },
  {
    aspect: 'Flexibilité',
    traditional: 'Bail rigide 12 mois',
    coliving: 'Contrats flexibles',
    advantage: 'coliving'
  },
  {
    aspect: 'Communauté',
    traditional: 'Limitée',
    coliving: 'Active et bienveillante',
    advantage: 'coliving'
  },
  {
    aspect: 'Support',
    traditional: 'Propriétaire uniquement',
    coliving: 'Équipe dédiée 7j/7',
    advantage: 'coliving'
  }
];

const processSteps = [
  {
    step: 1,
    title: 'Découverte',
    description: 'Visitez nos logements et découvrez l\'atmosphère unique du co-living.',
    icon: Home,
    color: 'blue'
  },
  {
    step: 2,
    title: 'Candidature',
    description: 'Déposez votre dossier en ligne en quelques minutes.',
    icon: UserCheck,
    color: 'green'
  },
  {
    step: 3,
    title: 'Validation',
    description: 'Nous étudions votre profil et vous répondons sous 48h.',
    icon: CheckCircle,
    color: 'purple'
  },
  {
    step: 4,
    title: 'Emménagement',
    description: 'Signez votre contrat et installez-vous immédiatement !',
    icon: Heart,
    color: 'red'
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
 * Page explicative du co-living
 */
export default function ColivingPage() {
  const [selectedBenefit, setSelectedBenefit] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      
      {/* === HERO SECTION === */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              ✨ L'habitat de demain
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Qu'est-ce que le <br />
              <span className="text-gradient bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                co-living ?
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Une nouvelle façon de vivre qui combine l'indépendance d'un logement privé 
              avec la richesse d'une communauté bienveillante.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Découvrir nos logements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Play className="mr-2 h-5 w-5" />
                Voir la visite vidéo
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* === DEFINITION DU CO-LIVING === */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Le co-living en quelques mots
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Le co-living est un mode de vie qui réinvente la colocation traditionnelle. 
              Il s'agit de logements pensés pour favoriser les rencontres et le partage, 
              tout en préservant l'intimité de chacun.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building,
                title: 'Espaces optimisés',
                description: 'Des logements conçus avec des espaces privés confortables et des parties communes spacieuses et bien équipées.'
              },
              {
                icon: Users,
                title: 'Communauté sélectionnée',
                description: 'Des résidents aux profils variés mais compatibles, créant une atmosphère conviviale et respectueuse.'
              },
              {
                icon: Handshake,
                title: 'Services inclus',
                description: 'Ménage, internet, charges, assurances... Tout est inclus pour simplifier votre quotidien.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* === AVANTAGES DÉTAILLÉS === */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pourquoi choisir le co-living ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez tous les avantages qui font du co-living la solution 
              idéale pour votre nouveau chez-vous.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Liste des avantages */}
            <div className="space-y-4">
              {colivingBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  onClick={() => setSelectedBenefit(index)}
                  className={cn(
                    "p-4 rounded-lg cursor-pointer transition-all duration-300",
                    selectedBenefit === index
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white hover:bg-blue-50 border border-gray-200"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      selectedBenefit === index
                        ? "bg-white/20"
                        : "bg-blue-100"
                    )}>
                      <benefit.icon className={cn(
                        "w-6 h-6",
                        selectedBenefit === index
                          ? "text-white"
                          : "text-blue-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {benefit.title}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        selectedBenefit === index
                          ? "text-blue-100"
                          : "text-gray-600"
                      )}>
                        {benefit.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-transform",
                        selectedBenefit === index 
                          ? "rotate-90 text-white" 
                          : "text-gray-400"
                      )} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Détails de l'avantage sélectionné */}
            <motion.div
              key={selectedBenefit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:sticky lg:top-8"
            >
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      {React.createElement(colivingBenefits[selectedBenefit].icon, {
                        className: "w-6 h-6 text-white"
                      })}
                    </div>
                    <div>
                      <CardTitle>{colivingBenefits[selectedBenefit].title}</CardTitle>
                      <CardDescription>
                        {colivingBenefits[selectedBenefit].description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {colivingBenefits[selectedBenefit].details.map((detail, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* === COMPARAISON === */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Co-living vs Logement traditionnel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez pourquoi le co-living est souvent plus avantageux 
              qu'un logement traditionnel.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-semibold text-gray-900">Critère</th>
                    <th className="p-4 text-center font-semibold text-gray-900">Logement traditionnel</th>
                    <th className="p-4 text-center font-semibold text-blue-600">Co-living Maison Oscar</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="p-4 font-medium text-gray-900">{item.aspect}</td>
                      <td className="p-4 text-center text-gray-600">{item.traditional}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-blue-600 font-medium">{item.coliving}</span>
                          {item.advantage === 'coliving' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.section>

      {/* === TÉMOIGNAGES === */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-blue-50"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ils ont testé le co-living
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez l'expérience de nos résidents et pourquoi ils recommandent 
              le co-living Maison Oscar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-gray-700 italic">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}, {testimonial.age} ans
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.occupation} • {testimonial.housing}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* === PROCESSUS === */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Rejoindre notre communauté co-living est simple et rapide. 
              Suivez ces 4 étapes pour intégrer votre nouveau chez-vous.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="text-center relative"
              >
                {/* Ligne de connexion */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0">
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-600"></div>
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white",
                    step.color === 'blue' && 'bg-blue-600',
                    step.color === 'green' && 'bg-green-600',
                    step.color === 'purple' && 'bg-purple-600',
                    step.color === 'red' && 'bg-red-600'
                  )}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className={cn(
                      "text-2xl font-bold mb-2",
                      step.color === 'blue' && 'text-blue-600',
                      step.color === 'green' && 'text-green-600',
                      step.color === 'purple' && 'text-purple-600',
                      step.color === 'red' && 'text-red-600'
                    )}>
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* === CTA FINAL === */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à découvrir le co-living ?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Rejoignez notre communauté et vivez une expérience unique 
            dans nos logements modernes à Bruz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/logements">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Voir nos logements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Poser une question
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}