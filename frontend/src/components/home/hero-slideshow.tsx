'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Flame, Zap, ShieldCheck, Star, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface HeroSlideshowProps {
  products?: Product[];
}

interface PromoSlide {
  id: string | number;
  badge: string;
  promoTitle: string;
  productName: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  linkHref: string;
  bgGradient: string;
  discountTag: string;
}

const promoBadges = [
  '🔥 TRENDING DEAL #1 • 25% OFF',
  '⚡ FLASH DROP • LIMITED INVENTORY',
  '🌟 STOREFRONT BESTSELLER • TOP RATED',
  '💎 EXCLUSIVE SELECTION • EXPRESS DISPATCH',
  '🏷️ SPECIAL OFFER • BAZZAR PERK',
];

const discountTags = [
  '25% OFF Code: BAZZAR10',
  'Free Express Shipping',
  'Top Rated 4.9 ★',
  'Authentic Guarantee',
  'Instant Exchange Eligible',
];

const bgGradients = [
  'from-[#111111] via-[#1A1C3B] to-[#111111]',
  'from-[#14201A] via-[#111111] to-[#14201A]',
  'from-[#231A12] via-[#111111] to-[#231A12]',
  'from-[#1F192E] via-[#111111] to-[#1F192E]',
  'from-[#2A191E] via-[#111111] to-[#2A191E]',
];

export function HeroSlideshow({ products = [] }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Build promotional slides from dynamic products array or fallback
  const slides: PromoSlide[] = React.useMemo(() => {
    if (products.length > 0) {
      return products.slice(0, 5).map((p, idx) => ({
        id: p.id,
        badge: promoBadges[idx % promoBadges.length],
        promoTitle: `Special Offer: ${p.name}`,
        productName: p.name,
        description: p.description,
        price: p.price,
        category: p.category || 'Featured',
        image: p.image,
        rating: p.rating || 4.8,
        linkHref: `/products/${p.id}`,
        bgGradient: bgGradients[idx % bgGradients.length],
        discountTag: discountTags[idx % discountTags.length],
      }));
    }

    // Fallback if products not yet loaded
    return [
      {
        id: '1',
        badge: '🔥 TRENDING DEAL #1 • 25% OFF',
        promoTitle: 'Smartphone Pro Max Flagship',
        productName: 'Smartphone Pro Max',
        description: '6.7-inch OLED display, 50MP triple camera, 5G capable flagship smartphone.',
        price: 79999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
        rating: 4.9,
        linkHref: '/products',
        bgGradient: bgGradients[0],
        discountTag: '25% OFF Code: BAZZAR10',
      },
      {
        id: '2',
        badge: '⚡ FLASH DROP • LIMITED INVENTORY',
        promoTitle: 'Laptop UltraBook 14 Performance',
        productName: 'Laptop UltraBook 14',
        description: 'Thin and light 14-inch laptop with Intel Core i7, 16GB RAM, and 512GB SSD.',
        price: 64999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
        rating: 4.8,
        linkHref: '/products',
        bgGradient: bgGradients[1],
        discountTag: 'Free Express Shipping',
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
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const slide = slides[currentSlide] || slides[0];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#262626] bg-[#111111] text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex items-center">
        
        {/* Dynamic Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.productName}
            className="w-full h-full object-cover transition-opacity duration-1000 opacity-35 scale-105 animate-pulse-glow"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
        </div>

        {/* Slide Content */}
        <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-16 w-full py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Promo Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider uppercase text-indigo-200">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>{slide.badge}</span>
              </div>

              {/* Product Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
                {slide.productName}
              </h1>

              {/* Product Description */}
              <p className="text-xs sm:text-base text-gray-300 max-w-xl leading-relaxed line-clamp-2">
                {slide.description}
              </p>

              {/* Price & Discount Pill */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {formatCurrency(slide.price)}
                </span>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {slide.discountTag}
                </span>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link href={slide.linkHref}>
                  <Button
                    size="lg"
                    className="rounded-xl bg-white hover:bg-gray-100 text-[#111111] font-bold text-xs h-13 px-8 shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4 text-[#3F46D8]" /> View Product Deal <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-13 px-6 transition-colors"
                  >
                    View All Trending
                  </Button>
                </Link>
              </div>

            </div>

            {/* Right Interactive Product Highlight Card */}
            <div className="hidden lg:flex lg:col-span-5 justify-end">
              <Link href={slide.linkHref} className="group glass-panel-dark rounded-2xl p-4 border border-white/20 w-80 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 block">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#1C1C1C] mb-3">
                  <img
                    src={slide.image}
                    alt={slide.productName}
                    className="w-full h-full object-cover img-hover-scale"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase tracking-wider bg-[#3F46D8] text-white px-2.5 py-0.5 rounded-full shadow-md">
                    {slide.category}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                      {slide.productName}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px] shrink-0">
                      <Star className="h-3 w-3 fill-amber-400" /> {slide.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="font-bold text-white text-sm">{formatCurrency(slide.price)}</span>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">In Stock</span>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              currentSlide === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
