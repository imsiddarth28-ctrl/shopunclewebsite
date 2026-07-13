'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Clock, CheckCircle, Package, Truck, 
  XCircle, AlertCircle, ShieldAlert, Key, 
  ShieldCheck, ExternalLink, Calendar, User, Mail, Phone, MapPin
} from 'lucide-react'

const statusConfig = {
  PENDING: { variant: 'warning', label: 'Pending', icon: Clock },
  CONFIRMED: { variant: 'info', label: 'Confirmed', icon: CheckCircle },
  PROCESSING: { variant: 'info', label: 'Processing', icon: Package },
  READY: { variant: 'success', label: 'Ready', icon: Package },
  SHIPPED: { variant: 'info', label: 'Shipped', icon: Truck },
  DELIVERED: { variant: 'success', label: 'Delivered', icon: CheckCircle },
  CANCELLED: { variant: 'destructive', label: 'Cancelled', icon: XCircle },
  RETURNED: { variant: 'destructive', label: 'Returned', icon: AlertCircle },
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [requestingAccess, setRequestingAccess] = useState<string | null>(null) // imageId being requested
  const [secureImageUrl, setSecureImageUrl] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) {
        throw new Error('Failed to fetch order')
      }
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error(error)
      toast.error('Error fetching order details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true)
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        throw new Error('Failed to update status')
      }
      await fetchOrder()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleRequestImageAccess = async (imageId: string) => {
    try {
      setRequestingAccess(imageId)
      const res = await fetch('/api/images/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, imageId }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request image access')
      }

      setSecureImageUrl(data.viewUrl)
      setShowImageModal(true)
      fetchOrder() // Refresh access logs at the bottom
    } catch (error: any) {
      toast.error(error.message || 'Access request failed')
    } finally {
      setRequestingAccess(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Not Found</h3>
        <Link href="/admin/orders">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  const isFulfilled = ['SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)
  const isPaid = order.paymentStatus === 'PAID'
  const canAccessImages = session?.user?.role === 'ADMIN'

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Status Management:</span>
          <select 
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.keys(statusConfig).map((status) => (
              <option key={status} value={status}>{statusConfig[status as keyof typeof statusConfig].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{order.orderNumber}</h1>
            <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant as BadgeProps['variant'] || 'default'}>
              {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
            </Badge>
            <Badge variant={isPaid ? 'success' : 'destructive'}>
              Payment: {order.paymentStatus}
            </Badge>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Ordered on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
        </div>
      </div>

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Address Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.user?.name || 'Guest User'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{order.user?.email || 'No Email'}</span>
              </div>
              {order.user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{order.user.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              {order.shippingAddress ? (
                <>
                  <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="pt-2 text-xs text-gray-500">Phone: {order.shippingAddress.phone}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-900 dark:text-white">{order.customerName || 'Guest'}</p>
                  <p className="whitespace-pre-line">{order.address || 'No address provided'}</p>
                  {order.customerPhone && (
                    <p className="pt-2 text-xs text-gray-500">Phone: {order.customerPhone}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-800">
                {order.items.map((item: any, index: number) => {
                  const isCustom = !!item.imageId
                  return (
                    <div key={index} className="p-6 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">{item.name}</h4>
                          {isCustom && <Badge variant="info">Customized</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                        
                        {/* Customization Metadata */}
                        {isCustom && item.customizationData && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs space-y-1.5 border border-gray-100 dark:border-gray-800">
                            <p className="font-semibold text-gray-400">Customization Settings:</p>
                            <p className="text-gray-700 dark:text-gray-300">
                              Size: <span className="font-semibold">{item.customizationData.selectedSize || 'N/A'}</span>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              Material: <span className="font-semibold">{item.customizationData.selectedMaterial || 'Standard'}</span>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                              Image ID: <span className="font-bold text-primary-500">{item.imageId}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Image Access Buttons */}
                      <div className="flex flex-col justify-center items-start md:items-end gap-2">
                        {isCustom ? (
                          <>
                            {canAccessImages ? (
                              <Button
                                size="sm"
                                onClick={() => handleRequestImageAccess(item.imageId)}
                                disabled={requestingAccess === item.imageId}
                                className="flex items-center gap-1.5"
                              >
                                {requestingAccess === item.imageId ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                    Authenticating...
                                  </>
                                ) : (
                                  <>
                                    <Key className="w-4 h-4" />
                                    View Original Image
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 max-w-[280px]">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>
                                  {!isPaid 
                                    ? 'Access locked: Order is unpaid'
                                    : isFulfilled 
                                      ? 'Access expired: Order fulfilled'
                                      : 'Access denied: Requires Admin privileges'}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Standard Product (No Upload)</span>
                        )}
                        <p className="text-lg font-bold text-gray-900 dark:text-white pt-2">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs (Admin only) */}
          {session?.user?.role === 'ADMIN' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Image Access Logs (Audit Trail)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!order.logs || order.logs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No image access logs recorded for this order yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs text-gray-500 uppercase">
                          <th className="px-6 py-3 text-left">Timestamp</th>
                          <th className="px-6 py-3 text-left">Admin</th>
                          <th className="px-6 py-3 text-left">Action Reason</th>
                          <th className="px-6 py-3 text-left">Image ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                        {order.logs.map((log: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                              {formatDate(log.timestamp)}
                            </td>
                            <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">
                              {log.adminName}
                            </td>
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                              {log.reason}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">
                              {log.imageId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Secure Preview Modal */}
      {showImageModal && secureImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border dark:border-gray-800">
            {/* Modal Header */}
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Secure High-Res Preview (Expiring Link)
                </h3>
                <p className="text-xs text-red-500 font-semibold mt-0.5">⚠️ This temporary view URL expires in 5 minutes.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowImageModal(false)
                  setSecureImageUrl(null)
                }}
              >
                Close
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-950 flex items-center justify-center min-h-[400px]">
              <img 
                src={secureImageUrl} 
                alt="Secure Print Preview" 
                className="max-h-[60vh] object-contain shadow-lg rounded-xl border border-gray-800"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Accessed under security protocol. Actions logged.
              </span>
              <a 
                href={secureImageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1"
              >
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" /> Open in New Tab
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
