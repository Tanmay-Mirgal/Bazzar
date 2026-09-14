'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Plus,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowRight,
  Building2,
  RefreshCw,
  Sparkles,
  CreditCard,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  myProducts: number;
  myPendingProducts: number;
  myApprovedProducts: number;
  myRejectedProducts: number;
  myTotalOrders?: number;
  myTotalRevenue?: number;
  myUnitsSold?: number;
  myPendingPayout?: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  stock: number;
  image?: string;
}

interface OrderItem {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  fullName: string;
  createdAt: string;
  items: OrderItem[];
}

export default function StoreAdminDashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Restore SWR cache for instant load
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('seller_dashboard_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.products) setRecentProducts(parsed.products);
        if (parsed.orders) setRecentOrders(parsed.orders);
        setLoading(false);
      }
    } catch {}
  }, []);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else if (!stats && recentProducts.length === 0) setLoading(true);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 400));
        token = await getApiToken();
      }

      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;

      let fetchedStats: Stats | null = null;
      let fetchedProducts: Product[] = [];
      let fetchedOrders: Order[] = [];

      // Fetch in parallel with generous timeout
      await Promise.allSettled([
        fetch(`${base}/store-admin/dashboard/stats`, { headers, signal: AbortSignal.timeout(15000) })
          .then(async (r) => {
            if (r.ok) {
              fetchedStats = await r.json();
              setStats(fetchedStats);
            }
          })
          .catch((e) => console.error('Stats fetch failed:', e)),

        fetch(`${base}/store-admin/products`, { headers, signal: AbortSignal.timeout(15000) })
          .then(async (r) => {
            if (r.ok) {
              const data = await r.json();
              fetchedProducts = data.slice(0, 5);
              setRecentProducts(fetchedProducts);
            }
          })
          .catch((e) => console.error('Products fetch failed:', e)),

        fetch(`${base}/store-admin/orders`, { headers, signal: AbortSignal.timeout(15000) })
          .then(async (r) => {
            if (r.ok) {
              const ordersData = await r.json();
              fetchedOrders = ordersData.slice(0, 4);
              setRecentOrders(fetchedOrders);
            }
          })
          .catch((e) => console.error('Orders fetch failed:', e)),
      ]);

      try {
        sessionStorage.setItem('seller_dashboard_cache', JSON.stringify({
          stats: fetchedStats || stats,
          products: fetchedProducts.length > 0 ? fetchedProducts : recentProducts,
          orders: fetchedOrders.length > 0 ? fetchedOrders : recentOrders,
        }));
      } catch {}
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getApiToken, stats, recentProducts, recentOrders]);

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user, fetchData]);

  // Real data calculations
  const totalRevenue = stats?.myTotalRevenue ?? 0;
  const platformFee = (stats as any)?.myPlatformFee ?? Math.round(totalRevenue * 0.05);
  const netEarnings = (stats as any)?.myNetPayout ?? Math.round(totalRevenue * 0.95);
  const totalOrdersCount = stats?.myTotalOrders ?? recentOrders.length;
  const totalCatalogCount = stats?.myProducts ?? recentProducts.length;
  const approvedCount = stats?.myApprovedProducts ?? recentProducts.filter(p => p.status === 'APPROVED').length;
  const pendingCount = stats?.myPendingProducts ?? recentProducts.filter(p => p.status === 'PENDING').length;
  const pendingPayout = stats?.myPendingPayout ?? netEarnings;

  const statCards = [
    {
      label: 'Gross Sales Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtext: `₹${platformFee.toLocaleString('en-IN')} (5% Bazzar platform cut)`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
      badge: '100% Volume',
      href: '/store-admin/analytics',
    },
    {
      label: 'Net Seller Payout',
      value: `₹${netEarnings.toLocaleString('en-IN')}`,
      subtext: '95% Take-home earnings',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
      badge: '95% Net Payout',
      href: '/store-admin/analytics',
    },
    {
      label: 'Customer Orders',
      value: totalOrdersCount,
      subtext: 'Total orders placed',
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-600',
      badge: totalOrdersCount > 0 ? `${totalOrdersCount} placed` : undefined,
      href: '/store-admin/orders',
    },
    {
      label: 'Catalog Listings',
      value: totalCatalogCount,
      subtext: `${approvedCount} Live · ${pendingCount} In Review`,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      badge: pendingCount > 0 ? `${pendingCount} Under Review` : undefined,
      href: '/store-admin/products',
    },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-amber-100 text-amber-700',
      REJECTED: 'bg-red-100 text-red-700',
      PLACED: 'bg-blue-100 text-blue-700',
      CONFIRMED: 'bg-purple-100 text-purple-700',
      SHIPPED: 'bg-amber-100 text-amber-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#3F46D8] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Seller Command Center
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111]">
            Welcome back, {user?.firstName ?? 'Seller'} 👋
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Here's the latest real-time performance update on your store sales, fulfillment, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="rounded-xl border-[#E8E8E8] text-xs font-bold gap-2 h-10 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Link href="/store-admin/products/add">
            <Button className="bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold text-xs h-10 px-4">
              <Plus className="mr-1.5 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, subtext, icon: Icon, color, badge, href }) => (
          <Link key={label} href={href}>
            <div className="bg-white rounded-3xl border border-[#E8E8E8] p-5 space-y-3 hover:border-[#3F46D8] hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {badge && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-black text-[#111111] group-hover:text-[#3F46D8] transition-colors">
                  {loading && !stats && recentProducts.length === 0 ? (
                    <span className="h-6 w-16 bg-gray-100 animate-pulse rounded block" />
                  ) : (
                    value
                  )}
                </p>
                <p className="text-xs font-bold text-[#111111] mt-0.5">{label}</p>
                <p className="text-[11px] text-[#888888]">{subtext}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bank Payout & Settlement Quick Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 lg:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Weekly Bank Settlement</p>
          </div>
          <h2 className="text-xl font-extrabold">Next Payout: Upcoming Monday</h2>
          <p className="text-xs text-indigo-200 max-w-lg">
            Settlement payouts are processed weekly directly to your registered bank account via NEFT / IMPS.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-indigo-200">Cleared Balance</p>
            <p className="text-2xl font-black text-emerald-300">
              ₹{pendingPayout.toLocaleString('en-IN')}
            </p>
          </div>
          <Link href="/store-admin/analytics">
            <Button className="bg-white text-[#111111] hover:bg-indigo-50 font-bold text-xs rounded-xl h-11 px-5">
              View Analytics &amp; Payouts <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/store-admin/products/add">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-3.5 hover:border-[#3F46D8] hover:shadow-xs transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#3F46D8] flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111111] group-hover:text-[#3F46D8] transition-colors">Add Product</p>
              <p className="text-[10px] text-[#888888]">Cloudinary upload</p>
            </div>
          </div>
        </Link>

        <Link href="/store-admin/orders">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-3.5 hover:border-purple-500 hover:shadow-xs transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111111] group-hover:text-purple-600 transition-colors">Customer Orders</p>
              <p className="text-[10px] text-[#888888]">Dispatch &amp; fulfill</p>
            </div>
          </div>
        </Link>

        <Link href="/store-admin/analytics">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-3.5 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111111] group-hover:text-emerald-600 transition-colors">Revenue &amp; Payouts</p>
              <p className="text-[10px] text-[#888888]">Detailed analytics</p>
            </div>
          </div>
        </Link>

        <Link href="/store-admin/settings">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-3.5 hover:border-amber-500 hover:shadow-xs transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111111] group-hover:text-amber-600 transition-colors">Store Settings</p>
              <p className="text-[10px] text-[#888888]">Profile &amp; Bank</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Dual Column: Recent Orders + Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Preview */}
        <div className="bg-white rounded-3xl border border-[#E8E8E8] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E8]">
            <h2 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#3F46D8]" /> Recent Customer Orders
            </h2>
            <Link href="/store-admin/orders" className="text-xs font-bold text-[#3F46D8] hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#F0F0F0]">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111]">Order #{order.id}</span>
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      {order.fullName} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#111111]">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-[#888888] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#888888]">No customer orders received yet.</div>
            )}
          </div>
        </div>

        {/* Recent Products Preview */}
        <div className="bg-white rounded-3xl border border-[#E8E8E8] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E8]">
            <h2 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
              <Package className="h-4 w-4 text-[#3F46D8]" /> Catalog Listings
            </h2>
            <Link href="/store-admin/products" className="text-xs font-bold text-[#3F46D8] hover:underline flex items-center gap-1">
              Manage Catalog <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#F0F0F0]">
            {recentProducts.length > 0 ? (
              recentProducts.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-xl object-cover border border-[#E8E8E8]" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center border border-[#E8E8E8]">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-[#111111]">{p.name}</p>
                      <p className="text-[11px] text-[#888888]">{p.stock} in stock</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#111111]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    {statusBadge(p.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#888888]">No products listed yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
