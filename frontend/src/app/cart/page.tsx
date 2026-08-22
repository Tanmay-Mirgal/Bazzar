'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { CartItemComponent } from '@/components/cart/cart-item';
import { OrderSummary } from '@/components/cart/order-summary';
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

export default function CartPage() {
  const { cartItems, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = React.useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-xs text-zinc-400">Loading shopping cart...</p>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 mx-auto">
          <ShoppingBag className="h-8 w-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-black tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore our minimalist catalog to find products you love.
        </p>
        <Link href="/products">
          <Button size="lg" className="text-xs uppercase tracking-wider font-semibold px-8 h-11">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
    setIsClearDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Shopping Cart</h1>
          <p className="text-xs text-zinc-500 mt-1">
            You have {totalItems} item{totalItems === 1 ? '' : 's'} in your cart
          </p>
        </div>

        {/* Clear Cart Button */}
        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-zinc-200"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear Cart
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear shopping cart?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all items from your shopping cart? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearCart}>
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-2">
          {cartItems.map((item) => (
            <CartItemComponent key={item.product.id} item={item} />
          ))}

          <div className="pt-6">
            <Link href="/products" className="text-xs font-semibold text-black hover:underline inline-flex items-center">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <OrderSummary subtotal={totalPrice} totalItems={totalItems} />
        </div>
      </div>
    </div>
  );
}
