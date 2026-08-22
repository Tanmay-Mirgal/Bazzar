'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/api/products';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, Star, ArrowLeft, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [added, setAdded] = React.useState<boolean>(false);

  const addToCart = useCartStore((state) => state.addToCart);

  React.useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const item = await getProductById(id);
        setProduct(item);

        if (item) {
          // Fetch related products in the same category
          const allProds = await getProducts({ category: item.category });
          setRelatedProducts(allProds.filter((p) => p.id !== item.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product detail', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    setQuantity(1);
    setAdded(false);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast.error('Product is currently out of stock');
      return;
    }

    addToCart(product, quantity);
    setAdded(true);
    toast.success(`Added ${quantity} x ${product.name} to cart`);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900">Product Not Found</h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          The product you are looking for does not exist or has been removed from our catalog.
        </p>
        <Link href="/products">
          <Button variant="default" size="sm" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Back Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-xs text-zinc-500 hover:text-black pl-0"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back
      </Button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Gallery Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-xs">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {product.featured && (
            <Badge className="absolute top-4 left-4 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs">
              Featured
            </Badge>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
              <span className="uppercase tracking-wider font-semibold text-zinc-400">
                {product.category}
              </span>
              {product.rating && (
                <span className="flex items-center gap-1 font-semibold text-zinc-900">
                  <Star className="h-4 w-4 fill-black text-black" />
                  {product.rating.toFixed(1)} / 5.0
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-2xl font-black text-black">
                {formatCurrency(product.price)}
              </span>
              <span className={`text-xs font-semibold ${isOutOfStock ? 'text-red-600' : 'text-zinc-500'}`}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} units available`}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
              Description
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Add to Cart Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-zinc-900">Quantity:</span>
              <QuantitySelector
                quantity={quantity}
                maxStock={product.stock}
                onChange={(val) => setQuantity(val)}
                disabled={isOutOfStock}
              />
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              variant={added ? 'secondary' : 'default'}
              className="w-full h-12 text-xs uppercase tracking-wider font-bold rounded-md gap-2"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart ({formatCurrency(product.price * quantity)})
                </>
              )}
            </Button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-zinc-100 text-[10px] text-zinc-500">
            <div className="flex flex-col items-center gap-1 p-2 bg-zinc-50 rounded-md">
              <Truck className="h-4 w-4 text-black" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-zinc-50 rounded-md">
              <ShieldCheck className="h-4 w-4 text-black" />
              <span>2 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-zinc-50 rounded-md">
              <RotateCcw className="h-4 w-4 text-black" />
              <span>Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-zinc-200 space-y-6">
          <h2 className="text-xl font-bold text-black tracking-tight">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
