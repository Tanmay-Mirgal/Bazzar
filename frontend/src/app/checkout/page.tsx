'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { placeOrder, BackendOrder } from '@/lib/api/orders';
import { useCartStore } from '@/store/cart-store';
import { getCurrentUser } from '@/lib/api/auth';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, ArrowLeft, ShieldCheck, CreditCard, Lock, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

type CheckoutFormValues = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, getTotalItems, getTotalPrice } = useCartStore();

  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<BackendOrder | null>(null);

  const [formValues, setFormValues] = React.useState<CheckoutFormValues>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      setFormValues((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-24 text-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#F7F7F5] mx-auto" />
          <div className="h-64 w-full max-w-2xl bg-[#F7F7F5] mx-auto" />
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 1499 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  if (cartItems.length === 0 && !completedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-[#F7F7F5] border border-[#E8E8E8] text-[#111111] flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8 text-[#6B6B6B]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#111111]">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
            You must add items to your shopping bag before proceeding to checkout.
          </p>
        </div>
        <Link href="/products">
          <Button size="lg" className="rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-semibold text-xs px-8 h-11">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formValues.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formValues.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Valid email address is required';
    }
    if (!formValues.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formValues.address.trim()) newErrors.address = 'Street address is required';
    if (!formValues.city.trim()) newErrors.city = 'City is required';
    if (!formValues.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required shipping details');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      toast.error('Please sign in to place an order');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const order = await placeOrder({
        fullName: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phone,
        address: formValues.address,
        city: formValues.city,
        postalCode: formValues.postalCode,
      });
      setCompletedOrder(order as any);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Order Success View
  if (completedOrder) {
    return (
      <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-[#111111]">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Order Confirmed & Verified</span>
            <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Thank You For Your Order</h1>
            <p className="text-xs text-[#6B6B6B]">
              Thank you, <strong className="text-[#111111] font-bold">{(completedOrder as any)?.fullName || formValues.fullName}</strong>. Your order has been placed and is being prepared for dispatch.
            </p>
            <p className="text-xs font-mono font-bold text-[#111111] bg-[#F7F7F5] inline-block px-3 py-1 border border-[#E8E8E8]">
              Order ID: #{(completedOrder as any)?.id || 'BZ-' + Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>

          <div className="text-left border border-[#E8E8E8] bg-[#F7F7F5] p-6 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2 border-b border-[#E8E8E8] pb-2">
              <Truck className="h-4 w-4 text-[#3F46D8]" /> Shipping Destination
            </h4>
            <p className="font-bold text-[#111111]">{(completedOrder as any)?.fullName || formValues.fullName}</p>
            <p className="text-[#6B6B6B]">{(completedOrder as any)?.address || formValues.address}</p>
            <p className="text-[#6B6B6B]">{(completedOrder as any)?.city}, {(completedOrder as any)?.postalCode}</p>
            <p className="pt-2 text-[#6B6B6B]">{(completedOrder as any)?.email} • {(completedOrder as any)?.phoneNumber}</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-semibold text-xs px-8 h-11">
                Return to Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="rounded-none border-[#111111] text-[#111111] font-semibold text-xs px-8 h-11">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#111111] min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-[#F7F7F5] border-b border-[#E8E8E8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#3F46D8] text-xs font-bold uppercase tracking-widest mb-1">
              <Lock className="h-3.5 w-3.5" />
              Secure 256-Bit SSL Checkout
            </div>
            <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Express Checkout</h1>
          </div>
          <Link href="/cart" className="text-xs font-semibold text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Edit Bag
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Shipping Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border border-[#E8E8E8] bg-white p-6 space-y-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#111111] border-b border-[#E8E8E8] pb-3">
                1. Shipping & Contact Details
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold text-[#111111]">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formValues.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-600 font-semibold">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-[#111111]">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                    />
                    {errors.email && <p className="text-[11px] text-rose-600 font-semibold">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-[#111111]">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 font-semibold">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold text-[#111111]">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    placeholder="Flat 4B, Park Heights, MG Road"
                    className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                  />
                  {errors.address && <p className="text-[11px] text-rose-600 font-semibold">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-[#111111]">City / District *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 font-semibold">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-xs font-bold text-[#111111]">Postal Code / Pincode *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formValues.postalCode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className="h-10 rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-xs"
                    />
                    {errors.postalCode && <p className="text-[11px] text-rose-600 font-semibold">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-[#E8E8E8] bg-white p-6 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#111111] border-b border-[#E8E8E8] pb-3">
                2. Payment Method
              </h2>
              <div className="p-4 border border-[#111111] bg-[#F7F7F5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[#3F46D8]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Direct Spring Boot PostgreSQL Gateway</h4>
                    <p className="text-[11px] text-[#6B6B6B]">Encrypted payload processed via Spring REST API</p>
                  </div>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#E8E8E8] bg-white p-6 space-y-4 sticky top-24">
              <h3 className="text-base font-extrabold text-[#111111] uppercase border-b border-[#E8E8E8] pb-3">
                Bag Summary ({totalItems})
              </h3>
              <div className="space-y-3 text-xs">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <span className="font-medium text-[#111111] line-clamp-1 flex-1 pr-2">{item.quantity}x {item.product.name}</span>
                    <span className="font-bold text-[#111111]">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="border-t border-[#E8E8E8] pt-3 space-y-2 text-[#6B6B6B]">
                  <div className="flex justify-between text-[#111111]">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#111111]">
                    <span>Shipping</span>
                    <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
                  </div>
                  <div className="border-t border-[#E8E8E8] pt-3 flex justify-between text-sm font-extrabold text-[#111111]">
                    <span>Total</span>
                    <span className="text-lg text-[#111111]">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-none bg-[#111111] hover:bg-[#3F46D8] text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {isLoading ? 'Processing Order...' : 'Place Order Now'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
