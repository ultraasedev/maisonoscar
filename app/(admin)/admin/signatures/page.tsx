import { Metadata } from 'next'
import AdminSignatureManager from '@/components/admin/AdminSignatureManager'

export const metadata: Metadata = {
  title: 'Gestion des signatures | Admin',
  description: 'Gérer les signatures administrateur pour les contrats'
}

export default function SignaturesPage() {
  return <AdminSignatureManager />
}