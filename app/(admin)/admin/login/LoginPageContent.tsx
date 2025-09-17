'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn, getSession, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Composant Loading Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] via-white to-[#F5F3F0] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}

// Composant pour les search params
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'
  const error = searchParams.get('error')

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Vérifier si déjà connecté
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) {
      router.push(callbackUrl)
    }
  }, [session, status, router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError('Email ou mot de passe incorrect')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Attendre un peu et récupérer la session
        await new Promise(resolve => setTimeout(resolve, 500))
        const session = await getSession()

        if (session?.user?.isAdmin) {
          // Redirection forcée
          window.location.replace(callbackUrl)
        } else {
          setLoginError('Accès non autorisé')
          setIsLoading(false)
        }
      } else {
        setLoginError('Erreur de connexion')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Erreur login:', error)
      setLoginError('Erreur de connexion')
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const errorMessages: Record<string, string> = {
    'CredentialsSignin': 'Email ou mot de passe incorrect',
    'AccessDenied': 'Accès non autorisé',
    'Default': 'Erreur de connexion'
  }

  const displayError = error ? 
    (errorMessages[error] || errorMessages['Default']) : 
    loginError

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] via-white to-[#F5F3F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
            <div className="w-8 h-10 bg-[#F5F3F0] rounded-full rounded-b-none"></div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre espace d'administration
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Erreur d'affichage */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">
                {displayError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin@maisonoscar.fr"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <Link 
                href="/auth/forgot-password"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Liens footer */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-gray-600 hover:text-black transition-colors text-sm"
            >
              ← Retour au site
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}

// Composant principal avec Suspense
export default function LoginPageContent() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginForm />
    </Suspense>
  )
}