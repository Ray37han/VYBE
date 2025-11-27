import { create } from 'zustand'

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem('vybe_cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const useCartStore = create((set, get) => ({
  items: loadFromStorage(),
  
  addItem(item) {
    const items = [...get().items, item]
    set({ items })
    localStorage.setItem('vybe_cart', JSON.stringify(items))
  },
  
  updateQuantity(index, quantity) {
    const items = get().items.map((item, i) => 
      i === index ? { ...item, quantity } : item
    )
    set({ items })
    localStorage.setItem('vybe_cart', JSON.stringify(items))
  },
  
  removeItem(index) {
    const items = get().items.filter((_, i) => i !== index)
    set({ items })
    localStorage.setItem('vybe_cart', JSON.stringify(items))
  },
  
  clear() {
    set({ items: [] })
    localStorage.setItem('vybe_cart', JSON.stringify([]))
  }
}))
