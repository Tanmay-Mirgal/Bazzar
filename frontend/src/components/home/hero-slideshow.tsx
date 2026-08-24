'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Star, Tag, ShieldCheck, Truck, ArrowUpRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface HeroSlideshowProps {
  products?: Product[];
}

interface FeatureSlide {
  id: string | number;
  productName: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  badge: string;
  linkHref: string;
}

const slideBadges = [
  '🔥 BESTSELLER #1 • 25% OFF',
  '⚡ FLASH DROP • LIMITED INVENTORY',
  '🌟 STORE SPOTLIGHT • TOP RATED',
  '💎 EXCLUSIVE SELECTION • EXPRESS DISPATCH',
];

export function HeroSlideshow({ products = [] }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Build slides from dynamic catalog products or fallback
  const slides: FeatureSlide[] = React.useMemo(() => {
    if (products.length > 0) {
      return products.slice(0, 5).map((p, idx) => ({
        id: p.id,
        productName: p.name,
        category: p.category || 'Featured',
        price: p.price,
        description: p.description || 'Premium flagship product crafted with authentic build quality and performance.',
        image: p.image,
        rating: p.rating || 4.8,
        badge: slideBadges[idx % slideBadges.length],
        linkHref: `/products/${p.id}`,
      }));
    }

    return [
      {
        id: '1',
        productName: 'Smartphone Pro Max',
        category: 'Electronics',
        price: 79999,
        description: '6.7-inch OLED display, 50MP triple camera, 5G capable flagship smartphone.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000',
        rating: 4.9,
        badge: '🔥 BESTSELLER #1 • 25% OFF',
        linkHref: '/products',
      },
      {
        id: '2',
        productName: 'Laptop UltraBook 14',
        category: 'Electronics',
        price: 64999,
        description: 'Thin and light 14-inch laptop with Intel Core i7, 16GB RAM, and 512GB SSD.',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000',
        rating: 4.8,
        badge: '⚡ FLASH DROP • LIMITED INVENTORY',
        linkHref: '/products',
      },
    ];
  }, [products]);

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  React.useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const slide = slides[currentSlide] || slides[0];

  return (
    <div
      className="relative w-full rounded-3xl bg-gradient-to-br from-[#F7F7F9] via-[#FAF9FB] to-[#F1F3F9] border border-[#E5E5E0] shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12 text-[#111111]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Headline & Call to Actions */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Top Store Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E0] shadow-2xs text-xs font-extrabold uppercase tracking-wider text-[#3F46D8]">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" />
            <span>BAZZAR OFFICIAL STORE • 2026 CATALOG</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[#111111]">
            Everything You Need. Delivered Instantly.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-[#6B6B6B] max-w-lg leading-relaxed">
            Shop flagship smartphones, laptops, wearables, and apparel from verified brands with instant 24h express shipping and guaranteed quality.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href="/products" className="flex-1 sm:flex-initial">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-2xl bg-[#111111] hover:bg-[#3F46D8] text-white font-extrabold text-xs sm:text-sm h-12 sm:h-14 px-8 shadow-md hover:scale-105 transition-all duration-300"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Explore Store Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/products?category=Electronics" className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-2xl border-[#E5E5E0] bg-white hover:bg-gray-100 text-[#111111] font-bold text-xs sm:text-sm h-12 sm:h-14 px-6 transition-colors shadow-2xs"
              >
                Daily Flash Deals <Flame className="ml-1.5 h-4 w-4 text-amber-500" />
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-[#E5E5E0] flex flex-wrap items-center gap-6 text-xs text-[#6B6B6B] font-semibold">
            <div className="flex items-center gap-1.5 text-[#111111]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-extrabold">4.9 ★ Rating</span> (12K+ Verified Orders)
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-[#3F46D8]" /> Express Shipping &gt; ₹1,499
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% Genuine Quality
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Interactive Product Showcase Box */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            
            <Link href={slide.linkHref} className="group block relative rounded-3xl p-4 bg-white border border-[#E5E5E0] shadow-md hover:shadow-xl transition-all duration-500">
              
              {/* Product Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF9FB] mb-3">
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.productName}
                  className="w-full h-full object-cover img-hover-scale"
                />

                {/* Promo Badge */}
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider bg-[#111111] text-white px-3 py-1 rounded-full shadow-sm">
                  {slide.badge}
                </span>

                {/* Category Badge */}
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#111111] px-2.5 py-1 rounded-full shadow-sm border border-[#E5E5E0]">
                  {slide.category}
                </span>
              </div>

              {/* Card Footer */}
              <div className="space-y-2 p-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#111111] line-clamp-1 group-hover:text-[#3F46D8] transition-colors">
                    {slide.productName}
                  </h3>
                  <span className="text-xs font-black text-[#111111] shrink-0 ml-2">
                    {formatCurrency(slide.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E0] text-xs">
                  <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> {slide.rating.toFixed(1)} (48 reviews)
                  </span>
                  <span className="text-[11px] font-bold text-[#3F46D8] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    View Deal <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Navigation Dots & Arrows Below Card */}
            <div className="flex items-center justify-between mt-4 px-2">
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-6 bg-[#111111]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-[#E5E5E0] text-[#111111] flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-[#E5E5E0] text-[#111111] flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
