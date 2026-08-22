'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
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
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg mx-auto" />
          <div className="h-64 w-full max-w-2xl bg-slate-100 rounded-2xl mx-auto" />
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-6">
        <div className="h-24 w-24 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Cart is Currently Empty</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added any products to your shopping bag yet. Explore our curated collections to get started!
          </p>
        </div>
        <div>
          <Link href="/products">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 h-12 shadow-lg shadow-indigo-500/25">
              Explore Catalog Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleClearCart = () => {
    clearCart();
    toast.success('Shopping cart cleared');
    setIsClearDialogOpen(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Checkout Bag</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">Your Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">
              You have <strong className="text-slate-900 font-bold">{totalItems} item{totalItems === 1 ? '' : 's'}</strong> reserved in your bag
            </p>
          </div>

          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-full font-bold px-4 h-9"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Empty Cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold text-lg">Clear Shopping Bag?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-500">
                  Are you sure you want to remove all items from your cart?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCart} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Item List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemComponent key={item.product.id} item={item} />
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link href="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <OrderSummary subtotal={totalPrice} totalItems={totalItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
