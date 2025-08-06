// Fichier : components/admin/dashboard/UpcomingPayments.tsx
'use client'

import { motion } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  dueDate: string
  tenant: string
  room: string
  isOverdue: boolean
}

interface UpcomingPaymentsProps {
  payments: Payment[]
  loading?: boolean
}

export const UpcomingPayments = ({ payments, loading }: UpcomingPaymentsProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Paiements à venir
      </h3>
      
      <div className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun paiement à venir
          </p>
        ) : (
          payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                payment.isOverdue 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {payment.isOverdue ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    payment.isOverdue ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    {payment.tenant}
                  </p>
                  <p className={`text-sm ${
                    payment.isOverdue ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {payment.room} • {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className={`font-semibold ${
                payment.isOverdue ? 'text-red-700' : 'text-gray-900'
              }`}>
                {payment.amount}€
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}