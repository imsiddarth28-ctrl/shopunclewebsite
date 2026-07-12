// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { CustomBorderConfig } from '@/lib/frame-presets'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Save, Trash2, Sliders, Palette, Shield, Sparkles } from 'lucide-react'

interface BorderBuilderControlsProps {
  config: CustomBorderConfig
  onChange: (updates: Partial<CustomBorderConfig>) => void
  onSavePreset: (name: string) => void
  savedPresets: { name: string; config: CustomBorderConfig }[]
  onLoadPreset: (preset: { name: string; config: CustomBorderConfig }) => void
  onDeletePreset: (name: string) => void
}

export function BorderBuilderControls({
  config,
  onChange,
  onSavePreset,
  savedPresets,
  onLoadPreset,
  onDeletePreset
}: BorderBuilderControlsProps) {
  const [presetName, setPresetName] = useState('')
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'effects' | 'presets'>('profile')

  const handleSave = () => {
    if (!presetName.trim()) return
    onSavePreset(presetName.trim())
    setPresetName('')
  }

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={cn(
            'flex-1 pb-2 border-b-2 font-bold transition-colors flex items-center justify-center gap-1.5',
            activeSubTab === 'profile'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          Frame & Finish
        </button>
        <button
          onClick={() => setActiveSubTab('effects')}
          className={cn(
            'flex-1 pb-2 border-b-2 font-bold transition-colors flex items-center justify-center gap-1.5',
            activeSubTab === 'effects'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          Mat & Shadows
        </button>
        <button
          onClick={() => setActiveSubTab('presets')}
          className={cn(
            'flex-1 pb-2 border-b-2 font-bold transition-colors flex items-center justify-center gap-1.5',
            activeSubTab === 'presets'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Presets ({savedPresets.length})
        </button>
      </div>

      {/* SUBTAB 1: Profile Frame & Texture */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {/* Frame Width */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Frame Width</span>
              <span>{config.width}px</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              value={config.width}
              onChange={(e) => onChange({ width: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          {/* Frame Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Frame Base Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
              />
              <input
                type="text"
                value={config.color.toUpperCase()}
                onChange={(e) => onChange({ color: e.target.value })}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold"
              />
            </div>
          </div>

          {/* Border Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Edge Profile Style
            </label>
            <select
              value={config.style}
              onChange={(e) => onChange({ style: e.target.value })}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300"
            >
              <option value="solid">Flat Solid</option>
              <option value="double">Classic Double Rim</option>
              <option value="groove">Grooved Profile</option>
              <option value="ridge">Raised Ridge</option>
              <option value="dashed">Dashed Border</option>
              <option value="dotted">Dotted Border</option>
              <option value="inset">Bevel Inset</option>
              <option value="outset">Bevel Outset</option>
            </select>
          </div>

          {/* Corner Radius */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Corner Radius</span>
              <span>{config.cornerRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.cornerRadius}
              onChange={(e) => onChange({ cornerRadius: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          {/* Frame Finish */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Frame Finish / Coating
            </label>
            <select
              value={config.finish}
              onChange={(e) => onChange({ finish: e.target.value })}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300"
            >
              <option value="matte">Matte (Flat)</option>
              <option value="gloss">Glossy Reflection</option>
              <option value="satin">Smooth Satin Sheen</option>
              <option value="metallic">Brushed Metallic Sheen</option>
            </select>
          </div>

          {/* Texture Overlay */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Wood Grain / Material Texture
            </label>
            <select
              value={config.texture}
              onChange={(e) => onChange({ texture: e.target.value })}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300"
            >
              <option value="plain">None (Plain Color)</option>
              <option value="oak">Natural Oak</option>
              <option value="walnut">Rich Walnut</option>
              <option value="pine">Nordic Pine</option>
              <option value="teak">Premium Teak</option>
              <option value="mahogany">Mahogany Wood</option>
              <option value="gold-metal">Ornate Gold Sheet</option>
              <option value="silver-metal">Polished Silver Metal</option>
              <option value="bronze">Rustic Bronze</option>
            </select>
          </div>

          {config.texture !== 'plain' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Texture Opacity</span>
                <span>{Math.round(config.textureOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={config.textureOpacity}
                onChange={(e) => onChange({ textureOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          )}

          {/* Patterns */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Decorative Engraved Patterns
            </label>
            <select
              value={config.pattern}
              onChange={(e) => onChange({ pattern: e.target.value })}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300"
            >
              <option value="plain">None (Plain Style)</option>
              <option value="floral">Traditional Floral</option>
              <option value="royal">Embossed Royal Crest</option>
              <option value="vintage">Antique Carved Rope</option>
            </select>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Mat & Shadows */}
      {activeSubTab === 'effects' && (
        <div className="space-y-5 max-h-[460px] overflow-y-auto pr-1">
          {/* Mat Board Toggle */}
          <div className="flex items-center justify-between py-1.5">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Enable Mat Border
              </label>
              <span className="text-[10px] text-slate-400 block">Adds a paper border overlay</span>
            </div>
            <input
              type="checkbox"
              checked={config.matBorder}
              onChange={(e) => onChange({ matBorder: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
          </div>

          {config.matBorder && (
            <>
              {/* Mat Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Mat Board Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.matColor}
                    onChange={(e) => onChange({ matColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={config.matColor.toUpperCase()}
                    onChange={(e) => onChange({ matColor: e.target.value })}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold"
                  />
                </div>
              </div>

              {/* Mat Width */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Mat Width</span>
                  <span>{config.matWidth}px</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  value={config.matWidth}
                  onChange={(e) => onChange({ matWidth: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </>
          )}

          {/* Shadow Options */}
          <div className="space-y-4 border-t pt-4 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Lighting & Shadows
            </label>

            {/* Inner Shadow Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Inner Edge Shadow</span>
              <input
                type="checkbox"
                checked={config.innerShadow}
                onChange={(e) => onChange({ innerShadow: e.target.checked })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </div>

            {/* Outer Shadow Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Wall Drop Shadow</span>
              <input
                type="checkbox"
                checked={config.outerShadow}
                onChange={(e) => onChange({ outerShadow: e.target.checked })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </div>

            {config.outerShadow && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Drop Shadow Depth</span>
                  <span>{config.shadowDepth}px</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={config.shadowDepth}
                  onChange={(e) => onChange({ shadowDepth: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            )}

            {/* Glass Reflection */}
            <div className="flex items-center justify-between py-1 border-t pt-3 dark:border-slate-800">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Protective Glass Reflection</span>
              <input
                type="checkbox"
                checked={config.glassReflection}
                onChange={(e) => onChange({ glassReflection: e.target.checked })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Presets */}
      {activeSubTab === 'presets' && (
        <div className="space-y-4">
          {/* Preset Name Field */}
          <div className="space-y-2 border-b pb-4 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Save Current Style
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="My Custom Walnut..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
              />
              <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5 h-9 px-4">
                <Save className="w-3.5 h-3.5" />
                Save
              </Button>
            </div>
          </div>

          {/* Presets List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Your Saved Presets
            </label>
            {savedPresets.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {savedPresets.map((preset) => (
                  <div
                    key={preset.name}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                  >
                    <button
                      onClick={() => onLoadPreset(preset)}
                      className="flex items-center gap-2 text-left"
                    >
                      <div
                        className="w-6 h-6 rounded border border-slate-200"
                        style={{ backgroundColor: preset.config.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {preset.name}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeletePreset(preset.name)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-4">
                  No saved presets. Create a border profile above and save it to access here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
