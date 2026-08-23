'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts, createProduct, deleteProduct } from '@/lib/api/products';
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
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'add-product' | 'orders' | 'manage-products'>('overview');

  // Data state
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [orders, setOrders] = React.useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // New Product Form State
  const [newProductName, setNewProductName] = React.useState('');
  const [newProductDesc, setNewProductDesc] = React.useState('');
  const [newProductPrice, setNewProductPrice] = React.useState('');
  const [newProductStock, setNewProductStock] = React.useState('');
  const [newProductImage, setNewProductImage] = React.useState('');
  const [newProductCategoryId, setNewProductCategoryId] = React.useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (!user || (user.role !== 'ROLE_ADMIN' && user.email !== 'admin@bazzar.com')) {
      toast.error('Access Denied. Admins only.');
      router.push('/login');
    }
  }, [router]);

  const fetchData = async () => {
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
      console.error('Failed to fetch admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProductName || !newProductPrice || !newProductStock || !newProductCategoryId) {
      toast.error('Please fill in all required product fields');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const created = await createProduct({
        name: newProductName,
        description: newProductDesc || 'Premium catalog item.',
        price: parseFloat(newProductPrice),
        stock: parseInt(newProductStock),
        image: newProductImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        categoryId: parseInt(newProductCategoryId),
      });

      toast.success(`Added product: ${created.name}`);

      // Reset form
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductImage('');
      setNewProductCategoryId('');

      fetchData();
      setActiveTab('manage-products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    try {
      await deleteProduct(String(id));
      toast.success('Product deleted from catalog');
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (!mounted) return null;

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.totalAmount), 0);

  return (
    <div className="bg-white text-[#111111] min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-[#111111] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#333333] px-3 py-1 text-xs font-mono text-indigo-300 mb-2">
              <img src="/logo.png" alt="Bazzar Logo" className="h-4 w-4 object-contain bg-white rounded-xs p-0.5" />
              <span>ADMIN CONTROL CENTER</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Store Operations Portal</h1>
            <p className="text-[#A3A3A3] text-xs mt-1">Manage catalog inventory, review user transactions, and publish new products</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setActiveTab('add-product')}
              className="rounded-none bg-white hover:bg-[#E5E5E5] text-[#111111] font-bold text-xs px-6 h-10 transition-colors"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Publish Product
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 border border-[#E8E8E8] bg-[#F7F7F5] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#6B6B6B] font-bold uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-extrabold text-[#111111] mt-1">{formatCurrency(totalRevenue)}</h3>
            </div>
            <TrendingUp className="h-6 w-6 text-[#3F46D8]" />
          </div>

          <div className="p-5 border border-[#E8E8E8] bg-[#F7F7F5] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#6B6B6B] font-bold uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-extrabold text-[#111111] mt-1">{orders.length}</h3>
            </div>
            <ShoppingBag className="h-6 w-6 text-[#3F46D8]" />
          </div>

          <div className="p-5 border border-[#E8E8E8] bg-[#F7F7F5] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#6B6B6B] font-bold uppercase tracking-wider">Active Catalog Products</p>
              <h3 className="text-2xl font-extrabold text-[#111111] mt-1">{products.length}</h3>
            </div>
            <Layers className="h-6 w-6 text-[#3F46D8]" />
          </div>

          <div className="p-5 border border-[#E8E8E8] bg-[#F7F7F5] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#6B6B6B] font-bold uppercase tracking-wider">Registered Accounts</p>
              <h3 className="text-2xl font-extrabold text-[#111111] mt-1">48 Users</h3>
            </div>
            <Users className="h-6 w-6 text-[#3F46D8]" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E8E8E8] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            Overview & Activity
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'add-product'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <PackagePlus className="h-3.5 w-3.5" /> Publish New Product
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'orders'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('manage-products')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'manage-products'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            Manage Catalog ({products.length})
          </button>
        </div>

        {/* TAB 1: ADD PRODUCT FORM */}
        {activeTab === 'add-product' && (
          <div className="border border-[#E8E8E8] bg-white p-8 max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[#E8E8E8] pb-4">
              <h2 className="text-xl font-extrabold text-[#111111]">Publish New Product</h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                New products are written directly to your Spring Boot PostgreSQL backend database.
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prodName" className="text-xs font-bold text-[#111111]">Product Title *</Label>
                  <Input
                    id="prodName"
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-[#111111]">Category *</Label>
                  <Select value={newProductCategoryId} onValueChange={setNewProductCategoryId}>
                    <SelectTrigger className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs">
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
                    className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
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
                    className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
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
                  className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-bold text-[#111111]">Product Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Enter detailed specifications & features..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs min-h-[100px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="rounded-none h-11 px-6 font-semibold text-xs border-[#E8E8E8]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="rounded-none h-11 px-8 bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  {isSubmittingProduct ? 'Publishing...' : 'Publish to Store'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="border border-[#E8E8E8] bg-white p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-[#111111]">Customer Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E8E8] text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                    <th className="pb-3">Order Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8] text-xs">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F7F7F5] transition-colors">
                      <td className="py-4 font-mono font-bold text-[#111111]">#{order.id}</td>
                      <td className="py-4 font-bold text-[#111111]">
                        {order.fullName}
                        <span className="block text-[11px] text-[#6B6B6B] font-normal">{order.email}</span>
                      </td>
                      <td className="py-4 font-bold text-[#111111]">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-4">
                        <span className="bg-[#F7F7F5] border border-[#E8E8E8] px-2 py-0.5 text-[10px] font-bold text-[#111111]">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-[#6B6B6B]">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE CATALOG */}
        {activeTab === 'manage-products' && (
          <div className="border border-[#E8E8E8] bg-white p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-4">
              <h2 className="text-xl font-extrabold text-[#111111]">Store Catalog List ({products.length})</h2>
              <Button
                onClick={() => setActiveTab('add-product')}
                size="sm"
                className="rounded-none bg-[#111111] text-white hover:bg-[#3F46D8] font-bold text-xs px-4"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-4 border border-[#E8E8E8] bg-[#F7F7F5]">
                  <div className="flex items-center gap-3">
                    <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover border border-[#E8E8E8]" />
                    <div>
                      <h4 className="font-bold text-xs text-[#111111] line-clamp-1">{prod.name}</h4>
                      <p className="text-[11px] font-semibold text-[#6B6B6B]">{formatCurrency(prod.price)} • {prod.stock} in stock</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 text-[#6B6B6B] hover:text-rose-600 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OVERVIEW DEFAULT */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="border border-[#E8E8E8] bg-white p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
                  <h3 className="text-base font-extrabold text-[#111111]">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#3F46D8]">
                    View All →
                  </button>
                </div>
                <div className="space-y-2">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="flex items-center justify-between p-3 bg-[#F7F7F5] border border-[#E8E8E8] text-xs">
                      <div>
                        <p className="font-bold text-[#111111]">{ord.fullName} (#{ord.id})</p>
                        <p className="text-[#6B6B6B] text-[11px]">{ord.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#111111]">{formatCurrency(ord.totalAmount)}</p>
                        <span className="text-[10px] font-bold text-[#3F46D8]">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="border border-[#E8E8E8] bg-[#111111] text-white p-6 space-y-4">
                <h3 className="text-lg font-bold tracking-tight text-white">Catalog Actions</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Publish new products directly to your Spring Boot PostgreSQL backend database.
                </p>
                <Button
                  onClick={() => setActiveTab('add-product')}
                  className="w-full rounded-none bg-white text-[#111111] hover:bg-[#E5E5E5] font-bold text-xs h-11"
                >
                  Publish Product Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
