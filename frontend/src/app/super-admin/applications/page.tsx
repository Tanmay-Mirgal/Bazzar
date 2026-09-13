'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  Building,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Application {
  id: number;
  userName: string;
  userEmail: string;
  businessName: string;
  businessType: string;
  businessRegistrationType?: string;
  businessDescription: string;
  contactPhone: string;
  gstNumber?: string;
  panNumber?: string;
  websiteUrl?: string;
  // Pickup Logistics
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

  status: string;
  superAdminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200',
};

export default function SuperAdminApplicationsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        token = await getApiToken();
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/applications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        setApplications(await res.json());
      } else {
        console.error('Failed to fetch applications:', res.status);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      if (user) {
        fetchApplications();
      } else {
        setLoading(false);
      }
    }
  }, [userLoaded, user]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !actionNote.trim()) {
      toast.error('Rejection remark is required. Please explain what the seller needs to change before rejecting.');
      return;
    }

    setProcessing(id);
    try {
      const token = await getApiToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/applications/${id}/${action}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ note: actionNote.trim() }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === id ? data : a));
        setExpanded(null);
        setActionNote('');
        toast.success(
          action === 'approve'
            ? 'Seller approved! Account role upgraded and approval email sent.'
            : 'Application rejected. Rejection remark has been emailed to the applicant.'
        );
      } else {
        toast.error(data.message || 'Action failed. Please try again.');
      }
    } catch {
      toast.error('Network error while processing application.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Seller Verification &amp; Applications</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">
          Review business KYC, verify courier pickup warehouse hubs, and approve or reject seller applications.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === s
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-60">
              ({s === 'ALL' ? applications.length : applications.filter(a => a.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl h-24 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl py-16 text-center shadow-xs">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B6B6B]">No applications found</p>
          </div>
        ) : (
          filtered.map(app => (
            <div
              key={app.id}
              className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:border-[#3F46D8] transition-all shadow-xs"
            >
              {/* Summary row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#111111]">{app.businessName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[app.status]}`}>
                      {app.status}
                    </span>
                    {app.businessRegistrationType && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-md">
                        {app.businessRegistrationType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-2 flex-wrap">
                    <span><strong>Applicant:</strong> {app.userName} ({app.userEmail})</span>
                    <span>•</span>
                    <span><strong>Category:</strong> {app.businessType}</span>
                    {app.pickupCity && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#3F46D8]">
                          <Truck className="h-3 w-3" /> Pickup: {app.pickupCity}, {app.pickupState}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-[#888888]">
                    {new Date(app.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {expanded === app.id ? (
                    <ChevronUp className="h-4 w-4 text-[#6B6B6B]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#6B6B6B]" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === app.id && (
                <div className="px-5 pb-6 border-t border-[#E8E8E8] space-y-5 pt-4 bg-[#FCFCFA]/50">
                  {/* Grid of details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1: Business & Tax KYC */}
                    <div className="bg-white rounded-xl p-4 border border-[#E8E8E8] shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider pb-2 border-b border-[#F0F0F0]">
                        <ShieldCheck className="h-4 w-4 text-[#3F46D8]" />
                        Business KYC &amp; Identification
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">PAN Number</p>
                          <p className="font-mono font-bold text-[#111111] mt-0.5">{app.panNumber || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">GSTIN</p>
                          <p className="font-mono font-bold text-[#111111] mt-0.5">{app.gstNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">Business Contact</p>
                          <p className="font-semibold text-[#111111] mt-0.5">{app.contactPhone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">Registration Type</p>
                          <p className="font-medium text-[#111111] mt-0.5">{app.businessRegistrationType || 'Sole Proprietorship'}</p>
                        </div>
                      </div>
                      {app.websiteUrl && (
                        <div>
                          <p className="text-[10px] font-bold text-[#888888] uppercase">Website / Store URL</p>
                          <a
                            href={app.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#3F46D8] hover:underline font-medium break-all"
                          >
                            {app.websiteUrl}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-[#888888] uppercase mb-1">Catalog Description</p>
                        <p className="text-xs text-[#444444] leading-relaxed bg-[#F7F7F5] p-2.5 rounded-lg border border-[#EAEAEA]">
                          {app.businessDescription}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Pickup Logistics & Bank */}
                    <div className="space-y-4">
                      {/* Courier Pickup Hub */}
                      <div className="bg-white rounded-xl p-4 border border-[#E8E8E8] shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider">
                            <Truck className="h-4 w-4 text-[#3F46D8]" />
                            Courier Pickup Warehouse Hub
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-[#3F46D8] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                            Logistics Hub
                          </span>
                        </div>
                        <div className="text-xs text-[#444444] space-y-1">
                          <p className="font-semibold text-[#111111]">
                            {app.pickupAddressLine1}
                            {app.pickupAddressLine2 ? `, ${app.pickupAddressLine2}` : ''}
                          </p>
                          {app.pickupLandmark && (
                            <p className="text-[#666666]"><span className="text-[#888888]">Landmark:</span> {app.pickupLandmark}</p>
                          )}
                          <p className="text-[#111111] font-medium">
                            {app.pickupCity}, {app.pickupState} - <span className="font-mono font-bold">{app.pickupPostalCode}</span>
                          </p>
                          <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-[11px]">
                            <span className="text-[#777777]">Pickup Coordinator:</span>
                            <span className="font-bold text-[#111111]">{app.pickupContactName} ({app.pickupContactPhone})</span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Payout Details */}
                      <div className="bg-white rounded-xl p-4 border border-[#E8E8E8] shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider pb-2 border-b border-[#F0F0F0]">
                          <CreditCard className="h-4 w-4 text-emerald-600" />
                          Payout Bank Account
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-[#888888] uppercase">Bank Name</p>
                            <p className="font-semibold text-[#111111] mt-0.5">{app.bankName || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#888888] uppercase">IFSC Code</p>
                            <p className="font-mono font-bold text-[#111111] mt-0.5">{app.bankIfscCode || '—'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] font-bold text-[#888888] uppercase">Account Beneficiary</p>
                            <p className="font-semibold text-[#111111] mt-0.5">{app.bankAccountHolderName || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Previous Admin Note (if any) */}
                  {app.superAdminNote && (
                    <div className="bg-[#F7F7F5] rounded-xl p-3.5 border border-[#E8E8E8]">
                      <p className="text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Current Super Admin Note / Remark</p>
                      <p className="text-xs text-[#111111] leading-relaxed">{app.superAdminNote}</p>
                    </div>
                  )}

                  {/* Actions for PENDING */}
                  {app.status === 'PENDING' && (
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs space-y-3">
                      <div>
                        <label className="text-xs font-bold text-[#111111] flex items-center justify-between mb-1.5">
                          <span>Admin Remark / Feedback (Mandatory for rejection):</span>
                          <span className="text-[10px] font-normal text-[#888888]">
                            Will be emailed to <strong className="text-[#111111]">{app.userEmail}</strong>
                          </span>
                        </label>
                        <textarea
                          value={actionNote}
                          onChange={e => setActionNote(e.target.value)}
                          placeholder="e.g. Please provide a clear commercial warehouse pickup address with complete PIN code and valid PAN matching your bank beneficiary name..."
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E8E8] text-xs text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] focus:bg-white resize-none transition-colors"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleAction(app.id, 'approve')}
                          disabled={processing === app.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs h-10 shadow-sm"
                        >
                          {processing === app.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve &amp; Activate Seller
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleAction(app.id, 'reject')}
                          disabled={processing === app.id}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs h-10"
                        >
                          <XCircle className="h-4 w-4 mr-1.5" /> Reject with Remark
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
