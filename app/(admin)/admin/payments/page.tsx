'use client'

import { Suspense } from 'react'
import PaymentsContent from './PaymentsContent'
import { AdminLoadingScreen } from '@/components/admin/AdminLoadingScreen'

export default function PaymentsPage() {
  return (
    <Suspense fallback={<AdminLoadingScreen />}>
      <PaymentsContent />
    </Suspense>
  )
}