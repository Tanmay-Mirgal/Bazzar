'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/lib/api/wishlist';
import { CartProduct } from './cart-store';

export interface WishlistItem {
  product: CartProduct;
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  isAuthenticated: boolean;

  setAuthenticated: (auth: boolean) => void;
  syncFromBackend: () => Promise<void>;
  toggleWishlist: (product: CartProduct) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      isAuthenticated: false,

      setAuthenticated: (auth: boolean) => {
        set({ isAuthenticated: auth });
        if (auth) get().syncFromBackend();
        else set({ wishlistItems: [] });
      },

      syncFromBackend: async () => {
        try {
          const raw = await getWishlist();
          const items: WishlistItem[] = raw.map((p) => ({
            product: {
              id: String(p.id),
              name: p.name,
              description: p.description,
              price: Number(p.price),
              stock: p.stock,
              category: p.category?.name ?? '',
              image: p.image || '',
            },
          }));
          set({ wishlistItems: items });
        } catch {
          // not authenticated or network error — ok
        }
      },

      toggleWishlist: async (product: CartProduct) => {
        const { isAuthenticated, wishlistItems, isInWishlist } = get();

        if (!isAuthenticated) {
          // Guest: local-only wishlist
          if (isInWishlist(product.id)) {
            set({ wishlistItems: wishlistItems.filter((i) => i.product.id !== product.id) });
          } else {
            set({ wishlistItems: [...wishlistItems, { product }] });
          }
          return;
        }

        try {
          if (isInWishlist(product.id)) {
            const raw = await removeFromWishlist(product.id);
            const items: WishlistItem[] = raw.map((p) => ({
              product: {
                id: String(p.id),
                name: p.name,
                description: p.description,
                price: Number(p.price),
                stock: p.stock,
                category: p.category?.name ?? '',
                image: p.image || '',
              },
            }));
            set({ wishlistItems: items });
          } else {
            const raw = await addToWishlist(product.id);
            const items: WishlistItem[] = raw.map((p) => ({
              product: {
                id: String(p.id),
                name: p.name,
                description: p.description,
                price: Number(p.price),
                stock: p.stock,
                category: p.category?.name ?? '',
                image: p.image || '',
              },
            }));
            set({ wishlistItems: items });
          }
        } catch (e) {
          console.error('Wishlist error:', e);
        }
      },

      isInWishlist: (productId: string) =>
        get().wishlistItems.some((i) => i.product.id === productId),

      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: 'bazzar-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlistItems: state.wishlistItems }),
    }
  )
);
