'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DollarSign, Tag, Users, CheckCircle } from 'lucide-react'

export default function AffiliatePage() {
  const [joined, setJoined] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Partnership</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Affiliate Program</h1>
        <p className="body-lg mb-12">Partner with India's leading custom framing brand and earn commissions.</p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { title: '10% Commission', desc: 'Earn on every referral sale. Highest rates in home decor.', icon: DollarSign, color: 'text-green-500' },
            { title: '30-Day Cookie', desc: 'Get credited for any order within 30 days of the referral click.', icon: Tag, color: 'text-blue-500' },
            { title: 'Creator Tools', desc: 'Access product feed assets, custom links, and banners.', icon: Users, color: 'text-purple-500' },
          ].map((b, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                  <b.icon className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">{b.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Application Card */}
        <Card className="border-primary-200 dark:border-primary-800 ring-1 ring-primary-500/10">
          <CardContent className="p-8 text-center max-w-xl mx-auto space-y-6">
            {joined ? (
              <div className="space-y-3 py-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 animate-bounce" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Received</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Our affiliate team will review your social media/website profile and respond via email within 48 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ready to partner with us?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Whether you are a home decor blogger, photographer, interior designer, or influencer, you can apply to join our program.
                </p>
                <form onSubmit={e => { e.preventDefault(); setJoined(true) }} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Website / Instagram Profile</label>
                    <input
                      required
                      type="url"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <Button type="submit" className="w-full">Submit Partner Application</Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
