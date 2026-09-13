'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Store,
  Truck,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  status: string;
  rejectionReason?: string;
  storeAdminId?: number;
  storeAdminName?: string;
  storeName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerPickupLocation?: string;
  sellerPan?: string;
  sellerGst?: string;
  category?: { name: string };
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200',
};

export default function SuperAdminProductsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState('PENDING');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  // Restore cached products for instant display
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('superadmin_products_cache');
      if (cached) {
        setProducts(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}
  }, []);

  const fetchProducts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (products.length === 0) setLoading(true);
    setErrorMsg(null);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        token = await getApiToken();
      }

      let res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(20000),
      });

      // If full list fails, fallback to pending products directly
      if (!res.ok) {
        console.warn('Full products fetch failed, trying pending products fallback...');
        res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/products/pending`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(10000),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setErrorMsg(null);
        try {
          sessionStorage.setItem('superadmin_products_cache', JSON.stringify(data));
        } catch {}
      } else {
        const errText = await res.text();
        console.error('Failed to load products:', res.status, errText);
        setErrorMsg(`Failed to load products (${res.status}). Click Refresh to retry.`);
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
      // Attempt quick pending fallback on timeout
      try {
        const token = await getApiToken();
        const pendingRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/products/pending`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(8000),
        });
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setProducts(pendingData);
          setErrorMsg(null);
          return;
        }
      } catch (fallbackErr) {
        console.error('Pending fallback failed:', fallbackErr);
      }
      setErrorMsg('Network error while loading products. Please click Refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchProducts();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user]);

  const handleApprove = async (id: number) => {
    setProcessing(id);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/products/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        setExpanded(null);
        toast.success('Product approved! It is now live on Bazzar and an approval email was sent to the seller.');
      } else {
        toast.error('Approval failed');
      }
    } catch {
      toast.error('Network error during product approval.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required. Please explain why this product is rejected so the seller can fix it.');
      return;
    }
    setProcessing(id);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/products/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        setExpanded(null);
        setRejectReason('');
        toast.success('Product rejected. The rejection reason has been emailed to the seller for revisions.');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Rejection failed');
      }
    } catch {
      toast.error('Network error during product rejection.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === 'ALL' ? products : products.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Product Verifications &amp; Approvals</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Review product details, verify seller store information and logistics pickup location before publishing live.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchProducts(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto gap-2 border-[#E8E8E8] hover:border-[#3F46D8] text-xs font-bold rounded-xl h-10 px-4"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Products'}
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
            onClick={() => fetchProducts(true)}
            className="text-xs font-bold text-red-700 hover:bg-red-100 h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === s
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] hover:border-[#111111]'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-60">
              ({s === 'ALL' ? products.length : products.filter(p => p.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl h-24 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl py-16 text-center shadow-xs">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B6B6B]">No products found in this status</p>
          </div>
        ) : (
          filtered.map(product => (
            <div
              key={product.id}
              className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:border-[#3F46D8] transition-all shadow-xs"
            >
              {/* Card Header Row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(expanded === product.id ? null : product.id)}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-14 w-14 rounded-xl object-cover shrink-0 border border-[#E8E8E8]"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-[#E8E8E8]">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#111111] truncate">{product.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[product.status]}`}>
                      {product.status}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#111111] bg-gray-100 px-2 py-0.5 rounded-md">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-[#111111]">
                      <Store className="h-3.5 w-3.5 text-[#3F46D8]" />
                      {product.storeName || product.storeAdminName || 'Platform'}
                    </span>
                    {product.sellerEmail && (
                      <>
                        <span>•</span>
                        <span>{product.sellerEmail}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Stock: {product.stock} units</span>
                    <span>•</span>
                    <span>Category: {product.category?.name ?? '—'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-[#888888]">
                    {new Date(product.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {expanded === product.id ? (
                    <ChevronUp className="h-4 w-4 text-[#6B6B6B]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#6B6B6B]" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {expanded === product.id && (
                <div className="px-5 pb-6 border-t border-[#E8E8E8] space-y-5 pt-4 bg-[#FCFCFA]/60">
                  {/* Two Columns: Product Specs & Seller Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Product Info */}
                    <div className="bg-white rounded-xl p-4 border border-[#E8E8E8] shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider pb-2 border-b border-[#F0F0F0]">
                        <Package className="h-4 w-4 text-[#3F46D8]" />
                        Product Specifications
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">Price</p>
                          <p className="text-sm font-bold text-[#111111]">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">Stock</p>
                          <p className="text-sm font-semibold text-[#111111]">{product.stock} units</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">Category</p>
                          <p className="text-xs font-semibold text-[#111111]">{product.category?.name ?? '—'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-[#888888] uppercase mb-1">Product Description</p>
                        <p className="text-xs text-[#444444] leading-relaxed bg-[#F7F7F5] p-3 rounded-lg border border-[#EAEAEA]">
                          {product.description}
                        </p>
                      </div>

                      {product.image && (
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase mb-1.5">Product Image Preview</p>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-44 w-auto rounded-xl object-contain border border-[#E8E8E8] bg-white p-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Seller & Logistics Details */}
                    <div className="space-y-4">
                      {/* Seller Profile Card */}
                      <div className="bg-white rounded-xl p-4 border border-[#E8E8E8] shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider">
                            <Store className="h-4 w-4 text-[#3F46D8]" />
                            Seller / Store Details
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-[#3F46D8] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                            Verified Seller
                          </span>
                        </div>
                        <div className="text-xs space-y-1.5">
                          <div>
                            <span className="text-[10px] font-bold text-[#888888] uppercase">Store Name:</span>
                            <p className="font-bold text-sm text-[#111111]">{product.storeName || product.storeAdminName || 'Direct'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-[#888888] uppercase">Seller Name:</span>
                              <p className="font-semibold text-[#111111]">{product.storeAdminName || '—'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-[#888888] uppercase">Contact Phone:</span>
                              <p className="font-semibold text-[#111111]">{product.sellerPhone || '—'}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#888888] uppercase">Registered Email:</span>
                            <p className="font-medium text-[#111111] break-all">{product.sellerEmail || '—'}</p>
                          </div>
                          {(product.sellerPan || product.sellerGst) && (
                            <div className="pt-2 border-t border-[#F0F0F0] grid grid-cols-2 gap-2 text-[11px]">
                              {product.sellerPan && (
                                <div>
                                  <span className="text-[#888888]">PAN:</span>{' '}
                                  <strong className="font-mono text-[#111111]">{product.sellerPan}</strong>
                                </div>
                              )}
                              {product.sellerGst && (
                                <div>
                                  <span className="text-[#888888]">GSTIN:</span>{' '}
                                  <strong className="font-mono text-[#111111]">{product.sellerGst}</strong>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Courier Pickup Warehouse Hub */}
                      <div className="bg-white rounded-xl p-4 border border-[#E8E8E8] shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider pb-2 border-b border-[#F0F0F0]">
                          <Truck className="h-4 w-4 text-[#3F46D8]" />
                          Courier Pickup Warehouse
                        </div>
                        <p className="text-xs text-[#555555] leading-relaxed">
                          Packages for customer deliveries will be collected from:{' '}
                          <strong className="text-[#111111]">
                            {product.sellerPickupLocation || 'Location on seller profile'}
                          </strong>
                        </p>
                      </div>

                      {/* Previous Rejection Reason if any */}
                      {product.status === 'REJECTED' && product.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1">
                          <p className="text-[10px] font-bold text-red-700 uppercase">Current Rejection Reason</p>
                          <p className="text-xs text-red-800 leading-relaxed">{product.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for PENDING */}
                  {product.status === 'PENDING' && (
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#555555]">
                        <span className="font-bold text-[#111111]">Review Actions:</span>
                        <span className="text-[10px] text-[#888888]">
                          Approving will publish the product live to the website immediately.
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(product.id)}
                          disabled={processing === product.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs h-10 shadow-sm"
                        >
                          {processing === product.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve &amp; Publish to Website
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[#F0F0F0]">
                        <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                          <span>Rejection Reason (Mandatory if rejecting):</span>
                          <span className="text-[10px] font-normal text-[#888888]">
                            Will be emailed to <strong className="text-[#111111]">{product.sellerEmail}</strong>
                          </span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="e.g. Image resolution is too low, or description lacks warranty specifications. Please update and re-submit..."
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E8E8] text-xs text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-red-400 focus:bg-white resize-none transition-colors"
                        />
                        <Button
                          onClick={() => handleReject(product.id)}
                          disabled={processing === product.id}
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs h-9"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject with Reason
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
