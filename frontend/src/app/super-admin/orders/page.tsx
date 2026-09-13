'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  User,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image?: string;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; badgeClass: string; color: string }
> = {
  PLACED: {
    label: 'Placed',
    icon: Clock,
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    color: 'text-amber-700',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle2,
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    color: 'text-blue-700',
  },
  SHIPPED: {
    label: 'Shipped',
    icon: Truck,
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    color: 'text-purple-700',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: PackageCheck,
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    color: 'text-emerald-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    badgeClass: 'bg-red-50 text-red-600 border border-red-200',
    color: 'text-red-600',
  },
};

const STATUS_OPTIONS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function SuperAdminOrdersPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        setOrders(await res.json());
      } else {
        toast.error('Failed to load platform orders');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = await getApiToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        const updated: Order = await res.json();
        setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
        toast.success(`Order #${orderId} marked as ${newStatus}`);
      } else {
        toast.error('Failed to update order status');
      }
    } catch {
      toast.error('Network error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Order Management</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Monitor orders across the marketplace, track shipments, and update delivery status
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="border-[#E8E8E8] text-[#111111] hover:bg-[#F7F7F5] rounded-xl text-xs gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...STATUS_OPTIONS].map(status => {
          const count =
            status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === status
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase()}
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div
              key={i}
              className="bg-white border border-[#E8E8E8] rounded-2xl h-24 animate-pulse"
            />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl py-16 text-center shadow-xs">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B6B6B]">No orders found for this status</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
            const StatusIcon = config.icon;
            const isExpanded = expanded === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:border-[#3F46D8] transition-all shadow-xs"
              >
                {/* Header Row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-5 w-5 text-[#3F46D8]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#111111]">
                        Order #{order.id}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${config.badgeClass}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">
                      {order.fullName} · {order.items.length} item{order.items.length > 1 ? 's' : ''} · {order.city}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-[#111111]">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-[#888888]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-gray-400 pl-1">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#6B6B6B]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#6B6B6B]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#E8E8E8] space-y-4 pt-4">
                    {/* Customer & Shipping Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F7F7F5] p-4 rounded-xl border border-[#E8E8E8]">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                          Customer Information
                        </p>
                        <p className="text-xs text-[#111111] font-semibold flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#3F46D8]" /> {order.fullName}
                        </p>
                        <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-[#888888]" /> {order.email}
                        </p>
                        <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-[#888888]" /> {order.phoneNumber}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                          Delivery Address
                        </p>
                        <p className="text-xs text-[#444444] flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>
                            {order.address}, {order.city} - {order.postalCode}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">
                        Ordered Items
                      </p>
                      <div className="divide-y divide-[#E8E8E8] rounded-xl border border-[#E8E8E8] overflow-hidden bg-white">
                        {order.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 text-xs text-[#111111]"
                          >
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-10 w-10 rounded-lg object-cover border border-[#E8E8E8]"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{item.product?.name}</p>
                              <p className="text-[#6B6B6B] text-[11px]">
                                Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <p className="font-bold text-[#111111]">
                              ₹{(item.quantity * item.price)?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Management Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F7F7F5] p-4 rounded-xl border border-[#E8E8E8]">
                      <div>
                        <p className="text-xs font-bold text-[#111111]">Update Order Status</p>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Change shipment status for order #{order.id}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(opt => (
                          <Button
                            key={opt}
                            size="sm"
                            disabled={updatingId === order.id || order.status === opt}
                            onClick={() => handleStatusChange(order.id, opt)}
                            className={`rounded-lg text-[11px] font-bold h-8 transition-all ${
                              order.status === opt
                                ? 'bg-[#111111] text-white font-extrabold cursor-default'
                                : 'bg-white hover:bg-gray-100 text-[#111111] border border-[#E8E8E8]'
                            }`}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
