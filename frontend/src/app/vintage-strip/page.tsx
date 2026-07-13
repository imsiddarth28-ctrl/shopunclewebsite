'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Camera, Upload, Download, Frame, RotateCcw, X } from 'lucide-react'

/* ─────────── types ─────────── */
type Slot = string | null

/* ─────────── utils ─────────── */
function clamp(v: number) { return v < 0 ? 0 : v > 255 ? 255 : v }

function applyVintage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const avg = (r + g + b) / 3
    const dr = r * 0.6 + avg * 0.4, dg = g * 0.6 + avg * 0.4, db = b * 0.6 + avg * 0.4
    const sr = dr * 0.9 + dg * 0.15 + 10
    const sg = dr * 0.05 + dg * 0.85 + db * 0.05
    const sb = db * 0.8 - 8
    const n = (Math.random() - 0.5) * 20
    d[i] = clamp(sr + n); d[i + 1] = clamp(sg + n); d[i + 2] = clamp(sb + n)
  }
  ctx.putImageData(imgData, 0, 0)
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(20,10,5,.5)')
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h)
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height)
  const sw = w / scale, sh = h / scale
  const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => { const img = new Image(); img.onload = () => resolve(img); img.src = src })
}

/* ─────────── main component ─────────── */
export default function VintageStripPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Slot[]>([null, null, null])
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const allFilled = photos.every(Boolean)

  /* ── camera ── */
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      setStream(s)
      setShowCamera(true)
    } catch {
      toast.error('Camera unavailable — upload photos instead')
    }
  }

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [showCamera, stream])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setShowCamera(false)
  }, [stream])

  const capturePhoto = () => {
    if (!videoRef.current) return
    const nextSlot = photos.findIndex(p => !p)
    if (nextSlot === -1) { toast.error('All three slots are filled'); return }
    const c = document.createElement('canvas')
    c.width = videoRef.current.videoWidth || 480
    c.height = videoRef.current.videoHeight || 480
    c.getContext('2d')!.drawImage(videoRef.current, 0, 0, c.width, c.height)
    const dataUrl = c.toDataURL('image/png')
    setPhotos(prev => { const n = [...prev]; n[nextSlot] = dataUrl; return n })
    toast.success(`Photo ${nextSlot + 1} captured!`)
    if (photos.filter(Boolean).length === 2) stopCamera()
  }

  /* ── file upload ── */
  const handleFileUpload = (index: number, file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 15 * 1024 * 1024) { toast.error('Image must be under 15 MB'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setPhotos(prev => { const n = [...prev]; n[index] = src; return n })
    }
    reader.readAsDataURL(file)
  }

  const clearSlot = (i: number) => setPhotos(prev => { const n = [...prev]; n[i] = null; return n })

  /* ── process strip ── */
  const processStrip = async () => {
    if (!allFilled) { toast.error('Fill all three slots first'); return }
    setProcessing(true)
    try {
      const imgs = await Promise.all((photos as string[]).map(loadImg))
      const cellW = 320, cellH = 230, gap = 22, margin = 34
      const totalW = cellW + margin * 2
      const totalH = margin * 2 + cellH * 3 + gap * 2

      const canvas = canvasRef.current!
      canvas.width = totalW; canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      // Background
      ctx.fillStyle = '#100D0A'; ctx.fillRect(0, 0, totalW, totalH)

      // Photos with vintage filter
      imgs.forEach((img, i) => {
        const cell = document.createElement('canvas')
        cell.width = cellW; cell.height = cellH
        const cctx = cell.getContext('2d')!
        drawCover(cctx, img, 0, 0, cellW, cellH)
        applyVintage(cctx, cellW, cellH)
        ctx.drawImage(cell, margin, margin + i * (cellH + gap))
      })

      // Sprocket holes
      const holeR = 8, holeGapY = 40
      ctx.fillStyle = '#3A312A'
      for (let y = 24; y < totalH - 20; y += holeGapY) {
        // left holes
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(14 - holeR, y - holeR, holeR * 2, holeR * 1.6, 3)
        } else {
          ctx.rect(14 - holeR, y - holeR, holeR * 2, holeR * 1.6)
        }
        ctx.fill()

        // right holes
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(totalW - 14 - holeR, y - holeR, holeR * 2, holeR * 1.6, 3)
        } else {
          ctx.rect(totalW - 14 - holeR, y - holeR, holeR * 2, holeR * 1.6)
        }
        ctx.fill()
      }

      setResultDataUrl(canvas.toDataURL('image/png'))
      setTimeout(() => document.getElementById('vs-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      toast.error('Processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  /* ── download ── */
  const download = () => {
    if (!resultDataUrl) return
    const a = document.createElement('a')
    a.href = resultDataUrl
    a.download = 'vintage-strip.png'
    a.click()
    toast.success('Strip downloaded!')
  }

  /* ── order as frame ── */
  const orderAsFrame = () => {
    if (!resultDataUrl) return
    sessionStorage.setItem('vintage-strip-photo', resultDataUrl)
    router.push('/frame-designer')
  }

  /* ── reset ── */
  const startOver = () => {
    setPhotos([null, null, null])
    setResultDataUrl(null)
    stopCamera()
  }

  return (
    <div className="min-h-screen bg-[#100D0A] text-[#F7F1E6]">

      {/* ── hero section ── */}
      <div className="relative min-h-[520px] flex items-center overflow-hidden">
        {/* animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#241D19] via-[#1A1512] to-[#0E0C0A]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 60px), repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 60px)'
        }} />

        {/* floating film strips (pure CSS) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-80">
          <FilmStripVisual />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <Link href="/frames" className="inline-flex items-center gap-2 text-xs text-[#C9BFAF] hover:text-[#F7F1E6] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Premium Feature</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium leading-tight mb-5">
            Three photos.<br />One vintage strip.
          </h1>
          <p className="text-[#C9BFAF] text-base leading-relaxed max-w-lg mb-8">
            Capture or upload three photos and we'll compose them into a classic photo-booth strip — warm tones, soft grain, a real film-reel border.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#vs-builder" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-6 py-3 rounded-full transition-colors text-sm">
              Start your strip
            </a>
            <Link href="/frame-designer" className="inline-flex items-center gap-2 border border-[rgba(247,241,230,.25)] hover:border-[rgba(247,241,230,.5)] text-[#F7F1E6] px-6 py-3 rounded-full transition-colors text-sm">
              See the designer
            </Link>
          </div>
        </div>
      </div>

      {/* ── how it works ── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 text-center">How it works</p>
        <h2 className="font-serif text-2xl font-medium text-center mb-10">From camera to keepsake</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: '01', title: 'Capture or upload', body: 'Use your camera for a real photo-booth countdown, or upload three photos you already love.' },
            { n: '02', title: 'Vintage processing', body: 'We warm the tones, add a soft vignette and film grain, then set it inside a black reel border with sprocket holes.' },
            { n: '03', title: 'Download or order', body: 'Save the strip to your device, or carry it straight into the frame designer.' },
          ].map((s) => (
            <div key={s.n} className="bg-[#241D19] border border-[rgba(247,241,230,.1)] rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
              <p className="font-serif text-amber-400 text-sm mb-3">{s.n}</p>
              <h3 className="font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-[#C9BFAF] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── builder ── */}
      <div id="vs-builder" className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-[#241D19] border border-[rgba(247,241,230,.1)] rounded-3xl p-8">
          <h2 className="font-serif text-2xl font-medium mb-2">Make your strip</h2>
          <p className="text-[#C9BFAF] text-sm mb-8">Fill all three slots — upload photos or use your camera.</p>

          {/* 3 photo slots */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {photos.map((photo, i) => (
              <PhotoSlot
                key={i}
                index={i}
                photo={photo}
                onUpload={(f) => handleFileUpload(i, f)}
                onClear={() => clearSlot(i)}
              />
            ))}
          </div>

          {/* camera controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={showCamera ? stopCamera : startCamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(247,241,230,.2)] text-sm font-semibold text-[#F7F1E6] hover:border-amber-400 transition-colors"
            >
              <Camera className="w-4 h-4" />
              {showCamera ? 'Stop camera' : 'Use camera instead'}
            </button>
            <button
              onClick={processStrip}
              disabled={!allFilled || processing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-900 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing…' : 'Create my vintage strip'}
            </button>
          </div>

          {/* camera feed */}
          {showCamera && (
            <div className="bg-[#100D0A] rounded-2xl p-5 mb-6 text-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm rounded-xl mx-auto block bg-black" />
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={capturePhoto}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
                >
                  <Camera className="w-4 h-4" /> Take photo
                </button>
                <button onClick={stopCamera} className="px-5 py-2.5 rounded-full border border-[rgba(247,241,230,.2)] text-sm font-semibold text-[#F7F1E6] hover:border-red-400 transition-colors">
                  Stop
                </button>
              </div>
              <p className="text-[#C9BFAF] text-xs mt-3">
                {photos.filter(Boolean).length}/3 slots filled
              </p>
            </div>
          )}

          {/* result */}
          {resultDataUrl && (
            <div id="vs-result" className="text-center mt-8 border-t border-[rgba(247,241,230,.1)] pt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">Your vintage strip is ready!</p>
              <img
                src={resultDataUrl}
                alt="Vintage strip result"
                className="max-w-[220px] mx-auto rounded-xl shadow-2xl mb-6"
              />
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={download} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(247,241,230,.25)] hover:border-amber-400 text-sm font-semibold text-[#F7F1E6] transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={orderAsFrame} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
                  <Frame className="w-4 h-4" /> Order as a frame
                </button>
                <button onClick={startOver} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(247,241,230,.15)] hover:border-red-400 text-sm font-semibold text-[#F7F1E6] transition-colors">
                  <RotateCcw className="w-4 h-4" /> Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

/* ─────────── sub-components ─────────── */
function PhotoSlot({ index, photo, onUpload, onClear }: {
  index: number
  photo: Slot
  onUpload: (f: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative group">
      <div
        onClick={() => !photo && inputRef.current?.click()}
        className={`aspect-square rounded-xl border-2 overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
          photo
            ? 'border-amber-500/40'
            : 'border-dashed border-[rgba(247,241,230,.2)] hover:border-amber-400/60 bg-[#1A1512]'
        }`}
      >
        {photo ? (
          <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#C9BFAF] p-4 text-center">
            <Upload className="w-5 h-5" />
            <span className="text-xs">Tap to upload</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] bg-black/50 text-[#F7F1E6] px-2 py-0.5 rounded-full font-semibold">{index + 1}</span>
      </div>
      {photo && (
        <button
          onClick={onClear}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(e.target.files?.[0]!)}
      />
    </div>
  )
}

function FilmStripVisual() {
  return (
    <div className="relative w-48 h-96 rounded-sm overflow-hidden" style={{ background: '#0E0C0A', border: '2px solid #2A221E' }}>
      {[
        ['#D9A468', '#7C4A2E'],
        ['#C98A6B', '#5B3324'],
        ['#E0B37E', '#8A5A34'],
      ].map(([a, b], i) => (
        <div key={i} className="absolute mx-4 rounded-sm" style={{
          top: 20 + i * 118, left: 20, right: 20, height: 100,
          background: `linear-gradient(135deg, ${a}, ${b})`
        }} />
      ))}
      {/* sprocket holes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i}>
          <div className="absolute bg-[#2A221E] rounded-sm" style={{ width: 8, height: 5, left: 4, top: 18 + i * 38 }} />
          <div className="absolute bg-[#2A221E] rounded-sm" style={{ width: 8, height: 5, right: 4, top: 18 + i * 38 }} />
        </div>
      ))}
    </div>
  )
}
