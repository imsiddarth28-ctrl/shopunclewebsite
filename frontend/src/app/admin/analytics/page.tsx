'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import {
  TrendingUp, ShoppingBag, Users, DollarSign, Clock,
  Package, CheckCircle, Truck, XCircle, BarChart2, Star,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-400',
  CONFIRMED:  'bg-blue-400',
  PROCESSING: 'bg-indigo-400',
  SHIPPED:    'bg-cyan-400',
  DELIVERED:  'bg-green-500',
  CANCELLED:  'bg-red-400',
  RETURNED:   'bg-gray-400',
}

const STATUS_ICONS: Record<string, any> = {
  PENDING:    Clock,
  CONFIRMED:  CheckCircle,
  PROCESSING: Package,
  SHIPPED:    Truck,
  DELIVERED:  CheckCircle,
  CANCELLED:  XCircle,
  RETURNED:   XCircle,
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: 'width 0.8s ease' }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const overview = data?.overview || {}
  const maxStatusCount = Math.max(...(data?.ordersByStatus || []).map((s: any) => s.count), 1)
  const maxRevenue = Math.max(...(data?.revenueByMonth || []).map((m: any) => m.revenue), 1)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Live store performance from your database</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(overview.totalRevenue || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Total Orders', value: (overview.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Customers', value: (overview.totalCustomers || 0).toLocaleString(), icon: Users, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: 'Pending Orders', value: (overview.pendingOrders || 0).toString(), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        ].map(kpi => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Revenue – Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.revenueByMonth || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No revenue data yet</p>
            ) : (
              (data?.revenueByMonth || []).map((m: any) => (
                <div key={m.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{m.month}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(m.revenue)}</span>
                  </div>
                  <MiniBar value={m.revenue} max={maxRevenue} color="bg-primary-500" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="w-4 h-4 text-primary-500" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.ordersByStatus || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            ) : (
              (data?.ordersByStatus || []).map((s: any) => {
                const Icon = STATUS_ICONS[s.status] || Package
                const barColor = STATUS_COLORS[s.status] || 'bg-gray-400'
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                        <Icon className="w-3.5 h-3.5" />
                        {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{s.count}</span>
                    </div>
                    <MiniBar value={s.count} max={maxStatusCount} color={barColor} />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="w-4 h-4 text-primary-500" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(data?.topProducts || []).length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No sales data yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Units Sold</th>
                  <th className="px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.topProducts || []).map((p: any, i: number) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3">
                      <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-6 py-3">
                      <Badge variant="info">{p.totalSold} units</Badge>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">
                      {formatPrice(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="w-4 h-4 text-primary-500" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(data?.recentOrders || []).length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.recentOrders || []).map((o: any) => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-white">{o.orderNumber}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[o.status] || 'bg-gray-400'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
