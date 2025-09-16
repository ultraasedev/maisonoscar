'use client';

import { motion, useInView } from 'framer-motion';
import { MessageCircle, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { config } from '@/lib/config';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSettings, setContactSettings] = useState({
    email: config.contacts.email,
    phone: config.contacts.phone,
    whatsapp: config.contacts.whatsapp,
    address: config.contacts.address
  });

  useEffect(() => {
    // Récupérer les contacts depuis les settings
    fetch('/api/cms/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setContactSettings({
            email: data.data.contactEmail || config.contacts.email,
            phone: data.data.contactPhone || config.contacts.phone,
            whatsapp: data.data.whatsappNumber || config.contacts.whatsapp,
            address: data.data.contactAddress || config.contacts.address
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Séparer le nom complet en prénom et nom
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          subject: 'Demande d\'information',
          message: formData.message,
          type: 'QUESTION'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Afficher un message de succès
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Message envoyé avec succès ! Nous vous contacterons bientôt.';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          successDiv.remove();
        }, 5000);
        
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Afficher un message d'erreur
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorDiv.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer.';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Bonjour ! Je suis intéressé(e) par le co-living Maison Oscar à Bruz. Pouvez-vous me donner plus d'informations ?"
    );
    const whatsappNumber = contactSettings.whatsapp.replace(/\s/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adresse',
      content: contactSettings.address,
      subContent: '15 min de Rennes'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: contactSettings.phone,
      subContent: 'Lun-Sam 9h-19h'
    },
    {
      icon: Mail,
      title: 'Email',
      content: contactSettings.email,
      subContent: 'Réponse sous 24h'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="contact"
      className="py-16 lg:py-24 bg-black text-[#F5F3F0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Besoin d'un
            <br />
            <span className="relative">
              renseignement ?
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-2 left-0 w-full h-1 bg-[#F5F3F0] rounded-full origin-left"
              />
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Contactez-nous.
          </p>
        </motion.div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <MessageCircle className="w-12 h-12 mb-6" />
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Contact rapide via WhatsApp
              </h3>
              <p className="text-green-100 mb-6 leading-relaxed">
                Réponse immédiate à vos questions. Organisez votre visite en quelques clics !
              </p>
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <MessageCircle className="w-5 h-5" />
                Ouvrir WhatsApp
              </motion.button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-[#F5F3F0] text-black rounded-3xl p-8 lg:p-10"
          >
            <h3 className="text-2xl lg:text-3xl font-bold mb-6">
              Ou écrivez-nous
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                  placeholder="Parlez-nous de votre projet..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-[#F5F3F0] py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#F5F3F0]/30 border-t-[#F5F3F0] rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
              >
                <div className="w-12 h-12 bg-[#F5F3F0] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-semibold text-[#F5F3F0] mb-2">
                  {info.title}
                </h4>
                <p className="text-gray-300 font-medium mb-1">
                  {info.content}
                </p>
                <p className="text-gray-400 text-sm">
                  {info.subContent}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-12 lg:mt-16"
        >
          <div className="bg-white/5 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-gray-300 text-sm">
              💡 <strong>Conseil :</strong> Pour une réponse plus rapide, contactez-nous via WhatsApp. 
             
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};