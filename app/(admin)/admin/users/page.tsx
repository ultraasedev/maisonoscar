// Fichier : app/(admin)/admin/users/page.tsx
// Description : Page de gestion des utilisateurs du dashboard

'use client'

import dynamic from 'next/dynamic'

const UsersContent = dynamic(() => import('./UsersContent'), {
  ssr: false,
  loading: () => <div className="p-8">Chargement...</div>
})

export default function UsersPage() {
  return <UsersContent />
}