'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'

const GiftPersonalizationStudio = dynamic(
  () => import('@/components/customizer/GiftPersonalizationStudio').then((mod) => mod.GiftPersonalizationStudio),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
        <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
          Loading Personalization Studio...
        </p>
      </div>
    )
  }
)

interface PageProps {
  params: { id: string }
}

export default function DynamicPersonalizationPage({ params }: PageProps) {
  const { id } = params

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-full mx-auto px-6 py-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
      <GiftPersonalizationStudio productId={id} />
    </div>
  )
}
