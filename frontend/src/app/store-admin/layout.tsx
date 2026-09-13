'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Store,
  PlusCircle,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiAuth } from '@/lib/hooks/useApiAuth';

const navItems = [
  { label: 'Dashboard', href: '/store-admin', icon: LayoutDashboard },
  { label: 'My Products', href: '/store-admin/products', icon: Package },
  { label: 'Add Product', href: '/store-admin/products/add', icon: PlusCircle },
  { label: 'Orders', href: '/store-admin/orders', icon: ShoppingBag },
  { label: 'Analytics & Revenue', href: '/store-admin/analytics', icon: BarChart3 },
  { label: 'Store Settings', href: '/store-admin/settings', icon: Settings },
];

export default function StoreAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyRole = async () => {
      if (!user) return;
      try {
        const token = await getApiToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          const role = profile.role;
          if (role === 'ROLE_STORE_ADMIN' || role === 'ROLE_SUPER_ADMIN') {
            setAuthorized(true);
            return;
          }
        }
        setAuthorized(false);
        router.push('/become-seller');
      } catch (e) {
        console.error('Role verification failed', e);
        setAuthorized(false);
        router.push('/become-seller');
      }
    };

    if (isLoaded && user) {
      verifyRole();
    }
  }, [user, isLoaded]);

  if (!isLoaded || authorized === null) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3F46D8] border-t-transparent" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-[#E8E8E8] fixed h-full z-10">
        {/* Brand */}
        <div className="p-5 border-b border-[#E8E8E8]">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#111111] flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111111] leading-none">Bazzar</p>
              <p className="text-[10px] text-[#6B6B6B]">Seller Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/store-admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  active
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-[#6B6B6B] hover:bg-[#F7F7F5] hover:text-[#111111]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111111] truncate">{user?.fullName}</p>
              <p className="text-[10px] text-[#6B6B6B] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8E8E8]">
          <Link href="/" className="font-extrabold text-[#111111]">Bazzar Seller</Link>
          <UserButton />
        </div>
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E8E8E8] flex">
          {navItems.slice(0, 4).map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/store-admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-2 text-[10px] font-semibold transition-colors ${
                  active ? 'text-[#111111]' : 'text-[#AAAAAA]'
                }`}
              >
                <Icon className="h-4 w-4 mb-0.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 pb-24 md:pb-6">{children}</div>
      </main>
    </div>
  );
}
