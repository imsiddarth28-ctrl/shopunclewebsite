'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { 
  Search, Eye, Truck, Package, 
  ChevronLeft, ChevronRight, Download,
  AlertCircle, CheckCircle, Clock, XCircle
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

export default function AdminOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    router.push(`/admin/orders?search=${search}&status=${statusFilter}&page=1`)
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
    router.push(`/admin/orders?search=${search}&status=${status}&page=1`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 pt-0">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search order number, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div>
                            <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                              {order.orderNumber}
                            </Link>
                            {order.orderType === 'PERSONALIZED' && (
                              <Badge variant="info" className="ml-2 text-xs">Custom</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {order.user?.name || 'Guest'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                          {order.items.map((i: any) => i.name).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {order.items.map((i: any) => i.customizationData?.selectedSize || i.size || 'Standard').join(', ')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant as BadgeProps['variant'] || 'default'}>
                            {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                          {order.items.map((i: any) => i.imageId || 'N/A').join(', ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="p-1.5">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}