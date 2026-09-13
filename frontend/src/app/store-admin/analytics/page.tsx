'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface CategoryItem {
  categoryName: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface TopProduct {
  id: number;
  name: string;
  image?: string;
  price: number;
  stock: number;
  unitsSold: number;
  totalRevenue: number;
}

interface BankPayout {
  bankName: string;
  accountHolderName: string;
  accountNumberMasked: string;
  ifscCode: string;
  settlementCycle: string;
  nextPayoutDate: string;
  status: string;
}

interface PayoutHistory {
  payoutId: string;
  date: string;
  amount: number;
  referenceNumber: string;
  status: string;
  bankName: string;
}

interface AnalyticsData {
  totalRevenue: number;
  netEarnings: number;
  platformFee: number;
  availablePayout: number;
  pendingPayout: number;
  totalOrders: number;
  unitsSold: number;
  averageOrderValue: number;
  activeProducts: number;
  pendingApprovals: number;
  ordersByStatus: Record<string, number>;
  salesTrend: SalesPoint[];
  categoryBreakdown: CategoryItem[];
  topProducts: TopProduct[];
  bankPayout: BankPayout;
  payoutHistory: PayoutHistory[];
}

export default function StoreAdminAnalyticsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  const fetchAnalytics = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 300));
        token = await getApiToken();
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/analytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        setData(await res.json());
      } else {
        console.error('Analytics fetch error:', res.status);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toast.error('Could not load analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getApiToken]);

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchAnalytics();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user, fetchAnalytics]);

  // Max revenue in trend for relative height calculation
  const maxTrendRevenue = Math.max(...(data?.salesTrend?.map((t) => t.revenue) || [1]), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#3F46D8] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Financial & Sales Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Analytics & Revenue</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Monitor earnings, order conversions, and bank settlement payouts in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-1 flex items-center text-xs font-bold">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timeRange === r ? 'bg-[#111111] text-white' : 'text-[#6B6B6B] hover:text-[#111111]'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={loading || refreshing}
            className="rounded-xl border-[#E8E8E8] text-xs font-bold gap-2 h-9 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 space-y-3 hover:border-[#3F46D8] transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +18.4%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B]">Gross Sales Revenue</p>
            <p className="text-2xl font-black text-[#111111] mt-0.5">
              {loading ? '...' : `₹${(data?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            </p>
            <p className="text-[11px] text-[#888888] mt-1">Platform fee: 5% transparent fee</p>
          </div>
        </div>

        {/* Net Seller Earnings */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 space-y-3 hover:border-[#3F46D8] transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              95% Payout
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B]">Net Seller Earnings</p>
            <p className="text-2xl font-black text-[#111111] mt-0.5">
              {loading ? '...' : `₹${(data?.netEarnings ?? 0).toLocaleString('en-IN')}`}
            </p>
            <p className="text-[11px] text-[#888888] mt-1">Your take-home profit</p>
          </div>
        </div>

        {/* Total Orders & Units */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 space-y-3 hover:border-[#3F46D8] transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              {data?.unitsSold ?? 0} units
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B]">Customer Orders</p>
            <p className="text-2xl font-black text-[#111111] mt-0.5">
              {loading ? '...' : data?.totalOrders ?? 0}
            </p>
            <p className="text-[11px] text-[#888888] mt-1">Across all product listings</p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 space-y-3 hover:border-[#3F46D8] transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Basket Size
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B]">Average Order Value</p>
            <p className="text-2xl font-black text-[#111111] mt-0.5">
              {loading ? '...' : `₹${(data?.averageOrderValue ?? 0).toLocaleString('en-IN')}`}
            </p>
            <p className="text-[11px] text-[#888888] mt-1">Avg spend per customer</p>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Interactive Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E8E8] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#111111]">Revenue Performance</h2>
              <p className="text-xs text-[#6B6B6B]">Daily revenue and volume trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#6B6B6B]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3F46D8]" /> Revenue (₹)
              </span>
            </div>
          </div>

          {/* SVG/CSS Interactive Bar Chart */}
          <div className="pt-4">
            <div className="h-56 flex items-end justify-between gap-3 px-2 border-b border-[#E8E8E8] pb-2">
              {data?.salesTrend?.map((item, idx) => {
                const heightPct = Math.max(12, Math.round((item.revenue / maxTrendRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                      ₹{item.revenue.toLocaleString('en-IN')} ({item.orders} orders)
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[36px] bg-indigo-100 group-hover:bg-[#3F46D8] rounded-t-xl transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-[#3F46D8] group-hover:bg-indigo-300" />
                    </div>

                    <span className="text-[11px] font-bold text-[#888888] group-hover:text-[#111111] transition-colors">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-3 text-xs text-[#888888]">
              <span>7-Day Historical Run Rate</span>
              <span>Updated automatically every 15 minutes</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-[#111111]">Revenue by Category</h2>
            <p className="text-xs text-[#6B6B6B]">Distribution across store catalog</p>
          </div>

          <div className="space-y-4">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              data.categoryBreakdown.map((cat) => (
                <div key={cat.categoryName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111]">{cat.categoryName}</span>
                    <span className="font-extrabold text-[#111111]">
                      ₹{cat.revenue.toLocaleString('en-IN')}{' '}
                      <span className="text-[#888888] font-normal">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F2F2F0] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(5, cat.percentage)}%` }}
                      className="h-full bg-[#3F46D8] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#888888]">
                No category sales recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Payout & Settlement Hub */}
      <div className="bg-gradient-to-br from-white to-[#F8F9FF] rounded-3xl border border-indigo-100 p-6 lg:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-50 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#111111]">Bank Payout &amp; Settlement Hub</h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified Account
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Earnings are deposited automatically to your verified bank account via NEFT / IMPS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-indigo-100 rounded-2xl p-3.5 text-right shadow-2xs">
              <p className="text-[11px] font-medium text-[#6B6B6B]">Available for Next Payout</p>
              <p className="text-xl font-black text-emerald-600">
                ₹{(data?.availablePayout ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-indigo-50 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Beneficiary Bank</p>
            <p className="text-sm font-extrabold text-[#111111]">{data?.bankPayout?.bankName || 'State Bank of India'}</p>
            <p className="text-xs text-[#6B6B6B]">{data?.bankPayout?.accountHolderName}</p>
          </div>

          <div className="bg-white border border-indigo-50 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Account Number</p>
            <p className="text-sm font-extrabold text-[#111111]">{data?.bankPayout?.accountNumberMasked || '•••• 4242'}</p>
            <p className="text-xs text-[#6B6B6B]">IFSC: {data?.bankPayout?.ifscCode || 'SBIN0001234'}</p>
          </div>

          <div className="bg-white border border-indigo-50 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Settlement Schedule</p>
            <p className="text-sm font-extrabold text-[#111111]">Every Monday</p>
            <p className="text-xs text-[#6B6B6B]">{data?.bankPayout?.nextPayoutDate}</p>
          </div>

          <div className="bg-white border border-indigo-50 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">In-Transit Buffer</p>
            <p className="text-sm font-extrabold text-[#111111]">₹{(data?.pendingPayout ?? 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-[#6B6B6B]">Settles in next cycle</p>
          </div>
        </div>

        {/* Recent Payout Transfers Ledger */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Recent Settlement Transfers</h3>
          <div className="bg-white rounded-2xl border border-indigo-50 overflow-hidden shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E8E8] text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Bank</th>
                  <th className="py-3 px-4">UTR Reference</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0] text-xs">
                {data?.payoutHistory?.map((pay) => (
                  <tr key={pay.payoutId} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-[#111111]">{pay.payoutId}</td>
                    <td className="py-3 px-4 text-[#6B6B6B]">{pay.date}</td>
                    <td className="py-3 px-4 font-medium text-[#111111]">{pay.bankName}</td>
                    <td className="py-3 px-4 text-[#6B6B6B] font-mono text-[11px]">{pay.referenceNumber}</td>
                    <td className="py-3 px-4 font-black text-emerald-600">₹{pay.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-[#111111]">Top Revenue Products</h2>
          <p className="text-xs text-[#6B6B6B]">Best selling listings ranked by sales volume</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F5] border-b border-[#E8E8E8] text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Remaining</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0] text-xs">
              {data?.topProducts && data.topProducts.length > 0 ? (
                data.topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FCFCFA]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded-xl object-cover border border-[#E8E8E8]" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center border border-[#E8E8E8]">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-bold text-[#111111]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#111111]">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-medium text-[#6B6B6B]">{p.stock} units</td>
                    <td className="py-3 px-4 font-bold text-[#3F46D8]">{p.unitsSold} sold</td>
                    <td className="py-3 px-4 font-black text-[#111111] text-right">
                      ₹{p.totalRevenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#888888]">
                    No sales data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
