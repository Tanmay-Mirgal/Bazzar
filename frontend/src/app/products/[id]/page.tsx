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
import { ShoppingBag, Star, ArrowLeft, Check, ShieldCheck, Truck, RotateCcw, Heart, Share2, Zap } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [added, setAdded] = React.useState<boolean>(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'specs' | 'shipping'>('overview');

  const addToCart = useCartStore((state) => state.addToCart);

  React.useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const item = await getProductById(id);
        setProduct(item);

        if (item) {
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

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 bg-slate-50 min-h-screen">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested product could not be found or has been discontinued.
        </p>
        <Link href="/products">
          <Button variant="default" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Products Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const originalPrice = product.price * 1.20;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Catalog
          </Button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-700">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-slate-700">Products</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Gallery Image Box */}
          <div className="md:col-span-6 relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm group">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs uppercase tracking-wider font-extrabold rounded-full px-3 py-1 shadow-md">
                ★ Top Choice
              </Badge>
            )}
            <button
              onClick={() => { setIsLiked(!isLiked); toast.success(isLiked ? 'Removed from wishlist' : 'Saved to wishlist'); }}
              className={`absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                isLiked ? 'bg-rose-500 text-white shadow-md' : 'bg-white/90 text-slate-700 hover:text-rose-500 shadow-sm'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Details & Order Actions */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold uppercase tracking-wider text-[10px] px-2.5">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold text-xs">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{(product.rating || 4.8).toFixed(1)}</span>
                  <span className="text-amber-500 text-[10px]">(128 reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
                <Badge className="bg-emerald-500 text-white font-bold text-[10px] rounded-full px-2">
                  SAVE 20%
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Description Tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 border-b-2 transition-colors ${activeTab === 'specs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 border-b-2 transition-colors ${activeTab === 'shipping' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed min-h-[60px]">
                {activeTab === 'overview' && <p>{product.description}</p>}
                {activeTab === 'specs' && (
                  <ul className="space-y-1 list-disc pl-4">
                    <li>100% Genuine Certified Product</li>
                    <li>Official Manufacturer Warranty Included</li>
                    <li>Premium Build Materials & Finish</li>
                  </ul>
                )}
                {activeTab === 'shipping' && <p>Free express doorstep delivery on orders above ₹1,499. Easy 30-day hassle-free returns & replacement policy.</p>}
              </div>
            </div>

            <Separator />

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Quantity:</span>
                <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} items available`}
                </span>
              </div>

              <QuantitySelector
                quantity={quantity}
                maxStock={product.stock}
                onChange={(val) => setQuantity(val)}
                disabled={isOutOfStock}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`h-12 rounded-xl font-extrabold text-xs gap-2 transition-all ${
                    added ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                  }`}
                >
                  {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                  {added ? 'Added to Cart' : `Add to Cart (${formatCurrency(product.price * quantity)})`}
                </Button>

                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20"
                >
                  <Zap className="h-4 w-4 fill-amber-300 text-amber-300 mr-1" />
                  Instant Buy Now
                </Button>
              </div>
            </div>

            {/* Guarantee Cards */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-500">
              <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl">
                <Truck className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold text-slate-800">Express Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl">
                <RotateCcw className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-slate-800">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">You Might Also Like</h2>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold text-indigo-600 hover:underline">
                View Category →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
