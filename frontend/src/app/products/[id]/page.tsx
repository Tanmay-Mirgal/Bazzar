'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/api/products';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { getCurrentUser } from '@/lib/api/auth';
import { formatCurrency } from '@/lib/utils';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AccordionItem } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ShoppingBag, Star, ArrowLeft, Check, ShieldCheck, Truck, RotateCcw, Heart, Zap } from 'lucide-react';

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
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const isLiked = product ? isInWishlist(product.id) : false;

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
      toast.error('Product is out of stock');
      return;
    }

    addToCart(product, quantity);
    setAdded(true);
    toast.success(`Added ${quantity} x "${product.name}" to bag`);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/cart');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    const user = getCurrentUser();
    if (!user) {
      toast.error('Please sign in to use wishlist');
      return;
    }
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image,
    };
    await toggleWishlist(cartProduct);
    if (!isLiked) {
      toast.success(`Saved "${product.name}" to wishlist`);
    } else {
      toast.info(`Removed from wishlist`);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 space-y-8 min-h-screen">
        <Skeleton className="h-6 w-32 rounded-none bg-[#F7F7F5]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/5] w-full rounded-none bg-[#F7F7F5]" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 rounded-none bg-[#F7F7F5]" />
            <Skeleton className="h-10 w-3/4 rounded-none bg-[#F7F7F5]" />
            <Skeleton className="h-8 w-32 rounded-none bg-[#F7F7F5]" />
            <Skeleton className="h-28 w-full rounded-none bg-[#F7F7F5]" />
            <Skeleton className="h-12 w-full rounded-none bg-[#F7F7F5]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-[#111111]">Product Not Found</h2>
        <p className="text-xs text-[#6B6B6B]">
          The requested product could not be located in our store catalog.
        </p>
        <Link href="/products">
          <Button variant="default" className="rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-semibold text-xs px-6 h-11">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Store Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const originalPrice = product.price * 1.15;

  return (
    <div className="min-h-screen pb-20 bg-white text-[#111111]">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#E8E8E8] bg-[#F7F7F5] py-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-xs text-[#6B6B6B] hover:text-[#111111] font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Catalog
          </Button>
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#111111]">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#111111]">Products</Link>
            <span>/</span>
            <span className="text-[#111111] font-bold truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Gallery Box */}
          <div className="md:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F7F5] border border-[#E8E8E8]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover object-center"
              />
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  isLiked ? 'bg-rose-600 text-white' : 'bg-white text-[#111111] hover:text-rose-600'
                }`}
                title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sticky Info Panel */}
          <div className="md:col-span-5 space-y-6 sticky top-24">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">
                  {product.category}
                </span>
                <span className="flex items-center gap-1 font-bold text-[#111111]">
                  <Star className="h-3.5 w-3.5 fill-[#111111]" /> {(product.rating || 4.8).toFixed(1)}
                  <span className="text-[#6B6B6B] font-normal text-[11px]">(48 reviews)</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#111111]">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-[#6B6B6B] line-through">
                  {formatCurrency(originalPrice)}
                </span>
              </div>
            </div>

            {/* Stock status */}
            <div className="text-xs">
              <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left in stock - order soon` : 'In Stock & Ready to Ship'}
              </span>
            </div>

            {/* Quantity Selector & Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                <span>Quantity</span>
              </div>
              <QuantitySelector
                quantity={quantity}
                maxStock={product.stock}
                onChange={(val) => setQuantity(val)}
                disabled={isOutOfStock}
              />

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`h-12 rounded-none font-semibold text-xs gap-2 transition-colors ${
                    added ? 'bg-emerald-600 text-white' : 'bg-[#111111] hover:bg-[#3F46D8] text-white'
                  }`}
                >
                  {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                  {added ? 'Added to Bag' : `Add to Bag — ${formatCurrency(product.price * quantity)}`}
                </Button>

                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="h-12 rounded-none border border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-white font-semibold text-xs transition-colors"
                >
                  Buy Now Instant
                </Button>
              </div>
            </div>

            {/* Expandable Accordions */}
            <div className="pt-4 border-t border-[#E8E8E8] space-y-1">
              <AccordionItem title="Product Description" defaultOpen={true}>
                <p>{product.description}</p>
              </AccordionItem>

              <AccordionItem title="Specifications & Build">
                <ul className="list-disc pl-4 space-y-1">
                  <li>100% Genuine Certified Brand Quality</li>
                  <li>Official Manufacturer Warranty Included</li>
                  <li>Premium Industrial Materials & Finishing</li>
                </ul>
              </AccordionItem>

              <AccordionItem title="Shipping & Delivery">
                <p>Complimentary express doorstep delivery on orders above ₹1,499. Orders dispatched within 24 hours.</p>
              </AccordionItem>

              <AccordionItem title="Returns & Replacement">
                <p>Hassle-free 30-day return policy. Easy online replacement or refund processing.</p>
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-[#E8E8E8]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">You Might Also Like</h2>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs font-semibold text-[#111111] hover:text-[#3F46D8] underline">
                View Collection →
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
