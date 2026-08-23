import { apiFetch, apiFetchNoBody } from './client';
import { BackendProduct } from './products';

export interface BackendCartItem {
  id: number;
  product: BackendProduct;
  quantity: number;
}

export interface BackendCart {
  id: number;
  items: BackendCartItem[];
  totalItems: number;
  totalPrice: number;
}

export async function getBackendCart(): Promise<BackendCart> {
  return apiFetch<BackendCart>('/cart');
}

export async function addCartItemToBackend(productId: string, quantity: number): Promise<BackendCart> {
  return apiFetch<BackendCart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId: Number(productId), quantity }),
  });
}

export async function updateCartItemInBackend(itemId: number, quantity: number): Promise<BackendCart> {
  return apiFetch<BackendCart>(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ productId: 0, quantity }), // productId ignored in update
  });
}

export async function removeCartItemFromBackend(itemId: number): Promise<BackendCart> {
  return apiFetch<BackendCart>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}
