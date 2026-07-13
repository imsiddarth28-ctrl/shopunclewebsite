'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPrice } from '@/lib/utils'
import { 
  Search, LogOut, Key, ShieldCheck, CheckCircle2, 
  Clock, XCircle, CreditCard, MessageSquare, Phone, 
  ExternalLink, Filter, Calendar, FileText, LockOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShopOwnerAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authKey, setAuthKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Status update states (stored per orderId to allow editing multiple)
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({})
  const [statusInputs, setStatusInputs] = useState<{ [key: string]: string }>({})
  const [noteInputs, setNoteInputs] = useState<{ [key: string]: string }>({})
  const [submittingOrders, setSubmittingOrders] = useState<{ [key: string]: boolean }>({})

  // Load key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('shopOwnerKey')
    if (savedKey) {
      verifyAndLoad(savedKey)
    }
  }, [])

  const verifyAndLoad = async (key: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'x-shop-owner-key': key
        }
      })

      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
        setIsAuthenticated(true)
        localStorage.setItem('shopOwnerKey', key)
        toast.success('Successfully authenticated as shop owner!')
      } else {
        localStorage.removeItem('shopOwnerKey')
        toast.error('Authentication failed. Invalid key.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authKey.trim()) {
      toast.error('Please enter a secret key.')
      return
    }
    verifyAndLoad(authKey.trim())
  }

  const handleLogout = () => {
    localStorage.removeItem('shopOwnerKey')
    setIsAuthenticated(false)
    setOrders([])
    setAuthKey('')
    toast.success('Logged out successfully.')
  }

  const handleStatusUpdate = async (orderId: string) => {
    const otp = otpInputs[orderId]
    const status = statusInputs[orderId] || 'confirmed'
    const note = noteInputs[orderId] || ''

    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP from the customer.')
      return
    }

    setSubmittingOrders(prev => ({ ...prev, [orderId]: true }))

    try {
      const key = localStorage.getItem('shopOwnerKey') || ''
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-shop-owner-key': key
        },
        body: JSON.stringify({
          otp: otp.trim(),
          status,
          shopOwnerNote: note.trim()
        })
      })

      const result = await res.json()

      if (res.ok) {
        toast.success(`Order ${orderId} updated to ${status}!`)
        
        // Refresh orders list
        const refreshedRes = await fetch('/api/orders', {
          headers: { 'x-shop-owner-key': key }
        })
        const refreshedData = await refreshedRes.json()
        setOrders(refreshedData.orders || [])

        // Clear inputs for this order
        setOtpInputs(prev => {
          const updated = { ...prev }
          delete updated[orderId]
          return updated
        })
        setNoteInputs(prev => {
          const updated = { ...prev }
          delete updated[orderId]
          return updated
        })
      } else {
        toast.error(result.error || 'Failed to update order status.')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred during submission.')
    } finally {
      setSubmittingOrders(prev => ({ ...prev, [orderId]: false }))
    }
  }

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerPhone || order.user?.phone || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = 
      statusFilter === 'all' || 
      (order.status || '').toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'pending':
        return <Badge variant="warning" className="capitalize px-2.5 py-1 text-xs">pending</Badge>
      case 'confirmed':
        return <Badge variant="info" className="capitalize px-2.5 py-1 text-xs">confirmed</Badge>
      case 'payment_pending':
        return <Badge variant="warning" className="capitalize px-2.5 py-1 text-xs">payment_pending</Badge>
      case 'completed':
        return <Badge variant="success" className="capitalize px-2.5 py-1 text-xs">completed</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="capitalize px-2.5 py-1 text-xs">rejected</Badge>
      default:
        return <Badge variant="default" className="capitalize px-2.5 py-1 text-xs">{status}</Badge>
    }
  }

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full border dark:border-gray-800 shadow-xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-700 p-8 text-center text-white relative">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold">Shop Owner Portal</h2>
            <p className="text-primary-100 text-xs mt-1">Authenticate using your shared secret key</p>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter shop owner secret key"
                  value={authKey}
                  onChange={e => setAuthKey(e.target.value)}
                  className="py-3 px-4 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-950"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                disabled={loading}
                isLoading={loading}
              >
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
              <LockOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white">WhatsApp Orders Hub</h1>
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Authenticated via Shared Secret Key
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        {/* Dashboard Filters Card */}
        <Card className="rounded-2xl border dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-900">
          <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by order ID, name, or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-950 text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 mr-1" />
              {['all', 'pending', 'confirmed', 'payment_pending', 'completed', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-250 dark:hover:bg-gray-700/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="rounded-2xl border border-dashed dark:border-gray-800 p-12 text-center bg-white dark:bg-gray-900">
              <CardContent className="pt-6">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Orders Found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  There are no orders matching your search query or status filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map(order => {
              const orderId = order.orderId || order.orderNumber
              const customerName = order.customerName || order.user?.name || 'Guest Customer'
              const customerPhone = order.customerPhone || order.user?.phone || ''
              const items = order.items || []
              const status = (order.status || '').toLowerCase()
              const isPending = status === 'pending'
              const note = order.shopOwnerNote || ''

              return (
                <Card 
                  key={order._id || orderId} 
                  className={`rounded-2xl border shadow-sm overflow-hidden bg-white dark:bg-gray-900 transition-all hover:shadow-md ${
                    isPending 
                      ? 'border-yellow-200 dark:border-yellow-950/40 bg-yellow-50/5 dark:bg-yellow-950/5' 
                      : 'dark:border-gray-800'
                  }`}
                >
                  {/* Order Card Title Header */}
                  <div className="p-6 border-b dark:border-gray-800 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <span className="font-mono font-bold text-gray-950 dark:text-white text-lg">{orderId}</span>
                        {getStatusBadge(order.status)}
                        {!order.userId && (
                          <Badge variant="default" className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-xs px-2 py-0.5">
                            Guest Order
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(order.createdAt)}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {items.length} item{items.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Grand Total</p>
                      <p className="text-xl font-black text-gray-950 dark:text-white mt-0.5">{formatPrice(order.totalAmount || order.total)}</p>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Customer Contact & Delivery Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs text-gray-400 font-bold uppercase mb-2">Customer Details</h4>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-950 dark:text-white text-sm">{customerName}</p>
                          {customerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                              <a 
                                href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                {customerPhone} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {order.address && (
                        <div>
                          <h4 className="text-xs text-gray-400 font-bold uppercase mb-1">Delivery Address</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{order.address}</p>
                        </div>
                      )}
                      
                      {order.notes && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border dark:border-gray-800">
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Customer Note</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{order.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Order Items Invoice */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs text-gray-400 font-bold uppercase mb-2">Line Items</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-gray-950 dark:text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-400">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                            </div>
                            <span className="font-bold text-gray-950 dark:text-white text-right shrink-0">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Confirmation Update Form */}
                    <div className="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border dark:border-gray-800/40 space-y-4">
                      {isPending ? (
                        <>
                          <h4 className="text-xs text-yellow-800 dark:text-yellow-400 font-bold uppercase flex items-center gap-1.5 mb-2">
                            <Clock className="w-4 h-4 shrink-0 animate-pulse text-yellow-500" />
                            Confirm Order
                          </h4>
                          
                          <div className="space-y-3.5">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                WhatsApp Verification OTP <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                value={otpInputs[orderId] || ''}
                                onChange={e => setOtpInputs(prev => ({ ...prev, [orderId]: e.target.value }))}
                                className="py-2.5 px-3 rounded-lg border bg-white dark:bg-gray-950 font-mono text-sm tracking-wider"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
                                <select
                                  value={statusInputs[orderId] || 'confirmed'}
                                  onChange={e => setStatusInputs(prev => ({ ...prev, [orderId]: e.target.value }))}
                                  className="w-full text-xs font-semibold py-2.5 px-2.5 border rounded-lg bg-white dark:bg-gray-950 text-gray-950 dark:text-white focus:outline-none"
                                >
                                  <option value="confirmed">Confirmed</option>
                                  <option value="payment_pending">Payment Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Shop Note (Optional)</label>
                              <textarea
                                placeholder="e.g. Order approved, dispatching tomorrow."
                                value={noteInputs[orderId] || ''}
                                onChange={e => setNoteInputs(prev => ({ ...prev, [orderId]: e.target.value }))}
                                rows={2}
                                className="w-full p-2 text-xs rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                              />
                            </div>

                            <Button
                              onClick={() => handleStatusUpdate(orderId)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs rounded-lg flex items-center justify-center gap-1 shadow-md hover:shadow-emerald-500/10 transition-all"
                              disabled={submittingOrders[orderId]}
                              isLoading={submittingOrders[orderId]}
                            >
                              Verify & Confirm
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="text-xs text-gray-400 font-bold uppercase mb-2">Confirmation Detail</h4>
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Confirmed with OTP check
                              </p>
                              {note && (
                                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 rounded-xl flex gap-2">
                                  <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-500 uppercase">Shop Owner Note</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-normal mt-0.5">{note}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gray-100/50 dark:bg-gray-800/20 border border-gray-250/30 dark:border-gray-800 rounded-xl text-center">
                            <span className="text-[10px] text-gray-400 font-bold">UPDATED AT</span>
                            <p className="text-xs text-gray-900 dark:text-white font-semibold mt-0.5">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
