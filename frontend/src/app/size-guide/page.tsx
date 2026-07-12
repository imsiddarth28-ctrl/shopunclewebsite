'use client'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Image as ImageIcon } from 'lucide-react'

const sizes = [
  { name: '4" x 6" (Mini)', dimensions: '10 x 15 cm', useCase: 'Desk frame, shelf displays, small gift accents.' },
  { name: '5" x 7" (Standard)', dimensions: '13 x 18 cm', useCase: 'Bedside tables, mantelpiece displays, standard portraits.' },
  { name: '8" x 10" (Medium)', dimensions: '20 x 25 cm', useCase: 'Family portraits, graduation photos, office desks.' },
  { name: 'A4 Size (Classic)', dimensions: '21 x 29.7 cm', useCase: 'Certificates, art prints, wall collage pieces.' },
  { name: '12" x 18" (Large)', dimensions: '30 x 45 cm', useCase: 'Wedding photo highlights, living room accent walls.' },
  { name: '16" x 24" (Gallery)', dimensions: '40 x 60 cm', useCase: 'Landscape photography, major wedding frames, gallery style.' },
]

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Visual Help</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Size Guide</h1>
        <p className="body-lg mb-12">Find the perfect dimensions for your custom photo frames and canvas prints.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sizes.map((s, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{s.dimensions}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.useCase}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Need a custom size?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-4">
            We build custom sized photo frames upon request for bulk orders or specialized gallery displays. Contact our custom sizing department for assistance.
          </p>
          <a href="mailto:support@sreebalajiframes.com" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Request Custom Size
          </a>
        </div>
      </div>
    </div>
  )
}
