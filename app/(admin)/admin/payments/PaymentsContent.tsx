'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Euro, Search, Filter, Calendar, User, Home, Check, X, Clock,
  AlertCircle, FileText, Download, Send, RefreshCw, Loader2,
  ChevronDown, ChevronRight, Mail, Bell, CheckCircle, XCircle,
  CreditCard, TrendingUp, AlertTriangle, Eye, Edit2
} from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  id: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  bookingId: string
  booking: {
    id: string
    room: {
      id: string
      name: string
      number: number
      price: number
    }
  }
  amount: number
  paymentType: 'RENT' | 'DEPOSIT' | 'CHARGES' | 'FEES'
  status: 'PENDING' | 'PAID' | 'LATE' | 'CANCELLED'
  dueDate: string
  paidDate?: string
  isLate: boolean
  lateDays?: number
  reminderSent: boolean
  reminderDate?: string
  reminderCount: number
  createdAt: string
  updatedAt: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  room: {
    id: string
    name: string
    number: number
    price: number
  }
  bookingStartDate: string
  paymentDay: number
  totalPaid: number
  totalDue: number
  status: 'ACTIVE' | 'LATE' | 'LEAVING'
}

const statusConfig = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  LATE: { label: 'En retard', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700', icon: XCircle }
}

const typeLabels = {
  RENT: 'Loyer',
  DEPOSIT: 'Caution',
  CHARGES: 'Charges',
  FEES: 'Frais'
}



