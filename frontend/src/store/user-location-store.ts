'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string;
  locationName: string;
  pincode: string;
  isLocating: boolean;
  isPermissionDenied: boolean;
  
  setLocation: (lat: number, lng: number, address: string, name: string, pincode?: string) => void;
  detectCurrentLocation: () => Promise<void>;
  resetLocation: () => void;
}

// Default location (Connaught Place / Metro City default for ready testing)
const DEFAULT_LAT = 19.0760;
const DEFAULT_LNG = 72.8777;
const DEFAULT_ADDRESS = 'Bandra Kurla Complex, Mumbai, Maharashtra';
const DEFAULT_NAME = 'BKC, Mumbai';
const DEFAULT_PINCODE = '400051';

export const useUserLocationStore = create<UserLocationState>()(
  persist(
    (set) => ({
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      formattedAddress: DEFAULT_ADDRESS,
      locationName: DEFAULT_NAME,
      pincode: DEFAULT_PINCODE,
      isLocating: false,
      isPermissionDenied: false,

      setLocation: (lat, lng, address, name, pincode = '') => {
        set({
          latitude: lat,
          longitude: lng,
          formattedAddress: address,
          locationName: name,
          pincode: pincode,
          isPermissionDenied: false,
        });
      },

      detectCurrentLocation: async () => {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser.');
          return;
        }

        set({ isLocating: true, isPermissionDenied: false });

        return new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              
              let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              let name = 'Current Location';
              let pincode = '';

              try {
                // Reverse geocoding via OpenStreetMap Nominatim
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                if (res.ok) {
                  const data = await res.json();
                  address = data.display_name || address;
                  name = data.address?.suburb || data.address?.city || data.address?.town || 'Current Location';
                  pincode = data.address?.postcode || '';
                }
              } catch (e) {
                console.warn('Reverse geocoding failed:', e);
              }

              set({
                latitude: lat,
                longitude: lng,
                formattedAddress: address,
                locationName: name,
                pincode: pincode,
                isLocating: false,
                isPermissionDenied: false,
              });
              resolve();
            },
            (error) => {
              console.warn('Geolocation error:', error);
              set({ isLocating: false, isPermissionDenied: true });
              resolve();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        });
      },

      resetLocation: () => {
        set({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          formattedAddress: DEFAULT_ADDRESS,
          locationName: DEFAULT_NAME,
          pincode: DEFAULT_PINCODE,
          isLocating: false,
          isPermissionDenied: false,
        });
      },
    }),
    {
      name: 'bazzar-user-location-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
