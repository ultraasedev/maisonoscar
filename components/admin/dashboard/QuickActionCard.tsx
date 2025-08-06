// Fichier : components/admin/dashboard/QuickActionCard.tsx
'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface QuickActionCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  count?: number
  urgent?: boolean
}

export const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  count,
  urgent = false 
}: QuickActionCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={`block bg-white rounded-xl border p-4 hover:shadow-md transition-all duration-200 ${
          urgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              urgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-medium ${urgent ? 'text-red-900' : 'text-gray-900'}`}>
                {title}
              </h3>
              <p className={`text-sm ${urgent ? 'text-red-600' : 'text-gray-500'}`}>
                {description}
              </p>
            </div>
          </div>
          {count !== undefined && (
            <div className={`px-2 py-1 rounded-full text-sm font-medium ${
              urgent ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {count}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}