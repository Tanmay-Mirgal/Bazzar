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
  Watch,
  CheckCircle2,
  TrendingUp,
  Footprints,
  Laptop,
  Check,
  Users,
  Quote
} from 'lucide-react';
import { getFeaturedProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlashSaleTimer } from '@/components/home/flash-sale-timer';

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
    // Backend may be starting up — gracefully handle
  }

  const categoryIcons: Record<string, any> = {
    Electronics: Headphones,
    Footwear: Footprints,
    Apparel: Shirt,
    Accessories: Watch,
    'Home & Office': Laptop,
  };

  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: 'Verified Buyer',
      review: 'The Acoustic Pro headphones arrived in just 24 hours! Sound clarity and ANC are top-tier. Bazzar is my new go-to store.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      product: 'Acoustic Pro Wireless Headphones',
    },
    {
      name: 'Rohan Mehta',
      role: 'Tech Enthusiast',
      review: 'CNC machined mechanical keyboard exceeded my expectations. Smooth switches and premium build quality. 10/10 UX!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      product: 'Minimalist Aluminum Keyboard',
    },
    {
      name: 'Ananya Gupta',
      role: 'Fashion Designer',
      review: 'The organic cotton hoodie fit perfectly! Super heavy 450gsm fabric and pristine minimal aesthetic. Highly recommended.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      product: 'Heavyweight Cotton Boxy Hoodie',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20 gradient-bg-hero">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-8 md:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl bg-slate-950 text-white p-8 md:p-16 overflow-hidden shadow-2xl shadow-indigo-950/40 border border-slate-800">
          {/* Glowing Gradient Background Blobs */}
          <div className="absolute -top-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-gradient-to-tr from-pink-600/20 to-cyan-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 text-xs font-black text-indigo-300 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>Modern E-Commerce Storefront • Premium Edition</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Curated <span className="gradient-text">Lifestyle & Tech</span> Essentials.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Handcrafted electronics, minimalist footwear, luxury apparel, and workspace gear backed by 100% authenticity guarantee and instant doorstep delivery.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto font-black text-xs h-13 px-8 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Entire Store
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/products?category=Electronics" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-xs h-13 px-7 rounded-full border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md">
                    Explore Electronics
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> 100% Genuine Guaranteed
                </span>
                <span className="flex items-center gap-2 text-indigo-400">
                  <CheckCircle2 className="h-4 w-4" /> Express 24h Delivery
                </span>
                <span className="flex items-center gap-2 text-amber-400">
                  <CheckCircle2 className="h-4 w-4" /> Easy 30-Day Returns
                </span>
              </div>
            </div>

            {/* Right Column Showcase Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-4 relative">
                <div className="flex items-center justify-between">
                  <Badge className="bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    🔥 Hot Deal of the Day
                  </Badge>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 (420+ reviews)
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
                    alt="Wireless Headphones"
                    className="object-cover w-full h-full transform hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Electronics</span>
                      <h4 className="text-white font-black text-sm line-clamp-1">Acoustic Pro Wireless Headphones</h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-emerald-400 font-black text-xl">₹2,999</span>
                        <span className="text-slate-400 line-through text-xs font-medium">₹3,499</span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border-0 px-2 py-0">SAVE 15%</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/products/prod-1">
                  <Button className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 shadow-lg shadow-indigo-600/30">
                    Claim Deal Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md text-slate-800">
          <div className="flex items-center gap-3.5 p-2">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[11px] text-slate-500 font-medium">On orders above ₹1,499</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">100% Encrypted</h4>
              <p className="text-[11px] text-slate-500 font-medium">Safe & secure checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">30-Day Exchange</h4>
              <p className="text-[11px] text-slate-500 font-medium">Instant return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Official Warranty</h4>
              <p className="text-[11px] text-slate-500 font-medium">100% brand warranty</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Collections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-indigo-600 text-xs font-black uppercase tracking-widest mb-1">
              <TrendingUp className="h-4 w-4" /> Curated Collections
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shop By Category</h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat.name] || Headphones;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-3xl border border-slate-200/90 bg-white p-6 transition-all duration-300 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col items-center text-center gap-4 overflow-hidden"
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center text-slate-800 shadow-xs">
                  <IconComponent className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Explore Collection →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured & Trending Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-purple-600 text-xs font-black uppercase tracking-widest mb-1">
              <Zap className="h-4 w-4" /> Handpicked Selections
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Trending & Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
            Explore Full Catalog ({featuredProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Interactive Flash Sale Countdown Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-3 py-1">
                  LIMITED TIME FLASH SALE
                </Badge>
                <FlashSaleTimer />
              </div>

              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Get Extra 10% Instant Discount + 20% Cashback
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                Apply coupon code <strong className="text-amber-300 font-mono font-bold bg-amber-400/20 px-2 py-0.5 rounded">BAZZAR10</strong> at checkout to unlock instant discounts across all electronics & apparel!
              </p>
              <div>
                <Link href="/products">
                  <Button size="lg" className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-8 h-12 shadow-xl hover:scale-105 transition-all">
                    Shop Flash Deals <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Social Proof Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-black uppercase tracking-widest">
            <Users className="h-4 w-4" /> Verified Customer Reviews
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Loved By Over 10,000+ Shoppers</h2>
          <p className="text-xs text-slate-500">Read authentic feedback from real customers across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 relative flex flex-col justify-between">
              <Quote className="h-8 w-8 text-indigo-100 absolute top-4 right-4" />
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{t.review}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-indigo-200" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">{t.name}</h4>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
