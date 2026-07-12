import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { RotateCcw, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Returns & Refunds' }

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Policy</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Returns & Refunds</h1>
        <p className="body-lg mb-12">Your satisfaction is our top priority. Here's our simple, transparent policy.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-2xl p-6">
            <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Eligible for Return</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {['Damaged or defective products', 'Wrong item delivered', 'Print quality issues', 'Packaging damage'].map(i => (
                <li key={i} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{i}</li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6">
            <XCircle className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Not Eligible</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {['Change of mind on personalized items', 'Incorrect photo uploaded by customer', 'Items damaged after delivery', 'Used or washed items'].map(i => (
                <li key={i} className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />{i}</li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="heading-3 text-gray-900 dark:text-white mb-6">Return Process</h2>
        <div className="space-y-4 mb-12">
          {[
            { step: '01', title: 'Contact Us Within 7 Days', desc: 'Email support@sreebalajiframes.com with your order ID, photos of the issue, and a description.' },
            { step: '02', title: 'We Review Your Request', desc: 'Our team will assess within 24 hours and either approve the return or offer a reprint.' },
            { step: '03', title: 'Refund or Reprint', desc: 'Approved refunds are processed within 5–7 business days back to your original payment method.' },
          ].map((s) => (
            <div key={s.step} className="flex gap-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Have a return request?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
