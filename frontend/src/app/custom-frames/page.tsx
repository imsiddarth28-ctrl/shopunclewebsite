'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Load Frame Customizer Studio client-side only (uses browser APIs)
const FrameCustomizerStudio = dynamic(
  () => import('@/components/customizer/FrameCustomizerStudio').then((mod) => mod.FrameCustomizerStudio),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
        <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
          Loading Sree Balaji Framing Studio...
        </p>
      </div>
    )
  }
)

export default function CustomFramesPage() {
  return <FrameCustomizerStudio />
}
