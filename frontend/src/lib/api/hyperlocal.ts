import { apiFetch } from './client';

export type DeliverySpeedTier = 
  | 'FLASH_10_MIN' 
  | 'FAST_20_MIN' 
  | 'STANDARD_45_MIN' 
  | 'NATIONAL_COURIER' 
  | 'UNAVAILABLE';

export interface FulfillmentStoreDTO {
  storeId: number;
  storeName: string;
  distanceKm: number;
  estimatedTimeMins: number;
}

export interface DeliveryEstimateResponse {
  tier: DeliverySpeedTier;
  tierBadgeText: string;
  tierDescription: string;
  estimatedDeliveryMins: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  fulfillmentStore?: FulfillmentStoreDTO;
  deliveryDeadline: string; // ISO LocalDateTime string
  distanceKm: number;
  expansionRingsEvaluated: number;
  basket100PercentFulfilled: boolean;
  unavailableItemIds?: number[];
}

export interface NearbyStoreDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  distanceKm: number;
  estimatedTimeMins: number;
  isQuickDeliveryActive: boolean;
}

export async function fetchDeliveryEstimate(
  lat: number,
  lng: number,
  productIds: number[],
  quantities: number[],
  orderTotal: number
): Promise<DeliveryEstimateResponse> {
  const queryParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    productIds: productIds.join(','),
    quantities: quantities.join(','),
    orderTotal: orderTotal.toString(),
  });

  return apiFetch<DeliveryEstimateResponse>(`/hyperlocal/estimate?${queryParams.toString()}`);
}

export async function fetchNearbyStores(
  lat: number,
  lng: number,
  radiusKm = 10.0
): Promise<NearbyStoreDTO[]> {
  const queryParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
  });

  return apiFetch<NearbyStoreDTO[]>(`/hyperlocal/nearby-stores?${queryParams.toString()}`);
}
