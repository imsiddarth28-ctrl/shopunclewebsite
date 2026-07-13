'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, MapPin, CheckCircle, Clock } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="info" className="mb-4">Get In Touch</Badge>
        <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Contact Us</h1>
        <p className="body-lg mb-12">Have any questions? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Support Info</h3>
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Store & Workshop</p>
                  <a href="https://maps.app.goo.gl/VFdEgLuxnMcJQR8r7" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    3-5, 167/A/1, opp. Shanthi Theatre, near YMCA, Venkateshwara Colony, King Koti, Narayanguda, Hyderabad, Telangana 500029
                  </a>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Call / WhatsApp</p>
                  <a href="tel:8019822006" className="hover:underline">+91 80198 22006</a>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Address</p>
                  <a href="mailto:support@sreebalajiframes.com" className="hover:underline">support@sreebalajiframes.com</a>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Working Hours</p>
                  <p>Mon - Sat: 9 AM - 7 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Message Sent Successfully</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Our customer support team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. Priyesh Shah"
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
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      pattern="^[6-9]\d{9}$"
                      title="Please enter a valid 10-digit Indian phone number"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. Order Delivery Status"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Message</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Write your query details here..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
