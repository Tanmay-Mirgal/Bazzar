'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  placeOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  BackendOrder,
} from '@/lib/api/orders';
import { fetchDeliveryEstimate, DeliveryEstimateResponse } from '@/lib/api/hyperlocal';
import { useCartStore } from '@/store/cart-store';
import { useUserLocationStore } from '@/store/user-location-store';
import { getCurrentUser } from '@/lib/api/auth';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Lock,
  Truck,
  ShoppingBag,
  ArrowRight,
  Banknote,
  Sparkles,
  Zap,
  Clock,
  Compass,
  MapPin,
} from 'lucide-react';

import { useUser } from '@clerk/nextjs';
import { useApiAuth } from '@/lib/hooks/useApiAuth';

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
  const { user, isLoaded: userLoaded } = useUser();
  const { getApiToken } = useApiAuth();
  const { cartItems, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { latitude, longitude, locationName, formattedAddress } = useUserLocationStore();

  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  const [estimate, setEstimate] = React.useState<DeliveryEstimateResponse | null>(null);
  const [isEvaluatingEstimate, setIsEvaluatingEstimate] = React.useState(false);

  const [formValues, setFormValues] = React.useState<CheckoutFormValues>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Load Razorpay Script & Fill defaults
  React.useEffect(() => {
    setMounted(true);
    const authUser = getCurrentUser();
    if (authUser) {
      setFormValues((prev) => ({
        ...prev,
        fullName: authUser.name || prev.fullName,
        email: authUser.email || prev.email,
      }));
    }

    if (formattedAddress && !formValues.address) {
      setFormValues((prev) => ({
        ...prev,
        address: formattedAddress,
        city: locationName.split(',')[0] || 'Mumbai',
      }));
    }

    if (!document.getElementById('razorpay-checkout-js')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [formattedAddress, locationName]);

  // Fetch Hyperlocal Delivery Estimate on cart or location change
  React.useEffect(() => {
    if (cartItems.length === 0) return;

    const userLat = latitude || 19.0760;
    const userLng = longitude || 72.8777;
    const pIds = cartItems.map((i) => Number(i.product.id));
    const qList = cartItems.map((i) => i.quantity);
    const total = getTotalPrice();

    setIsEvaluatingEstimate(true);
    fetchDeliveryEstimate(userLat, userLng, pIds, qList, total)
      .then((res) => {
        setEstimate(res);
      })
      .catch((err) => {
        console.warn('Delivery estimate failed:', err);
      })
      .finally(() => {
        setIsEvaluatingEstimate(false);
      });
  }, [cartItems, latitude, longitude]);

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

  // Delivery Fee calculated by Hyperlocal Engine backend
  const deliveryFee = estimate ? estimate.deliveryFee : (subtotal >= 1499 ? 0 : 99);
  const grandTotal = subtotal + deliveryFee;

  if (cartItems.length === 0) {
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

  const handleRazorpayFlow = async (createdOrder: BackendOrder, token: string | null) => {
    try {
      const rzpOrder = await createRazorpayOrder(createdOrder.id, grandTotal, token);

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || rzpOrder.keyId || 'rzp_test_placeholder',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'Bazzar Marketplace',
          description: `Order #${createdOrder.id} Hyperlocal Delivery`,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=128&q=80',
          order_id: rzpOrder.orderId,
          handler: async function (response: any) {
            try {
              toast.loading('Verifying secure payment with bank...', { id: 'rzp-verify' });
              await verifyRazorpayPayment({
                orderId: createdOrder.id,
                razorpayOrderId: response.razorpay_order_id || rzpOrder.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || 'simulated_signature',
              }, token);

              clearCart();
              toast.success('Payment Verified! Dark store dispatching now.', { id: 'rzp-verify' });
              router.push(`/orders/${createdOrder.id}`);
            } catch (err: any) {
              toast.error(err.message || 'Payment verification failed', { id: 'rzp-verify' });
              setIsLoading(false);
            }
          },
          prefill: {
            name: formValues.fullName,
            email: formValues.email,
            contact: formValues.phone,
          },
          theme: {
            color: '#10B981',
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
              toast.info('Payment window was closed. You can complete payment anytime.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          toast.error(resp.error.description || 'Payment Failed');
          setIsLoading(false);
        });
        rzp.open();
      } else {
        toast.loading('Processing sandbox payment...', { id: 'rzp-fallback' });
        await verifyRazorpayPayment({
          orderId: createdOrder.id,
          razorpayOrderId: rzpOrder.orderId,
          razorpayPaymentId: 'pay_sim_' + Math.floor(100000 + Math.random() * 900000),
          razorpaySignature: 'simulated_signature',
        }, token);
        clearCart();
        toast.success('Order placed successfully!', { id: 'rzp-fallback' });
        router.push(`/orders/${createdOrder.id}`);
      }
    } catch (err: any) {
      console.error('Razorpay initialization error:', err);
      toast.error('Payment gateway error. Please try again or choose Cash on Delivery.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required shipping details');
      return;
    }

    if (!user) {
      toast.error('Please sign in to place an order');
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);
    try {
      let token = await getApiToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 400));
        token = await getApiToken();
      }

      const userLat = latitude || 19.0760;
      const userLng = longitude || 72.8777;

      const order = await placeOrder({
        fullName: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phone,
        address: formValues.address,
        city: formValues.city,
        postalCode: formValues.postalCode,
        paymentMethod: paymentMethod,
        deliverySpeedTier: estimate?.tier || 'FLASH_10_MIN',
        userLat: userLat,
        userLng: userLng,
        items: cartItems.map((i) => ({
          productId: Number(i.product.id),
          quantity: i.quantity,
        })),
      }, token);

      if (paymentMethod === 'RAZORPAY') {
        await handleRazorpayFlow(order, token);
      } else {
        clearCart();
        toast.success('Cash on Delivery Order Confirmed!');
        router.push(`/orders/${order.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
              <Zap className="h-4 w-4 fill-emerald-400 animate-pulse" />
              Hyperlocal 10/15-Minute Express Checkout
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Express Checkout</h1>
          </div>
          <Link href="/cart" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Edit Bag
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Shipping & Payment Form */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* HYPERLOCAL SPEED TIER CARD */}
            <div className="border border-emerald-500/30 bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 space-y-4 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <Compass className="h-4 w-4 text-emerald-400 animate-spin" />
                  Hyperlocal Radial Spectrum Evaluation
                </div>
                {isEvaluatingEstimate ? (
                  <span className="text-[10px] text-emerald-400 animate-pulse flex items-center gap-1">
                    Evaluating radial dark store spectrum...
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    {estimate?.fulfillmentStore ? `Store: ${estimate.fulfillmentStore.storeName} (${estimate.distanceKm.toFixed(1)} km)` : 'Auto-Calculated'}
                  </span>
                )}
              </div>

              {estimate && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
                    <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-semibold">Active Speed Tier</div>
                    <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                      {estimate.tierBadgeText}
                    </div>
                    <div className="text-[11px] text-slate-300">{estimate.tierDescription}</div>
                  </div>

                  <div className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Estimated Arrival SLA</div>
                    <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      ~{estimate.estimatedDeliveryMins} Minutes
                    </div>
                    <div className="text-[11px] text-slate-400">Guaranteed direct delivery deadline</div>
                  </div>

                  <div className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Fulfillment Fee</div>
                    <div className="text-base font-extrabold text-white">
                      {estimate.deliveryFee === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(estimate.deliveryFee)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {estimate.freeDeliveryThreshold > 0 ? `Free delivery over ${formatCurrency(estimate.freeDeliveryThreshold)}` : 'Flat Rate'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Shipping Details */}
            <div className="border border-slate-200 bg-white p-6 space-y-6 rounded-2xl shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" /> 1. Shipping &amp; Location Details
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold text-slate-800">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formValues.fullName}
                      onChange={handleInputChange}
                      placeholder="Tanmay Mirgal"
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-600 font-semibold">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-800">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      placeholder="tanmay@example.com"
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    />
                    {errors.email && <p className="text-[11px] text-rose-600 font-semibold">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-800">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 font-semibold">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold text-slate-800">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    placeholder="Flat 506, Sunshine Apts, BKC Road"
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                  />
                  {errors.address && <p className="text-[11px] text-rose-600 font-semibold">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-slate-800">City / District *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 font-semibold">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-xs font-bold text-slate-800">Postal Code / Pincode *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formValues.postalCode}
                      onChange={handleInputChange}
                      placeholder="400051"
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    />
                    {errors.postalCode && <p className="text-[11px] text-rose-600 font-semibold">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="border border-slate-200 bg-white p-6 space-y-4 rounded-2xl shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" /> 2. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Zap className="h-5 w-5 fill-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900">Razorpay Gateway</h4>
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">UPI, GPay, Cards, Netbanking</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'RAZORPAY' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                      {paymentMethod === 'RAZORPAY' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1 border-t border-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" /> 256-bit Bank Grade Encryption
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Cash on Delivery (COD)</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pay cash to rider upon delivery</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                      {paymentMethod === 'COD' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 pt-1 border-t border-slate-100">
                    <Truck className="h-3.5 w-3.5" /> Pay courier rider at doorstep
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Bag Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-slate-200 bg-white p-6 space-y-4 sticky top-24 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Bag Summary ({totalItems})
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-emerald-700" />
                  {estimate?.tierBadgeText || 'Hyperlocal'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 line-clamp-1">{item.product.name}</span>
                        <span className="text-[10px] text-slate-500">{item.quantity} × {formatCurrency(item.product.price)}</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-3 space-y-2 text-slate-600">
                  <div className="flex justify-between text-slate-900">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900">
                    <span>Hyperlocal Fulfillment Fee</span>
                    <span className="font-bold text-emerald-600">
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Pay</span>
                    <span className="text-xl text-emerald-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    Dispatching Order...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {paymentMethod === 'RAZORPAY' ? `Pay with Razorpay ${formatCurrency(grandTotal)}` : 'Confirm Cash on Delivery'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="pt-1 text-center">
                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Live Hyperlocal Radar Tracking provided after checkout
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
