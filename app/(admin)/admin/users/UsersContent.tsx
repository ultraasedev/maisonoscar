'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserCheck,
  UserX,
  Shield,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

import { toast } from 'sonner'
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'ADMIN' | 'MANAGER'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
  _count?: {
    bookings: number
    contacts: number
    payments?: number
  }
}

// Composant Modal intégré
function UserModalIntegrated({ isOpen, onClose, user, onSuccess }: {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'MANAGER' as 'ADMIN' | 'MANAGER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED',
    password: '',
    sendEmail: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        password: '',
        sendEmail: false
      })
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'MANAGER',
        status: 'ACTIVE',
        password: '',
        sendEmail: true
      })
    }
    setErrors({})
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PATCH' : 'POST'

      const dataToSend = { ...formData }
      if (!dataToSend.phone) {
        delete (dataToSend as any).phone
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()
      
      console.log('📡 Réponse API:', data)

      if (data.success) {
        // Messages de succès détaillés
        if (user) {
          toast.success('✅ Utilisateur modifié avec succès')
        } else {
          if (data.emailSent) {
            toast.success('✅ Utilisateur créé avec succès! Email envoyé avec le mot de passe temporaire.')
          } else if (data.tempPassword) {
            // Si l'email n'a pas pu être envoyé, afficher le mot de passe
            toast.error(
              <div>
                <p className="font-bold mb-2">⚠️ Utilisateur créé mais l'email n'a pas pu être envoyé</p>
                <p className="text-sm">Mot de passe temporaire:</p>
                <code className="bg-black text-white px-2 py-1 rounded text-sm">{data.tempPassword}</code>
                <p className="text-xs mt-2">Notez ce mot de passe et transmettez-le à l'utilisateur</p>
              </div>,
              { duration: 10000 } // Afficher pendant 10 secondes
            )
          } else {
            toast.success(data.message || '✅ Utilisateur créé avec succès')
          }
        }
        onSuccess()
      } else {
        // Messages d'erreur détaillés
        console.error('❌ Erreur API:', data)
        
        if (data.error === 'Un utilisateur avec cet email existe déjà') {
          toast.error('❌ Cet email est déjà utilisé par un autre utilisateur')
        } else if (data.details && Array.isArray(data.details)) {
          // Erreurs de validation Zod
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            fieldErrors[detail.field] = detail.message
          })
          setErrors(fieldErrors)
          toast.error('❌ Veuillez corriger les erreurs dans le formulaire')
        } else {
          toast.error(data.error || '❌ Une erreur est survenue lors de la création')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone (optionnel)</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Rôle et Statut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MANAGER' })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="PENDING">En attente</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>
              </div>
            </div>

            {/* Option d'envoi d'email pour nouveau utilisateur */}
            {!user && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="sendEmail" className="text-sm">
                  Envoyer un email de bienvenue avec le mot de passe temporaire
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Chargement...' : (user ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      } else {
        toast.error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, statusFilter])



  // Changer le statut d'un utilisateur
  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Statut mis à jour avec succès')
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  // Fonction pour éditer un utilisateur
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  // Fonction pour supprimer un utilisateur
  const handleDelete = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Utilisateur supprimé avec succès')
        
        // Envoyer un email de notification si c'est un admin
        if (user.role === 'ADMIN') {
          await fetch('/api/users/notify-deletion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            })
          })
        }
        
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Actions bulk
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Aucun utilisateur sélectionné')
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_status',
          userIds: selectedUsers,
          status: action
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setSelectedUsers([])
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de l\'action')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'action')
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Admin', className: 'bg-purple-100 text-purple-800' },
      MANAGER: { label: 'Manager', className: 'bg-blue-100 text-blue-800' }
    }
    const config = roleConfig[role as keyof typeof roleConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Actif', className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Inactif', className: 'bg-gray-100 text-gray-800' },
      PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      SUSPENDED: { label: 'Suspendu', className: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gérer les accès au dashboard
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingUser(null)
            setModalOpen(true)
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres - Mobile first */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filtres en colonnes sur mobile, en ligne sur desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">Tous les rôles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="PENDING">En attente</option>
                <option value="SUSPENDED">Suspendu</option>
              </select>

              {/* Actions en masse - affiché même si aucune sélection avec message */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full relative"
                    disabled={selectedUsers.length === 0}
                  >
                    {selectedUsers.length > 0
                      ? `Actions (${selectedUsers.length} sélectionné${selectedUsers.length > 1 ? 's' : ''})`
                      : 'Actions (sélectionnez d\'abord)'
                    }
                  </Button>
                </DropdownMenuTrigger>
                {selectedUsers.length > 0 && (
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleBulkAction('ACTIVE')}
                      className="cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction('INACTIVE')}
                      className="cursor-pointer"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Désactiver
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction('SUSPENDED')}
                      className="cursor-pointer"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Suspendre
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {users.filter(u => u.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {users.filter(u => u.role === 'MANAGER').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs - Cards sur mobile, table sur desktop */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-0">
              {/* Vue mobile - Cards */}
              <div className="sm:hidden space-y-4 p-4">
                {users.map((user) => (
                  <Card key={user.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id])
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <p className="font-semibold">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user)
                                setModalOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              disabled={user.status === 'ACTIVE'}
                              className="cursor-pointer"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                              disabled={user.status === 'INACTIVE'}
                              className="cursor-pointer"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Désactiver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                              disabled={user.status === 'SUSPENDED'}
                              className="cursor-pointer"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          Créé le {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Vue desktop - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.id))
                            } else {
                              setSelectedUsers([])
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créé le
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id])
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center mt-1">
                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="relative">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingUser(user)
                                  setModalOpen(true)
                                }}
                                className="cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                disabled={user.status === 'ACTIVE'}
                                className="cursor-pointer"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                                disabled={user.status === 'INACTIVE'}
                                className="cursor-pointer"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Désactiver
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                                disabled={user.status === 'SUSPENDED'}
                                className="cursor-pointer"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Suspendre
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-red-600 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal intégré directement */}
      {modalOpen && <UserModalIntegrated 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
        user={editingUser}
        onSuccess={() => {
          setModalOpen(false)
          setEditingUser(null)
          fetchUsers()
        }}
      />}
    </div>
  )
}