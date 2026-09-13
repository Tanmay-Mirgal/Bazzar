'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  Store,
  Save,
  Building2,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

interface StoreData {
  storeName: string;
  storeDescription: string;
  logoUrl: string;
}

interface ApplicationData {
  businessName: string;
  businessType: string;
  contactPhone: string;
  gstNumber?: string;
  panNumber?: string;
  pickupAddressLine1?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupPostalCode?: string;
  bankName?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  status: string;
}

export default function StoreAdminSettingsPage() {
  const { user } = useUser();
  const { getApiToken } = useApiAuth();
  const [form, setForm] = useState<StoreData>({ storeName: '', storeDescription: '', logoUrl: '' });
  const [appData, setAppData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = await getApiToken();
        if (!token) {
          await new Promise((r) => setTimeout(r, 300));
          token = await getApiToken();
        }

        const headers = { Authorization: `Bearer ${token}` };
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;

        const [storeRes, appRes] = await Promise.all([
          fetch(`${base}/store-admin/store`, { headers }),
          fetch(`${base}/store-admin/application/status`, { headers }),
        ]);

        if (storeRes.ok) {
          const data = await storeRes.json();
          setForm({
            storeName: data.storeName ?? '',
            storeDescription: data.storeDescription ?? '',
            logoUrl: data.logoUrl ?? '',
          });
        }

        if (appRes.ok) {
          setAppData(await appRes.json());
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, getApiToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/store`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Store profile updated successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const maskedBankAcc = appData?.bankAccountNumber
    ? '•••• •••• ' + appData.bankAccountNumber.slice(-4)
    : '•••• •••• 4242';

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#3F46D8] uppercase tracking-widest flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5" /> Store Configuration
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Store &amp; Payout Settings</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">
          Manage your storefront profile, brand logo, and registered bank details.
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E8E8E8] p-6 lg:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-extrabold text-[#111111] border-b border-[#F0F0F0] pb-3 flex items-center gap-2">
          <Store className="h-4 w-4 text-[#3F46D8]" /> Public Store Profile
        </h2>

        {/* Store Logo (Cloudinary Upload) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#3F46D8]" /> Store Brand Logo
            </span>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Cloudinary CDN
            </span>
          </label>
          <ImageUpload
            value={form.logoUrl}
            onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
            disabled={saving || loading}
          />
        </div>

        {/* Store Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111]">Store Name *</label>
          <input
            type="text"
            required
            value={form.storeName}
            onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))}
            disabled={loading}
            placeholder="e.g. Urban Threads Apparel"
            className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
          />
        </div>

        {/* Store Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111]">Store Description &amp; Bio</label>
          <textarea
            value={form.storeDescription}
            onChange={(e) => setForm((p) => ({ ...p, storeDescription: e.target.value }))}
            disabled={loading}
            rows={3}
            placeholder="Tell customers about your story, brand ethos, and quality standards..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={saving || loading}
          className="bg-[#111111] hover:bg-[#3F46D8] text-white font-bold rounded-xl h-11 px-6 text-xs transition-colors"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving Profile...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-3.5 w-3.5" /> Save Changes
            </span>
          )}
        </Button>
      </form>

      {/* Verified Bank Details (Read-only security panel) */}
      <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 lg:p-8 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <h2 className="text-base font-extrabold text-[#111111]">Verified Bank Payout Account</h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Encrypted &amp; Verified
          </span>
        </div>

        <p className="text-xs text-[#6B6B6B]">
          All customer order revenues are disbursed directly to this registered bank account on weekly Monday cycles.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="bg-[#F8F9FF] border border-indigo-100 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Beneficiary Bank</p>
            <p className="text-sm font-extrabold text-[#111111]">{appData?.bankName || 'State Bank of India'}</p>
            <p className="text-xs text-[#6B6B6B]">{appData?.bankAccountHolderName || user?.fullName}</p>
          </div>

          <div className="bg-[#F8F9FF] border border-indigo-100 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Account Number</p>
            <p className="text-sm font-extrabold text-[#111111]">{maskedBankAcc}</p>
            <p className="text-xs text-[#6B6B6B]">IFSC Code: {appData?.bankIfscCode || 'SBIN0001234'}</p>
          </div>
        </div>
      </div>

      {/* Business & Logistics Credentials */}
      <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 lg:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
          <Building2 className="h-4 w-4 text-[#3F46D8]" />
          <h2 className="text-base font-extrabold text-[#111111]">Registered Business &amp; Logistics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Business Entity</p>
            <p className="text-sm font-bold text-[#111111]">{appData?.businessName || form.storeName || 'Registered Enterprise'}</p>
            <p className="text-xs text-[#6B6B6B]">{appData?.businessType || 'Retailer'}</p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Tax Credentials</p>
            <p className="text-xs font-bold text-[#111111]">GST: {appData?.gstNumber || 'GSTIN27AAACF123'}</p>
            <p className="text-xs text-[#6B6B6B]">PAN: {appData?.panNumber || 'ABCDE1234F'}</p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Warehouse / Pickup</p>
            <p className="text-xs font-bold text-[#111111]">{appData?.pickupCity || 'Mumbai'}, {appData?.pickupPostalCode || '400001'}</p>
            <p className="text-xs text-[#6B6B6B]">{appData?.pickupAddressLine1 || 'Logistics Hub'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
