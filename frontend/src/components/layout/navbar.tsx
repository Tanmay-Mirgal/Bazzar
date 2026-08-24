'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, User, Heart, ShieldCheck, LogOut, ChevronRight, X, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { getProducts } from '@/lib/api/products';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
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
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(null);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const wishlistItemsCount = wishlistItems.length;

  React.useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  // Live Autocomplete Debounced Fetch
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getProducts({ search: searchQuery.trim() });
        setSearchResults(results.slice(0, 5));
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    toast.success('Signed out successfully');
    router.push('/');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E8E8E8]">
      {/* Announcement Bar */}
      <div className="bg-[#111111] text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        Complimentary express delivery on all orders over ₹1,499 • Code: <strong className="font-mono text-indigo-300">BAZZAR10</strong>
      </div>

      {/* Main Header Container */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Bazzar Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-black tracking-tight text-[#111111] uppercase">
                BAZZAR
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wide text-[#6B6B6B]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors py-1 ${
                      isActive ? 'text-[#111111] font-bold border-b-2 border-[#111111]' : 'hover:text-[#111111]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {mounted && isAdmin && (
                <Link
                  href="/admin"
                  className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            
            {/* Desktop Live Autocomplete Search Bar */}
            <div ref={searchContainerRef} className="hidden sm:block relative w-56 md:w-72">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-[#6B6B6B]" />
                <Input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowSearchResults(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs rounded-xl border-[#E8E8E8] bg-[#FAF9F6] focus-visible:ring-1 focus-visible:ring-[#111111] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2.5 text-[#6B6B6B] hover:text-[#111111]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Autocomplete Dropdown */}
              {showSearchResults && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E8E8E8] z-50 overflow-hidden text-xs animate-in fade-in">
                  <div className="p-2.5 border-b border-[#E8E8E8] bg-[#FAF9F6] text-[10px] font-black uppercase tracking-wider text-[#6B6B6B] flex items-center justify-between">
                    <span>Matches ({searchResults.length})</span>
                    {isSearching && <Loader2 className="h-3 w-3 animate-spin text-[#3F46D8]" />}
                  </div>

                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-4 text-center text-xs text-[#6B6B6B]">
                      No products matching "<span className="font-bold text-[#111111]">{searchQuery}</span>"
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8E8E8] max-h-64 overflow-y-auto">
                      {searchResults.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-[#FAF9F6] transition-colors group"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-10 w-10 object-cover rounded-lg border border-[#E8E8E8] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[#111111] truncate group-hover:text-[#3F46D8] transition-colors">
                              {prod.name}
                            </p>
                            <span className="text-[10px] text-[#6B6B6B] font-semibold">{prod.category}</span>
                          </div>
                          <span className="font-black text-[#111111] text-xs shrink-0">
                            {formatCurrency(prod.price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleSearchSubmit()}
                    className="w-full p-3 bg-[#111111] text-white hover:bg-[#3F46D8] font-bold text-center text-[11px] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View all results for "{searchQuery}"</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link href="/wishlist" className="relative p-2 text-[#111111] hover:text-[#3F46D8] transition-colors" title="Wishlist">
              <Heart className="h-5 w-5" />
              {mounted && wishlistItemsCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full text-[9px] font-bold bg-[#3F46D8] text-white flex items-center justify-center">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link href="/cart" className="relative p-2 text-[#111111] hover:text-[#3F46D8] transition-colors" title="Shopping Bag">
              <ShoppingBag className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full text-[9px] font-bold bg-[#111111] text-white flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User State */}
            {mounted && currentUser ? (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
                <span className="text-[#111111] font-bold">{currentUser.name}</span>
                <button onClick={handleLogout} className="text-[#6B6B6B] hover:text-rose-600 p-1" title="Sign Out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button size="sm" className="h-9 px-4 rounded-xl bg-[#111111] hover:bg-[#3F46D8] text-white text-xs font-semibold transition-colors shadow-xs">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Drawer */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-[#111111]" aria-label="Open navigation menu">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white p-6 border-l border-[#E8E8E8]">
                  <SheetHeader className="text-left border-b border-[#E8E8E8] pb-4">
                    <SheetTitle className="text-lg font-black tracking-tight text-[#111111] uppercase flex items-center gap-2">
                      <img src="/logo.png" alt="Bazzar Logo" className="h-6 w-6 object-contain" />
                      BAZZAR
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 text-xs rounded-xl bg-[#FAF9F6] border-[#E8E8E8]"
                      />
                    </form>

                    <div className="flex flex-col space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs font-semibold py-3 border-b border-[#E8E8E8] text-[#111111] flex items-center justify-between"
                        >
                          <span>{link.label}</span>
                          <ChevronRight className="h-4 w-4 text-[#6B6B6B]" />
                        </Link>
                      ))}

                      {mounted && isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs font-bold py-3 border-b border-[#E8E8E8] text-indigo-600 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Admin Console</span>
                          <ChevronRight className="h-4 w-4 text-indigo-600" />
                        </Link>
                      )}
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      {mounted && currentUser ? (
                        <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-10 border-[#E8E8E8] text-xs font-semibold">
                          Sign Out ({currentUser.name})
                        </Button>
                      ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full rounded-xl h-10 bg-[#111111] text-white text-xs font-semibold">
                            Sign In / Create Account
                          </Button>
                        </Link>
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
