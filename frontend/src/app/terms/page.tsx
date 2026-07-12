'use client'

import { Badge } from '@/components/ui/Badge'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Legal Documents</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="body-lg mb-12">Last Updated: January 1, 2024</p>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">1. Agreement to Terms</h2>
            <p>By accessing or purchasing from Sree Balaji Frames and Gifts, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">2. Custom Product Orders</h2>
            <p>Since personalized items are made to order using your images, we cannot cancel or modify orders after production has started. You are responsible for ensuring that uploaded images do not violate copyright laws.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">3. Payments & Fees</h2>
            <p>Payments must be made in full through our integrated gateways before shipment. Cash on Delivery is subject to verification checks.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">4. Delivery Times</h2>
            <p>All shipping estimates are approximate. Sree Balaji Frames and Gifts is not liable for third-party courier delays caused by customs, weather conditions, or local disruptions.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
