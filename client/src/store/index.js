import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    const existing = state.items.find(
      (i) => i.product._id === item.product._id && i.size === item.size
    );
    
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.product._id === item.product._id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      };
    }
    
    return { items: [...state.items, item] };
  }),
  
  updateQuantity: (itemId, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    ),
  })),
  
  removeItem: (itemId) => set((state) => ({
    items: state.items.filter((item) => item._id !== itemId),
  })),
  
  clearCart: () => set({ items: [] }),
  
  setItems: (items) => set({ items }),
  
  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const sizePrice = item.product.sizes.find((s) => s.name === item.size)?.price || 
                       item.product.basePrice;
      return total + sizePrice * item.quantity;
    }, 0);
  },
  
  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));
