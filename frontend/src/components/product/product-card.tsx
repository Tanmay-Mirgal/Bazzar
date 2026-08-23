'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Check, Heart, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { getCurrentUser } from '@/lib/api/auth';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const [added, setAdded] = React.useState(false);

  const isLiked = isInWishlist(product.id);

  // Build CartProduct shape from Product
  const cartProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    image: product.image,
    rating: product.rating,
    featured: product.featured,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart(cartProduct, 1);
    setAdded(true);
    toast.success(`Added "${product.name}" to your cart! 🛍️`);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }
    await toggleWishlist(cartProduct);
    if (!isLiked) {
      toast.success(`Saved "${product.name}" to wishlist ❤️`);
    } else {
      toast.info(`Removed from wishlist`);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 8;
  const ratingValue = product.rating || 4.8;
  const originalPrice = product.price * 1.18; // Realistic discount display

  return (
    <Card className="group relative overflow-hidden border border-slate-200/90 bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/12 hover:border-indigo-400 flex flex-col h-full rounded-3xl">
      {/* Image Container with Hover Effects & Badges */}
      <Link href={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-slate-100 block">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.featured && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase tracking-wider font-extrabold rounded-full px-3 py-0.5 shadow-md shadow-amber-500/20 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Featured
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/95 backdrop-blur-md text-slate-900 border-slate-200/80 text-[10px] font-bold rounded-full px-2.5 py-0.5 shadow-xs">
            {product.category}
          </Badge>
        </div>

        {/* Right Top Wishlist Action */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleToggleWishlist}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              isLiked
                ? 'bg-rose-500 text-white scale-105 shadow-rose-500/30'
                : 'bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white hover:text-rose-500 hover:scale-110'
            }`}
            aria-label="Save to Wishlist"
            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 transition-transform ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10 hidden sm:block">
          <div className="w-full h-9 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-white transition-colors">
            <Eye className="h-3.5 w-3.5 text-indigo-600" />
            Quick View Details
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-20">
            <Badge variant="destructive" className="uppercase text-xs tracking-wider px-3.5 py-1 font-black rounded-full shadow-lg">
              Sold Out
            </Badge>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <CardContent className="flex flex-col flex-1 p-5">
        {/* Rating & Stock Status */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{ratingValue.toFixed(1)}</span>
            <span className="text-amber-600/80 text-[10px] font-normal">(42)</span>
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isOutOfStock
                ? 'text-rose-500'
                : isLowStock
                ? 'text-amber-600 font-black animate-pulse'
                : 'text-emerald-600'
            }`}
          >
            {isOutOfStock
              ? 'Out of stock'
              : isLowStock
              ? `Only ${product.stock} Left!`
              : 'In Stock'}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.id}`}
          className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors mb-1.5"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Footer: Price & Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatCurrency(originalPrice)}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Free Shipping
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`h-10 px-4 rounded-xl font-extrabold text-xs gap-1.5 transition-all shadow-md ${
              added
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 hover:scale-105'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
