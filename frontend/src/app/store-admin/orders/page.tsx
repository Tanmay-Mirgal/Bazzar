'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  RefreshCw,
  Sparkles,
  CreditCard,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Zap,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  createdAt: string;

  // Payment
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  razorpayOrderId?: string;

  // Shiprocket Logistics
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  trackingStatus?: string;

  // Pickup details
  pickupAddress?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupPostalCode?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; badge: string; border: string }> = {
  PLACED: {
    label: 'Order Placed',
    icon: Clock,
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-l-blue-500',
  },
  CONFIRMED: {
    label: 'Confirmed (Manifested)',
    icon: CheckCircle2,
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    border: 'border-l-purple-500',
  },
  SHIPPED: {
    label: 'Shipped & In-Transit',
    icon: Truck,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-l-amber-500',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-l-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    badge: 'bg-red-50 text-red-700 border-red-200',
    border: 'border-l-red-500',
  },
};

export default function StoreAdminOrdersPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 300));
        token = await getApiToken();
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        setOrders(await res.json());
      } else {
        console.error('Failed to load store orders:', res.status);
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      toast.error('Network error loading orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getApiToken]);

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user, fetchOrders]);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        toast.success(`Order #${orderId} updated to ${nextStatus}! Shiprocket dispatch updated & email sent.`);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filter === 'ALL' || o.status === filter;
    const matchSearch =
      search === '' ||
      o.id.toString().includes(search) ||
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()) ||
      (o.awbCode && o.awbCode.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#3F46D8] uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> Seller Order Fulfillment
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Incoming Store Orders</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Confirm customer orders, generate Shiprocket courier consignments, and monitor delivery routes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto gap-2 border-[#E8E8E8] text-xs font-bold rounded-xl h-9 px-3"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((s) => {
            const count = s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === s
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] hover:border-[#111111]'
                }`}
              >
                {s === 'ALL' ? 'All Orders' : STATUS_CONFIG[s]?.label ?? s}
                <span className="ml-1.5 opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="h-4 w-4 text-[#AAAAAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, city, order ID, AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E8E8E8] bg-white text-xs text-[#111111] focus:outline-none focus:border-[#3F46D8] transition-colors"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-[#E8E8E8] animate-pulse p-6" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E8E8] py-20 text-center space-y-3">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="text-base font-bold text-[#111111]">No orders found</p>
          <p className="text-xs text-[#888888] max-w-sm mx-auto">
            {filter !== 'ALL'
              ? `No orders currently matching "${filter}". Try selecting "All Orders".`
              : 'When customers place orders for your products, they will appear here with full Shiprocket consignment details.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PLACED;
            const StatusIcon = cfg.icon;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border border-[#E8E8E8] border-l-4 ${cfg.border} p-6 space-y-5 hover:shadow-md transition-shadow`}
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-base font-black text-[#111111]">Order #{order.id}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-0.5 rounded-full border ${cfg.badge}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {cfg.label}
                    </span>

                    {/* Payment Badge */}
                    {order.paymentMethod === 'RAZORPAY' ? (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Razorpay Paid
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Cash on Delivery (COD)
                      </span>
                    )}

                    {/* Shiprocket AWB Tag */}
                    {order.awbCode && (
                      <span className="text-[10px] font-extrabold bg-indigo-50 text-[#3F46D8] border border-indigo-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Truck className="h-3 w-3" /> AWB: {order.awbCode} ({order.courierName || 'Shiprocket'})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="font-extrabold text-[#111111] text-sm">
                      Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Content: Customer Info + Products + Logistics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer & Shipping Details */}
                  <div className="space-y-3 text-xs bg-[#FBFBFA] rounded-2xl p-4 border border-[#F0F0EE]">
                    <p className="text-[10px] font-extrabold text-[#888888] uppercase tracking-wider flex items-center justify-between">
                      <span>Customer &amp; Shipping</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Verified Buyer</span>
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#111111]">
                        <User className="h-3.5 w-3.5 text-[#3F46D8]" /> {order.fullName}
                      </div>
                      <div className="flex items-center gap-2 text-[#555555]">
                        <Phone className="h-3.5 w-3.5 text-[#888888]" /> {order.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2 text-[#555555]">
                        <Mail className="h-3.5 w-3.5 text-[#888888]" /> {order.email}
                      </div>
                      <div className="flex items-start gap-2 text-[#555555] pt-1 border-t border-[#ECECE9]">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>
                          {order.address}, {order.city} - {order.postalCode}
                        </span>
                      </div>
                    </div>

                    {/* Pickup Warehouse Info */}
                    {order.pickupCity && (
                      <div className="pt-2 border-t border-[#ECECE9] text-[11px] text-[#777777]">
                        <span className="font-bold text-[#111111] flex items-center gap-1 mb-0.5">
                          <Building className="h-3 w-3 text-indigo-500" /> Dispatch Warehouse:
                        </span>
                        <p className="line-clamp-1">{order.pickupAddress || 'Warehouse Hub'}, {order.pickupCity}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-2 space-y-3">
                    <p className="text-[10px] font-extrabold text-[#888888] uppercase tracking-wider">
                      Ordered Products ({order.items.length})
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 p-3 bg-[#FCFCFB] rounded-2xl border border-[#F0F0EE]"
                        >
                          <div className="flex items-center gap-3">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-12 w-12 rounded-xl object-cover border border-[#E8E8E8]"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-[#E8E8E8]">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-[#111111]">{item.product.name}</p>
                              <p className="text-[11px] text-[#6B6B6B]">
                                Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-extrabold text-[#111111]">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Status Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0F0F0]">
                      <Link
                        href={`/orders/${order.id}`}
                        target="_blank"
                        className="text-xs font-bold text-[#3F46D8] hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Live Map Tracking
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.status === 'PLACED' && (
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                            className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl gap-1.5"
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Confirm &amp; Manifest (Shiprocket)
                          </Button>
                        )}

                        {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                            className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl gap-1.5"
                          >
                            <Truck className="h-3.5 w-3.5" /> Dispatch / In-Transit
                          </Button>
                        )}

                        {order.status === 'SHIPPED' && (
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Delivered
                          </Button>
                        )}

                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
                          >
                            Cancel
                          </Button>
                        )}

                        {order.status === 'DELIVERED' && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Delivered &amp; Settled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
