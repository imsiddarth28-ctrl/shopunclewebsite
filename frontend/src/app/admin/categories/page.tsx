'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit, Trash2, Tag, Image as ImageIcon, ChevronRight } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: '', slug: '', description: '', image: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (cat: any) => {
    setEditTarget(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' })
    setError('')
    setShowForm(true)
  }

  const handleSlugify = (name: string) => {
    setForm(f => ({ ...f, name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) { setError('Name and slug are required'); return }
    setSaving(true); setError('')
    try {
      const method = editTarget ? 'PATCH' : 'POST'
      const url = editTarget ? `/api/categories/${editTarget._id}` : '/api/categories'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to save'); return }
      setShowForm(false)
      fetchCategories()
    } catch (e) { setError('Network error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      fetchCategories()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="border-primary-200 dark:border-primary-800 ring-1 ring-primary-500/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {editTarget ? 'Edit Category' : 'New Category'}
            </h3>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.name}
                  onChange={e => handleSlugify(e.target.value)}
                  placeholder="e.g. Photo Frames"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="photo-frames"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Category'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading categories…</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">No categories yet</p>
              <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-2" />Add First Category</Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map(cat => (
                <li key={cat._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Icon / Image */}
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display='none' }} />
                    ) : (
                      <Tag className="w-5 h-5 text-primary-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">/{cat.slug}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
