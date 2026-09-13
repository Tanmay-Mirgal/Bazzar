'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import { Users, Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROLE_BADGE: Record<string, string> = {
  ROLE_SUPER_ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
  ROLE_STORE_ADMIN: 'bg-blue-50 text-blue-700 border border-blue-200',
  ROLE_USER: 'bg-gray-100 text-[#6B6B6B] border border-[#E8E8E8]',
};

const ROLE_LABEL: Record<string, string> = {
  ROLE_SUPER_ADMIN: 'Super Admin',
  ROLE_STORE_ADMIN: 'Store Admin',
  ROLE_USER: 'User',
};

export default function SuperAdminUsersPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getApiToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/super-admin/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) setUsers(await res.json());
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userLoaded) {
      if (user) fetchUsers();
      else setLoading(false);
    }
  }, [userLoaded, user]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">All Users</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">{users.length} registered users</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm h-10 pl-10 pr-4 rounded-xl bg-white border border-[#E8E8E8] text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3F46D8] shadow-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-[#F7F7F5] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B6B6B]">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F5] border-b border-[#E8E8E8]">
                <tr>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-widest px-6 py-3.5">#</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-widest px-3 py-3.5">Name</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-widest px-3 py-3.5">Email</th>
                  <th className="text-left text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-widest px-3 py-3.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]">
                {filtered.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="px-6 py-3.5 text-xs text-[#888888]">{idx + 1}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#3F46D8]">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#111111]">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-xs text-[#6B6B6B]">{u.email}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ROLE_BADGE[u.role] ?? ROLE_BADGE.ROLE_USER}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
