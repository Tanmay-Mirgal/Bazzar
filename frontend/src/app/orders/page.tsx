'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import { getUserOrders, BackendOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  Calendar,
  Search,
  Filter,
  CreditCard,
  Zap,
  MapPin,
  ArrowUpDown,
  FileText,
  Building,
  Navigation,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type DateFilterType = 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM';
type SortOrderType = 'NEWEST' | 'OLDEST' | 'PRICE_HIGH' | 'PRICE_LOW';

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; badgeClass: string; borderClass: string }
> = {
  PLACED: {
    label: 'Order Placed',
    icon: Clock,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    borderClass: 'border-l-blue-500',
  },
  CONFIRMED: {
    label: 'Confirmed (Manifested)',
    icon: CheckCircle2,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-l-purple-500',
  },
  SHIPPED: {
    label: 'Shipped & In-Transit',
    icon: Truck,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-l-amber-500',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClass: 'border-l-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    borderClass: 'border-l-red-500',
  },
};

export default function UserOrdersPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOrderType>('NEWEST');

  const fetchOrders = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 400));
        token = await getApiToken();
      }

      const data = await getUserOrders(token);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchOrders();
      } else {
        router.push('/sign-in');
      }
    }
  }, [userLoaded, user]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const activeCount = orders.filter(
      (o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'SHIPPED'
    ).length;

    return { totalCount, totalSpent, deliveredCount, activeCount };
  }, [orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // 1. Status Filter
        if (statusFilter !== 'ALL' && order.status !== statusFilter) {
          return false;
        }

        // 2. Date Filter
        const orderDate = new Date(order.createdAt);
        const now = new Date();

        if (dateFilter === 'TODAY') {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (orderDate < startOfToday) return false;
        } else if (dateFilter === 'LAST_7_DAYS') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'THIS_MONTH') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (orderDate < startOfMonth) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (orderDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (orderDate > end) return false;
          }
        }

        // 3. Search Query (Order ID, Product Name, City, AWB)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = order.id.toString().includes(q);
          const matchCity = (order.city || '').toLowerCase().includes(q);
          const matchAwb = (order.awbCode || '').toLowerCase().includes(q);
          const matchCourier = (order.courierName || '').toLowerCase().includes(q);
          const matchProduct = order.items?.some((i) =>
            i.product?.name?.toLowerCase().includes(q)
          );

          if (!matchId && !matchCity && !matchAwb && !matchCourier && !matchProduct) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'PRICE_HIGH') {
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        }
        if (sortBy === 'PRICE_LOW') {
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        }
        return 0;
      });
  }, [orders, statusFilter, dateFilter, customStartDate, customEndDate, searchQuery, sortBy]);

  const resetFilters = () => {
    setStatusFilter('ALL');
    setDateFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setSortBy('NEWEST');
  };

  const isFiltered =
    statusFilter !== 'ALL' ||
    dateFilter !== 'ALL' ||
    searchQuery !== '' ||
    sortBy !== 'NEWEST' ||
    customStartDate !== '' ||
    customEndDate !== '';

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 space-y-6">
        <div className="h-10 w-64 bg-gray-100 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-44 bg-gray-100 animate-pulse rounded-3xl" />
        <div className="h-44 bg-gray-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24 text-[#111111]">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#E8E8E8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-[#3F46D8] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Order Fulfillment &amp; Tracking
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              My Orders &amp; Shipments
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">
              Track live courier route radar, inspect invoices, and manage your delivery history.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="rounded-xl border-[#E8E8E8] text-xs font-bold gap-2 h-10 px-4 bg-white hover:bg-[#FAF9F6] shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Orders'}
            </Button>
            <Link href="/products">
              <Button className="rounded-xl bg-[#111111] hover:bg-[#3F46D8] text-white text-xs font-bold h-10 px-5 transition-colors">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-[#3F46D8]" /> Total Orders
            </span>
            <p className="text-2xl font-black text-[#111111]">{stats.totalCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-amber-500" /> Active Shipments
            </span>
            <p className="text-2xl font-black text-amber-600">{stats.activeCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Delivered
            </span>
            <p className="text-2xl font-black text-emerald-600">{stats.deliveredCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-indigo-500" /> Total Spent
            </span>
            <p className="text-2xl font-black text-[#3F46D8]">{formatCurrency(stats.totalSpent)}</p>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E8E8] shadow-xs space-y-5">
          {/* Top Row: Search + Sort */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="h-4 w-4 text-[#AAAAAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Product name, Order #ID, AWB, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-8 rounded-2xl border border-[#E8E8E8] bg-[#FAF9F6] text-xs text-[#111111] focus:outline-none focus:border-[#3F46D8] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="h-4 w-4 text-[#6B6B6B]" />
              <span className="text-xs font-bold text-[#6B6B6B]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOrderType)}
                className="h-11 px-3 rounded-2xl border border-[#E8E8E8] bg-[#FAF9F6] text-xs font-bold text-[#111111] focus:outline-none focus:border-[#3F46D8] cursor-pointer"
              >
                <option value="NEWEST">Newest Orders First</option>
                <option value="OLDEST">Oldest Orders First</option>
                <option value="PRICE_HIGH">Price: High to Low</option>
                <option value="PRICE_LOW">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Date Filter & Status Filters */}
          <div className="space-y-4 pt-4 border-t border-[#F0F0EE]">
            {/* 1. Date Range Quick Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#3F46D8]" />
                <span className="text-xs font-black text-[#111111] uppercase tracking-wider">
                  Date Range Filter:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All Time' },
                  { id: 'TODAY', label: 'Today' },
                  { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
                  { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: 'CUSTOM', label: 'Custom Range' },
                ].map((df) => (
                  <button
                    key={df.id}
                    onClick={() => setDateFilter(df.id as DateFilterType)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      dateFilter === df.id
                        ? 'bg-[#3F46D8] text-white shadow-xs'
                        : 'bg-[#FAF9F6] border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] hover:border-gray-400'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Pickers (Shown if CUSTOM selected) */}
            {dateFilter === 'CUSTOM' && (
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E8E8] flex flex-wrap items-center gap-4 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#6B6B6B]">From Date:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-[#E8E8E8] bg-white text-xs text-[#111111]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#6B6B6B]">To Date:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-[#E8E8E8] bg-white text-xs text-[#111111]"
                  />
                </div>
                {(customStartDate || customEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 h-8"
                  >
                    Clear Dates
                  </Button>
                )}
              </div>
            )}

            {/* 2. Order Status Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#3F46D8]" />
                <span className="text-xs font-black text-[#111111] uppercase tracking-wider">
                  Status:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => {
                  const count =
                    st === 'ALL'
                      ? orders.length
                      : orders.filter((o) => o.status === st).length;

                  return (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] hover:border-gray-400'
                      }`}
                    >
                      {st === 'ALL' ? 'All Orders' : STATUS_CONFIG[st]?.label ?? st}
                      <span className="ml-1.5 opacity-70">({count})</span>
                    </button>
                  );
                })}

                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs text-rose-600 hover:text-rose-700 h-8 font-bold ml-1"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold text-[#111111] uppercase tracking-wider">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
            </h2>
            {isFiltered && (
              <span className="text-xs text-[#3F46D8] font-bold">Filtered Results Active</span>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E8E8E8] rounded-3xl p-16 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[#FAF9F6] flex items-center justify-center mx-auto text-[#888888]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#111111]">No Orders Match Your Filters</h3>
                <p className="text-xs text-[#6B6B6B] max-w-md mx-auto">
                  {isFiltered
                    ? 'No orders found for the selected date range or status criteria. Try clearing some filters.'
                    : "You haven't placed any orders yet. Discover trending products and start shopping today!"}
                </p>
              </div>

              {isFiltered ? (
                <Button
                  onClick={resetFilters}
                  className="rounded-xl bg-[#111111] hover:bg-[#3F46D8] text-white text-xs font-bold px-6 h-10"
                >
                  Clear All Filters
                </Button>
              ) : (
                <Link href="/products">
                  <Button className="rounded-xl bg-[#111111] hover:bg-[#3F46D8] text-white text-xs font-bold px-6 h-10">
                    Explore Catalog
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PLACED;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={order.id}
                    className={`bg-white border border-[#E8E8E8] border-l-4 ${config.borderClass} rounded-3xl p-6 hover:shadow-lg hover:border-[#3F46D8] transition-all space-y-5 group`}
                  >
                    {/* Top Row: Order ID, Status, Payment, Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0EE] pb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-base font-black text-[#111111]">
                          Order #{order.id}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-3 py-0.5 rounded-full border flex items-center gap-1 ${config.badgeClass}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>

                        {/* Payment Mode Tag */}
                        {order.paymentMethod === 'RAZORPAY' ? (
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Razorpay Paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> Cash on Delivery (COD)
                          </span>
                        )}

                        {/* Shiprocket Courier & AWB */}
                        {order.awbCode && (
                          <span className="text-[10px] font-extrabold bg-indigo-50 text-[#3F46D8] border border-indigo-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Truck className="h-3 w-3" /> {order.courierName || 'Shiprocket'} ({order.awbCode})
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#888888]">
                        Placed on{' '}
                        <strong className="text-[#111111]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </div>
                    </div>

                    {/* Middle Section: Products List + Logistics Snapshot */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Ordered Products (8 cols) */}
                      <div className="lg:col-span-8 space-y-3">
                        <p className="text-[10px] font-extrabold text-[#888888] uppercase tracking-wider">
                          Items in this Order ({order.items?.length || 0})
                        </p>

                        <div className="space-y-2.5">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 p-3 bg-[#FCFCFB] rounded-2xl border border-[#F0F0EE]"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.product?.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="h-12 w-12 rounded-xl object-cover border border-[#E8E8E8] shrink-0"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-[#E8E8E8] shrink-0">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#111111] truncate">
                                    {item.product?.name}
                                  </p>
                                  <p className="text-[#888888] text-[11px]">
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>

                              <span className="text-xs font-extrabold text-[#111111] shrink-0">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Destination & Summary (4 cols) */}
                      <div className="lg:col-span-4 space-y-3 bg-[#FAF9F6] p-4 rounded-2xl border border-[#ECECE9] text-xs">
                        <p className="text-[10px] font-extrabold text-[#888888] uppercase tracking-wider flex items-center justify-between">
                          <span>Delivery Destination</span>
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        </p>

                        <div className="space-y-1.5 text-[#555555]">
                          <p className="font-bold text-[#111111]">{order.fullName}</p>
                          <p className="line-clamp-2">
                            {order.address}, {order.city} - {order.postalCode}
                          </p>
                          <p className="text-[11px] text-[#888888]">{order.phoneNumber}</p>
                        </div>

                        {order.pickupCity && (
                          <div className="pt-2 border-t border-gray-200 text-[11px]">
                            <span className="font-bold text-[#111111] flex items-center gap-1 mb-0.5">
                              <Building className="h-3 w-3 text-indigo-600" /> Dispatched From:
                            </span>
                            <p className="text-[#6B6B6B] truncate">
                              {order.pickupAddress || 'Warehouse'}, {order.pickupCity}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F0F0EE]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#888888]">Order Grand Total:</span>
                        <span className="text-xl font-black text-[#3F46D8]">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/orders/${order.id}`}>
                          <Button className="rounded-xl bg-[#111111] group-hover:bg-[#3F46D8] text-white text-xs font-bold h-11 px-6 transition-colors flex items-center gap-2 shadow-sm">
                            <Truck className="h-4 w-4" /> Track Live on Map Radar{' '}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
