// Fichier : middleware.ts (à la racine du projet)
// Middleware de protection des routes admin et mode maintenance

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware pour le mode maintenance (non authentifié)
async function maintenanceMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Routes toujours accessibles même en maintenance
  const allowedPaths = [
    '/maintenance',
    '/api', // Toutes les API
    '/admin', // Routes admin
    '/_next', // Assets Next.js
    '/favicon.ico',
  ]
  
  // Vérifier si la route est autorisée
  const isAllowed = allowedPaths.some(path => pathname.startsWith(path))
  if (isAllowed) {
    return NextResponse.next()
  }
  
  // Vérifier le mode maintenance via l'API
  try {
    // Créer l'URL absolue pour l'API
    const baseUrl = request.nextUrl.origin
    const response = await fetch(`${baseUrl}/api/maintenance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data?.enabled) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }
  } catch (error) {
    // Ignorer les erreurs, permettre l'accès si l'API est inaccessible
    console.error('Maintenance check failed:', error)
  }
  
  return NextResponse.next()
}

// Middleware d'authentification pour les routes admin
const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isManager = token?.role === 'MANAGER'
    const hasAccess = isAdmin || isManager
    const pathname = req.nextUrl.pathname
    const mustChangePassword = token?.mustChangePassword

    // Debug
    console.log('🔒 Middleware:', { pathname, hasToken: !!token, role: token?.role, mustChangePassword })

    // Si on accède à /admin/login et qu'on est déjà connecté, rediriger
    if (pathname === '/admin/login' && hasAccess) {
      // Si mot de passe doit être changé, rediriger vers change-password
      if (mustChangePassword) {
        return NextResponse.redirect(new URL('/admin/change-password', req.url))
      }
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Si l'utilisateur doit changer son mot de passe
    if (hasAccess && mustChangePassword) {
      // Autoriser uniquement l'accès à la page de changement et aux API auth
      if (pathname === '/admin/change-password' || 
          pathname.startsWith('/api/auth/')) {
        return NextResponse.next()
      }
      // Rediriger vers la page de changement de mot de passe
      return NextResponse.redirect(new URL('/admin/change-password', req.url))
    }

    // Si l'utilisateur essaie d'accéder à la page de changement sans en avoir besoin
    if (pathname === '/admin/change-password' && !mustChangePassword) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Si on accède à une route admin (sauf login) sans être autorisé, rediriger vers login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !hasAccess) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Autoriser l'accès à la page de login
        if (pathname === '/admin/login') {
          return true
        }

        // Pour les autres routes admin, vérifier le token et le rôle (ADMIN ou MANAGER)
        if (pathname.startsWith('/admin')) {
          return !!token && (token.role === 'ADMIN' || token.role === 'MANAGER')
        }

        // Autoriser toutes les autres routes
        return true
      },
    },
  }
)

// Middleware principal qui combine maintenance et auth
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Pour les routes admin, utiliser le middleware d'auth
  if (pathname.startsWith('/admin')) {
    return (authMiddleware as any)(request)
  }
  
  // Pour les autres routes, vérifier le mode maintenance
  return maintenanceMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ]
}