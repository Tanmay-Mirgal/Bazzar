import { apiFetch } from './client';

export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}
