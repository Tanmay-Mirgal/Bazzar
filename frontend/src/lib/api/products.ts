import { ProductFilterParams } from '@/types/product';
import { apiFetch, apiFetchNoBody } from './client';

// Backend product response shape
export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: { id: number; name: string };
}

// Normalized frontend product shape
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  categoryId: number;
  image: string;
  rating?: number;
  featured?: boolean;
}

function normalize(p: BackendProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    category: p.category?.name ?? '',
    categoryId: p.category?.id ?? 0,
    image: p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.8,
    featured: false,
  };
}

export async function getProducts(params?: ProductFilterParams): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category && params.category.toLowerCase() !== 'all')
    query.set('category', params.category);

  const qs = query.toString();
  const raw = await apiFetch<BackendProduct[]>(`/products${qs ? `?${qs}` : ''}`);
  let result = raw.map(normalize);

  // Client-side filtering for price/sort (not in backend)
  if (params?.minPrice !== undefined)
    result = result.filter((p) => p.price >= params.minPrice!);
  if (params?.maxPrice !== undefined)
    result = result.filter((p) => p.price <= params.maxPrice!);

  if (params?.sortBy) {
    switch (params.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }

  return result;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const raw = await apiFetch<BackendProduct>(`/products/${id}`);
    return normalize(raw);
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  // Featured = first 8 products (newest seeded ones)
  return all.slice(0, 8);
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  categoryId: number;
}): Promise<Product> {
  const raw = await apiFetch<BackendProduct>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return normalize(raw);
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    image?: string;
    categoryId: number;
  }
): Promise<Product> {
  const raw = await apiFetch<BackendProduct>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return normalize(raw);
}

export async function deleteProduct(id: string): Promise<boolean> {
  await apiFetchNoBody(`/products/${id}`, { method: 'DELETE' });
  return true;
}
