import { CheckoutFormValues, Order } from '@/types/order';
import { CartItem } from '@/types/cart';
import { simulateNetworkDelay } from './client';

export async function placeOrder(orderData: {
  customerInfo: CheckoutFormValues;
  items: CartItem[];
  totalAmount: number;
}): Promise<Order> {
  await simulateNetworkDelay(800); // Simulate checkout processing

  const newOrder: Order = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    customerInfo: orderData.customerInfo,
    status: 'PROCESSING',
    createdAt: new Date().toISOString(),
  };

  return newOrder;
}
