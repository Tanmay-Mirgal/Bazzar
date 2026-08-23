'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
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
      <div className="mx-auto max-w-[1440px] px-4 py-24 text-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#F7F7F5] mx-auto" />
          <div className="h-64 w-full max-w-2xl bg-[#F7F7F5] mx-auto" />
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-[#F7F7F5] border border-[#E8E8E8] text-[#111111] flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8 text-[#6B6B6B]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#111111]">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
            You currently have no items in your shopping bag. Discover our curated collections to start shopping.
          </p>
        </div>
        <div>
          <Link href="/products">
            <Button size="lg" className="rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-semibold text-xs px-8 h-11">
              Explore Store Catalog
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
    <div className="bg-white text-[#111111] min-h-screen pb-20">
      {/* Page Header */}
      <div className="bg-[#F7F7F5] border-b border-[#E8E8E8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Shopping Bag</span>
            <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight mt-0.5">Your Cart</h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              You have <strong className="text-[#111111] font-bold">{totalItems} item{totalItems === 1 ? '' : 's'}</strong> in your shopping bag
            </p>
          </div>

          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200 rounded-none font-semibold px-4 h-9"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Empty Cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-none bg-white border border-[#E8E8E8]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold text-base text-[#111111]">Empty Shopping Bag?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-[#6B6B6B]">
                  Are you sure you want to remove all products from your cart?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-none border-[#E8E8E8] text-xs font-semibold">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCart} className="bg-rose-600 hover:bg-rose-700 text-white rounded-none text-xs font-semibold">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Item List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemComponent key={item.product.id} item={item} />
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link href="/products" className="text-xs font-semibold text-[#111111] hover:text-[#3F46D8] flex items-center gap-1.5 underline">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <OrderSummary subtotal={totalPrice} totalItems={totalItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
