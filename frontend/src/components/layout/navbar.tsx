'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, User, Sparkles, Heart, Zap, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { getCurrentUser, logout } from '@/lib/api/auth';
import { User as UserType } from '@/types/user';
import { ShieldCheck, LogOut } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(null);

  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const wishlistItemsCount = wishlistItems.length;

  React.useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Store Catalog' },
    { href: '/products?category=Electronics', label: 'Electronics' },
    { href: '/products?category=Clothing', label: 'Fashion' },
    { href: '/products?category=Books', label: 'Books' },
  ];

  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.email === 'admin@bazzar.com';

  return (
    <header className="sticky top-0 z-50 w-full flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-xs">
        <Zap className="h-3.5 w-3.5 animate-bounce fill-amber-300 text-amber-300" />
        <span>Grand Opening Sale: Extra 10% OFF with code <strong className="bg-white/20 px-1.5 py-0.5 rounded text-white tracking-wider font-mono">BAZZAR10</strong> • Free Express Shipping Available</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                B
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                BAZZAR
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {mounted && isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-full transition-all text-xs font-bold flex items-center gap-1.5 ${
                    pathname.startsWith('/admin')
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-amber-600 hover:bg-amber-50 border border-amber-200/80'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Search Bar & User Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex relative items-center w-56 md:w-64"
            >
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 text-xs rounded-full border-slate-200 bg-slate-50/80 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all shadow-xs"
              />
            </form>

            {/* Wishlist Link with Animated Badge */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-slate-800 hover:text-rose-600 hover:bg-rose-50 transition-all"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {mounted && wishlistItemsCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-rose-600 text-white shadow-md shadow-rose-500/30"
                  >
                    {wishlistItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart Link with Animated Badge */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-indigo-600 text-white shadow-md shadow-indigo-500/30 animate-pulse-slow"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account State */}
            {mounted && currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-full border-slate-200">
                  <User className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                  {currentUser.name} {isAdmin && '(Admin)'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 rounded-full font-semibold text-xs bg-slate-900 hover:bg-indigo-600 text-white transition-all shadow-sm"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-slate-700"
                    aria-label="Open menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white p-6">
                  <SheetHeader className="text-left border-b border-slate-100 pb-4">
                    <SheetTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">B</div>
                      BAZZAR STORE
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 text-sm rounded-full bg-slate-50 border-slate-200"
                      />
                    </form>

                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`text-sm font-semibold py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors ${
                            pathname === link.href
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{link.label}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full justify-center rounded-full h-11 border-slate-300 font-semibold text-xs">
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="default" className="w-full justify-center rounded-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20">
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

