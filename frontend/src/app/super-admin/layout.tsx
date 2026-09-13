'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  FileText,
  Shield,
  ShoppingBag,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Overview', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Applications', href: '/super-admin/applications', icon: FileText },
  { label: 'Products', href: '/super-admin/products', icon: Package },
  { label: 'Orders', href: '/super-admin/orders', icon: ShoppingBag },
  { label: 'Users', href: '/super-admin/users', icon: Users },
  { label: 'Stores', href: '/super-admin/stores', icon: Store },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const verifySuperAdmin = async () => {
      if (!user) return;
      const emails: string[] = [
        user?.primaryEmailAddress?.emailAddress,
        ...(user?.emailAddresses || []).map((e) => e.emailAddress),
      ]
        .filter(Boolean)
        .map((e) => (e as string).toLowerCase());

      const isKnownSuperAdmin = emails.some(
        (e) =>
          e === 'tanmaymirgal26@gmail.com' ||
          e === 'admin@bazzar.com'
      );

      if (isKnownSuperAdmin || (user.publicMetadata as { role?: string })?.role === 'ROLE_SUPER_ADMIN') {
        setAuthorized(true);
        return;
      }

      try {
        const token = await getApiToken();
        const primaryEmail = emails[0] || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-Email': primaryEmail,
          },
        });
        if (res.ok) {
          const profile = await res.json();
          if (profile.role === 'ROLE_SUPER_ADMIN') {
            setAuthorized(true);
            return;
          }
        }
        setAuthorized(false);
      } catch (err) {
        console.error('Super admin authorization check failed', err);
        setAuthorized(false);
      }
    };

    if (isLoaded && user) {
      verifySuperAdmin();
    }
  }, [user, isLoaded]);

  if (!isLoaded || authorized === null) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3F46D8] border-t-transparent" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E8E8E8] rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-200 mx-auto flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#111111]">Super Admin Access Required</h1>
            <p className="text-xs text-[#6B6B6B] mt-2">
              This area is restricted to platform super-administrators. Your account currently does not possess super-admin privileges.
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold text-xs h-10"
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      {/* Light Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-[#E8E8E8] fixed h-full z-10">
        {/* Brand */}
        <div className="p-5 border-b border-[#E8E8E8]">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#111111] flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111111] leading-none">Bazzar Admin</p>
              <p className="text-[10px] text-[#6B6B6B]">Super Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/super-admin' && pathname.startsWith(href));
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
              <p className="text-[10px] text-[#6B6B6B] truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8E8E8]">
          <span className="font-extrabold text-[#111111] text-sm">Bazzar Admin</span>
          <UserButton />
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
