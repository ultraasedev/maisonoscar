'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, Mail, Phone, User, Calendar,
  Inbox, Send, Archive, Trash2, Star, Search,
  Filter, CheckCircle, Clock, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  type: 'QUESTION' | 'VISIT_REQUEST' | 'COMPLAINT' | 'OTHER'
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  respondedAt?: string
  response?: string
}

export default function ContactsContent() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [responseText, setResponseText] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [statusFilter, typeFilter])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/contact?${params}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.data || [])
      } else {
        toast.error('Erreur lors du chargement des messages')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Statut mis à jour')
        fetchContacts()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleSendResponse = async () => {
    if (!selectedContact || !responseText) return

    try {
      const response = await fetch(`/api/contact/${selectedContact.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      })

      if (response.ok) {
        toast.success('Réponse envoyée')
        setResponseText('')
        setSelectedContact(null)
        fetchContacts()
      } else {
        toast.error('Erreur lors de l\'envoi')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return

    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Message supprimé')
        fetchContacts()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      QUESTION: { label: 'Question', className: 'bg-blue-100 text-blue-800' },
      VISIT_REQUEST: { label: 'Visite', className: 'bg-purple-100 text-purple-800' },
      COMPLAINT: { label: 'Réclamation', className: 'bg-red-100 text-red-800' },
      OTHER: { label: 'Autre', className: 'bg-gray-100 text-gray-800' }
    }
    const config = typeConfig[type as keyof typeof typeConfig]
    return config ? <Badge className={config.className}>{config.label}</Badge> : null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Archive className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-4 border-l-red-500'
      case 'MEDIUM':
        return 'border-l-4 border-l-yellow-500'
      default:
        return 'border-l-4 border-l-gray-300'
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
          <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
          <p className="text-gray-600 mt-1">Gérer les demandes de contact</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">Tous les statuts</option>
              <option value="NEW">Nouveau</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolu</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">Tous les types</option>
              <option value="QUESTION">Question</option>
              <option value="VISIT_REQUEST">Demande de visite</option>
              <option value="COMPLAINT">Réclamation</option>
              <option value="OTHER">Autre</option>
            </select>
            <Button onClick={fetchContacts}>
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
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nouveaux</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contacts.filter(c => c.status === 'NEW').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contacts.filter(c => c.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Résolus</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.status === 'RESOLVED').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun message trouvé
            </div>
          ) : (
            <div className="divide-y">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 hover:bg-gray-50 ${getPriorityColor(contact.priority)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(contact.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {contact.firstName} {contact.lastName}
                            </h3>
                            {getTypeBadge(contact.type)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{contact.subject}</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="NEW">Nouveau</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="RESOLVED">Résolu</option>
                        <option value="ARCHIVED">Archivé</option>
                      </select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContact(contact)
                          setResponseText('')
                        }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Répondre à {selectedContact.firstName} {selectedContact.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Message original:</p>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedContact.message}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Votre réponse</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Tapez votre réponse..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedContact(null)
                      setResponseText('')
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSendResponse}>
                    Envoyer la réponse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}