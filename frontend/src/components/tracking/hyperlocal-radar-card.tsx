'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Clock, Store } from 'lucide-react';
import { BackendOrder } from '@/lib/api/orders';

interface HyperlocalRadarCardProps {
  order: BackendOrder;
}

export function HyperlocalRadarCard({ order }: HyperlocalRadarCardProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate formatted Estimated Arrival Time (e.g. 11:45 AM)
  const getEtaDetails = () => {
    let targetTimeMs: number;

    if (order.deliveryDeadline) {
      targetTimeMs = new Date(order.deliveryDeadline).getTime();
    } else {
      const created = order.createdAt ? new Date(order.createdAt).getTime() : now;
      const tierMins = order.deliverySpeedTier === 'FLASH_10_MIN' ? 10 : order.deliverySpeedTier === 'FAST_20_MIN' ? 20 : 35;
      targetTimeMs = created + tierMins * 60 * 1000;
    }

    const dateObj = new Date(targetTimeMs);
    const etaFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const diffMins = Math.max(1, Math.round((targetTimeMs - now) / (60 * 1000)));

    return {
      etaFormatted,
      diffMins,
      isPast: now >= targetTimeMs,
    };
  };

  const eta = getEtaDetails();

  const getTierTitle = (tier?: string) => {
    switch (tier) {
      case 'FLASH_10_MIN':
        return '⚡ 10-Min Flash Express Delivery';
      case 'FAST_20_MIN':
        return '🚀 20-Min Fast Dark Store Delivery';
      case 'STANDARD_45_MIN':
        return '🚚 45-Min Standard Quick-Commerce';
      default:
        return '⚡ Express Hyperlocal Delivery';
    }
  };

  return (
    <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-7 border border-emerald-100/80 shadow-md relative overflow-hidden">
      {/* Ambient Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 animate-pulse" />
            Hyperlocal Delivery Active
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
            {getTierTitle(order.deliverySpeedTier)}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Dispatch Dark Store: <span className="text-gray-900 font-bold">{order.pickupAddress || 'Bazzar BKC Dark Store #101'}</span>
          </p>
        </div>

        {/* Estimated Arrival Time Display */}
        <div className="bg-[#111111] text-white border border-gray-800 px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shrink-0 shadow-md relative z-10">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block leading-none mb-1">
              Estimated Arrival Time
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight font-mono">
                {eta.isPast ? 'Arriving Now' : eta.etaFormatted}
              </span>
              {!eta.isPast && (
                <span className="text-xs font-bold text-emerald-200">
                  (~{eta.diffMins} mins)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
