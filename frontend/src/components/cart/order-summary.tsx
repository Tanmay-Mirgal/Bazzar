'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  subtotal: number;
  totalItems: number;
  isCheckoutPage?: boolean;
  onProceedToCheckout?: () => void;
  isLoading?: boolean;
}

export function OrderSummary({
  subtotal,
  totalItems,
  isCheckoutPage = false,
  onProceedToCheckout,
  isLoading = false,
}: OrderSummaryProps) {
  const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const grandTotal = subtotal + shippingFee;

  return (
    <Card className="border border-zinc-200 bg-white sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold text-black uppercase tracking-wider">
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="flex justify-between text-zinc-600">
          <span>Items ({totalItems})</span>
          <span className="font-medium text-zinc-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-zinc-600">
          <span>Shipping</span>
          <span className="font-medium text-zinc-900">
            {shippingFee === 0 ? (
              <span className="text-green-600 font-semibold">FREE</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        {subtotal > 0 && subtotal <= 150 && (
          <p className="text-[10px] text-zinc-500 pt-1">
            Add {formatCurrency(150 - subtotal)} more for Free Shipping
          </p>
        )}

        <Separator className="my-2" />

        <div className="flex justify-between text-sm font-bold text-black pt-1">
          <span>Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        {!isCheckoutPage ? (
          <Link href="/checkout" className="w-full">
            <Button
              className="w-full h-11 text-xs uppercase tracking-wider font-semibold rounded-md"
              disabled={totalItems === 0}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onProceedToCheckout}
            disabled={totalItems === 0 || isLoading}
            className="w-full h-11 text-xs uppercase tracking-wider font-semibold rounded-md"
          >
            {isLoading ? 'Processing Order...' : 'Place Order'}
          </Button>
        )}

        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 pt-2">
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" /> Fast Delivery
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Secure Checkout
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
