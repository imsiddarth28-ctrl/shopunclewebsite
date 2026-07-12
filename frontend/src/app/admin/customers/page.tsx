'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { Search, Users, ShoppingBag, DollarSign, Mail, Phone, Eye } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(search && { search }) })
      const res = await fetch(`/api/customers?${params}`)
      const data = await res.json()
      setCustomers(data.customers || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total.toLocaleString()} total customers
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetchCustomers() }} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: total.toLocaleString(), icon: Users, color: 'text-blue-500' },
          { label: 'Active this month', value: '—', icon: ShoppingBag, color: 'text-green-500' },
          { label: 'Avg. Order Value', value: '—', icon: DollarSign, color: 'text-purple-500' },
          { label: 'Repeat Customers', value: '—', icon: Users, color: 'text-orange-500' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading customers…</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 dark:border-gray-800">
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {customers.map(customer => (
                    <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(customer.name || customer.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{customer.name || '—'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                            <Mail className="w-3 h-3" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                              <Phone className="w-3 h-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={customer.orderCount > 0 ? 'success' : 'outline'}>
                          {customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {formatPrice(customer.totalSpent || 0)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {customer.createdAt ? formatDate(new Date(customer.createdAt)) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
