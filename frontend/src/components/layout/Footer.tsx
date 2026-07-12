'use client'

import Link from 'next/link'
import { Gift, Truck, Shield, Mail, Phone, MapPin, ArrowRight, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import SocialFlipButton from '@/components/ui/SocialFlipButton'

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/products' },
    { name: 'Photo Frames', href: '/frames' },
    { name: 'Personalized Gifts', href: '/personalized' },
    { name: 'Custom Frames', href: '/custom-frames' },
    { name: 'Bestsellers', href: '/bestsellers' },
    { name: 'New Arrivals', href: '/new-arrivals' },
  ],
  help: [
    { name: 'Track Order', href: '/track-order' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Size Guide', href: '/size-guide' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/our-story' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Affiliate Program', href: '/affiliate' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com', icon: '📷' },
  { name: 'Facebook', href: 'https://facebook.com', icon: '📘' },
  { name: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
  { name: 'Pinterest', href: 'https://pinterest.com', icon: '📌' },
  { name: 'YouTube', href: 'https://youtube.com', icon: '📺' },
]


export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6" aria-label="SREE BALAJI FRAMES AND GIFTS Home">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl leading-none font-bold text-gray-900 dark:text-white">SREE BALAJI FRAMES AND GIFTS</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
              Your trusted destination for premium photo frames and customizable gifts in Hyderabad. 
              Crafting memories with care since 2020.
            </p>
            <div className="-ml-4">
              <SocialFlipButton className="justify-start p-0" />
            </div>
          </div>

          <nav aria-label="Shop">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Help</h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <a href="https://maps.app.goo.gl/VFdEgLuxnMcJQR8r7" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  3-5, 167/A/1, opp. Shanthi Theatre, YMCA, King Koti, Narayanguda, Hyderabad, Telangana 500029
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="tel:8019822006" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">+91 80198 22006</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:support@sreebalajiframes.com" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">support@sreebalajiframes.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Newsletter</h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Email for newsletter"
                />
                <Button type="submit" className="px-4">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Subscribe for offers & updates</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} SREE BALAJI FRAMES AND GIFTS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              {footerLinks.legal.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Secure & Trusted</span>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <Truck className="w-5 h-5 text-blue-500" />
                <Headphones className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}