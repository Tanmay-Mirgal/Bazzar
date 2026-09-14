'use client';

import React, { useEffect, useRef } from 'react';
import { TrackingLocation } from '@/lib/api/orders';

interface LiveTrackingMapProps {
  origin: TrackingLocation;
  destination: TrackingLocation;
  currentLocation: {
    lat: number;
    lng: number;
    description: string;
    statusText: string;
  };
  routeCoordinates: [number, number][];
  courierName: string;
  awbCode: string;
  trackingStatus: string;
  estimatedDelivery?: string;
}

// Precise locality coordinate dictionary
const KNOWN_LOCALITY_COORDINATES: Record<string, [number, number]> = {
  '400022': [19.0531, 72.8752], // Sion / Chunabhatti
  'chunabhatti': [19.0531, 72.8752],
  'sion': [19.0434, 72.8634],
  '400015': [18.9995, 72.8546], // Sewri
  'sewri': [18.9995, 72.8546],
  '400051': [19.0674, 72.8687], // BKC
  'bkc': [19.0674, 72.8687],
  '400050': [19.0596, 72.8295], // Bandra
  'bandra': [19.0596, 72.8295],
  '400014': [19.0178, 72.8478], // Dadar
  'dadar': [19.0178, 72.8478],
  '400069': [19.1136, 72.8697], // Andheri
  'andheri': [19.1136, 72.8697],
  'bhiwandi': [19.2968, 73.0631], // Central Warehouse
  '421302': [19.2968, 73.0631],
  'panvel': [18.9894, 73.1175],
  'navi mumbai': [19.0330, 73.0297],
  'vashi': [19.0771, 72.9986],
  'thane': [19.2183, 72.9781],
};

function resolveLocalityCoord(addressText: string, fallback: [number, number]): [number, number] {
  if (!addressText) return fallback;
  const lower = addressText.toLowerCase();
  for (const [key, coord] of Object.entries(KNOWN_LOCALITY_COORDINATES)) {
    if (lower.includes(key)) {
      return coord;
    }
  }
  return fallback;
}

export default function LiveTrackingMap({
  origin,
  destination,
  currentLocation,
  routeCoordinates,
  courierName,
  awbCode,
  trackingStatus,
  estimatedDelivery,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamic import of Leaflet on client
    import('leaflet').then(async (L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // 1. Resolve exact coordinates based on address keywords/pincode
      let destCoord: [number, number] = resolveLocalityCoord(
        `${destination.address} ${destination.city} ${destination.postalCode}`,
        [destination.lat || 19.0531, destination.lng || 72.8752]
      );

      let originCoord: [number, number] = resolveLocalityCoord(
        `${origin.address} ${origin.city} ${origin.postalCode}`,
        [origin.lat || 19.2968, origin.lng || 73.0631]
      );

      // Prevent overlapping origin and destination (ensure warehouse is outside the city)
      const dist = Math.hypot(originCoord[0] - destCoord[0], originCoord[1] - destCoord[1]);
      if (dist < 0.04) {
        originCoord = [19.2968, 73.0631]; // Central Logistics Hub Bhiwandi
      }

      const map = L.map(mapContainerRef.current, {
        center: [(originCoord[0] + destCoord[0]) / 2, (originCoord[1] + destCoord[1]) / 2],
        zoom: 11,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Pure Leaflet OpenStreetMap Tiles (Clean, crisp, detailed street map)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Origin Icon (Green Circle with Delivery Truck)
      const originIcon = L.divIcon({
        className: 'custom-origin-marker',
        html: `
          <div style="background-color: #10B981; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.45); border: 2.5px solid white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Custom Destination Icon (Red Circle with Home Icon & ETA Tooltip badge)
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: #111111; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.35); margin-bottom: 6px; font-family: inherit;">
              ETA: ${estimatedDelivery || 'Wednesday, Sep 16'}
            </div>
            <div style="background-color: #DC2626; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.45); border: 2.5px solid white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
        `,
        iconSize: [140, 70],
        iconAnchor: [70, 60],
      });

      // Add Origin Marker
      const originMarker = L.marker([originCoord[0], originCoord[1]], { icon: originIcon }).addTo(map);
      originMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <strong style="color: #10B981; font-size: 11px; text-transform: uppercase;">Origin Hub</strong>
          <div style="font-weight: 700; color: #111; margin-top: 2px;">Bazzar Central Logistics Hub</div>
          <div style="color: #666; font-size: 11px;">Fulfillment Center, Bhiwandi Highway Corridor</div>
        </div>
      `);

      // Add Destination Marker
      const destMarker = L.marker([destCoord[0], destCoord[1]], { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <strong style="color: #DC2626; font-size: 11px; text-transform: uppercase;">Delivery Address</strong>
          <div style="font-weight: 700; color: #111; margin-top: 2px;">${destination.title}</div>
          <div style="color: #666; font-size: 11px;">${destination.address}, ${destination.city} - ${destination.postalCode}</div>
        </div>
      `);

      // Fetch accurate turn-by-turn road navigation from OSRM
      let finalRoutePoints: [number, number][] = [];
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoord[1]},${originCoord[0]};${destCoord[1]},${destCoord[0]}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0 && data.routes[0].geometry?.coordinates) {
            // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
            finalRoutePoints = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          }
        }
      } catch (err) {
        console.warn('OSRM road route fetch failed', err);
      }

      // Fallback interpolation if OSRM unavailable
      if (finalRoutePoints.length === 0) {
        finalRoutePoints = [
          [originCoord[0], originCoord[1]],
          [(originCoord[0] + destCoord[0]) / 2 + 0.02, (originCoord[1] + destCoord[1]) / 2 + 0.01],
          [destCoord[0], destCoord[1]]
        ];
      }

      if (finalRoutePoints.length > 0) {
        // Outer soft glow line
        L.polyline(finalRoutePoints, {
          color: '#3B82F6',
          weight: 7,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Core sharp driving road route polyline
        L.polyline(finalRoutePoints, {
          color: '#2563EB',
          weight: 4.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      // Fit bounds nicely to display both origin and destination markers and the road route
      const group = L.featureGroup([originMarker, destMarker]);
      map.fitBounds(group.getBounds(), {
        padding: [60, 60],
        maxZoom: 13,
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, currentLocation, routeCoordinates, courierName, awbCode, trackingStatus, estimatedDelivery]);

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-[#E8E8E8] bg-[#F4F4F6]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating "Live Tracking" Pill in Top-Right corner */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-2 pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-gray-800">Live Tracking</span>
      </div>
    </div>
  );
}
