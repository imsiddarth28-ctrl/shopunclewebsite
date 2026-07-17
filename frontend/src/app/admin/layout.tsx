'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  BarChart, LogOut, Menu, X, ChevronDown, Bell,
  Gift, User, AlertCircle,
} from 'lucide-react'

const navigation: { name: string; href: string; icon: any; badge?: string; color: string }[] = [
  { name: 'Dashboard',   href: '/admin',            icon: LayoutDashboard, color: 'text-indigo-500' },
  { name: 'Orders',      href: '/admin/orders',      icon: ShoppingCart,    color: 'text-amber-500',  badge: '' },
  { name: 'Products',    href: '/admin/products',    icon: Package,         color: 'text-emerald-500' },
  { name: 'Categories',  href: '/admin/categories',  icon: Gift,            color: 'text-pink-500'    },
  { name: 'Customers',   href: '/admin/customers',   icon: Users,           color: 'text-sky-500'     },
  { name: 'Analytics',   href: '/admin/analytics',   icon: BarChart,        color: 'text-violet-500'  },
  { name: 'Settings',    href: '/admin/settings',    icon: Settings,        color: 'text-gray-500'    },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center p-8 animate-bounce-in">
          <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5 animate-float">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have permission to access the admin panel.</p>
          <Link href="/">
            <Button variant="outline">← Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPage = navigation.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ─── Sidebar ─── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800',
        'transform transition-transform duration-300 ease-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:shadow-primary-500/50 group-hover:scale-105 transition-all duration-200">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sree Balaji</span>
              <span className="block text-base font-bold text-gray-900 dark:text-white">Admin Panel</span>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{ animationDelay: `${index * 40}ms` }}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-in-right',
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-primary-50/50 dark:from-primary-900/30 dark:to-primary-900/10 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-7 bg-primary-500 rounded-r-full" />
                )}
                <span className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/40'
                    : 'group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                )}>
                  <item.icon className={cn('w-4 h-4', isActive ? item.color : 'text-gray-500 dark:text-gray-400 group-hover:' + item.color)} />
                </span>
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0.5">{item.badge}</Badge>
                )}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section at bottom */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <Avatar
              src={session.user?.image ?? undefined}
              name={session.user?.name ?? undefined}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{session.user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email ?? ''}</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', userMenuOpen ? 'rotate-180' : '')} />
          </div>
          {userMenuOpen && (
            <div className="mt-1 space-y-0.5 animate-slide-up">
              <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User className="w-4 h-4" /> Profile
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 sm:px-6 lg:px-8
          bg-white/90 dark:bg-gray-950/90 backdrop-blur-md
          border-b border-gray-200 dark:border-gray-800
          shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50"
        >
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-2">
            <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Admin</span>
            {currentPage && (
              <>
                <span className="hidden sm:block text-gray-300 dark:text-gray-700">/</span>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">{currentPage.name}</h1>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notification bell */}
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
              <Bell className="w-5 h-5 group-hover:animate-bounce" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <Avatar
                  src={session.user?.image ?? undefined}
                  name={session.user?.name ?? undefined}
                  size="sm"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {session.user?.name?.split(' ')[0] ?? 'Admin'}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', userMenuOpen ? 'rotate-180' : '')} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.user?.name ?? 'Admin'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{session.user?.email ?? ''}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/admin/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}