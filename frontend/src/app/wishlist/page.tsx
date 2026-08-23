'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlist-store';
import { getCurrentUser } from '@/lib/api/auth';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, UserCheck } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  const wishlistItems = useWishlistStore((state) => state.wishlistItems);

  React.useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      useWishlistStore.getState().syncFromBackend();
    }
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

  const user = getCurrentUser();

  return (
    <div className="min-h-screen pb-20 bg-white text-[#111111]">
      {/* Header Banner */}
      <div className="border-b border-[#E8E8E8] bg-[#F7F7F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Personal Favorites</span>
              <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight mt-1">Saved Wishlist</h1>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {wishlistItems.length === 0
                  ? 'No items saved'
                  : `${wishlistItems.length} product${wishlistItems.length === 1 ? '' : 's'} saved for later`}
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="rounded-none border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white font-semibold text-xs h-10 px-6">
                <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Not Logged In Warning Banner */}
        {!user && (
          <div className="p-4 bg-[#F7F7F5] border border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#111111]">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#3F46D8] shrink-0" />
              <span>You are viewing a guest wishlist. <strong>Sign In</strong> to sync your saved items across devices.</span>
            </div>
            <Link href="/login">
              <Button size="sm" className="bg-[#111111] text-white hover:bg-[#3F46D8] rounded-none text-xs font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="mx-auto max-w-xl text-center py-20 space-y-6">
            <div className="h-16 w-16 rounded-full bg-[#F7F7F5] border border-[#E8E8E8] text-[#111111] flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-[#6B6B6B]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#111111]">Your Wishlist is Empty</h2>
              <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
                Explore our catalog and save your favorite items by clicking the heart icon.
              </p>
            </div>
            <Link href="/products">
              <Button size="lg" className="rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-semibold text-xs px-8 h-11">
                Explore Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <ProductCard key={item.product.id} product={item.product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
