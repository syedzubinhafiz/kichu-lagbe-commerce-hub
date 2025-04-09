import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CreditCard, 
  CircleDollarSign, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Order } from '@/types';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
}

interface CreateOrderPayload {
    productId: string;
    quantity: number;
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: 'Cash on Delivery' | 'Bkash';
}

interface CreateOrderResponse extends Order { }

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Bkash'>('Cash on Delivery');
  const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({});

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
    if (cart.items.length === 0) {
        toast.info("Your cart is empty. Add some products first!");
        navigate('/products');
    }
  }, [isAuthenticated, navigate, cart.items.length]);

  const shippingCost = cart.totalAmount > 2000 ? 0 : 120;
  const totalWithShipping = cart.totalAmount + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name as keyof CheckoutFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    let isValid = true;
    
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'streetAddress', 'city', 'state', 'zipCode'] as const;
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email required';
      isValid = false;
    }
    
    const phoneRegex = /^(\+?[0-9]{10,15})$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Valid phone number required';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const { mutate: createOrder, isPending: isSubmitting, error: submissionError } = useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
      mutationFn: async (orderPayload) => {
          const response = await apiClient.post('/api/orders', orderPayload);
          return response.data;
      },
      onSuccess: (data) => {
          clearCart();
          toast.success("Your order has been placed successfully!");
          navigate('/order/success', { 
              state: { 
                  orderId: data.id, 
                  paymentMethod: data.paymentMethod 
              } 
          });
      },
      onError: (error: any) => {
           console.error("Order submission error:", error);
           toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
      }
  });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Your cart is empty.");
      navigate('/products');
      return;
    }

    const firstCartItem = cart.items[0];

    const orderPayload: CreateOrderPayload = {
      productId: firstCartItem.productId,
      quantity: firstCartItem.quantity,
      shippingAddress: {
        street: formData.streetAddress,
        city: formData.city,
        postalCode: formData.zipCode,
        country: formData.state,
      },
      paymentMethod: paymentMethod,
    };

    createOrder(orderPayload);
  };

  if (cart.items.length === 0 && !isSubmitting) {
      return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your order</p>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className={formErrors.fullName ? 'border-red-500' : ''}
                    />
                    {formErrors.fullName && (
                      <p className="text-xs text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className={formErrors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-xs text-red-500">{formErrors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="streetAddress">Street Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      placeholder="Enter street address"
                      className={formErrors.streetAddress ? 'border-red-500' : ''}
                    />
                    {formErrors.streetAddress && (
                      <p className="text-xs text-red-500">{formErrors.streetAddress}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className={formErrors.city ? 'border-red-500' : ''}
                    />
                    {formErrors.city && (
                      <p className="text-xs text-red-500">{formErrors.city}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Division <span className="text-red-500">*</span></Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state/division"
                      className={formErrors.state ? 'border-red-500' : ''}
                    />
                    {formErrors.state && (
                      <p className="text-xs text-red-500">{formErrors.state}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter zip/postal code"
                      className={formErrors.zipCode ? 'border-red-500' : ''}
                    />
                    {formErrors.zipCode && (
                      <p className="text-xs text-red-500">{formErrors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                <RadioGroup defaultValue="cod" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)} className="space-y-4">
                  <Label htmlFor="cod" className="flex items-center justify-between p-4 border rounded-lg cursor-pointer [&:has([data-state=checked])]:border-brand-primary">
                    <div className="flex items-center gap-3">
                      <CircleDollarSign className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <RadioGroupItem value="cod" id="cod" />
                  </Label>
                  <Label htmlFor="bkash" className="flex items-center justify-between p-4 border rounded-lg cursor-not-allowed opacity-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">bKash (Coming Soon)</span>
                    </div>
                    <RadioGroupItem value="bkash" id="bkash" disabled />
                  </Label>
                </RadioGroup>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <Label htmlFor="notes" className="text-lg font-bold mb-4 block">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order?"
                  rows={4}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cart.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <img src={item.product.images[0]} alt={item.product.title} className="w-10 h-10 object-cover rounded"/>
                        <div>
                          <p className="font-medium">{item.product.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium">৳{(item.product.discountPrice || item.product.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>৳{cart.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost}`}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>৳{totalWithShipping}</span>
                  </div>
                </div>
                
                {submissionError && (
                  <p className="mt-4 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14}/> {submissionError.message || 'Failed to place order'}</p>
                )}

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full mt-6 bg-brand-primary hover:bg-brand-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Checkout;
