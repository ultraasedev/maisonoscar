'use client'

import { Suspense } from 'react'
import ProspectsContent from './ProspectsContent'
import { AdminLoadingScreen } from '@/components/admin/AdminLoadingScreen'

export default function ProspectsPage() {
  return (
    <Suspense fallback={<AdminLoadingScreen />}>
      <ProspectsContent />
    </Suspense>
  )
}