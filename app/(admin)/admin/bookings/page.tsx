'use client'

import dynamic from 'next/dynamic'

const BookingsContent = dynamic(() => import('./BookingsContent'), {
  ssr: false,
  loading: () => <div className="p-8">Chargement...</div>
})

export default function BookingsPage() {
  return <BookingsContent />
}