'use client'

import { useRef, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import './GooeyNav.css'

export interface GooeyNavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

interface GooeyNavProps {
  items: GooeyNavItem[]
  animationTime?: number
  particleCount?: number
  particleDistances?: [number, number]
  particleR?: number
  timeVariance?: number
  colors?: number[]
  className?: string
}

export default function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  className = '',
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const navRef      = useRef<HTMLUListElement>(null)
  const filterRef   = useRef<HTMLSpanElement>(null)
  const textRef     = useRef<HTMLSpanElement>(null)

  const pathname = usePathname()
  const router   = useRouter()

  // Resolve active index from current route
  const resolveActive = () => {
    const exact = items.findIndex(i => i.href === pathname)
    if (exact >= 0) return exact
    // partial match (e.g. /frames/123 → /frames)
    const partial = items.findIndex(i => i.href !== '/' && pathname.startsWith(i.href))
    return partial >= 0 ? partial : 0
  }

  const [activeIndex, setActiveIndex] = useState(resolveActive)

  // Keep in sync when Next.js navigates
  useEffect(() => {
    setActiveIndex(resolveActive())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Particle helpers ──────────────────────────────────────

  const noise = (n = 1) => n / 2 - Math.random() * n

  const getXY = (distance: number, pointIndex: number, total: number): [number, number] => {
    const angle = ((360 + noise(8)) / total) * pointIndex * (Math.PI / 180)
    return [distance * Math.cos(angle), distance * Math.sin(angle)]
  }

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10)
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end:   getXY(d[1] + noise(7), particleCount - i, particleCount),
      time:  t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0
        ? (rotate + r / 20) * 10
        : (rotate - r / 20) * 10,
    }
  }

  const makeParticles = (element: HTMLSpanElement) => {
    const d  = particleDistances
    const r  = particleR
    const bubbleTime = animationTime * 2 + timeVariance
    element.style.setProperty('--time', `${bubbleTime}ms`)

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2)
      const p = createParticle(i, t, d, r)
      element.classList.remove('active')

      setTimeout(() => {
        const particle = document.createElement('span')
        const point    = document.createElement('span')
        particle.classList.add('particle')
        particle.style.setProperty('--start-x', `${p.start[0]}px`)
        particle.style.setProperty('--start-y', `${p.start[1]}px`)
        particle.style.setProperty('--end-x',   `${p.end[0]}px`)
        particle.style.setProperty('--end-y',   `${p.end[1]}px`)
        particle.style.setProperty('--time',    `${p.time}ms`)
        particle.style.setProperty('--scale',   `${p.scale}`)
        particle.style.setProperty('--color',   `var(--color-${p.color}, white)`)
        particle.style.setProperty('--rotate',  `${p.rotate}deg`)
        point.classList.add('point')
        particle.appendChild(point)
        element.appendChild(particle)
        requestAnimationFrame(() => element.classList.add('active'))
        setTimeout(() => {
          try { element.removeChild(particle) } catch { /* already removed */ }
        }, t)
      }, 30)
    }
  }

  // ── Position the effect overlays ──────────────────────────

  const updateEffectPosition = (liEl: HTMLLIElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const pos           = liEl.getBoundingClientRect()
    const styles = {
      left:   `${pos.x - containerRect.x}px`,
      top:    `${pos.y - containerRect.y}px`,
      width:  `${pos.width}px`,
      height: `${pos.height}px`,
    }
    Object.assign(filterRef.current.style, styles)
    Object.assign(textRef.current.style,   styles)
    // Mirror the label (icon excluded from text layer)
    textRef.current.innerText = items[activeIndex]?.label ?? ''
  }

  // ── Click handler ─────────────────────────────────────────

  const handleClick = (e: React.MouseEvent<HTMLLIElement>, index: number) => {
    if (activeIndex === index) return
    setActiveIndex(index)

    const liEl = e.currentTarget
    updateEffectPosition(liEl)

    // Clear old particles
    filterRef.current?.querySelectorAll('.particle').forEach(p => p.remove())

    // Reset text animation
    if (textRef.current) {
      textRef.current.classList.remove('active')
      void textRef.current.offsetWidth          // reflow
      textRef.current.classList.add('active')
    }

    if (filterRef.current) makeParticles(filterRef.current)

    // Navigate
    router.push(items[index].href)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const liEl = e.currentTarget.parentElement as HTMLLIElement | null
      if (liEl) handleClick({ currentTarget: liEl } as React.MouseEvent<HTMLLIElement>, index)
    }
  }

  // ── Sync position on mount / resize / activeIndex change ──

  useEffect(() => {
    const syncPosition = () => {
      const liEls = navRef.current?.querySelectorAll('li')
      const liEl  = liEls?.[activeIndex] as HTMLLIElement | undefined
      if (liEl) {
        updateEffectPosition(liEl)
        textRef.current?.classList.add('active')
      }
    }

    syncPosition()

    const observer = new ResizeObserver(syncPosition)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])

  return (
    <div className={`gooey-nav-container ${className}`} ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={item.href}
              className={activeIndex === index ? 'active' : ''}
              onClick={(e) => handleClick(e, index)}
            >
              <a
                href={item.href}
                onClick={(e) => e.preventDefault()}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-current={activeIndex === index ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="gooey-nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Gooey filter layer (creates the blob animation) */}
      <span className="effect filter" ref={filterRef} />

      {/* Active text overlay (sits above the blob, always readable) */}
      <span className="effect text" ref={textRef} />
    </div>
  )
}
