'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatPrice } from '@/lib/utils'
import { 
  Plus, Edit, Trash2, ArrowLeft, Sliders, ChevronDown, 
  ChevronUp, Scale, Settings, Check, X, Loader2 
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FrameOptionsManagerProps {
  productId: string
  productName: string
  initialFrameOptions: any[]
}

export function FrameOptionsManager({ productId, productName, initialFrameOptions }: FrameOptionsManagerProps) {
  const router = useRouter()
  const [frameOptions, setFrameOptions] = useState<any[]>(initialFrameOptions)
  const [loading, setLoading] = useState(false)
  const [expandedFrameId, setExpandedFrameId] = useState<string | null>(initialFrameOptions[0]?.id || null)

  // Modals state
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false)
  const [editingFrame, setEditingFrame] = useState<any>(null)
  
  // New frame form inputs
  const [frameName, setFrameName] = useState('')
  const [basePrice, setBasePrice] = useState(0)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [modelUrl, setModelUrl] = useState('')
  const [textureUrl, setTextureUrl] = useState('')

  // New size form inputs
  const [sizeName, setSizeName] = useState('')
  const [sizePrice, setSizePrice] = useState(0)
  const [sizeWidth, setSizeWidth] = useState(20)
  const [sizeHeight, setSizeHeight] = useState(25)
  const [sizeDepth, setSizeDepth] = useState(2.5)

  // New material form inputs
  const [matName, setMatName] = useState('')
  const [matTexture, setMatTexture] = useState('')
  const [matModifier, setMatModifier] = useState(0)

  const toggleExpand = (id: string) => {
    setExpandedFrameId(expandedFrameId === id ? null : id)
  }

  const openAddFrame = () => {
    setEditingFrame(null)
    setFrameName('')
    setBasePrice(1299)
    setThumbnailUrl('/frames/placeholder-thumb.jpg')
    setModelUrl('')
    setTextureUrl('')
    setIsFrameModalOpen(true)
  }

  const openEditFrame = (frame: any) => {
    setEditingFrame(frame)
    setFrameName(frame.name)
    setBasePrice(frame.basePrice || frame.price)
    setThumbnailUrl(frame.thumbnailUrl)
    setModelUrl(frame.modelUrl || '')
    setTextureUrl(frame.textureUrl || '')
    setIsFrameModalOpen(true)
  }

  const handleSaveFrame = async () => {
    if (!frameName || !thumbnailUrl) {
      return toast.error('Name and Thumbnail URL are required')
    }

    setLoading(true)
    try {
      const url = editingFrame
        ? `/api/products/${productId}/frames/${editingFrame.id || editingFrame._id}`
        : `/api/products/${productId}/frames`
      
      const method = editingFrame ? 'PUT' : 'POST'

      const payload = {
        name: frameName,
        thumbnailUrl,
        modelUrl: modelUrl || undefined,
        textureUrl: textureUrl || undefined,
        price: basePrice,
        sizes: editingFrame?.sizes || [{
          size: '8x10',
          price: basePrice,
          dimensions: { width: 20, height: 25, depth: 2.5 }
        }],
        materials: editingFrame?.materials || [{
          name: 'Standard',
          textureUrl: textureUrl || '/textures/placeholder.jpg',
          priceModifier: 0
        }]
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save frame option')
      }

      const savedFrame = await response.json()
      
      if (editingFrame) {
        setFrameOptions(prev => prev.map(f => (f.id === savedFrame.id || f._id === savedFrame._id) ? savedFrame : f))
        toast.success('Frame updated!')
      } else {
        setFrameOptions(prev => [...prev, savedFrame])
        setExpandedFrameId(savedFrame.id || savedFrame._id)
        toast.success('Frame option added!')
      }
      
      setIsFrameModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFrame = async (frameId: string) => {
    if (!confirm('Are you sure you want to delete this frame style?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}/frames/${frameId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete frame style')
      }

      setFrameOptions(prev => prev.filter(f => f.id !== frameId && f._id !== frameId))
      toast.success('Frame deleted!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Manage Sizes
  const handleAddSize = async (frame: any) => {
    if (!sizeName || sizePrice <= 0) {
      return toast.error('Please enter a valid size and price')
    }

    const newSize = {
      size: sizeName,
      price: sizePrice,
      dimensions: {
        width: sizeWidth,
        height: sizeHeight,
        depth: sizeDepth
      }
    }

    const updatedSizes = [...(frame.sizes || []), newSize]
    
    // Save to server
    try {
      const response = await fetch(`/api/products/${productId}/frames/${frame.id || frame._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...frame,
          price: frame.basePrice || frame.price,
          sizes: updatedSizes
        })
      })

      if (!response.ok) throw new Error('Failed to save size')
      const updatedFrame = await response.json()
      setFrameOptions(prev => prev.map(f => (f.id === updatedFrame.id || f._id === updatedFrame._id) ? updatedFrame : f))
      toast.success('Size added!')
      
      // Reset form
      setSizeName('')
      setSizePrice(0)
    } catch (err) {
      toast.error('Failed to add size')
    }
  }

  const handleDeleteSize = async (frame: any, sizeIndex: number) => {
    const updatedSizes = frame.sizes.filter((_: any, i: number) => i !== sizeIndex)

    try {
      const response = await fetch(`/api/products/${productId}/frames/${frame.id || frame._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...frame,
          price: frame.basePrice || frame.price,
          sizes: updatedSizes
        })
      })

      if (!response.ok) throw new Error('Failed to delete size')
      const updatedFrame = await response.json()
      setFrameOptions(prev => prev.map(f => (f.id === updatedFrame.id || f._id === updatedFrame._id) ? updatedFrame : f))
      toast.success('Size removed!')
    } catch (err) {
      toast.error('Failed to remove size')
    }
  }

  // Manage Materials
  const handleAddMaterial = async (frame: any) => {
    if (!matName || !matTexture) {
      return toast.error('Name and Texture URL are required')
    }

    const newMat = {
      name: matName,
      textureUrl: matTexture,
      priceModifier: matModifier
    }

    const updatedMats = [...(frame.materials || []), newMat]

    try {
      const response = await fetch(`/api/products/${productId}/frames/${frame.id || frame._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...frame,
          price: frame.basePrice || frame.price,
          materials: updatedMats
        })
      })

      if (!response.ok) throw new Error('Failed to save material')
      const updatedFrame = await response.json()
      setFrameOptions(prev => prev.map(f => (f.id === updatedFrame.id || f._id === updatedFrame._id) ? updatedFrame : f))
      toast.success('Material added!')
      
      // Reset form
      setMatName('')
      setMatTexture('')
      setMatModifier(0)
    } catch (err) {
      toast.error('Failed to add material')
    }
  }

  const handleDeleteMaterial = async (frame: any, matIndex: number) => {
    const updatedMats = frame.materials.filter((_: any, i: number) => i !== matIndex)

    try {
      const response = await fetch(`/api/products/${productId}/frames/${frame.id || frame._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...frame,
          price: frame.basePrice || frame.price,
          materials: updatedMats
        })
      })

      if (!response.ok) throw new Error('Failed to delete material')
      const updatedFrame = await response.json()
      setFrameOptions(prev => prev.map(f => (f.id === updatedFrame.id || f._id === updatedFrame._id) ? updatedFrame : f))
      toast.success('Material removed!')
    } catch (err) {
      toast.error('Failed to remove material')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" type="button" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="heading-3 text-gray-950 dark:text-white">Manage Framing Styles</h2>
          <p className="body-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure frame models, sizes, and materials for <strong className="text-gray-900 dark:text-white">{productName}</strong>
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={openAddFrame} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Frame Style
        </Button>
      </div>

      {frameOptions.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50/50 dark:bg-gray-900/30">
          <Sliders className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="heading-4 text-gray-700 dark:text-gray-300">No Custom Framing Options</h3>
          <p className="body-sm text-gray-500 max-w-md mx-auto mt-2 mb-6">
            You must add at least one framing style (such as Classic Wood Frame) to display customizable attributes on the product page.
          </p>
          <Button onClick={openAddFrame} size="sm">Add Frame Style Now</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {frameOptions.map((frame) => {
            const frameId = frame.id || frame._id
            const isExpanded = expandedFrameId === frameId
            return (
              <Card key={frameId} className="border border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/10" onClick={() => toggleExpand(frameId)}>
                  <div className="flex items-center gap-3">
                    <img
                      src={frame.thumbnailUrl || '/frames/placeholder-thumb.jpg'}
                      alt={frame.name}
                      className="w-12 h-12 rounded-lg object-cover border dark:border-gray-700"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-950 dark:text-white">{frame.name}</h3>
                      <p className="text-xs text-gray-500">Base Price: {formatPrice(frame.basePrice || frame.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => openEditFrame(frame)} className="p-1.5 h-auto">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteFrame(frameId)} className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <button className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800" onClick={() => toggleExpand(frameId)}>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                    {/* Sizes Management */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm border-b dark:border-gray-800 pb-2">
                        Sizes & Pricing overrides
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-xl border dark:border-gray-800">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Size (e.g. 8x10)</label>
                          <Input value={sizeName} onChange={(e) => setSizeName(e.target.value)} placeholder="8x10" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Price (₹)</label>
                          <Input type="number" value={sizePrice} onChange={(e) => setSizePrice(parseInt(e.target.value) || 0)} placeholder="1899" />
                        </div>
                        <div className="grid grid-cols-3 gap-1 col-span-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">W (cm)</label>
                            <Input type="number" value={sizeWidth} onChange={(e) => setSizeWidth(parseFloat(e.target.value) || 0)} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">H (cm)</label>
                            <Input type="number" value={sizeHeight} onChange={(e) => setSizeHeight(parseFloat(e.target.value) || 0)} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">D (cm)</label>
                            <Input type="number" value={sizeDepth} onChange={(e) => setSizeDepth(parseFloat(e.target.value) || 0)} />
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleAddSize(frame)} className="h-10 mt-auto">
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>
                      
                      <div className="overflow-x-auto border dark:border-gray-800 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b dark:border-gray-800 text-left bg-gray-50/30">
                              <th className="p-3 text-xs text-gray-500">Size</th>
                              <th className="p-3 text-xs text-gray-500">Price</th>
                              <th className="p-3 text-xs text-gray-500">Dimensions (W x H x D)</th>
                              <th className="p-3 text-xs text-gray-500 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-800">
                            {frame.sizes?.map((size: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-3 font-medium text-gray-900 dark:text-white">{size.size}</td>
                                <td className="p-3 text-gray-900 dark:text-white font-semibold">{formatPrice(size.price)}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">
                                  {size.dimensions?.width} x {size.dimensions?.height} x {size.dimensions?.depth} cm
                                </td>
                                <td className="p-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSize(frame, idx)} className="text-red-500 p-1.5 h-auto hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Materials Management */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm border-b dark:border-gray-800 pb-2">
                        Materials & Textures
                      </h4>
                      <div className="grid md:grid-cols-4 gap-3 items-end bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-xl border dark:border-gray-800">
                        <div className="col-span-2 md:col-span-1">
                          <label className="text-xs text-gray-500 block mb-1">Name (e.g. Walnut)</label>
                          <Input value={matName} onChange={(e) => setMatName(e.target.value)} placeholder="Walnut" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 block mb-1">Texture image URL</label>
                          <Input value={matTexture} onChange={(e) => setMatTexture(e.target.value)} placeholder="/textures/wood-walnut.jpg" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Price Modifier (+₹)</label>
                          <Input type="number" value={matModifier} onChange={(e) => setMatModifier(parseInt(e.target.value) || 0)} placeholder="300" />
                        </div>
                        <Button size="sm" onClick={() => handleAddMaterial(frame)} className="h-10 mt-auto">
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>

                      <div className="overflow-x-auto border dark:border-gray-800 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b dark:border-gray-800 text-left bg-gray-50/30">
                              <th className="p-3 text-xs text-gray-500">Texture Preview</th>
                              <th className="p-3 text-xs text-gray-500">Material Name</th>
                              <th className="p-3 text-xs text-gray-500">Price Modifier</th>
                              <th className="p-3 text-xs text-gray-500 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-800">
                            {frame.materials?.map((mat: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-3">
                                  <div 
                                    className="w-8 h-8 rounded border dark:border-gray-700 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${mat.textureUrl})` }}
                                  />
                                </td>
                                <td className="p-3 font-medium text-gray-900 dark:text-white">{mat.name}</td>
                                <td className="p-3 text-gray-900 dark:text-white">
                                  {mat.priceModifier > 0 ? `+${formatPrice(mat.priceModifier)}` : 'Included'}
                                </td>
                                <td className="p-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(frame, idx)} className="text-red-500 p-1.5 h-auto hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Frame Form Modal */}
      <Modal isOpen={isFrameModalOpen} onClose={() => setIsFrameModalOpen(false)}>
        <div className="space-y-4">
          <h3 className="heading-4 border-b pb-2">
            {editingFrame ? 'Edit Frame Style' : 'Add Frame Style'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <Input value={frameName} onChange={(e) => setFrameName(e.target.value)} placeholder="Classic Oak Wood" />
            </div>
            <div>
              <label className="label">Base Price (₹)</label>
              <Input type="number" value={basePrice} onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <label className="label">Thumbnail URL</label>
            <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="/frames/classic-wood-thumb.jpg" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">3D Model URL (GLB - Optional)</label>
              <Input value={modelUrl} onChange={(e) => setModelUrl(e.target.value)} placeholder="/models/classic-wood.glb" />
            </div>
            <div>
              <label className="label">Default Texture URL (Optional)</label>
              <Input value={textureUrl} onChange={(e) => setTextureUrl(e.target.value)} placeholder="/textures/wood-oak.jpg" />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsFrameModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveFrame} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save Frame
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
