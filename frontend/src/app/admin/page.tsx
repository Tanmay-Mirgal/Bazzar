'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { getCurrentUser } from '@/lib/api/auth';
import { getAllOrders, BackendOrder } from '@/lib/api/orders';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShieldCheck,
  PackagePlus,
  ShoppingBag,
  TrendingUp,
  Users,
  Plus,
  Trash2,
  Edit2,
  Layers,
  ArrowRight,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'manage-products' | 'add-product' | 'orders'>('overview');

  // Real Database State
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [orders, setOrders] = React.useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchCatalogQuery, setSearchCatalogQuery] = React.useState('');

  // New Product Form State
  const [newProductName, setNewProductName] = React.useState('');
  const [newProductDesc, setNewProductDesc] = React.useState('');
  const [newProductPrice, setNewProductPrice] = React.useState('');
  const [newProductStock, setNewProductStock] = React.useState('');
  const [newProductImage, setNewProductImage] = React.useState('');
  const [newProductCategoryId, setNewProductCategoryId] = React.useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = React.useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [editPrice, setEditPrice] = React.useState('');
  const [editStock, setEditStock] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [editCategoryId, setEditCategoryId] = React.useState('');
  const [isUpdatingProduct, setIsUpdatingProduct] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (!user || (user.role !== 'ROLE_ADMIN' && user.email !== 'admin@bazzar.com')) {
      toast.error('Access Denied. Admin credentials required.');
      router.push('/login');
    }
  }, [router]);

  const fetchRealDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats, ords] = await Promise.all([
        getProducts(),
        getCategories(),
        getAllOrders().catch((err) => {
          console.warn('Orders fetch failed or unauthorized', err);
          return [] as BackendOrder[];
        }),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
    } catch (err) {
      console.error('Failed to fetch real database data', err);
      toast.error('Could not sync real database records');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRealDatabaseData();
  }, []);

  // Compute Real Analytics from DB
  const totalSalesRevenue = orders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const activeProductsCount = products.length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  
  // Real Unique Customer emails
  const uniqueCustomerEmails = React.useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.email) set.add(o.email.toLowerCase());
    });
    return set.size || 1; // at least admin
  }, [orders]);

  const lowStockItems = React.useMemo(() => {
    return products.filter((p) => p.stock <= 10);
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    if (!searchCatalogQuery.trim()) return products;
    const q = searchCatalogQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [products, searchCatalogQuery]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductStock || !newProductCategoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const created = await createProduct({
        name: newProductName,
        description: newProductDesc || 'Premium storefront item.',
        price: parseFloat(newProductPrice),
        stock: parseInt(newProductStock),
        image: newProductImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        categoryId: parseInt(newProductCategoryId),
      });

      toast.success(`Published product to DB: "${created.name}"`);

      // Reset Form
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductImage('');
      setNewProductCategoryId('');

      await fetchRealDatabaseData();
      setActiveTab('manage-products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditPrice(String(p.price));
    setEditStock(String(p.stock));
    setEditCategoryId(String(p.categoryId || ''));
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsUpdatingProduct(true);
    try {
      await updateProduct(String(editingProduct.id), {
        name: editName,
        description: editDesc,
        price: parseFloat(editPrice),
        stock: parseInt(editStock),
        image: editingProduct.image,
        categoryId: parseInt(editCategoryId) || editingProduct.categoryId || 1,
      });

      toast.success(`Updated "${editName}" in DB`);
      setEditingProduct(null);
      fetchRealDatabaseData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this product from database?')) return;
    try {
      await deleteProduct(String(id));
      toast.success('Product deleted from database catalog');
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#FAF9F6] text-[#111111] min-h-screen pb-20">
      
      {/* ── GENERIC ADMIN HEADER BANNER ── */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#262626]">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-white/10 text-indigo-300 px-3 py-1 rounded-md text-xs font-mono font-bold border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>BAZZAR ADMIN DASHBOARD</span>
              <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-sans">Live DB</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Store Management Console</h1>
            <p className="text-xs text-gray-400">Real-time database sync for sales transactions, inventory items, and catalog updates.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchRealDatabaseData}
              disabled={isLoading}
              variant="outline"
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-11 px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Sync DB Data'}
            </Button>
            <Button
              onClick={() => setActiveTab('add-product')}
              className="rounded-xl bg-white hover:bg-gray-100 text-[#111111] font-bold text-xs h-11 px-6 shadow-md"
            >
              <Plus className="mr-1.5 h-4 w-4 text-[#3F46D8]" /> Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── 4 STAT OVERVIEW CARDS (100% Real DB Data) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-[11px] text-[#6B6B6B] font-extrabold uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-black text-[#111111]">{formatCurrency(totalSalesRevenue)}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">From {totalOrdersCount} Completed Orders</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-[#3F46D8] flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-[11px] text-[#6B6B6B] font-extrabold uppercase tracking-wider">Customer Orders</p>
              <h3 className="text-2xl font-black text-[#111111]">{totalOrdersCount}</h3>
              <p className="text-[10px] text-gray-500 font-medium">Real Backend Transactions</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-[11px] text-[#6B6B6B] font-extrabold uppercase tracking-wider">Catalog Products</p>
              <h3 className="text-2xl font-black text-[#111111]">{activeProductsCount} Items</h3>
              <p className="text-[10px] text-indigo-600 font-bold">{totalUnitsInStock} Total Units Stocked</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-[11px] text-[#6B6B6B] font-extrabold uppercase tracking-wider">Unique Customers</p>
              <h3 className="text-2xl font-black text-[#111111]">{uniqueCustomerEmails} Accounts</h3>
              <p className="text-[10px] text-gray-500 font-medium">Verified Buyers in DB</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
          </div>

        </div>

        {/* ── GENERIC TAB NAVIGATION BAR ── */}
        <div className="flex items-center gap-3 border-b border-[#E8E8E8] pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#3F46D8] text-[#3F46D8] bg-white shadow-xs'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Overview & Activity
          </button>
          
          <button
            onClick={() => setActiveTab('manage-products')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'manage-products'
                ? 'border-[#3F46D8] text-[#3F46D8] bg-white shadow-xs'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <Package className="h-4 w-4" /> Product Catalog ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('add-product')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'add-product'
                ? 'border-[#3F46D8] text-[#3F46D8] bg-white shadow-xs'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <PackagePlus className="h-4 w-4" /> Publish Product
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'orders'
                ? 'border-[#3F46D8] text-[#3F46D8] bg-white shadow-xs'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Customer Orders ({orders.length})
          </button>
        </div>

        {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Recent Orders List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#111111]">Recent Orders ({orders.length})</h3>
                    <p className="text-xs text-[#6B6B6B]">Live order transactions from PostgreSQL database</p>
                  </div>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#3F46D8] hover:underline">
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#6B6B6B]">
                    No orders recorded in database yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E8E8] text-xs hover:border-[#3F46D8]/40 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-[#111111]">#{ord.id}</span>
                            <span className="font-bold text-[#111111]">{ord.fullName}</span>
                          </div>
                          <p className="text-[#6B6B6B] text-[11px]">{ord.email} • {ord.city || 'Standard Shipping'}</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="font-black text-[#111111]">{formatCurrency(ord.totalAmount)}</p>
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Low Stock Warnings & Actions */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Low Stock Alert Box */}
              <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-extrabold text-sm border-b border-[#E8E8E8] pb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Low Stock Warnings ({lowStockItems.length})</span>
                </div>

                {lowStockItems.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" /> All products have healthy stock inventory.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lowStockItems.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs">
                        <div className="line-clamp-1 pr-2">
                          <p className="font-bold text-[#111111] line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-gray-500">{p.category}</p>
                        </div>
                        <span className="font-mono font-extrabold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                          {p.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Banner */}
              <div className="rounded-2xl bg-[#111111] text-white p-6 space-y-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Quick Action</span>
                  <h3 className="text-lg font-extrabold tracking-tight">Publish Product</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Add new items directly to your Spring Boot PostgreSQL catalog database.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab('add-product')}
                  className="w-full rounded-xl bg-white text-[#111111] hover:bg-gray-100 font-bold text-xs h-11 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1 text-[#3F46D8]" /> Publish New Product
                </Button>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB 2: MANAGE PRODUCT CATALOG (Search, Edit, Delete) ── */}
        {activeTab === 'manage-products' && (
          <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E8E8] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#111111]">Store Catalog Inventory ({products.length})</h2>
                <p className="text-xs text-[#6B6B6B]">Search, edit price/stock, or remove products from database.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, category, ID..."
                    value={searchCatalogQuery}
                    onChange={(e) => setSearchCatalogQuery(e.target.value)}
                    className="pl-9 h-10 text-xs rounded-xl border-[#E8E8E8] bg-[#FAF9F6]"
                  />
                </div>

                <Button
                  onClick={() => setActiveTab('add-product')}
                  className="rounded-xl bg-[#111111] text-white hover:bg-[#3F46D8] font-bold text-xs h-10 px-4 shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E8E8] text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B6B] bg-[#FAF9F6]">
                    <th className="p-3.5 rounded-l-xl">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8] text-xs">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="p-3.5 font-bold text-[#111111]">
                        <div className="flex items-center gap-3">
                          <img src={prod.image} alt={prod.name} className="h-10 w-10 object-cover rounded-lg border border-[#E8E8E8] shrink-0" />
                          <div>
                            <p className="font-extrabold text-[#111111] line-clamp-1">{prod.name}</p>
                            <span className="text-[10px] font-mono text-gray-400">ID: #{prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-[#FAF9F6] border border-[#E8E8E8] px-2.5 py-1 rounded-md text-[11px] font-bold text-[#111111]">
                          {prod.category || 'General'}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-[#111111]">{formatCurrency(prod.price)}</td>
                      <td className="p-3.5">
                        <span className={`font-mono font-extrabold text-xs px-2.5 py-1 rounded-md border ${
                          prod.stock <= 5
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {prod.stock} in stock
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-[#3F46D8] hover:text-white text-gray-700 transition-colors"
                            title="Edit product price & stock"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ── TAB 3: PUBLISH NEW PRODUCT ── */}
        {activeTab === 'add-product' && (
          <div className="rounded-2xl border border-[#E8E8E8] bg-white p-8 max-w-3xl mx-auto shadow-xs space-y-6">
            <div className="border-b border-[#E8E8E8] pb-4">
              <h2 className="text-xl font-extrabold text-[#111111]">Publish New Product</h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                New products are written directly to your Spring Boot PostgreSQL database catalog.
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prodName" className="text-xs font-bold text-[#111111]">Product Title *</Label>
                  <Input
                    id="prodName"
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF9F6] border-[#E8E8E8] text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-[#111111]">Category *</Label>
                  <Select value={newProductCategoryId} onValueChange={setNewProductCategoryId}>
                    <SelectTrigger className="h-11 rounded-xl bg-[#FAF9F6] border-[#E8E8E8] text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-bold text-[#111111]">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="1"
                    placeholder="2999"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF9F6] border-[#E8E8E8] text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stock" className="text-xs font-bold text-[#111111]">Stock Inventory *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="25"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF9F6] border-[#E8E8E8] text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image" className="text-xs font-bold text-[#111111]">Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="h-11 rounded-xl bg-[#FAF9F6] border-[#E8E8E8] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-bold text-[#111111]">Product Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Enter detailed specifications & features..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="rounded-xl bg-[#FAF9F6] border-[#E8E8E8] text-xs min-h-[100px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="rounded-xl h-11 px-6 font-semibold text-xs border-[#E8E8E8]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="rounded-xl h-11 px-8 bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  {isSubmittingProduct ? 'Publishing...' : 'Publish to Store'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 4: CUSTOMER TRANSACTIONS & ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#111111]">Customer Transactions ({orders.length})</h2>
              <p className="text-xs text-[#6B6B6B]">Live order records fetched from database</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E8E8] text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B6B] bg-[#FAF9F6]">
                    <th className="p-3.5 rounded-l-xl">Order Ref</th>
                    <th className="p-3.5">Customer Name & Email</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 rounded-r-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8] text-xs">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="p-3.5 font-mono font-black text-[#111111]">#{order.id}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-[#111111]">{order.fullName}</p>
                        <span className="text-[11px] text-[#6B6B6B] font-normal">{order.email}</span>
                      </td>
                      <td className="p-3.5 font-black text-[#111111]">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-3.5">
                        <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-extrabold text-emerald-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#6B6B6B] font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── EDIT PRODUCT MODAL ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-[#E8E8E8] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <h3 className="text-lg font-extrabold text-[#111111]">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-gray-500 hover:text-[#111111] hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#111111]">Product Title</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-[#FAF9F6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#111111]">Price (₹)</Label>
                  <Input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-[#FAF9F6]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#111111]">Stock Inventory</Label>
                  <Input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-[#FAF9F6]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#111111]">Description</Label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="text-xs rounded-xl bg-[#FAF9F6] min-h-[80px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E8E8]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl h-10 px-5 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingProduct}
                  className="rounded-xl h-10 px-6 bg-[#3F46D8] hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  {isUpdatingProduct ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
