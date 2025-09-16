'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'ADMIN' | 'MANAGER'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED'
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess: () => void
}

export default function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'MANAGER' as 'ADMIN' | 'MANAGER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED',
    password: ''
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
        password: ''
      })
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'MANAGER',
        status: 'ACTIVE',
        password: ''
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

    if (!user && !formData.password) {
      newErrors.password = 'Le mot de passe est requis pour un nouvel utilisateur'
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
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
      if (user && !dataToSend.password) {
        delete (dataToSend as any).password
      }
      if (!dataToSend.phone) {
        delete (dataToSend as any).phone
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(user ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès')
        onSuccess()
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            fieldErrors[detail.field] = detail.message
          })
          setErrors(fieldErrors)
        } else {
          toast.error(data.error || 'Une erreur est survenue')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prénom et Nom - En colonne sur mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Mot de passe */}
          {(!user || formData.password) && (
            <div className="space-y-2">
              <Label htmlFor="password">
                {user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-red-500' : ''}
                placeholder={user ? 'Laisser vide pour ne pas changer' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          )}

          {/* Rôle et Statut - En colonne sur mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MANAGER' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
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

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Chargement...' : (user ? 'Modifier' : 'Créer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}