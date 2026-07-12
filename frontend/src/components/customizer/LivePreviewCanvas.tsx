// @ts-nocheck
'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { fabric } from 'fabric'
import { CustomBorderConfig, PremadeTemplate } from '@/lib/frame-presets'
import { Loader2 } from 'lucide-react'

interface LivePreviewCanvasProps {
  userPhoto: string | null
  borderConfig: CustomBorderConfig
  selectedTemplate: PremadeTemplate | null
  selectedSize: string
  fitMode: 'fit' | 'fill'
}

export interface LivePreviewCanvasRef {
  zoom: (value: number) => void
  rotate: (angle: number) => void
  flipX: () => void
  flipY: () => void
  reset: () => void
  getCanvasImage: () => string | null
}

const SIZE_RATIOS: Record<string, number> = {
  '5x7': 5 / 7,
  '8x10': 8 / 10,
  '10x12': 10 / 12,
  '11x14': 11 / 14,
  '12x12': 1,
  '12x16': 12 / 16,
  '16x20': 16 / 20,
  'A4': 210 / 297,
  'A3': 297 / 420,
}

export const LivePreviewCanvas = forwardRef<LivePreviewCanvasRef, LivePreviewCanvasProps>(
  ({ userPhoto, borderConfig, selectedTemplate, selectedSize, fitMode }, ref) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
    const activeImageRef = useRef<fabric.Image | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Save relative position transforms to preserve states across frame swaps
    const [relativeTransforms, setRelativeTransforms] = useState({
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      flipX: false,
      flipY: false,
      offsetXPercent: 0, // Offset from canvas center in percentage
      offsetYPercent: 0,
    })

    // Calculate dynamic container dimensions based on ratio
    const containerMax = 380
    const ratio = SIZE_RATIOS[selectedSize] || 1
    const containerWidth = ratio <= 1 ? containerMax * ratio : containerMax
    const containerHeight = ratio <= 1 ? containerMax : containerMax / ratio

    // Inner Opening dimensions (canvas area)
    const frameBorderWidth = selectedTemplate && selectedTemplate.frameImage ? 25 : borderConfig.width
    const matWidth = borderConfig.matBorder ? borderConfig.matWidth : 0
    const edgeOffset = frameBorderWidth + matWidth

    const canvasWidth = Math.max(50, containerWidth - 2 * edgeOffset)
    const canvasHeight = Math.max(50, containerHeight - 2 * edgeOffset)

    // Initialize Fabric Canvas
    useEffect(() => {
      if (!canvasContainerRef.current) return

      const container = canvasContainerRef.current
      const canvasElement = document.createElement('canvas')
      canvasElement.id = 'fabric-frame-editor-inner'
      container.appendChild(canvasElement)

      const fCanvas = new fabric.Canvas('fabric-frame-editor-inner', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#f8fafc',
        selection: false,
        allowTouchScrolling: true,
      })

      fabricCanvasRef.current = fCanvas

      // Handle user translation drag events
      fCanvas.on('object:moving', (e) => {
        const obj = e.target
        if (!obj) return
        // Save relative percent offsets from center
        setRelativeTransforms((prev) => ({
          ...prev,
          offsetXPercent: (obj.left! - fCanvas.width! / 2) / fCanvas.width!,
          offsetYPercent: (obj.top! - fCanvas.height! / 2) / fCanvas.height!,
        }))
      })

      return () => {
        fCanvas.dispose()
        container.innerHTML = ''
      }
    }, [canvasWidth, canvasHeight])

    // Load / update photo on canvas
    useEffect(() => {
      const fCanvas = fabricCanvasRef.current
      if (!fCanvas) return

      if (!userPhoto) {
        fCanvas.clear()
        fCanvas.renderAll()
        return
      }

      setIsLoading(true)
      fabric.Image.fromURL(
        userPhoto,
        (img) => {
          fCanvas.clear()

          // Fit or Fill initial calculation
          const scaleWidth = canvasWidth / img.width!
          const scaleHeight = canvasHeight / img.height!
          let baseScale = 1

          if (fitMode === 'fit') {
            baseScale = Math.min(scaleWidth, scaleHeight) * 0.95
          } else {
            baseScale = Math.max(scaleWidth, scaleHeight)
          }

          // Apply saved relative transformations or default
          const currentScale = baseScale * (relativeTransforms.scaleX || 1)
          const targetLeft = fCanvas.width! / 2 + relativeTransforms.offsetXPercent * fCanvas.width!
          const targetTop = fCanvas.height! / 2 + relativeTransforms.offsetYPercent * fCanvas.height!

          img.set({
            originX: 'center',
            originY: 'center',
            left: targetLeft,
            top: targetTop,
            scaleX: currentScale,
            scaleY: currentScale,
            angle: relativeTransforms.angle || 0,
            flipX: relativeTransforms.flipX || false,
            flipY: relativeTransforms.flipY || false,
            hasBorders: false,
            hasControls: false,
            lockScalingFlip: true,
          })

          fCanvas.add(img)
          fCanvas.setActiveObject(img)
          activeImageRef.current = img
          fCanvas.renderAll()
          setIsLoading(false)
        },
        { crossOrigin: 'anonymous' }
      )
    }, [userPhoto, canvasWidth, canvasHeight, fitMode])

    // Expose operations to parent controls
    useImperativeHandle(ref, () => ({
      zoom: (scaleFactor: number) => {
        const img = activeImageRef.current
        const fCanvas = fabricCanvasRef.current
        if (!img || !fCanvas) return

        const newScaleX = (img.scaleX || 1) * scaleFactor
        const newScaleY = (img.scaleY || 1) * scaleFactor

        img.set({ scaleX: newScaleX, scaleY: newScaleY })
        img.setCoords()
        fCanvas.renderAll()

        // Sync relative transform values
        setRelativeTransforms((prev) => ({
          ...prev,
          scaleX: prev.scaleX * scaleFactor,
          scaleY: prev.scaleY * scaleFactor,
        }))
      },
      rotate: (angle: number) => {
        const img = activeImageRef.current
        const fCanvas = fabricCanvasRef.current
        if (!img || !fCanvas) return

        const newAngle = (img.angle || 0) + angle
        img.set('angle', newAngle)
        img.setCoords()
        fCanvas.renderAll()

        setRelativeTransforms((prev) => ({
          ...prev,
          angle: newAngle,
        }))
      },
      flipX: () => {
        const img = activeImageRef.current
        const fCanvas = fabricCanvasRef.current
        if (!img || !fCanvas) return

        const val = !img.flipX
        img.set('flipX', val)
        fCanvas.renderAll()

        setRelativeTransforms((prev) => ({
          ...prev,
          flipX: val,
        }))
      },
      flipY: () => {
        const img = activeImageRef.current
        const fCanvas = fabricCanvasRef.current
        if (!img || !fCanvas) return

        const val = !img.flipY
        img.set('flipY', val)
        fCanvas.renderAll()

        setRelativeTransforms((prev) => ({
          ...prev,
          flipY: val,
        }))
      },
      reset: () => {
        const img = activeImageRef.current
        const fCanvas = fabricCanvasRef.current
        if (!img || !fCanvas) return

        const scaleWidth = canvasWidth / img.width!
        const scaleHeight = canvasHeight / img.height!
        const baseScale = fitMode === 'fit' ? Math.min(scaleWidth, scaleHeight) * 0.95 : Math.max(scaleWidth, scaleHeight)

        img.set({
          left: fCanvas.width! / 2,
          top: fCanvas.height! / 2,
          scaleX: baseScale,
          scaleY: baseScale,
          angle: 0,
          flipX: false,
          flipY: false,
        })
        img.setCoords()
        fCanvas.renderAll()

        setRelativeTransforms({
          scaleX: 1,
          scaleY: 1,
          angle: 0,
          flipX: false,
          flipY: false,
          offsetXPercent: 0,
          offsetYPercent: 0,
        })
      },
      getCanvasImage: () => {
        const fCanvas = fabricCanvasRef.current
        if (!fCanvas) return null
        return fCanvas.toDataURL({
          format: 'png',
          quality: 1,
        })
      },
    }))

    // Build CSS classes for dynamic borders
    const getProceduralStyles = () => {
      const styleMap = {
        solid: 'solid',
        double: 'double',
        groove: 'groove',
        ridge: 'ridge',
        dashed: 'dashed',
        dotted: 'dotted',
        inset: 'inset',
        outset: 'outset',
      }

      const frameWidthVal = `${frameBorderWidth}px`
      const rad = `${borderConfig.cornerRadius}px`

      let textureBg = 'none'
      if (borderConfig.texture && borderConfig.texture !== 'plain') {
        const textureUrls = {
          oak: '/textures/wood-oak.jpg',
          walnut: '/textures/wood-walnut.jpg',
          pine: '/textures/wood-teak.jpg',
          teak: '/textures/wood-teak.jpg',
          mahogany: '/textures/wood-mahogany.jpg',
          'gold-metal': '/textures/metal-gold.jpg',
          'silver-metal': '/textures/metal-silver.jpg',
          bronze: '/textures/metal-rose-gold.jpg',
        }
        const matchedUrl = textureUrls[borderConfig.texture] || '/textures/wood-oak.jpg'
        textureBg = `url('${matchedUrl}')`
      }

      let boxShad = 'none'
      const shadowIntensity = borderConfig.shadowDepth / 20
      if (borderConfig.outerShadow) {
        boxShad = `0 ${borderConfig.shadowDepth}px ${borderConfig.shadowDepth * 1.5}px rgba(0,0,0,${0.3 * shadowIntensity})`
      }

      let sheenBg = 'none'
      if (borderConfig.finish === 'metallic') {
        sheenBg = 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.3) 100%)'
      } else if (borderConfig.finish === 'gloss') {
        sheenBg = 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)'
      } else if (borderConfig.finish === 'satin') {
        sheenBg = 'radial-gradient(circle at top, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)'
      }

      let patternUrl = 'none'
      if (borderConfig.pattern && borderConfig.pattern !== 'plain') {
        patternUrl = `repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 10px)`
      }

      return {
        frameStyle: {
          borderWidth: frameWidthVal,
          borderColor: borderConfig.color,
          borderStyle: styleMap[borderConfig.style] || 'solid',
          backgroundImage: sheenBg !== 'none' ? sheenBg : undefined,
          borderRadius: rad,
          boxShadow: boxShad,
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        } as React.CSSProperties,
        textureOverlayStyle: {
          position: 'absolute',
          inset: 0,
          backgroundImage: textureBg,
          backgroundSize: 'cover',
          mixBlendMode: 'multiply',
          opacity: borderConfig.textureOpacity,
          borderRadius: `calc(${rad} - 2px)`,
          pointerEvents: 'none',
          zIndex: 11,
        } as React.CSSProperties,
        patternOverlayStyle: {
          position: 'absolute',
          inset: 0,
          backgroundImage: patternUrl !== 'none' ? patternUrl : undefined,
          borderRadius: `calc(${rad} - 2px)`,
          pointerEvents: 'none',
          zIndex: 12,
        } as React.CSSProperties,
        matStyle: {
          position: 'absolute',
          inset: `${frameBorderWidth}px`,
          borderWidth: `${matWidth}px`,
          borderColor: borderConfig.matColor,
          borderStyle: borderConfig.matBorder ? 'solid' : 'none',
          boxShadow: borderConfig.matBorder ? 'inset 0 1px 3px rgba(0,0,0,0.1)' : 'none',
          pointerEvents: 'none',
          zIndex: 9,
        } as React.CSSProperties,
      }
    }

    const styles = getProceduralStyles()

    return (
      <div className="w-full flex justify-center items-center p-4">
        {/* Aspect Ratio Preview Container (Fixed outer box) */}
        <div
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            position: 'relative',
          }}
          className="relative bg-white dark:bg-slate-900 rounded shadow-sm overflow-hidden border select-none flex items-center justify-center"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* MIDDLE LAYER: Fabric Canvas (Sized precisely to inside opening) */}
          <div
            style={{
              position: 'absolute',
              top: `${edgeOffset}px`,
              left: `${edgeOffset}px`,
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            <div ref={canvasContainerRef} className="w-full h-full" />

            {/* Inner Shadow Overlay (clipped inside frame opening) */}
            {borderConfig.innerShadow && (
              <div className="absolute inset-0 shadow-[inset_0_4px_12px_rgba(0,0,0,0.25)] pointer-events-none z-2" />
            )}
          </div>

          {/* TOP LAYER: Fixed Frame Overlay (PNG Image or Custom procedural border) */}
          {selectedTemplate && selectedTemplate.frameImage ? (
            // Premium PNG Overlay style
            <img
              src={selectedTemplate.frameImage}
              alt={selectedTemplate.name}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20"
            />
          ) : (
            // Procedural Frame Styles
            <>
              <div style={styles.frameStyle} />
              {borderConfig.texture !== 'plain' && <div style={styles.textureOverlayStyle} />}
              {borderConfig.pattern !== 'plain' && <div style={styles.patternOverlayStyle} />}
              {borderConfig.matBorder && <div style={styles.matStyle} />}
            </>
          )}

          {/* Glass Reflection overlay */}
          {borderConfig.glassReflection && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-30" />
          )}
        </div>
      </div>
    )
  }
)

LivePreviewCanvas.displayName = 'LivePreviewCanvas'
