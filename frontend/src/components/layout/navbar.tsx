'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Menu,
  User,
  Sparkles,
  Heart,
  Zap,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Copy,
  Check,
  Headphones,
  Shirt,
  BookOpen,
  Watch,
  Grid
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { getCurrentUser, logout } from '@/lib/api/auth';
import { User as UserType } from '@/types/user';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

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
    toast.success('Signed out successfully');
    router.push('/');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('BAZZAR10');
    setCopiedCode(true);
    toast.success('Coupon code BAZZAR10 copied to clipboard! 🎉');
    setTimeout(() => setCopiedCode(false), 2000);
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
    { href: '/products', label: 'All Catalog' },
    { href: '/products?category=Electronics', label: 'Electronics' },
    { href: '/products?category=Footwear', label: 'Footwear' },
    { href: '/products?category=Apparel', label: 'Apparel' },
    { href: '/products?category=Accessories', label: 'Accessories' },
  ];

  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.email === 'admin@bazzar.com';

  return (
    <header className="sticky top-0 z-50 w-full flex-col shadow-xs">
      {/* Top Announcement Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-indigo-900/50">
        <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
        <span className="truncate">
          Special Offer: Get <strong className="text-amber-400 font-bold">10% Instant Cashback</strong> on your order with code{' '}
        </span>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 bg-indigo-600/80 hover:bg-indigo-500 text-white px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border border-indigo-400/40 transition-all hover:scale-105"
          title="Click to copy coupon code"
        >
          {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          BAZZAR10
        </button>
      </div>

      {/* Main Glass Header Navigation */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1 leading-none">
                  BAZZAR
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">STORE FRONT</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-bold ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {mounted && isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-black flex items-center gap-1.5 ${
                    pathname.startsWith('/admin')
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300/80'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Search Bar & User Actions */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex relative items-center w-52 md:w-64"
            >
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 text-xs rounded-full border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all shadow-xs"
              />
            </form>

            {/* Wishlist Icon */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-slate-800 hover:text-rose-600 hover:bg-rose-50 transition-all"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {mounted && wishlistItemsCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 rounded-full p-0 flex items-center justify-center text-[10px] font-black bg-rose-600 text-white shadow-md shadow-rose-500/30"
                  >
                    {wishlistItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart Icon */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                aria-label="Shopping Cart"
                title="Shopping Bag"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 rounded-full p-0 flex items-center justify-center text-[10px] font-black bg-indigo-600 text-white shadow-md shadow-indigo-600/30 animate-pulse-slow"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account State */}
            {mounted && currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-100 text-slate-900 font-bold text-xs px-3.5 py-1.5 rounded-full border-slate-200 shadow-xs flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>{currentUser.name}</span>
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
                  className="h-10 px-5 rounded-full font-bold text-xs bg-slate-900 hover:bg-indigo-600 text-white transition-all shadow-md shadow-slate-900/10"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Drawer Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-slate-800"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white p-6">
                  <SheetHeader className="text-left border-b border-slate-100 pb-4">
                    <SheetTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black">B</div>
                      BAZZAR STORE
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    {/* Search Input in Drawer */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 text-xs rounded-full bg-slate-50 border-slate-200"
                      />
                    </form>

                    {/* Navigation Items */}
                    <div className="flex flex-col space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`text-xs font-bold py-3 px-3.5 rounded-xl flex items-center justify-between transition-colors ${
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
                      {mounted && currentUser ? (
                        <Button onClick={handleLogout} variant="outline" className="w-full justify-center rounded-full h-11 border-rose-200 text-rose-600 font-bold text-xs">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out ({currentUser.name})
                        </Button>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-center rounded-full h-11 border-slate-300 font-bold text-xs">
                              <User className="h-4 w-4 mr-2" />
                              Sign In
                            </Button>
                          </Link>
                          <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="default" className="w-full justify-center rounded-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md">
                              Create Free Account
                            </Button>
                          </Link>
                        </>
                      )}
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
