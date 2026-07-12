'use client'

import { Badge } from '@/components/ui/Badge'

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Legal Documents</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">GDPR Compliance</h1>
        <p className="body-lg mb-12">Last Updated: January 1, 2024</p>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">1. GDPR Principles</h2>
            <p>We comply fully with European GDPR standards to ensure data protection, transparency, and user consent for all visitors and customers residing in the EU.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">2. Your Rights</h2>
            <p>Under the GDPR, you have the right to access your personal data, request corrections, request erasure ("right to be forgotten"), and request restriction of data processing.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">3. Photo Data Erasure</h2>
            <p>If you wish to have your photos or account data permanently deleted before our standard 90-day automatic deletion window, contact our data compliance officer at support@sreebalajiframes.com.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">4. Consent</h2>
            <p>By creating an account and uploading photos to our 3D customizer, you give explicit consent to process your images for printing. You can withdraw consent at any time by requesting account deletion.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
