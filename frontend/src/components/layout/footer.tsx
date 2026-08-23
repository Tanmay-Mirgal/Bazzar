'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Truck, RefreshCw } from 'lucide-react';
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
    toast.success('Thank you for subscribing to Bazzar newsletter.');
    setEmail('');
  };

  return (
    <footer className="bg-[#111111] text-white border-t border-[#111111]">
      {/* Newsletter Section */}
      <div className="border-b border-[#262626] py-14 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Stay in the loop.
            </h3>
            <p className="text-xs text-[#A3A3A3] max-w-md">
              Receive updates on new collection releases, seasonal edits, and exclusive storefront offers.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form className="flex items-center gap-2 max-w-md ml-auto" onSubmit={handleSubscribe}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="h-11 rounded-none bg-[#1C1C1C] border-[#333333] text-xs text-white placeholder:text-[#737373] focus-visible:ring-1 focus-visible:ring-white"
              />
              <Button type="submit" className="h-11 px-6 rounded-none bg-white text-[#111111] hover:bg-[#E5E5E5] font-semibold text-xs shrink-0 transition-colors">
                {subscribed ? 'Subscribed' : 'Subscribe'}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="text-xl font-black tracking-tight text-white uppercase">
              BAZZAR
            </Link>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Curated e-commerce storefront for electronics, minimalist footwear, luxury apparel, and everyday lifestyle essentials.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-[#A3A3A3]">
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-white" /> 256-Bit SSL Encrypted Checkout
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-white" /> Express Doorstep Shipping
              </span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=Footwear" className="hover:text-white transition-colors">
                  Footwear
                </Link>
              </li>
              <li>
                <Link href="/products?category=Apparel" className="hover:text-white transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Payments & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Payment Gateways
            </h4>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              We accept all major secure payment options including UPI, Cards, NetBanking, and Cash on Delivery.
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-mono text-[#A3A3A3]">
              <span className="border border-[#333333] px-2 py-0.5 rounded-none">UPI</span>
              <span className="border border-[#333333] px-2 py-0.5 rounded-none">VISA</span>
              <span className="border border-[#333333] px-2 py-0.5 rounded-none">MASTERCARD</span>
              <span className="border border-[#333333] px-2 py-0.5 rounded-none">RUPAY</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-[#262626] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#737373] gap-4">
          <p>© {new Date().getFullYear()} Bazzar Commerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
