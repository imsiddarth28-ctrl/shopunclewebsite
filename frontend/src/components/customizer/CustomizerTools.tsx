// @ts-nocheck
'use client'

import { useState } from 'react'
import { Upload, RotateCw, RefreshCw, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CustomizerToolsProps {
  userPhoto: string | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onZoom: (factor: number) => void
  onRotate: (angle: number) => void
  onFlipX: () => void
  onFlipY: () => void
  onReset: () => void
  selectedSize: string
  setSelectedSize: (size: string) => void
  availableSizes: string[]
  fitMode: 'fit' | 'fill'
  setFitMode: (mode: 'fit' | 'fill') => void
}

export function CustomizerTools({
  userPhoto,
  onUpload,
  onZoom,
  onRotate,
  onFlipX,
  onFlipY,
  onReset,
  selectedSize,
  setSelectedSize,
  availableSizes,
  fitMode,
  setFitMode
}: CustomizerToolsProps) {
  const [rotateVal, setRotateVal] = useState(0)

  const handleRotationSlider = (val: number) => {
    const delta = val - rotateVal
    setRotateVal(val)
    onRotate(delta * (Math.PI / 180)) // Convert to radians for Fabric
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-500" />
          Photo Editing Tools
        </h3>
        {userPhoto && (
          <Button variant="ghost" size="xs" onClick={onReset} className="text-slate-400 hover:text-slate-600">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset Photo
          </Button>
        )}
      </div>

      {/* 1. Sizing Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Select Print Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                'py-2 px-3 rounded-lg border text-xs font-semibold transition-all text-center',
                selectedSize === size
                  ? 'border-primary-500 bg-primary-50/50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              )}
            >
              {size} in
            </button>
          ))}
        </div>
      </div>

      {/* Fit vs Fill Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Fitting Mode
        </label>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-800">
          <button
            onClick={() => setFitMode('fit')}
            className={cn(
              'flex-1 text-center py-1.5 rounded text-xs font-semibold transition-all',
              fitMode === 'fit'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Fit (Entire Photo)
          </button>
          <button
            onClick={() => setFitMode('fill')}
            className={cn(
              'flex-1 text-center py-1.5 rounded text-xs font-semibold transition-all',
              fitMode === 'fill'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Fill (Crop Frame)
          </button>
        </div>
      </div>

      {/* 2. Photo Upload */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Photo Source
        </label>
        <input
          id="photo-editor-file-input"
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="sr-only"
        />
        <label
          htmlFor="photo-editor-file-input"
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
        >
          <Upload className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {userPhoto ? 'Replace Photo' : 'Upload Your Photo'}
          </span>
        </label>
      </div>

      {userPhoto ? (
        <div className="space-y-5">
          {/* Zoom Controls */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Zoom Scale</span>
              <span>Crop Region</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onZoom(0.9)} className="h-8 w-8 p-0">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-primary-500 w-1/2 rounded-full" />
              </div>
              <Button size="sm" variant="outline" onClick={() => onZoom(1.1)} className="h-8 w-8 p-0">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Edit Actions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Quick Orientation
            </label>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => onRotate(-Math.PI / 2)} className="h-9 px-0 flex flex-col gap-1 items-center justify-center">
                <RotateCw className="w-4 h-4 transform -scale-x-100" />
                <span className="text-[9px]">L 90°</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => onRotate(Math.PI / 2)} className="h-9 px-0 flex flex-col gap-1 items-center justify-center">
                <RotateCw className="w-4 h-4" />
                <span className="text-[9px]">R 90°</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onFlipX} className="h-9 px-0 flex flex-col gap-1 items-center justify-center">
                <FlipHorizontal className="w-4 h-4" />
                <span className="text-[9px]">Flip H</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onFlipY} className="h-9 px-0 flex flex-col gap-1 items-center justify-center">
                <FlipVertical className="w-4 h-4" />
                <span className="text-[9px]">Flip V</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center border rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-4">
            Upload your photo above to unlock active panning, scaling, and orientation tools.
          </p>
        </div>
      )}
    </div>
  )
}
