'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, 
  BarChart, LogOut, Menu, X, ChevronDown, Bell, Search,
  Gift, TrendingUp, DollarSign, Clock, AlertCircle, User, Settings as SettingsIcon, LogOut as LogOutIcon
} from 'lucide-react'

const navigation: { name: string; href: string; icon: any; badge?: string }[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Gift },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

const quickStats = [
  { name: 'Total Revenue', value: '₹12,45,000', change: '+12.5%', trend: 'up', icon: DollarSign },
  { name: 'Total Orders', value: '1,234', change: '+8.2%', trend: 'up', icon: ShoppingCart },
  { name: 'New Customers', value: '89', change: '+15.3%', trend: 'up', icon: Users },
  { name: 'Pending Orders', value: '23', change: '-5.1%', trend: 'down', icon: Clock },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-gray-900 dark:text-white">Sree Balaji Admin</span>
            </Link>
            <button 
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === item.href
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto text-xs">{item.badge}</Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar 
                src={session.user?.image ?? undefined} 
                name={session.user?.name ?? undefined} 
                size="md" 
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user?.email}
                </p>
              </div>
              <button
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
                {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar 
                    src={session.user?.image ?? undefined} 
                    name={session.user?.name ?? undefined} 
                    size="sm" 
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {session.user?.name?.split(' ')[0] ?? 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name ?? 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email ?? ''}</p>
                      </div>
                      <Link href="/admin/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}