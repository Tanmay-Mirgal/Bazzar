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
}

export default function LiveTrackingMap({
  origin,
  destination,
  currentLocation,
  routeCoordinates,
  courierName,
  awbCode,
  trackingStatus,
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
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.lat, currentLocation.lng],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Pure Leaflet OpenStreetMap Tiles (100% Free & Watermark-Free)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Origin Icon (Seller Warehouse)
      const originIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #3F46D8; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(63,70,216,0.4); border: 3px solid white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Custom Destination Icon (Customer Home)
      const destIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #10B981; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.4); border: 3px solid white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Custom Live Courier Truck Icon
      const truckIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative;">
            <div style="position: absolute; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 50%; background: rgba(63,70,216,0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #111111; color: #FFFFFF; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.35); border: 3px solid #FACC15; position: relative; z-index: 10;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
            </div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      // Add Origin Marker
      const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(map);
      originMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <strong style="color: #3F46D8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Pickup Dispatch Facility</strong>
          <div style="font-weight: 800; color: #111; margin-top: 2px;">${origin.title}</div>
          <div style="color: #666; font-size: 11px; margin-top: 2px;">${origin.address}, ${origin.city}</div>
        </div>
      `);

      // Add Destination Marker
      const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <strong style="color: #10B981; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Destination</strong>
          <div style="font-weight: 800; color: #111; margin-top: 2px;">${destination.title}</div>
          <div style="color: #666; font-size: 11px; margin-top: 2px;">${destination.address}, ${destination.city} - ${destination.postalCode}</div>
        </div>
      `);

      // Add Courier Truck Marker (if not delivered)
      if (trackingStatus !== 'DELIVERED') {
        const truckMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: truckIcon, zIndexOffset: 1000 }).addTo(map);
        truckMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <strong style="color: #111; font-size: 11px; text-transform: uppercase;">Live Courier Position</strong>
            <div style="font-weight: 800; color: #3F46D8; margin-top: 2px;">${courierName} (${awbCode})</div>
            <div style="color: #444; font-size: 11px; margin-top: 2px;">${currentLocation.description}</div>
          </div>
        `).openPopup();
      }

      // Draw Polyline Route
      if (routeCoordinates && routeCoordinates.length > 0) {
        // Outer glow polyline
        L.polyline(routeCoordinates, {
          color: '#3F46D8',
          weight: 7,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Core dashed polyline
        L.polyline(routeCoordinates, {
          color: '#3F46D8',
          weight: 3.5,
          dashArray: '8, 8',
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      // Fit bounds to display all points nicely
      const group = L.featureGroup([originMarker, destMarker]);
      map.fitBounds(group.getBounds().pad(0.25));
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, currentLocation, routeCoordinates, courierName, awbCode, trackingStatus]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-[#E8E8E8] shadow-inner bg-[#F4F4F6]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

      {/* Floating Live Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#E8E8E8] shadow-md flex items-center gap-2.5 pointer-events-none">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#3F46D8]">Shiprocket Live Radar</p>
          <p className="text-xs font-extrabold text-[#111111]">{courierName} • {awbCode}</p>
        </div>
      </div>

      {/* Origin vs Destination Floating Footer */}
      <div className="absolute bottom-4 inset-x-4 z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 pointer-events-none">
        <div className="bg-[#111111]/90 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#3F46D8] flex items-center justify-center shrink-0 font-bold text-xs">
            DEP
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Pickup Warehouse</p>
            <p className="text-xs font-bold truncate">{origin.city} ({origin.postalCode})</p>
          </div>
        </div>

        <div className="bg-[#111111]/90 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
            ARR
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Delivery Destination</p>
            <p className="text-xs font-bold truncate">{destination.city} ({destination.postalCode})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
