import { apiFetch } from './client';
import { BackendProduct } from './products';

export async function getWishlist(): Promise<BackendProduct[]> {
  return apiFetch<BackendProduct[]>('/wishlist');
}

export async function addToWishlist(productId: string): Promise<BackendProduct[]> {
  return apiFetch<BackendProduct[]>(`/wishlist/${productId}`, { method: 'POST' });
}

export async function removeFromWishlist(productId: string): Promise<BackendProduct[]> {
  return apiFetch<BackendProduct[]>(`/wishlist/${productId}`, { method: 'DELETE' });
}

export async function checkWishlist(productId: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ inWishlist: boolean }>(`/wishlist/${productId}/check`);
    return res.inWishlist;
  } catch {
    return false;
  }
}
