import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  type: 'STANDARD' | 'PERSONALIZED'
  frameOptionId?: string
  frameOptionName?: string
  size?: string
  material?: string
  customizationData?: any
  previewImage?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
  getStandardItems: () => CartItem[]
  getPersonalizedItems: () => CartItem[]
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex(
          (i) => i.productId === item.productId && 
                 i.frameOptionId === item.frameOptionId && 
                 i.size === item.size && 
                 i.material === item.material
        )
        
        if (existingIndex >= 0) {
          const newItems = [...state.items]
          newItems[existingIndex].quantity += item.quantity
          return { items: newItems }
        }
        
        return { 
          items: [...state.items, { ...item, id: crypto.randomUUID() }] 
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => get().items.reduce(
        (total, item) => total + item.price * item.quantity, 0
      ),
      
      getItemCount: () => get().items.reduce(
        (count, item) => count + item.quantity, 0
      ),
      
      getStandardItems: () => get().items.filter((item) => item.type === 'STANDARD'),
      
      getPersonalizedItems: () => get().items.filter((item) => item.type === 'PERSONALIZED'),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)