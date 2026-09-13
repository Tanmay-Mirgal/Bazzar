import { apiFetch } from './client';

export interface PlaceOrderRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod?: string;
  items?: Array<{ productId: number; quantity: number }>;
}

export interface BackendOrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: { id: number; name: string };
    description?: string;
  };
  quantity: number;
  price: number;
}

export interface BackendOrder {
  id: number;
  totalAmount: number;
  status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  items: BackendOrderItem[];
  createdAt: string;

  // Payment
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  razorpayOrderId?: string;

  // Logistics & Tracking
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  trackingStatus?: string;

  // Origin & Destination
  pickupAddress?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupPostalCode?: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

export interface TrackingLocation {
  title: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export interface TrackingCheckpoint {
  status: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
  isCurrent: boolean;
}

export interface OrderTrackingData {
  orderId: number;
  status: string;
  trackingStatus: string;
  awbCode: string;
  courierName: string;
  estimatedDelivery: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  origin: TrackingLocation;
  destination: TrackingLocation;
  currentLocation: {
    lat: number;
    lng: number;
    description: string;
    statusText: string;
  };
  routeCoordinates: [number, number][];
  checkpoints: TrackingCheckpoint[];
}

export async function placeOrder(request: PlaceOrderRequest, token?: string | null): Promise<BackendOrder> {
  return apiFetch<BackendOrder>('/orders', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(request),
  });
}

export async function getUserOrders(token?: string | null): Promise<BackendOrder[]> {
  return apiFetch<BackendOrder[]>('/orders', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getAllOrders(token?: string | null): Promise<BackendOrder[]> {
  return apiFetch<BackendOrder[]>('/orders/all', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getOrderById(id: number, token?: string | null): Promise<BackendOrder> {
  return apiFetch<BackendOrder>(`/orders/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getOrderTracking(id: number, token?: string | null): Promise<OrderTrackingData> {
  return apiFetch<OrderTrackingData>(`/orders/${id}/tracking`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function createRazorpayOrder(orderId: number, amount: number, token?: string | null) {
  return apiFetch<{ orderId: string; amount: number; currency: string; keyId: string; receipt: string }>(
    '/payment/razorpay/create-order',
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ orderId, amount }),
    }
  );
}

export async function verifyRazorpayPayment(
  payload: {
    orderId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
  token?: string | null
): Promise<BackendOrder> {
  return apiFetch<BackendOrder>('/payment/razorpay/verify', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}
