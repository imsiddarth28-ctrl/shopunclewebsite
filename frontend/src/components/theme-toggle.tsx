'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn('size-9 rounded-full bg-neutral-100 dark:bg-neutral-900/50', className)} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative size-9 rounded-full transition-all duration-300 active:scale-95 p-2 overflow-hidden',
        isDark ? 'bg-black text-white' : 'bg-white text-black',
        'ring-1 ring-foreground/10 hover:ring-foreground/20 shadow-sm hover:shadow-md',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-full h-full"
      >
        <clipPath id="shopuncle-theme-btn">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: 'easeInOut', duration: 0.4 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>

        <g clipPath="url(#shopuncle-theme-btn)">
          {/* The core circle — grows when dark (moon) */}
          <motion.circle
            initial={{ r: 8 }}
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: 'easeInOut', duration: 0.4 }}
            cx="16"
            cy="16"
          />

          {/* Sun rays — fade & shrink away in dark mode */}
          <motion.g
            initial={{ rotate: 0, scale: 1, opacity: 1 }}
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: 'easeInOut', duration: 0.4 }}
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ originX: '16px', originY: '16px' }}
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  )
}
