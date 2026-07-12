'use client'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

const posts = [
  { title: '5 Wall Art Layouts for Your Living Room', category: 'Home Decor', date: 'Jan 10, 2024', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop', excerpt: 'Learn how to group frame sizes, match wood finishes, and style standard portraits to create beautiful layouts.' },
  { title: 'The Ultimate Guide to Gifting Personalized Items', category: 'Gifting Ideas', date: 'Dec 18, 2023', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop', excerpt: 'Which gift fits which occasion? A guide to selecting acrylic prints, wooden engravings, or standard gallery-matted frames.' },
  { title: 'How to Choose the Right Image Resolution for Canvas Printing', category: 'Photography', date: 'Nov 02, 2023', img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e60d?q=80&w=400&auto=format&fit=crop', excerpt: 'Avoid pixelation! Understand DPI, aspect ratios, and smart resolution checks before ordering custom frames.' },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">SREE BALAJI FRAMES AND GIFTS Blog</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Latest Articles</h1>
        <p className="body-lg mb-12">Expert guides on home decor, custom printing, and photography.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
              {/* Image */}
              <div className="h-44 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as any).style.display = 'none' }}
                />
              </div>
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500">{p.category}</span>
                    <span className="text-xs text-gray-400 font-mono">{p.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug hover:text-primary-500 transition-colors cursor-pointer">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-3">{p.excerpt}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 mt-4">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">Read Article &rarr;</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
