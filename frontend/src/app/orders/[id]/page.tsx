'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  getOrderTracking,
  getOrderById,
  BackendOrder,
  OrderTrackingData,
} from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Home,
  Phone,
  ArrowLeft,
  RefreshCw,
  Box,
  Navigation,
  Check,
} from 'lucide-react';
import { HyperlocalRadarCard } from '@/components/tracking/hyperlocal-radar-card';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamically import Leaflet Map to avoid SSR issues
const LiveTrackingMap = dynamic(
  () => import('@/components/tracking/live-tracking-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] bg-[#F4F4F6] rounded-2xl animate-pulse flex items-center justify-center text-xs text-gray-500 font-medium">
        Loading Interactive Live Tracking Map...
      </div>
    ),
  }
);

interface TrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: TrackingPageProps) {
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id, 10);

  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const router = useRouter();

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [tracking, setTracking] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrackingData = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 400));
        token = await getApiToken();
      }

      const [orderRes, trackingRes] = await Promise.all([
        getOrderById(orderId, token),
        getOrderTracking(orderId, token),
      ]);
      setOrder(orderRes);
      setTracking(trackingRes);
    } catch (err: any) {
      console.error('Failed to load tracking data:', err);
      toast.error('Could not load order tracking details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchTrackingData();
      } else {
        router.push('/sign-in');
      }
    }
  }, [userLoaded, user, orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-6">
        <div className="h-28 w-full bg-gray-100 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-[460px] bg-gray-100 animate-pulse rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
            <div className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
            <div className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order || !tracking) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <Package className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Order Not Found</h1>
          <p className="text-xs text-gray-500">
            We could not locate shipment tracking records for order #{orderId}.
          </p>
        </div>
        <Link href="/products">
          <Button className="rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold px-6 h-10">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  // Define 8 status steps mapping
  const trackingStatusKey = (tracking.trackingStatus || order.status || 'PLACED').toUpperCase();

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 0;
      case 'CONFIRMED':
      case 'MANIFESTED':
        return 1;
      case 'PACKED':
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
      case 'PICKED_UP':
        return 3;
      case 'IN_TRANSIT':
        return 4;
      case 'ARRIVED_AT_HUB':
        return 5;
      case 'OUT_FOR_DELIVERY':
        return 6;
      case 'DELIVERED':
        return 7;
      default:
        return 1;
    }
  };

  const currentStepIndex = getStatusStepIndex(trackingStatusKey);

  const steps = [
    { label: 'Order Placed', icon: ShoppingBag },
    { label: 'Order Confirmed', icon: Box },
    { label: 'Packed', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'In Transit', icon: Navigation },
    { label: 'Arrived at Hub', icon: MapPin },
    { label: 'Out for Delivery', icon: Truck },
    { label: 'Delivered', icon: Check },
  ];

  // Format readable status text
  const formatStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'SHIPPED':
        return 'Shipped';
      case 'CONFIRMED':
      case 'MANIFESTED':
        return 'Order Confirmed';
      case 'PACKED':
        return 'Packed';
      case 'DELIVERED':
        return 'Delivered';
      case 'PLACED':
        return 'Order Placed';
      default:
        return status;
    }
  };

  return (
    <div className="bg-[#FBFBFB] min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Orders
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchTrackingData(true)}
            disabled={refreshing}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 gap-1.5 h-8 px-2.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Radar'}
          </Button>
        </div>

        {/* Hyperlocal Concentric Ring Radar Card */}
        <HyperlocalRadarCard order={order} />

        {/* 1. TOP HORIZONTAL STEPPER CARD: "Order Status" */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-8">Order Status</h2>

          <div className="relative">
            {/* Step Items */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-y-6 gap-x-2 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const IconComponent = step.icon;

                return (
                  <div key={step.label} className="flex flex-col items-center text-center relative group">
                    {/* Connecting line to previous step (desktop) */}
                    {index > 0 && (
                      <div
                        className={`hidden sm:block absolute top-5 -left-1/2 w-full h-[2px] -z-10 ${
                          index <= currentStepIndex ? 'bg-[#10B981]' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Step Icon Circle */}
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#10B981] text-white shadow-sm ring-4 ring-emerald-50'
                          : 'bg-[#F3F4F6] text-gray-400 border border-gray-200'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Step Label */}
                    <span
                      className={`text-[11px] mt-2.5 font-medium max-w-[90px] leading-tight ${
                        isCompleted ? 'text-gray-900 font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Live Tracking Map (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Live Tracking</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Updates
              </span>
            </div>

            <LiveTrackingMap
              origin={tracking.origin}
              destination={tracking.destination}
              currentLocation={tracking.currentLocation}
              routeCoordinates={tracking.routeCoordinates}
              courierName={tracking.courierName}
              awbCode={tracking.awbCode}
              trackingStatus={tracking.trackingStatus}
              estimatedDelivery={tracking.estimatedDelivery}
            />
          </div>

          {/* RIGHT COLUMN: 3 Stacked Information Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* CARD 1: Delivery Address */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Delivery Address</h3>

              <div className="flex items-start gap-3.5 pt-1">
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-gray-900">Home</p>
                  <p className="font-semibold text-gray-800">{order.fullName}</p>
                  <p className="text-gray-600 leading-relaxed">
                    {order.address}, {order.city}
                  </p>
                  <p className="text-gray-600">PIN: {order.postalCode}</p>
                  <p className="text-gray-700 font-medium pt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-gray-400" />
                    {order.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: Shiprocket Shipment */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Shiprocket Shipment</h3>

              <div className="space-y-2 text-xs divide-y divide-gray-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-500">Current Status:</span>
                  <span className="font-semibold text-gray-900">
                    {formatStatusText(tracking.trackingStatus)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500">Current Location:</span>
                  <span className="font-semibold text-gray-900">
                    {tracking.currentLocation?.description?.includes('in')
                      ? tracking.currentLocation.description.split('in')[1]?.trim() || tracking.origin.city
                      : `${order.city || 'Mumbai'}`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500">ETA:</span>
                  <span className="font-semibold text-gray-900">{tracking.estimatedDelivery}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500">Shipment ID:</span>
                  <span className="font-mono font-medium text-gray-900">{order.shipmentId || `1277691${order.id}`}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500">AWB:</span>
                  <span className="font-mono font-medium text-gray-900">{tracking.awbCode}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500">Courier:</span>
                  <span className="font-semibold text-gray-900">{tracking.courierName}</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Updates (Vertical Timeline) */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Updates</h3>

              <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                {tracking.checkpoints && tracking.checkpoints.length > 0 ? (
                  tracking.checkpoints
                    .slice()
                    .reverse()
                    .map((cp, idx) => {
                      return (
                        <div key={idx} className="relative flex items-start gap-3">
                          {/* Green bullet dot */}
                          <div className="absolute -left-5 mt-1 h-3 w-3 rounded-full bg-[#10B981] ring-4 ring-emerald-50 shrink-0" />

                          <div className="space-y-0.5 text-xs">
                            <span className="text-[11px] text-gray-400 font-medium">
                              {cp.timestamp}
                            </span>
                            <p className="font-bold text-gray-900">{cp.title}</p>
                            <p className="text-gray-600 text-[11px]">{cp.description}</p>
                            <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5">
                              <MapPin className="h-3 w-3" />
                              {cp.location}
                            </p>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-5 mt-1 h-3 w-3 rounded-full bg-[#10B981] ring-4 ring-emerald-50 shrink-0" />
                    <div className="space-y-0.5 text-xs">
                      <span className="text-[11px] text-gray-400 font-medium">Just now</span>
                      <p className="font-bold text-gray-900">Order Confirmed</p>
                      <p className="text-gray-600 text-[11px]">Shipment manifested with {tracking.courierName}</p>
                      <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5">
                        <MapPin className="h-3 w-3" />
                        {order.city}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
