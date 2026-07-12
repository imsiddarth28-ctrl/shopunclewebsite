// @ts-nocheck
'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Upload, RotateCcw, ZoomIn, ZoomOut, Download, Maximize, Minimize, Loader2, Eye, Box } from 'lucide-react'

interface FrameCustomizerProps {
  frameOption: {
    id: string
    name: string
    modelUrl?: string
    textureUrl?: string
    thumbnailUrl: string
    price: number
    sizes: Array<{
      size: string
      price: number
      dimensions: { width: number; height: number; depth: number }
    }>
    materials: Array<{
      name: string
      textureUrl: string
      priceModifier: number
    }>
  }
  onCustomizeComplete: (data: {
    previewImage: string
    customizationData: any
    selectedSize: string
    selectedMaterial: string
    finalPrice: number
  }) => void
}

const DEFAULT_FRAME_OPTIONS = [
  {
    id: 'default-wood-frame',
    name: 'Premium Dark Wood Frame',
    description: 'Rich dark wood frame with tabletop support',
    thumbnailUrl: '/frames/dark-wood.jpg',
    price: 1299,
    sizes: [
      { size: '5x7', price: 1299, dimensions: { width: 15, height: 20, depth: 2.5 } },
      { size: '8x10', price: 1899, dimensions: { width: 20, height: 25, depth: 2.5 } },
      { size: '11x14', price: 2499, dimensions: { width: 28, height: 35, depth: 3 } },
      { size: '16x20', price: 3499, dimensions: { width: 40, height: 50, depth: 3 } },
    ],
    materials: [
      { name: 'Walnut', textureUrl: '/textures/wood-walnut.jpg', priceModifier: 0 },
      { name: 'Oak', textureUrl: '/textures/wood-oak.jpg', priceModifier: 200 },
      { name: 'Mahogany', textureUrl: '/textures/wood-mahogany.jpg', priceModifier: 400 },
    ],
    placement: {
      top: '12%',
      left: '28.5%',
      width: '42.5%',
      height: '71%',
    }
  },
  {
    id: 'default-metal-frame',
    name: 'Modern Black Frame',
    description: 'Sleek matte black gallery frame style',
    thumbnailUrl: '/frames/modern-black.jpg',
    price: 1599,
    sizes: [
      { size: '5x7', price: 1599, dimensions: { width: 15, height: 20, depth: 1.5 } },
      { size: '8x10', price: 2199, dimensions: { width: 20, height: 25, depth: 1.5 } },
      { size: '11x14', price: 2999, dimensions: { width: 28, height: 35, depth: 2 } },
      { size: '16x20', price: 3999, dimensions: { width: 40, height: 50, depth: 2 } },
    ],
    materials: [
      { name: 'Matte Black', textureUrl: '/textures/metal-black.jpg', priceModifier: 0 },
      { name: 'Brushed Silver', textureUrl: '/textures/metal-silver.jpg', priceModifier: 200 },
      { name: 'Rose Gold', textureUrl: '/textures/metal-rose-gold.jpg', priceModifier: 400 },
    ],
    placement: {
      top: '23.8%',
      left: '18.4%',
      width: '28.8%',
      height: '52.3%',
    }
  },
  {
    id: 'default-acrylic-frame',
    name: 'Ornate Gold Frame',
    description: 'Classic gold ornate frame border style',
    thumbnailUrl: '/frames/gold-ornate.jpg',
    price: 1999,
    sizes: [
      { size: '5x7', price: 1999, dimensions: { width: 15, height: 20, depth: 2 } },
      { size: '8x10', price: 2699, dimensions: { width: 20, height: 25, depth: 2 } },
      { size: '11x14', price: 3499, dimensions: { width: 28, height: 35, depth: 2.5 } },
      { size: '16x20', price: 4499, dimensions: { width: 40, height: 50, depth: 3 } },
    ],
    materials: [
      { name: 'Gold', textureUrl: '/textures/metal-gold.jpg', priceModifier: 0 },
      { name: 'Rose Gold', textureUrl: '/textures/metal-rose-gold.jpg', priceModifier: 300 },
    ],
    placement: {
      top: '13.5%',
      left: '13.5%',
      width: '73%',
      height: '73%',
    }
  },
  {
    id: 'default-multi-frame',
    name: 'Multi-Frame Gallery Set',
    description: 'Beautiful multi-frame wall layout',
    thumbnailUrl: '/frames/multi-frame.jpg',
    price: 2499,
    sizes: [
      { size: '5x7', price: 2499, dimensions: { width: 15, height: 20, depth: 2 } },
      { size: '8x10', price: 3299, dimensions: { width: 20, height: 25, depth: 2 } },
      { size: '11x14', price: 3999, dimensions: { width: 28, height: 35, depth: 2.5 } },
    ],
    materials: [
      { name: 'Wood Multi', textureUrl: '/textures/wood-oak.jpg', priceModifier: 0 },
      { name: 'Gold Multi', textureUrl: '/textures/metal-gold.jpg', priceModifier: 300 },
    ],
    placement: {
      top: '49.1%',
      left: '2.1%',
      width: '28.4%',
      height: '43.2%',
    }
  }
]

