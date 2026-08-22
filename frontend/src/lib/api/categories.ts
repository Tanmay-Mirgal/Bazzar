import { Category } from '@/types/category';
import { MOCK_CATEGORIES } from '@/data/mock-data';
import { simulateNetworkDelay } from './client';

export async function getCategories(): Promise<Category[]> {
  await simulateNetworkDelay(250);
  return MOCK_CATEGORIES;
}
