import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Star, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Bestsellers' }

const bestsellers = [
  { rank: 1, name: 'Classic Birchwood Photo Frame', price: '₹1,299', rating: 4.9, reviews: 2341, href: '/personalized/1', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop' },
  { rank: 2, name: 'Canvas Print - Large', price: '₹999', rating: 4.8, reviews: 1876, href: '/personalized/2', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop' },
  { rank: 3, name: 'Custom Photo Mug', price: '₹599', rating: 4.9, reviews: 4102, href: '/personalized/3', img: 'https://images.unsplash.com/photo-1544207240-8b1025eb7a6c?q=80&w=400&auto=format&fit=crop' },
  { rank: 4, name: 'Personalized Photo Book', price: '₹1,899', rating: 4.7, reviews: 892, href: '/personalized/5', img: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=400&auto=format&fit=crop' },
  { rank: 5, name: 'Acrylic Modern Frame', price: '₹1,799', rating: 4.8, reviews: 1203, href: '/personalized/2', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400&auto=format&fit=crop' },
  { rank: 6, name: 'Photo Cushion Cover', price: '₹849', rating: 4.6, reviews: 743, href: '/personalized/4', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop' },
]

export default function BestsellersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          <Badge variant="info">Most Popular</Badge>
        </div>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Bestsellers</h1>
        <p className="body-lg mb-12">Our most loved products, chosen by 50,000+ happy customers.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map((p) => (
            <Link key={p.rank} href={p.href} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shadow">#{p.rank}</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{p.name}</h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.rating}</span>
                  <span className="text-sm text-gray-400">({p.reviews.toLocaleString()} reviews)</span>
                </div>
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
