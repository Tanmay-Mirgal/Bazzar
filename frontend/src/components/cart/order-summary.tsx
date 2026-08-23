'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      toast.success('Promo code BAZZAR10 applied! (10% OFF)');
    } else if (code === 'BAZZAR20') {
      setAppliedDiscount(0.20);
      setAppliedCode('BAZZAR20');
      toast.success('Promo code BAZZAR20 applied! (20% OFF)');
    } else {
      toast.error('Invalid promo code. Try BAZZAR10 or BAZZAR20');
    }
  };

  const discountAmount = subtotal * appliedDiscount;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <div className="bg-white border border-[#E8E8E8] p-6 space-y-6 text-xs text-[#111111] sticky top-24">
      <div className="border-b border-[#E8E8E8] pb-4 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#111111] tracking-tight uppercase">Order Summary</h3>
        <span className="text-xs text-[#6B6B6B] font-semibold">{totalItems} Item{totalItems === 1 ? '' : 's'}</span>
      </div>

      {/* Free Shipping Indicator */}
      <div className="bg-[#F7F7F5] border border-[#E8E8E8] p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#111111]">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#3F46D8]" />
            {subtotal >= freeShippingThreshold ? 'Free shipping unlocked' : `Add ${formatCurrency(freeShippingThreshold - subtotal)} for Free Shipping`}
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#E8E8E8] overflow-hidden">
          <div
            className="h-full bg-[#3F46D8] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Promo Code Form */}
      <form onSubmit={handleApplyPromo} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B6B6B]" />
          <Input
            type="text"
            placeholder="Promo code (BAZZAR10)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="pl-8 text-xs h-9 rounded-none border-[#E8E8E8] bg-[#F7F7F5] uppercase font-mono"
          />
        </div>
        <Button type="submit" variant="outline" className="h-9 px-4 text-xs font-bold rounded-none border-[#111111] hover:bg-[#111111] hover:text-white transition-colors">
          Apply
        </Button>
      </form>

      {appliedCode && (
        <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 font-semibold border border-emerald-200">
          <span>Code {appliedCode} (-{(appliedDiscount * 100)}%)</span>
          <button onClick={() => { setAppliedDiscount(0); setAppliedCode(''); }} className="text-emerald-900 text-[10px] underline">Remove</button>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2.5 pt-2 text-[#6B6B6B] border-t border-[#E8E8E8]">
        <div className="flex justify-between text-[#111111]">
          <span>Subtotal</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[#111111]">
          <span>Delivery Fee</span>
          <span className="font-bold">
            {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : formatCurrency(shippingFee)}
          </span>
        </div>

        <div className="border-t border-[#E8E8E8] pt-3 flex justify-between text-sm font-extrabold text-[#111111]">
          <span>Estimated Total</span>
          <span className="text-lg text-[#111111]">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link href="/checkout" className="w-full block">
          <Button size="lg" className="w-full h-12 rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs tracking-wider uppercase transition-colors">
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B6B6B]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Guaranteed 256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>
    </div>
  );
}
