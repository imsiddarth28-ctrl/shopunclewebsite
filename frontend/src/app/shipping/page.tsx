import { Badge } from '@/components/ui/Badge'
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle } from 'lucide-react'

export const metadata = { title: 'Shipping Info' }

const zones = [
  { zone: 'Metro Cities', cities: 'Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad', days: '2–3 Business Days', cost: 'Free above ₹999 | ₹99 otherwise' },
  { zone: 'Tier 2 Cities', cities: 'Pune, Jaipur, Lucknow, Surat, Ahmedabad, Kochi', days: '3–5 Business Days', cost: 'Free above ₹999 | ₹99 otherwise' },
  { zone: 'Rest of India', cities: 'All other pin codes', days: '5–7 Business Days', cost: 'Free above ₹999 | ₹149 otherwise' },
  { zone: 'International', cities: 'USA, UK, Canada, UAE, Singapore, Australia', days: '10–15 Business Days', cost: 'Calculated at checkout' },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Delivery Info</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Shipping Information</h1>
        <p className="body-lg mb-12">We ship across India and to 20+ countries. Here's everything you need to know.</p>

        {/* Key highlights */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders above ₹999' },
            { icon: Clock, title: 'Production Time', desc: '1–2 business days to craft your order' },
            { icon: Package, title: 'Secure Packaging', desc: 'Bubble-wrapped & gift-ready' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* Zone table */}
        <h2 className="heading-3 text-gray-900 dark:text-white mb-6">Delivery Zones & Timelines</h2>
        <div className="space-y-4">
          {zones.map((z) => (
            <div key={z.zone} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{z.zone}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{z.cities}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{z.days}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{z.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">Personalized items are made-to-order and cannot be cancelled after production begins. Please double-check your design before placing the order.</p>
        </div>
      </div>
    </div>
  )
}
