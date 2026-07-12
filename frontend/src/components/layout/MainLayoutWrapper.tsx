'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { NotchNavbar } from './NotchNavbar'
import { Footer } from './Footer'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !isAdmin) {
      router.replace('/admin')
    }
  }, [session, status, isAdmin, router])

  // Prevent flash of user-facing storefront UI for admins
  if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !isAdmin) {
    return null
  }

  return (
    <>
      {!isAdmin && <NotchNavbar />}
      <main id="main-content" className={isAdmin ? 'min-h-screen' : 'pt-20 min-h-screen'}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}
