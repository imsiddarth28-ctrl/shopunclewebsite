import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string // Unique identifier based on product config
  productId: string
  name: string
  price: number
  image: string
  type: 'STANDARD' | 'PERSONALIZED'
  frameOptionId?: string
  frameOptionName?: string
  size?: string
  material?: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: Omit<WishlistItem, 'id'>) => void
  removeItem: (id: string) => void
  hasItem: (productId: string, frameOptionId?: string, size?: string, material?: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const id = `${item.productId}-${item.frameOptionId || ''}-${item.size || ''}-${item.material || ''}`
        
        const exists = state.items.some((i) => i.id === id)
        if (exists) {
          return { items: state.items }
        }
        
        return { 
          items: [...state.items, { ...item, id }] 
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      
      hasItem: (productId, frameOptionId, size, material) => {
        const id = `${productId}-${frameOptionId || ''}-${size || ''}-${material || ''}`
        return get().items.some((item) => item.id === id)
      },
      
      clearWishlist: () => set({ items: [] }),
      
      getItemCount: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
