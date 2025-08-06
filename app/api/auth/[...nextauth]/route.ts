// Fichier : app/api/auth/[...nextauth]/route.ts
// Configuration NextAuth pour l'API

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }