'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BulkUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    processed: number
    message: string
    errors: string[] | null
  } | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
        setImportResult(null)
      } else {
        toast.error('Only CSV files are supported.')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setImportResult(null)
      } else {
        toast.error('Only CSV files are supported.')
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setImportResult(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        
        try {
          const res = await fetch('/api/admin/products/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvText: text }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || 'Failed to parse and upload CSV')
          }

          setImportResult({
            success: true,
            processed: data.processed,
            message: data.message,
            errors: data.errors,
          })
          
          toast.success(data.message || 'Bulk upload complete!')
          setFile(null)
        } catch (err: any) {
          toast.error(err.message || 'Failed to complete import')
        } finally {
          setLoading(false)
        }
      }

      reader.readAsText(file)
    } catch (err) {
      console.error(err)
      toast.error('Failed to read file')
      setLoading(false)
    }
  }

  // Template download data helper
  const handleDownloadTemplate = () => {
    const csvContent = 
      'name,slug,description,price,compareAtPrice,stock,category,sku,images,tags,isCustomizable\n' +
      'Classic Wood Frame,classic-wood-frame,"Elegant solid oak wood photo frame",899,1199,45,Photo Frames,SKU-WOOD-01,"https://images.unsplash.com/photo-1544005313-94ddf0286df2,https://images.unsplash.com/photo-1506794778202-cad84cf45f1d","wood,classic,gift",true\n' +
      'Minimalist Metal Frame,minimalist-metal-frame,"Sleek modern aluminum frame in black matte finish",1299,,20,Photo Frames,SKU-METAL-02,"https://images.unsplash.com/photo-1534528741775-53994a69daeb","metal,modern,black",false\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'shopuncle_products_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="heading-2 text-gray-950 dark:text-white">Bulk Import Products</h2>
          <p className="body-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Upload a CSV sheet to add or update hundreds of products instantly.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* CSV Format Helper */}
        <Card className="md:col-span-1 border border-gray-200 dark:border-gray-800 shadow-sm h-fit">
          <CardHeader className="pb-3 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              CSV Format Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <p className="text-gray-500 leading-relaxed">
              Your CSV file must include a header row. Below is the list of fields we accept:
            </p>
            <div className="space-y-2 border-t dark:border-gray-800 pt-3">
              <div>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">name*</span>
                <span className="text-gray-400 block">Product title (e.g. Classic Frame)</span>
              </div>
              <div>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">price*</span>
                <span className="text-gray-400 block">Numbers only (e.g. 599.00)</span>
              </div>
              <div>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">category</span>
                <span className="text-gray-400 block">Name or slug (creates on-the-fly)</span>
              </div>
              <div>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">images</span>
                <span className="text-gray-400 block">URLs separated by commas</span>
              </div>
              <div>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">stock</span>
                <span className="text-gray-400 block">Initial inventory amount</span>
              </div>
              <div>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">isCustomizable</span>
                <span className="text-gray-400 block">true or false (enables 3D customizable options)</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs font-semibold"
              onClick={handleDownloadTemplate}
            >
              Download Template CSV
            </Button>
          </CardContent>
        </Card>

        {/* Upload Zone */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/10'
                    : 'border-gray-300 dark:border-gray-800 hover:border-primary-400 bg-gray-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleButtonClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/30 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6" />
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Drag and drop your CSV file here
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                  or click to browse your computer (Max 10MB)
                </p>

                {file && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900 px-4 py-2 rounded-lg flex items-center gap-2 text-primary-700 dark:text-primary-300 text-sm font-medium animate-fade-in">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{file.name}</span>
                    <span className="text-xs text-primary-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {file && (
                  <Button 
                    variant="outline" 
                    onClick={() => setFile(null)} 
                    disabled={loading}
                  >
                    Clear File
                  </Button>
                )}
                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="px-6 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    'Start Import'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Reporting */}
          {importResult && (
            <Card className={`border shadow-sm animate-fade-in ${
              importResult.errors && importResult.errors.length > 0
                ? 'border-yellow-200 dark:border-yellow-950 bg-yellow-50/20'
                : 'border-green-200 dark:border-green-950 bg-green-50/20'
            }`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {importResult.errors && importResult.errors.length > 0 ? (
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      {importResult.errors && importResult.errors.length > 0 ? 'Import completed with warnings' : 'Import successful!'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Successfully processed {importResult.processed} products.
                    </p>
                  </div>
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="space-y-2 border-t dark:border-gray-800 pt-3">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                      Warnings / Rejected Rows:
                    </p>
                    <div className="max-h-48 overflow-y-auto font-mono text-xs text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-3 space-y-1">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
