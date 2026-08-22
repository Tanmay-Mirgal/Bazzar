import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { Product } from '@/types/product';

interface CartState {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.cartItems];
            const currentItem = updatedItems[existingItemIndex];
            const newQuantity = Math.min(
              currentItem.quantity + quantity,
              product.stock
            );

            updatedItems[existingItemIndex] = {
              ...currentItem,
              quantity: newQuantity,
            };

            return { cartItems: updatedItems };
          } else {
            const initialQuantity = Math.min(quantity, product.stock);
            if (initialQuantity <= 0) return state;

            return {
              cartItems: [
                ...state.cartItems,
                { product, quantity: initialQuantity },
              ],
            };
          }
        });
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.product.id !== productId
          ),
        }));
      },

      increaseQuantity: (productId: string) => {
        set((state) => {
          const updatedItems = state.cartItems.map((item) => {
            if (item.product.id === productId) {
              const nextQty = item.quantity + 1;
              if (nextQty <= item.product.stock) {
                return { ...item, quantity: nextQty };
              }
            }
            return item;
          });
          return { cartItems: updatedItems };
        });
      },

      decreaseQuantity: (productId: string) => {
        set((state) => {
          const updatedItems = state.cartItems.map((item) => {
            if (item.product.id === productId) {
              const nextQty = item.quantity - 1;
              if (nextQty >= 1) {
                return { ...item, quantity: nextQty };
              }
            }
            return item;
          });
          return { cartItems: updatedItems };
        });
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      getTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'bazzar-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
