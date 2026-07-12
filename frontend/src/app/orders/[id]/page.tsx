'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  ArrowLeft, Clock, CheckCircle, Package, Truck, 
  XCircle, AlertCircle, Download, CreditCard, ShoppingBag, 
  Calendar, User, Mail, Phone, MapPin
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  const { data: session, status: authStatus } = useSession()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/orders/${id}`)
    }
  }, [authStatus, router, id])

  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchOrder()
    }
  }, [id, session])

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CardContent className="space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Not Found</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We couldn't retrieve the details for this order. It may have been deleted, or you might not have access permissions.
            </p>
            <Link href="/account/orders" className="block pt-2">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Double check ownership safety
  const isOwner = order.userId === session?.user?.id || order.userId?.toString() === session?.user?.id
  const isAdmin = session?.user?.role === 'ADMIN'
  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CardContent className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You are not authorized to view this order. Please log in with the correct account.
            </p>
            <Link href="/account/orders" className="block pt-2">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || {
    variant: 'info',
    label: order.status,
    icon: Package
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {isSuccess && (
          <div className="mb-8 p-6 rounded-3xl bg-green-500/10 border border-green-500/20 text-center space-y-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
              <CheckCircle className="w-6 h-6 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Placed Successfully!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Thank you for shopping with Sree Balaji Frames and Gifts. We have sent a confirmation email to {order.shippingAddress.email || session?.user?.email}.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <Link href="/account/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to My Orders
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex gap-2.5">
            <Badge variant={status.variant as any} className="py-1 px-3 text-sm">
              <status.icon className="w-4 h-4 mr-1.5" />
              {status.label}
            </Badge>
            <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} className="py-1 px-3 text-sm">
              <CreditCard className="w-4 h-4 mr-1.5" />
              {order.paymentStatus === 'PAID' ? 'Paid' : 'Payment Pending'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order Details Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-500" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100 dark:divide-gray-800 p-0">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      {item.previewImage && (
                        <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          <img src={item.previewImage} alt="Product Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.productId?.name || 'Frame Product'}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.size && `Size: ${item.size}`} {item.material && `| Material: ${item.material}`}
                        </p>
                        {item.customizationData?.imageId && (
                          <div className="mt-3">
                            <a
                              href={`/api/images/download/${item.customizationData.imageId}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Watermarked Image
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start gap-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping details */}
            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" /> {order.shippingAddress.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> {order.shippingAddress.phone}
                    </p>
                    {order.shippingAddress.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" /> {order.shippingAddress.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">Delivery Address</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing column */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (Included)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatPrice(order.total)}</span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Payment Method</span>
                    <span className="font-semibold uppercase">{order.paymentMethod}</span>
                  </div>
                  {order.paymentId && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Transaction ID</span>
                      <span className="font-mono">{order.paymentId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-50/50 dark:bg-primary-950/10 border-primary-100/50 dark:border-primary-900/20">
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help with your order? Our support team is here to assist you.
                </p>
                <Link href="/contact" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
