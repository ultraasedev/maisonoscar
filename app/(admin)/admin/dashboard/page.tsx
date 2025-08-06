import type { Metadata } from 'next'
import DashboardContent from './DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
  description: 'Tableau de bord administrateur Maison Oscar'
}

export default function DashboardPage() {
  return <DashboardContent />
}