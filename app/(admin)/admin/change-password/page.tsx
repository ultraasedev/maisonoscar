// Fichier : app/(admin)/admin/change-password/page.tsx
// Description : Page de changement de mot de passe obligatoire

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins une minuscule'
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins une majuscule'
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins un chiffre'
    } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins un caractère spécial'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('✅ Mot de passe modifié avec succès! Redirection...')
        
        // Mettre à jour la session pour indiquer que le mot de passe a été changé
        await update()
        
        // Petit délai pour laisser le temps au toast d'apparaître
        setTimeout(() => {
          // Forcer le rechargement complet pour rafraîchir la session
          window.location.href = '/admin/dashboard'
        }, 1500)
      } else {
        if (data.error === 'INVALID_CURRENT_PASSWORD') {
          setErrors({ currentPassword: 'Mot de passe actuel incorrect' })
        } else {
          toast.error(data.error || 'Erreur lors du changement de mot de passe')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Changement de mot de passe requis
          </CardTitle>
          <CardDescription className="text-center">
            Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire avant de continuer.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mot de passe actuel */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel (temporaire)</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder="Entrez votre mot de passe temporaire"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder="Créez un mot de passe fort"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
              
              {/* Indicateurs de force du mot de passe */}
              <div className="space-y-1 text-xs text-gray-600">
                <p className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                  ✓ Au moins 8 caractères
                </p>
                <p className={/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ Au moins une minuscule
                </p>
                <p className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ Au moins une majuscule
                </p>
                <p className={/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ Au moins un chiffre
                </p>
                <p className={/(?=.*[@$!%*?&])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ Au moins un caractère spécial (@$!%*?&)
                </p>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Bouton de soumission */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>Changement en cours...</>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Changer mon mot de passe
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}