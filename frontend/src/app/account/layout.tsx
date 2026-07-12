import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { User, ShoppingBag, MapPin, Shield } from 'lucide-react'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/account')
  }

  const menuItems = [
    { name: 'My Profile', href: '/account', icon: User },
    { name: 'My Orders', href: '/account/orders', icon: ShoppingBag },
    { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  ]

  if (session.user.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Dashboard', href: '/admin', icon: Shield })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="heading-2 text-gray-900 dark:text-white mb-8">My Account</h1>
        
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="space-y-1">
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-white dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
