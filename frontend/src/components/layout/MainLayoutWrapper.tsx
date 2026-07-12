'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NotchNavbar } from './NotchNavbar'
import { Footer } from './Footer'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

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
