'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, Sparkles, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface OrderSummaryProps {
  subtotal: number;
  totalItems: number;
}

export function OrderSummary({ subtotal, totalItems }: OrderSummaryProps) {
  const [promoCode, setPromoCode] = React.useState('');
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [appliedCode, setAppliedCode] = React.useState('');

  const freeShippingThreshold = 1499;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'BAZZAR10') {
      setAppliedDiscount(0.10);
      setAppliedCode('BAZZAR10');
      toast.success('Promo code BAZZAR10 applied! 10% OFF');
    } else if (code === 'BAZZAR20') {
      setAppliedDiscount(0.20);
      setAppliedCode('BAZZAR20');
      toast.success('Promo code BAZZAR20 applied! 20% OFF');
    } else {
      toast.error('Invalid promo code. Try BAZZAR10 or BAZZAR20');
    }
  };

  const discountAmount = subtotal * appliedDiscount;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm sticky top-24">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-black tracking-tight text-slate-900 flex items-center justify-between">
          <span>Order Summary</span>
          <span className="text-xs text-slate-500 font-semibold">{totalItems} Item{totalItems === 1 ? '' : 's'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 text-xs">
        {/* Free Shipping Progress Indicator */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-indigo-600" />
              {subtotal >= freeShippingThreshold ? '🎉 You unlocked Free Shipping!' : `Add ${formatCurrency(freeShippingThreshold - subtotal)} for Free Shipping`}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-indigo-200/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Promo Code Input */}
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Promo Code (BAZZAR10)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="pl-8 text-xs h-9 rounded-xl border-slate-200 bg-slate-50 uppercase font-mono"
            />
          </div>
          <Button type="submit" variant="outline" className="h-9 px-3 text-xs font-bold rounded-xl border-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors">
            Apply
          </Button>
        </form>

        {appliedCode && (
          <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg font-semibold border border-emerald-200">
            <span>Code {appliedCode} (-{(appliedDiscount * 100)}%)</span>
            <button onClick={() => { setAppliedDiscount(0); setAppliedCode(''); }} className="text-emerald-900 text-[10px] underline">Remove</button>
          </div>
        )}

        {/* Breakdown List */}
        <div className="space-y-2.5 pt-2 text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>

          {appliedDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Estimated Delivery Fee</span>
            <span className="font-bold text-slate-900">
              {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shippingFee)}
            </span>
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-black text-slate-900">
            <span>Estimated Total</span>
            <span className="text-lg text-indigo-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 pt-2">
        <Link href="/checkout" className="w-full">
          <Button size="lg" className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25">
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Guaranteed 256-Bit SSL Checkout</span>
        </div>
      </CardFooter>
    </Card>
  );
}
