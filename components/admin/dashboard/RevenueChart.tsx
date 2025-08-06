// Fichier : components/admin/dashboard/RevenueChart.tsx
'use client'

import { motion } from 'framer-motion'

interface RevenueData {
  month: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueData[]
  loading?: boolean
}

export const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Revenus des 12 derniers mois
      </h3>
      
      <div className="space-y-4">
        {data.slice(-6).map((item, index) => (
          <motion.div
            key={item.month}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="w-16 text-sm text-gray-500 font-medium">
              {item.month}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                className="bg-black h-2 rounded-full"
              />
            </div>
            <div className="w-20 text-sm font-medium text-gray-900 text-right">
              {item.revenue.toLocaleString()}€
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}