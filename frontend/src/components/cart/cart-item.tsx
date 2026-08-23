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
      toast.success(`Removed "${product.name}" from bag`);
      return;
    }
    decreaseQuantity(product.id);
  };

  const handleRemove = () => {
    removeFromCart(product.id);
    toast.success(`Removed "${product.name}" from bag`);
  };

  const itemTotal = product.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-[#E8E8E8] text-[#111111] gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Thumbnail */}
        <Link href={`/products/${product.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#F7F7F5] border border-[#E8E8E8]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover object-center"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3F46D8]">
            {product.category}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="font-bold text-sm text-[#111111] line-clamp-1 hover:text-[#3F46D8] transition-colors block"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <span>{formatCurrency(product.price)} each</span>
          </div>
        </div>
      </div>

      {/* Quantity & Total */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#E8E8E8]">
        {/* Controls */}
        <div className="flex items-center border border-[#E8E8E8] bg-[#F7F7F5]">
          <button
            onClick={handleDecrease}
            className="h-8 w-8 flex items-center justify-center text-[#111111] hover:bg-[#E8E8E8]"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-[#111111]">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={quantity >= product.stock}
            className="h-8 w-8 flex items-center justify-center text-[#111111] hover:bg-[#E8E8E8]"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <span className="text-base font-bold text-[#111111] block">
            {formatCurrency(itemTotal)}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={handleRemove}
          className="p-1 text-[#6B6B6B] hover:text-rose-600 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
