'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  { q: 'How long does production take?', a: 'Most personalized items are produced within 1–2 business days. Standard ready-made frames ship the same day if ordered before 2 PM.' },
  { q: 'Can I preview my design before ordering?', a: 'Absolutely! Our 3D studio gives you a real-time preview from any angle before you place your order. No surprises.' },
  { q: 'What image resolution do I need?', a: 'We recommend a minimum of 300 DPI for best print quality. You\'ll see a quality warning in the editor if your image is too low resolution.' },
  { q: 'Can I change my order after placing it?', a: 'Changes can be requested within 1 hour of placing the order by contacting our support team. After production begins, modifications are not possible.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery (COD) for orders under ₹5,000.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to 20+ countries including USA, UK, UAE, Canada, Singapore, and Australia. Delivery takes 10–15 business days.' },
  { q: 'Is my photo stored or shared?', a: 'Your photos are stored securely on our servers only for the purpose of order fulfillment and are deleted after 90 days. We never share your data.' },
  { q: 'What if my order arrives damaged?', a: 'Email us at support@sreebalajiframes.com within 7 days with photos of the damage. We will reprint and ship a replacement at no charge.' },
  { q: 'Can I order in bulk for events?', a: 'Yes, we offer bulk discounts for weddings, corporate events, and gifting campaigns. Contact us for a custom quote.' },
  { q: 'How do I track my order?', a: 'You will receive a tracking link via email and SMS once your order is dispatched. You can also use our Track Order page.' },
]

export default function FAQsPage() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Help Center</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
        <p className="body-lg mb-12">Everything you need to know about SREE BALAJI FRAMES AND GIFTS.</p>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                {open === i
                  ? <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-12 text-center p-8 bg-primary-50 dark:bg-primary-950/20 rounded-2xl border border-primary-100 dark:border-primary-900/30">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Still have questions?</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Our support team is available Mon–Sat, 9 AM – 7 PM IST.</p>
          <a href="mailto:support@sreebalajiframes.com" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">support@sreebalajiframes.com</a>
        </div>
      </div>
    </div>
  )
}
