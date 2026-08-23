'use client';

import * as React from 'react';
import { Timer, Zap } from 'lucide-react';

export function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = React.useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-md backdrop-blur-md">
      <div className="flex items-center gap-1 text-amber-400 text-xs font-black uppercase tracking-wider">
        <Zap className="h-3.5 w-3.5 fill-amber-400 animate-pulse" />
        <span>Sale Ends In:</span>
      </div>

      <div className="flex items-center gap-1 font-mono font-black text-xs">
        <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[11px]">
          {formatNumber(timeLeft.hours)}h
        </span>
        <span className="text-amber-400">:</span>
        <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[11px]">
          {formatNumber(timeLeft.minutes)}m
        </span>
        <span className="text-amber-400">:</span>
        <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[11px]">
          {formatNumber(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
}
