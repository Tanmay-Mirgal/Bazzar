'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const setCartAuth = useCartStore((s) => s.setAuthenticated);
  const setWishlistAuth = useWishlistStore((s) => s.setAuthenticated);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      setCartAuth(true);
      setWishlistAuth(true);
      toast.success('Welcome back to Bazzar!');
      if (response.user.role === 'ROLE_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] grid grid-cols-1 lg:grid-cols-12 items-stretch">
      {/* Left Editorial Image Section */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#F7F7F5] border-r border-[#E8E8E8] relative flex-col justify-between p-14">
        <div>
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-[#111111] uppercase">
            <img src="/logo.png" alt="Bazzar Logo" className="h-8 w-8 object-contain" />
            <span>BAZZAR</span>
          </Link>
        </div>

        <div className="space-y-4 max-w-md">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Member Access</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Curated Commerce Designed for Longevity.
          </h2>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Access your saved favorites, track active shipments, and manage your account preferences in one central dashboard.
          </p>
        </div>

        <div className="text-xs text-[#6B6B6B]">
          © {new Date().getFullYear()} Bazzar Storefront Inc.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="lg:col-span-6 flex items-center justify-center p-8 sm:p-14">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="lg:hidden flex items-center gap-2 text-2xl font-black tracking-tight text-[#111111] uppercase mb-4">
              <img src="/logo.png" alt="Bazzar Logo" className="h-8 w-8 object-contain" />
              <span>BAZZAR</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Sign In</h1>
            <p className="text-xs text-[#6B6B6B]">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[#111111]">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-none border-[#E8E8E8] bg-[#F7F7F5] focus-visible:ring-1 focus-visible:ring-[#111111]"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-[#111111]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-none border-[#E8E8E8] bg-[#F7F7F5] focus-visible:ring-1 focus-visible:ring-[#111111]"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errors.password}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In to Account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-xs text-[#6B6B6B] pt-4 border-t border-[#E8E8E8]">
              {"Don't have a Bazzar account yet? "}
              <Link href="/register" className="font-bold text-[#111111] hover:underline">
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
