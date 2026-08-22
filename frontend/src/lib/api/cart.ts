import { Cart, CartItem } from '@/types/cart';
import { simulateNetworkDelay } from './client';

export async function getCart(): Promise<Cart> {
  await simulateNetworkDelay(200);
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };
}

export async function addCartItem(productId: string, quantity: number): Promise<{ success: boolean }> {
  await simulateNetworkDelay(250);
  return { success: true };
}

export async function updateCartItem(productId: string, quantity: number): Promise<{ success: boolean }> {
  await simulateNetworkDelay(200);
  return { success: true };
}

export async function removeCartItem(productId: string): Promise<{ success: boolean }> {
  await simulateNetworkDelay(200);
  return { success: true };
}
