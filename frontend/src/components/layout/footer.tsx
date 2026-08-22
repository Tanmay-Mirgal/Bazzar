'use client';

import Link from 'next/link';
import { Send, ShieldCheck, Heart, CreditCard, Lock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Join the Bazzar VIP Club
            </h3>
            <p className="text-xs text-slate-400">
              Subscribe to get special discount codes, flash deal alerts, and new product releases directly in your inbox.
            </p>
          </div>
          <div className="lg:col-span-6">
            <form className="flex items-center gap-2 max-w-md ml-auto" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email address..."
                className="h-11 rounded-full bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
              />
              <Button type="submit" className="h-11 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-md shadow-indigo-600/30">
                Subscribe <Send className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                BAZZAR
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your premier destination for high-end electronics, luxury fashion, best-selling literature, and daily lifestyle essentials.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-emerald-400" /> SSL Secured</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-indigo-400" /> Fast Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-indigo-400 transition-colors">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="hover:text-indigo-400 transition-colors">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link href="/products?category=Clothing" className="hover:text-indigo-400 transition-colors">
                  Apparel & Fashion
                </Link>
              </li>
              <li>
                <Link href="/products?category=Books" className="hover:text-indigo-400 transition-colors">
                  Books & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-indigo-400 transition-colors">
                  My Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-indigo-400 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition-colors cursor-pointer">
                  Returns & Refunds
                </span>
              </li>
            </ul>
          </div>

          {/* Architecture Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Bazzar Platform
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Spring Boot 3 REST API + Neon Cloud PostgreSQL backend with Next.js 16 frontend.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <CreditCard className="h-4 w-4 text-slate-500" />
              <span>Accepting UPI, Cards, NetBanking, COD</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Bazzar E-Commerce. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

