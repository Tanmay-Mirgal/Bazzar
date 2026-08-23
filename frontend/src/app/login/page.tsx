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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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
      // Sync stores with backend after login
      setCartAuth(true);
      setWishlistAuth(true);
      toast.success('Welcome back to Bazzar!');
      // Redirect admin to dashboard, regular users to home
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              B
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900">BAZZAR</span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to manage orders, wishlist, and instant checkout
          </p>
        </div>

        <Card className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-slate-100">
            <CardTitle className="text-xl font-black text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {/* Admin hint */}
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 text-xs text-indigo-700">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Admin: <strong>admin@bazzar.com</strong> / <strong>admin123</strong></span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errors.password}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 w-full">
                {"Don't have a Bazzar account yet? "}
                <Link href="/register" className="font-extrabold text-indigo-600 hover:underline">
                  Create Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
