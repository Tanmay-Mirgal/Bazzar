'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Check, Heart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart(product, 1);
    setAdded(true);
    toast.success(`Added ${product.name} to cart`);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success(`Saved ${product.name} to wishlist`);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const ratingValue = product.rating || 4.8;
  const originalPrice = product.price * 1.15; // Show realistic comparison price

  return (
    <Card className="group relative overflow-hidden border border-slate-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 flex flex-col h-full rounded-2xl">
      {/* Image Container with Badges & Hover Actions */}
      <Link href={`/products/${product.id}`} className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-slate-50 block">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.featured && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase tracking-wider font-bold rounded-full px-2.5 py-0.5 shadow-sm">
              ★ Top Pick
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/90 backdrop-blur-md text-slate-800 border-slate-200 text-[10px] font-semibold rounded-full px-2 py-0.5">
            {product.category}
          </Badge>
        </div>

        {/* Quick Actions (Wishlist & View) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={toggleLike}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
              isLiked
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <Badge variant="destructive" className="uppercase text-xs tracking-wider px-3 py-1 font-bold">
              Sold Out
            </Badge>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <CardContent className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Rating & Stock Status */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-medium text-[11px]">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{ratingValue.toFixed(1)}</span>
            <span className="text-amber-500 text-[9px]">(24)</span>
          </div>

          <span className={`text-[10px] font-semibold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-600'}`}>
            {isOutOfStock ? 'Out of stock' : `${product.stock} available`}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.id}`}
          className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors mb-1.5"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600">Free Shipping</span>
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs gap-1.5 transition-all shadow-sm ${
              added
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
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
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

