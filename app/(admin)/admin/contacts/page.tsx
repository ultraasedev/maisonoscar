'use client'

import dynamic from 'next/dynamic'

const ContactsContent = dynamic(() => import('./ContactsContent'), {
  ssr: false,
  loading: () => <div className="p-8">Chargement...</div>
})

export default function ContactsPage() {
  return <ContactsContent />
}