/**
 * Fichier : app/contact/page.tsx
 * Description : Page contact améliorée avec design moderne et UX optimisée
 * Mobile-first avec animations et micro-interactions
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Calendar,
  CheckCircle,
  AlertCircle,
  Users,
  Home,
  CreditCard,
  FileText,
  Facebook,
  Instagram,
  ArrowRight,
  Zap,
  Heart,
  Star,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// === SCHÉMA DE VALIDATION === //

const contactSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Veuillez sélectionner un sujet'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  contactMethod: z.enum(['email', 'phone', 'whatsapp']),
});

type ContactFormData = z.infer<typeof contactSchema>;

// === DONNÉES DE CONTACT === //

const contactInfo = {
  address: {
    street: '123 Rue de la République',
    city: 'Bruz',
    zipCode: '35170',
    country: 'France'
  },
  phone: '+33 2 99 XX XX XX',
  email: 'contact@maisonoscar.fr',
  whatsapp: '+33 6 XX XX XX XX',
  hours: {
    weekdays: 'Lundi - Vendredi : 9h00 - 18h00',
    saturday: 'Samedi : 10h00 - 16h00',
    sunday: 'Dimanche : Fermé'
  },
  socialMedia: [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      href: 'https://facebook.com/maisonoscar',
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'hover:bg-blue-50'
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      href: 'https://instagram.com/maisonoscar',
      color: 'text-pink-600 hover:text-pink-700',
      bgColor: 'hover:bg-pink-50'
    },
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      href: 'https://wa.me/33600000000',
      color: 'text-green-600 hover:text-green-700',
      bgColor: 'hover:bg-green-50'
    }
  ]
};

// === OPTIONS DE FORMULAIRE === //

const subjectOptions = [
  { value: 'information', label: 'Demande d\'information', icon: '💡' },
  { value: 'visit', label: 'Organiser une visite', icon: '🏠' },
  { value: 'reservation', label: 'Réservation', icon: '📅' },
  { value: 'support', label: 'Support technique', icon: '🔧' },
  { value: 'partnership', label: 'Partenariat', icon: '🤝' },
  { value: 'other', label: 'Autre', icon: '📧' }
];

const contactMethodOptions = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Téléphone', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' }
];

// === FAQ RAPIDE === //

const quickFAQ = [
  {
    question: 'Quels sont les documents requis ?',
    answer: 'Pièce d\'identité, justificatif de revenus, et justificatif de domicile. La liste complète est disponible lors de la réservation.',
    icon: FileText
  },
  {
    question: 'Le co-living est-il meublé ?',
    answer: 'Oui, tous nos logements sont entièrement meublés et équipés. Vous n\'avez besoin que de vos affaires personnelles.',
    icon: Home
  },
  {
    question: 'Comment se passent les paiements ?',
    answer: 'Les loyers se paient mensuellement par virement bancaire. Nous envoyons un rappel 7 jours avant l\'échéance.',
    icon: CreditCard
  },
  {
    question: 'Puis-je visiter avant de réserver ?',
    answer: 'Absolument ! Nous organisons des visites physiques et virtuelles. Contactez-nous pour planifier votre visite.',
    icon: Calendar
  }
];

// === ANIMATIONS === //

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

// === COMPOSANT PRINCIPAL === //

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactMethod: 'email'
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Données du formulaire:', data);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* === HERO SECTION === */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-white/20 text-white border-0 mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Réponse garantie sous 24h
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contactez-nous
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Une question ? Un projet ? Notre équipe est là pour vous accompagner 
              dans votre recherche du logement idéal.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Appeler maintenant
                </a>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold"
              >
                <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* === CONTENU PRINCIPAL === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* === FORMULAIRE DE CONTACT === */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <motion.div variants={itemVariants}>
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Send className="w-6 h-6 text-blue-600" />
                    Envoyez-nous un message
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Prénom"
                            required
                            placeholder="Votre prénom"
                            {...field}
                            error={errors.firstName?.message}
                          />
                        )}
                      />
                      
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Nom"
                            required
                            placeholder="Votre nom"
                            {...field}
                            error={errors.lastName?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Email"
                            type="email"
                            required
                            placeholder="votre@email.com"
                            {...field}
                            error={errors.email?.message}
                          />
                        )}
                      />
                      
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Téléphone (optionnel)"
                            type="tel"
                            placeholder="06 12 34 56 78"
                            {...field}
                            error={errors.phone?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Sujet et méthode de contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Sujet de votre demande"
                            required
                            options={subjectOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Sélectionnez un sujet"
                            errorMessage={errors.subject?.message}
                          />
                        )}
                      />
                      
                      <Controller
                        name="contactMethod"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Comment vous recontacter ?"
                            required
                            options={contactMethodOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Méthode de contact"
                            errorMessage={errors.contactMethod?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Message */}
                    <Controller
                      name="message"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Votre message *
                          </label>
                          <Textarea
                            placeholder="Décrivez-nous votre projet, vos besoins, vos questions..."
                            className="min-h-32 resize-none border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                          />
                          {errors.message && (
                            <p className="mt-2 text-sm text-red-600 font-medium">
                              {errors.message.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    {/* Status messages */}
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-green-800 font-medium">Message envoyé avec succès !</p>
                          <p className="text-green-700 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                        </div>
                      </motion.div>
                    )}
                    
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-red-800 font-medium">Erreur lors de l'envoi</p>
                          <p className="text-red-700 text-sm">Veuillez réessayer ou nous contacter directement.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Bouton d'envoi */}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Envoi en cours...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Envoyer le message
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* === SIDEBAR === */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            
            {/* Informations de contact */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Nos coordonnées
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Adresse</div>
                      <div className="text-gray-600 text-sm">
                        {contactInfo.address.street}<br />
                        {contactInfo.address.zipCode} {contactInfo.address.city}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Téléphone</div>
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Horaires</div>
                      <div className="text-gray-600 text-sm space-y-1">
                        <div>{contactInfo.hours.weekdays}</div>
                        <div>{contactInfo.hours.saturday}</div>
                        <div>{contactInfo.hours.sunday}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Réseaux sociaux */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    Suivez-nous
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {contactInfo.socialMedia.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex flex-col items-center p-4 rounded-xl border border-gray-200 transition-all duration-300 group',
                            'hover:shadow-lg hover:scale-105',
                            social.bgColor
                          )}
                        >
                          <Icon className={cn('w-6 h-6 mb-2 transition-colors', social.color)} />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                            {social.name}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ rapide */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-600" />
                    Questions fréquentes
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  {quickFAQ.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                              {item.question}
                            </div>
                            <div className="text-gray-600 text-xs leading-relaxed">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-white" />
                  <h3 className="text-lg font-bold mb-2">
                    Réponse garantie sous 24h
                  </h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Notre équipe s'engage à vous répondre rapidement pour toute demande.
                  </p>
                  <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                    <a href={`tel:${contactInfo.phone}`}>
                      Appel d'urgence
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}