'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Clock, MapPin, Store, CheckCircle, ShieldCheck, Compass, Navigation } from 'lucide-react';
import { BackendOrder } from '@/lib/api/orders';

interface HyperlocalRadarCardProps {
  order: BackendOrder;
}

export function HyperlocalRadarCard({ order }: HyperlocalRadarCardProps) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!order.deliveryDeadline) {
      const created = new Date(order.createdAt).getTime();
      const deadline = created + 15 * 60 * 1000;
      const initialDiff = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeftSeconds(initialDiff);
      return;
    }

    const deadlineTime = new Date(order.deliveryDeadline).getTime();

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
      setTimeLeftSeconds(diff);
      if (diff <= 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order.deliveryDeadline, order.createdAt]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTierTitle = (tier?: string) => {
    switch (tier) {
      case 'FLASH_10_MIN':
        return '⚡ 10-Min Flash Express Delivery';
      case 'FAST_20_MIN':
        return '🚀 20-Min Fast Dark Store Delivery';
      case 'STANDARD_45_MIN':
        return '🚚 45-Min Standard Quick-Commerce';
      default:
        return '📦 Express Hyperlocal Delivery';
    }
  };

  return (
    <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-xl relative overflow-hidden space-y-6">
      {/* Soft Decorative Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-gray-100 pb-5 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold text-[11px] uppercase tracking-wider shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 animate-pulse" />
            Concentric Ring Geo-Fenced Fulfillment
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {getTierTitle(order.deliverySpeedTier)}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            Fulfillment Hub: <span className="text-gray-900 font-semibold">{order.pickupAddress || 'Bazzar Dark Store #102'}</span>
          </p>
        </div>

        {/* Live Server Countdown Timer Pill */}
        <div className="bg-gray-900 text-white border border-gray-800 px-5 py-3.5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg relative z-10">
          <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none mb-0.5">
              Guaranteed Arrival In
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
              {timeLeftSeconds !== null ? (isExpired ? 'Arriving Now' : formatTimer(timeLeftSeconds)) : '--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Animated Radar Spectrum Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Tier Ring 1 */}
        <div className="bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-2xl space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Radial Ring 1 (0 – 2 km)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
            100% basket availability confirmed. Picker team dispatching items to rider.
          </p>
        </div>

        {/* Dispatch Status */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-900">
            <span>Fulfillment Score</span>
            <span className="text-emerald-600 font-mono font-bold">98.5%</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Optimized route assigned via turn-by-turn road navigation.
          </p>
        </div>

        {/* Live Rider Info */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-900">
            <span>Hyperlocal Courier</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Active Rider
            </span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Courier rider en route on dedicated EV lane directly to drop-off pin.
          </p>
        </div>
      </div>
    </div>
  );
}
