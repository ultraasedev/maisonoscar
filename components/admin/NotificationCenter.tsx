'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, X, Check, AlertCircle, Calendar, CreditCard, 
  MessageSquare, Users, Home, Clock, ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface Notification {
  id: string
  type: 'payment' | 'booking' | 'message' | 'maintenance' | 'system'
  title: string
  message: string
  createdAt: Date
  read: boolean
  urgent: boolean
  link?: string
}

const iconMap = {
  payment: CreditCard,
  booking: Calendar,
  message: MessageSquare,
  maintenance: Home,
  system: AlertCircle
}

const colorMap = {
  payment: 'text-green-600 bg-green-100',
  booking: 'text-blue-600 bg-blue-100',
  message: 'text-purple-600 bg-purple-100',
  maintenance: 'text-orange-600 bg-orange-100',
  system: 'text-gray-600 bg-gray-100'
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Charger les notifications
  useEffect(() => {
    fetchNotifications()
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const fetchNotifications = async () => {
    try {
      // Simuler des notifications pour le moment
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'booking',
          title: 'Nouvelle demande de réservation',
          message: 'Jean Dupont a soumis une demande pour la Chambre 101',
          createdAt: new Date(Date.now() - 1000 * 60 * 5), // il y a 5 minutes
          read: false,
          urgent: true,
          link: '/admin/prospects'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Paiement en retard',
          message: 'Marie Martin - Loyer de décembre en retard de 3 jours',
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // il y a 1 heure
          read: false,
          urgent: true,
          link: '/admin/payments'
        },
        {
          id: '3',
          type: 'message',
          title: 'Nouveau message de contact',
          message: 'Pierre Durand demande des informations sur les chambres',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // il y a 2 heures
          read: false,
          urgent: false,
          link: '/admin/contacts'
        },
        {
          id: '4',
          type: 'maintenance',
          title: 'Maintenance programmée',
          message: 'Intervention plomberie prévue demain à 14h - Chambre 203',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // hier
          read: true,
          urgent: false,
          link: '/admin/rooms'
        }
      ]
      
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    }
  }
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }
  
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    const notification = notifications.find(n => n.id === id)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }
  
  return (
    <>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>
      
      {/* Panneau de notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            />
            
            {/* Panneau */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-12 w-full sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-gray-600 hover:text-gray-900"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Liste des notifications */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => {
                      const Icon = iconMap[notification.type]
                      const colorClass = colorMap[notification.type]
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50/30' : ''
                          }`}
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.link) {
                              window.location.href = notification.link
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                    {notification.urgent && (
                                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                        Urgent
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-0.5">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(notification.createdAt, { 
                                      addSuffix: true,
                                      locale: fr 
                                    })}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full absolute left-2 top-4" />
                              )}
                            </div>
                          </div>
                          {notification.link && (
                            <div className="mt-2 flex justify-end">
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                Voir plus <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button className="w-full text-center text-sm text-gray-600 hover:text-gray-900">
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}