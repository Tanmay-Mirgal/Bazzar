'use client';

import * as React from 'react';
import Link from 'next/link';
import { Send, ShieldCheck, Heart, CreditCard, Lock, Truck, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to Bazzar VIP Club! Check your inbox for your 15% welcome code. 🎉');
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Exclusive VIP Privileges</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unlock 15% OFF Your Next Order
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Subscribe to Bazzar VIP Insider for early access to flash deals, secret coupon codes, and new arrivals.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form className="flex items-center gap-2 max-w-md mx-auto lg:ml-auto" onSubmit={handleSubscribe}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="h-12 rounded-full bg-slate-900/90 border-slate-700 text-xs text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <Button type="submit" className="h-12 px-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shrink-0 shadow-lg shadow-indigo-500/25">
                  {subscribed ? 'Subscribed!' : 'Join VIP'}
                  <Send className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-md">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                BAZZAR
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated e-commerce storefront delivering premium electronics, ergonomic footwear, luxury apparel, and daily workspace accessories directly to your doorstep.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Lock className="h-3.5 w-3.5" /> 256-Bit SSL Encrypted Checkout
              </span>
              <span className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Truck className="h-3.5 w-3.5" /> Express Nationwide Delivery
              </span>
              <span className="flex items-center gap-2 text-amber-400 font-semibold">
                <RefreshCw className="h-3.5 w-3.5" /> Hassle-Free 30-Day Exchange
              </span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Explore Collections
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/products" className="hover:text-indigo-400 transition-colors">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="hover:text-indigo-400 transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link href="/products?category=Footwear" className="hover:text-indigo-400 transition-colors">
                  Minimalist Footwear
                </Link>
              </li>
              <li>
                <Link href="/products?category=Apparel" className="hover:text-indigo-400 transition-colors">
                  Heavyweight Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="hover:text-indigo-400 transition-colors">
                  Everyday Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/cart" className="hover:text-indigo-400 transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-indigo-400 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-indigo-400 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Payment Methods */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Accepted Payment Methods
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We accept all major secure payment gateways including UPI, Cards, NetBanking, and Cash on Delivery.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded.lg text-[11px] font-bold">UPI / GPay</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg text-[11px] font-bold">Visa</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg text-[11px] font-bold">Mastercard</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg text-[11px] font-bold">RuPay</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Bazzar Commerce Inc. Designed for exceptional shopping.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security & Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
