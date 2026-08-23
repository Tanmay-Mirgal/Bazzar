import { apiFetch } from './client';

export interface PlaceOrderRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface BackendOrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    stock: number;
    category: { id: number; name: string };
    description: string;
  };
  quantity: number;
  price: number;
}

export interface BackendOrder {
  id: number;
  totalAmount: number;
  status: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  items: BackendOrderItem[];
  createdAt: string;
}

export async function placeOrder(request: PlaceOrderRequest): Promise<BackendOrder> {
  return apiFetch<BackendOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getUserOrders(): Promise<BackendOrder[]> {
  return apiFetch<BackendOrder[]>('/orders');
}

export async function getAllOrders(): Promise<BackendOrder[]> {
  return apiFetch<BackendOrder[]>('/orders/all');
}

export async function getOrderById(id: number): Promise<BackendOrder> {
  return apiFetch<BackendOrder>(`/orders/${id}`);
}
