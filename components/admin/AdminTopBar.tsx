// Fichier : components/admin/AdminTopBar.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  Users, 
  ChevronDown, 
  LogOut,
  Bell
} from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'

const getPageTitle = (pathname: string): string => {
  if (pathname === '/admin/dashboard') return 'Dashboard'
  if (pathname.startsWith('/admin/rooms')) return 'Chambres'
  if (pathname.startsWith('/admin/users')) return 'Utilisateurs'
  if (pathname.startsWith('/admin/bookings')) return 'Réservations'
  if (pathname.startsWith('/admin/payments')) return 'Paiements'
  if (pathname.startsWith('/admin/contacts')) return 'Messages'
  if (pathname.startsWith('/admin/settings')) return 'Paramètres'
  return 'Administration'
}

export const AdminTopBar = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-md"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title */}
            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {getPageTitle(pathname)}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 sm:space-x-3 text-sm bg-white border border-gray-300 rounded-full px-2 sm:px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium text-gray-900 truncate max-w-32">
                    {session?.user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                    >
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session?.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AdminSidebar 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
      />
    </>
  )
}