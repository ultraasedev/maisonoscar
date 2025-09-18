'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, User, Home, Euro, Clock, CheckCircle, 
  XCircle, AlertCircle, Search, Filter, Download,
  FileText, Mail, Phone, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Booking {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  room: {
    name: string
    price: number
  }
  startDate: string
  endDate: string | null
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID'
  contract?: {
    id: string
    signedAt?: string
  }
  createdAt: string
}

export default function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/bookings?${params}`)
      const data = await response.json()

      if (data.success) {
        setBookings(data.data || [])
      } else {
        toast.error('Erreur lors du chargement des réservations')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmée', className: 'bg-blue-100 text-blue-800' },
      ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Terminée', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? <Badge className={config.className}>{config.label}</Badge> : null
  }

  const getPaymentBadge = (status: string) => {
    const paymentConfig = {
      PENDING: { label: 'En attente', icon: Clock, className: 'text-yellow-600' },
      PARTIAL: { label: 'Partiel', icon: AlertCircle, className: 'text-orange-600' },
      PAID: { label: 'Payé', icon: CheckCircle, className: 'text-green-600' }
    }
    const config = paymentConfig[status as keyof typeof paymentConfig]
    const Icon = config?.icon || Clock
    return config ? (
      <div className={`flex items-center gap-1 ${config.className}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm">{config.label}</span>
      </div>
    ) : null
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (response.ok) {
        toast.success('Réservation annulée')
        fetchBookings()
      } else {
        toast.error('Erreur lors de l\'annulation')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const handleGenerateContract = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/contracts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contrat-${bookingId}.pdf`
        a.click()
        toast.success('Contrat généré')
      } else {
        toast.error('Erreur lors de la génération du contrat')
      }
    } catch (error) {
      toast.error('Erreur lors de la génération')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mes locations</h1>
          <p className="text-gray-600 mt-1">Gérer les réservations et contrats</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, chambre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBookings()}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
            <Button onClick={fetchBookings}>
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Home className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'ACTIVE').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus/mois</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'ACTIVE').reduce((sum, b) => sum + b.room.price, 0)}€
                </p>
              </div>
              <Euro className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des réservations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune réservation trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Locataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Chambre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{booking.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{booking.room.name}</p>
                          <p className="text-sm text-gray-600">{booking.room.price}€/mois</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p>{new Date(booking.startDate).toLocaleDateString('fr-FR')}</p>
                          <p className="text-gray-600">
                            {booking.endDate
                              ? `au ${new Date(booking.endDate).toLocaleDateString('fr-FR')}`
                              : `au ${new Date(new Date(booking.startDate).setMonth(new Date(booking.startDate).getMonth() + 12)).toLocaleDateString('fr-FR')} (12 mois)`
                            }
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentBadge(booking.paymentStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!booking.contract && booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateContract(booking.id)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          {booking.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}