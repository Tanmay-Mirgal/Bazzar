'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const { user } = useUser();
  const { getApiToken } = useApiAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
        if (res.ok) setCategories(await res.json());
      } catch {}
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image) {
      toast.error('Please upload a product image using Cloudinary before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          image: form.image,
          categoryId: parseInt(form.categoryId),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to add product');
        return;
      }

      setSuccess(true);
      toast.success('Product submitted for review! Our admin team will approve it shortly.');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111111]">Product Submitted!</h2>
        <p className="text-sm text-[#6B6B6B]">
          Your product is now <strong>pending review</strong> by our admin team.
          It will go live on the platform once approved — usually within 24 hours.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/store-admin/products">
            <Button variant="outline" className="rounded-xl border-[#E8E8E8] font-bold text-sm">
              View My Products
            </Button>
          </Link>
          <Button
            onClick={() => { setSuccess(false); setForm({ name: '', description: '', price: '', stock: '', image: '', categoryId: '' }); }}
            className="bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold text-sm"
          >
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/store-admin/products" className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#111111] mb-3 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
        <h1 className="text-2xl font-extrabold text-[#111111]">Add New Product</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">
          Your product will be reviewed by our admin team before going live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E8E8] p-6 space-y-5">
        {/* Product Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111]">Product Name *</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Noise Cancelling Headphones"
            className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111]">Description *</label>
          <textarea
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your product in detail — features, specifications, what's included..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111111]">Price (₹) *</label>
            <input
              type="number"
              name="price"
              required
              min="1"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="999.00"
              className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111111]">Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="100"
              className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111]">Category *</label>
          <select
            name="categoryId"
            required
            value={form.categoryId}
            onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Product Image Upload (Cloudinary) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#3F46D8]" /> Product Image *
            </span>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Powered by Cloudinary
            </span>
          </label>
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm(prev => ({ ...prev, image: url }))}
            disabled={submitting}
          />
        </div>

        {/* Approval notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Package className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <strong>Pending Review:</strong> After submission, your product will be reviewed by our admin team 
            for quality and compliance. It will go live once approved.
          </p>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-[#111111] hover:bg-[#3F46D8] text-white font-bold rounded-xl transition-colors"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting Product...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Submit Product for Review
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
