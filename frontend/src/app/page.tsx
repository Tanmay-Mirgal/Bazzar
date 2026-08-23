import Link from 'next/link';
import { ArrowRight, Headphones, Footprints, Shirt, Watch, Laptop, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let categories: any[] = [];

  try {
    const [prods, cats] = await Promise.all([
      getFeaturedProducts(),
      getCategories(),
    ]);
    featuredProducts = prods;
    categories = cats;
  } catch {
    // Graceful fallback if backend starting
  }

  const categoryImages: Record<string, string> = {
    Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    Apparel: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'Home & Office': 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800',
  };

  return (
    <div className="flex flex-col gap-20 pb-20 bg-white text-[#111111]">
      {/* Editorial Hero Section */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F7F7F5] border border-[#E8E8E8] p-8 md:p-14">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">
              New Edit • Collection 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1]">
              Essential Objects for Daily Living.
            </h1>
            <p className="text-sm sm:text-base text-[#6B6B6B] max-w-lg leading-relaxed">
              Curated electronics, ergonomic footwear, heavyweight cotton apparel, and minimalist workspace accessories designed for longevity.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-semibold text-xs h-12 px-8 transition-colors">
                  Explore Catalog <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products?category=Electronics" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-none border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white font-semibold text-xs h-12 px-8 transition-colors">
                  Shop Electronics
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-white border border-[#E8E8E8]">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000"
              alt="Acoustic Pro Headphones"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Trust Values Bar */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[#E8E8E8] text-xs font-semibold text-[#111111]">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-[#3F46D8]" />
            <div>
              <p className="font-bold">Complimentary Express Shipping</p>
              <p className="text-[#6B6B6B] text-[11px] font-normal">On orders above ₹1,499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#3F46D8]" />
            <div>
              <p className="font-bold">100% Genuine Guarantee</p>
              <p className="text-[#6B6B6B] text-[11px] font-normal">Direct from manufacturer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-[#3F46D8]" />
            <div>
              <p className="font-bold">30-Day Hassle-Free Returns</p>
              <p className="text-[#6B6B6B] text-[11px] font-normal">Easy exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-[#3F46D8]" />
            <div>
              <p className="font-bold">256-Bit SSL Encrypted</p>
              <p className="text-[#6B6B6B] text-[11px] font-normal">100% secure payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex items-end justify-between border-b border-[#E8E8E8] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Categories</span>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight mt-1">Shop By Collection</h2>
          </div>
          <Link href="/products" className="text-xs font-semibold text-[#111111] hover:text-[#3F46D8] flex items-center gap-1">
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col space-y-3"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F7F5] border border-[#E8E8E8]">
                <img
                  src={categoryImages[cat.name] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                  alt={cat.name}
                  className="object-cover w-full h-full img-hover-scale"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111111] group-hover:text-[#3F46D8] transition-colors">{cat.name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#6B6B6B] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex items-end justify-between border-b border-[#E8E8E8] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Handpicked</span>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight mt-1">Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-semibold text-[#111111] hover:text-[#3F46D8] flex items-center gap-1">
            View All ({featuredProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Campaign Banner */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#111111] text-white">
          <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Seasonal Campaign</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Minimalist Engineering. Everyday Precision.
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed max-w-md">
              Discover our latest collection of beryllium driver audio gear and CNC machined aluminum peripherals. Crafted for focus and performance.
            </p>
            <div className="pt-2">
              <Link href="/products">
                <Button size="lg" className="rounded-none bg-white text-[#111111] hover:bg-[#E5E5E5] font-semibold text-xs h-11 px-8 transition-colors">
                  Shop Campaign Edit
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-[#1C1C1C]">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000"
              alt="Minimalist Keyboard"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