export default function PaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'payments' | 'tenants'>('payments')

  useEffect(() => {
    // Charger les paiements
    fetchPayments()
    // Charger les locataires
    fetchTenants()
    // Simuler les rappels automatiques
    checkPaymentReminders()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchQuery, statusFilter, typeFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments')
      const result = await response.json()
      
      if (result.success) {
        setPayments(result.data)
        setFilteredPayments(result.data)
      } else {
        toast.error('Erreur lors du chargement des paiements')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des paiements')
    } finally {
      setLoading(false)
    }
  }

  const fetchTenants = async () => {
    try {
      // For now, we'll derive tenants from active bookings
      // This could be moved to a dedicated API endpoint later
      const response = await fetch('/api/bookings?status=ACTIVE')
      const result = await response.json()

      if (result.success) {
        const tenantsData = result.data.map((booking: any) => ({
          id: booking.user.id,
          firstName: booking.user.firstName,
          lastName: booking.user.lastName,
          email: booking.user.email,
          roomName: booking.room.name,
          monthlyRent: booking.monthlyRent,
          paymentDay: 5, // Default payment day
          totalPaid: 0, // Will be calculated from payments
          totalDue: 0, // Will be calculated from payments
          status: 'ACTIVE' as const
        }))
        setTenants(tenantsData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des locataires:', error)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(p => p.paymentType === typeFilter)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.user.firstName.toLowerCase().includes(query) ||
        p.user.lastName.toLowerCase().includes(query) ||
        p.user.email.toLowerCase().includes(query) ||
        p.booking.room.name.toLowerCase().includes(query)
      )
    }
    
    setFilteredPayments(filtered)
  }

  const checkPaymentReminders = () => {
    // Vérifier les paiements à venir dans 5 jours
    const fiveDaysFromNow = new Date()
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)
    
    payments.forEach(payment => {
      const dueDate = new Date(payment.dueDate)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 5 && payment.status === 'PENDING') {
        console.log(`Rappel: Paiement de ${payment.user.firstName} dans 5 jours`)
        // En production : envoyer email de rappel
      }
      
      if (diffDays < 0 && payment.status === 'PENDING') {
        // Paiement en retard
        if (diffDays === -2 || diffDays % 2 === 0) {
          console.log(`Relance: Paiement en retard de ${payment.user.firstName}`)
          // En production : envoyer email de relance
        }
      }
    })
  }

  const validatePayment = async (paymentId: string) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: paymentId,
          status: 'PAID'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Paiement validé avec succès')
        await fetchPayments()
        
        // Envoyer la quittance par email
        sendReceipt(paymentId)
        
        setShowValidationModal(false)
        setSelectedPayment(null)
      } else {
        toast.error('Erreur lors de la validation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la validation')
    }
  }

  const sendReceipt = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId)
    if (payment) {
      console.log(`Envoi de la quittance à ${payment.user.email}`)
      toast.success('Quittance envoyée par email')
    }
  }

  const sendReminder = (payment: Payment) => {
    console.log(`Envoi d'un rappel à ${payment.user.email}`)
    toast.success('Rappel envoyé')
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    paid: payments.filter(p => p.status === 'PAID').length,
    late: payments.filter(p => p.status === 'LATE').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    collectedAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gérez les paiements et envoyez les quittances
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchPayments}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setViewMode('payments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'payments'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Paiements
            </button>
            <button
              onClick={() => setViewMode('tenants')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'tenants'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Locataires
            </button>
          </div>

          {/* Filtres */}
          {viewMode === 'payments' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, référence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="PAID">Payés</option>
                <option value="LATE">En retard</option>
                <option value="CANCELLED">Annulés</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="ALL">Tous les types</option>
                <option value="RENT">Loyers</option>
                <option value="DEPOSIT">Cautions</option>
                <option value="CHARGES">Charges</option>
                <option value="FEES">Frais</option>
              </select>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <div className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-sm font-bold">{stats.total}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-600">En attente</p>
              <p className="text-sm font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-green-100 rounded-lg">
              <p className="text-xs text-green-600">Payés</p>
              <p className="text-sm font-bold text-green-700">{stats.paid}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-red-100 rounded-lg">
              <p className="text-xs text-red-600">En retard</p>
              <p className="text-sm font-bold text-red-700">{stats.late}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-600">Montant total</p>
              <p className="text-sm font-bold text-blue-700">{stats.totalAmount}€</p>
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-green-100 rounded-lg">
              <p className="text-xs text-green-600">Collecté</p>
              <p className="text-sm font-bold text-green-700">{stats.collectedAmount}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : viewMode === 'payments' ? (
          // Vue Paiements
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chambre
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
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => {
                    const status = statusConfig[payment.status]
                    const StatusIcon = status.icon
                    const daysUntilDue = getDaysUntilDue(payment.dueDate)
                    
                    // Mettre à jour le statut si en retard
                    if (daysUntilDue < 0 && payment.status === 'PENDING') {
                      payment.status = 'LATE'
                    }
                    
                    return (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.user.firstName} {payment.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.booking.room.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            N°{payment.booking.room.number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {typeLabels[payment.paymentType]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.amount}€
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                          {payment.status === 'PENDING' && (
                            <div className="text-xs text-gray-500">
                              {daysUntilDue > 0 ? `Dans ${daysUntilDue} jours` : 
                               daysUntilDue === 0 ? "Aujourd'hui" :
                               `Retard de ${Math.abs(daysUntilDue)} jours`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {payment.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedPayment(payment)
                                    setShowValidationModal(true)
                                  }}
                                  className="p-1 hover:bg-green-100 rounded transition-colors text-green-600"
                                  title="Valider le paiement"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => sendReminder(payment)}
                                  className="p-1 hover:bg-yellow-100 rounded transition-colors text-yellow-600"
                                  title="Envoyer un rappel"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              </>
                             )}
                            {payment.status === 'PAID' && (
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setShowReceiptModal(true)
                                }}
                                className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                title="Voir/Envoyer la quittance"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Vue Locataires
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun locataire actuel</h3>
                  <p className="text-gray-500">
                    Les locataires apparaîtront ici une fois qu'ils auront une réservation active.
                  </p>
                </div>
              </div>
            ) : (
              tenants.map((tenant) => (
                <div key={tenant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenant.firstName} {tenant.lastName}</h3>
                      <p className="text-sm text-gray-500">{tenant.room?.name || 'Chambre non assignée'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      tenant.status === 'LATE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tenant.status === 'ACTIVE' ? 'À jour' : tenant.status === 'LATE' ? 'En retard' : 'En attente'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Loyer mensuel</span>
                      <span className="font-medium">{tenant.room?.price || 0}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Jour de paiement</span>
                      <span className="font-medium">5 du mois</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total payé</span>
                      <span className="font-medium text-green-600">0€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total dû</span>
                      <span className="font-medium text-red-600">0€</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Switch to payments view with this tenant's payments
                        setViewMode('payments')
                        setSearchQuery(`${tenant.firstName} ${tenant.lastName}`)
                      }}
                      className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      Voir l'historique
                    </button>
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Envoyer un rappel"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de validation */}
      <AnimatePresence>
        {showValidationModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowValidationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Valider le paiement
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Locataire</p>
                  <p className="font-medium">
                    {selectedPayment.user.firstName} {selectedPayment.user.lastName}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Montant</p>
                  <p className="text-2xl font-bold">{selectedPayment.amount}€</p>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault()
                  validatePayment(selectedPayment.id)
                }}>

                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowValidationModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Valider et envoyer la quittance
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de quittance */}
      <AnimatePresence>
        {showReceiptModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowReceiptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Quittance de loyer
                </h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold">QUITTANCE DE LOYER</h4>
                  <p className="text-gray-600 mt-2">
                    Période : {new Date(selectedPayment.dueDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Bailleur</p>
                    <p className="font-medium">Maison Oscar</p>
                    <p className="text-sm">Bruz, 35170</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Locataire</p>
                    <p className="font-medium">
                      {selectedPayment.user.firstName} {selectedPayment.user.lastName}
                    </p>
                    <p className="text-sm">{selectedPayment.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Logement</p>
                    <p className="font-medium">
                      {selectedPayment.booking.room.name} - N°{selectedPayment.booking.room.number}
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span>Loyer</span>
                      <span className="font-medium">{selectedPayment.amount}€</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Je soussigné, Maison Oscar, reconnais avoir reçu de {selectedPayment.user.firstName} {selectedPayment.user.lastName}
                      la somme de <strong>{selectedPayment.amount}€</strong> au titre du loyer et des charges
                      pour la période indiquée ci-dessus.
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Fait à Bruz, le {new Date().toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-gray-600 mt-4">Signature :</p>
                    <p className="font-bold mt-2">Maison Oscar</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    sendReceipt(selectedPayment.id)
                    setShowReceiptModal(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Renvoyer par email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}