// Fichier : middleware.ts (à la racine du projet)
// Middleware de protection des routes admin (mis à jour pour le groupe de routes)

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.isAdmin === true
    const pathname = req.nextUrl.pathname

    // Debug
    console.log('🔒 Middleware:', { pathname, hasToken: !!token, isAdmin })

    // Si on accède à /admin/login et qu'on est déjà admin connecté, rediriger vers dashboard
    if (pathname === '/admin/login' && isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Si on accède à une route admin (sauf login) sans être admin, rediriger vers login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !isAdmin) {
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

        // Pour les autres routes admin, vérifier le token et le rôle admin
        if (pathname.startsWith('/admin')) {
          return !!token && token.isAdmin === true
        }

        // Autoriser toutes les autres routes
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}