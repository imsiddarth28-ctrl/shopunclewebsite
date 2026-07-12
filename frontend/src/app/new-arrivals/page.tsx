import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Sparkles } from 'lucide-react'

export const metadata = { title: 'New Arrivals' }

const newArrivals = [
  { name: 'Floating Shadow Box Frame', price: '₹2,499', isNew: true, img: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=400&auto=format&fit=crop', href: '/personalized/1' },
  { name: 'Rustic Reclaimed Wood Frame', price: '₹1,899', isNew: true, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop', href: '/personalized/1' },
  { name: 'Mini Keychain Photo Set', price: '₹499', isNew: true, img: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=400&auto=format&fit=crop', href: '/personalized/6' },
  { name: 'Wall Clock Custom Print', price: '₹1,199', isNew: true, img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400&auto=format&fit=crop', href: '/personalized/3' },
  { name: 'Velvet Photo Cushion XL', price: '₹1,099', isNew: false, img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=400&auto=format&fit=crop', href: '/personalized/4' },
  { name: 'Acrylic Block Print', price: '₹1,599', isNew: false, img: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=400&auto=format&fit=crop', href: '/personalized/2' },
]

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <Badge variant="info">Just Landed</Badge>
        </div>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">New Arrivals</h1>
        <p className="body-lg mb-12">Fresh additions to our collection — be the first to own them.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newArrivals.map((p) => (
            <Link key={p.name} href={p.href} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {p.isNew && (
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">NEW</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">{p.price}</span>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Customize →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