const FrameModel = ({
  frameOption,
  selectedSize,
  selectedMaterial,
  userImage,
  imagePosition,
  imageScale,
  imageRotation,
}: {
  frameOption: any
  selectedSize: string
  selectedMaterial: string
  userImage: string | null
  imagePosition: { x: number; y: number; z: number }
  imageScale: number
  imageRotation: number
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const frameRef = useRef<THREE.Mesh>(null)
  const photoRef = useRef<THREE.Mesh>(null)
  const { scene } = useThree()

  const sizeData = frameOption.sizes.find((s: any) => s.size === selectedSize)
  const materialData = frameOption.materials?.find((m: any) => m.name === selectedMaterial)
  const dimensions = sizeData?.dimensions || { width: 20, height: 25, depth: 3 }
  const frameWidth = dimensions.width / 100
  const frameHeight = dimensions.height / 100
  const frameDepth = dimensions.depth / 100

  useFrame(() => {
    if (photoRef.current && userImage) {
      photoRef.current.position.set(imagePosition.x, imagePosition.y, imagePosition.z)
      photoRef.current.scale.setScalar(imageScale)
      photoRef.current.rotation.z = imageRotation
    }
  })

  // Load photo texture on the fly
  const [photoTexture, setPhotoTexture] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!userImage) {
      setPhotoTexture(null)
      return
    }
    const loader = new THREE.TextureLoader()
    loader.load(userImage, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      setPhotoTexture(tex)
    })
  }, [userImage])

  return (
    <group ref={groupRef}>
      <mesh ref={frameRef} position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[frameWidth, frameHeight, frameDepth]} />
        <meshStandardMaterial
          color={
            selectedMaterial.includes('Silver') ? '#C0C0C0' :
            selectedMaterial.includes('Gold') ? '#D4AF37' :
            selectedMaterial.includes('Black') ? '#1A1A1A' :
            selectedMaterial.includes('Walnut') ? '#3D2314' :
            selectedMaterial.includes('Mahogany') ? '#4A0E17' :
            selectedMaterial.includes('Teak') ? '#B06500' :
            selectedMaterial.includes('Clear') ? '#FFFFFF' :
            selectedMaterial.includes('Frosted') ? '#E5E5E5' : '#8B7355'
          }
          roughness={
            selectedMaterial.includes('Metal') || selectedMaterial.includes('Silver') || selectedMaterial.includes('Gold') ? 0.3 : 0.8
          }
          metalness={
            selectedMaterial.includes('Metal') || selectedMaterial.includes('Silver') || selectedMaterial.includes('Gold') ? 0.8 : 0.1
          }
          transparent={selectedMaterial.includes('Clear') || selectedMaterial.includes('Frosted')}
          opacity={selectedMaterial.includes('Clear') ? 0.4 : selectedMaterial.includes('Frosted') ? 0.7 : 1}
        />
      </mesh>

      {userImage && photoTexture && (
        <mesh
          ref={photoRef}
          position={[0, 0, frameDepth / 2 + 0.01]}
          receiveShadow
        >
          <planeGeometry args={[frameWidth * 0.82, frameHeight * 0.82]} />
          <meshBasicMaterial
            map={photoTexture}
            transparent
          />
        </mesh>
      )}

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, -5, 5]} intensity={0.5} />
    </group>
  )
}

const CustomizerCanvas = ({
  frameOption,
  selectedSize,
  selectedMaterial,
  userImage,
  imagePosition,
  imageScale,
  imageRotation,
}: FrameCustomizerProps & {
  userImage: string | null
  imagePosition: { x: number; y: number; z: number }
  imageScale: number
  imageRotation: number
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      shadows
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ width: '100%', height: '100%', borderRadius: '16px' }}
    >
      <FrameModel
        frameOption={frameOption}
        selectedSize={selectedSize}
        selectedMaterial={selectedMaterial}
        userImage={userImage}
        imagePosition={imagePosition}
        imageScale={imageScale}
        imageRotation={imageRotation}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
    </Canvas>
  )
}

