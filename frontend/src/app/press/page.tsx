'use client'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Download, Calendar, ExternalLink } from 'lucide-react'

const releases = [
  { date: 'Oct 12, 2023', title: 'Sree Balaji launches Live 3D Customizer for Photo Canvas Prints', source: 'Tech Wire India', desc: 'Hyderabad\'s leading customization brand Sree Balaji today announced the release of its new WebGL-based customizer allowing customers to align photo dimensions before printing.' },
  { date: 'June 04, 2022', title: 'Sree Balaji opens state-of-the-art framing facility in King Koti Hyderabad', source: 'Hyderabad Times', desc: 'To keep up with demand, Sree Balaji has relocated printing and wood assembly lines into a new 15,000 sq ft facility.' },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Newsroom</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Press</h1>
        <p className="body-lg mb-12">Press releases, news highlights, and media resources.</p>

        {/* Media Kit Download */}
        <Card className="bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/30 mb-8">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Looking for our Media Kit?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Download high-res logo packages, product photos, and founder profiles.</p>
            </div>
            <a href="/media-kit.zip" download className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-colors">
                <Download className="w-4 h-4" />
                Download (12.4 MB)
              </button>
            </a>
          </CardContent>
        </Card>

        {/* Press Releases */}
        <div className="space-y-6">
          {releases.map((r, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar className="w-3.5 h-3.5" />{r.date}</span>
                  <Badge variant="success" className="text-[10px]">{r.source}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-snug">{r.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.desc}</p>
                <div className="pt-1">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline cursor-pointer">
                    Read Full Article <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
