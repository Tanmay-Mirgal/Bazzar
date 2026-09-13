'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  rejectionReason?: string;
  image?: string;
  category?: { id: number; name: string };
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; classes: string }> = {
  APPROVED: { label: 'Live on Website', icon: CheckCircle2, classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
  PENDING: { label: 'Under Review', icon: Clock, classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
  REJECTED: { label: 'Revisions Needed', icon: XCircle, classes: 'bg-red-100 text-red-800 border border-red-200' },
};

export default function StoreAdminProductsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    categoryId: '',
  });
  const [updating, setUpdating] = useState(false);

  const fetchProductsAndCategories = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);

    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 300));
        token = await getApiToken();
      }

      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/products`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(8000),
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
          signal: AbortSignal.timeout(8000),
        }),
      ]);

      if (prodRes.ok) {
        setProducts(await prodRes.json());
        setErrorMsg(null);
      } else {
        const errText = await prodRes.text();
        console.error('Failed to load products:', prodRes.status, errText);
        setErrorMsg(`Failed to load products (Status ${prodRes.status}). Please click "Refresh Catalog" or reload.`);
      }

      if (catRes.ok) setCategories(await catRes.json());
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setErrorMsg('Unable to connect to backend server. Please make sure backend is running and click Refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchProductsAndCategories();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user]);

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || '',
      categoryId: product.category?.id ? product.category.id.toString() : '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setUpdating(true);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
          image: editForm.image,
          categoryId: parseInt(editForm.categoryId),
        }),
      });

      const updated = await res.json();
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
        setEditingProduct(null);
        toast.success(
          editingProduct.status === 'REJECTED'
            ? 'Product updated & re-submitted! Sent back to Super Admin for review.'
            : 'Product updated & re-submitted for review!'
        );
      } else {
        toast.error(updated.message || 'Failed to update product');
      }
    } catch {
      toast.error('Network error during product update');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete product');
      }
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === 'ALL' ? products : products.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Seller Products</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Manage your catalog, monitor approval statuses, and update rejected listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProductsAndCategories(true)}
            disabled={loading || refreshing}
            className="rounded-xl border-[#E8E8E8] text-xs font-bold gap-2 h-10 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#3F46D8]' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Catalog'}
          </Button>
          <Link href="/store-admin/products/add">
            <Button className="bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold text-xs shadow-sm transition-colors h-10 px-4">
              <Plus className="mr-1.5 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchProductsAndCategories(true)}
            className="text-xs font-bold text-red-700 hover:bg-red-100 h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Status Notice Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-[#3F46D8] shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 space-y-1">
          <p className="font-bold">How Product Approvals Work:</p>
          <p className="text-[#555555] leading-relaxed">
            Newly added or edited products start with <strong>Under Review</strong> status. Once approved by the Super Admin, they will immediately appear live on the public website catalog. If rejected, you can review the Super Admin's feedback and click <strong>"Edit &amp; Re-Submit"</strong>.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === s
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]'
            }`}
          >
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
            <span className="ml-1.5 opacity-70">
              ({s === 'ALL' ? products.length : products.filter(p => p.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#E8E8E8] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-[#F7F7F5] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-[#111111]">No products found</p>
            <p className="text-xs text-[#888888]">
              {filter === 'REJECTED'
                ? 'Great! None of your products are currently rejected.'
                : 'Get started by listing your first product for customer orders.'}
            </p>
            {filter === 'ALL' && (
              <Link href="/store-admin/products/add" className="inline-block mt-2">
                <Button className="bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold text-xs">
                  Add Your First Product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F5] border-b border-[#E8E8E8]">
                <tr>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider px-6 py-3.5">Product &amp; Rejection Notes</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider px-3 py-3.5">Category</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider px-3 py-3.5">Price</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider px-3 py-3.5">Stock</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider px-3 py-3.5">Status</th>
                  <th className="text-right text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filtered.map(product => {
                  const statusCfg = STATUS_CONFIG[product.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={product.id} className="hover:bg-[#FCFCFA] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3.5">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover shrink-0 border border-[#E8E8E8]"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-[#F7F7F5] flex items-center justify-center shrink-0 border border-[#E8E8E8]">
                              <Package className="h-5 w-5 text-[#AAAAAA]" />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <p className="text-sm font-bold text-[#111111] max-w-sm">{product.name}</p>

                            {/* Prominent Rejection Reason alert for seller */}
                            {product.status === 'REJECTED' && product.rejectionReason && (
                              <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 max-w-md space-y-1 shadow-2xs">
                                <div className="flex items-center gap-1.5 text-red-700 font-bold text-[11px]">
                                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                  Super Admin Feedback / Changes Required:
                                </div>
                                <p className="text-xs text-red-800 font-medium leading-relaxed">
                                  "{product.rejectionReason}"
                                </p>
                                <button
                                  onClick={() => handleOpenEdit(product)}
                                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#3F46D8] hover:underline"
                                >
                                  Edit &amp; Re-Submit this product <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-xs font-semibold text-[#555555] bg-gray-100 px-2.5 py-1 rounded-md">
                          {product.category?.name ?? 'General'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-sm font-extrabold text-[#111111]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`text-xs font-bold ${product.stock < 10 ? 'text-red-600' : 'text-[#111111]'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>
                          <StatusIcon className="h-3 w-3" /> {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="h-9 px-3 rounded-xl bg-[#F7F7F5] hover:bg-[#3F46D8] hover:text-white flex items-center gap-1.5 transition-all text-xs font-bold text-[#111111] shadow-2xs"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>{product.status === 'REJECTED' ? 'Edit & Re-Submit' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="h-9 w-9 rounded-xl bg-[#F7F7F5] hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors text-[#888888]"
                            title="Delete"
                          >
                            {deleting === product.id ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── EDIT / RE-SUBMIT MODAL ────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E8E8E8] shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
              <div>
                <h3 className="text-xl font-extrabold text-[#111111]">
                  {editingProduct.status === 'REJECTED' ? 'Revise & Re-Submit Product' : 'Edit Product'}
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Updating this product will send it to the Super Admin for re-approval.
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rejection Notice Banner inside Modal if Rejected */}
            {editingProduct.status === 'REJECTED' && editingProduct.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  Super Admin Rejection Feedback:
                </div>
                <p className="text-xs text-red-900 font-semibold leading-relaxed pl-5">
                  "{editingProduct.rejectionReason}"
                </p>
                <p className="text-[11px] text-red-700 pl-5 pt-1">
                  Adjust the fields below to resolve this feedback before clicking Re-Submit.
                </p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product Title"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Category *</label>
                <select
                  required
                  value={editForm.categoryId}
                  onChange={e => setEditForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editForm.price}
                    onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="2999"
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Inventory Stock Units *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.stock}
                    onChange={e => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="50"
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Product Image (Cloudinary) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>Product Image</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Cloudinary CDN
                  </span>
                </label>
                <ImageUpload
                  value={editForm.image}
                  onChange={(url) => setEditForm(prev => ({ ...prev, image: url }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product specifications, warranty, materials, and features..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-[#E8E8E8]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-xl border-[#E8E8E8] font-bold text-xs h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold text-xs h-11 shadow-sm transition-all"
                >
                  {updating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      {editingProduct.status === 'REJECTED' ? 'Save & Re-Submit for Review' : 'Save Changes'} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
