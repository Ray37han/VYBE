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

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        console.log('=== CART STORE addItem ===');
        console.log('Adding item:', JSON.stringify(item, null, 2));
        console.log('Item has customization?', !!item.customization);
        console.log('Customization data:', item.customization);
        
        // Generate unique ID if not present
        const itemWithId = {
          ...item,
          _id: item._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        console.log('Item with ID:', itemWithId._id);
        
        // For customized items, always add as new item (don't merge)
        if (item.customization) {
          console.log('Item has customization - adding as new item');
          return { items: [...state.items, itemWithId] };
        }
        
        const existing = state.items.find(
          (i) => i.product._id === item.product._id && i.size === item.size && !i.customization
        );
        
        if (existing) {
          console.log('Found existing non-custom item - updating quantity');
          return {
            items: state.items.map((i) =>
              i.product._id === item.product._id && i.size === item.size && !i.customization
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        
        console.log('Adding as new item');
        return { items: [...state.items, itemWithId] };
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
    }),
    {
      name: 'cart-storage',
    }
  )
);
