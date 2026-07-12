// @ts-nocheck
'use client'

import { useState } from 'react'
import { CATEGORIES, PremadeTemplate } from '@/lib/frame-presets'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface FrameGalleryProps {
  templates: PremadeTemplate[]
  selectedTemplate: PremadeTemplate | null
  onSelectTemplate: (template: PremadeTemplate) => void
}

export function FrameGallery({ templates, selectedTemplate, onSelectTemplate }: FrameGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Filter templates by category
  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === 'All') return true
    return t.category === selectedCategory
  })

  return (
    <div className="space-y-4">
      {/* Category Pills Scroller */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border',
              selectedCategory === cat
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Frame Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  'group p-1.5 rounded-xl border text-left overflow-hidden transition-all flex flex-col bg-white dark:bg-slate-900 shadow-sm',
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                )}
              >
                {/* Thumbnail Layer */}
                <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-slate-50 dark:bg-slate-800 mb-2">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                    ₹{template.price}
                  </div>
                </div>

                {/* Info Text */}
                <div className="px-1 space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight truncate">
                    {template.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {template.category}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="py-12 text-center border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            No templates found in this category.
          </p>
        </div>
      )}
    </div>
  )
}
