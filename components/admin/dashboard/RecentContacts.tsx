// Fichier : components/admin/dashboard/RecentContacts.tsx
'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  type: string
  createdAt: string
}

interface RecentContactsProps {
  contacts: Contact[]
  loading?: boolean
}

const getContactIcon = (type: string) => {
  switch (type) {
    case 'BOOKING': return Phone
    case 'VISIT': return MessageSquare
    default: return Mail
  }
}

const getContactTypeLabel = (type: string) => {
  switch (type) {
    case 'BOOKING': return 'Réservation'
    case 'VISIT': return 'Visite'
    case 'GENERAL': return 'Général'
    case 'COMPLAINT': return 'Réclamation'
    case 'MAINTENANCE': return 'Maintenance'
    default: return 'Autre'
  }
}

export const RecentContacts = ({ contacts, loading }: RecentContactsProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Nouveaux messages
        </h3>
        <Link 
          href="/admin/contacts"
          className="text-sm text-black hover:text-gray-700 font-medium"
        >
          Voir tout →
        </Link>
      </div>
      
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun nouveau message
          </p>
        ) : (
          contacts.map((contact, index) => {
            const Icon = getContactIcon(contact.type)
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {contact.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.subject}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {getContactTypeLabel(contact.type)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}