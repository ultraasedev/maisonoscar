// Fichier : lib/auth.ts
// Configuration NextAuth pour l'administration

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    isAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isAdmin: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        // Identifiants hardcodés pour le développement
        const adminEmail = 'admin@maisonoscar.fr'
        const adminPassword = 'admin123'

        if (credentials.email !== adminEmail || credentials.password !== adminPassword) {
          throw new Error('Identifiants incorrects')
        }

        try {
          // Rechercher l'utilisateur admin dans la base
          let user = await prisma.user.findUnique({
            where: { 
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true
            }
          })

          // Si l'admin n'existe pas, le créer
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                firstName: 'Admin',
                lastName: 'Maison Oscar',
                role: 'ADMIN',
                status: 'ACTIVE'
              },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true
              }
            })
          }

          // Vérifications
          if (user.role !== 'ADMIN') {
            throw new Error('Accès non autorisé - rôle insuffisant')
          }

          if (user.status !== 'ACTIVE') {
            throw new Error('Compte désactivé')
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            isAdmin: user.role === 'ADMIN'
          }

        } catch (dbError) {
          throw new Error('Erreur de connexion à la base de données')
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isAdmin = user.isAdmin
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isAdmin = token.isAdmin
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}/admin/dashboard`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/admin/dashboard`
    }
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  }
}

// Fonction utilitaire pour vérifier les permissions admin
export async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true }
  })

  if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
    throw new Error('Accès non autorisé')
  }

  return user
}