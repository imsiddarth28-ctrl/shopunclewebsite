export interface CustomBorderConfig {
  width: number
  color: string
  style: 'solid' | 'double' | 'groove' | 'ridge' | 'dashed' | 'dotted' | 'inset' | 'outset'
  cornerRadius: number
  shadowDepth: number
  innerShadow: boolean
  outerShadow: boolean
  glassReflection: boolean
  matBorder: boolean
  matColor: string
  matWidth: number
  finish: 'matte' | 'gloss' | 'satin' | 'metallic' | 'wooden' | 'marble' | 'stone' | 'leather' | 'carbon-fiber'
  texture: 'plain' | 'oak' | 'walnut' | 'pine' | 'teak' | 'mahogany' | 'gold-metal' | 'silver-metal' | 'bronze'
  textureOpacity: number
  bevelDepth: number
  highlightStrength: number
  pattern: 'plain' | 'floral' | 'royal' | 'vintage' | 'geometric' | 'carved' | 'leaf' | 'rope' | 'diamond'
}

export interface PremadeTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  price: number
  sizes: string[]
  frameImage?: string // PNG overlay url
  borderConfig?: Partial<CustomBorderConfig> // Procedural fallback properties
}

export const DEFAULT_BORDER_CONFIG: CustomBorderConfig = {
  width: 30,
  color: '#4A2E1B',
  style: 'solid',
  cornerRadius: 0,
  shadowDepth: 15,
  innerShadow: true,
  outerShadow: true,
  glassReflection: false,
  matBorder: false,
  matColor: '#F5F5DC',
  matWidth: 20,
  finish: 'matte',
  texture: 'walnut',
  textureOpacity: 0.6,
  bevelDepth: 4,
  highlightStrength: 0.5,
  pattern: 'plain'
}

export const CATEGORIES = [
  'All',
  'Classic Wood',
  'Modern',
  'Luxury Gold',
  'Vintage',
  'Rustic',
  'Minimal',
  'Black Matte',
  'White',
  'Floral',
  'Wedding',
  'Baby',
  'Festival',
  'Abstract',
  'Traditional Indian',
  'Premium Collection'
] as const

export const DEFAULT_PREMADE_TEMPLATES: PremadeTemplate[] = [
  {
    id: 'flower-border-01',
    name: 'Flower Border',
    category: 'Floral',
    price: 1099,
    thumbnail: '/frames/flowerborder.png',
    frameImage: '/frames/flowerborder.png',
    sizes: ['8x10', '10x12', '12x16', 'A4', 'A3']
  },
  {
    id: 'black-minimalist-border-01',
    name: 'Black Minimalist',
    category: 'Minimal',
    price: 799,
    thumbnail: '/frames/blackminimalistic.png',
    frameImage: '/frames/blackminimalistic.png',
    sizes: ['8x10', '10x12', '12x16', 'A4', 'A3']
  },
  {
    id: 'simple-border-01',
    name: 'Simple Border',
    category: 'Minimal',
    price: 699,
    thumbnail: '/frames/simpleborder.png',
    frameImage: '/frames/simpleborder.png',
    sizes: ['8x10', '10x12', '12x16', 'A4', 'A3']
  }
]
