// Fichier : app/admin/layout.tsx
// Layout admin avec portal et scroll fonctionnel

'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { AdminLoadingScreen } from '@/components/admin/AdminLoadingScreen'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster } from 'sonner'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Masquer le contenu du layout parent quand on est en admin
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      // Masquer navigation et footer du layout parent
      const nav = document.querySelector('nav')
      const footer = document.querySelector('footer')
      
      if (nav) nav.style.display = 'none'
      if (footer) footer.style.display = 'none'
      
      // Cleanup au démontage
      return () => {
        if (nav) nav.style.display = ''
        if (footer) footer.style.display = ''
      }
    }
  }, [pathname])

  // Redirection si pas connecté
  useEffect(() => {
    if (pathname === '/admin/login') return
    
    if (status === 'loading') return

    if (!session?.user || !session.user.isAdmin) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router, pathname])

  // Page de login : rendu normal
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Loading
  if (status === 'loading' || !session?.user) {
    return <AdminLoadingScreen />
  }

  // ✅ Contenu admin avec scroll fonctionnel
  const adminContent = (
    <div className="min-h-screen bg-gray-50 w-full">
      <AdminTopBar />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            color: '#000000',
          },
        }}
      />
    </div>
  )

  // ✅ Utiliser un portal pour rendre dans un container dédié
  if (mounted && typeof window !== 'undefined') {
    // Créer ou récupérer un container admin dans le body
    let adminContainer = document.getElementById('admin-container')
    if (!adminContainer) {
      adminContainer = document.createElement('div')
      adminContainer.id = 'admin-container'
      adminContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        overflow-y: auto;
        background: #f9fafb;
      `
      document.body.appendChild(adminContainer)
    }
    
    return createPortal(adminContent, adminContainer)
  }

  return null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  )
}