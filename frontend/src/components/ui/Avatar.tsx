'use client'

import { forwardRef, ImgHTMLAttributes } from 'react'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
}

export const Avatar = forwardRef<HTMLImageElement | HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', shape = 'circle', ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-24 h-24 text-2xl',
    }

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-xl',
    }

    const fallbackColors = [
      'bg-primary-500',
      'bg-accent-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ]

    const getColor = (str: string) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return fallbackColors[Math.abs(hash) % fallbackColors.length]
    }

    if (src) {
      return (
        <img
          ref={ref as React.Ref<HTMLImageElement>}
          src={src}
          alt={alt || name || 'Avatar'}
          className={cn(sizes[size], shapes[shape], 'object-cover', className)}
          {...props}
        />
      )
    }

    const initials = name ? getInitials(name) : '?'
    const colorClass = name ? getColor(name) : 'bg-gray-400'

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(sizes[size], shapes[shape], colorClass, 'flex items-center justify-center text-white font-medium', className)}
        aria-label={alt || name || 'Avatar'}
        {...props}
      >
        {initials}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ className, max = 5, size = 'md', children, ...props }: AvatarGroupProps) {
  const childrenArray = Array.isArray(children) ? children : [children]
  const visibleChildren = childrenArray.slice(0, max)
  const remainingCount = childrenArray.length - max

  const overlaps = {
    xs: '-space-x-1',
    sm: '-space-x-1.5',
    md: '-space-x-2',
    lg: '-space-x-2.5',
    xl: '-space-x-3',
    '2xl': '-space-x-4',
  }

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  }

  return (
    <div className={cn('flex', overlaps[size], className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div key={index} className={cn('relative z-10', index === 0 ? '' : 'ring-2 ring-white dark:ring-gray-900')}>
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className={cn(
          'flex items-center justify-center border-2 border-white dark:border-gray-900',
          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium',
          sizeClasses[size],
          'rounded-full'
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}