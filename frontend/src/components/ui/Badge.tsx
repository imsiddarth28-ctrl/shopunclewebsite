import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export function Badge({ className, variant = 'default', size = 'md', dot, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', variants[variant].replace('bg-', 'bg-').replace('text-', 'bg-'))} />}
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  CONFIRMED: { variant: 'info', label: 'Confirmed' },
  PROCESSING: { variant: 'info', label: 'Processing' },
  READY_FOR_SHIPMENT: { variant: 'success', label: 'Ready to Ship' },
  SHIPPED: { variant: 'info', label: 'Shipped' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  RETURNED: { variant: 'destructive', label: 'Returned' },
  PAID: { variant: 'success', label: 'Paid' },
  FAILED: { variant: 'destructive', label: 'Failed' },
  REFUNDED: { variant: 'info', label: 'Refunded' },
  PARTIALLY_REFUNDED: { variant: 'warning', label: 'Partial Refund' },
  DRAFT: { variant: 'default', label: 'Draft' },
  ACTIVE: { variant: 'success', label: 'Active' },
  INACTIVE: { variant: 'destructive', label: 'Inactive' },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default', label: status }
  return <Badge variant={config.variant} size={size}>{config.label}</Badge>
}