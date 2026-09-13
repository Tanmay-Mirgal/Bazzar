'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  Store,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Briefcase,
  Phone,
  FileText,
  Globe,
  Hash,
  RefreshCw,
  AlertCircle,
  MapPin,
  Truck,
  CreditCard,
  Building,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Sports & Fitness',
  'Books & Stationery',
  'Beauty & Personal Care',
  'Toys & Kids',
  'Automotive',
  'Health & Wellness',
  'Food & Beverages',
  'Jewelry & Accessories',
  'Other',
];

const REGISTRATION_TYPES = [
  'Sole Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company',
  'Public Limited Company',
  'Individual / Freelancer',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

interface ApplicationData {
  id: number;
  status: ApplicationStatus;
  businessName?: string;
  businessType?: string;
  businessRegistrationType?: string;
  businessDescription?: string;
  contactPhone?: string;
  gstNumber?: string;
  panNumber?: string;
  websiteUrl?: string;
  // Pickup warehouse
  pickupContactName?: string;
  pickupContactPhone?: string;
  pickupAddressLine1?: string;
  pickupAddressLine2?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupPostalCode?: string;
  pickupLandmark?: string;
  // Bank details
  bankAccountHolderName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;

  superAdminNote?: string;
  createdAt?: string;
  reviewedAt?: string;
}

export default function BecomeSellerPage() {
  const { user, isLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    businessRegistrationType: 'Sole Proprietorship',
    businessDescription: '',
    contactPhone: '',
    websiteUrl: '',
    gstNumber: '',
    panNumber: '',
    // Pickup
    pickupContactName: '',
    pickupContactPhone: '',
    pickupAddressLine1: '',
    pickupAddressLine2: '',
    pickupCity: '',
    pickupState: 'Maharashtra',
    pickupPostalCode: '',
    pickupLandmark: '',
    // Bank
    bankAccountHolderName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState<ApplicationData | null>(null);
  const [checkingApp, setCheckingApp] = useState(true);
  const [dbRole, setDbRole] = useState<string | null>(null);

  // Check if user already has an application and their role
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        setCheckingApp(false);
        return;
      }
      try {
        const token = await getApiToken();
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch DB role
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, { headers });
        if (meRes.ok) {
          const profile = await meRes.json();
          setDbRole(profile.role);
        }

        // 2. Fetch application status
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/application/status`, { headers });
        if (res.ok) {
          const data: ApplicationData = await res.json();
          setExistingApp(data);
          if (data.status === 'REJECTED') {
            // Pre-fill form for easy re-application
            setForm({
              businessName: data.businessName || '',
              businessType: data.businessType || '',
              businessRegistrationType: data.businessRegistrationType || 'Sole Proprietorship',
              businessDescription: data.businessDescription || '',
              contactPhone: data.contactPhone || '',
              websiteUrl: data.websiteUrl || '',
              gstNumber: data.gstNumber || '',
              panNumber: data.panNumber || '',
              pickupContactName: data.pickupContactName || '',
              pickupContactPhone: data.pickupContactPhone || '',
              pickupAddressLine1: data.pickupAddressLine1 || '',
              pickupAddressLine2: data.pickupAddressLine2 || '',
              pickupCity: data.pickupCity || '',
              pickupState: data.pickupState || 'Maharashtra',
              pickupPostalCode: data.pickupPostalCode || '',
              pickupLandmark: data.pickupLandmark || '',
              bankAccountHolderName: data.bankAccountHolderName || '',
              bankName: data.bankName || '',
              bankAccountNumber: data.bankAccountNumber || '',
              bankIfscCode: data.bankIfscCode || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch application status', err);
      } finally {
        setCheckingApp(false);
      }
    };

    if (isLoaded) {
      checkExistingApplication();
    }
  }, [user, isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PAN validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(form.panNumber.toUpperCase().trim())) {
      toast.error('Invalid PAN Number format. Example: ABCDE1234F');
      return;
    }

    // PIN code validation
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(form.pickupPostalCode.trim())) {
      toast.error('Invalid 6-digit Indian PIN code for pickup warehouse');
      return;
    }

    // IFSC validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(form.bankIfscCode.toUpperCase().trim())) {
      toast.error('Invalid IFSC code format. Example: HDFC0001234');
      return;
    }

    setSubmitting(true);

    try {
      const token = await getApiToken();
      const payload = {
        businessName: form.businessName.trim(),
        businessType: form.businessType.trim(),
        businessRegistrationType: form.businessRegistrationType.trim(),
        businessDescription: form.businessDescription.trim(),
        contactPhone: form.contactPhone.trim(),
        websiteUrl: form.websiteUrl.trim() || null,
        gstNumber: form.gstNumber.trim() ? form.gstNumber.toUpperCase().trim() : null,
        panNumber: form.panNumber.toUpperCase().trim(),
        pickupContactName: form.pickupContactName.trim(),
        pickupContactPhone: form.pickupContactPhone.trim(),
        pickupAddressLine1: form.pickupAddressLine1.trim(),
        pickupAddressLine2: form.pickupAddressLine2.trim() || null,
        pickupCity: form.pickupCity.trim(),
        pickupState: form.pickupState.trim(),
        pickupPostalCode: form.pickupPostalCode.trim(),
        pickupLandmark: form.pickupLandmark.trim() || null,
        bankAccountHolderName: form.bankAccountHolderName.trim(),
        bankName: form.bankName.trim(),
        bankAccountNumber: form.bankAccountNumber.trim(),
        bankIfscCode: form.bankIfscCode.toUpperCase().trim(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store-admin/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Submission failed. Please verify the fields.');
        return;
      }

      setExistingApp(data);
      toast.success(
        existingApp?.status === 'REJECTED'
          ? 'Application re-submitted! A confirmation email has been sent to your inbox.'
          : 'Application submitted! A confirmation email has been sent to your registered inbox.'
      );
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || checkingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3F46D8] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  const isSuperAdmin = dbRole === 'ROLE_SUPER_ADMIN' || userEmail === 'tanmaymirgal26@gmail.com' || userEmail === 'admin@bazzar.com';

  // 0. SUPER ADMIN Guard
  if (isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F7F5] to-white px-4 py-12">
        <div className="text-center max-w-lg space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-[#E8E8E8] shadow-2xl">
          <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center shadow-inner">
            <ShieldCheck className="h-10 w-10 text-[#3F46D8]" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-[#3F46D8] font-bold text-xs rounded-full border border-indigo-200 mb-2">
              Super Admin Account
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Platform Super Admin</h1>
            <p className="text-sm text-[#6B6B6B] mt-2">
              You are logged in with Super Admin privileges. You review and verify seller applications rather than applying as one.
            </p>
          </div>

          <Button
            onClick={() => router.push('/super-admin')}
            className="w-full bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold py-6 text-sm shadow-md transition-all"
          >
            Go to Super Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // 1. APPROVED State
  if (existingApp?.status === 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F7F5] to-white px-4 py-12">
        <div className="text-center max-w-lg space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-[#E8E8E8] shadow-2xl">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 mb-2">
              Verified Seller Partner
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111]">You're an Approved Seller!</h1>
            <p className="text-sm text-[#6B6B6B] mt-2">
              Your application for <strong className="text-[#111111]">{existingApp.businessName}</strong> has been approved by the platform Super Admin.
            </p>
          </div>

          <div className="bg-[#F7F7F5] rounded-2xl p-5 text-left border border-[#E8E8E8] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <Truck className="h-4 w-4 text-[#3F46D8]" />
              Pickup Logistics Active
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Couriers are authorized to pick up customer orders from:{' '}
              <strong className="text-[#111111]">
                {existingApp.pickupAddressLine1}, {existingApp.pickupCity} ({existingApp.pickupPostalCode})
              </strong>
            </p>
            {existingApp.superAdminNote && (
              <div className="pt-2 border-t border-[#E0E0E0]">
                <p className="text-[10px] font-bold text-[#888888] uppercase">Super Admin Remark</p>
                <p className="text-xs text-[#111111] mt-0.5">{existingApp.superAdminNote}</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => router.push('/store-admin')}
            className="w-full bg-[#111111] hover:bg-[#3F46D8] text-white rounded-xl font-bold py-6 text-sm shadow-md transition-all"
          >
            Go to Seller Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // 2. PENDING State
  if (existingApp?.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F7F5] to-white px-4 py-12">
        <div className="text-center max-w-xl space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-[#E8E8E8] shadow-2xl">
          <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center animate-pulse shadow-inner">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200 mb-2">
              Verification In Progress
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Application Under Review</h1>
            <p className="text-sm text-[#6B6B6B] mt-2">
              Your application for <strong className="text-[#111111]">{existingApp.businessName}</strong> has been received and is being verified by our Super Admin.
            </p>
          </div>

          <div className="bg-[#FAF9F6] rounded-2xl p-5 text-left border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-700" /> KYC &amp; Verification Details
              </div>
              <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Pending Approval
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#555555] pt-1">
              <div><span className="text-[#888888]">Category:</span> <strong className="text-[#111111]">{existingApp.businessType}</strong></div>
              <div><span className="text-[#888888]">PAN:</span> <strong className="text-[#111111]">{existingApp.panNumber || '—'}</strong></div>
              <div><span className="text-[#888888]">GSTIN:</span> <strong className="text-[#111111]">{existingApp.gstNumber || 'Not provided'}</strong></div>
              <div><span className="text-[#888888]">Contact:</span> <strong className="text-[#111111]">{existingApp.contactPhone}</strong></div>
            </div>

            <div className="pt-2 border-t border-amber-200/60">
              <div className="flex items-start gap-2">
                <Truck className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
                <div className="text-xs text-[#555555]">
                  <span className="text-[#888888]">Registered Courier Pickup Hub:</span>
                  <p className="font-semibold text-[#111111] mt-0.5">
                    {existingApp.pickupAddressLine1}{existingApp.pickupAddressLine2 ? `, ${existingApp.pickupAddressLine2}` : ''}, {existingApp.pickupCity}, {existingApp.pickupState} - {existingApp.pickupPostalCode}
                  </p>
                  <p className="text-[11px] text-[#777777]">Contact: {existingApp.pickupContactName} ({existingApp.pickupContactPhone})</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#6B6B6B] bg-[#F7F7F5] p-4 rounded-xl border border-[#E8E8E8] text-left space-y-1">
            <p className="font-bold text-[#111111]">What happens next?</p>
            <p>Our team verifies your PAN, GSTIN, and Pickup Warehouse location within <strong>24–48 hours</strong>.</p>
            <p>An automated notification has been dispatched to your email (<strong>{user.primaryEmailAddress?.emailAddress}</strong>). You will also receive an email the moment your application is approved or if revisions are needed.</p>
          </div>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full border-[#E8E8E8] text-[#111111] hover:bg-[#F7F7F5] rounded-xl font-bold text-xs py-5"
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // 3. REJECTED State or Fresh Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F5] via-white to-[#EEF0FF] pb-24">
      {/* Hero */}
      <div className="bg-[#111111] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#3F46D8] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
            <Store className="h-3.5 w-3.5" />
            Seller Partnership Program
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {existingApp?.status === 'REJECTED' ? 'Update & Re-apply as Seller' : 'Become a Bazzar Seller'}
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Sell directly to verified buyers nationwide. Configure your store, register your warehouse pickup hub for customer shipping, and undergo Super Admin review.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-2 text-xs text-gray-300">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-indigo-400" /> Doorstep Courier Pickup</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Verified Seller Badge</span>
            <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-amber-400" /> Direct Bank Payouts</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* If Rejected Banner with Super Admin Remark */}
        {existingApp?.status === 'REJECTED' && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2.5 text-red-700 font-extrabold text-base">
              <XCircle className="h-6 w-6 shrink-0 text-red-600" />
              Action Required: Application Revision Requested by Super Admin
            </div>
            {existingApp.superAdminNote && (
              <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs">
                <p className="text-[11px] font-bold text-red-900 uppercase tracking-wider">Super Admin Remark &amp; Changes Needed:</p>
                <p className="text-sm text-red-800 mt-1 font-semibold leading-relaxed">
                  "{existingApp.superAdminNote}"
                </p>
              </div>
            )}
            <p className="text-xs text-red-700">
              Please review the feedback above, update the corresponding fields below (such as PAN, GSTIN, or courier pickup location), and re-submit. All previously submitted information has been retained below.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[#E8E8E8] shadow-2xl p-6 md:p-10 space-y-8"
        >
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#111111]">
              {existingApp?.status === 'REJECTED' ? 'Revise Seller Application' : 'Seller Onboarding Form'}
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Please provide complete business, logistics pickup, and payout details so the Super Admin can verify and activate your seller privileges.
            </p>
          </div>

          {/* ── SECTION 1: BUSINESS & STORE PROFILE ────────────────────────── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E8]">
              <Store className="h-4 w-4 text-[#3F46D8]" />
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">1. Store &amp; Business Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Store / Brand Name *</label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Electronics &amp; Accessories"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Primary Category *</label>
                <select
                  name="businessType"
                  required
                  value={form.businessType}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                >
                  <option value="">Select your primary category</option>
                  {BUSINESS_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Business Constitution / Type *</label>
                <select
                  name="businessRegistrationType"
                  required
                  value={form.businessRegistrationType}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                >
                  {REGISTRATION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Official Business Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">Business Description &amp; Catalog Overview *</label>
              <textarea
                name="businessDescription"
                required
                value={form.businessDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your catalog, brand history, warranty support, and product authenticity guarantees..."
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#6B6B6B]" /> Website or Social Catalog URL <span className="text-[#AAAAAA] font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourbrand.com or Instagram shop link"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* ── SECTION 2: LEGAL & TAX KYC ─────────────────────────────────── */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E8]">
              <ShieldCheck className="h-4 w-4 text-[#3F46D8]" />
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">2. Legal &amp; Tax KYC Verification</h3>
            </div>
            <p className="text-[11px] text-[#6B6B6B]">
              Required by Indian e-commerce regulations for invoice generation and Super Admin verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-[#3F46D8]" /> PAN Number *
                </label>
                <input
                  type="text"
                  name="panNumber"
                  required
                  maxLength={10}
                  value={form.panNumber}
                  onChange={handleChange}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm font-mono uppercase text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-[#6B6B6B]" /> GSTIN Number <span className="text-[#AAAAAA] font-normal">(Optional if exempt)</span>
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  maxLength={15}
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm font-mono uppercase text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: PICKUP & WAREHOUSE ADDRESS (CRITICAL) ────────────── */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E8]">
              <Truck className="h-4 w-4 text-[#3F46D8]" />
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">3. Courier &amp; Logistics Pickup Warehouse</h3>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#3F46D8] mt-0.5 shrink-0" />
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                <strong>Crucial Pickup Address:</strong> Bazzar's courier and logistics partners will arrive at this address to pick up packages and deliver them to customers. Ensure this location is accessible for daily dispatches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Pickup Contact Person Name *</label>
                <input
                  type="text"
                  name="pickupContactName"
                  required
                  value={form.pickupContactName}
                  onChange={handleChange}
                  placeholder="e.g. Warehouse Manager or Your Name"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Pickup Contact Mobile Number *</label>
                <input
                  type="tel"
                  name="pickupContactPhone"
                  required
                  value={form.pickupContactPhone}
                  onChange={handleChange}
                  placeholder="Mobile for courier coordination"
                  pattern="[6-9][0-9]{9}"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">Address Line 1 (Unit, Building, Street) *</label>
              <input
                type="text"
                name="pickupAddressLine1"
                required
                value={form.pickupAddressLine1}
                onChange={handleChange}
                placeholder="Shop No. 4, Ground Floor, Sunrise Commercial Complex"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Address Line 2 (Area, Sector, Locality)</label>
                <input
                  type="text"
                  name="pickupAddressLine2"
                  value={form.pickupAddressLine2}
                  onChange={handleChange}
                  placeholder="Sector 18, Near Metro Station"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Landmark</label>
                <input
                  type="text"
                  name="pickupLandmark"
                  value={form.pickupLandmark}
                  onChange={handleChange}
                  placeholder="Opposite City Mall"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">City *</label>
                <input
                  type="text"
                  name="pickupCity"
                  required
                  value={form.pickupCity}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">State *</label>
                <select
                  name="pickupState"
                  required
                  value={form.pickupState}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">6-Digit PIN Code *</label>
                <input
                  type="text"
                  name="pickupPostalCode"
                  required
                  maxLength={6}
                  value={form.pickupPostalCode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                  pattern="[1-9][0-9]{5}"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 4: BANK & PAYOUT DETAILS ───────────────────────────── */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E8]">
              <CreditCard className="h-4 w-4 text-[#3F46D8]" />
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">4. Bank Account for Order Payouts</h3>
            </div>
            <p className="text-[11px] text-[#6B6B6B]">
              Proceeds from your sales will be transferred directly to this registered account after order delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Account Beneficiary Name *</label>
                <input
                  type="text"
                  name="bankAccountHolderName"
                  required
                  value={form.bankAccountHolderName}
                  onChange={handleChange}
                  placeholder="Name as printed in passbook"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  required
                  value={form.bankName}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Bank Account Number *</label>
                <input
                  type="password"
                  name="bankAccountNumber"
                  required
                  value={form.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">Bank IFSC Code *</label>
                <input
                  type="text"
                  name="bankIfscCode"
                  required
                  maxLength={11}
                  value={form.bankIfscCode}
                  onChange={handleChange}
                  placeholder="e.g. HDFC0001234"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E8E8] bg-[#F7F7F5] text-sm font-mono uppercase text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Final Notice */}
          <div className="bg-[#F7F7F5] p-4 rounded-2xl border border-[#E8E8E8] flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-[#3F46D8] mt-0.5 shrink-0" />
            <p className="text-xs text-[#555555] leading-relaxed">
              <strong>Super Admin Verification Notice:</strong> By submitting, you confirm that the details provided are accurate and the pickup location is prepared for dispatch. An automated confirmation email will be sent to <strong>{user.primaryEmailAddress?.emailAddress}</strong> upon submission.
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-[#111111] hover:bg-[#3F46D8] text-white font-extrabold rounded-2xl transition-all shadow-lg text-sm"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Submitting Application &amp; Sending Notification...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {existingApp?.status === 'REJECTED' ? 'Update & Re-Submit Application' : 'Submit Application for Super Admin Review'}{' '}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
