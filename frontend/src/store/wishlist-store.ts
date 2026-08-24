'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/lib/api/wishlist';
import { getCurrentUser } from '@/lib/api/auth';
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
        const user = getCurrentUser();
        if (!user) return;
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
          set({ wishlistItems: items, isAuthenticated: true });
        } catch {
          // network or auth error
        }
      },

      toggleWishlist: async (product: CartProduct) => {
        const { wishlistItems } = get();
        const user = getCurrentUser();
        const exists = wishlistItems.some((i) => String(i.product.id) === String(product.id));

        // 1. Optimistic Update (Immediate UI response)
        if (exists) {
          set({ wishlistItems: wishlistItems.filter((i) => String(i.product.id) !== String(product.id)) });
        } else {
          set({ wishlistItems: [...wishlistItems, { product }] });
        }

        // 2. Backend Async Sync if logged in
        if (user) {
          try {
            if (exists) {
              await removeFromWishlist(product.id);
            } else {
              await addToWishlist(product.id);
            }
          } catch (err) {
            console.error('Failed to sync wishlist with backend:', err);
            // Revert state on failure
            if (exists) {
              set({ wishlistItems: [...get().wishlistItems, { product }] });
            } else {
              set({
                wishlistItems: get().wishlistItems.filter((i) => String(i.product.id) !== String(product.id)),
              });
            }
          }
        }
      },

      isInWishlist: (productId: string) =>
        get().wishlistItems.some((i) => String(i.product.id) === String(productId)),

      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: 'bazzar-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlistItems: state.wishlistItems }),
    }
  )
);
