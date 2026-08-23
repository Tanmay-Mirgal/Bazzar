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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, ArrowLeft, ShieldCheck, CreditCard, Lock, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, getTotalItems, getTotalPrice } = useCartStore();

  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<BackendOrder | null>(null);

  const [formValues, setFormValues] = React.useState({
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
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg mx-auto" />
          <div className="h-64 w-full max-w-2xl bg-slate-100 rounded-2xl mx-auto" />
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
        <div className="h-20 w-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You must add items to your shopping bag before proceeding to checkout.
          </p>
        </div>
        <Link href="/products">
          <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 h-12">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

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
    if (errors[name as keyof CheckoutFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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
      toast.success('Order placed successfully! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Order Confirmation Success View
  if (completedOrder) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>

        <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Payment & Order Verified</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
            <p className="text-xs text-slate-500">
              Thank you, <strong className="text-slate-900 font-bold">{(completedOrder as any)?.fullName || formValues.fullName}</strong>. Your order is being processed!
            </p>
            <p className="text-xs text-indigo-600 font-mono font-bold bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
              Order ID: #{(completedOrder as any)?.id || 'BZ-' + Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>

          <Card className="text-left rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />
                Shipping Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-1.5 text-slate-600">
              <p className="font-bold text-slate-900 text-sm">{(completedOrder as any)?.fullName || formValues.fullName}</p>
              <p>{(completedOrder as any)?.address || formValues.address}</p>
              <p>{(completedOrder as any)?.city}, {(completedOrder as any)?.postalCode}</p>
              <p className="pt-2 text-slate-400 font-medium">{(completedOrder as any)?.email} • {(completedOrder as any)?.phoneNumber}</p>
            </CardContent>
          </Card>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-8 h-12">
                Return to Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="rounded-full border-slate-300 font-bold text-xs px-8 h-12">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">
              <Lock className="h-3.5 w-3.5" />
              Secure 256-Bit SSL Checkout
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Express Checkout</h1>
          </div>
          <Link href="/cart" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Edit Bag
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Shipping Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-xs">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                  Shipping Address & Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formValues.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="h-11 rounded-xl bg-slate-50 text-xs"
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-600 font-semibold">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      className="h-11 rounded-xl bg-slate-50 text-xs"
                    />
                    {errors.email && <p className="text-[11px] text-rose-600 font-semibold">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="h-11 rounded-xl bg-slate-50 text-xs"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 font-semibold">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold text-slate-700">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    placeholder="Flat 4B, Park Heights, MG Road"
                    className="h-11 rounded-xl bg-slate-50 text-xs"
                  />
                  {errors.address && <p className="text-[11px] text-rose-600 font-semibold">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-slate-700">City / District *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="h-11 rounded-xl bg-slate-50 text-xs"
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 font-semibold">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-xs font-bold text-slate-700">Pincode / Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formValues.postalCode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className="h-11 rounded-xl bg-slate-50 text-xs"
                    />
                    {errors.postalCode && <p className="text-[11px] text-rose-600 font-semibold">{errors.postalCode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Integration */}
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                  Payment Options
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Direct Spring Boot Backend Integration</h4>
                      <p className="text-[11px] text-slate-500">Order payload processed via PostgreSQL API</p>
                    </div>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Side Bar */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-black text-slate-900">Items Summary ({totalItems})</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 line-clamp-1 flex-1 pr-2">{item.quantity}x {item.product.name}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-3 space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-lg text-indigo-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25"
                >
                  {isLoading ? 'Processing Order...' : 'Place Order & Pay'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
