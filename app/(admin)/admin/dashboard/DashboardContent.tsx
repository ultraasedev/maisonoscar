'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Home, 
  Calendar, 
  Euro,
  TrendingUp,
  AlertCircle,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import { useDashboard } from '@/hooks/useApi'

// Interface pour les statistiques
interface DashboardStats {
  overview: {
    totalUsers: number
    totalRooms: number
    totalBookings: number
    totalContacts: number
    activeBookings: number
    occupiedRooms: number
    availableRooms: number
    pendingPayments: number
    latePayments: number
    occupancyRate: number
    monthlyRevenue: number
  }
  trends: {
    period: number
    recentBookings: number
    recentPayments: number
    recentContacts: number
    monthlyRevenueData: Array<{
      month: string
      revenue: number
    }>
  }
  details: {
    topRooms: Array<{
      id: string
      name: string
      number: string
      revenue: number
    }>
    upcomingPayments: Array<{
      id: string
      amount: number
      dueDate: string
      tenant: string
      room: string
      isOverdue: boolean
    }>
    newContacts: Array<{
      id: string
      name: string
      email: string
      subject: string
      type: string
      createdAt: string
    }>
  }
}

// Composant StatsCard
function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  change 
}: {
  title: string
  value: string | number
  icon: any
  color: string
  change?: {
    value: number
    trend: 'up' | 'down' | 'stable'
  }
}) {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || 'text-gray-600 bg-gray-100'}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <span className={`text-sm font-medium ${trendColors[change.trend]}`}>
            {trendIcons[change.trend]} {change.value}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// Composant QuickActionCard
function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  count,
  urgent = false
}: {
  title: string
  description: string
  href: string
  icon: any
  count: number
  urgent?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer ${
      urgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`h-6 w-6 ${urgent ? 'text-red-600' : 'text-gray-600'}`} />
        <span className={`text-2xl font-bold ${urgent ? 'text-red-600' : 'text-gray-900'}`}>
          {count}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export default function DashboardContent() {
  const [period, setPeriod] = useState('30')
  const { data: dashboardData, loading, error, refresh } = useDashboard(period)

  console.log('Dashboard Debug:', { dashboardData, loading, error })

  // Debug des erreurs
  useEffect(() => {
    if (error) {
      console.error('Dashboard Error:', error)
    }
    if (dashboardData) {
      console.log('Dashboard Data:', dashboardData)
    }
  }, [error, dashboardData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Erreur de chargement</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => refresh()}
                className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ CORRECTION : Gérer les données directes de l'API avec typage correct
  let stats: DashboardStats

  if (dashboardData?.data) {
    // Si on a un wrapper avec data
    stats = dashboardData.data as DashboardStats
  } else if (dashboardData && 'overview' in dashboardData) {
    // Si les données sont directes (ce qui semble être le cas)
    stats = dashboardData as any as DashboardStats
  } else {
    // Pas de données
    return (
      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900">Données non disponibles</h3>
              <p className="text-orange-600 text-sm mt-1">
                Les données du dashboard ne sont pas accessibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de Maison Oscar</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm bg-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
          
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Revenus mensuels"
          value={`${stats.overview.monthlyRevenue?.toLocaleString() || 0}€`}
          icon={Euro}
          color="green"
          change={{
            value: 8.2,
            trend: 'up'
          }}
        />
        <StatsCard
          title="Taux d'occupation"
          value={`${stats.overview.occupancyRate || 0}%`}
          icon={Home}
          color="blue"
          change={{
            value: 2.1,
            trend: 'up'
          }}
        />
        <StatsCard
          title="Réservations actives"
          value={stats.overview.activeBookings || 0}
          icon={Calendar}
          color="purple"
          change={{
            value: 5.0,
            trend: 'stable'
          }}
        />
        <StatsCard
          title="Paiements en retard"
          value={stats.overview.latePayments || 0}
          icon={AlertCircle}
          color={stats.overview.latePayments > 0 ? "red" : "green"}
          change={{
            value: stats.overview.latePayments > 0 ? 12.5 : 0,
            trend: stats.overview.latePayments > 0 ? 'up' : 'stable'
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="Paiements en attente"
          description="Paiements à traiter"
          href="/admin/payments?status=pending"
          icon={CreditCard}
          count={stats.overview.pendingPayments}
          urgent={stats.overview.latePayments > 0}
        />
        <QuickActionCard
          title="Nouveaux messages"
          description="Messages non traités"
          href="/admin/contacts?status=new"
          icon={MessageSquare}
          count={stats.details.newContacts.length}
        />
        <QuickActionCard
          title="Chambres disponibles"
          description="Chambres à louer"
          href="/admin/rooms?status=available"
          icon={Home}
          count={stats.overview.availableRooms}
        />
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par mois */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Revenus mensuels
          </h3>
          <div className="space-y-3">
            {stats.trends.monthlyRevenueData.slice(-6).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <span className="font-semibold">{item.revenue.toLocaleString()}€</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des utilisateurs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Statistiques générales
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
              <p className="text-sm text-gray-600">Utilisateurs</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalRooms}</p>
              <p className="text-sm text-gray-600">Chambres</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalBookings}</p>
              <p className="text-sm text-gray-600">Réservations</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalContacts}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message si pas de données */}
      {stats.overview.totalRooms === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Home className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Commencez par ajouter des chambres</h3>
              <p className="text-blue-600 text-sm mt-1">
                Créez vos premières chambres pour voir apparaître les statistiques.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}