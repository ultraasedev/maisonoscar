/// Fichier : app/admin/login/page.tsx
// Page de connexion administrateur avec métadonnées

import type { Metadata } from 'next'
import LoginPageContent from './LoginPageContent'

export const metadata: Metadata = {
  title: 'Connexion Admin',
  description: 'Interface d\'administration Maison Oscar Co-living'
}

export default function AdminLoginPage() {
  return <LoginPageContent />
}