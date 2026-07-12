'use client'

import { Badge } from '@/components/ui/Badge'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Legal Documents</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
        <p className="body-lg mb-12">Last Updated: January 1, 2024</p>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">1. What are Cookies?</h2>
            <p>Cookies are small text files stored on your computer or mobile device when you visit our website. They help us remember your sessions, cart items, and customizer selections.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">2. Essential Cookies</h2>
            <p>We use essential cookies to maintain user logins, manage items in the shopping cart, and ensure secure checkout flows. Without these cookies, the core features of the site will not work.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">3. Performance & Analytics</h2>
            <p>We utilize third-party cookies (such as Google Analytics) to track page visits and product popularity, allowing us to improve your overall shopping experience.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">4. Managing Cookies</h2>
            <p>You can block or disable cookies through your browser settings. However, doing so will prevent you from utilizing our customizer studio or placing orders.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
