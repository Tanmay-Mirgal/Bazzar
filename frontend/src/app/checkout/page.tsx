'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { placeOrder } from '@/lib/api/orders';
import { useCartStore } from '@/store/cart-store';
import { CheckoutFormValues, Order } from '@/types/order';
import { formatCurrency } from '@/lib/utils';
import { OrderSummary } from '@/components/cart/order-summary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle2, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, getTotalItems, getTotalPrice } = useCartStore();

  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<Order | null>(null);

  const [formValues, setFormValues] = React.useState<CheckoutFormValues>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof CheckoutFormValues, string>>>({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-xs text-zinc-400">Loading checkout...</p>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();

  if (cartItems.length === 0 && !completedOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-black">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          You must add items to your cart before proceeding to checkout.
        </p>
        <Link href="/products">
          <Button variant="default" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  // Handle Form Validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

    if (!formValues.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required';
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required shipping details');
      return;
    }

    setIsLoading(true);

    try {
      const order = await placeOrder({
        customerInfo: formValues,
        items: cartItems,
        totalAmount: subtotal + (subtotal > 150 ? 0 : 15),
      });

      setCompletedOrder(order);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Render Order Confirmation State after success
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-black">Order Confirmed!</h1>
          <p className="text-xs text-zinc-500">
            Thank you for your purchase, <strong>{completedOrder.customerInfo.fullName}</strong>.
          </p>
          <p className="text-xs text-zinc-400 font-mono">
            Order Reference ID: {completedOrder.id}
          </p>
        </div>

        <Card className="text-left max-w-md mx-auto border-zinc-200">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-xs uppercase tracking-wider text-black">
              Shipping Destination
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 text-xs space-y-1 text-zinc-600">
            <p className="font-semibold text-zinc-900">{completedOrder.customerInfo.fullName}</p>
            <p>{completedOrder.customerInfo.address}</p>
            <p>{completedOrder.customerInfo.city}, {completedOrder.customerInfo.postalCode}</p>
            <p className="pt-1 text-zinc-400">{completedOrder.customerInfo.email}</p>
          </CardContent>
        </Card>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="text-xs uppercase font-semibold h-11 px-8">
              Return to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="text-xs font-semibold h-11 px-8">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-black">Checkout</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Complete your shipping information to place your order
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-black uppercase tracking-wider">
                1. Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formValues.fullName}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="jane@example.com"
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && (
                  <p className="text-[10px] text-red-600 font-medium">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formValues.address}
                  onChange={handleInputChange}
                  placeholder="123 Modern Way, Suite 400"
                />
                {errors.address && (
                  <p className="text-[10px] text-red-600 font-medium">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formValues.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formValues.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                  {errors.postalCode && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-zinc-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                2. Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-600 space-y-2">
              <div className="p-3 bg-white border border-zinc-200 rounded-md font-medium text-zinc-900 flex items-center justify-between">
                <span>Simulated Spring Boot Order API Integration</span>
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                No real payment card will be charged. Clicking 'Place Order' sends a mock async REST order payload ready for future Spring Boot processing.
              </p>
            </CardContent>
          </Card>
        </form>

        {/* Order Summary & Placement */}
        <div className="lg:col-span-1">
          <OrderSummary
            subtotal={subtotal}
            totalItems={totalItems}
            isCheckoutPage={true}
            onProceedToCheckout={() => handleSubmit()}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
