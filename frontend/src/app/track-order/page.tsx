'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Package, Search, CheckCircle } from 'lucide-react'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [searched, setSearched] = useState(false)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-xl px-4">
        <Badge variant="info" className="mb-4">Order Tracking</Badge>
        <h1 className="heading-2 text-gray-900 dark:text-white mb-3">Track Your Order</h1>
        <p className="body-lg mb-10">Enter your order ID and email to get real-time updates on your shipment.</p>

        <form onSubmit={handleTrack} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order ID</label>
            <input
              type="text"
              placeholder="e.g. SU-123456"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            <Search className="w-4 h-4 mr-2" /> Track Order
          </Button>
        </form>

        {searched && (
          <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-green-200 dark:border-green-900 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <p className="font-semibold text-gray-900 dark:text-white">Order Found: {orderId}</p>
            </div>
            <div className="space-y-3">
              {['Order Placed', 'Payment Confirmed', 'In Production', 'Dispatched'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i <= 2 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span className={`text-sm ${i <= 2 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>{step}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Estimated delivery: 2–3 business days</p>
          </div>
        )}
      </div>
    </div>
  )
}
