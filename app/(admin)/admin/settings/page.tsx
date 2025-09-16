import type { Metadata } from 'next'
import SettingsContent from './SettingsContent'

export const metadata: Metadata = {
  title: 'Paramètres - Admin',
  description: 'Paramètres de l\'application Maison Oscar'
}

export default function SettingsPage() {
  return <SettingsContent />
}