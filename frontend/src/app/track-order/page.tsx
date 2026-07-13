'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import { 
  Package, Search, CheckCircle2, Clock, XCircle, 
  AlertCircle, MessageSquare, CreditCard, ChevronRight, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrackOrderPage() {
  const [activeTab, setActiveTab] = useState<'otp' | 'email'>('otp')
  
  // OTP Form States
  const [orderId, setOrderId] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  // Standard Mock Form States
  const [standardOrderId, setStandardOrderId] = useState('')
  const [standardEmail, setStandardEmail] = useState('')
  const [mockTracked, setMockTracked] = useState(false)

  const handleOtpTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim() || !otp.trim()) {
      toast.error('Please enter both Order ID and OTP.')
      return
    }

    setLoading(true)
    setOrderData(null)

    try {
      const res = await fetch(`/api/orders/status?orderId=${orderId.trim()}&otp=${otp.trim()}`)
      const data = await res.json()

      if (res.ok) {
        setOrderData(data)
        toast.success('Order status retrieved successfully!')
      } else {
        toast.error(data.error || 'Failed to find order. Check details and try again.')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while tracking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMockTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setMockTracked(true)
    toast.success('Mock tracking loaded.')
  }

  // Stepper steps configuration
  const getSteps = (status: string) => {
    const s = status.toLowerCase()
    
    // Status mappings
    // Enum: pending, confirmed, rejected, payment_pending, completed
    const steps = [
      { key: 'pending', label: 'Order Placed', desc: 'Awaiting shop confirmation', active: true },
      { key: 'confirmed', label: 'Confirmed', desc: 'Shop owner confirmed order', active: ['confirmed', 'payment_pending', 'completed'].includes(s) },
      { key: 'payment_pending', label: 'Payment Pending', desc: 'Payment is being processed', active: ['payment_pending', 'completed'].includes(s) },
      { key: 'completed', label: 'Delivered', desc: 'Order completed successfully', active: s === 'completed' }
    ]

    // If rejected, replace step 2 onwards
    if (s === 'rejected') {
      return [
        { key: 'pending', label: 'Order Placed', desc: 'Awaiting shop confirmation', active: true },
        { key: 'rejected', label: 'Rejected', desc: 'Order was rejected by shop owner', active: true, error: true }
      ]
    }

    return steps
  }

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case 'pending':
        return { color: 'warning', icon: Clock, label: 'Pending Confirmation' }
      case 'confirmed':
        return { color: 'info', icon: CheckCircle2, label: 'Confirmed' }
      case 'payment_pending':
        return { color: 'warning', icon: CreditCard, label: 'Payment Pending' }
      case 'completed':
        return { color: 'success', icon: CheckCircle2, label: 'Completed' }
      case 'rejected':
        return { color: 'destructive', icon: XCircle, label: 'Rejected' }
      default:
        return { color: 'default', icon: HelpCircle, label: status }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        
        {/* Header section */}
        <div className="text-center mb-10">
          <Badge variant="info" className="mb-3 px-3 py-1 text-xs">
            Real-Time Tracking
          </Badge>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Track Your Order
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto">
            Check the progress of your purchase, view invoices, and read shop updates.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="bg-gray-200/60 dark:bg-gray-900/60 p-1.5 rounded-2xl flex gap-1 mb-8 max-w-md mx-auto border dark:border-gray-800">
          <button
            onClick={() => { setActiveTab('otp'); setOrderData(null); }}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'otp'
                ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            Guest (WhatsApp OTP)
          </button>
          <button
            onClick={() => { setActiveTab('email'); setMockTracked(false); }}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'email'
                ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            Standard (Email)
          </button>
        </div>

        {/* Tab Content: OTP Tracking */}
        {activeTab === 'otp' && (
          <div className="space-y-8">
            <form onSubmit={handleOtpTrack} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 space-y-5 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Order ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-7F3K29"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Verification OTP</label>
                  <input
                    type="text"
                    placeholder="6-digit number"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm tracking-widest font-mono"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 transition-all" disabled={loading}>
                {loading ? 'Retrieving Status...' : 'Fetch Order Status'}
              </Button>
            </form>

            {/* Display Order Status Results */}
            {orderData && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-md space-y-6">
                
                {/* Header Information */}
                <div className="flex items-center justify-between pb-6 border-b dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Order Reference</p>
                    <h3 className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-0.5">{orderData.orderId}</h3>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const cfg = getStatusConfig(orderData.status)
                      return (
                        <Badge variant={cfg.color as any} className="flex items-center gap-1.5 px-3 py-1 font-semibold rounded-xl text-xs">
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>

                {/* Stepper progress */}
                <div className="py-2">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6">Delivery Progress</h4>
                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                    {getSteps(orderData.status).map((step, index) => {
                      const Icon = step.error ? XCircle : CheckCircle2
                      return (
                        <div key={step.key} className="flex gap-4 relative">
                          <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                            step.active 
                              ? step.error 
                                ? 'bg-red-500 border-red-500 text-white shadow-md' 
                                : 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400'
                          }`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold leading-tight ${step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Shop owner note */}
                {orderData.shopOwnerNote && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold uppercase">Shop Owner Note</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{orderData.shopOwnerNote}</p>
                    </div>
                  </div>
                )}

                {/* Items and Summary */}
                <div className="border-t dark:border-gray-800 pt-6">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Invoice Summary</h4>
                  <div className="divide-y dark:divide-gray-800 text-sm">
                    {orderData.items.map((item: any, i: number) => (
                      <div key={i} className="py-3.5 flex justify-between gap-4">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name} <span className="text-xs text-gray-400">× {item.quantity}</span></span>
                        <span className="font-bold text-gray-950 dark:text-white">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                    <div className="pt-4 flex justify-between font-extrabold text-base text-gray-950 dark:text-white">
                      <span>Total Paid/Payable</span>
                      <span>{formatPrice(orderData.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Standard Email Tracking Mockup */}
        {activeTab === 'email' && (
          <div className="space-y-8">
            <form onSubmit={handleMockTrack} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 space-y-5 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Order ID</label>
                <input
                  type="text"
                  placeholder="e.g. SU-123456"
                  value={standardOrderId}
                  onChange={e => setStandardOrderId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={standardEmail}
                  onChange={e => setStandardEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm"
                />
              </div>
              <Button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 transition-all">
                Search Order
              </Button>
            </form>

            {mockTracked && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-gray-800">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Standard Order ID</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">{standardOrderId || 'SU-123456'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {['Order Placed', 'Payment Confirmed', 'In Production', 'Dispatched'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${i <= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                      <span className={`text-sm ${i <= 2 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400'}`}>{step}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 pt-4 border-t dark:border-gray-800">
                  Estimated Delivery: 2–3 business days. A tracking link was sent to {standardEmail || 'your email'}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
