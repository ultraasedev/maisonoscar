// Fichier : lib/auth.ts
// Configuration NextAuth pour l'administration

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isAdmin: boolean
      mustChangePassword?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    isAdmin: boolean
    mustChangePassword?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isAdmin: boolean
    mustChangePassword?: boolean
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

        try {
          // Rechercher l'utilisateur avec son auth
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true,
              auth: {
                select: {
                  hashedPassword: true,
                  mustChangePassword: true,
                  failedAttempts: true,
                  lockedUntil: true
                }
              }
            }
          })

          if (!user) {
            throw new Error('Identifiants incorrects')
          }

          // Vérifier si le compte est verrouillé
          if (user.auth?.lockedUntil && user.auth.lockedUntil > new Date()) {
            throw new Error('Compte temporairement verrouillé')
          }

          // Vérifications du statut
          if (user.status !== 'ACTIVE') {
            throw new Error('Compte désactivé')
          }

          // Vérifier le rôle (seulement ADMIN et MANAGER peuvent accéder au dashboard)
          if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            throw new Error('Accès non autorisé')
          }

          // Si pas d'auth, créer avec mot de passe par défaut (pour migration)
          if (!user.auth) {
            const defaultPassword = 'admin123'
            const hashedPassword = await bcrypt.hash(defaultPassword, 10)
            
            await prisma.auth.create({
              data: {
                userId: user.id,
                hashedPassword,
                mustChangePassword: true
              }
            })

            // Vérifier avec le mot de passe par défaut
            if (credentials.password !== defaultPassword) {
              throw new Error('Identifiants incorrects')
            }

            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              isAdmin: user.role === 'ADMIN',
              mustChangePassword: true
            }
          }

          // Vérifier le mot de passe
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.auth.hashedPassword
          )

          if (!isValidPassword) {
            // Incrémenter les tentatives échouées
            await prisma.auth.update({
              where: { userId: user.id },
              data: {
                failedAttempts: (user.auth.failedAttempts || 0) + 1,
                // Verrouiller après 5 tentatives pour 15 minutes
                lockedUntil: user.auth.failedAttempts >= 4 
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : null
              }
            })
            throw new Error('Identifiants incorrects')
          }

          // Réinitialiser les tentatives échouées et mettre à jour lastLogin
          await prisma.auth.update({
            where: { userId: user.id },
            data: {
              failedAttempts: 0,
              lockedUntil: null,
              lastLogin: new Date()
            }
          })

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            isAdmin: user.role === 'ADMIN',
            mustChangePassword: user.auth.mustChangePassword || false
          }

        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error('Erreur de connexion')
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Si c'est une nouvelle connexion
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isAdmin = user.isAdmin
        token.mustChangePassword = user.mustChangePassword
      }
      
      // Si c'est une mise à jour de session (après changement de mot de passe)
      if (trigger === 'update' && session) {
        // Récupérer l'état actuel depuis la DB
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { auth: true }
        })
        
        if (currentUser?.auth) {
          token.mustChangePassword = currentUser.auth.mustChangePassword
        }
      }
      
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.mustChangePassword = token.mustChangePassword as boolean
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