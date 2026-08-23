import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
  ShoppingBag,
  Star,
  Award,
  Headphones,
  Shirt,
  BookOpen,
  Watch,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { getFeaturedProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    // Backend may be starting up — gracefully show empty state
  }

  const categoryIcons: Record<string, any> = {
    Electronics: Headphones,
    Clothing: Shirt,
    Books: BookOpen,
    Accessories: Watch,
  };

  return (
    <div className="flex flex-col gap-16 pb-16 gradient-bg-hero">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 md:p-16 overflow-hidden shadow-2xl shadow-indigo-900/20 border border-slate-800">
          {/* Decorative glowing gradient background blobs */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>Next-Gen Shopping Experience • Bazzar 2.0</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Discover <span className="gradient-text">Premium Goods</span> for Your Lifestyle.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Explore handpicked electronics, designer apparel, best-selling books, and luxury accessories with instant doorstep delivery and 100% genuine guarantee.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto font-bold text-xs h-13 px-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Catalog Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/products?category=Electronics" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-xs h-13 px-7 rounded-full border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white backdrop-blur-md">
                    Explore Electronics
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Verified Quality
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <CheckCircle2 className="h-4 w-4" /> 24/7 Support
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <CheckCircle2 className="h-4 w-4" /> Instant Checkout
                </span>
              </div>
            </div>

            {/* Right Hero Showcase Cards */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-6 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-rose-500 text-white font-bold text-[10px] uppercase px-2.5 py-0.5">
                    🔥 Hot Deal of the Week
                  </Badge>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 (500+ reviews)
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                    alt="Wireless Headphones"
                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <h4 className="text-white font-bold text-sm">Wireless Noise-Cancelling Headphones</h4>
                      <p className="text-emerald-400 font-black text-lg">₹2,999 <span className="text-slate-400 line-through text-xs font-normal">₹3,499</span></p>
                    </div>
                  </div>
                </div>

                <Link href="/products/1">
                  <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 shadow-md">
                    Claim Deal Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-slate-800">
          <div className="flex items-center gap-3 p-2">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[11px] text-slate-500">On all orders above ₹1,499</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Secure Payment</h4>
              <p className="text-[11px] text-slate-500">100% Encrypted transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-11 w-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">30-Day Returns</h4>
              <p className="text-[11px] text-slate-500">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-11 w-11 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Genuine Warranty</h4>
              <p className="text-[11px] text-slate-500">Official brand guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Collections
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shop By Category</h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat.name] || Headphones;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-center text-center gap-4 overflow-hidden"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center text-slate-800 shadow-xs">
                  <IconComponent className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Explore Collection →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="h-3.5 w-3.5" /> Handpicked
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Trending & Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
            Explore All Products ({featuredProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner / Flash Sale */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <Badge className="bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
              Limited Time Special
            </Badge>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Upgrade Your Tech & Style with 20% Cashback
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use code <strong className="text-amber-300 font-mono">BAZZAR20</strong> on your first order. Minimum cart value ₹2,999. Offer valid until stock lasts!
            </p>
            <div className="pt-2">
              <Link href="/products">
                <Button size="lg" className="rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-7 h-12 shadow-lg">
                  Shop Season Sale <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

