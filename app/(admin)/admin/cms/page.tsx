import type { Metadata } from 'next'
import CMSContent from './CMSContent'

export const metadata: Metadata = {
  title: 'Gestion du contenu - Admin',
  description: 'Gérer le contenu du site Maison Oscar'
}

export default function CMSPage() {
  return <CMSContent />
}