export function FrameCustomizer({ frameOption, onCustomizeComplete }: FrameCustomizerProps) {
  // Sync frameOptions or load default fallback list
  const initialOption = DEFAULT_FRAME_OPTIONS.find(o => o.name === frameOption.name) || DEFAULT_FRAME_OPTIONS[0]
  
  const [currentFrameOption, setCurrentFrameOption] = useState(initialOption)
  const [viewMode, setViewMode] = useState<'realistic' | '3d'>('realistic')
  const [userImage, setUserImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedSize, setSelectedSize] = useState(initialOption.sizes[0]?.size || '')
  const [selectedMaterial, setSelectedMaterial] = useState(initialOption.materials?.[0]?.name || '')
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, z: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const matched = DEFAULT_FRAME_OPTIONS.find(o => o.name === frameOption.name) || DEFAULT_FRAME_OPTIONS[0]
    setCurrentFrameOption(matched)
    setSelectedSize(matched.sizes[0]?.size || '')
    setSelectedMaterial(matched.materials?.[0]?.name || '')
  }, [frameOption])

  const sizeData = currentFrameOption.sizes.find((s: any) => s.size === selectedSize)
  const materialData = currentFrameOption.materials?.find((m: any) => m.name === selectedMaterial)
  const basePrice = sizeData?.price || currentFrameOption.price
  const materialPrice = materialData?.priceModifier || 0
  const finalPrice = basePrice + materialPrice

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUserImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 2D Drag-to-reposition handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!userImage) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !userImage) return
    const deltaX = (e.clientX - dragStart.x) * 0.005
    const deltaY = (e.clientY - dragStart.y) * 0.005
    setImagePosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y - deltaY,
      z: prev.z,
    }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!userImage) return
    const delta = e.deltaY > 0 ? 0.95 : 1.05
    setImageScale((prev) => Math.min(Math.max(prev * delta, 0.5), 3.0))
  }

  const generatePreview = async () => {
    return userImage || '/products/placeholder.jpg'
  }

  const handleComplete = async () => {
    const preview = await generatePreview()
    if (!preview) return

    setIsUploading(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: userImage }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to upload image')
      }
      
      const data = await res.json()
      const { imageId } = data

      const customizationData = {
        frameOptionId: currentFrameOption.id || currentFrameOption._id,
        imagePosition,
        imageScale,
        imageRotation,
        selectedSize,
        selectedMaterial,
        originalImageName: imageFile?.name,
        imageId,
      }

      onCustomizeComplete({
        previewImage: preview,
        customizationData,
        selectedSize,
        selectedMaterial,
        finalPrice,
      })
    } catch (error) {
      console.error('Error during customization complete upload:', error)
      alert('Failed to save customization. Please ensure you are logged in and try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetCustomization = () => {
    setUserImage(null)
    setImageFile(null)
    setImagePosition({ x: 0, y: 0, z: 0 })
    setImageScale(1)
    setImageRotation(0)
    setPreviewImage(null)
    const input = document.getElementById('image-upload') as HTMLInputElement
    if (input) input.value = ''
  }

  // Calculate 2D CSS Transform style matching the 3D position
  const photoStyle: React.CSSProperties = {
    transform: `translate(${imagePosition.x * 300}px, ${-imagePosition.y * 300}px) scale(${imageScale}) rotate(${imageRotation}rad)`,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  }

  const placement = currentFrameOption.placement || { top: '15%', left: '15%', width: '70%', height: '70%' }

  return (
    <div className={cn('flex h-full flex-col relative', isFullscreen && 'fixed inset-0 z-50 bg-gray-950')}>
      {isUploading && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm text-white">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
          <p className="font-semibold text-lg">Saving your custom design...</p>
          <p className="text-sm text-gray-300">Uploading photo to secure cloud storage</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3D Framing Studio</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentFrameOption.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border dark:border-gray-700">
            <button
              onClick={() => setViewMode('realistic')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'realistic'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Realistic Border
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === '3d'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Box className="w-3.5 h-3.5" />
              3D View
            </button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetCustomization}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-100 dark:bg-gray-950">
        
        {/* Left Pane: Preview Canvas */}
        <div className="flex-1 relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 pointer-events-none" />
          
          <div className="w-full h-full max-w-[500px] max-h-[500px] aspect-square relative flex items-center justify-center">
            {viewMode === 'realistic' ? (
              // 2D Mockup Border Render
              <div className="w-full h-full relative flex items-center justify-center select-none shadow-2xl rounded-2xl overflow-hidden border bg-white dark:bg-gray-900">
                <img
                  src={currentFrameOption.thumbnailUrl}
                  alt={currentFrameOption.name}
                  className="w-full h-full object-contain relative z-10 pointer-events-none"
                />
                
                {/* Photo container styled using percentages of selected frame option */}
                <div
                  style={{
                    position: 'absolute',
                    top: placement.top,
                    left: placement.left,
                    width: placement.width,
                    height: placement.height,
                    overflow: 'hidden',
                    zIndex: 5,
                    backgroundColor: '#FAFAFA'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  {userImage ? (
                    <img
                      src={userImage}
                      alt="Crop content"
                      style={photoStyle}
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Photo Area</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">Upload image to fit inside border</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 3D ThreeJS Render
              <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CustomizerCanvas
                  frameOption={currentFrameOption}
                  selectedSize={selectedSize}
                  selectedMaterial={selectedMaterial}
                  userImage={userImage}
                  imagePosition={imagePosition}
                  imageScale={imageScale}
                  imageRotation={imageRotation}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Option Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 p-6 border-t md:border-t-0 md:border-l dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-10 shadow-lg">
          <div className="space-y-6">
            
            {/* 1. Upload Photo */}
            <div>
              <label className="label block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">1. Upload Photo</label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
              <label
                htmlFor="image-upload"
                className={cn(
                  'w-full aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden',
                  userImage
                    ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/10'
                    : 'border-gray-300 hover:border-primary-400 dark:border-gray-700 dark:hover:border-primary-500'
                )}
              >
                {userImage ? (
                  <>
                    <img
                      src={userImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-center text-xs">
                      Change Photo
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-1.5" />
                    <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold">Click to select photo</span>
                    <span className="text-[10px] text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                  </>
                )}
              </label>
            </div>

            {/* 2. Frame Borders Selection */}
            <div>
              <label className="label block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">2. Select Frame Style</label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_FRAME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setCurrentFrameOption(opt)
                      setSelectedSize(opt.sizes[0]?.size || '')
                      setSelectedMaterial(opt.materials?.[0]?.name || '')
                    }}
                    type="button"
                    className={cn(
                      'p-1.5 rounded-xl border text-left overflow-hidden transition-all flex flex-col',
                      currentFrameOption.id === opt.id
                        ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/30 dark:bg-primary-950/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    )}
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 mb-1">
                      <img src={opt.thumbnailUrl} alt={opt.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-[10px] tracking-wide text-gray-900 dark:text-white truncate px-1">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Size Option */}
            <div>
              <label className="label block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">3. Size Option</label>
              <div className="grid grid-cols-2 gap-2">
                {currentFrameOption.sizes.map((size: any) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    type="button"
                    className={cn(
                      'p-2 rounded-lg text-center transition-all border text-xs',
                      selectedSize === size.size
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm font-semibold'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:border-primary-400'
                    )}
                  >
                    <div>{size.size}</div>
                    <div className="text-[10px] opacity-80">{formatPrice(size.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Finish Material */}
            {currentFrameOption.materials && currentFrameOption.materials.length > 0 && (
              <div>
                <label className="label block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">4. Frame Finish / Color</label>
                <div className="grid grid-cols-2 gap-2">
                  {currentFrameOption.materials.map((material: any) => (
                    <button
                      key={material.name}
                      onClick={() => setSelectedMaterial(material.name)}
                      type="button"
                      className={cn(
                        'p-2 rounded-lg text-center transition-all border flex flex-col items-center justify-center gap-1 text-xs',
                        selectedMaterial === material.name
                          ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-500 text-primary-900 dark:text-primary-300 font-semibold'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:border-primary-300'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                          style={{
                            backgroundColor:
                              material.name.includes('Silver') ? '#C0C0C0' :
                              material.name.includes('Gold') ? '#D4AF37' :
                              material.name.includes('Black') ? '#1A1A1A' :
                              material.name.includes('Walnut') ? '#3D2314' :
                              material.name.includes('Mahogany') ? '#4A0E17' :
                              material.name.includes('Teak') ? '#B06500' :
                              material.name.includes('Clear') ? '#E2E8F0' :
                              material.name.includes('Frosted') ? '#CBD5E1' : '#8B7355'
                          }}
                        />
                        <span className="text-[10px] truncate max-w-[65px]">{material.name}</span>
                      </div>
                      {material.priceModifier > 0 && (
                        <div className="text-[9px] text-primary-600 dark:text-primary-400">
                          +{formatPrice(material.priceModifier)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Calculations */}
            <div className="border-t dark:border-gray-800 pt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">Base Price ({selectedSize})</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(basePrice)}</span>
              </div>
              {materialPrice > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">Finish Premium</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">+{formatPrice(materialPrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t dark:border-gray-800 pt-2 text-gray-950 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <Button className="w-full h-11 shadow-lg shadow-primary-500/10" onClick={handleComplete} disabled={!userImage}>
                Add Custom Frame to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer controls instruction */}
      <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hidden md:flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Scroll to zoom photo</span>
          <span className="mx-1">|</span>
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Click & drag photo to reposition inside border</span>
        </div>
      </div>
    </div>
  )
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}