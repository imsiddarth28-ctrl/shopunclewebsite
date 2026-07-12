'use client'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Briefcase, DollarSign } from 'lucide-react'

const jobs = [
  { title: 'Senior wood craftsman', loc: 'Mumbai Workshop', type: 'Full-time', salary: '₹35,000 - ₹50,000 / mo', desc: 'Shape Oak, Birchwood, and Pine frames to perfect dimensions. Experience with precision saws is required.' },
  { title: 'Frontend React Engineer', loc: 'Remote / Mumbai Office', type: 'Full-time', salary: '₹8L - ₹15L / yr', desc: 'Optimize our 3D web rendering engine (Three.js/GSAP) and build user flows.' },
  { title: 'Customer Support Executive', loc: 'Mumbai Office', type: 'Full-time', salary: '₹20,000 - ₹30,000 / mo', desc: 'Resolve shipping delays, manage returns, and assist users with custom image resolution problems.' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">We Are Hiring</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Careers</h1>
        <p className="body-lg mb-12">Join our passionate team of craftsmen and creators in Mumbai.</p>

        <div className="space-y-6">
          {jobs.map((j, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{j.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{j.loc}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{j.type}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{j.salary}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{j.desc}</p>
                <div className="pt-2">
                  <a href={`mailto:careers@sreebalajiframes.com?subject=Application for ${encodeURIComponent(j.title)}`}>
                    <Button size="sm">Apply Now</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
