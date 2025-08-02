/**
 * Fichier : components/home/FAQ.tsx
 * Description : Section FAQ avec accordéon interactif
 * Inclut : Questions fréquentes, animations, recherche de questions
 */

'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ChevronDown,
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Home,
  Users,
  CreditCard,
  Shield,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// === TYPES ET INTERFACES === //

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'logement' | 'reservation' | 'paiement' | 'vie-commune';
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
}

interface FAQProps {
  className?: string;
}

// === DONNÉES FAQ === //

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Qu\'est-ce que le co-living exactement ?',
    answer: 'Le co-living est un mode de vie moderne qui combine logement privé et espaces partagés. Vous disposez de votre chambre privée meublée avec salle de bain, tout en partageant des espaces communs comme la cuisine, le salon et parfois un jardin avec d\'autres résidents. C\'est l\'opportunité de créer du lien social dans un cadre bienveillant.',
    category: 'general',
    icon: Home,
    popular: true
  },
  {
    id: '2',
    question: 'Que comprend le loyer mensuel ?',
    answer: 'Notre loyer tout inclus comprend : votre chambre meublée, l\'accès à tous les espaces communs, toutes les charges (électricité, chauffage, eau), Internet haut débit, le ménage des parties communes, l\'assurance habitation de base, et l\'accompagnement de notre équipe.',
    category: 'paiement',
    icon: CreditCard,
    popular: true
  },
  {
    id: '3',
    question: 'Quelle est la durée minimum de séjour ?',
    answer: 'Nous proposons des contrats flexibles à partir de 3 mois. Selon vos besoins, vous pouvez opter pour un séjour de courte durée (3-6 mois) ou plus long (6 mois à 2 ans). Plus votre engagement est long, plus les conditions sont avantageuses.',
    category: 'reservation',
    icon: Calendar,
    popular: true
  },
  {
    id: '4',
    question: 'Comment se déroule la sélection des colocataires ?',
    answer: 'Nous accordons une grande importance à la qualité de vie en communauté. Chaque candidat passe par un processus de sélection bienveillant incluant un questionnaire sur ses habitudes de vie, ses centres d\'intérêt, et un entretien téléphonique. L\'objectif est de créer des groupes harmonieux et respectueux.',
    category: 'vie-commune',
    icon: Users
  },
  {
    id: '5',
    question: 'Puis-je visiter avant de réserver ?',
    answer: 'Absolument ! Nous encourageons les visites pour que vous puissiez découvrir l\'atmosphère des lieux et rencontrer l\'équipe. Vous pouvez programmer une visite via notre site ou nous contacter directement. Nous proposons aussi des visites virtuelles si vous ne pouvez pas vous déplacer.',
    category: 'logement',
    icon: Home
  },
  {
    id: '6',
    question: 'Quels documents dois-je fournir pour candidater ?',
    answer: 'Pour votre dossier, nous demandons : une pièce d\'identité, 3 derniers bulletins de salaire ou justificatifs de revenus, un RIB, une attestation d\'assurance responsabilité civile, et parfois un garant selon votre situation. Notre équipe vous accompagne dans la constitution du dossier.',
    category: 'reservation',
    icon: FileText
  },
  {
    id: '7',
    question: 'Y a-t-il des règles de vie commune ?',
    answer: 'Oui, nous avons établi un règlement intérieur bienveillant pour garantir le respect et le bien-être de tous. Il couvre les horaires de tranquillité, l\'entretien des espaces communs, l\'organisation des tâches, et les modalités pour recevoir des invités. Tout est pensé pour favoriser la convivialité.',
    category: 'vie-commune',
    icon: Shield
  },
  {
    id: '8',
    question: 'Que se passe-t-il en cas de problème ou de conflit ?',
    answer: 'Notre équipe est là pour vous accompagner 24h/24. Nous avons mis en place une médiation bienveillante pour résoudre rapidement tout malentendu. De plus, notre gestionnaire de communauté organise régulièrement des temps d\'échange pour prévenir les tensions et renforcer la cohésion.',
    category: 'vie-commune',
    icon: HelpCircle
  }
];

const categoryLabels = {
  general: 'Général',
  logement: 'Logement', 
  reservation: 'Réservation',
  paiement: 'Paiement',
  'vie-commune': 'Vie commune'
};

const categoryColors = {
  general: 'bg-blue-100 text-blue-800',
  logement: 'bg-green-100 text-green-800',
  reservation: 'bg-purple-100 text-purple-800', 
  paiement: 'bg-orange-100 text-orange-800',
  'vie-commune': 'bg-pink-100 text-pink-800'
};

// === COMPOSANT PRINCIPAL === //

export function FAQ({ className }: FAQProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>(['1']); // Premier item ouvert par défaut
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  // Filtrage des FAQ
  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section 
      ref={ref}
      className={`py-16 lg:py-24 bg-background ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
          >
            <HelpCircle className="w-4 h-4" />
            Questions fréquentes
          </motion.div>
          
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Nous répondons à vos{' '}
            <span className="text-primary">questions</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Retrouvez ici les réponses aux questions les plus fréquentes sur le co-living 
            et nos services. Besoin d'aide ? Notre équipe est là pour vous accompagner.
          </p>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtre par catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Toutes les catégories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Liste des FAQ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          {filteredFAQ.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune question ne correspond à votre recherche.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFAQ.map((item, index) => {
                const IconComponent = item.icon;
                const isOpen = openItems.includes(item.id);
                
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <Card className="overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Icône */}
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            
                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {item.popular && (
                                      <Badge variant="secondary" className="text-xs">
                                        Populaire
                                      </Badge>
                                    )}
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", categoryColors[item.category])}
                                    >
                                      {categoryLabels[item.category]}
                                    </Badge>
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                    {item.question}
                                  </h3>
                                </div>
                                
                                <ChevronDown 
                                  className={cn(
                                    "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                                    isOpen && "transform rotate-180"
                                  )}
                                />
                              </div>
                              
                              {/* Réponse */}
                              <motion.div
                                initial={false}
                                animate={{
                                  height: isOpen ? "auto" : 0,
                                  opacity: isOpen ? 1 : 0
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 pb-2">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {item.answer}
                                  </p>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* CTA Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12 lg:mt-16"
        >
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12 max-w-2xl mx-auto">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe est là pour répondre à toutes vos questions personnalisées 
              et vous accompagner dans votre projet de co-living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Phone className="w-4 h-4" />
                Nous appeler
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Mail className="w-4 h-4" />
                Nous écrire
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}