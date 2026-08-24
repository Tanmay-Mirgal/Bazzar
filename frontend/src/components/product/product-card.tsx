'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Check, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { getCurrentUser } from '@/lib/api/auth';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const [added, setAdded] = React.useState(false);

  const isLiked = isInWishlist(product.id);

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
    toast.success(`Added "${product.name}" to cart`);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      toast.error('Please sign in to use wishlist');
      return;
    }
    await toggleWishlist(cartProduct);
    if (!isLiked) {
      toast.success(`Saved "${product.name}" to wishlist`);
    } else {
      toast.info(`Removed from wishlist`);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const ratingValue = product.rating || 4.8;

  return (
    <div className="group flex flex-col h-full bg-white text-[#111111] border border-[#E8E8E8]">
      {/* Product Image Box */}
      <Link href={`/products/${product.id}`} className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F7F5] block">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center img-hover-scale"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            isLiked
              ? 'bg-rose-600 text-white'
              : 'bg-white/90 text-[#111111] hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-white' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-white px-3 py-1 border border-rose-200">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#6B6B6B] mb-1">
          <span className="font-semibold uppercase tracking-wider truncate max-w-[70%]">{product.category}</span>
          <span className="flex items-center gap-0.5 sm:gap-1 font-bold text-[#111111] shrink-0">
            <Star className="h-3 w-3 fill-[#111111]" /> {ratingValue.toFixed(1)}
          </span>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="font-bold text-xs sm:text-sm text-[#111111] line-clamp-1 hover:text-[#3F46D8] transition-colors mb-1"
        >
          {product.name}
        </Link>

        <p className="text-[11px] sm:text-xs text-[#6B6B6B] line-clamp-2 mb-3 sm:mb-4 flex-1 hidden sm:block">
          {product.description}
        </p>

        {/* Price & Add Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 pt-2 sm:pt-3 border-t border-[#E8E8E8] mt-auto">
          <span className="text-xs sm:text-base font-black text-[#111111]">
            {formatCurrency(product.price)}
          </span>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`h-7 sm:h-8 px-2 sm:px-3 rounded-none font-semibold text-[10px] sm:text-xs transition-colors ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#111111] hover:bg-[#3F46D8] text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
