'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Loader2, Send, Check, User, Mail, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    content: '',
    rating: 5
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          role: '',
          content: '',
          rating: 5
        })
        setSuccess(false)
      }, 300)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.content.length < 20) {
      toast.error('Votre avis doit contenir au moins 20 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/cms/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role || 'Résident',
          content: formData.content,
          rating: formData.rating,
          isActive: true // Publication directe
        })
      })

      if (response.ok) {
        setSuccess(true)
        toast.success('Merci pour votre avis ! Il est maintenant publié sur le site.')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de votre avis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg lg:max-w-xl xl:max-w-2xl pointer-events-auto overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
              {success ? (
                /* Success state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 sm:p-6 lg:p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  >
                    <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </motion.div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Merci pour votre avis !
                  </h3>
                  
                  <p className="text-gray-600">
                    Votre témoignage a été publié avec succès sur le site !
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="relative bg-black p-4 sm:p-6 text-white flex-shrink-0">
                    <button
                      onClick={onClose}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <h2 className="text-xl sm:text-2xl font-bold mb-2 pr-10">
                      Partagez votre expérience
                    </h2>
                    <p className="text-[#F5F3F0] text-xs sm:text-sm">
                      Votre avis aide les futurs résidents à faire leur choix
                    </p>
                  </div>

                  {/* Form */}
                  <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Name */}
                    <div>
                      <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        Votre nom *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jean Dupont"
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jean@example.com"
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Votre email ne sera pas publié
                      </p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Votre statut
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                        disabled={loading}
                      >
                        <option value="">Sélectionnez...</option>
                        <option value="Résident actuel">Résident actuel</option>
                        <option value="Ancien résident">Ancien résident</option>
                        <option value="Étudiant">Étudiant</option>
                        <option value="Parent">Parent</option>
                        <option value="Visiteur">Visiteur</option>
                      </select>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Votre note
                      </label>
                      <div className="flex gap-1 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            disabled={loading}
                            className="transition-all hover:scale-110 disabled:opacity-50 p-1"
                          >
                            <Star
                              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                                star <= formData.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        Votre avis * <span className="text-xs text-gray-500">(min. 20 caractères)</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Partagez votre expérience à la Maison Oscar..."
                        rows={3}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none text-sm sm:text-base"
                        required
                        minLength={20}
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.content.length} caractères
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        Annuler
                      </button>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            <span className="hidden sm:inline">Envoi...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Publier mon avis</span>
                            <span className="sm:hidden">Publier</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}