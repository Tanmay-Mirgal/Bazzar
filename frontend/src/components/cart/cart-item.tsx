'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, Check } from 'lucide-react';
import { CartItem } from '@/types/cart';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();
  const { product, quantity } = item;

  const handleIncrease = () => {
    if (quantity >= product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    increaseQuantity(product.id);
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeFromCart(product.id);
      toast.success(`Removed ${product.name} from cart`);
      return;
    }
    decreaseQuantity(product.id);
  };

  const handleRemove = () => {
    removeFromCart(product.id);
    toast.success(`Removed ${product.name} from cart`);
  };

  const itemTotal = product.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs gap-4 transition-all hover:border-slate-300">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Thumbnail */}
        <Link href={`/products/${product.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover object-center transition-transform hover:scale-105"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            {product.category}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors block"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{formatCurrency(product.price)} each</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
              <Check className="h-3 w-3" /> In Stock
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Total */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
        {/* Quantity Controls */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecrease}
            className="h-7 w-7 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-8 text-center text-xs font-bold text-slate-900">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncrease}
            disabled={quantity >= product.stock}
            className="h-7 w-7 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <span className="text-base font-black text-slate-900 block">
            {formatCurrency(itemTotal)}
          </span>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
