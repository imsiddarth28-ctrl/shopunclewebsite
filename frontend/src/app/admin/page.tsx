'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, ShoppingCart, DollarSign, TrendingUp, 
  Package, AlertTriangle, Clock, Star, ArrowUpRight, ArrowDownRight,
  Gift, ShoppingBag, CreditCard, Truck, CheckCircle, Eye, Edit, Tag, Plus, Download, Loader2,
  Download as DownloadIcon, Plus as PlusIcon, ArrowUpRight as ArrowUpRightIcon, ArrowDownRight as ArrowDownRightIcon,
  Eye as EyeIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon, Star as StarIcon, Truck as TruckIcon,
  Package as PackageIcon, AlertTriangle as AlertTriangleIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const stats = [
  { 
    title: 'Total Orders', 
    value: '1,234', 
    change: '+12.5%', 
    trend: 'up',
    icon: ShoppingBag,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  { 
    title: 'Revenue', 
    value: '₹12.5L', 
    change: '+8.2%', 
    trend: 'up',
    icon: DollarSign,
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  { 
    title: 'Customers', 
    value: '5,678', 
    change: '+15.3%', 
    trend: 'up',
    icon: Users,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  { 
    title: 'Conversion Rate', 
    value: '3.24%', 
    change: '-0.5%', 
    trend: 'down',
    icon: TrendingUp,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
]

const recentOrders = [
  { id: 'ORD-A1B2C3', customer: 'Priya Sharma', items: 2, total: 3499, status: 'DELIVERED', date: '2024-01-15', payment: 'PAID' },
  { id: 'ORD-D4E5F6', customer: 'Rahul Patel', items: 1, total: 1899, status: 'SHIPPED', date: '2024-01-14', payment: 'PAID' },
  { id: 'ORD-G7H8I9', customer: 'Anita Desai', items: 3, total: 5299, status: 'PROCESSING', date: '2024-01-14', payment: 'PAID' },
  { id: 'ORD-J0K1L2', customer: 'Vikram Singh', items: 1, total: 2499, status: 'PENDING', date: '2024-01-13', payment: 'PENDING' },
  { id: 'ORD-M3N4O5', customer: 'Sneha Reddy', items: 2, total: 4199, status: 'CANCELLED', date: '2024-01-13', payment: 'REFUNDED' },
]

const statusConfig = {
  PENDING: { variant: 'warning', label: 'Pending', icon: Clock },
  CONFIRMED: { variant: 'info', label: 'Confirmed', icon: CheckCircle },
  PROCESSING: { variant: 'info', label: 'Processing', icon: Package },
  READY: { variant: 'success', label: 'Ready', icon: Package },
  SHIPPED: { variant: 'info', label: 'Shipped', icon: Truck },
  DELIVERED: { variant: 'success', label: 'Delivered', icon: CheckCircle },
  CANCELLED: { variant: 'destructive', label: 'Cancelled', icon: AlertTriangle },
  RETURNED: { variant: 'destructive', label: 'Returned', icon: Star },
}

const paymentConfig = {
  PAID: { variant: 'success', label: 'Paid' },
  PENDING: { variant: 'warning', label: 'Pending' },
  FAILED: { variant: 'destructive', label: 'Failed' },
  REFUNDED: { variant: 'info', label: 'Refunded' },
  PARTIALLY_REFUNDED: { variant: 'warning', label: 'Partial Refund' },
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading dashboard statistics...</p>
      </div>
    )
  }

  const stats = [
    { 
      title: 'Total Orders', 
      value: data?.overview?.totalOrders?.toLocaleString('en-IN') || '0', 
      change: '+12.5%', 
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    { 
      title: 'Revenue', 
      value: formatPrice(data?.overview?.totalRevenue || 0), 
      change: '+8.2%', 
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    { 
      title: 'Customers', 
      value: data?.overview?.totalCustomers?.toLocaleString('en-IN') || '0', 
      change: '+15.3%', 
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    { 
      title: 'Pending Orders', 
      value: data?.overview?.pendingOrders?.toLocaleString('en-IN') || '0', 
      change: '-0.5%', 
      trend: 'down',
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ]

  const recentOrdersList = data?.recentOrders || []
  const readyCount = data?.ordersByStatus?.find((s: any) => s.status === 'READY_FOR_SHIPMENT')?.count || 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900 dark:text-white">Dashboard</h1>
          <p className="body text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's an overview of your store performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="card-hover animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="heading-3 text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      'text-sm font-medium',
                      stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 inline" /> : <ArrowDownRight className="w-4 h-4 inline" />}
                      {stat.change} vs last month
                    </span>
                  </div>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color.replace('bg-', 'text-') }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenue Overview</span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Revenue Chart Placeholder</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Integrate with Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/products/new" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center">
                <Gift className="w-8 h-8 mx-auto text-primary-600 dark:text-primary-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Product</p>
              </Link>
              <Link href="/admin/customers" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center">
                <Users className="w-8 h-8 mx-auto text-primary-600 dark:text-primary-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Customers</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Items</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Payment</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrdersList.map((order: any) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig] || { variant: 'info', label: order.status, icon: Clock }
                  const payment = paymentConfig[order.paymentStatus as keyof typeof paymentConfig] || { variant: 'warning', label: order.paymentStatus }
                  const customerName = order.shippingAddress?.name || 'Guest'
                  const itemQuantity = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

                  return (
                    <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">{order.orderNumber}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-sm">
                            {customerName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{customerName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{itemQuantity} item{itemQuantity > 1 ? 's' : ''}</td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                      <td className="p-4">
                        <Badge variant={status.variant as BadgeProps['variant']}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={payment.variant as BadgeProps['variant']}>{payment.label}</Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order._id || order.id}`}>
                            <Button variant="ghost" size="sm" className="p-1.5" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/orders/${order._id || order.id}`}>
                            <Button variant="ghost" size="sm" className="p-1.5" title="Manage Status">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Pending Orders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data?.overview?.pendingOrders === 1 ? '1 order needs attention' : `${data?.overview?.pendingOrders || 0} orders need attention`}
                </p>
              </div>
            </div>
            <Link href="/admin/orders?status=PENDING">
              <Button variant="outline" className="mt-4 w-full" size="sm">View Pending</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Ready to Ship</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {readyCount === 1 ? '1 order awaiting pickup' : `${readyCount} orders awaiting pickup`}
                </p>
              </div>
            </div>
            <Link href="/admin/orders?status=READY_FOR_SHIPMENT">
              <Button variant="outline" className="mt-4 w-full" size="sm">Print Labels</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 fill-current" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">5 products below threshold</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full" size="sm">Restock Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}