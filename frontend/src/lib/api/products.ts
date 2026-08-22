import { Product, ProductFilterParams } from '@/types/product';
import { MOCK_PRODUCTS } from '@/data/mock-data';
import { simulateNetworkDelay } from './client';

export async function getProducts(params?: ProductFilterParams): Promise<Product[]> {
  await simulateNetworkDelay(400);

  let result = [...MOCK_PRODUCTS];

  if (params?.category && params.category.toLowerCase() !== 'all') {
    result = result.filter(
      (p) => p.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  if (params?.search && params.search.trim() !== '') {
    const query = params.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  if (params?.minPrice !== undefined) {
    result = result.filter((p) => p.price >= params.minPrice!);
  }

  if (params?.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= params.maxPrice!);
  }

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
      case 'newest':
      default:
        break;
    }
  }

  return result;
}

export async function getProductById(id: string): Promise<Product | null> {
  await simulateNetworkDelay(300);
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  return product || null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await simulateNetworkDelay(350);
  return MOCK_PRODUCTS.filter((p) => p.featured);
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  categoryId: number;
}): Promise<Product> {
  await simulateNetworkDelay(500);

  const categoryMap: Record<number, string> = {
    1: 'Electronics',
    2: 'Clothing',
    3: 'Books',
    4: 'Accessories',
  };

  const newProduct: Product = {
    id: String(Date.now()),
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    image: data.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: categoryMap[data.categoryId] || 'General',
    rating: 4.8,
    featured: true,
  };

  MOCK_PRODUCTS.unshift(newProduct);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await simulateNetworkDelay(300);
  const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
  if (index > -1) {
    MOCK_PRODUCTS.splice(index, 1);
    return true;
  }
  return false;
}
