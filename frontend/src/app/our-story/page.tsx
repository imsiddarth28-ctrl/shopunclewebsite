'use client'

import { Badge } from '@/components/ui/Badge'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const milestones = [
  { year: '2020', title: 'The Garage Startup', desc: 'Started in a small workshop in Hyderabad with a passion for custom framing and craftsmanship.' },
  { year: '2021', title: '3D Live Customizer', desc: 'Launched our live preview customizer web app, allowing users to see wood textures in real-time.' },
  { year: '2022', title: 'Workshop Expansion', desc: 'Moved to our modern showroom and workshop in King Koti, Hyderabad, expanding our team of skilled craftsmen.' },
  { year: '2023', title: '100K Orders Delivered', desc: 'Crossed the milestone of 100,000 happy customers across India.' },
]

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Milestones</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Our Story</h1>
        <p className="body-lg mb-12">The journey of SREE BALAJI FRAMES AND GIFTS from a local Hyderabad custom framer to a premium gifting destination.</p>

        {/* Timeline */}
        <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 space-y-8 pb-8">
          {milestones.map((m, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className="relative pl-8">
              {/* Dot */}
              <span className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-primary-500 border-4 border-white dark:border-gray-950" />
              <div>
                <span className="text-sm font-bold text-primary-500 font-mono">{m.year}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mt-0.5">{m.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{m.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
