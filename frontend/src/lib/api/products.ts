import { ProductFilterParams, PaginatedProductsResponse, Product } from '@/types/product';
import { apiFetch, apiFetchNoBody } from './client';

export type { Product };

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

export interface BackendPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
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

export async function getProducts(params?: ProductFilterParams): Promise<PaginatedProductsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category && params.category.toLowerCase() !== 'all')
    query.set('category', params.category);

  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.size !== undefined) query.set('size', String(params.size));
  if (params?.sortDir) query.set('sortDir', params.sortDir);

  const qs = query.toString();
  const raw = await apiFetch<BackendPageResponse<BackendProduct>>(`/products${qs ? `?${qs}` : ''}`);

  let items = (raw.content || []).map(normalize);

  // Client-side filtering for price/sort (if client specified)
  if (params?.minPrice !== undefined)
    items = items.filter((p) => p.price >= params.minPrice!);
  if (params?.maxPrice !== undefined)
    items = items.filter((p) => p.price <= params.maxPrice!);

  if (params?.sortBy) {
    switch (params.sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }

  return {
    content: items,
    pageNumber: raw.pageNumber ?? 0,
    pageSize: raw.pageSize ?? 12,
    totalElements: raw.totalElements ?? items.length,
    totalPages: raw.totalPages ?? 1,
    first: raw.first ?? true,
    last: raw.last ?? true,
  };
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
  const res = await getProducts({ page: 0, size: 8 });
  return res.content;
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
