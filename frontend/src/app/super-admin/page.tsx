'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  Users,
  Store,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  pendingApplications: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  platformTotalRevenue?: number;
  platformCommissionFee?: number;
  platformStorePayouts?: number;
}

export default function SuperAdminDashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  
  // Instant load from session cache if available
  const [stats, setStats] = useState<Stats | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('bazzar_super_admin_stats');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('bazzar_super_admin_stats');
    }
    return true;
  });

  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (!stats) setLoading(true);
    setErrorMsg(null);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        token = await getApiToken();
      }

      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/dashboard/stats`, {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('bazzar_super_admin_stats', JSON.stringify(data));
        }
        setErrorMsg(null);
      } else {
        const errText = await res.text();
        console.error('Dashboard stats API error:', res.status, errText);
        if (!stats) {
          setErrorMsg(`Failed to load stats (Status ${res.status}). Click Refresh to retry.`);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      if (!stats) {
        setErrorMsg(err?.message?.includes('aborted') ? 'Backend took too long. Click Refresh to retry.' : 'Network error while loading stats. Please click Refresh.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getApiToken, stats]);

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchStats();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user, fetchStats]);

  const cards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      href: '/super-admin/users',
    },
    {
      label: 'Active Stores',
      value: stats?.totalStores ?? 0,
      icon: Store,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      href: '/super-admin/stores',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      href: '/super-admin/products',
    },
    {
      label: 'Platform Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      href: '/super-admin/orders',
    },
    {
      label: 'Pending Applications',
      value: stats?.pendingApplications ?? 0,
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      href: '/super-admin/applications',
      urgent: (stats?.pendingApplications ?? 0) > 0,
    },
  ];

  const productStats = [
    {
      label: 'Pending Approval',
      value: stats?.pendingProducts ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Approved & Live',
      value: stats?.approvedProducts ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Rejected',
      value: stats?.rejectedProducts ?? 0,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const Skeleton = () => <span className="inline-block h-7 w-16 bg-[#E8E8E8] animate-pulse rounded-lg" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-[#3F46D8]" />
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Platform Overview</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111]">
            Welcome back, {user?.firstName ?? 'Admin'} 🛡️
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Here's a snapshot of the Bazzar platform</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto gap-2 border-[#E8E8E8] hover:border-[#3F46D8] text-xs font-bold rounded-xl h-10 px-4"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>

      {errorMsg && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchStats(true)}
            className="text-xs font-bold text-red-700 hover:bg-red-100 h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Revenue & 5% / 95% Commission Distribution Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                Live Financial Distribution
              </span>
              <span className="text-xs text-indigo-200/70 font-semibold">5% Platform Cut · 95% Store Payouts</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Platform Revenue & Commission Split</h2>
            <p className="text-xs text-indigo-200/80 max-w-xl">
              Automatic revenue distribution model: 5% platform commission retained by Super Admin, 95% net earnings disbursed to store owners.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-indigo-200/80 uppercase block">Gross Platform GMV</span>
              <span className="text-lg font-black text-white">
                ₹{(stats?.platformTotalRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">100% Volume</span>
            </div>

            <div className="bg-emerald-500/15 backdrop-blur-md rounded-xl p-3.5 border border-emerald-500/30 text-center">
              <span className="text-[10px] font-bold text-emerald-300 uppercase block">5% Platform Cut</span>
              <span className="text-lg font-black text-emerald-400">
                +₹{(stats?.platformCommissionFee ?? Math.round((stats?.platformTotalRevenue ?? 0) * 0.05)).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-300/80 font-semibold block mt-0.5">Super Admin Share</span>
            </div>

            <div className="bg-indigo-500/15 backdrop-blur-md rounded-xl p-3.5 border border-indigo-500/30 text-center">
              <span className="text-[10px] font-bold text-indigo-300 uppercase block">95% Seller Payouts</span>
              <span className="text-lg font-black text-indigo-300">
                ₹{(stats?.platformStorePayouts ?? Math.round((stats?.platformTotalRevenue ?? 0) * 0.95)).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-indigo-300/80 font-semibold block mt-0.5">To Store Admins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, href, urgent }) => (
          <Link key={label} href={href}>
            <div className={`bg-white border rounded-2xl p-5 space-y-3 hover:border-[#3F46D8] hover:shadow-md transition-all cursor-pointer group ${
              urgent ? 'border-amber-400 shadow-sm shadow-amber-500/10' : 'border-[#E8E8E8]'
            }`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#111111]">
                  {loading ? <Skeleton /> : value.toLocaleString()}
                </div>
                <p className="text-xs text-[#6B6B6B] font-medium mt-0.5">{label}</p>
                {urgent && (
                  <span className="text-[10px] font-bold text-amber-600 mt-1 block">Action needed →</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Product Stats */}
      <div>
        <h2 className="text-sm font-extrabold text-[#111111] mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-[#3F46D8]" /> Product Approval Status
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {productStats.map(({ label, value, icon: Icon, color, bg }) => (
            <Link key={label} href="/super-admin/products">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#3F46D8] hover:shadow-md transition-all cursor-pointer">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="text-xl font-extrabold text-[#111111]">
                  {loading ? <Skeleton /> : value}
                </div>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-extrabold text-[#111111] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/super-admin/applications?status=PENDING">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 flex items-center gap-4 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111] group-hover:text-amber-600 transition-colors">
                  Review Applications
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  {loading ? '...' : `${stats?.pendingApplications ?? 0} pending`}
                </p>
              </div>
            </div>
          </Link>

          <Link href="/super-admin/products?status=PENDING">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 flex items-center gap-4 hover:border-[#3F46D8] hover:shadow-sm transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-[#3F46D8]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111] group-hover:text-[#3F46D8] transition-colors">
                  Approve Products
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  {loading ? '...' : `${stats?.pendingProducts ?? 0} awaiting review`}
                </p>
              </div>
            </div>
          </Link>

          <Link href="/super-admin/orders">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111] group-hover:text-indigo-600 transition-colors">
                  Manage Orders
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  {loading ? '...' : `${stats?.totalOrders ?? 0} platform orders`}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
