import Link from 'next/link';
import { 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Star, 
  Sparkles, 
  Zap, 
  Award, 
  Flame, 
  Quote, 
  TrendingUp,
  PackageCheck,
  Timer
} from 'lucide-react';
import { getFeaturedProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { HeroSlideshow } from '@/components/home/hero-slideshow';
import { CategoryCarousel } from '@/components/home/category-carousel';

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

  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: 'Verified Buyer',
      location: 'Mumbai, MH',
      rating: 5,
      comment: 'Ordered the Smartphone Pro Max on Bazzar. Packed securely with 100% genuine seal, arrived within 24 hours in Mumbai!',
      product: 'Smartphone Pro Max'
    },
    {
      name: 'Priya Patel',
      role: 'Verified Buyer',
      location: 'Bengaluru, KA',
      rating: 5,
      comment: 'The RFID Leather Wallet quality is outstanding. Premium stitching and compact design. Bazzar checkout was super fast.',
      product: 'Slim Leather Wallet'
    },
    {
      name: 'Rohan Mehta',
      role: 'Verified Buyer',
      location: 'Delhi, NCR',
      rating: 5,
      comment: 'Got my copy of Clean Code & Laptop UltraBook together. Super smooth experience, transparent tracking, highly recommended!',
      product: 'Clean Code & UltraBook 14'
    }
  ];

  return (
    <div className="flex flex-col gap-14 md:gap-20 pb-20 bg-white text-[#111111]">
      
      {/* ── AMAZON-STYLE HERO SLIDESHOW SECTION ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <HeroSlideshow products={featuredProducts} />
      </section>

      {/* ── FLASH SALE & LIMITED TIME DEALS BANNER ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#111111] text-white p-6 sm:p-10 border border-[#262626] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#3F46D8] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
              <Timer className="h-3.5 w-3.5" /> Flash Drop Deals
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Special Storefront Offers • Up to <span className="text-indigo-300">40% OFF</span>
            </h2>
            <p className="text-xs text-gray-400 max-w-lg">
              Limited inventory available for Smartphone Pro Max, Leather Wallets, and Clean Code books. Order now before stock runs out.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link href="/products">
              <Button size="lg" className="rounded-xl bg-white text-[#111111] hover:bg-gray-100 font-bold text-xs h-12 px-8 transition-colors shadow-md">
                Claim Flash Deals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SCROLLABLE CATEGORIES CAROUSEL (Horizontal Scroll Slider) ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
        <CategoryCarousel categories={categories} />
      </section>

      {/* ── FEATURED PRODUCTS SHOWCASE ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E8E8] pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8] flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Direct Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-[#111111] hover:text-[#3F46D8] flex items-center gap-1 group">
            Browse Full Store ({featuredProducts.length} Items) <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── BRAND GUARANTEE & SERVICE COMMITMENT ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs hover:border-[#3F46D8]/40 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E8] text-[#3F46D8] flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wide">Express Delivery</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">Free door-to-door express delivery on orders over ₹1,499.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs hover:border-[#3F46D8]/40 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E8] text-[#3F46D8] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wide">100% Authentic</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">Direct manufacturer warranty & verified origin guarantee.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs hover:border-[#3F46D8]/40 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E8] text-[#3F46D8] flex items-center justify-center shrink-0">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wide">30-Day Returns</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">Instant return pickup & hassle-free refund process.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs hover:border-[#3F46D8]/40 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E8] text-[#3F46D8] flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wide">256-Bit Security</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">Bank-grade SSL encryption for safe UPI, Cards & NetBanking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VERIFIED CUSTOMER TESTIMONIALS ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8] inline-flex items-center gap-1">
            <Quote className="h-3.5 w-3.5" /> Verified Customer Feedback
          </span>
          <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">Real Reviews From Real Buyers</h2>
          <p className="text-xs text-[#6B6B6B]">Read what Bazzar storefront members have to say about their orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="flex flex-col justify-between p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E8] hover:border-[#3F46D8]/40 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <PackageCheck className="h-3 w-3" /> {t.role}
                  </span>
                </div>
                <p className="text-xs text-[#333333] leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-6 border-t border-[#E8E8E8] mt-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#111111]">{t.name}</h4>
                  <p className="text-[10px] text-[#6B6B6B]">{t.location}</p>
                </div>
                <span className="text-[10px] font-semibold text-[#3F46D8] bg-[#3F46D8]/10 px-2.5 py-1 rounded-md">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BAZZAR INSIDER CLUB BANNER ── */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#F7F7F5] via-white to-[#F7F7F5] border border-[#E8E8E8] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8] inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Bazzar Insider Coupon
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Get 10% Off Your First Order
            </h3>
            <p className="text-xs text-[#6B6B6B] max-w-lg">
              Use promo code <strong className="font-mono text-[#3F46D8] bg-[#3F46D8]/10 px-2 py-0.5 rounded font-bold">BAZZAR10</strong> at checkout to unlock instant discount & free express doorstep delivery.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/products">
              <Button size="lg" className="rounded-xl bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs h-12 px-8 transition-colors shadow-md">
                Claim 10% Coupon & Shop <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}



