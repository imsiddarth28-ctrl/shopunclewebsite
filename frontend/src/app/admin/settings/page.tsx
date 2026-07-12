'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Store, Bell, Shield, Truck, CreditCard, Mail,
  Save, Globe, Phone, MapPin, Clock, CheckCircle,
} from 'lucide-react'

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4 text-primary-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function Field({ label, value, type = 'text', hint }: { label: string; value: string; type?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Toggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => setOn(v => !v)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${on ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your store configuration</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Store Info */}
      <Section title="Store Information" icon={Store}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Name" value="Sree Balaji Frames & Gifts" />
          <Field label="Store Email" value="info@sreebalajiframes.com" type="email" />
          <Field label="Phone" value="+91 80198 22006" />
          <Field label="Website" value="https://sreebalajiframes.com" />
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Store Address</label>
            <textarea
              rows={2}
              defaultValue="3-5, 167/A/1, opp. Shanthi Theatre, near YMCA, Venkateshwara Colony, King Koti, Narayanguda, Hyderabad, Telangana 500029"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </Section>

      {/* Shipping */}
      <Section title="Shipping" icon={Truck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Free Shipping Threshold (₹)" value="999" hint="Orders above this value get free shipping" />
          <Field label="Default Shipping Cost (₹)" value="99" />
          <Field label="Estimated Delivery (days)" value="3-5" />
          <Field label="Express Delivery Cost (₹)" value="199" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Toggle label="Enable COD" description="Allow Cash on Delivery payment" defaultChecked={true} />
          <Toggle label="International Shipping" description="Ship orders outside India" defaultChecked={false} />
        </div>
      </Section>

      {/* Payments */}
      <Section title="Payments" icon={CreditCard}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Razorpay Key ID" value="rzp_live_..." hint="From your Razorpay dashboard" />
          <Field label="Razorpay Key Secret" value="••••••••••••" type="password" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Toggle label="UPI Payments" description="Accept UPI / PhonePe / GPay" defaultChecked={true} />
          <Toggle label="Net Banking" description="Accept net banking transfers" defaultChecked={true} />
          <Toggle label="EMI Options" description="Show EMI options at checkout" defaultChecked={false} />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Toggle label="Order Placed Email" description="Send confirmation email to customer on new order" defaultChecked={true} />
          <Toggle label="Order Shipped Email" description="Notify customer when order is shipped" defaultChecked={true} />
          <Toggle label="Low Stock Alerts" description="Alert admin when product stock drops below 5" defaultChecked={true} />
          <Toggle label="Review Notifications" description="Alert when a new product review is submitted" defaultChecked={false} />
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield}>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Toggle label="Require Email Verification" description="New accounts must verify email before ordering" defaultChecked={true} />
          <Toggle label="Two-Factor Authentication" description="Require 2FA for admin login" defaultChecked={false} />
          <Toggle label="Rate Limiting" description="Limit API requests per IP (recommended)" defaultChecked={true} />
        </div>
        <div className="pt-2">
          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30">
            Rotate API Keys
          </Button>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO & Metadata" icon={Globe}>
        <Field label="Meta Title" value="Sree Balaji Frames & Gifts — Personalized Photo Gifts & Custom Frames" />
        <Field label="Meta Description" value="Create custom photo frames, mugs, canvases and personalized gifts. Preview in 3D before ordering. Fast delivery across India." hint="Recommended: 150-160 characters" />
        <Field label="Google Analytics ID" value="G-XXXXXXXXXX" />
      </Section>

      {/* Save footer */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} size="lg" className="gap-2">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'All Changes Saved!' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
