'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CategoryItem {
  id: number | string;
  name: string;
}

interface CategoryCarouselProps {
  categories: CategoryItem[];
}

const categoryImages: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  Clothing: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  Apparel: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
  Accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  Books: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
  Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'Home & Office': 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800',
};

const categorySubtitles: Record<string, string> = {
  Electronics: 'Smartphones, Laptops & Smartwatches',
  Clothing: '100% Organic Cotton Tees & Denim',
  Apparel: 'Heavyweight Hoodies & Outerwear',
  Accessories: 'RFID Leather Wallets & Sunglasses',
  Books: 'Clean Code & Developer Books',
  Footwear: 'Ergonomic Runners & Sneakers',
  'Home & Office': 'Minimalist Desk Setup',
};

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header with Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E8E8] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8] flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Interactive Slider
          </span>
          <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">
            Explore Categories
          </h2>
        </div>

        {/* Navigation Arrows & View All */}
        <div className="flex items-center gap-3">
          <button
            onClick={scrollLeft}
            className="h-10 w-10 rounded-full border border-[#E8E8E8] bg-white hover:bg-[#111111] hover:text-white flex items-center justify-center transition-colors shadow-xs"
            aria-label="Scroll Categories Left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollRight}
            className="h-10 w-10 rounded-full border border-[#E8E8E8] bg-white hover:bg-[#111111] hover:text-white flex items-center justify-center transition-colors shadow-xs"
            aria-label="Scroll Categories Right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Link
            href="/products"
            className="text-xs font-bold text-[#111111] hover:text-[#3F46D8] flex items-center gap-1 ml-2"
          >
            All Catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
      >
        {categories.map((cat) => {
          const catName = cat.name;
          const imgSrc = categoryImages[catName] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
          const subtitle = categorySubtitles[catName] || 'Curated store lineup';

          return (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(catName)}`}
              className="group relative shrink-0 w-[270px] sm:w-[320px] snap-start flex flex-col justify-end overflow-hidden rounded-2xl bg-[#F7F7F5] border border-[#E8E8E8] aspect-[3/4] p-6 transition-all duration-300 hover:shadow-xl hover:border-[#3F46D8]/50"
            >
              <img
                src={imgSrc}
                alt={catName}
                className="absolute inset-0 object-cover w-full h-full img-hover-scale"
              />

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity group-hover:from-black/95" />

              <div className="relative z-10 space-y-1.5 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20 inline-block">
                  {subtitle}
                </span>
                <h3 className="text-2xl font-black tracking-tight">{catName}</h3>
                <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs font-semibold text-white/90">
                  <span>Browse Category</span>
                  <div className="h-8 w-8 rounded-full bg-white/20 group-hover:bg-white group-hover:text-[#111111] flex items-center justify-center transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
