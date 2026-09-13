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
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamically import Leaflet Map to avoid SSR issues
const LiveTrackingMap = dynamic(
  () => import('@/components/tracking/live-tracking-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] bg-[#F4F4F6] rounded-3xl animate-pulse flex items-center justify-center text-xs text-[#888888] font-bold">
        Loading Interactive Live Satellite Radar...
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 space-y-6">
        <div className="h-8 w-48 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-96 w-full bg-gray-100 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
          <div className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!order || !tracking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <Package className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#111111]">Order Not Found</h1>
          <p className="text-xs text-[#6B6B6B]">
            We could not locate shipment tracking records for order #{orderId}.
          </p>
        </div>
        <Link href="/products">
          <Button className="rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white text-xs font-bold px-6 h-11">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isDelivered = tracking.trackingStatus === 'DELIVERED';

  return (
    <div className="bg-white min-h-screen pb-24 text-[#111111]">
      {/* Header Banner */}
      <div className="bg-[#F7F7F5] border-b border-[#E8E8E8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/orders"
              className="inline-flex items-center text-xs font-bold text-[#6B6B6B] hover:text-[#111111] mb-2 gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                Shipment Tracking #{order.id}
              </h1>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  isDelivered
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-indigo-100 text-[#3F46D8]'
                }`}
              >
                {tracking.trackingStatus}
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Estimated Delivery: <strong className="text-[#111111] font-bold">{tracking.estimatedDelivery}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTrackingData(true)}
              disabled={refreshing}
              className="rounded-xl border-[#E8E8E8] text-xs font-bold gap-2 h-10 px-4 bg-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Live Radar'}
            </Button>

            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="rounded-xl border-[#111111] text-[#111111] text-xs font-bold h-10 px-4 bg-white hidden sm:inline-flex"
            >
              Print Receipt
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Leaflet Interactive Map */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#3F46D8] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Real-Time GPS Logistics Telemetry
              </span>
            </div>
            <span className="text-xs text-[#888888] font-medium hidden sm:inline">
              Interactive OpenStreetMap • Pan &amp; Zoom
            </span>
          </div>

          <div className="h-[420px] w-full">
            <LiveTrackingMap
              origin={tracking.origin}
              destination={tracking.destination}
              currentLocation={tracking.currentLocation}
              routeCoordinates={tracking.routeCoordinates}
              courierName={tracking.courierName}
              awbCode={tracking.awbCode}
              trackingStatus={tracking.trackingStatus}
            />
          </div>
        </div>

        {/* Section 2: Logistics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F7F7F5] border border-[#E8E8E8] p-4 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Courier Aggregator</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-[#111111]">{tracking.courierName}</p>
              <Truck className="h-4 w-4 text-[#3F46D8]" />
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">Shiprocket Surface Express</p>
          </div>

          <div className="bg-[#F7F7F5] border border-[#E8E8E8] p-4 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">AWB Consignment Number</p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono font-bold text-[#111111] truncate">{tracking.awbCode}</p>
              <button
                onClick={() => copyToClipboard(tracking.awbCode, 'AWB Code')}
                className="text-[#6B6B6B] hover:text-[#111111] transition-colors"
                title="Copy AWB"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#888888]">Barcoded Manifest</p>
          </div>

          <div className="bg-[#F7F7F5] border border-[#E8E8E8] p-4 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Payment Method</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-[#111111]">{tracking.paymentMethod}</p>
              <CreditCard className="h-4 w-4 text-[#3F46D8]" />
            </div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase">
              {tracking.paymentStatus}
            </p>
          </div>

          <div className="bg-[#F7F7F5] border border-[#E8E8E8] p-4 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Total Consignment Value</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-[#111111]">{formatCurrency(tracking.totalAmount)}</p>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-[#888888]">Includes Taxes &amp; Logistics</p>
          </div>
        </div>

        {/* Section 3: Dual Column: Live Timeline + Location Hubs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timeline Checkpoints (8 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E8E8] p-6 space-y-6">
            <div className="border-b border-[#E8E8E8] pb-4">
              <h2 className="text-base font-extrabold text-[#111111] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#3F46D8]" /> Shipment Checkpoint Timeline
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Live scans from Shiprocket logistics fulfillment centers
              </p>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E8E8]">
              {tracking.checkpoints.map((cp, idx) => {
                return (
                  <div key={idx} className="relative flex items-start gap-4 group">
                    {/* Status Dot */}
                    <div
                      className={`absolute -left-6 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        cp.completed
                          ? 'bg-[#3F46D8] border-white text-white shadow-xs'
                          : 'bg-white border-gray-300 text-transparent'
                      } ${cp.isCurrent ? 'ring-4 ring-indigo-100 ring-offset-1' : ''}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p
                          className={`text-xs font-extrabold ${
                            cp.completed ? 'text-[#111111]' : 'text-gray-400'
                          }`}
                        >
                          {cp.title}
                        </p>
                        <span className="text-[10px] text-[#888888] font-mono shrink-0">
                          {cp.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B6B]">{cp.description}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3F46D8] bg-indigo-50 px-2 py-0.5 rounded-md mt-1">
                        <MapPin className="h-3 w-3" /> {cp.location}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Origin, Destination & Order Items (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Origin & Destination Cards */}
            <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#111111] border-b border-[#E8E8E8] pb-3">
                Logistics Routing Endpoints
              </h3>

              {/* Pickup Hub */}
              <div className="flex items-start gap-3 text-xs">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-[#3F46D8] flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Origin / Seller Dispatch Hub</p>
                  <p className="font-bold text-[#111111] mt-0.5">{tracking.origin.title}</p>
                  <p className="text-[#6B6B6B]">{tracking.origin.address}, {tracking.origin.city} ({tracking.origin.postalCode})</p>
                </div>
              </div>

              <div className="border-t border-dashed border-[#E8E8E8]" />

              {/* Destination */}
              <div className="flex items-start gap-3 text-xs">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Customer Delivery Address</p>
                  <p className="font-bold text-[#111111] mt-0.5">{order.fullName}</p>
                  <p className="text-[#6B6B6B]">{order.address}</p>
                  <p className="text-[#6B6B6B]">{order.city} - {order.postalCode}</p>
                  <p className="text-[11px] text-[#888888] mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {order.phoneNumber}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {order.email}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Summary in Consignment */}
            <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#111111] border-b border-[#E8E8E8] pb-3">
                Items in Consignment ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-10 w-10 rounded-xl object-cover border border-[#E8E8E8] shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center border border-[#E8E8E8] shrink-0">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-[#111111] truncate">{item.product.name}</p>
                        <p className="text-[10px] text-[#888888]">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <span className="font-black text-[#111111] shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E8E8] pt-3 flex justify-between text-xs font-extrabold text-[#111111]">
                <span>Order Total</span>
                <span className="text-sm">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
