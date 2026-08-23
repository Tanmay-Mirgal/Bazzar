'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { getCurrentUser } from '@/lib/api/auth';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, ShoppingBag, ArrowLeft, Trash2, UserCheck } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addToCart = useCartStore((state) => state.addToCart);

  React.useEffect(() => {
    setMounted(true);
    // Sync store from backend when component mounts if authenticated
    const user = getCurrentUser();
    if (user) {
      useWishlistStore.getState().syncFromBackend();
    }
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

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.product.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    addToCart(item.product, 1);
    toast.success(`Moved ${item.product.name} to cart`);
  };

  const handleRemoveFromWishlist = async (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(item.product);
    toast.success(`Removed ${item.product.name} from wishlist`);
  };

  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                <Heart className="h-4 w-4 fill-indigo-400" />
                Personal Favorites
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Wishlist</h1>
              <p className="text-slate-400 text-sm mt-1">
                {wishlistItems.length === 0
                  ? 'No items saved'
                  : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} saved`}
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="rounded-full border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white backdrop-blur-md">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Not Logged In Warning Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600 shrink-0" />
              <span>You are viewing a local wishlist. <strong>Sign In</strong> to sync your favorites to your database.</span>
            </div>
            <Link href="/login">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full">
                Sign In Now
              </Button>
            </Link>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="mx-auto max-w-xl text-center py-20 space-y-6">
            <div className="h-20 w-20 rounded-3xl bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
              <Heart className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Your Wishlist is Empty</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our catalog and click the heart icon on any product to save it here for later.
              </p>
            </div>
            <Link href="/products">
              <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 h-12 shadow-md">
                Find Products to Add
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card
                key={item.product.id}
                className="group relative overflow-hidden border border-slate-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:border-indigo-300 flex flex-col h-full rounded-2xl"
              >
                {/* Image Link */}
                <Link href={`/products/${item.product.id}`} className="relative aspect-square w-full overflow-hidden bg-slate-50 block">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-md text-slate-800 border-slate-200 text-[10px] font-bold rounded-full">
                      {item.product.category}
                    </Badge>
                  </div>
                  {/* Delete button overlay */}
                  <button
                    onClick={(e) => handleRemoveFromWishlist(e, item)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center shadow-sm transition-all"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                {/* Content */}
                <CardContent className="flex flex-col flex-1 p-4 sm:p-5">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors mb-1.5"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                    {item.product.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(item.product.price)}
                    </span>

                    <Button
                      size="sm"
                      onClick={(e) => handleAddToCart(e, item)}
                      className="h-9 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-500/10"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
