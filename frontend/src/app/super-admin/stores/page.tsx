'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import { Store, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

interface StoreData {
  id: number;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  storeDescription?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  totalProducts: number;
}

export default function SuperAdminStoresPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = await getApiToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/stores`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) setStores(await res.json());
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userLoaded) {
      if (user) fetchStores();
      else setLoading(false);
    }
  }, [userLoaded, user]);

  const handleToggle = async (id: number) => {
    setToggling(id);
    try {
      const token = await getApiToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/stores/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setStores(prev => prev.map(s => s.id === id ? updated : s));
        toast.success(`Store ${updated.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">All Stores</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">{stores.length} stores on the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl h-40 animate-pulse" />
          ))
        ) : stores.length === 0 ? (
          <div className="col-span-3 bg-white border border-[#E8E8E8] rounded-2xl py-16 text-center shadow-xs">
            <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B6B6B]">No stores yet</p>
          </div>
        ) : (
          stores.map(store => (
            <div key={store.id} className={`bg-white border rounded-2xl p-5 space-y-4 transition-all shadow-xs ${
              store.isActive ? 'border-[#E8E8E8] hover:border-[#3F46D8]' : 'border-[#E8E8E8] opacity-60'
            }`}>
              {/* Store header */}
              <div className="flex items-start gap-3">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.storeName}
                    className="h-12 w-12 rounded-xl object-cover shrink-0 border border-[#E8E8E8]" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-[#3F46D8]/10 flex items-center justify-center shrink-0">
                    <Store className="h-6 w-6 text-[#3F46D8]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111111] truncate">{store.storeName}</p>
                  <p className="text-xs text-[#6B6B6B] truncate">{store.ownerName}</p>
                  <p className="text-[10px] text-[#888888] truncate">{store.ownerEmail}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 bg-[#F7F7F5] rounded-xl px-4 py-3 border border-[#E8E8E8]">
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                  <Package className="h-3.5 w-3.5 text-[#3F46D8]" />
                  <span><strong className="text-[#111111]">{store.totalProducts}</strong> products</span>
                </div>
                <div className="ml-auto text-[10px] text-[#888888]">
                  Since {new Date(store.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

              {/* Status + Toggle */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  store.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggle(store.id)}
                  disabled={toggling === store.id}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#111111] transition-colors"
                  title={store.isActive ? 'Deactivate store' : 'Activate store'}
                >
                  {toggling === store.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#6B6B6B] border-t-transparent" />
                  ) : store.isActive ? (
                    <ToggleRight className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                  {store.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
