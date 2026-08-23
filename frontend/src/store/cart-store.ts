'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  getBackendCart,
  addCartItemToBackend,
  updateCartItemInBackend,
  removeCartItemFromBackend,
  BackendCartItem,
} from '@/lib/api/cart';

// Normalized frontend CartItem shape
export interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  rating?: number;
  featured?: boolean;
}

export interface CartItem {
  backendItemId?: number;
  product: CartProduct;
  quantity: number;
}

function normalizeBackendCartItem(item: BackendCartItem): CartItem {
  return {
    backendItemId: item.id,
    product: {
      id: String(item.product.id),
      name: item.product.name,
      description: item.product.description,
      price: Number(item.product.price),
      stock: item.product.stock,
      category: item.product.category?.name ?? '',
      image: item.product.image || '',
    },
    quantity: item.quantity,
  };
}

interface CartState {
  cartItems: CartItem[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuthenticated: (auth: boolean) => void;
  syncFromBackend: () => Promise<void>;
  addToCart: (product: CartProduct, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  increaseQuantity: (productId: string) => Promise<void>;
  decreaseQuantity: (productId: string) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isAuthenticated: false,
      isLoading: false,

      setAuthenticated: (auth: boolean) => {
        set({ isAuthenticated: auth });
        if (auth) {
          get().syncFromBackend();
        } else {
          set({ cartItems: [] });
        }
      },

      syncFromBackend: async () => {
        set({ isLoading: true });
        try {
          const cart = await getBackendCart();
          set({ cartItems: cart.items.map(normalizeBackendCartItem), isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addToCart: async (product: CartProduct, quantity = 1) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) {
          // Local-only cart for guests
          set((state) => {
            const idx = state.cartItems.findIndex((i) => i.product.id === product.id);
            if (idx > -1) {
              const items = [...state.cartItems];
              items[idx] = { ...items[idx], quantity: Math.min(items[idx].quantity + quantity, product.stock) };
              return { cartItems: items };
            }
            return { cartItems: [...state.cartItems, { product, quantity: Math.min(quantity, product.stock) }] };
          });
          return;
        }

        try {
          const cart = await addCartItemToBackend(product.id, quantity);
          set({ cartItems: cart.items.map(normalizeBackendCartItem) });
        } catch (e) {
          console.error('Failed to add to cart:', e);
        }
      },

      removeFromCart: async (productId: string) => {
        const { isAuthenticated, cartItems } = get();
        if (!isAuthenticated) {
          set({ cartItems: cartItems.filter((i) => i.product.id !== productId) });
          return;
        }
        const item = cartItems.find((i) => i.product.id === productId);
        if (!item?.backendItemId) return;
        try {
          const cart = await removeCartItemFromBackend(item.backendItemId);
          set({ cartItems: cart.items.map(normalizeBackendCartItem) });
        } catch (e) {
          console.error('Failed to remove from cart:', e);
        }
      },

      increaseQuantity: async (productId: string) => {
        const { isAuthenticated, cartItems } = get();
        const item = cartItems.find((i) => i.product.id === productId);
        if (!item) return;
        const newQty = item.quantity + 1;
        if (newQty > item.product.stock) return;

        if (!isAuthenticated) {
          set({ cartItems: cartItems.map((i) => i.product.id === productId ? { ...i, quantity: newQty } : i) });
          return;
        }
        if (!item.backendItemId) return;
        try {
          const cart = await updateCartItemInBackend(item.backendItemId, newQty);
          set({ cartItems: cart.items.map(normalizeBackendCartItem) });
        } catch (e) {
          console.error('Failed to increase quantity:', e);
        }
      },

      decreaseQuantity: async (productId: string) => {
        const { isAuthenticated, cartItems } = get();
        const item = cartItems.find((i) => i.product.id === productId);
        if (!item || item.quantity <= 1) return;
        const newQty = item.quantity - 1;

        if (!isAuthenticated) {
          set({ cartItems: cartItems.map((i) => i.product.id === productId ? { ...i, quantity: newQty } : i) });
          return;
        }
        if (!item.backendItemId) return;
        try {
          const cart = await updateCartItemInBackend(item.backendItemId, newQty);
          set({ cartItems: cart.items.map(normalizeBackendCartItem) });
        } catch (e) {
          console.error('Failed to decrease quantity:', e);
        }
      },

      clearCart: () => set({ cartItems: [] }),

      getTotalItems: () => get().cartItems.reduce((acc, item) => acc + item.quantity, 0),
      getTotalPrice: () =>
        get().cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    }),
    {
      name: 'bazzar-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
