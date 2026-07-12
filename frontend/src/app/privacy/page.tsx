'use client'

import { Badge } from '@/components/ui/Badge'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Legal Documents</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="body-lg mb-12">Last Updated: January 1, 2024</p>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">1. Information We Collect</h2>
            <p>We collect personal information that you provide, including your name, shipping address, billing address, phone number, email address, payment details, and photos uploaded for print personalization.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">2. How We Use Your Photos</h2>
            <p>Your uploaded photos are securely stored in Cloudinary and linked only to your account. They are never publicly accessible, never used for AI training, and are used solely to generate your requested downloads and printed products.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">3. Sharing Your Information</h2>
            <p>We do not sell your personal data. We share your info only with essential service providers like shipping carriers (e.g. Delhivery, Bluedart) and payment gateways (e.g. Razorpay, Stripe) to process your orders.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">4. Data Safety</h2>
            <p>We employ standard SSL encryption across all transaction layers and protect databases with high security firewalls.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
