import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserOrders } from '@/lib/models'
import { getObjectId, serializeDocs } from '@/lib/mongodb'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Package, Clock, CheckCircle, AlertTriangle, Truck } from 'lucide-react'

export const revalidate = 0 // Dynamic server rendering

const statusConfig = {
  PENDING: { variant: 'warning', label: 'Pending', icon: Clock },
  CONFIRMED: { variant: 'info', label: 'Confirmed', icon: CheckCircle },
  PROCESSING: { variant: 'info', label: 'Processing', icon: Package },
  READY_FOR_SHIPMENT: { variant: 'success', label: 'Ready', icon: Package },
  SHIPPED: { variant: 'info', label: 'Shipped', icon: Truck },
  DELIVERED: { variant: 'success', label: 'Delivered', icon: CheckCircle },
  CANCELLED: { variant: 'destructive', label: 'Cancelled', icon: AlertTriangle },
  RETURNED: { variant: 'destructive', label: 'Returned', icon: AlertTriangle },
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const userId = getObjectId(session.user.id)
  const { orders } = await getUserOrders(userId)
  const serializedOrders = serializeDocs<any>(orders)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-3 text-gray-900 dark:text-white">Order History</h2>
        <p className="body-sm text-gray-600 dark:text-gray-400 mt-1">
          View details and tracking status of your recent orders.
        </p>
      </div>

      {serializedOrders.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto">
          <CardContent>
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-4 mb-2">No Orders Yet</h3>
            <p className="body-sm mb-6">
              You haven't placed any orders with us yet. Start creating your custom gift today!
            </p>
            <Link href="/frames?filter=customizable">
              <Button>Start Customizing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {serializedOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || {
              variant: 'info',
              label: order.status,
              icon: Package
            }
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-sm text-gray-500 block">Order Number</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Date Placed</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Total Amount</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">{formatPrice(order.total)}</span>
                    </div>
                    <div>
                      <Badge variant={status.variant as any}>
                        <status.icon className="w-3.5 h-3.5 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Contains {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
