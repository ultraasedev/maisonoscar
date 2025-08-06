// Fichier : components/admin/AdminSidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Settings,
  X
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Chambres',
    href: '/admin/rooms',
    icon: Home
  },
  {
    name: 'Locataires & Prospect',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Réservations',
    href: '/admin/bookings',
    icon: Calendar
  },
  {
    name: 'Paiements',
    href: '/admin/payments',
    icon: CreditCard
  },
  {
    name: 'Messages',
    href: '/admin/contacts',
    icon: MessageSquare
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings
  }
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export const AdminSidebar = ({ mobileOpen, setMobileOpen }: AdminSidebarProps = {}) => {
  const pathname = usePathname()
  const { data: session } = useSession()

  const SidebarContent = () => (
    <div className="flex min-h-0 flex-1 flex-col bg-black">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center px-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-[#F5F3F0] rounded-xl flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-5 bg-black rounded-full rounded-b-none"></div>
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="text-lg font-bold text-white truncate">MAISON OSCAR</div>
            <div className="text-xs text-gray-400">Administration</div>
          </div>
        </div>
        {/* Close button mobile */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white ml-2"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen?.(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#F5F3F0] text-black shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-300'
              }`} />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="flex flex-shrink-0 p-4 border-t border-gray-800">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-8 h-8 bg-[#F5F3F0] rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4 text-black" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-50">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Only when mobileOpen is true */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setMobileOpen?.(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
