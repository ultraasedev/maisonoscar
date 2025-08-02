'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Home, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  FileText,
  Bell,
  Settings,
  Download,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// === TYPES === //

interface DashboardStats {
  totalHousings: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingReservations: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageStayDuration: number;
  monthlyStats: {
    month: string;
    reservations: number;
    revenue: number;
    occupancy: number;
  }[];
  stayDurationBreakdown: {
    duration: string;
    count: number;
    percentage: number;
  }[];
}

interface Reservation {
  id: string;
  tenantName: string;
  housingName: string;
  moveInDate: string;
  status: 'pending' | 'approved' | 'contract_sent' | 'confirmed' | 'rejected';
  amount: number;
  createdAt: string;
}

interface Payment {
  id: string;
  tenantName: string;
  type: 'rent' | 'deposit' | 'fees';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

// === DONNÉES SIMULÉES === //

const mockStats: DashboardStats = {
  totalHousings: 12,
  availableRooms: 8,
  occupiedRooms: 34,
  pendingReservations: 6,
  monthlyRevenue: 28500,
  occupancyRate: 81,
  averageStayDuration: 8.5,
  monthlyStats: [
    { month: 'Jan', reservations: 15, revenue: 25000, occupancy: 75 },
    { month: 'Fév', reservations: 18, revenue: 27000, occupancy: 78 },
    { month: 'Mar', reservations: 22, revenue: 28500, occupancy: 81 },
    { month: 'Avr', reservations: 20, revenue: 29000, occupancy: 83 },
    { month: 'Mai', reservations: 25, revenue: 31000, occupancy: 85 },
    { month: 'Juin', reservations: 19, revenue: 28500, occupancy: 81 }
  ],
  stayDurationBreakdown: [
    { duration: '< 3 mois', count: 12, percentage: 25 },
    { duration: '3-6 mois', count: 18, percentage: 37 },
    { duration: '6-12 mois', count: 15, percentage: 31 },
    { duration: '> 1 an', count: 3, percentage: 7 }
  ]
};

const mockReservations: Reservation[] = [
  {
    id: 'res_001',
    tenantName: 'Marie Dubois',
    housingName: 'Villa Montmartre',
    moveInDate: '2025-08-15',
    status: 'pending',
    amount: 850,
    createdAt: '2025-07-10'
  },
  {
    id: 'res_002',
    tenantName: 'Thomas Martin',
    housingName: 'Loft République',
    moveInDate: '2025-08-01',
    status: 'approved',
    amount: 950,
    createdAt: '2025-07-08'
  },
  {
    id: 'res_003',
    tenantName: 'Julie Leroux',
    housingName: 'Maison Belleville',
    moveInDate: '2025-07-25',
    status: 'contract_sent',
    amount: 780,
    createdAt: '2025-07-05'
  }
];

const mockPayments: Payment[] = [
  {
    id: 'pay_001',
    tenantName: 'Pierre Moreau',
    type: 'rent',
    amount: 850,
    dueDate: '2025-07-31',
    status: 'overdue'
  },
  {
    id: 'pay_002',
    tenantName: 'Sophie Bernard',
    type: 'deposit',
    amount: 1200,
    dueDate: '2025-07-20',
    status: 'pending'
  },
  {
    id: 'pay_003',
    tenantName: 'Lucas Petit',
    type: 'rent',
    amount: 920,
    dueDate: '2025-07-15',
    status: 'paid',
    paidDate: '2025-07-14'
  }
];

// === COMPOSANTS === //

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
  color: string;
}> = ({ title, value, icon, trend, suffix, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {value}{suffix}
        </p>
        {trend && (
          <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% ce mois
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approuvé' },
    contract_sent: { color: 'bg-blue-100 text-blue-800', label: 'Contrat envoyé' },
    confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmé' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeté' },
    paid: { color: 'bg-green-100 text-green-800', label: 'Payé' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'En retard' },
    rent: { color: 'bg-blue-100 text-blue-800', label: 'Loyer' },
    deposit: { color: 'bg-purple-100 text-purple-800', label: 'Caution' },
    fees: { color: 'bg-gray-100 text-gray-800', label: 'Frais' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || 
                 { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const ReservationRow: React.FC<{ reservation: Reservation }> = ({ reservation }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{reservation.tenantName}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{reservation.housingName}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{reservation.moveInDate}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={reservation.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{reservation.amount}€</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex items-center space-x-2">
        <button className="text-blue-600 hover:text-blue-900">
          <Eye className="h-4 w-4" />
        </button>
        <button className="text-green-600 hover:text-green-900">
          <CheckCircle className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

const PaymentRow: React.FC<{ payment: Payment }> = ({ payment }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{payment.tenantName}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={payment.type} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{payment.amount}€</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{payment.dueDate}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={payment.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex items-center space-x-2">
        <button className="text-blue-600 hover:text-blue-900">
          <Eye className="h-4 w-4" />
        </button>
        {payment.status === 'pending' && (
          <button className="text-green-600 hover:text-green-900">
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
        <button className="text-gray-600 hover:text-gray-900">
          <Download className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

// === COMPOSANT PRINCIPAL === //

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [loading, setLoading] = useState(false);

  // Simuler le chargement des données
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleApproveReservation = (id: string) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status: 'approved' as const } : res
      )
    );
    // Ici vous ajouteriez la logique pour envoyer une notification
    console.log('Réservation approuvée:', id);
  };

  const handleRejectReservation = (id: string) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status: 'rejected' as const } : res
      )
    );
    console.log('Réservation rejetée:', id);
  };

  const handleMarkPaymentPaid = (id: string) => {
    setPayments(prev => 
      prev.map(pay => 
        pay.id === id ? { 
          ...pay, 
          status: 'paid' as const, 
          paidDate: new Date().toISOString().split('T')[0] 
        } : pay
      )
    );
    console.log('Paiement marqué comme payé:', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Logements"
            value={stats.totalHousings}
            icon={<Home className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Taux d'Occupation"
            value={stats.occupancyRate}
            suffix="%"
            trend={5}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Revenus Mensuels"
            value={`${(stats.monthlyRevenue / 1000).toFixed(0)}k`}
            suffix="€"
            trend={8}
            icon={<CreditCard className="h-6 w-6 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Réservations en attente"
            value={stats.pendingReservations}
            icon={<Clock className="h-6 w-6 text-white" />}
            color="bg-orange-500"
          />
        </div>

        {/* Graphiques et métriques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution mensuelle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution Mensuelle
            </h3>
            <div className="space-y-4">
              {stats.monthlyStats.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {month.month}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-900">
                      {month.reservations} rés.
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {(month.revenue / 1000).toFixed(0)}k€
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${month.occupancy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Répartition durée de séjour */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Durée de Séjour
            </h3>
            <div className="space-y-4">
              {stats.stayDurationBreakdown.map((item) => (
                <div key={item.duration} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {item.duration}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-900">
                      {item.count}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Réservations récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Réservations Récentes
              </h3>
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'entrée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <ReservationRow key={reservation.id} reservation={reservation} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Paiements récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Paiements Récents
              </h3>
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <PaymentRow key={payment.id} payment={payment} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}