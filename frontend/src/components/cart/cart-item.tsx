'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { product, quantity } = item;
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleQuantityChange = (newQty: number) => {
    if (newQty > quantity) {
      increaseQuantity(product.id);
    } else if (newQty < quantity) {
      decreaseQuantity(product.id);
    }
  };

  const handleConfirmRemove = () => {
    removeFromCart(product.id);
    toast.success(`Removed ${product.name} from cart`);
    setIsDialogOpen(false);
  };

  const itemTotalPrice = product.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-zinc-200">
      {/* Product Info */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          href={`/products/${product.id}`}
          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover object-center"
          />
        </Link>

        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
            {product.category}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-zinc-900 hover:underline line-clamp-1"
          >
            {product.name}
          </Link>
          <span className="text-xs text-zinc-500">
            {formatCurrency(product.price)} each
          </span>
        </div>
      </div>

      {/* Controls & Subtotal */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
        <QuantitySelector
          quantity={quantity}
          maxStock={product.stock}
          onChange={handleQuantityChange}
        />

        <div className="text-right min-w-[80px]">
          <span className="text-sm font-bold text-zinc-900 block">
            {formatCurrency(itemTotalPrice)}
          </span>
        </div>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from cart?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{product.name}</strong> from your cart?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRemove}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
