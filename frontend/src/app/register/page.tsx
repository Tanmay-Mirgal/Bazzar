'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api/auth';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const setCartAuth = useCartStore((s) => s.setAuthenticated);
  const setWishlistAuth = useWishlistStore((s) => s.setAuthenticated);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full Name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({ name, email, password, confirmPassword });
      setCartAuth(true);
      setWishlistAuth(true);
      toast.success('Account created! Welcome to Bazzar');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] grid grid-cols-1 lg:grid-cols-12 items-stretch">
      {/* Left Editorial Section */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#F7F7F5] border-r border-[#E8E8E8] relative flex-col justify-between p-14">
        <div>
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-[#111111] uppercase">
            <img src="/logo.png" alt="Bazzar Logo" className="h-8 w-8 object-contain" />
            <span>BAZZAR</span>
          </Link>
        </div>

        <div className="space-y-4 max-w-md">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">New Membership</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Join the Bazzar Storefront Experience.
          </h2>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Create an account to save personal favorites, access faster checkout, and receive member-only releases.
          </p>
        </div>

        <div className="text-xs text-[#6B6B6B]">
          © {new Date().getFullYear()} Bazzar Commerce Inc.
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
            <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Create Account</h1>
            <p className="text-xs text-[#6B6B6B]">
              Enter your information below to register your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-[#111111]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-none border-[#E8E8E8] bg-[#F7F7F5] focus-visible:ring-1 focus-visible:ring-[#111111]"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[#111111]">Email Address</Label>
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
                <Label htmlFor="password" className="text-xs font-bold text-[#111111]">Password</Label>
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

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#111111]">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-none border-[#E8E8E8] bg-[#F7F7F5] focus-visible:ring-1 focus-visible:ring-[#111111]"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-xs text-[#6B6B6B] pt-4 border-t border-[#E8E8E8]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#111111] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
