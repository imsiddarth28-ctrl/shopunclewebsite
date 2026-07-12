'use client'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Gift, Heart, Shield, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Company Profile</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">About Us</h1>
        <p className="body-lg mb-12">At SREE BALAJI FRAMES AND GIFTS, we turn your precious memories into high-quality personalized home decor.</p>

        {/* Story Intro */}
        <div className="space-y-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-12">
          <p>
            Founded in 2020, SREE BALAJI FRAMES AND GIFTS started as a small workshop in Hyderabad with a single mission: to create affordable, premium quality, customized gifts. We realized that while digital photos are everywhere, printing and framing them professionally was still a tedious, expensive process.
          </p>
          <p>
            By designing an intuitive 3D preview system, sourcing fine wood, and utilizing archival ink printing technology, we enabled customers to easily order framing solutions directly to their doorsteps. Today, we've delivered over 100,000 orders across India.
          </p>
        </div>

        {/* Pillars / Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { title: 'Crafted with Love', desc: 'Every wooden joint is aligned, and every photo is printed to precision in our local workshop.', icon: Heart, color: 'text-red-500' },
            { title: 'Premium Materials', desc: 'We only use fine oak, birchwood, shatterproof acrylic, and heavy weight matte paper.', icon: Award, color: 'text-yellow-500' },
            { title: '100% Satisfaction', desc: 'If your frame arrives damaged or printed incorrectly, we recreate and ship it free.', icon: Shield, color: 'text-green-500' },
            { title: 'Memorable Gifting', desc: 'Satin ribbon wrap options, message cards, and direct-to-recipient shipping.', icon: Gift, color: 'text-purple-500' },
          ].map((v, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <v.icon className={`w-5 h-5 ${v.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{v.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
